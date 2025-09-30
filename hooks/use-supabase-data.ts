"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRoles, type Role } from './use-roles'
import { IssuesAPI, type IssueWithRelations } from '@/lib/api/issues'
import { InitiativesAPI, type InitiativeWithManager } from '@/lib/api/initiatives'
import { ProjectsAPI, type ProjectWithRelations } from '@/lib/api/projects'

// Mock user context - en producción esto vendría de auth
const MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',
  'CEO': '22222222-2222-2222-2222-222222222222',
  'BU': '33333333-3333-3333-3333-333333333333', // Tech BU Manager
  'EMP': '77777777-7777-7777-7777-777777777777'
}

const MOCK_BU_INITIATIVES = {
  '33333333-3333-3333-3333-333333333333': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Tech
  '44444444-4444-4444-4444-444444444444': 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // Marketing
  '55555555-5555-5555-5555-555555555555': 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Sales
  '66666666-6666-6666-6666-666666666666': 'dddddddd-dddd-dddd-dddd-dddddddddddd', // HR
}

export function useSupabaseData() {
  const { activeRole } = useRoles()
  const [triageIssues, setTriageIssues] = useState<IssueWithRelations[]>([])
  const [roleIssues, setRoleIssues] = useState<IssueWithRelations[]>([])
  const [initiatives, setInitiatives] = useState<InitiativeWithManager[]>([])
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user info based on active role
  const getCurrentUser = useCallback(() => {
    const userId = MOCK_USERS[activeRole]
    const initiativeId = activeRole === 'BU' ? MOCK_BU_INITIATIVES[userId] : undefined
    
    return { userId, initiativeId }
  }, [activeRole])

  // Load triage issues (only for SAP, CEO, BU roles)
  const loadTriageIssues = useCallback(async () => {
    if (!['SAP', 'CEO', 'BU'].includes(activeRole)) {
      setTriageIssues([])
      return
    }

    try {
      const issues = await IssuesAPI.getTriageIssues()
      setTriageIssues(issues)
    } catch (err) {
      console.error('Error loading triage issues:', err)
      setError('Error loading triage issues')
    }
  }, [activeRole])

  // Load role-filtered issues
  const loadRoleIssues = useCallback(async () => {
    try {
      const { userId, initiativeId } = getCurrentUser()
      const issues = await IssuesAPI.getIssuesByRole(activeRole, userId, initiativeId)
      setRoleIssues(issues)
    } catch (err) {
      console.error('Error loading role issues:', err)
      setError('Error loading role issues')
    }
  }, [activeRole, getCurrentUser])

  // Load initiatives
  const loadInitiatives = useCallback(async () => {
    try {
      const allInitiatives = await InitiativesAPI.getInitiatives()
      setInitiatives(allInitiatives)
    } catch (err) {
      console.error('Error loading initiatives:', err)
      setError('Error loading initiatives')
    }
  }, [])

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      const allProjects = await ProjectsAPI.getProjects()
      setProjects(allProjects)
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Error loading projects')
    }
  }, [])

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
    loadData()
  }, [loadData])

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
  const createIssue = useCallback(async (issueData: Parameters<typeof IssuesAPI.createIssue>[0]) => {
    try {
      const { userId } = getCurrentUser()
      await IssuesAPI.createIssue({
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
  }, [getCurrentUser, loadTriageIssues])

  // Update issue (for drag & drop and other updates)
  const updateIssue = useCallback(async (issueId: string, updateData: Parameters<typeof IssuesAPI.updateIssue>[1]) => {
    try {
      await IssuesAPI.updateIssue(issueId, updateData)
      
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
      // SAP and CEO see everything (no filtering)
    }

    return {
      initiatives: visibleInitiatives,
      projects: visibleProjects,
      triageIssues,
      roleIssues,
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
