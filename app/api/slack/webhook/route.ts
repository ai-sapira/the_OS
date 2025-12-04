import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySlackSignature, getSlackUserInfo } from '@/lib/slack/client';

// Create Supabase client with service role for webhook operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Find or create a conversation for a given thread
 */
async function getOrCreateConversation(
  organizationId: string,
  threadTs: string,
  channelId: string
): Promise<{ id: string } | null> {
  // First try to find existing conversation
  const { data: existing, error: findError } = await supabase
    .from('fde_conversations')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('slack_thread_ts', threadTs)
    .single();

  if (existing) {
    return existing;
  }

  // Create new conversation for this thread
  const { data: newConv, error: createError } = await supabase
    .from('fde_conversations')
    .insert({
      organization_id: organizationId,
      slack_thread_ts: threadTs,
      slack_channel_id: channelId,
      title: `Conversación ${new Date().toLocaleDateString('es-ES')}`,
      status: 'active',
    })
    .select('id')
    .single();

  if (createError) {
    console.error('[Slack Webhook] Error creating conversation:', createError);
    return null;
  }

  console.log('[Slack Webhook] Created new conversation:', newConv.id);
  return newConv;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Handle URL verification challenge FIRST (before signature check)
    // This is required for Slack to verify the endpoint
    if (body.type === 'url_verification') {
      console.log('[Slack Webhook] URL verification challenge received');
      return NextResponse.json({ challenge: body.challenge });
    }

    // Get Slack signature headers
    const signature = request.headers.get('x-slack-signature') || '';
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';

    // Verify signature for all other requests
    if (process.env.SLACK_SIGNING_SECRET) {
      const isValid = verifySlackSignature({
        signature,
        timestamp,
        body: rawBody,
      });

      if (!isValid) {
        console.error('[Slack Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Handle events
    if (body.type === 'event_callback') {
      const event = body.event;
      console.log('[Slack Webhook] Event received:', {
        type: event.type,
        subtype: event.subtype,
        user: event.user,
        channel: event.channel,
        thread_ts: event.thread_ts,
        ts: event.ts,
      });

      // Handle message events
      if (event.type === 'message') {
        // Ignore bot messages and message changes
        if (event.bot_id || event.subtype === 'message_changed' || event.subtype === 'message_deleted') {
          console.log('[Slack Webhook] Ignoring bot/edit message');
          return NextResponse.json({ ok: true });
        }

        // Ignore messages from our own bot
        if (event.bot_profile?.name === 'Sapira' || event.bot_profile?.name === 'Sapira Platform') {
          console.log('[Slack Webhook] Ignoring our own bot message');
          return NextResponse.json({ ok: true });
        }

        const channelId = event.channel;
        const messageTs = event.ts;
        const threadTs = event.thread_ts; // Will be set if message is a reply in a thread
        const slackUserId = event.user;
        const text = event.text;

        // Find organization by Slack channel
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, settings')
          .filter('settings->slack_channel_id', 'eq', channelId);

        if (orgError || !orgs || orgs.length === 0) {
          console.log('[Slack Webhook] No organization found for channel:', channelId);
          return NextResponse.json({ ok: true });
        }

        const org = orgs[0];
        const settings = org.settings as Record<string, any> || {};

        console.log('[Slack Webhook] Found org:', org.name, 'for channel:', channelId);

        // Determine the effective thread_ts
        // If this message is a reply to a thread, use thread_ts
        // If this is a new message (not in a thread), use the message's own ts as the thread start
        const effectiveThreadTs = threadTs || messageTs;

        // Check if this message is in a tracked conversation
        // For messages in threads: they should belong to an existing conversation
        // For new top-level messages: we may or may not want to create a new conversation

        let conversation = null;

        if (threadTs) {
          // This is a reply in a thread - find the conversation for this thread
          const { data: existingConv } = await supabase
            .from('fde_conversations')
            .select('id')
            .eq('organization_id', org.id)
            .eq('slack_thread_ts', threadTs)
            .single();

          if (existingConv) {
            conversation = existingConv;
            console.log('[Slack Webhook] Found existing conversation for thread:', threadTs);
          } else {
            // Thread exists in Slack but not in our system - this could be a thread
            // that was started by the FDE replying to a user message
            // Create a new conversation for it
            conversation = await getOrCreateConversation(org.id, threadTs, channelId);
            console.log('[Slack Webhook] Created conversation for existing thread:', threadTs);
          }
        } else {
          // This is a top-level message (not in a thread)
          // We only track messages that are replies to our conversations
          // Skip top-level messages unless they're specifically addressed to us
          
          // Check if the org has a main thread we should listen to
          const orgThreadTs = settings.slack_thread_ts;
          
          if (orgThreadTs && messageTs === orgThreadTs) {
            // This is the first message in the org's main thread
            conversation = await getOrCreateConversation(org.id, messageTs, channelId);
          } else if (!orgThreadTs) {
            // No specific thread configured - treat all messages as potential conversation starters
            // This is useful for DMs with the bot
            conversation = await getOrCreateConversation(org.id, messageTs, channelId);
          } else {
            // Message is outside the tracked thread - ignore
            console.log('[Slack Webhook] Message outside tracked thread, ignoring');
            return NextResponse.json({ ok: true });
          }
        }

        if (!conversation) {
          console.log('[Slack Webhook] Could not find or create conversation');
          return NextResponse.json({ ok: true });
        }

        // Get Slack user info for sender details
        let senderName = 'Sapira Team';
        let senderAvatarUrl = null;
        
        if (slackUserId) {
          const userInfo = await getSlackUserInfo(slackUserId);
          if (userInfo) {
            senderName = userInfo.real_name || userInfo.name || 'Sapira Team';
            senderAvatarUrl = userInfo.profile?.image_72 || userInfo.profile?.image_48;
          }
        }

        // Save message to database
        const { data: savedMessage, error: msgError } = await supabase
          .from('fde_messages')
          .insert({
            organization_id: org.id,
            conversation_id: conversation.id,
            slack_channel_id: channelId,
            slack_thread_ts: effectiveThreadTs,
            slack_message_ts: messageTs,
            sender_type: 'fde',
            sender_user_id: null, // FDE messages don't have a platform user
            sender_name: senderName,
            sender_avatar_url: senderAvatarUrl,
            content: text,
          })
          .select()
          .single();

        if (msgError) {
          console.error('[Slack Webhook] Error saving message:', msgError);
        } else {
          console.log('[Slack Webhook] Saved FDE message:', {
            org: org.name,
            conversation: conversation.id,
            sender: senderName,
            preview: text.substring(0, 50),
          });
        }

        // Note: The conversation metadata (last_message, unread_count, etc.)
        // is updated automatically by the database trigger
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Slack Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET for Slack's URL verification during setup
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Slack webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}
