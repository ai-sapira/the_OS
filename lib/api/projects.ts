import { supabase } from '../supabase/client'
import { Project, ProjectStatus, Database } from '../database/types'

export interface ProjectWithRelations extends Project {
  owner?: Database['public']['Tables']['users']['Row']
  _count?: {
    issues: number
    active_issues: number
    completed_issues: number
  }
  _progress?: {
    calculated: number // Progress based on completed issues
    manual: number | null // Manual progress from DB
  }
  _initiative?: {
    id: string
    name: string
    slug: string
  } | null // Primary initiative based on most issues
}

export class ProjectsAPI {
  private static organizationId = '01234567-8901-2345-6789-012345678901' // TODO: Get from context

  // Get all projects
  static async getProjects(): Promise<ProjectWithRelations[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('organization_id', this.organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get issue counts, calculated progress, and primary initiative for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project) => {
        const counts = await this.getIssueCountsForProject(project.id)
        const calculatedProgress = this.calculateProgress(counts)
        const primaryInitiative = await this.getPrimaryInitiativeForProject(project.id)
        
        return {
          ...project,
          _count: counts,
          _progress: {
            calculated: calculatedProgress,
            manual: project.progress
          },
          _initiative: primaryInitiative
        }
      })
    )

    return projectsWithCounts
  }

  // Get projects by status (for roadmap view)
  static async getProjectsByStatus(status?: ProjectStatus): Promise<ProjectWithRelations[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('organization_id', this.organizationId)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('planned_start_at', { ascending: true, nullsLast: true })

    const { data, error } = await query
    if (error) throw error

    // Get issue counts, calculated progress, and primary initiative for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project) => {
        const counts = await this.getIssueCountsForProject(project.id)
        const calculatedProgress = this.calculateProgress(counts)
        const primaryInitiative = await this.getPrimaryInitiativeForProject(project.id)
        
        return {
          ...project,
          _count: counts,
          _progress: {
            calculated: calculatedProgress,
            manual: project.progress
          },
          _initiative: primaryInitiative
        }
      })
    )

    return projectsWithCounts
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<ProjectWithRelations | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    const counts = await this.getIssueCountsForProject(id)
    const calculatedProgress = this.calculateProgress(counts)
    const primaryInitiative = await this.getPrimaryInitiativeForProject(id)
    
    return {
      ...data,
      _count: counts,
      _progress: {
        calculated: calculatedProgress,
        manual: data.progress
      },
      _initiative: primaryInitiative
    }
  }

  // Create new project
  static async createProject(projectData: Omit<Project, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        organization_id: this.organizationId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update project
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update project progress manually
  static async updateProjectProgress(id: string, progress: number): Promise<Project> {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100')
    }

    return this.updateProject(id, { progress })
  }

  // Get project breakdown by initiatives (for roadmap view)
  static async getProjectBreakdownByInitiatives(projectId: string) {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        id,
        state,
        initiative:initiatives(id, name, slug)
      `)
      .eq('project_id', projectId)
      .not('initiative_id', 'is', null)

    if (error) throw error

    // Group by initiative
    const breakdown = (data || []).reduce((acc: any, issue) => {
      const initiative = issue.initiative
      if (!initiative) return acc

      if (!acc[initiative.id]) {
        acc[initiative.id] = {
          initiative,
          total: 0,
          completed: 0,
          active: 0
        }
      }

      acc[initiative.id].total++
      
      if (issue.state === 'done') {
        acc[initiative.id].completed++
      } else if (['todo', 'in_progress', 'blocked', 'waiting_info'].includes(issue.state || '')) {
        acc[initiative.id].active++
      }

      return acc
    }, {})

    return Object.values(breakdown)
  }

  // Private helper methods
  private static async getIssueCountsForProject(projectId: string) {
    const { data: allIssues, error: allError } = await supabase
      .from('issues')
      .select('id, state')
      .eq('project_id', projectId)

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

  private static calculateProgress(counts: { issues: number; completed_issues: number }): number {
    if (counts.issues === 0) return 0
    return Math.round((counts.completed_issues / counts.issues) * 100)
  }

  private static async getPrimaryInitiativeForProject(projectId: string) {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        initiative:initiatives(id, name, slug)
      `)
      .eq('project_id', projectId)
      .not('initiative_id', 'is', null)

    if (error) throw error

    if (!data || data.length === 0) return null

    // Count issues by initiative
    const initiativeCounts = data.reduce((acc: any, issue) => {
      const initiative = issue.initiative
      if (!initiative) return acc

      const id = initiative.id
      if (!acc[id]) {
        acc[id] = {
          initiative,
          count: 0
        }
      }
      acc[id].count++
      return acc
    }, {})

    // Find initiative with most issues
    const sortedInitiatives = Object.values(initiativeCounts)
      .sort((a: any, b: any) => b.count - a.count)

    return sortedInitiatives.length > 0 ? (sortedInitiatives[0] as any).initiative : null
  }

  // Update project status
  static async updateProjectStatus(projectId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)
      .eq('organization_id', this.organizationId)
    
    if (error) throw error
  }

  // Update project business unit (via initiative assignment)
  static async updateProjectBusinessUnit(projectId: string, businessUnitId: string | null): Promise<void> {
    // For now, we'll log this as it requires more complex logic to handle initiative assignments
    console.log(`Updating project ${projectId} business unit to ${businessUnitId}`);
    // TODO: Implement initiative assignment logic
    // This would involve updating project issues to be assigned to initiatives from the specified BU
  }

  // Update project owner
  static async updateProjectOwner(projectId: string, ownerId: string | null): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ owner_user_id: ownerId })
      .eq('id', projectId)
      .eq('organization_id', this.organizationId)
    
    if (error) throw error
  }

  // Get available users for owner assignment
  static async getAvailableUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }

  // Get available business units
  static async getBusinessUnits(): Promise<any[]> {
    const { data, error } = await supabase
      .from('initiatives')
      .select('id, name, description, slug')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }
}
