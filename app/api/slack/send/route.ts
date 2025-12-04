import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendUserMessageToSlack } from '@/lib/slack/client';

// Create Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get or create a conversation for sending a message
 */
async function getOrCreateConversation(params: {
  organizationId: string;
  conversationId?: string;
  slackChannelId?: string;
  userId?: string;
  userName?: string;
}): Promise<{ id: string; slack_thread_ts: string | null; slack_channel_id: string | null } | null> {
  const { organizationId, conversationId, slackChannelId, userId, userName } = params;

  // If conversation ID provided, fetch it
  if (conversationId) {
    const { data: existing, error } = await supabase
      .from('fde_conversations')
      .select('id, slack_thread_ts, slack_channel_id')
      .eq('id', conversationId)
      .eq('organization_id', organizationId)
      .single();

    if (existing) return existing;
  }

  // Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from('fde_conversations')
    .insert({
      organization_id: organizationId,
      slack_channel_id: slackChannelId,
      title: `Conversación de ${userName || 'Usuario'}`,
      status: 'pending', // New conversations start as pending FDE response
      created_by: userId,
    })
    .select('id, slack_thread_ts, slack_channel_id')
    .single();

  if (createError) {
    console.error('[Slack Send] Error creating conversation:', createError);
    return null;
  }

  console.log('[Slack Send] Created new conversation:', newConv.id);
  return newConv;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationId, 
      content, 
      userId, 
      userName, 
      userEmail,
      conversationId, // Optional: if replying to existing conversation
    } = body;

    if (!organizationId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, content' },
        { status: 400 }
      );
    }

    // Get organization settings to find Slack channel
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, settings')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const settings = org.settings as Record<string, any> || {};
    const slackChannelId = settings.slack_channel_id;

    // Get or create conversation
    const conversation = await getOrCreateConversation({
      organizationId,
      conversationId,
      slackChannelId,
      userId,
      userName,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to get or create conversation' },
        { status: 500 }
      );
    }

    // Use existing thread_ts if available, otherwise this will start a new thread
    const threadTs = conversation.slack_thread_ts;

    let slackResult = null;
    let newThreadTs = threadTs;

    // Send to Slack if channel is configured
    if (slackChannelId) {
      try {
        slackResult = await sendUserMessageToSlack({
          channelId: slackChannelId,
          threadTs: threadTs || undefined, // Send as thread reply if we have a thread
          userName: userName || 'User',
          userEmail: userEmail || '',
          message: content,
          organizationId,
          organizationName: org.name,
        });

        if (slackResult?.ts) {
          // If this was a new conversation (no thread_ts), the message ts becomes the thread_ts
          if (!threadTs) {
            newThreadTs = slackResult.ts;
            
            // Update conversation with the new thread_ts
            await supabase
              .from('fde_conversations')
              .update({ 
                slack_thread_ts: newThreadTs,
                slack_channel_id: slackChannelId,
              })
              .eq('id', conversation.id);
          }
        }

        console.log('[Slack Send] Message sent to Slack:', {
          channel: slackChannelId,
          threadTs: newThreadTs,
          messageTs: slackResult?.ts,
        });
      } catch (slackError) {
        console.error('[Slack Send] Error sending to Slack:', slackError);
        // Continue to save message even if Slack fails
      }
    } else {
      console.log('[Slack Send] No Slack channel configured, saving message locally only');
    }

    // Save message to database with conversation reference
    const { data: message, error: msgError } = await supabase
      .from('fde_messages')
      .insert({
        organization_id: organizationId,
        conversation_id: conversation.id,
        slack_channel_id: slackChannelId,
        slack_thread_ts: newThreadTs,
        slack_message_ts: slackResult?.ts || null,
        sender_type: 'user',
        sender_user_id: userId,
        sender_name: userName || 'User',
        content,
      })
      .select()
      .single();

    if (msgError) {
      console.error('[Slack Send] Error saving message:', msgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Note: Conversation metadata is updated automatically by database trigger

    return NextResponse.json({
      ok: true,
      message,
      conversation: {
        id: conversation.id,
        slack_thread_ts: newThreadTs,
      },
      slack: slackResult ? {
        ts: slackResult.ts,
        channel: slackResult.channel,
      } : null,
    });

  } catch (error) {
    console.error('[Slack Send] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
