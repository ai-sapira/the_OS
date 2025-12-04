"use client"

import { createContext, useContext, useState, ReactNode } from "react"

// Types
export interface BusinessUnit {
  id: string
  name: string
  managerId?: string
  managerEmail?: string
  managerName?: string
}

export interface InvitedPerson {
  id: string
  email: string
  name?: string
  role: "executive" | "head_of_bu" | "employee"
  businessUnitId?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  businessUnitId: string
}

export interface OnboardingState {
  // Organization
  organization: {
    name: string
    logo?: string
  }
  
  // Business Units
  businessUnits: BusinessUnit[]
  
  // Invited People (pool for assignments)
  invitedPeople: InvitedPerson[]
  
  // Projects
  projects: Project[]
  
  // Integration responsible
  integrationResponsibleId?: string
  
  // Extension settings
  extensionSettings: {
    installed: boolean
    trackClicks: boolean
    trackNavigation: boolean
    trackFocusTime: boolean
    trackMeetings: boolean
    trackFormInputs: boolean
  }
}

interface OnboardingContextType {
  state: OnboardingState
  
  // Organization actions
  setOrganizationName: (name: string) => void
  setOrganizationLogo: (logo: string) => void
  
  // Business Unit actions
  addBusinessUnit: (name: string) => void
  removeBusinessUnit: (id: string) => void
  assignManagerToBU: (buId: string, personId: string) => void
  addManagerToBU: (buId: string, person: Omit<InvitedPerson, "id">) => void
  
  // People actions
  addInvitedPerson: (person: Omit<InvitedPerson, "id">) => void
  removeInvitedPerson: (id: string) => void
  updateInvitedPerson: (id: string, updates: Partial<InvitedPerson>) => void
  
  // Project actions
  addProject: (project: Omit<Project, "id">) => void
  removeProject: (id: string) => void
  
  // Integration actions
  setIntegrationResponsible: (personId: string) => void
  
  // Extension actions
  setExtensionInstalled: (installed: boolean) => void
  updateExtensionSettings: (settings: Partial<OnboardingState["extensionSettings"]>) => void
  
  // Helpers
  getPersonById: (id: string) => InvitedPerson | undefined
  getBusinessUnitById: (id: string) => BusinessUnit | undefined
  getPeopleByRole: (role: InvitedPerson["role"]) => InvitedPerson[]
  getProjectsByBU: (buId: string) => Project[]
}

const initialState: OnboardingState = {
  organization: {
    name: "",
    logo: undefined,
  },
  businessUnits: [],
  invitedPeople: [],
  projects: [],
  integrationResponsibleId: undefined,
  extensionSettings: {
    installed: false,
    trackClicks: true,
    trackNavigation: true,
    trackFocusTime: true,
    trackMeetings: false,
    trackFormInputs: false,
  },
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState)

  // Organization actions
  const setOrganizationName = (name: string) => {
    setState(prev => ({
      ...prev,
      organization: { ...prev.organization, name }
    }))
  }

  const setOrganizationLogo = (logo: string) => {
    setState(prev => ({
      ...prev,
      organization: { ...prev.organization, logo }
    }))
  }

  // Business Unit actions
  const addBusinessUnit = (name: string) => {
    const newBU: BusinessUnit = {
      id: generateId(),
      name,
    }
    setState(prev => ({
      ...prev,
      businessUnits: [...prev.businessUnits, newBU]
    }))
  }

  const removeBusinessUnit = (id: string) => {
    setState(prev => ({
      ...prev,
      businessUnits: prev.businessUnits.filter(bu => bu.id !== id),
      // Also remove projects associated with this BU
      projects: prev.projects.filter(p => p.businessUnitId !== id),
      // Clear manager assignment from invited people
      invitedPeople: prev.invitedPeople.map(p => 
        p.businessUnitId === id ? { ...p, businessUnitId: undefined } : p
      )
    }))
  }

  const assignManagerToBU = (buId: string, personId: string) => {
    const person = state.invitedPeople.find(p => p.id === personId)
    setState(prev => ({
      ...prev,
      businessUnits: prev.businessUnits.map(bu =>
        bu.id === buId
          ? { 
              ...bu, 
              managerId: personId, 
              managerEmail: person?.email,
              managerName: person?.name 
            }
          : bu
      )
    }))
  }

  // Add person and assign as manager in one atomic operation
  const addManagerToBU = (buId: string, person: Omit<InvitedPerson, "id">) => {
    const personId = generateId()
    const newPerson: InvitedPerson = {
      id: personId,
      ...person,
      role: "head_of_bu",
      businessUnitId: buId,
    }
    
    setState(prev => ({
      ...prev,
      invitedPeople: [...prev.invitedPeople, newPerson],
      businessUnits: prev.businessUnits.map(bu =>
        bu.id === buId
          ? { 
              ...bu, 
              managerId: personId, 
              managerEmail: newPerson.email,
              managerName: newPerson.name 
            }
          : bu
      )
    }))
  }

  // People actions
  const addInvitedPerson = (person: Omit<InvitedPerson, "id">) => {
    const newPerson: InvitedPerson = {
      id: generateId(),
      ...person,
    }
    setState(prev => ({
      ...prev,
      invitedPeople: [...prev.invitedPeople, newPerson]
    }))
  }

  const removeInvitedPerson = (id: string) => {
    setState(prev => ({
      ...prev,
      invitedPeople: prev.invitedPeople.filter(p => p.id !== id),
      // Clear from BU manager if assigned
      businessUnits: prev.businessUnits.map(bu =>
        bu.managerId === id ? { ...bu, managerId: undefined, managerEmail: undefined, managerName: undefined } : bu
      ),
      // Clear integration responsible if assigned
      integrationResponsibleId: prev.integrationResponsibleId === id ? undefined : prev.integrationResponsibleId
    }))
  }

  const updateInvitedPerson = (id: string, updates: Partial<InvitedPerson>) => {
    setState(prev => ({
      ...prev,
      invitedPeople: prev.invitedPeople.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  }

  // Project actions
  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      id: generateId(),
      ...project,
    }
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const removeProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }))
  }

  // Integration actions
  const setIntegrationResponsible = (personId: string) => {
    setState(prev => ({
      ...prev,
      integrationResponsibleId: personId
    }))
  }

  // Extension actions
  const setExtensionInstalled = (installed: boolean) => {
    setState(prev => ({
      ...prev,
      extensionSettings: { ...prev.extensionSettings, installed }
    }))
  }

  const updateExtensionSettings = (settings: Partial<OnboardingState["extensionSettings"]>) => {
    setState(prev => ({
      ...prev,
      extensionSettings: { ...prev.extensionSettings, ...settings }
    }))
  }

  // Helpers
  const getPersonById = (id: string) => state.invitedPeople.find(p => p.id === id)
  const getBusinessUnitById = (id: string) => state.businessUnits.find(bu => bu.id === id)
  const getPeopleByRole = (role: InvitedPerson["role"]) => state.invitedPeople.filter(p => p.role === role)
  const getProjectsByBU = (buId: string) => state.projects.filter(p => p.businessUnitId === buId)

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setOrganizationName,
        setOrganizationLogo,
        addBusinessUnit,
        removeBusinessUnit,
        assignManagerToBU,
        addManagerToBU,
        addInvitedPerson,
        removeInvitedPerson,
        updateInvitedPerson,
        addProject,
        removeProject,
        setIntegrationResponsible,
        setExtensionInstalled,
        updateExtensionSettings,
        getPersonById,
        getBusinessUnitById,
        getPeopleByRole,
        getProjectsByBU,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider")
  }
  return context
}

