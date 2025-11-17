"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRoles, type SidebarItem, type Role } from "@/hooks/use-roles"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useAuth } from "@/lib/context/auth-context"
import { useOrgAdmin } from "@/hooks/use-org-admin"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Inbox,
  User,
  Archive,
  Users,
  Building,
  Target,
  Map,
  BarChart3,
  Shield,
  Crown,
  Building2,
  Plus,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Keyboard,
  HelpCircle,
  Circle,
  ClipboardList,
  Handshake,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  className?: string
  onOpenCommandPalette?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Inbox,
  User,
  Archive,
  Users,
  Building,
  Target,
  Map,
  BarChart3,
  Shield,
  Crown,
  Building2,
  Plus,
  Settings,
  Keyboard,
  HelpCircle,
  ClipboardList,
  Handshake,
}

export function Sidebar({ 
  className, 
  onOpenCommandPalette, 
  isCollapsed = false,
  onToggleCollapse 
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { getVisibleSidebarItems, canView, can, getFilterPreset, activeRole, getRoleLabel, allRoles } = useRoles()
  const { triageCount } = useSupabaseData()
  const { currentOrg, user, signOut } = useAuth()
  const { isOrgAdmin } = useOrgAdmin()
  const [expandedSections, setExpandedSections] = useState<string[]>(["projects"])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Role switching is no longer supported - roles are fixed from the database
  // This function is kept for compatibility but does nothing
  const handleRoleChange = async (newRole: Role) => {
    // Roles are fixed and cannot be changed
    // This is a legacy function that no longer has functionality
    console.warn('Role switching is no longer supported. Roles are fixed from the database.')
  }

  // Group items by section
  const sidebarItems = getVisibleSidebarItems()
  
  // Filter "users" item - remove it completely from sidebar
  const filteredSidebarItems = sidebarItems.filter(item => {
    if (item.id === "users") {
      return false // Remove users item from sidebar
    }
    return true
  })
  
  const globalItems = filteredSidebarItems.filter(item => item.section === "global")
  const workspaceItems = filteredSidebarItems.filter(item => item.section === "workspace")
  const contextItems = filteredSidebarItems.filter(item => item.section === "context")
  const footerItems = filteredSidebarItems.filter(item => item.section === "footer")



  const renderSidebarItem = (item: SidebarItem, isChild = false) => {
    const Icon = iconMap[item.icon] || Circle
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.id)

    // Base classes for all sidebar items with enhanced transitions
    const baseItemClasses = cn(
      "w-full justify-start h-8 px-2 relative group",
      "transition-all duration-200 ease-out",
      "hover:translate-x-0.5 hover:shadow-lg hover:z-10",
      "hover:scale-[1.02]",
      "hover:my-1",
      "active:scale-[0.98] active:transition-transform active:duration-75",
      isCollapsed ? "px-2" : "px-2",
      isChild && "ml-6 h-7 text-sm"
    )

    // Active state with enhanced styling
    const activeClasses = cn(
      "bg-sidebar-accent text-sidebar-accent-foreground",
      "shadow-sm border-l-2 border-primary",
      "font-medium"
    )

    // Hover state with smooth transitions
    const hoverClasses = cn(
      "text-sidebar-foreground",
      "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
      "hover:shadow-md hover:border-l-2 hover:border-primary/50",
      "border-l-2 border-transparent"
    )

    // Special handling for Triage with count
    if (item.id === "triage") {
      return (
        <Link key={item.id} href={item.href || "#"}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              baseItemClasses,
              isActive ? activeClasses : hoverClasses
            )}
          >
            <Icon className={cn(
              "h-4 w-4 mr-2 shrink-0 transition-transform duration-200",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left transition-all duration-200">{item.label}</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs transition-all duration-200 group-hover:scale-105">
                  {triageCount}
                </Badge>
              </>
            )}
          </Button>
        </Link>
      )
    }

    // Special handling for Your Profile - show user name with dropdown menu
    if (item.id === "your-profile") {
      // Extract user name from email
      const getUserName = () => {
        if (!user?.email) return 'Your Profile'
        
        // Extract name from email (e.g., javiergarcia@cosermo.com -> Javier García)
        const namePart = user.email.split('@')[0]
        
        // Handle specific cases
        if (namePart.toLowerCase() === 'javiergarcia') return 'Javier García'
        if (namePart.toLowerCase() === 'guillermo') return 'Guillermo'
        if (namePart.toLowerCase() === 'pablosenabre') return 'Pablo Senabre'
        
        // Generic formatting: capitalize first letter
        return namePart.charAt(0).toUpperCase() + namePart.slice(1)
      }

      const handleLogout = async () => {
        try {
          await signOut()
          window.location.href = '/'
        } catch (error) {
          console.error('Error during logout:', error)
          window.location.href = '/'
        }
      }

      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                baseItemClasses,
                isActive ? activeClasses : hoverClasses,
                "w-full"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 mr-2 shrink-0 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              {!isCollapsed && (
                <span className="flex-1 text-left transition-all duration-200">{getUserName()}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side={isCollapsed ? "right" : "left"}>
            {isOrgAdmin && (
              <>
                <DropdownMenuItem 
                  onSelect={() => router.push('/users')}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gestión de usuarios
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {user && (
              <DropdownMenuItem 
                onSelect={handleLogout} 
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Regular items
    if (item.href) {
      return (
        <Link key={item.id} href={item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              baseItemClasses,
              isActive ? activeClasses : hoverClasses
            )}
          >
            <Icon className={cn(
              "h-4 w-4 mr-2 shrink-0 transition-transform duration-200",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            {!isCollapsed && (
              <span className="flex-1 text-left transition-all duration-200">{item.label}</span>
            )}
          </Button>
        </Link>
      )
    }

    // Fallback for items without href
    return null
  }

  const renderSectionHeader = (title: string, isCollapsed: boolean) => {
    if (isCollapsed) return null
    
    return (
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2 transition-opacity duration-200">
        {title}
      </h3>
    )
  }

  // Get current filter info
  const filterPreset = getFilterPreset()
  const getFilterChip = () => {
    if (filterPreset === "mine") return "Filtered to: Me"
    if (filterPreset === "my-bu") return "Filtered to: My BU"
    return null
  }

  return (
    <div 
      className={cn(
        "flex h-screen flex-col transition-all duration-200 relative",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      style={{ background: 'var(--bg-app)' }}
    >
      {/* Logo - Above Role Selector */}
      {!isCollapsed && currentOrg?.organization && (
        <div className="flex h-[52px] items-center px-4 border-b border-border">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200">
            {currentOrg.organization.logo_url ? (
              <Image 
                src={currentOrg.organization.logo_url}
                alt={`${currentOrg.organization.name} Logo`}
                width={90} 
                height={28}
                className="object-contain"
                onError={(e) => {
                  // Hide image on error, show initials instead
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="h-7 flex items-center justify-center px-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                {currentOrg.organization.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Header - Más compacto y cohesivo */}
      <div className="flex h-12 items-center justify-between px-3 py-2">
        {!isCollapsed ? (
          <div className="flex items-center flex-1 ml-1">
            <Select value={activeRole} onValueChange={handleRoleChange} disabled={true}>
              <SelectTrigger className="border-none bg-transparent p-0 h-8 focus:ring-0 font-semibold text-sidebar-foreground hover:bg-gray-100 rounded-md px-2 flex items-center gap-2 justify-start transition-all duration-200 hover:shadow-sm active:scale-[0.98]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {allRoles.map((role) => {
                  const Icon = iconMap[role === "SAP" ? "Shield" : role === "CEO" ? "Crown" : role === "BU" ? "Building2" : "User"]
                  return (
                    <SelectItem key={role} value={role} className="transition-colors duration-150">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 transition-transform duration-200" />
                        <span>{getRoleLabel(role)}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            {(() => {
              const Icon = iconMap[activeRole === "SAP" ? "Shield" : activeRole === "CEO" ? "Crown" : activeRole === "BU" ? "Building2" : "User"]
              return <Icon className="h-4 w-4 transition-transform duration-200" />
            })()}
          </div>
        )}
        
        {/* Botones compactos al lado del rol */}
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110 hover:bg-sidebar-accent active:scale-95"
              onClick={onOpenCommandPalette}
              title="Buscar (⌘K)"
            >
              <Search className="h-3.5 w-3.5 transition-transform duration-200" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110 hover:bg-sidebar-accent active:scale-95"
              onClick={onToggleCollapse}
              title="Configuración"
            >
              <Settings className="h-3.5 w-3.5 transition-transform duration-200" />
            </Button>
          </div>
        )}
        
        {isCollapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110 hover:bg-sidebar-accent active:scale-95"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto pt-2">
        {/* Current filter indicator */}
        {!isCollapsed && getFilterChip() && (
          <div className="px-4 pb-3">
            <Badge variant="outline" className="text-xs">
              {getFilterChip()}
            </Badge>
          </div>
        )}

        {/* Global Section */}
        {globalItems.length > 0 && (
          <div className="px-4 pb-4">
            {renderSectionHeader("Global", isCollapsed)}
            <div className="space-y-1 group/item-list">
              {globalItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}

        {/* Workspace Section */}
        {workspaceItems.length > 0 && (
          <div className="px-4 pb-4">
            {renderSectionHeader("Workspace", isCollapsed)}
          <div className="space-y-1 group/item-list">
              {workspaceItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}

        {/* Context Presets Section */}
        {contextItems.length > 0 && (
        <div className="px-4 pb-4">
            {renderSectionHeader("Quick Access", isCollapsed)}
          <div className="space-y-1 group/item-list">
              {contextItems.map(item => renderSidebarItem(item))}
              </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {footerItems.length > 0 && (
        <div className="px-4 py-3">
          <div className="space-y-1 group/item-list">
            {footerItems.map(item => renderSidebarItem(item))}
          </div>
        </div>
      )}

    </div>
  )
}