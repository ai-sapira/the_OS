"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRoles, type Role } from './use-roles'
import { useAuth } from '@/lib/context/auth-context'
import { IssuesAPI, type IssueWithRelations } from '@/lib/api/issues'
import { InitiativesAPI, type InitiativeWithManager } from '@/lib/api/initiatives'
import { ProjectsAPI, type ProjectWithRelations } from '@/lib/api/projects'

// =====================================================
// DEMO MODE: Mock Users for SAP Role Switching
// =====================================================
// When a SAP user switches roles, we simulate them as specific users
// from the organization to show realistic filtered data.
//
// These are REAL user IDs from the database (table: users)
// To verify/update these IDs, run: scripts/verify-gonvarri-users.sql
//
// ⚠️ IMPORTANT: These IDs must match actual users in the database!
// =====================================================

// Gonvarri mock users (organization: Gonvarri)
const GONVARRI_MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',  // Pablo Senabre (Sapira admin)
  'CEO': '22222222-2222-2222-2222-222222222222',  // CEO Director (sees everything)
  'BU': '55555555-5555-5555-5555-555555555555',   // Miguel López (Finance Manager)
  'EMP': '33333333-3333-3333-3333-333333333333'   // Carlos Rodríguez (Employee - 3 issues reales)
}

// Map BU managers to their Business Units (initiatives)
const GONVARRI_BU_INITIATIVES = {
  '55555555-5555-5555-5555-555555555555': '10000000-0000-0000-0000-000000000001', // Miguel → Finance
  '44444444-4444-4444-4444-444444444444': '10000000-0000-0000-0000-000000000006', // Ana → All Departments
  '66666666-6666-6666-6666-666666666666': '10000000-0000-0000-0000-000000000004', // Laura → HR
  '33333333-3333-3333-3333-333333333333': '10000000-0000-0000-0000-000000000002', // Carlos → Sales
}

// Map organizations to their mock users (for multi-org support)
const MOCK_USERS_BY_ORG: Record<string, Record<Role, string>> = {
  'gonvarri': GONVARRI_MOCK_USERS,
  // Add more organizations here as needed
  // 'aurovitas': AUROVITAS_MOCK_USERS,
}

const MOCK_BU_BY_ORG: Record<string, Record<string, string>> = {
  'gonvarri': GONVARRI_BU_INITIATIVES,
  // Add more organizations here as needed
}

export function useSupabaseData() {
  const { activeRole, isSAPUser } = useRoles()
  const { currentOrg, user } = useAuth() // Get current organization and user from auth context
  const [triageIssues, setTriageIssues] = useState<IssueWithRelations[]>([])
  const [roleIssues, setRoleIssues] = useState<IssueWithRelations[]>([])
  const [initiatives, setInitiatives] = useState<InitiativeWithManager[]>([])
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user info based on active role
  // If SAP user is in demo mode (switching roles), return mock user ID
  // Otherwise, return real authenticated user ID
  const getCurrentUser = useCallback(() => {
    // SAP users in demo mode: use mock users based on selected role
    if (isSAPUser && activeRole !== 'SAP' && currentOrg) {
      const orgSlug = currentOrg.organization.slug
      const mockUsers = MOCK_USERS_BY_ORG[orgSlug]
      const mockBUs = MOCK_BU_BY_ORG[orgSlug]
      
      if (mockUsers && mockUsers[activeRole]) {
        const userId = mockUsers[activeRole]
        const initiativeId = activeRole === 'BU' && mockBUs 
          ? mockBUs[userId] 
          : undefined
        
        return { userId, initiativeId }
      }
    }
    
    // Non-SAP users OR SAP viewing as SAP: use real authenticated user
    return { 
      userId: user?.id,
      initiativeId: currentOrg?.initiative_id 
    }
  }, [activeRole, currentOrg, isSAPUser, user])

  // Get organization ID from context or fallback to Aurovitas for demo mode
  const getOrganizationId = useCallback(() => {
    // MODO DEMO: Siempre usar Aurovitas (organización vacía) si no hay auth
    return currentOrg?.organization.id || '22222222-2222-2222-2222-222222222222'  // Aurovitas (vacía)
  }, [currentOrg])

  // Load triage issues (only for SAP, CEO, BU roles)
  const loadTriageIssues = useCallback(async () => {
    if (!['SAP', 'CEO', 'BU'].includes(activeRole)) {
      setTriageIssues([])
      return
    }

    if (!currentOrg) {
      console.warn('[useSupabaseData] No currentOrg, cannot load triage issues')
      return
    }

    try {
      const issues = await IssuesAPI.getTriageIssues(currentOrg.organization.id)
      setTriageIssues(issues)
    } catch (err) {
      console.error('Error loading triage issues:', err)
      setError('Error loading triage issues')
    }
  }, [activeRole, currentOrg])

  // Load role-filtered issues
  const loadRoleIssues = useCallback(async () => {
    if (!currentOrg) {
      console.warn('[useSupabaseData] No currentOrg, cannot load role issues')
      return
    }

    try {
      const { userId, initiativeId } = getCurrentUser()
      const issues = await IssuesAPI.getIssuesByRole(currentOrg.organization.id, activeRole, userId || undefined, initiativeId || undefined)
      setRoleIssues(issues)
    } catch (err) {
      console.error('Error loading role issues:', err)
      setError('Error loading role issues')
    }
  }, [activeRole, getCurrentUser, currentOrg])

  // Load initiatives (filtered by role)
  const loadInitiatives = useCallback(async () => {
    try {
      const { userId, initiativeId } = getCurrentUser()
      let filteredInitiatives = await InitiativesAPI.getInitiatives()
      
      if (activeRole === 'BU' && initiativeId) {
        // BU only sees their own initiative
        filteredInitiatives = filteredInitiatives.filter(i => i.id === initiativeId)
      } else if (activeRole === 'EMP') {
        // EMP doesn't see initiatives
        filteredInitiatives = []
      }
      // SAP and CEO see all initiatives
      
      setInitiatives(filteredInitiatives)
    } catch (err) {
      console.error('Error loading initiatives:', err)
      setError('Error loading initiatives')
    }
  }, [activeRole, getCurrentUser])

  // Load projects (filtered by role)
  const loadProjects = useCallback(async () => {
    try {
      const { userId, initiativeId } = getCurrentUser()
      
      // Filter projects by role
      let filteredProjects = await ProjectsAPI.getProjects()
      
      if (activeRole === 'BU' && initiativeId) {
        // BU only sees projects from their initiative
        // Note: API returns initiative as nested object, not initiative_id
        filteredProjects = filteredProjects.filter(p => 
          p.initiative?.id === initiativeId || p.initiative_id === initiativeId
        )
      } else if (activeRole === 'EMP') {
        // EMP might see projects where they have issues (or none)
        filteredProjects = [] // Or filter by projects with their issues
      }
      // SAP and CEO see all projects
      
      setProjects(filteredProjects)
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Error loading projects')
    }
  }, [activeRole, getCurrentUser])

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        loadTriageIssues(),
        loadRoleIssues(),
        loadInitiatives(),
        loadProjects()
      ])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [loadTriageIssues, loadRoleIssues, loadInitiatives, loadProjects])

  // Reload data when role changes
  useEffect(() => {
    console.log('[useSupabaseData] useEffect triggered with activeRole:', activeRole)
    
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        if (!currentOrg) {
          console.warn('[useSupabaseData] No currentOrg in useEffect, skipping data load')
          setTriageIssues([])
          setRoleIssues([])
          setInitiatives([])
          setProjects([])
          return
        }

        // Load triage issues (only for SAP, CEO, BU roles)
        if (['SAP', 'CEO', 'BU'].includes(activeRole)) {
          const issues = await IssuesAPI.getTriageIssues(currentOrg.organization.id)
          setTriageIssues(issues)
        } else {
          setTriageIssues([])
        }

        // Load role-filtered issues
        const { userId, initiativeId } = getCurrentUser()
        const issues = await IssuesAPI.getIssuesByRole(currentOrg.organization.id, activeRole, userId || undefined, initiativeId || undefined)
        setRoleIssues(issues)

        // Load initiatives (filtered by role)
        let filteredInitiatives = await InitiativesAPI.getInitiatives()
        if (activeRole === 'BU' && initiativeId) {
          filteredInitiatives = filteredInitiatives.filter(i => i.id === initiativeId)
        } else if (activeRole === 'EMP') {
          filteredInitiatives = []
        }
        setInitiatives(filteredInitiatives)

        // Load projects (filtered by role)
        let filteredProjects = await ProjectsAPI.getProjects()
        if (activeRole === 'BU' && initiativeId) {
          filteredProjects = filteredProjects.filter(p => 
            p.initiative?.id === initiativeId || p.initiative_id === initiativeId
          )
        } else if (activeRole === 'EMP') {
          filteredProjects = []
        }
        setProjects(filteredProjects)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeRole, currentOrg, getCurrentUser])  // Depend on activeRole, currentOrg and getCurrentUser

  // Helper: Send notification to Teams if issue has Teams context
  const sendTeamsNotification = useCallback(async (
    issueId: string,
    message: string,
    messageType: string = 'status_update'
  ) => {
    try {
      const response = await fetch('/api/teams/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: issueId,
          message: message,
          message_type: messageType
        })
      })
      
      if (!response.ok) {
        console.warn('Failed to send Teams notification:', await response.text())
      }
    } catch (error) {
      // Don't fail the whole operation if Teams notification fails
      console.error('Error sending Teams notification:', error)
    }
  }, [])

  // Triage actions
  const acceptIssue = useCallback(async (
    issueId: string, 
    acceptData: Parameters<typeof IssuesAPI.triageIssue>[1]['accept_data'],
    comment?: string
  ) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot accept issue: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Accept the issue
      await IssuesAPI.triageIssue(issueId, {
        action: 'accept',
        accept_data: acceptData,
        reason: comment
      }, userId)
      
      // Send Teams notification if there's a comment
      if (comment?.trim()) {
        const message = `✅ Tu issue ha sido **aceptado** y está ahora en el backlog.\n\n**Comentario del equipo:**\n${comment}`
        await sendTeamsNotification(issueId, message, 'status_update')
      }
      
      // Reload data
      await Promise.all([loadTriageIssues(), loadRoleIssues()])
      
      return true
    } catch (err) {
      console.error('Error accepting issue:', err)
      setError('Error accepting issue')
      return false
    }
  }, [getCurrentUser, loadTriageIssues, loadRoleIssues, sendTeamsNotification])

  const declineIssue = useCallback(async (issueId: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot decline issue: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Decline the issue
      await IssuesAPI.triageIssue(issueId, {
        action: 'decline',
        reason
      }, userId)
      
      // Send Teams notification
      if (reason?.trim()) {
        const message = `❌ Tu issue ha sido **rechazado**.\n\n**Razón:**\n${reason}\n\nSi crees que esto es un error, por favor contacta al equipo.`
        await sendTeamsNotification(issueId, message, 'status_update')
      }
      
      // Reload triage data
      await loadTriageIssues()
      
      return true
    } catch (err) {
      console.error('Error declining issue:', err)
      setError('Error declining issue')
      return false
    }
  }, [getCurrentUser, loadTriageIssues, sendTeamsNotification])

  const duplicateIssue = useCallback(async (issueId: string, duplicateOfId: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot duplicate issue: user ID not available')
        setError('User ID not available')
        return false
      }
      
      await IssuesAPI.triageIssue(issueId, {
        action: 'duplicate',
        duplicate_of_id: duplicateOfId,
        reason
      }, userId)
      
      // Reload triage data
      await loadTriageIssues()
      
      return true
    } catch (err) {
      console.error('Error marking as duplicate:', err)
      setError('Error marking as duplicate')
      return false
    }
  }, [getCurrentUser, loadTriageIssues])

  const snoozeIssue = useCallback(async (issueId: string, snoozeUntil: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot snooze issue: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Snooze the issue
      await IssuesAPI.triageIssue(issueId, {
        action: 'snooze',
        snooze_until: snoozeUntil,
        reason
      }, userId)
      
      // Send Teams notification
      const snoozeDate = new Date(snoozeUntil).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      const message = `🕐 Tu issue ha sido **pospuesto** hasta el **${snoozeDate}**.\n\n${reason ? `**Nota:** ${reason}\n\n` : ''}Volverá a aparecer en triage en esa fecha.`
      await sendTeamsNotification(issueId, message, 'info')
      
      // Reload triage data
      await loadTriageIssues()
      
      return true
    } catch (err) {
      console.error('Error snoozing issue:', err)
      setError('Error snoozing issue')
      return false
    }
  }, [getCurrentUser, loadTriageIssues, sendTeamsNotification])

  // Create new issue
  const createIssue = useCallback(async (issueData: Parameters<typeof IssuesAPI.createIssue>[1]) => {
    if (!currentOrg) {
      console.error('[useSupabaseData] No currentOrg, cannot create issue')
      return
    }

    try {
      const { userId } = getCurrentUser()
      await IssuesAPI.createIssue(currentOrg.organization.id, {
        ...issueData,
        reporter_id: userId
      })
      
      // Reload triage data
      await loadTriageIssues()
      
      return true
    } catch (err) {
      console.error('Error creating issue:', err)
      setError('Error creating issue')
      return false
    }
  }, [getCurrentUser, loadTriageIssues, currentOrg])

  // Update issue (for drag & drop and other updates)
  const updateIssue = useCallback(async (issueId: string, updateData: Parameters<typeof IssuesAPI.updateIssue>[1]) => {
    try {
      const updatedIssue = await IssuesAPI.updateIssue(issueId, updateData)
      console.log('[useSupabaseData] Issue updated:', {
        id: updatedIssue.id,
        key: updatedIssue.key,
        assignee_id: updatedIssue.assignee_id,
        assignee: updatedIssue.assignee,
        changes: updateData
      });
      
      // Reload both triage and role data to reflect changes
      await Promise.all([loadTriageIssues(), loadRoleIssues()])
      
      return true
    } catch (err) {
      console.error('Error updating issue:', err)
      setError('Error updating issue')
      return false
    }
  }, [loadTriageIssues, loadRoleIssues])

  // Get filtered data based on role
  const getFilteredData = useCallback(() => {
    const { userId, initiativeId } = getCurrentUser()
    
    let visibleInitiatives = initiatives
    let visibleProjects = projects
    
    // Combine triage issues with role issues for complete list
    const allIssues = [...triageIssues, ...roleIssues]

    // Apply role-based filtering
    switch (activeRole) {
      case 'BU':
        // BU managers see their own initiative and projects that have issues in their BU
        visibleInitiatives = initiatives.filter(init => init.id === initiativeId)
        visibleProjects = projects.filter(project => 
          roleIssues.some(issue => 
            issue.project_id === project.id && issue.initiative_id === initiativeId
          )
        )
        break
      case 'EMP':
        // Employees see initiatives and projects related to their issues
        const employeeInitiativeIds = new Set(roleIssues.map(issue => issue.initiative_id).filter(Boolean))
        const employeeProjectIds = new Set(roleIssues.map(issue => issue.project_id).filter(Boolean))
        
        visibleInitiatives = initiatives.filter(init => employeeInitiativeIds.has(init.id))
        visibleProjects = projects.filter(project => employeeProjectIds.has(project.id))
        break
      case 'SAP':
      case 'CEO':
        // SAP and CEO see everything (no filtering)
        console.log('[useSupabaseData] SAP/CEO role - showing all projects:', projects.length)
        console.log('[useSupabaseData] All issues (triage + role):', allIssues.length)
        break
    }

    return {
      initiatives: visibleInitiatives,
      projects: visibleProjects,
      triageIssues,
      roleIssues,
      allIssues, // Combined list with triage + role issues
      triageCount: triageIssues.length
    }
  }, [activeRole, getCurrentUser, initiatives, projects, triageIssues, roleIssues])

  return {
    // Data
    ...getFilteredData(),
    
    // State
    loading,
    error,
    activeRole,
    
    // Actions
    refreshData: loadData,
    
    // Triage actions
    acceptIssue,
    declineIssue,
    duplicateIssue,
    snoozeIssue,
    createIssue,
    updateIssue,
    
    // Helpers
    getCurrentUser
  }
}
