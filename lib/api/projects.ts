import { supabase } from '../supabase/client'
import { Project, ProjectStatus, Database } from '../database/types'
import { IssuesAPI } from './issues'

export interface ProjectWithRelations extends Project {
  owner?: Database['public']['Tables']['users']['Row']
  initiative?: Database['public']['Tables']['initiatives']['Row'] | null
  _count?: {
    issues: number
    active_issues: number
    completed_issues: number
  }
  _progress?: {
    calculated: number // Progress based on completed issues
    manual: number | null // Manual progress from DB
  }
}

export class ProjectsAPI {
  // Get all projects
  static async getProjects(organizationId?: string): Promise<ProjectWithRelations[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role),
        initiative:initiatives!projects_initiative_id_fkey(id, name, slug, description)
      `)
    
    // Only filter by organization if provided
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get issue counts and calculated progress for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project) => {
        const counts = await this.getIssueCountsForProject(project.id)
        const calculatedProgress = this.calculateProgress(counts)
        
        return {
          ...project,
          _count: counts,
          _progress: {
            calculated: calculatedProgress,
            manual: project.progress
          }
        }
      })
    )

    return projectsWithCounts
  }

  // Get projects by status (for roadmap view)
  static async getProjectsByStatus(organizationId?: string, status?: ProjectStatus): Promise<ProjectWithRelations[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role),
        initiative:initiatives!projects_initiative_id_fkey(id, name, slug, description)
      `)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('planned_start_at', { ascending: true, nullsLast: true })

    const { data, error } = await query
    if (error) throw error

    // Get issue counts and calculated progress for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project) => {
        const counts = await this.getIssueCountsForProject(project.id)
        const calculatedProgress = this.calculateProgress(counts)
        
        return {
          ...project,
          _count: counts,
          _progress: {
            calculated: calculatedProgress,
            manual: project.progress
          }
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
        owner:users!projects_owner_user_id_fkey(id, name, email, avatar_url, role),
        initiative:initiatives!projects_initiative_id_fkey(id, name, slug, description)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    const counts = await this.getIssueCountsForProject(id)
    const calculatedProgress = this.calculateProgress(counts)
    
    return {
      ...data,
      _count: counts,
      _progress: {
        calculated: calculatedProgress,
        manual: data.progress
      }
    }
  }

  // Create new project
  static async createProject(
    projectData: Omit<Project, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
    organizationId: string
  ): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        organization_id: organizationId
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

  // Update project status
  static async updateProjectStatus(projectId: string, status: string, organizationId?: string): Promise<void> {
    let query = supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query
    
    if (error) throw error
  }

  // Update project business unit (direct initiative assignment)
  static async updateProjectBusinessUnit(projectId: string, businessUnitId: string | null, organizationId?: string): Promise<void> {
    let query = supabase
      .from('projects')
      .update({ 
        initiative_id: businessUnitId,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query
    
    if (error) throw error

    // Also update all issues in this project to have the same initiative_id
    // This keeps data consistent
    const { error: issuesError } = await supabase
      .from('issues')
      .update({ 
        initiative_id: businessUnitId,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .neq('state', 'triage') // Don't update triage issues
    
    if (issuesError) throw issuesError
  }

  // Update project owner
  static async updateProjectOwner(projectId: string, ownerId: string | null, organizationId?: string): Promise<void> {
    let query = supabase
      .from('projects')
      .update({ owner_user_id: ownerId })
      .eq('id', projectId)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { error } = await query
    
    if (error) throw error
  }

  // Get available users for owner assignment
  // Includes both organization users and Sapira team members assigned to the organization
  static async getAvailableUsers(organizationId?: string): Promise<any[]> {
    // Use the same logic as IssuesAPI.getAvailableUsers
    return await IssuesAPI.getAvailableUsers(organizationId)
  }

  // Get available business units
  static async getBusinessUnits(organizationId?: string): Promise<any[]> {
    let query = supabase
      .from('initiatives')
      .select('id, name, description, slug')
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
