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
  private static organizationId = '22222222-2222-2222-2222-222222222222' // Aurovitas (vacía) - TODO: Get from context

  // Get issues for triage (state=triage, not snoozed)
  static async getTriageIssues(): Promise<IssueWithRelations[]> {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
        labels:issue_labels(label_id, labels(*))
      `)
      .eq('organization_id', this.organizationId)
      .eq('state', 'triage')
      .or('snooze_until.is.null,snooze_until.lt.now()')
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.transformIssuesWithLabels(data || [])
  }

  // Get all issues (for admin/general views)
  static async getIssues(): Promise<IssueWithRelations[]> {
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
      .eq('organization_id', this.organizationId)
      .neq('state', 'triage')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return this.transformIssuesWithLabels(data || [])
  }

  // Get issues by role filter
  static async getIssuesByRole(role: string, userId?: string, initiativeId?: string): Promise<IssueWithRelations[]> {
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
      .eq('organization_id', this.organizationId)
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
    if (error) throw error
    return this.transformIssuesWithLabels(data || [])
  }

  // Create new issue
  static async createIssue(issueData: CreateIssueData): Promise<Issue> {
    const { labels, ...issueFields } = issueData
    
    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        ...issueFields,
        organization_id: this.organizationId,
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
        break
      case 'decline':
        updateData.state = 'canceled'
        break
      case 'duplicate':
        updateData.state = 'duplicate'
        updateData.duplicate_of_id = action.duplicate_of_id
        break
      case 'snooze':
        updateData.snooze_until = action.snooze_until
        break
    }

    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single()

    if (error) throw error

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
      .single()

    if (error) throw error
    if (!data) return null

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
      .select('*')
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
