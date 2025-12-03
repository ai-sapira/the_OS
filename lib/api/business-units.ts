import { supabase } from '../supabase/client'
import { BusinessUnit, Database } from '../database/types'

export interface BusinessUnitWithManager extends BusinessUnit {
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
    initiatives: number
    active_initiatives: number
    completed_initiatives: number
  }
}

export class BusinessUnitsAPI {
  // Get business units (active by default)
  static async getBusinessUnits(
    organizationId?: string,
    options?: { includeInactive?: boolean }
  ): Promise<BusinessUnitWithManager[]> {
    const includeInactive = options?.includeInactive ?? false

    let query = supabase
      .from('business_units')
      .select(`
        *,
        manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
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

    // Get initiative counts for each business unit
    const businessUnitsWithCounts = await Promise.all(
      (data || []).map(async (businessUnit) => {
        const counts = await this.getInitiativeCountsForBusinessUnit(businessUnit.id)
        return {
          ...businessUnit,
          _count: counts
        }
      })
    )

    return businessUnitsWithCounts
  }

  // Get business unit by ID
  static async getBusinessUnitById(id: string): Promise<BusinessUnitWithManager | null> {
    const { data, error } = await supabase
      .from('business_units')
      .select(`
        *,
        manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    if (!data) return null

    const counts = await this.getInitiativeCountsForBusinessUnit(id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Get business unit by slug
  static async getBusinessUnitBySlug(slug: string, organizationId?: string): Promise<BusinessUnitWithManager | null> {
    if (!slug) {
      console.warn('[BusinessUnitsAPI] getBusinessUnitBySlug called with empty slug');
      return null;
    }

    // Try exact match first
    let query = supabase
      .from('business_units')
      .select(`
        *,
        manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('slug', slug)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    let { data, error } = await query.single()

    // If exact match fails, try case-insensitive search
    if (error && error.code === 'PGRST116') {
      console.log('[BusinessUnitsAPI] Exact slug match failed, trying case-insensitive search');
      
      let caseInsensitiveQuery = supabase
        .from('business_units')
        .select(`
          *,
          manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
        `)
        .ilike('slug', slug)

      if (organizationId) {
        caseInsensitiveQuery = caseInsensitiveQuery.eq('organization_id', organizationId)
      }

      const result = await caseInsensitiveQuery
      
      if (result.data && result.data.length > 0) {
        data = result.data[0]
        error = null
        console.log('[BusinessUnitsAPI] Found business unit with case-insensitive match:', data.slug);
      } else {
        // Try to find by name if slug doesn't match
        console.log('[BusinessUnitsAPI] Slug not found, trying to search by name pattern');
        const namePattern = slug.replace(/-/g, ' ')
        
        let nameQuery = supabase
          .from('business_units')
          .select(`
            *,
            manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
          `)
          .ilike('name', `%${namePattern}%`)

        if (organizationId) {
          nameQuery = nameQuery.eq('organization_id', organizationId)
        }

        const nameResult = await nameQuery.limit(1)
        
        if (nameResult.data && nameResult.data.length > 0) {
          data = nameResult.data[0]
          error = null
          console.log('[BusinessUnitsAPI] Found business unit by name pattern:', data.name, data.slug);
        }
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[BusinessUnitsAPI] Business unit not found with slug:', slug, 'organizationId:', organizationId);
        return null // Not found
      }
      console.error('[BusinessUnitsAPI] Error fetching business unit by slug:', error);
      throw error
    }
    if (!data) {
      console.warn('[BusinessUnitsAPI] No data returned for slug:', slug);
      return null;
    }

    const counts = await this.getInitiativeCountsForBusinessUnit(data.id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Get business unit by manager (for BU role)
  static async getBusinessUnitByManager(managerId: string, organizationId?: string): Promise<BusinessUnitWithManager | null> {
    let query = supabase
      .from('business_units')
      .select(`
        *,
        manager:users!business_units_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
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

    const counts = await this.getInitiativeCountsForBusinessUnit(data.id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Create new business unit
  static async createBusinessUnit(
    businessUnitData: Omit<BusinessUnit, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
    organizationId: string
  ): Promise<BusinessUnit> {
    const { data, error } = await supabase
      .from('business_units')
      .insert({
        ...businessUnitData,
        organization_id: organizationId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update business unit
  static async updateBusinessUnit(id: string, updates: Partial<BusinessUnit>): Promise<BusinessUnit> {
    const { data, error } = await supabase
      .from('business_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Private helper methods
  private static async getInitiativeCountsForBusinessUnit(businessUnitId: string) {
    const { data: allInitiatives, error: allError } = await supabase
      .from('initiatives')
      .select('id, state')
      .eq('business_unit_id', businessUnitId)

    if (allError) throw allError

    const initiatives = allInitiatives || []
    const activeStates = ['todo', 'in_progress', 'blocked', 'waiting_info']
    const completedStates = ['done']

    return {
      initiatives: initiatives.length,
      active_initiatives: initiatives.filter(initiative => activeStates.includes(initiative.state || '')).length,
      completed_initiatives: initiatives.filter(initiative => completedStates.includes(initiative.state || '')).length
    }
  }

  // Update business unit manager
  static async updateBusinessUnitManager(businessUnitId: string, managerId: string | null, organizationId?: string): Promise<void> {
    let query = supabase
      .from('business_units')
      .update({ 
        manager_user_id: managerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessUnitId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query

    if (error) throw error
  }

  // Update business unit status
  static async updateBusinessUnitStatus(businessUnitId: string, active: boolean, organizationId?: string): Promise<void> {
    let query = supabase
      .from('business_units')
      .update({ 
        active: active,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessUnitId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query

    if (error) throw error
  }

  // Get available users for manager assignment
  // Includes: ALL Sapira Team users (@sapira.ai) + organization users with SAP/CEO/BU roles
  static async getAvailableManagers(organizationId?: string): Promise<BusinessUnitWithManager['manager'][]> {
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

  // Get business unit activities (for showing timeline/history)
  static async getBusinessUnitActivities(businessUnitId: string) {
    const { data, error } = await supabase
      .from('business_unit_activity')
      .select(`
        *,
        actor:users!business_unit_activity_actor_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('business_unit_id', businessUnitId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create a manual activity log entry (for special events not captured by triggers)
  static async createActivity(
    businessUnitId: string,
    action: string,
    actorUserId: string | null,
    organizationId: string,
    payload?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('business_unit_activity')
      .insert({
        organization_id: organizationId,
        business_unit_id: businessUnitId,
        actor_user_id: actorUserId,
        action: action,
        payload: payload || {}
      })

    if (error) throw error
  }
}

// Legacy alias for backwards compatibility during migration
// TODO: Remove after full codebase migration
export { BusinessUnitsAPI as InitiativesAPI }
export type { BusinessUnitWithManager as InitiativeWithManager }

