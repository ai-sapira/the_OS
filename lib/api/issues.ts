import { supabase } from '../supabase/client'
import { Issue, IssueState, IssuePriority, IssueOrigin, Database } from '../database/types'

export interface IssueWithRelations extends Issue {
  initiative?: Database['public']['Tables']['initiatives']['Row']
  project?: Database['public']['Tables']['projects']['Row']
  assignee?: Database['public']['Tables']['users']['Row']
  reporter?: Database['public']['Tables']['users']['Row']
  labels?: Database['public']['Tables']['labels']['Row'][]
}

export interface CreateIssueData {
  title: string
  description?: string
  short_description?: string // Brief scope description (Gonvarri)
  impact?: string // Business impact (Gonvarri)
  core_technology?: string // Core technology used (Gonvarri)
  priority?: IssuePriority
  initiative_id?: string // Business Unit (can be inferred by Teams bot)
  project_id?: string // Project (can be inferred by Teams bot)
  reporter_id?: string
  origin?: IssueOrigin
  labels?: string[]
}

export interface AcceptIssueData {
  initiative_id: string
  project_id?: string
  assignee_id?: string
  priority?: IssuePriority
  due_at?: string
}

export interface TriageAction {
  action: 'accept' | 'decline' | 'duplicate' | 'snooze'
  reason?: string
  duplicate_of_id?: string
  snooze_until?: string
  accept_data?: AcceptIssueData
}

export class IssuesAPI {
  // Generate next issue key for organization
  private static async generateIssueKey(organizationId: string): Promise<string> {
    // Get organization slug
    const { data: org } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single()
    
    const prefix = org?.slug === 'gonvarri' ? 'GON' : 'ORG'
    
    // Get ALL issues with this prefix to find the maximum number
    const { data: issues } = await supabase
      .from('issues')
      .select('key')
      .eq('organization_id', organizationId)
      .ilike('key', `${prefix}-%`)
    
    let maxNumber = 0
    if (issues && issues.length > 0) {
      // Extract all numbers and find the maximum
      issues.forEach(issue => {
        const match = issue.key.match(/(\d+)$/)
        if (match) {
          const num = parseInt(match[1], 10)
          if (num > maxNumber) {
            maxNumber = num
          }
        }
      })
    }
    
    const nextNumber = maxNumber + 1
    return `${prefix}-${nextNumber}`
  }

  // Get issues for triage (state=triage, not snoozed)
  static async getTriageIssues(organizationId: string): Promise<IssueWithRelations[]> {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .eq('state', 'triage')
      .or('snooze_until.is.null,snooze_until.lt.now()')
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.transformIssuesWithLabels(data || [])
  }

  // Get all issues (for admin/general views)
  static async getIssues(organizationId: string): Promise<IssueWithRelations[]> {
    const { data, error} = await supabase
      .from('issues')
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .neq('state', 'triage')
      .neq('state', 'canceled')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return this.transformIssuesWithLabels(data || [])
  }

  // Get issues by role filter
  static async getIssuesByRole(organizationId: string, role: string, userId?: string, initiativeId?: string): Promise<IssueWithRelations[]> {
    console.log('[IssuesAPI] getIssuesByRole called with:', { organizationId, role, userId, initiativeId });
    
    let query = supabase
      .from('issues')
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .neq('state', 'triage')

    // Apply role-based filters
    switch (role) {
      case 'EMP':
        if (userId) {
          query = query.or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)
        }
        break
      case 'BU':
        if (initiativeId) {
          query = query.eq('initiative_id', initiativeId)
        }
        break
      case 'CEO':
      case 'SAP':
        // No additional filters - see all
        break
    }

    query = query.order('updated_at', { ascending: false })

    const { data, error } = await query
    if (error) {
      console.error('[IssuesAPI] Error loading issues:', error);
      throw error;
    }
    
    console.log('[IssuesAPI] Loaded', data?.length || 0, 'issues for role:', role);
    return this.transformIssuesWithLabels(data || [])
  }

  // Create new issue
  static async createIssue(organizationId: string, issueData: CreateIssueData): Promise<Issue> {
    const { labels, ...issueFields } = issueData
    
    // Generate issue key (e.g., GON-123)
    const key = await this.generateIssueKey(organizationId)
    
    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        ...issueFields,
        key,
        organization_id: organizationId,
        state: 'triage'
      })
      .select()
      .single()

    if (error) throw error

    // Add labels if provided
    if (labels && labels.length > 0) {
      await this.addLabelsToIssue(issue.id, labels)
    }

    return issue
  }

  // Triage action (accept/decline/duplicate/snooze)
  static async triageIssue(issueId: string, action: TriageAction, actorUserId: string): Promise<Issue> {
    console.log('[IssuesAPI] triageIssue called:', { issueId, action: action.action, actorUserId })
    
    let updateData: any = {
      triaged_at: new Date().toISOString(),
      triaged_by_user_id: actorUserId
    }

    switch (action.action) {
      case 'accept':
        if (!action.accept_data?.initiative_id) {
          throw new Error('initiative_id is required when accepting an issue')
        }
        updateData = {
          ...updateData,
          state: 'todo',
          initiative_id: action.accept_data.initiative_id,
          project_id: action.accept_data.project_id,
          assignee_id: action.accept_data.assignee_id,
          priority: action.accept_data.priority,
          due_at: action.accept_data.due_at
        }
        console.log('[IssuesAPI] Accepting issue with data:', updateData)
        break
      case 'decline':
        updateData.state = 'canceled'
        console.log('[IssuesAPI] Declining issue')
        break
      case 'duplicate':
        updateData.state = 'duplicate'
        updateData.duplicate_of_id = action.duplicate_of_id
        console.log('[IssuesAPI] Marking as duplicate')
        break
      case 'snooze':
        updateData.snooze_until = action.snooze_until
        console.log('[IssuesAPI] Snoozing until:', action.snooze_until)
        break
    }

    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single()

    if (error) {
      console.error('[IssuesAPI] Error updating issue:', error)
      throw error
    }
    
    console.log('[IssuesAPI] Issue updated successfully:', { 
      id: data.id, 
      key: data.key, 
      new_state: data.state,
      initiative_id: data.initiative_id,
      project_id: data.project_id
    })

    // Create activity record - map action to activity_action enum
    const activityAction = action.action === 'accept' ? 'accepted' : 
                          action.action === 'decline' ? 'declined' :
                          action.action === 'duplicate' ? 'duplicated' :
                          action.action === 'snooze' ? 'snoozed' : 
                          action.action as any
    
    await this.createActivity(issueId, activityAction, actorUserId, {
      reason: action.reason,
      ...action.accept_data,
      duplicate_of_id: action.duplicate_of_id,
      snooze_until: action.snooze_until
    })

    return data
  }

  // Update issue state
  static async updateIssueState(issueId: string, newState: IssueState): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .update({ state: newState })
      .eq('id', issueId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update issue (general update function for drag & drop and other updates)
  static async updateIssue(issueId: string, updateData: Partial<Issue>): Promise<IssueWithRelations> {
    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .single()

    if (error) throw error
    return this.transformIssueWithLabels(data)
  }

  // Update issue assignee
  static async updateIssueAssignee(issueId: string, assigneeId: string | null): Promise<IssueWithRelations> {
    const { data, error } = await supabase
      .from('issues')
      .update({ assignee_id: assigneeId })
      .eq('id', issueId)
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .single()

    if (error) throw error
    return this.transformIssueWithLabels(data)
  }

  // Delete issue by ID
  static async deleteIssue(issueId: string): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId)

    if (error) throw error
  }

  // Delete issue by key (e.g., "SAP-1")
  static async deleteIssueByKey(key: string): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('key', key)
      .eq('organization_id', this.organizationId)

    if (error) throw error
  }

  // Get issue by ID with full relations
  static async getIssueById(issueId: string): Promise<IssueWithRelations | null> {
    console.log('[IssuesAPI] getIssueById called with:', { issueId, organizationId: this.organizationId });
    
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        initiative:initiatives(*),
        project:projects(*),
        assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .eq('id', issueId)
      .eq('organization_id', this.organizationId)
      .single()

    if (error) {
      console.error('[IssuesAPI] Error loading issue by ID:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('[IssuesAPI] Issue not found:', issueId);
      return null;
    }

    console.log('[IssuesAPI] Issue loaded successfully:', data.key);
    return this.transformIssueWithLabels(data)
  }

  // Private helper methods
  private static async addLabelsToIssue(issueId: string, labelIds: string[]): Promise<void> {
    const labelLinks = labelIds.map(labelId => ({
      issue_id: issueId,
      label_id: labelId
    }))

    const { error } = await supabase
      .from('issue_labels')
      .insert(labelLinks)

    if (error) throw error
  }

  private static async createActivity(
    issueId: string, 
    action: string, 
    actorUserId: string, 
    payload: any
  ): Promise<void> {
    const { error } = await supabase
      .from('issue_activity')
      .insert({
        organization_id: this.organizationId,
        issue_id: issueId,
        actor_user_id: actorUserId,
        action: action as any,
        payload
      })

    if (error) throw error
  }

  // Get issue activities (for showing conversation history, etc)
  static async getIssueActivities(issueId: string) {
    const { data, error } = await supabase
      .from('issue_activity')
      .select(`
        *,
        actor:users!issue_activity_actor_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  private static transformIssuesWithLabels(issues: any[]): IssueWithRelations[] {
    return issues.map(issue => this.transformIssueWithLabels(issue))
  }

  private static transformIssueWithLabels(issue: any): IssueWithRelations {
    const labels = issue.labels?.map((il: any) => il.labels).filter(Boolean) || []
    
    return {
      ...issue,
      labels
    }
  }

  // Get available users for filters (reporters and assignees)
  static async getAvailableUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  // Get available projects for filters
  static async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, slug')
      .eq('organization_id', this.organizationId)
      .order('name')

    if (error) throw error
    return data || []
  }

  // Get available initiatives for filters
  static async getInitiatives() {
    const { data, error } = await supabase
      .from('initiatives')
      .select('id, name, slug')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
  }
}
