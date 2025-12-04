import { supabase } from '../supabase/client'
import { Initiative, InitiativeState, InitiativePriority, InitiativeOrigin, Database } from '../database/types'

export interface InitiativeWithRelations extends Initiative {
  businessUnit?: Database['public']['Tables']['business_units']['Row']
  project?: Database['public']['Tables']['projects']['Row']
  assignee?: Database['public']['Tables']['users']['Row']
  reporter?: Database['public']['Tables']['users']['Row']
  labels?: Database['public']['Tables']['labels']['Row'][]
}

export interface CreateInitiativeData {
  title: string
  description?: string
  short_description?: string // Brief scope description
  impact?: string // Business impact
  core_technology?: string // Core technology used
  priority?: InitiativePriority
  business_unit_id?: string // Business Unit
  project_id?: string // Project
  reporter_id?: string
  origin?: InitiativeOrigin
  labels?: string[]
}

export interface AcceptInitiativeData {
  business_unit_id: string
  project_id?: string
  assignee_id?: string
  priority?: InitiativePriority
  due_at?: string
}

export interface TriageAction {
  action: 'accept' | 'decline' | 'duplicate' | 'snooze'
  reason?: string
  duplicate_of_id?: string
  snooze_until?: string
  accept_data?: AcceptInitiativeData
}

export class InitiativesAPI {
  // Generate next initiative key for organization using atomic SQL function
  private static async generateInitiativeKey(organizationId: string): Promise<string> {
    // Use the SQL function for atomic key generation
    const { data, error } = await supabase
      .rpc('generate_initiative_key', { org_id: organizationId })
    
    if (error) {
      console.error('[InitiativesAPI] Error generating initiative key:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('Failed to generate initiative key')
    }
    
    return data as string
  }

  // Get initiatives for triage (state=triage, not snoozed)
  static async getTriageInitiatives(organizationId: string): Promise<InitiativeWithRelations[]> {
    const { data, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .eq('state', 'triage')
      .or('snooze_until.is.null,snooze_until.lt.now()')
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.transformInitiativesWithLabels(data || [])
  }

  // Get all initiatives (for admin/general views)
  static async getInitiatives(organizationId: string): Promise<InitiativeWithRelations[]> {
    const { data, error} = await supabase
      .from('initiatives')
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .neq('state', 'triage')
      .neq('state', 'canceled')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return this.transformInitiativesWithLabels(data || [])
  }

  // Get initiatives by role filter
  static async getInitiativesByRole(organizationId: string, role: string, userId?: string, businessUnitId?: string): Promise<InitiativeWithRelations[]> {
    console.log('[InitiativesAPI] getInitiativesByRole called with:', { organizationId, role, userId, businessUnitId });
    
    let query = supabase
      .from('initiatives')
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
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
        if (businessUnitId) {
          query = query.eq('business_unit_id', businessUnitId)
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
      console.error('[InitiativesAPI] Error loading initiatives:', error);
      throw error;
    }
    
    console.log('[InitiativesAPI] Loaded', data?.length || 0, 'initiatives for role:', role);
    return this.transformInitiativesWithLabels(data || [])
  }

  // Get initiatives scoped to a specific project
  static async getInitiativesByProject(organizationId: string, projectId: string): Promise<InitiativeWithRelations[]> {
    const { data, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .eq('organization_id', organizationId)
      .eq('project_id', projectId)
      .neq('state', 'triage')
      .neq('state', 'canceled')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return this.transformInitiativesWithLabels(data || [])
  }

  // Create new initiative
  static async createInitiative(organizationId: string, initiativeData: CreateInitiativeData): Promise<Initiative> {
    const { labels, ...initiativeFields } = initiativeData
    
    // Generate initiative key (e.g., GON-123)
    const key = await this.generateInitiativeKey(organizationId)
    
    const { data: initiative, error } = await supabase
      .from('initiatives')
      .insert({
        ...initiativeFields,
        key,
        organization_id: organizationId,
        state: 'triage'
      })
      .select()
      .single()

    if (error) throw error

    // Add labels if provided
    if (labels && labels.length > 0) {
      await this.addLabelsToInitiative(initiative.id, labels)
    }

    return initiative
  }

  // Triage action (accept/decline/duplicate/snooze)
  static async triageInitiative(initiativeId: string, action: TriageAction, actorUserId: string): Promise<Initiative> {
    console.log('[InitiativesAPI] triageInitiative called:', { initiativeId, action: action.action, actorUserId })
    
    let updateData: any = {
      triaged_at: new Date().toISOString(),
      triaged_by_user_id: actorUserId
    }

    switch (action.action) {
      case 'accept':
        if (!action.accept_data?.business_unit_id) {
          throw new Error('business_unit_id is required when accepting an initiative')
        }
        updateData = {
          ...updateData,
          state: 'todo',
          business_unit_id: action.accept_data.business_unit_id,
          project_id: action.accept_data.project_id,
          assignee_id: action.accept_data.assignee_id,
          priority: action.accept_data.priority,
          due_at: action.accept_data.due_at
        }
        console.log('[InitiativesAPI] Accepting initiative with data:', updateData)
        break
      case 'decline':
        updateData.state = 'canceled'
        console.log('[InitiativesAPI] Declining initiative')
        break
      case 'duplicate':
        updateData.state = 'duplicate'
        updateData.duplicate_of_initiative_id = action.duplicate_of_id
        console.log('[InitiativesAPI] Marking as duplicate')
        break
      case 'snooze':
        updateData.snooze_until = action.snooze_until
        console.log('[InitiativesAPI] Snoozing until:', action.snooze_until)
        break
    }

    const { data, error } = await supabase
      .from('initiatives')
      .update(updateData)
      .eq('id', initiativeId)
      .select()
      .single()

    if (error) {
      console.error('[InitiativesAPI] Error updating initiative:', error)
      throw error
    }
    
    console.log('[InitiativesAPI] Initiative updated successfully:', { 
      id: data.id, 
      key: data.key, 
      new_state: data.state,
      business_unit_id: data.business_unit_id,
      project_id: data.project_id
    })

    // Create activity record - map action to activity_action enum
    const activityAction = action.action === 'accept' ? 'accepted' : 
                          action.action === 'decline' ? 'declined' :
                          action.action === 'duplicate' ? 'duplicated' :
                          action.action === 'snooze' ? 'snoozed' : 
                          action.action as any
    
    // Get organization_id from the initiative
    const organizationId = data.organization_id
    
    await this.createActivity(
      initiativeId, 
      activityAction, 
      actorUserId, 
      organizationId,
      {
        reason: action.reason,
        ...action.accept_data,
        duplicate_of_id: action.duplicate_of_id,
        snooze_until: action.snooze_until
      }
    )

    return data
  }

  // Update initiative state
  static async updateInitiativeState(initiativeId: string, newState: InitiativeState): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .update({ state: newState })
      .eq('id', initiativeId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update initiative (general update function for drag & drop and other updates)
  static async updateInitiative(initiativeId: string, updateData: Partial<Initiative>): Promise<InitiativeWithRelations> {
    const { data, error } = await supabase
      .from('initiatives')
      .update(updateData)
      .eq('id', initiativeId)
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .single()

    if (error) throw error
    return this.transformInitiativeWithLabels(data)
  }

  // Update initiative assignee
  static async updateInitiativeAssignee(initiativeId: string, assigneeId: string | null): Promise<InitiativeWithRelations> {
    const { data, error } = await supabase
      .from('initiatives')
      .update({ assignee_id: assigneeId })
      .eq('id', initiativeId)
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .single()

    if (error) throw error
    return this.transformInitiativeWithLabels(data)
  }

  // Delete initiative by ID
  static async deleteInitiative(initiativeId: string): Promise<void> {
    const { error } = await supabase
      .from('initiatives')
      .delete()
      .eq('id', initiativeId)

    if (error) throw error
  }

  // Delete initiative by key (e.g., "SAP-1")
  static async deleteInitiativeByKey(key: string, organizationId?: string): Promise<void> {
    let query = supabase
      .from('initiatives')
      .delete()
      .eq('key', key)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query

    if (error) throw error
  }

  // Get initiative by ID with full relations
  static async getInitiativeById(initiativeId: string, organizationId?: string): Promise<InitiativeWithRelations | null> {
    console.log('[InitiativesAPI] getInitiativeById called with:', { initiativeId, organizationId });
    
    let query = supabase
      .from('initiatives')
      .select(`
        *,
        businessUnit:business_units(*),
        project:projects(*),
        assignee:users!initiatives_assignee_id_fkey(id, name, email, avatar_url),
        reporter:users!initiatives_reporter_id_fkey(id, name, email, avatar_url),
        labels:initiative_labels(label_id, labels(*))
      `)
      .eq('id', initiativeId)
      .single()

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[InitiativesAPI] Error loading initiative by ID:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('[InitiativesAPI] Initiative not found:', initiativeId);
      return null;
    }

    console.log('[InitiativesAPI] Initiative loaded successfully:', data.key);
    return this.transformInitiativeWithLabels(data)
  }

  // Private helper methods
  private static async addLabelsToInitiative(initiativeId: string, labelIds: string[]): Promise<void> {
    const labelLinks = labelIds.map(labelId => ({
      initiative_id: initiativeId,
      label_id: labelId
    }))

    const { error } = await supabase
      .from('initiative_labels')
      .insert(labelLinks)

    if (error) throw error
  }

  private static async createActivity(
    initiativeId: string, 
    action: string, 
    actorUserId: string, 
    organizationId: string,
    payload: any
  ): Promise<void> {
    const { error } = await supabase
      .from('initiative_activity')
      .insert({
        organization_id: organizationId,
        initiative_id: initiativeId,
        actor_user_id: actorUserId,
        action: action as any,
        payload
      })

    if (error) throw error
  }

  // Get initiative activities (for showing conversation history, etc)
  static async getInitiativeActivities(initiativeId: string) {
    const { data, error } = await supabase
      .from('initiative_activity')
      .select(`
        *,
        actor:users!initiative_activity_actor_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('initiative_id', initiativeId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  private static transformInitiativesWithLabels(initiatives: any[]): InitiativeWithRelations[] {
    return initiatives.map(initiative => this.transformInitiativeWithLabels(initiative))
  }

  private static transformInitiativeWithLabels(initiative: any): InitiativeWithRelations {
    const labels = initiative.labels?.map((il: any) => il.labels).filter(Boolean) || []
    
    return {
      ...initiative,
      labels
    }
  }

  // Get available users for filters (reporters and assignees)
  // Includes both organization users and Sapira team members assigned to the organization
  static async getAvailableUsers(organizationId?: string) {
    const baseUserFields = 'id, name, email, avatar_url, role, organization_id, active, created_at, updated_at'

    const fetchSapiraUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select(baseUserFields)
        .eq('active', true)
        .ilike('email', '%@sapira.ai')
        .order('name')

      if (error) throw error
      return data || []
    }

    if (!organizationId) {
      const [{ data: allUsers, error: allError }, sapiraUsers] = await Promise.all([
        supabase
          .from('users')
          .select(baseUserFields)
          .eq('active', true)
          .order('name'),
        fetchSapiraUsers()
      ])

      if (allError) throw allError

      const combined = [...(allUsers || [])]
      const seen = new Set(combined.map(user => user.id))
      sapiraUsers.forEach(user => {
        if (!seen.has(user.id)) {
          combined.push(user as any)
        }
      })

      return combined
    }

    const [{ data: orgUsers, error: orgError }, sapiraAssignmentsResult] = await Promise.all([
      supabase
        .from('users')
        .select(baseUserFields)
        .eq('active', true)
        .eq('organization_id', organizationId)
        .order('name'),
      // Fetch sapira role types separately to avoid complex join issues
      // Note: user_organizations uses auth_user_id (not user_id)
      supabase
        .from('user_organizations')
        .select('sapira_role_type, auth_user_id')
        .eq('organization_id', organizationId)
        .eq('active', true)
        .not('auth_user_id', 'is', null)
    ])

    if (orgError) throw orgError

    // Handle sapiraAssignments error gracefully
    let sapiraAssignments: any[] = []
    if (sapiraAssignmentsResult?.error) {
      console.warn('[InitiativesAPI] Error fetching sapira assignments:', sapiraAssignmentsResult.error)
      // If there's an error, set to empty array
      sapiraAssignments = []
    } else if (sapiraAssignmentsResult?.data) {
      // Ensure it's an array
      sapiraAssignments = Array.isArray(sapiraAssignmentsResult.data) 
        ? sapiraAssignmentsResult.data 
        : []
    }

    const sapiraRoleType = new Map<string, string | null>()
    if (sapiraAssignments.length > 0) {
      // Get auth_user_ids from sapira assignments and fetch their emails
      // Note: auth_user_id in user_organizations maps to auth_user_id in users table
      const sapiraUserIds = sapiraAssignments.map((row: any) => row.auth_user_id).filter(Boolean)
      
      if (sapiraUserIds.length > 0) {
        // Fetch users to check if they're Sapira users
        const { data: sapiraUsersData } = await supabase
          .from('users')
          .select('id, email, auth_user_id')
          .in('auth_user_id', sapiraUserIds)
          .ilike('email', '%@sapira.ai')
        
        const sapiraUserIdsSet = new Set((sapiraUsersData || []).map((u: any) => u.auth_user_id))
        
        sapiraAssignments.forEach((row: any) => {
          const authUserId = row.auth_user_id
          if (authUserId && sapiraUserIdsSet.has(authUserId)) {
            // Map auth_user_id to user.id for consistent lookup later
            const userData = sapiraUsersData?.find((u: any) => u.auth_user_id === authUserId)
            if (userData) {
              sapiraRoleType.set(userData.id, row.sapira_role_type || null)
            }
          }
        })
      }
    }

    const combinedUsers = (orgUsers || []).map(user => ({
      ...user,
      sapira_role_type: sapiraRoleType.get(user.id) || null
    }))
    const seenIds = new Set(combinedUsers.map(user => user.id))

    const sapiraGlobals = await fetchSapiraUsers()
    sapiraGlobals.forEach(user => {
      if (!seenIds.has(user.id)) {
        combinedUsers.push({
          ...user,
          sapira_role_type: sapiraRoleType.get(user.id) || null
        } as any)
        seenIds.add(user.id)
      }
    })

    return combinedUsers.sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))
  }

  // Get available projects for filters
  static async getProjects(organizationId?: string) {
    let query = supabase
      .from('projects')
      .select('id, name, slug')
      .order('name')

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get available business units for filters
  static async getBusinessUnits(organizationId?: string) {
    let query = supabase
      .from('business_units')
      .select('id, name, slug')
      .eq('active', true)
      .order('name')

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}

// Legacy aliases for backwards compatibility during migration
// TODO: Remove after full codebase migration
export { InitiativesAPI as IssuesAPI }
export type { InitiativeWithRelations as IssueWithRelations }
export type { CreateInitiativeData as CreateIssueData }
export type { AcceptInitiativeData as AcceptIssueData }
