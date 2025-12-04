import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendUserMessageToSlack } from '@/lib/slack/client';

// Create Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationId, 
      content, 
      userId, 
      userName, 
      userEmail,
      threadTs 
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
    const slackThreadTs = settings.slack_thread_ts || threadTs;

    if (!slackChannelId) {
      // If no Slack channel configured, just save to DB without sending to Slack
      console.log('No Slack channel configured for organization:', organizationId);
    }

    // Save message to database
    const { data: message, error: msgError } = await supabase
      .from('fde_messages')
      .insert({
        organization_id: organizationId,
        slack_channel_id: slackChannelId,
        slack_thread_ts: slackThreadTs,
        sender_type: 'user',
        sender_user_id: userId,
        sender_name: userName || 'User',
        content,
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error saving message:', msgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Send to Slack if channel is configured
    let slackResult = null;
    if (slackChannelId) {
      try {
        slackResult = await sendUserMessageToSlack({
          channelId: slackChannelId,
          threadTs: slackThreadTs,
          userName: userName || 'User',
          userEmail: userEmail || '',
          message: content,
          organizationId,
          organizationName: org.name,
        });

        // Update message with Slack timestamp
        if (slackResult?.ts) {
          await supabase
            .from('fde_messages')
            .update({ slack_message_ts: slackResult.ts })
            .eq('id', message.id);

          // If this is the first message in a new thread, save the thread timestamp
          if (!slackThreadTs && slackResult.ts) {
            await supabase
              .from('organizations')
              .update({
                settings: {
                  ...settings,
                  slack_thread_ts: slackResult.ts,
                },
              })
              .eq('id', organizationId);
          }
        }
      } catch (slackError) {
        console.error('Error sending to Slack:', slackError);
        // Don't fail the request, message is saved in DB
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        sender_type: message.sender_type,
        sender_name: message.sender_name,
        created_at: message.created_at,
        slack_sent: !!slackResult?.ok,
      },
    });
  } catch (error) {
    console.error('Error in /api/slack/send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

