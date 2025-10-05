import { supabase } from '../supabase/client'

interface SendTeamsMessageParams {
  issueId: string
  message: string
  messageType?: 'comment' | 'status_update' | 'assignment' | 'info'
}

interface TeamsContext {
  service_url: string
  tenant_id?: string
  channel_id: string
  conversation: {
    id: string
    isGroup?: boolean
    conversationType?: string
    tenantId?: string
  }
  bot: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    aadObjectId?: string
  }
}

/**
 * Service for sending proactive messages to Teams conversations
 */
export class TeamsMessenger {
  private static organizationId = '01234567-8901-2345-6789-012345678901' // Gonvarri
  private static systemUserId = '11111111-1111-1111-1111-111111111111' // SAP/Bot user (Pablo Senabre - Gonvarri)
  
  /**
   * Sends a proactive message to the Teams conversation linked to an issue
   */
  static async sendMessageToIssue(params: SendTeamsMessageParams): Promise<boolean> {
    try {
      // 1. Get conversation reference from issue_links
      // Note: We get the most recent link if multiple exist for the same conversation
      const { data: links, error } = await supabase
        .from('issue_links')
        .select('teams_context, url')
        .eq('issue_id', params.issueId)
        .eq('provider', 'teams')
        .order('created_at', { ascending: false })
        .limit(1)
      
      const link = links?.[0]
      
      if (error || !link?.teams_context) {
        console.warn('No Teams context found for issue:', params.issueId)
        return false
      }
      
      const teamsContext = link.teams_context as TeamsContext
      
      // 2. Format message based on type
      const formattedMessage = this.formatMessage(params.message, params.messageType)
      
      // 3. Send proactive message via Bot server (Render)
      // The bot server has the Bot Framework adapter which is required for proactive messaging
      const botServerUrl = process.env.BOT_SERVER_URL || 'https://sapira-teams-bot.onrender.com'
      const response = await fetch(`${botServerUrl}/api/proactive-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teams_context: teamsContext,
          message: formattedMessage
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to send Teams message via bot server:', {
          status: response.status,
          error: errorText,
          issueId: params.issueId
        })
        return false
      }
      
      // 4. Log activity in database
      await this.logTeamsMessageSent(params.issueId, params.message, params.messageType)
      
      console.log('✅ Teams message sent successfully for issue:', params.issueId)
      return true
      
    } catch (error) {
      console.error('Error sending Teams message:', error)
      return false
    }
  }
  
  
  /**
   * Formats message based on context type
   */
  private static formatMessage(message: string, type?: string): string {
    switch (type) {
      case 'comment':
        return `💬 **Comentario del equipo:**\n\n${message}`
      
      case 'status_update':
        return `✅ **Actualización de estado:**\n\n${message}`
      
      case 'assignment':
        return `👤 **Asignación:**\n\n${message}`
      
      case 'info':
        return `ℹ️ **Información:**\n\n${message}`
      
      default:
        return message
    }
  }
  
  /**
   * Logs that a message was sent to Teams
   */
  private static async logTeamsMessageSent(
    issueId: string, 
    message: string,
    messageType?: string
  ): Promise<void> {
    try {
      // Update sync timestamp on all Teams links for this issue
      await supabase
        .from('issue_links')
        .update({ 
          synced_at: new Date().toISOString() 
        })
        .eq('issue_id', issueId)
        .eq('provider', 'teams')
      
      // Create activity record
      await supabase
        .from('issue_activity')
        .insert({
          organization_id: this.organizationId,
          issue_id: issueId,
          actor_user_id: this.systemUserId,
          action: 'commented',
          payload: {
            source: 'teams_proactive_message',
            message_type: messageType || 'comment',
            message_sent: message,
            sent_at: new Date().toISOString()
          }
        })
    } catch (error) {
      console.error('Error logging Teams message activity:', error)
      // Don't throw - this is just logging
    }
  }
  
  /**
   * Helper: Check if an issue has Teams context (can receive messages)
   */
  static async hasTeamsContext(issueId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('issue_links')
        .select('teams_context')
        .eq('issue_id', issueId)
        .eq('provider', 'teams')
        .order('created_at', { ascending: false })
        .limit(1)
      
      return !!(data?.[0]?.teams_context)
    } catch {
      return false
    }
  }
}
