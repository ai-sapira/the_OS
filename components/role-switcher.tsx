"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRoles, type Role } from "@/hooks/use-roles"
import { Shield, Crown, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"

const roleIcons: Record<Role, React.ComponentType<any>> = {
  SAP: Shield,
  CEO: Crown,
  BU: Building2,
  EMP: User,
}

const roleColors: Record<Role, string> = {
  SAP: "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800",
  CEO: "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",
  BU: "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
  EMP: "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
}

export function RoleSwitcher() {
  const { activeRole, switchRole, getRoleLabel, allRoles, isInitialized } = useRoles()

  if (!isInitialized) {
    return (
      <Badge variant="outline" className="h-8 px-3 animate-pulse">
        <div className="h-4 w-16 bg-muted rounded"></div>
      </Badge>
    )
  }

  const IconComponent = roleIcons[activeRole]

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={cn("h-8 px-3", roleColors[activeRole])}
      >
        <IconComponent className="h-3 w-3 mr-1.5" />
        Viewing as {getRoleLabel(activeRole)}
      </Badge>
      
      <Select value={activeRole} onValueChange={switchRole}>
        <SelectTrigger className="w-auto h-8 border-none bg-transparent p-0 focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {allRoles.map((role) => {
            const Icon = roleIcons[role]
            return (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{getRoleLabel(role)}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
