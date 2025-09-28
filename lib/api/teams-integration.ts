import { IssuesAPI, type CreateIssueData } from './issues'
import { supabase } from '../supabase/client'

export interface TeamsConversationData {
  conversation_id: string
  conversation_url: string
  participants: string[]
  messages: {
    author: string
    content: string
    timestamp: string
  }[]
  ai_analysis: {
    summary: string
    priority: 'P0' | 'P1' | 'P2' | 'P3'
    suggested_labels: string[]
    key_points: string[]
  }
}

export interface TeamsIssueCreationResult {
  issue_id: string
  issue_key: string
  link_id: string
}

export class TeamsIntegration {
  private static organizationId = '01234567-8901-2345-6789-012345678901'
  private static aiAgentUserId = '11111111-1111-1111-1111-111111111111' // SAP user as AI agent

  /**
   * Creates an issue from Teams conversation analysis
   * Called by webhook or API endpoint
   */
  static async createIssueFromTeamsConversation(
    conversationData: TeamsConversationData
  ): Promise<TeamsIssueCreationResult> {
    const { ai_analysis, conversation_id, conversation_url } = conversationData

    // 1. Create the issue in triage
    const issueData: CreateIssueData = {
      title: this.generateIssueTitle(ai_analysis.summary),
      description: this.generateIssueDescription(conversationData),
      priority: ai_analysis.priority,
      origin: 'teams',
      reporter_id: this.aiAgentUserId,
      labels: [] // We'll add these after creation
    }

    const issue = await IssuesAPI.createIssue(issueData)

    // 2. Create link to Teams conversation
    const { data: link, error: linkError } = await supabase
      .from('issue_links')
      .insert({
        issue_id: issue.id,
        provider: 'teams',
        external_id: conversation_id,
        url: conversation_url,
        synced_at: new Date().toISOString()
      })
      .select()
      .single()

    if (linkError) throw linkError

    // 3. Add AI-suggested labels
    if (ai_analysis.suggested_labels.length > 0) {
      await this.addSuggestedLabels(issue.id, ai_analysis.suggested_labels)
    }

    // 4. Create detailed activity record
    await this.createTeamsActivity(issue.id, conversationData)

    return {
      issue_id: issue.id,
      issue_key: issue.key,
      link_id: link.id
    }
  }

  /**
   * Updates issue with new Teams activity
   */
  static async syncTeamsConversation(
    issueId: string,
    conversationData: TeamsConversationData
  ): Promise<void> {
    // Update the link sync timestamp
    await supabase
      .from('issue_links')
      .update({ synced_at: new Date().toISOString() })
      .eq('issue_id', issueId)
      .eq('provider', 'teams')

    // Create activity record for the sync
    await supabase
      .from('issue_activity')
      .insert({
        organization_id: this.organizationId,
        issue_id: issueId,
        actor_user_id: this.aiAgentUserId,
        action: 'updated',
        payload: {
          source: 'teams_sync',
          new_messages_count: conversationData.messages.length,
          last_activity: conversationData.messages[conversationData.messages.length - 1]?.timestamp
        }
      })
  }

  // Private helper methods
  private static generateIssueTitle(summary: string): string {
    // Limit to 100 chars and ensure it's descriptive
    const cleanSummary = summary.trim()
    if (cleanSummary.length <= 100) return cleanSummary
    
    return cleanSummary.substring(0, 97) + '...'
  }

  private static generateIssueDescription(data: TeamsConversationData): string {
    const { ai_analysis, participants, messages } = data
    
    return `## 🤖 Generado automáticamente desde Teams

### Resumen IA:
${ai_analysis.summary}

### Puntos clave:
${ai_analysis.key_points.map(point => `- ${point}`).join('\n')}

### Participantes:
${participants.join(', ')}

### Conversación original:
${messages.length} mensajes - [Ver en Teams](${data.conversation_url})

---
*Issue creado automáticamente por AI Agent desde conversación de Teams*`
  }

  private static async addSuggestedLabels(issueId: string, suggestedLabels: string[]): Promise<void> {
    // Get existing labels that match the suggestions
    const { data: existingLabels } = await supabase
      .from('labels')
      .select('id, name')
      .eq('organization_id', this.organizationId)
      .in('name', suggestedLabels)

    if (!existingLabels || existingLabels.length === 0) return

    // Link the labels to the issue
    const labelLinks = existingLabels.map(label => ({
      issue_id: issueId,
      label_id: label.id
    }))

    await supabase
      .from('issue_labels')
      .insert(labelLinks)
  }

  private static async createTeamsActivity(
    issueId: string,
    conversationData: TeamsConversationData
  ): Promise<void> {
    await supabase
      .from('issue_activity')
      .insert({
        organization_id: this.organizationId,
        issue_id: issueId,
        actor_user_id: this.aiAgentUserId,
        action: 'created',
        payload: {
          source: 'teams_conversation',
          conversation_id: conversationData.conversation_id,
          participants_count: conversationData.participants.length,
          messages_count: conversationData.messages.length,
          ai_priority: conversationData.ai_analysis.priority,
          ai_confidence: 'high' // You could add confidence scoring
        }
      })
  }
}
