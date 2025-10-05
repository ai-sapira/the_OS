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
    title?: string // Project/product name (2-3 words, max 40 chars)
    summary: string
    short_description?: string // Brief scope description
    impact?: string // Business impact
    core_technology?: string // Core technology used
    difficulty?: 1 | 2 | 3 // Technical difficulty
    impact_score?: 1 | 2 | 3 // Business impact score
    priority: 'P0' | 'P1' | 'P2' | 'P3'
    business_unit?: string // Business Unit name (Finance, Legal, HR, etc.)
    project?: string // Project name (Pricing, Invoicing, etc.)
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
  private static organizationId = '01234567-8901-2345-6789-012345678901' // Gonvarri
  private static aiAgentUserId = '11111111-1111-1111-1111-111111111111' // SAP user as AI agent (Pablo Senabre - Gonvarri)
  
  // Mock assignees by department/topic (in production, this would be smart routing)
  private static mockAssignees = {
    'tech': '33333333-3333-3333-3333-333333333333', // Tech BU Manager
    'marketing': '44444444-4444-4444-4444-444444444444',
    'sales': '55555555-5555-5555-5555-555555555555',
    'hr': '66666666-6666-6666-6666-666666666666',
    'default': '33333333-3333-3333-3333-333333333333' // Default to Tech
  }

  /**
   * Maps Business Unit name to initiative_id (fetched from DB)
   */
  private static async getInitiativeIdByName(businessUnitName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('id')
        .eq('organization_id', this.organizationId)
        .ilike('name', `%${businessUnitName}%`)
        .single()
      
      if (error || !data) {
        console.log(`⚠️ Business Unit "${businessUnitName}" not found in DB`)
        return null
      }
      
      return data.id
    } catch (error) {
      console.error('Error fetching Business Unit:', error)
      return null
    }
  }

  /**
   * Maps Project name to project_id (fetched from DB)
   */
  private static async getProjectIdByName(projectName: string): Promise<string | null> {
    if (!projectName) return null
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', this.organizationId)
        .ilike('name', `%${projectName}%`)
        .single()
      
      if (error || !data) {
        console.log(`⚠️ Project "${projectName}" not found in DB`)
        return null
      }
      
      return data.id
    } catch (error) {
      console.error('Error fetching Project:', error)
      return null
    }
  }

  /**
   * Creates an issue from Teams conversation analysis
   * Called by webhook or API endpoint
   */
  static async createIssueFromTeamsConversation(
    conversationData: TeamsConversationData
  ): Promise<TeamsIssueCreationResult> {
    const { ai_analysis, conversation_id, conversation_url, conversation_reference } = conversationData

    try {
      console.log('[TeamsIntegration] 🚀 Starting issue creation from Teams conversation')
      
      // Map business_unit and project names to IDs if provided
      let initiative_id = null
      let project_id = null
      
      if (ai_analysis.business_unit) {
        try {
          initiative_id = await this.getInitiativeIdByName(ai_analysis.business_unit)
          console.log(`📍 Mapped Business Unit "${ai_analysis.business_unit}" → ${initiative_id || 'NOT FOUND'}`)
        } catch (error) {
          console.error('[TeamsIntegration] ❌ Error mapping business unit:', error)
        }
      }
      
      if (ai_analysis.project) {
        try {
          project_id = await this.getProjectIdByName(ai_analysis.project)
          console.log(`📍 Mapped Project "${ai_analysis.project}" → ${project_id || 'NOT FOUND'}`)
        } catch (error) {
          console.error('[TeamsIntegration] ❌ Error mapping project:', error)
        }
      }

      // 1. Create the issue in triage with Gonvarri fields
      console.log('[TeamsIntegration] 📝 Creating issue...')
      const issueData: CreateIssueData = {
        title: ai_analysis.title || this.generateIssueTitle(ai_analysis.summary), // Use AI-generated title if available
        description: this.generateIssueDescription(conversationData),
        short_description: ai_analysis.short_description,
        impact: ai_analysis.impact,
        core_technology: ai_analysis.core_technology,
        priority: ai_analysis.priority,
        origin: 'teams',
        reporter_id: this.aiAgentUserId,
        initiative_id: initiative_id || undefined, // Business Unit mapped from AI
        project_id: project_id || undefined, // Project mapped from AI
        labels: [] // We'll add these after creation
      }

      const issue = await IssuesAPI.createIssue(this.organizationId, issueData)
      console.log(`[TeamsIntegration] ✅ Issue created: ${issue.id} (${issue.key})`)

      // 1.5. Calculate and update RICE score
      console.log('[TeamsIntegration] 🎯 Calculating RICE score...')
      if (ai_analysis.difficulty && ai_analysis.impact_score) {
        try {
          const riceScore = this.calculateRICEScore(
            ai_analysis.impact_score, 
            ai_analysis.difficulty
          )
          
          const { error: riceError } = await supabase
            .from('issues')
            .update({ 
              rice_score: riceScore,
              difficulty: ai_analysis.difficulty,
              impact_score: ai_analysis.impact_score
            })
            .eq('id', issue.id)
          
          if (riceError) {
            console.error('[TeamsIntegration] ❌ Error updating RICE score:', riceError)
            throw riceError
          }
          
          console.log(`[TeamsIntegration] ✅ RICE score calculated: ${riceScore} (impact: ${ai_analysis.impact_score}, difficulty: ${ai_analysis.difficulty})`)
        } catch (error) {
          console.error('[TeamsIntegration] ❌ Error calculating/updating RICE score:', error)
          throw error
        }
      } else {
        console.log('[TeamsIntegration] ⚠️ Skipping RICE score (missing difficulty or impact_score)')
      }

      // 2. Create link to Teams conversation (with conversation_reference for proactive messaging)
      console.log('[TeamsIntegration] 🔗 Creating Teams link...')
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

      if (linkError) {
        console.error('[TeamsIntegration] ❌ Error creating issue link:', linkError)
        throw linkError
      }
      console.log(`[TeamsIntegration] ✅ Link created: ${link.id}`)

      // 3. Add AI-suggested labels
      console.log('[TeamsIntegration] 🏷️ Adding labels...')
      if (ai_analysis.suggested_labels.length > 0) {
        try {
          await this.addSuggestedLabels(issue.id, ai_analysis.suggested_labels)
          console.log('[TeamsIntegration] ✅ Labels added')
        } catch (error) {
          console.error('[TeamsIntegration] ⚠️ Error adding labels (non-critical):', error)
          // Non-critical, continue
        }
      }

      // 4. Create detailed activity record
      console.log('[TeamsIntegration] 📋 Creating activity records...')
      try {
        await this.createTeamsActivity(issue.id, conversationData)
        console.log('[TeamsIntegration] ✅ Activity records created')
      } catch (error) {
        console.error('[TeamsIntegration] ⚠️ Error creating activity (non-critical):', error)
        // Non-critical, continue
      }

      console.log('[TeamsIntegration] 🎉 Issue creation complete!')
      return {
        issue_id: issue.id,
        issue_key: issue.key,
        link_id: link.id
      }
    } catch (error) {
      console.error('[TeamsIntegration] ❌ FATAL ERROR in createIssueFromTeamsConversation:', error)
      throw error
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
  
  /**
   * Calculate RICE score based on impact and difficulty
   * 
   * For Teams issues, score range is 60-100:
   * - Impact: 1-3 (low to high business impact)
   * - Difficulty: 1-3 (low to high technical complexity)
   * 
   * Formula: 60 + (impact × 15) - (difficulty × 5)
   * 
   * Examples:
   * - Impact 3, Difficulty 1: 60 + 45 - 5 = 100 (max priority)
   * - Impact 2, Difficulty 2: 60 + 30 - 10 = 80 (medium)
   * - Impact 1, Difficulty 3: 60 + 15 - 15 = 60 (min priority)
   */
  private static calculateRICEScore(impactScore: number, difficulty: number): number {
    const score = 60 + (impactScore * 15) - (difficulty * 5)
    // Ensure score stays within 60-100 range
    return Math.max(60, Math.min(100, score))
  }
  
  private static generateIssueTitle(summary: string): string {
    // Extract short, meaningful title (2-4 words ideally)
    const cleanSummary = summary.trim()
    
    // If already short enough (< 50 chars), use as is
    if (cleanSummary.length <= 50) {
      return cleanSummary
    }
    
    // Extract first 3-4 significant words (length > 2)
    const words = cleanSummary
      .split(' ')
      .filter(w => w.length > 2) // Filter out short words like "a", "the", "to"
    
    const shortTitle = words.slice(0, 4).join(' ')
    
    // If still too long, truncate
    return shortTitle.length > 50 ? shortTitle.substring(0, 47) + '...' : shortTitle
  }

  private static generateIssueDescription(data: TeamsConversationData): string {
    const { ai_analysis } = data
    
    // Use the AI-generated summary as the main description
    // Gemini should provide a narrative description (3-5 sentences)
    // If the summary is substantial (> 100 chars), use it directly
    if (ai_analysis.summary && ai_analysis.summary.length > 100) {
      return ai_analysis.summary
    }
    
    // Fallback: construct a basic narrative description
    let description = `This initiative was reported via Microsoft Teams. `
    
    if (ai_analysis.short_description) {
      description += `${ai_analysis.short_description}. `
    }
    
    if (ai_analysis.impact) {
      description += `The expected impact is: ${ai_analysis.impact}. `
    }
    
    if (ai_analysis.core_technology) {
      description += `The solution will utilize ${ai_analysis.core_technology} technology.`
    }
    
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
          origin: 'teams', // Add origin for timeline display
          reporter_name: conversationData.participants[0] || 'Usuario de Teams', // Add reporter name
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
