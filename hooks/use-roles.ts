"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"

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
  section: "home" | "global" | "workspace" | "deploy" | "context" | "footer"
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
  // Home section (outside of other sections)
  {
    id: "home",
    label: "Home",
    icon: "LayoutDashboard",
    href: "/home",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "home",
  },
  // Discovery section (formerly Global)
  {
    id: "insights",
    label: "Insights",
    icon: "TrendingUp",
    href: "/insights",
    roles: ["SAP", "CEO", "BU"],
    section: "global",
  },
  {
    id: "user-monitoring",
    label: "User monitoring",
    icon: "Globe",
    href: "/user-monitoring",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "global",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "Plug",
    href: "/integrations",
    roles: ["SAP", "CEO", "BU"],
    section: "global",
  },
  {
    id: "surveys",
    label: "Surveys",
    icon: "ClipboardList",
    href: "/surveys",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "global",
  },
  // Workspace section
  {
    id: "triage",
    label: "Triage",
    icon: "Inbox",
    href: "/triage-new",
    count: 12,
    roles: ["SAP", "CEO", "BU"], // Optional for CEO/BU
    section: "workspace",
  },
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
  // Deploy section
  {
    id: "metrics",
    label: "Metrics",
    icon: "BarChart3",
    href: "/metrics",
    roles: ["SAP", "CEO", "BU"],
    section: "deploy",
  },
  {
    id: "evals",
    label: "Evals",
    icon: "CheckCircle2",
    href: "/evals",
    roles: ["SAP", "CEO", "BU"],
    section: "deploy",
  },
  // Footer
  {
    id: "my-sapira-relationship",
    label: "My Sapira",
    icon: "Handshake",
    href: "/my-sapira",
    roles: ["BU", "EMP", "CEO"],
    section: "footer",
  },
  {
    id: "your-profile",
    label: "Your Profile",
    icon: "User",
    href: "/profile",
    roles: ["SAP", "CEO", "BU", "EMP"],
    section: "footer",
  },
  // Org Admin section (visible to org admins only)
  {
    id: "users",
    label: "Gestión de usuarios",
    icon: "Users",
    href: "/users",
    roles: ["SAP", "CEO"], // Will be filtered by is_org_admin check
    section: "workspace",
  },
]

// Import SapiraProfile type from role-switcher
export type SapiraProfile = 'FDE' | 'ADVISORY_LEAD' | 'ACCOUNT_MANAGER' | null

export function useRoles() {
  const [isInitialized, setIsInitialized] = useState(false)
  const searchParams = useSearchParams()
  
  // Get auth context - we need this to check if user is SAP and get their real role
  const { currentOrg, isSAPUser } = useAuth()

  // For SAP users: role is always SAP, profile comes from user_organizations.sapira_role_type
  // For non-SAP users: use their real role
  const activeRole: Role = isSAPUser ? 'SAP' : (currentOrg?.role || 'EMP')
  
  // Active profile is always the assigned one from user_organizations (no switching)
  const activeProfile: SapiraProfile = isSAPUser && currentOrg 
    ? (currentOrg.sapira_role_type || null)
    : null

  // Initialize
  useEffect(() => {
    setIsInitialized(true)
  }, [currentOrg])

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
    activeProfile, // For SAP users: assigned profile from user_organizations.sapira_role_type
    can,
    canView,
    getVisibleSidebarItems,
    getRoleLabel,
    getFilterPreset,
    isInitialized,
    isSAPUser, // Expose whether current user is SAP
    allRoles: ["SAP", "CEO", "BU", "EMP"] as Role[],
  }
}
