import { WebClient } from '@slack/web-api';

// Initialize the Slack client
// Note: SLACK_BOT_TOKEN should be set in environment variables
const slackToken = process.env.SLACK_BOT_TOKEN;

export const slackClient = slackToken ? new WebClient(slackToken) : null;

// Slack signing secret for webhook verification
export const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

/**
 * Send a message to a Slack channel
 */
export async function sendSlackMessage(params: {
  channel: string;
  text: string;
  threadTs?: string;
  metadata?: {
    organizationId: string;
    userId?: string;
    userName: string;
  };
}) {
  if (!slackClient) {
    console.error('Slack client not initialized - missing SLACK_BOT_TOKEN');
    return null;
  }

  try {
    const result = await slackClient.chat.postMessage({
      channel: params.channel,
      text: params.text,
      thread_ts: params.threadTs,
      // Add metadata for tracking
      metadata: params.metadata ? {
        event_type: 'sapira_message',
        event_payload: params.metadata,
      } : undefined,
      // Nice formatting
      mrkdwn: true,
    });

    return {
      ok: result.ok,
      ts: result.ts, // Message timestamp (unique ID)
      channel: result.channel,
    };
  } catch (error) {
    console.error('Error sending Slack message:', error);
    throw error;
  }
}

/**
 * Send a formatted message from a user to Slack
 */
export async function sendUserMessageToSlack(params: {
  channelId: string;
  threadTs?: string;
  userName: string;
  userEmail: string;
  message: string;
  organizationId: string;
  organizationName: string;
}) {
  if (!slackClient) {
    console.error('Slack client not initialized');
    return null;
  }

  try {
    // Format the message with user info
    const formattedMessage = `*${params.userName}* (${params.userEmail}) from *${params.organizationName}*:\n\n${params.message}`;

    const result = await slackClient.chat.postMessage({
      channel: params.channelId,
      text: formattedMessage,
      thread_ts: params.threadTs,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `💬 *New message from ${params.organizationName}*`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `👤 *${params.userName}* · ${params.userEmail}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: params.message,
          },
        },
        {
          type: 'divider',
        },
      ],
      metadata: {
        event_type: 'sapira_user_message',
        event_payload: {
          organization_id: params.organizationId,
          organization_name: params.organizationName,
          user_name: params.userName,
          user_email: params.userEmail,
        },
      },
    });

    return {
      ok: result.ok,
      ts: result.ts,
      channel: result.channel,
    };
  } catch (error) {
    console.error('Error sending user message to Slack:', error);
    throw error;
  }
}

/**
 * Get channel info
 */
export async function getChannelInfo(channelId: string) {
  if (!slackClient) {
    return null;
  }

  try {
    const result = await slackClient.conversations.info({
      channel: channelId,
    });
    return result.channel;
  } catch (error) {
    console.error('Error getting channel info:', error);
    return null;
  }
}

/**
 * Get conversation history (for loading past messages)
 */
export async function getConversationHistory(params: {
  channelId: string;
  threadTs?: string;
  limit?: number;
}) {
  if (!slackClient) {
    return [];
  }

  try {
    if (params.threadTs) {
      // Get thread replies
      const result = await slackClient.conversations.replies({
        channel: params.channelId,
        ts: params.threadTs,
        limit: params.limit || 100,
      });
      return result.messages || [];
    } else {
      // Get channel history
      const result = await slackClient.conversations.history({
        channel: params.channelId,
        limit: params.limit || 100,
      });
      return result.messages || [];
    }
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

/**
 * Get user info from Slack
 */
export async function getSlackUserInfo(userId: string) {
  if (!slackClient) {
    return null;
  }

  try {
    const result = await slackClient.users.info({
      user: userId,
    });
    return result.user;
  } catch (error) {
    console.error('Error getting Slack user info:', error);
    return null;
  }
}

/**
 * Verify Slack request signature
 */
export function verifySlackSignature(params: {
  signature: string;
  timestamp: string;
  body: string;
}): boolean {
  if (!slackSigningSecret) {
    console.error('Slack signing secret not configured');
    return false;
  }

  const crypto = require('crypto');
  
  // Check timestamp to prevent replay attacks (5 minutes)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(params.timestamp) < fiveMinutesAgo) {
    return false;
  }

  // Create the signature base string
  const sigBasestring = `v0:${params.timestamp}:${params.body}`;
  
  // Create HMAC SHA256 signature
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', slackSigningSecret)
    .update(sigBasestring)
    .digest('hex');

  // Compare signatures using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(params.signature)
  );
}

