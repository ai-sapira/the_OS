"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRoles } from "@/hooks/use-roles"
import { useAuth } from "@/lib/context/auth-context"
import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos de perfiles Sapira
export type SapiraProfile = 'FDE' | 'ADVISORY_LEAD' | 'ACCOUNT_MANAGER' | null

// Helper function to get Sapira profile label (exported for use in other components)
export function getSapiraProfileLabel(profile: SapiraProfile | string | null | undefined): string {
  if (!profile) return "Sapira"
  const labels: Record<string, string> = {
    'FDE': 'FDE',
    'ADVISORY_LEAD': 'Advisory Lead',
    'ACCOUNT_MANAGER': 'Account Manager',
  }
  return labels[profile] || profile
}

// Todos los perfiles disponibles
const SAPIRA_PROFILES: SapiraProfile[] = ['FDE', 'ADVISORY_LEAD', 'ACCOUNT_MANAGER', null]

export function RoleSwitcher() {
  const { activeProfile, isInitialized } = useRoles()
  const { currentOrg } = useAuth()

  if (!isInitialized) {
    return (
      <Badge variant="outline" className="h-8 px-3 animate-pulse">
        <div className="h-4 w-16 bg-muted rounded"></div>
      </Badge>
    )
  }

  // El perfil viene directamente de user_organizations.sapira_role_type (asignado)
  const currentProfile = activeProfile || currentOrg?.sapira_role_type || null
  const displayLabel = getSapiraProfileLabel(currentProfile)

  // Solo mostrar badge con el perfil asignado (no se puede cambiar)
  return (
    <Badge 
      variant="outline" 
      className="bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800 h-8 px-3"
    >
      <Shield className="h-3 w-3 mr-1.5" />
      {displayLabel}
    </Badge>
  )
}
