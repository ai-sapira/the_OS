"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRoles, type Role } from './use-roles'
import { useAuth } from '@/lib/context/auth-context'
import { InitiativesAPI, type InitiativeWithRelations } from '@/lib/api/initiatives'
import { BusinessUnitsAPI, type BusinessUnitWithManager } from '@/lib/api/business-units'
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
  'EMP': '33333333-3333-3333-3333-333333333333'   // Carlos Rodríguez (Employee - 3 initiatives reales)
}

// Map BU managers to their Business Units
const GONVARRI_BU_BUSINESS_UNITS = {
  '55555555-5555-5555-5555-555555555555': '10000000-0000-0000-0000-000000000001', // Miguel → Finance
  '44444444-4444-4444-4444-444444444444': '10000000-0000-0000-0000-000000000006', // Ana → All Departments
  '66666666-6666-6666-6666-666666666666': '10000000-0000-0000-0000-000000000004', // Laura → HR
  '33333333-3333-3333-3333-333333333333': '10000000-0000-0000-0000-000000000002', // Carlos → Sales
}

// Map organizations to their mock users (for multi-org support)
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const MOCK_USERS_BY_ORG: Record<string, Record<Role, string>> = DEMO_MODE
  ? {
      gonvarri: GONVARRI_MOCK_USERS,
      // Add more organizations here as needed for demo environments
    }
  : {}

const MOCK_BU_BY_ORG: Record<string, Record<string, string>> = DEMO_MODE
  ? {
      gonvarri: GONVARRI_BU_BUSINESS_UNITS,
      // Add more organizations here as needed for demo environments
    }
  : {}

export function useSupabaseData() {
  const { activeRole, isSAPUser } = useRoles()
  const { currentOrg, user } = useAuth() // Get current organization and user from auth context
  const [triageInitiatives, setTriageInitiatives] = useState<InitiativeWithRelations[]>([])
  const [roleInitiatives, setRoleInitiatives] = useState<InitiativeWithRelations[]>([])
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitWithManager[]>([])
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user info based on active role
  // If SAP user is in demo mode (switching roles), return mock user ID
  // Otherwise, return real authenticated user ID
  const getCurrentUser = useCallback(() => {
    // SAP users in demo mode: use mock users based on selected role
    if (DEMO_MODE && isSAPUser && activeRole !== 'SAP' && currentOrg) {
      const orgSlug = currentOrg.organization.slug
      const mockUsers = MOCK_USERS_BY_ORG[orgSlug]
      const mockBUs = MOCK_BU_BY_ORG[orgSlug]
      
      if (mockUsers && mockUsers[activeRole]) {
        const userId = mockUsers[activeRole]
        const businessUnitId = activeRole === 'BU' && mockBUs 
          ? mockBUs[userId] 
          : undefined
        
        return { userId, businessUnitId }
      }
    }
    
    // Non-SAP users OR SAP viewing as SAP: use real authenticated user
    return { 
      userId: user?.id,
      businessUnitId: currentOrg?.business_unit_id 
    }
  }, [activeRole, currentOrg, isSAPUser, user])

  // Get organization ID from context
  const getOrganizationId = useCallback(() => {
    return currentOrg?.organization.id
  }, [currentOrg])

  // Load triage initiatives (only for SAP, CEO, BU roles)
  const loadTriageInitiatives = useCallback(async () => {
    if (!['SAP', 'CEO', 'BU'].includes(activeRole)) {
      setTriageInitiatives([])
      return
    }

    if (!currentOrg) {
      console.warn('[useSupabaseData] No currentOrg, cannot load triage initiatives')
      return
    }

    try {
      const initiatives = await InitiativesAPI.getTriageInitiatives(currentOrg.organization.id)
      setTriageInitiatives(initiatives)
    } catch (err) {
      console.error('Error loading triage initiatives:', err)
      setError('Error loading triage initiatives')
    }
  }, [activeRole, currentOrg])

  // Load role-filtered initiatives
  const loadRoleInitiatives = useCallback(async () => {
    if (!currentOrg) {
      console.warn('[useSupabaseData] No currentOrg, cannot load role initiatives')
      return
    }

    try {
      const { userId, businessUnitId } = getCurrentUser()
      const initiatives = await InitiativesAPI.getInitiativesByRole(currentOrg.organization.id, activeRole, userId || undefined, businessUnitId || undefined)
      setRoleInitiatives(initiatives)
    } catch (err) {
      console.error('Error loading role initiatives:', err)
      setError('Error loading role initiatives')
    }
  }, [activeRole, getCurrentUser, currentOrg])

  // Load business units (filtered by role)
  const loadBusinessUnits = useCallback(async () => {
    const organizationId = getOrganizationId()
    if (!organizationId) {
      setBusinessUnits([])
      return
    }

    try {
      const { userId, businessUnitId } = getCurrentUser()
      let filteredBusinessUnits = await BusinessUnitsAPI.getBusinessUnits(organizationId)
      
      if (activeRole === 'BU' && businessUnitId) {
        // BU only sees their own business unit
        filteredBusinessUnits = filteredBusinessUnits.filter(bu => bu.id === businessUnitId)
      } else if (activeRole === 'EMP') {
        // EMP doesn't see business units
        filteredBusinessUnits = []
      }
      // SAP and CEO see all business units (of current organization)
      
      setBusinessUnits(filteredBusinessUnits)
    } catch (err) {
      console.error('Error loading business units:', err)
      setError('Error loading business units')
    }
  }, [activeRole, getCurrentUser, getOrganizationId])

  // Load projects (filtered by role)
  const loadProjects = useCallback(async () => {
    const organizationId = getOrganizationId()
    if (!organizationId) {
      setProjects([])
      return
    }

    try {
      const { userId, businessUnitId } = getCurrentUser()
      
      // Filter projects by role
      let filteredProjects = await ProjectsAPI.getProjects(organizationId)
      
      if (activeRole === 'BU' && businessUnitId) {
        // BU only sees projects from their business unit
        // Note: API returns businessUnit as nested object, not business_unit_id
        filteredProjects = filteredProjects.filter(p => 
          p.businessUnit?.id === businessUnitId || p.business_unit_id === businessUnitId
        )
      } else if (activeRole === 'EMP') {
        // EMP might see projects where they have initiatives (or none)
        filteredProjects = [] // Or filter by projects with their initiatives
      }
      // SAP and CEO see all projects (of current organization)
      
      setProjects(filteredProjects)
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Error loading projects')
    }
  }, [activeRole, getCurrentUser, getOrganizationId])

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        loadTriageInitiatives(),
        loadRoleInitiatives(),
        loadBusinessUnits(),
        loadProjects()
      ])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [loadTriageInitiatives, loadRoleInitiatives, loadBusinessUnits, loadProjects])

  // Reload data when dependencies change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Helper: Send notification to Teams if initiative has Teams context
  const sendTeamsNotification = useCallback(async (
    initiativeId: string,
    message: string,
    messageType: string = 'status_update'
  ) => {
    try {
      const response = await fetch('/api/teams/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiative_id: initiativeId,
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
  const acceptInitiative = useCallback(async (
    initiativeId: string, 
    acceptData: Parameters<typeof InitiativesAPI.triageInitiative>[1]['accept_data'],
    comment?: string
  ) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot accept initiative: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Accept the initiative
      await InitiativesAPI.triageInitiative(initiativeId, {
        action: 'accept',
        accept_data: acceptData,
        reason: comment
      }, userId)
      
      // Send Teams notification if there's a comment
      if (comment?.trim()) {
        const message = `✅ Tu initiative ha sido **aceptado** y está ahora en el backlog.\n\n**Comentario del equipo:**\n${comment}`
        await sendTeamsNotification(initiativeId, message, 'status_update')
      }
      
      // Reload data
      await Promise.all([loadTriageInitiatives(), loadRoleInitiatives()])
      
      return true
    } catch (err) {
      console.error('Error accepting initiative:', err)
      setError('Error accepting initiative')
      return false
    }
  }, [getCurrentUser, loadTriageInitiatives, loadRoleInitiatives, sendTeamsNotification])

  const declineInitiative = useCallback(async (initiativeId: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot decline initiative: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Decline the initiative
      await InitiativesAPI.triageInitiative(initiativeId, {
        action: 'decline',
        reason
      }, userId)
      
      // Send Teams notification
      if (reason?.trim()) {
        const message = `❌ Tu initiative ha sido **rechazado**.\n\n**Razón:**\n${reason}\n\nSi crees que esto es un error, por favor contacta al equipo.`
        await sendTeamsNotification(initiativeId, message, 'status_update')
      }
      
      // Reload triage data
      await loadTriageInitiatives()
      
      return true
    } catch (err) {
      console.error('Error declining initiative:', err)
      setError('Error declining initiative')
      return false
    }
  }, [getCurrentUser, loadTriageInitiatives, sendTeamsNotification])

  const duplicateInitiative = useCallback(async (initiativeId: string, duplicateOfId: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot duplicate initiative: user ID not available')
        setError('User ID not available')
        return false
      }
      
      await InitiativesAPI.triageInitiative(initiativeId, {
        action: 'duplicate',
        duplicate_of_id: duplicateOfId,
        reason
      }, userId)
      
      // Reload triage data
      await loadTriageInitiatives()
      
      return true
    } catch (err) {
      console.error('Error marking as duplicate:', err)
      setError('Error marking as duplicate')
      return false
    }
  }, [getCurrentUser, loadTriageInitiatives])

  const snoozeInitiative = useCallback(async (initiativeId: string, snoozeUntil: string, reason?: string) => {
    try {
      const { userId } = getCurrentUser()
      
      if (!userId) {
        console.error('Cannot snooze initiative: user ID not available')
        setError('User ID not available')
        return false
      }
      
      // Snooze the initiative
      await InitiativesAPI.triageInitiative(initiativeId, {
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
      const message = `🕐 Tu initiative ha sido **pospuesto** hasta el **${snoozeDate}**.\n\n${reason ? `**Nota:** ${reason}\n\n` : ''}Volverá a aparecer en triage en esa fecha.`
      await sendTeamsNotification(initiativeId, message, 'info')
      
      // Reload triage data
      await loadTriageInitiatives()
      
      return true
    } catch (err) {
      console.error('Error snoozing initiative:', err)
      setError('Error snoozing initiative')
      return false
    }
  }, [getCurrentUser, loadTriageInitiatives, sendTeamsNotification])

  // Create new initiative
  const createInitiative = useCallback(async (initiativeData: Parameters<typeof InitiativesAPI.createInitiative>[1]) => {
    if (!currentOrg) {
      console.error('[useSupabaseData] No currentOrg, cannot create initiative')
      return
    }

    try {
      const { userId } = getCurrentUser()
      await InitiativesAPI.createInitiative(currentOrg.organization.id, {
        ...initiativeData,
        reporter_id: userId
      })
      
      // Reload triage data
      await loadTriageInitiatives()
      
      return true
    } catch (err) {
      console.error('Error creating initiative:', err)
      setError('Error creating initiative')
      return false
    }
  }, [getCurrentUser, loadTriageInitiatives, currentOrg])

  // Update initiative (for drag & drop and other updates)
  const updateInitiative = useCallback(async (initiativeId: string, updateData: Parameters<typeof InitiativesAPI.updateInitiative>[1]) => {
    try {
      const updatedInitiative = await InitiativesAPI.updateInitiative(initiativeId, updateData)
      console.log('[useSupabaseData] Initiative updated:', {
        id: updatedInitiative.id,
        key: updatedInitiative.key,
        assignee_id: updatedInitiative.assignee_id,
        assignee: updatedInitiative.assignee,
        changes: updateData
      });
      
      // Reload both triage and role data to reflect changes
      await Promise.all([loadTriageInitiatives(), loadRoleInitiatives()])
      
      return true
    } catch (err) {
      console.error('Error updating initiative:', err)
      setError('Error updating initiative')
      return false
    }
  }, [loadTriageInitiatives, loadRoleInitiatives])

  // Get filtered data based on role
  const getFilteredData = useCallback(() => {
    const { userId, businessUnitId } = getCurrentUser()
    
    let visibleBusinessUnits = businessUnits
    let visibleProjects = projects
    
    // Combine triage initiatives with role initiatives for complete list
    const allInitiatives = [...triageInitiatives, ...roleInitiatives]

    // Apply role-based filtering
    switch (activeRole) {
      case 'BU':
        // BU managers see their own business unit and projects that have initiatives in their BU
        visibleBusinessUnits = businessUnits.filter(bu => bu.id === businessUnitId)
        visibleProjects = projects.filter(project => 
          roleInitiatives.some(initiative => 
            initiative.project_id === project.id && initiative.business_unit_id === businessUnitId
          )
        )
        break
      case 'EMP':
        // Employees see business units and projects related to their initiatives
        const employeeBusinessUnitIds = new Set(roleInitiatives.map(initiative => initiative.business_unit_id).filter(Boolean))
        const employeeProjectIds = new Set(roleInitiatives.map(initiative => initiative.project_id).filter(Boolean))
        
        visibleBusinessUnits = businessUnits.filter(bu => employeeBusinessUnitIds.has(bu.id))
        visibleProjects = projects.filter(project => employeeProjectIds.has(project.id))
        break
      case 'SAP':
      case 'CEO':
        // SAP and CEO see everything (no filtering)
        console.log('[useSupabaseData] SAP/CEO role - showing all projects:', projects.length)
        console.log('[useSupabaseData] All initiatives (triage + role):', allInitiatives.length)
        break
    }

    return {
      businessUnits: visibleBusinessUnits,
      // Legacy alias
      initiatives: visibleBusinessUnits,
      projects: visibleProjects,
      triageInitiatives,
      roleInitiatives,
      // Legacy aliases
      triageIssues: triageInitiatives,
      roleIssues: roleInitiatives,
      allInitiatives,
      allIssues: allInitiatives, // Legacy alias
      triageCount: triageInitiatives.length
    }
  }, [activeRole, getCurrentUser, businessUnits, projects, triageInitiatives, roleInitiatives])

  return {
    // Data
    ...getFilteredData(),
    
    // State
    loading,
    error,
    activeRole,
    
    // Actions
    refreshData: loadData,
    
    // Triage actions (new names)
    acceptInitiative,
    declineInitiative,
    duplicateInitiative,
    snoozeInitiative,
    createInitiative,
    updateInitiative,
    
    // Legacy aliases for triage actions
    acceptIssue: acceptInitiative,
    declineIssue: declineInitiative,
    duplicateIssue: duplicateInitiative,
    snoozeIssue: snoozeInitiative,
    createIssue: createInitiative,
    updateIssue: updateInitiative,
    
    // Helpers
    getCurrentUser
  }
}
