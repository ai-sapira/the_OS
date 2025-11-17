import { supabase } from '../supabase/client'
import { Initiative, Database } from '../database/types'

export interface InitiativeWithManager extends Initiative {
  manager?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
    role: "SAP" | "CEO" | "BU" | "EMP"
    organization_id: string
    active: boolean | null
    created_at: string | null
    updated_at: string | null
  } | null
  _count?: {
    issues: number
    active_issues: number
    completed_issues: number
  }
}

export class InitiativesAPI {
  // Get initiatives (active by default)
  static async getInitiatives(
    organizationId?: string,
    options?: { includeInactive?: boolean }
  ): Promise<InitiativeWithManager[]> {
    const includeInactive = options?.includeInactive ?? false

    let query = supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
    
    // Only filter by organization if provided
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query
      .order('name')

    if (error) throw error

    // Get issue counts for each initiative
    const initiativesWithCounts = await Promise.all(
      (data || []).map(async (initiative) => {
        const counts = await this.getIssueCountsForInitiative(initiative.id)
        return {
          ...initiative,
          _count: counts
        }
      })
    )

    return initiativesWithCounts
  }

  // Get initiative by ID
  static async getInitiativeById(id: string): Promise<InitiativeWithManager | null> {
    const { data, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    if (!data) return null

    const counts = await this.getIssueCountsForInitiative(id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Get initiative by slug
  static async getInitiativeBySlug(slug: string, organizationId?: string): Promise<InitiativeWithManager | null> {
    if (!slug) {
      console.warn('[InitiativesAPI] getInitiativeBySlug called with empty slug');
      return null;
    }

    // Try exact match first
    let query = supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('slug', slug)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    let { data, error } = await query.single()

    // If exact match fails, try case-insensitive search
    if (error && error.code === 'PGRST116') {
      console.log('[InitiativesAPI] Exact slug match failed, trying case-insensitive search');
      
      let caseInsensitiveQuery = supabase
        .from('initiatives')
        .select(`
          *,
          manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
        `)
        .ilike('slug', slug)

      if (organizationId) {
        caseInsensitiveQuery = caseInsensitiveQuery.eq('organization_id', organizationId)
      }

      const result = await caseInsensitiveQuery
      
      if (result.data && result.data.length > 0) {
        data = result.data[0]
        error = null
        console.log('[InitiativesAPI] Found initiative with case-insensitive match:', data.slug);
      } else {
        // Try to find by name if slug doesn't match
        console.log('[InitiativesAPI] Slug not found, trying to search by name pattern');
        const namePattern = slug.replace(/-/g, ' ').replace(/tes-1/i, 'testing the test of the test');
        
        let nameQuery = supabase
          .from('initiatives')
          .select(`
            *,
            manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
          `)
          .ilike('name', `%${namePattern}%`)

        if (organizationId) {
          nameQuery = nameQuery.eq('organization_id', organizationId)
        }

        const nameResult = await nameQuery.limit(1)
        
        if (nameResult.data && nameResult.data.length > 0) {
          data = nameResult.data[0]
          error = null
          console.log('[InitiativesAPI] Found initiative by name pattern:', data.name, data.slug);
        }
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[InitiativesAPI] Initiative not found with slug:', slug, 'organizationId:', organizationId);
        return null // Not found
      }
      console.error('[InitiativesAPI] Error fetching initiative by slug:', error);
      throw error
    }
    if (!data) {
      console.warn('[InitiativesAPI] No data returned for slug:', slug);
      return null;
    }

    const counts = await this.getIssueCountsForInitiative(data.id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Get initiative by manager (for BU role)
  static async getInitiativeByManager(managerId: string, organizationId?: string): Promise<InitiativeWithManager | null> {
    let query = supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('manager_user_id', managerId)
      .eq('active', true)
      .single()

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    if (!data) return null

    const counts = await this.getIssueCountsForInitiative(data.id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Create new initiative
  static async createInitiative(
    initiativeData: Omit<Initiative, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
    organizationId: string
  ): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .insert({
        ...initiativeData,
        organization_id: organizationId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update initiative
  static async updateInitiative(id: string, updates: Partial<Initiative>): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Private helper methods
  private static async getIssueCountsForInitiative(initiativeId: string) {
    const { data: allIssues, error: allError } = await supabase
      .from('issues')
      .select('id, state')
      .eq('initiative_id', initiativeId)

    if (allError) throw allError

    const issues = allIssues || []
    const activeStates = ['todo', 'in_progress', 'blocked', 'waiting_info']
    const completedStates = ['done']

    return {
      issues: issues.length,
      active_issues: issues.filter(issue => activeStates.includes(issue.state || '')).length,
      completed_issues: issues.filter(issue => completedStates.includes(issue.state || '')).length
    }
  }

  // Update initiative manager
  static async updateInitiativeManager(initiativeId: string, managerId: string | null, organizationId?: string): Promise<void> {
    let query = supabase
      .from('initiatives')
      .update({ 
        manager_user_id: managerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiativeId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query

    if (error) throw error
  }

  // Update initiative status
  static async updateInitiativeStatus(initiativeId: string, active: boolean, organizationId?: string): Promise<void> {
    let query = supabase
      .from('initiatives')
      .update({ 
        active: active,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiativeId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query

    if (error) throw error
  }

  // Get available users for manager assignment
  // Includes: ALL Sapira Team users (@sapira.ai) + organization users with SAP/CEO/BU roles
  static async getAvailableManagers(organizationId?: string): Promise<InitiativeWithManager['manager'][]> {
    const baseUserFields = 'id, name, email, avatar_url, role, organization_id, active, created_at, updated_at'

    // Fetch all Sapira Team users (all @sapira.ai users, regardless of organization)
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
      // If no organization specified, return all Sapira users + all users with SAP/CEO/BU roles
      const [{ data: allManagers, error: allError }, sapiraUsers] = await Promise.all([
        supabase
          .from('users')
          .select(baseUserFields)
          .eq('active', true)
          .in('role', ['SAP', 'CEO', 'BU'])
          .order('name'),
        fetchSapiraUsers()
      ])

      if (allError) throw allError

      // Combine and remove duplicates
      const combined = [...(allManagers || []).map((u: any) => ({ ...u, sapira_role_type: null }))]
      const seen = new Set(combined.map((user: any) => user.id))
      sapiraUsers.forEach(user => {
        if (!seen.has(user.id)) {
          combined.push({ ...user, sapira_role_type: null } as any)
        }
      })

      return combined.sort((a: any, b: any) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))
    }

    // Fetch organization users with SAP/CEO/BU roles
    const [{ data: orgManagers, error: orgError }, sapiraAssignments] = await Promise.all([
      supabase
        .from('users')
        .select(baseUserFields)
        .eq('active', true)
        .eq('organization_id', organizationId)
        .in('role', ['SAP', 'CEO', 'BU'])
        .order('name'),
      // Get sapira_role_type from user_organizations for Sapira users
      supabase
        .from('user_organizations')
        .select(`
          sapira_role_type,
          users!inner (
            ${baseUserFields}
          )
        `)
        .eq('organization_id', organizationId)
        .eq('active', true)
        .ilike('users.email', '%@sapira.ai')
    ])

    if (orgError) throw orgError

    // Build map of sapira_role_type by user ID
    const sapiraRoleTypeMap = new Map<string, string | null>()
    sapiraAssignments?.data?.forEach((row: any) => {
      const userId = row.users?.id
      if (userId) {
        sapiraRoleTypeMap.set(userId, row.sapira_role_type || null)
      }
    })

    // Add sapira_role_type to org managers
    const orgManagersWithRoleType = (orgManagers || []).map((user: any) => ({
      ...user,
      sapira_role_type: sapiraRoleTypeMap.get(user.id) || null
    }))

    // Fetch all Sapira users and add them
    const sapiraUsers = await fetchSapiraUsers()

    // Combine organization managers with all Sapira Team users
    const combined = [...orgManagersWithRoleType]
    const seen = new Set(combined.map((user: any) => user.id))
    
    sapiraUsers.forEach(user => {
      if (!seen.has(user.id)) {
        combined.push({
          ...user,
          sapira_role_type: sapiraRoleTypeMap.get(user.id) || null
        } as any)
        seen.add(user.id)
      }
    })

    return combined.sort((a: any, b: any) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))
  }

  // Get initiative activities (for showing timeline/history)
  static async getInitiativeActivities(initiativeId: string) {
    const { data, error } = await supabase
      .from('initiative_activity')
      .select(`
        *,
        actor:users!initiative_activity_actor_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('initiative_id', initiativeId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create a manual activity log entry (for special events not captured by triggers)
  static async createActivity(
    initiativeId: string,
    action: string,
    actorUserId: string | null,
    organizationId: string,
    payload?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('initiative_activity')
      .insert({
        organization_id: organizationId,
        initiative_id: initiativeId,
        actor_user_id: actorUserId,
        action: action,
        payload: payload || {}
      })

    if (error) throw error
  }
}
