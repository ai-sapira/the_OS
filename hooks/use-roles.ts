"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export type Role = "SAP" | "CEO" | "BU" | "EMP"

export interface Permission {
  id: string
  action: string
  resource: string
}

export interface SidebarItem {
  id: string
  label: string
  icon: string
  href?: string
  count?: number
  children?: SidebarItem[]
  roles: Role[]
  section: "global" | "workspace" | "context" | "footer"
}

// Permission matrix - defines what each role can do
const PERMISSIONS: Record<Role, string[]> = {
  SAP: [
    "view.triage",
    "view.issues",
    "view.projects",
    "view.all-departments",
    "view.initiatives",
    "view.roadmap",
    "view.metrics",
    "view.sapira-mode",
    "view.settings",
    "view.surveys",
    "action.triage.accept",
    "action.triage.decline", 
    "action.triage.duplicate",
    "action.triage.snooze",
    "action.create-issue",
    "action.create-survey",
    "action.view-survey-results",
    "filter.none", // No filters applied
  ],
  CEO: [
    "view.triage", // optional
    "view.issues",
    "view.projects",
    "view.all-departments",
    "view.initiatives",
    "view.roadmap",
    "view.metrics", 
    "view.surveys",
    "action.triage.accept", // optional
    "action.triage.decline", // optional
    "action.triage.duplicate", // optional
    "action.triage.snooze", // optional
    "action.create-issue",
    "action.create-survey",
    "action.view-survey-results",
    "filter.none", // No filters applied
  ],
  BU: [
    "view.triage", // optional
    "view.issues",
    "view.projects",
    "view.all-departments",
    "view.metrics",
    "view.surveys",
    "action.triage.accept", // optional
    "action.triage.decline", // optional
    "action.triage.duplicate", // optional
    "action.triage.snooze", // optional
    "action.create-issue",
    "action.create-survey", // Can create surveys for their BU
    "action.view-survey-results", // Can view results of their own surveys
    "filter.my-bu", // Filter to own BU
  ],
  EMP: [
    "view.issues",
    "view.me",
    "view.surveys", // Can view and respond to surveys
    "action.create-issue",
    "action.respond-survey", // Can respond to surveys
    "filter.mine", // Filter to own issues
  ],
}

// Sidebar structure with role-based visibility
export const SIDEBAR_STRUCTURE: SidebarItem[] = [
  // Global section
  {
    id: "triage",
    label: "Triage",
    icon: "Inbox",
    href: "/triage-new",
    count: 12,
    roles: ["SAP", "CEO", "BU"], // Optional for CEO/BU
    section: "global",
  },
  // Workspace section
  {
    id: "initiatives",
    label: "Business units",
    icon: "Target",
    href: "/initiatives",
    roles: ["SAP", "CEO"],
    section: "workspace",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "Users",
    href: "/projects",
    roles: ["SAP", "CEO", "BU"],
    section: "workspace",
  },
  {
    id: "issues",
    label: "Initiatives",
    icon: "Archive",
    href: "/issues",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "workspace",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: "Map",
    href: "/roadmap",
    roles: ["SAP", "CEO"],
    section: "workspace",
  },
  {
    id: "metrics",
    label: "Metrics",
    icon: "BarChart3",
    href: "/metrics",
    roles: ["SAP", "CEO", "BU"],
    section: "workspace",
  },
  // Context presets
  {
    id: "surveys",
    label: "Surveys",
    icon: "ClipboardList",
    href: "/surveys",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "context",
  },
  {
    id: "sapira-mode",
    label: "Sapira mode",
    icon: "Shield",
    href: "/sapira",
    roles: ["SAP"],
    section: "context",
  },
  {
    id: "me",
    label: "Me",
    icon: "User",
    href: "/me",
    roles: ["EMP"],
    section: "context",
  },
  {
    id: "my-sapira-relationship",
    label: "My Sapira Relationship",
    icon: "Handshake",
    href: "/my-sapira",
    roles: ["BU", "EMP", "CEO"],
    section: "context",
  },
  // Footer
  {
    id: "your-profile",
    label: "Gerardo Dueso",
    icon: "User",
    href: "/profile",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "footer",
  },
]

export function useRoles() {
  const [activeRole, setActiveRole] = useState<Role>("SAP")
  const [isInitialized, setIsInitialized] = useState(false)
  const searchParams = useSearchParams()

  // Initialize role from localStorage and URL params
  // DEMO MODE: Permite cambiar de rol y VER DATOS DIFERENTES
  // En producción, puedes bloquear esto y usar solo currentOrg.role
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check URL param first
    const roleParam = searchParams?.get("role") as Role
    if (roleParam && ["SAP", "CEO", "BU", "EMP"].includes(roleParam)) {
      setActiveRole(roleParam)
      localStorage.setItem("os.activeRole", roleParam)
      setIsInitialized(true)
      return
    }

    // Then check localStorage
    const storedRole = localStorage.getItem("os.activeRole") as Role
    if (storedRole && ["SAP", "CEO", "BU", "EMP"].includes(storedRole)) {
      setActiveRole(storedRole)
    }
    
    setIsInitialized(true)
  }, [searchParams])

  // Switch role and persist to localStorage
  // DEMO MODE: Cambiar rol cambia TANTO la UI como los DATOS que se ven
  // Para producción: Comentar switchRole o hacerlo read-only desde currentOrg.role
  const switchRole = (role: Role) => {
    setActiveRole(role)
    localStorage.setItem("os.activeRole", role)
  }

  // Check if user has permission
  const can = (permission: string): boolean => {
    return PERMISSIONS[activeRole]?.includes(permission) ?? false
  }

  // Check if user can view specific item
  const canView = (item: SidebarItem): boolean => {
    return item.roles.includes(activeRole)
  }

  // Get filtered sidebar items based on role
  const getVisibleSidebarItems = (): SidebarItem[] => {
    return SIDEBAR_STRUCTURE.filter(item => canView(item))
  }

  // Get role display name
  const getRoleLabel = (role: Role): string => {
    const labels: Record<Role, string> = {
      SAP: "Sapira",
      CEO: "CEO", 
      BU: "BU Manager",
      EMP: "Employee",
    }
    return labels[role]
  }

  // Get current filter preset based on role
  const getFilterPreset = (): string | null => {
    if (can("filter.mine")) return "mine"
    if (can("filter.my-bu")) return "my-bu"
    if (can("filter.none")) return null
    return "mine" // Default fallback
  }

  return {
    activeRole,
    switchRole,
    can,
    canView,
    getVisibleSidebarItems,
    getRoleLabel,
    getFilterPreset,
    isInitialized,
    allRoles: ["SAP", "CEO", "BU", "EMP"] as Role[],
  }
}
