"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRoles, type SidebarItem, type Role } from "@/hooks/use-roles"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useAuth } from "@/lib/context/auth-context"
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
  const { getVisibleSidebarItems, canView, can, getFilterPreset, activeRole, switchRole, getRoleLabel, allRoles } = useRoles()
  const { triageCount } = useSupabaseData()
  const { currentOrg, user } = useAuth()
  const [expandedSections, setExpandedSections] = useState<string[]>(["projects"])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleRoleChange = async (newRole: Role) => {
    setIsRefreshing(true)
    
    // Fade out effect
    const appElement = document.querySelector('body')
    if (appElement) {
      appElement.style.transition = 'opacity 300ms ease-out'
      appElement.style.opacity = '0.7'
    }
    
    // Wait for fade effect
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Switch role
    switchRole(newRole)
    
    // Wait a bit more for state updates
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Fade back in
    if (appElement) {
      appElement.style.opacity = '1'
      setTimeout(() => {
        appElement.style.transition = ''
        setIsRefreshing(false)
      }, 300)
    }
  }

  // Group items by section
  const sidebarItems = getVisibleSidebarItems()
  const globalItems = sidebarItems.filter(item => item.section === "global")
  const workspaceItems = sidebarItems.filter(item => item.section === "workspace")
  const contextItems = sidebarItems.filter(item => item.section === "context")
  const footerItems = sidebarItems.filter(item => item.section === "footer")



  const renderSidebarItem = (item: SidebarItem, isChild = false) => {
    const Icon = iconMap[item.icon] || Circle
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.id)


    // Special handling for Triage with count
    if (item.id === "triage") {
      return (
        <Link key={item.id} href={item.href || "#"}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-8 px-2",
              isCollapsed ? "px-2" : "px-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 mr-2 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {triageCount}
                </Badge>
              </>
            )}
          </Button>
        </Link>
      )
    }

    // Special handling for Your Profile - show user name only
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

      return (
        <Link key={item.id} href={item.href || "#"}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-8 px-2",
              isCollapsed ? "px-2" : "px-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 mr-2 shrink-0" />
            {!isCollapsed && (
              <span className="flex-1 text-left">{getUserName()}</span>
            )}
          </Button>
        </Link>
      )
    }

    // Regular items
    if (item.href) {
      return (
        <Link key={item.id} href={item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-8 px-2",
              isCollapsed ? "px-2" : "px-2",
              isChild && "ml-6 h-7 text-sm",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 mr-2 shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
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
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
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
      {/* Loading overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Switching role...
          </div>
        </div>
      )}
      {/* Logo - Above Role Selector */}
      {!isCollapsed && currentOrg?.organization.slug && (
        <div className="flex h-[52px] items-center px-4 border-b border-border">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200">
            <Image 
              src={`/logos/${currentOrg.organization.slug}.jpg`}
              alt={`${currentOrg.organization.name} Logo`}
              width={90} 
              height={28}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-logo.svg'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Header - Más compacto y cohesivo */}
      <div className="flex h-12 items-center justify-between px-3 py-2">
        {!isCollapsed ? (
          <div className="flex items-center flex-1 ml-1">
            <Select value={activeRole} onValueChange={handleRoleChange} disabled={isRefreshing}>
              <SelectTrigger className="border-none bg-transparent p-0 h-8 focus:ring-0 font-semibold text-sidebar-foreground hover:bg-gray-100 rounded-md px-2 flex items-center gap-2 justify-start">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {allRoles.map((role) => {
                  const Icon = iconMap[role === "SAP" ? "Shield" : role === "CEO" ? "Crown" : role === "BU" ? "Building2" : "User"]
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
        ) : (
          <div className="flex items-center justify-center w-full">
            {(() => {
              const Icon = iconMap[activeRole === "SAP" ? "Shield" : activeRole === "CEO" ? "Crown" : activeRole === "BU" ? "Building2" : "User"]
              return <Icon className="h-4 w-4" />
            })()}
          </div>
        )}
        
        {/* Botones compactos al lado del rol */}
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={onOpenCommandPalette}
              title="Buscar (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={onToggleCollapse}
              title="Configuración"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        
        {isCollapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-3.5 w-3.5" />
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
            <div className="space-y-1">
              {globalItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}

        {/* Workspace Section */}
        {workspaceItems.length > 0 && (
          <div className="px-4 pb-4">
            {renderSectionHeader("Workspace", isCollapsed)}
          <div className="space-y-1">
              {workspaceItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}

        {/* Context Presets Section */}
        {contextItems.length > 0 && (
        <div className="px-4 pb-4">
            {renderSectionHeader("Quick Access", isCollapsed)}
          <div className="space-y-1">
              {contextItems.map(item => renderSidebarItem(item))}
              </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {footerItems.length > 0 && (
        <div className="px-4 py-3">
          <div className="space-y-1">
            {footerItems.map(item => renderSidebarItem(item))}
          </div>
        </div>
      )}
    </div>
  )
}