import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySlackSignature, getSlackUserInfo } from '@/lib/slack/client';

// Create Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Handle URL verification challenge FIRST (before signature check)
    // This is required for Slack to verify the endpoint
    if (body.type === 'url_verification') {
      console.log('Slack URL verification challenge received');
      return NextResponse.json({ challenge: body.challenge });
    }

    // Get Slack signature headers
    const signature = request.headers.get('x-slack-signature') || '';
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';

    // Verify signature for all other requests (skip challenge verification)
    if (process.env.SLACK_SIGNING_SECRET) {
      const isValid = verifySlackSignature({
        signature,
        timestamp,
        body: rawBody,
      });

      if (!isValid) {
        console.error('Invalid Slack signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Handle events
    if (body.type === 'event_callback') {
      const event = body.event;

      // Handle message events
      if (event.type === 'message') {
        // Ignore bot messages and message changes
        if (event.bot_id || event.subtype === 'message_changed' || event.subtype === 'message_deleted') {
          return NextResponse.json({ ok: true });
        }

        // Ignore messages from our own bot
        if (event.bot_profile?.name === 'Sapira' || event.bot_profile?.name === 'Sapira Platform') {
          return NextResponse.json({ ok: true });
        }

        const channelId = event.channel;
        const messageTs = event.ts;
        const threadTs = event.thread_ts;
        const slackUserId = event.user;
        const text = event.text;

        // Find organization by Slack channel
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, settings')
          .filter('settings->slack_channel_id', 'eq', channelId);

        if (orgError || !orgs || orgs.length === 0) {
          console.log('No organization found for channel:', channelId);
          return NextResponse.json({ ok: true });
        }

        const org = orgs[0];
        const settings = org.settings as Record<string, any> || {};

        // Check if this message is in the right thread (if we're using threads)
        const orgThreadTs = settings.slack_thread_ts;
        if (orgThreadTs && threadTs !== orgThreadTs && messageTs !== orgThreadTs) {
          // Message is not in the organization's thread
          return NextResponse.json({ ok: true });
        }

        // Get Slack user info
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
        const { error: msgError } = await supabase
          .from('fde_messages')
          .insert({
            organization_id: org.id,
            slack_channel_id: channelId,
            slack_thread_ts: threadTs || messageTs,
            slack_message_ts: messageTs,
            sender_type: 'fde',
            sender_user_id: null, // FDE messages don't have a platform user
            sender_name: senderName,
            sender_avatar_url: senderAvatarUrl,
            content: text,
          });

        if (msgError) {
          console.error('Error saving Slack message:', msgError);
        } else {
          console.log('Saved FDE message from Slack:', {
            org: org.name,
            sender: senderName,
            preview: text.substring(0, 50),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Slack webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET for Slack's URL verification during setup
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Slack webhook endpoint is active',
    setup: 'Configure this URL in your Slack App Event Subscriptions',
  });
}

