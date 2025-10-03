import { IssuesAPI, type CreateIssueData } from './issues'
import { supabase } from '../supabase/client'

export interface TeamsConversationReference {
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
    short_description?: string // Brief scope description
    impact?: string // Business impact
    core_technology?: string // Core technology used
    difficulty?: 1 | 2 | 3 // Technical difficulty
    impact_score?: 1 | 2 | 3 // Business impact score
    priority: 'P0' | 'P1' | 'P2' | 'P3'
    suggested_labels: string[]
    key_points: string[]
    suggested_assignee?: string // Email or name of suggested assignee
  }
  conversation_reference?: TeamsConversationReference // For proactive messaging
}

export interface TeamsIssueCreationResult {
  issue_id: string
  issue_key: string
  link_id: string
}

export class TeamsIntegration {
  private static organizationId = '22222222-2222-2222-2222-222222222222' // Aurovitas (vacía)
  private static aiAgentUserId = '11111111-aaaa-2222-2222-222222222222' // SAP user as AI agent (María García - Aurovitas)
  
  // Mock assignees by department/topic (in production, this would be smart routing)
  private static mockAssignees = {
    'tech': '33333333-3333-3333-3333-333333333333', // Tech BU Manager
    'marketing': '44444444-4444-4444-4444-444444444444',
    'sales': '55555555-5555-5555-5555-555555555555',
    'hr': '66666666-6666-6666-6666-666666666666',
    'default': '33333333-3333-3333-3333-333333333333' // Default to Tech
  }

  /**
   * Creates an issue from Teams conversation analysis
   * Called by webhook or API endpoint
   */
  static async createIssueFromTeamsConversation(
    conversationData: TeamsConversationData
  ): Promise<TeamsIssueCreationResult> {
    const { ai_analysis, conversation_id, conversation_url, conversation_reference } = conversationData

    // 1. Create the issue in triage with Gonvarri fields
    const issueData: CreateIssueData = {
      title: this.generateIssueTitle(ai_analysis.summary),
      description: this.generateIssueDescription(conversationData),
      short_description: ai_analysis.short_description,
      impact: ai_analysis.impact,
      core_technology: ai_analysis.core_technology,
      priority: ai_analysis.priority,
      origin: 'teams',
      reporter_id: this.aiAgentUserId,
      labels: [] // We'll add these after creation
    }

    const issue = await IssuesAPI.createIssue(issueData)

    // 2. Create link to Teams conversation (with conversation_reference for proactive messaging)
    const linkData: any = {
      issue_id: issue.id,
      provider: 'teams',
      external_id: conversation_id,
      url: conversation_url,
      synced_at: new Date().toISOString()
    }

    // Add conversation reference if provided (for proactive messaging)
    if (conversation_reference) {
      linkData.teams_context = conversation_reference
    }

    const { data: link, error: linkError } = await supabase
      .from('issue_links')
      .insert(linkData)
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
    
    // Build clean description
    let description = ai_analysis.summary

    // Add key points if available
    if (ai_analysis.key_points && ai_analysis.key_points.length > 0) {
      description += '\n\nPuntos clave:\n' + ai_analysis.key_points.map(point => `- ${point}`).join('\n')
    }

    // Add technical context if available
    if (ai_analysis.core_technology) {
      description += `\n\nTecnología propuesta: ${ai_analysis.core_technology}`
    }

    // Add metadata at the end
    description += `\n\n---\nOrigen: Conversación en Teams (${messages.length} mensajes)\nParticipantes: ${participants.join(', ')}\nEnlace: ${data.conversation_url}`

    return description
  }

  private static getSuggestedAssignee(data: TeamsConversationData): string {
    // Simple keyword-based routing (in production, use ML or rules engine)
    const summary = data.ai_analysis.summary.toLowerCase()
    const keyPoints = data.ai_analysis.key_points.join(' ').toLowerCase()
    const content = summary + ' ' + keyPoints
    
    if (content.includes('login') || content.includes('password') || content.includes('technical') || content.includes('bug')) {
      return this.mockAssignees.tech
    }
    if (content.includes('marketing') || content.includes('campaign') || content.includes('content')) {
      return this.mockAssignees.marketing
    }
    if (content.includes('sales') || content.includes('customer') || content.includes('lead')) {
      return this.mockAssignees.sales
    }
    if (content.includes('hr') || content.includes('employee') || content.includes('hiring')) {
      return this.mockAssignees.hr
    }
    
    return this.mockAssignees.default
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
    // 1. Create metadata activity
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
          conversation_url: conversationData.conversation_url,
          participants: conversationData.participants,
          participants_count: conversationData.participants.length,
          messages_count: conversationData.messages.length,
          ai_analysis: {
            priority: conversationData.ai_analysis.priority,
            summary: conversationData.ai_analysis.summary,
            key_points: conversationData.ai_analysis.key_points,
            suggested_labels: conversationData.ai_analysis.suggested_labels,
            suggested_assignee: conversationData.ai_analysis.suggested_assignee || 'Tech Team'
          },
          ai_confidence: 'high',
          suggested_assignee_id: this.getSuggestedAssignee(conversationData)
        }
      })

    // 2. Create conversation history activity
    await supabase
      .from('issue_activity')
      .insert({
        organization_id: this.organizationId,
        issue_id: issueId,
        actor_user_id: this.aiAgentUserId,
        action: 'commented',
        payload: {
          source: 'teams_conversation_history',
          conversation_id: conversationData.conversation_id,
          messages: conversationData.messages,
          full_transcript: conversationData.messages
            .map(m => `[${m.timestamp}] ${m.author}: ${m.content}`)
            .join('\n')
        }
      })
  }
}
