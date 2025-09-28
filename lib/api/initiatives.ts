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
  private static organizationId = '01234567-8901-2345-6789-012345678901' // TODO: Get from context

  // Get all active initiatives
  static async getInitiatives(): Promise<InitiativeWithManager[]> {
    const { data, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('organization_id', this.organizationId)
      .eq('active', true)
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

    if (error) throw error
    if (!data) return null

    const counts = await this.getIssueCountsForInitiative(id)
    
    return {
      ...data,
      _count: counts
    }
  }

  // Get initiative by manager (for BU role)
  static async getInitiativeByManager(managerId: string): Promise<InitiativeWithManager | null> {
    const { data, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        manager:users!initiatives_manager_user_id_fkey(id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
      `)
      .eq('organization_id', this.organizationId)
      .eq('manager_user_id', managerId)
      .eq('active', true)
      .single()

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
  static async createInitiative(initiativeData: Omit<Initiative, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .insert({
        ...initiativeData,
        organization_id: this.organizationId
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
  static async updateInitiativeManager(initiativeId: string, managerId: string | null): Promise<void> {
    const { error } = await supabase
      .from('initiatives')
      .update({ 
        manager_user_id: managerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiativeId)
      .eq('organization_id', this.organizationId)

    if (error) throw error
  }

  // Update initiative status
  static async updateInitiativeStatus(initiativeId: string, active: boolean): Promise<void> {
    const { error } = await supabase
      .from('initiatives')
      .update({ 
        active: active,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiativeId)
      .eq('organization_id', this.organizationId)

    if (error) throw error
  }

  // Get available users for manager assignment
  static async getAvailableManagers(): Promise<InitiativeWithManager['manager'][]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role, organization_id, active, created_at, updated_at')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .in('role', ['SAP', 'CEO', 'BU'])
      .order('name')

    if (error) throw error
    return data || []
  }
}
