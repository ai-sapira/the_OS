"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  LayoutDashboard,
  TrendingUp,
  Globe,
  Plug,
  CheckCircle2,
  Server,
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
  LayoutDashboard,
  TrendingUp,
  Globe,
  Plug,
  CheckCircle2,
  Server,
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
  const [userData, setUserData] = useState<{ name?: string | null; first_name?: string | null; last_name?: string | null } | null>(null)
  const [fdeData, setFdeData] = useState<{
    name?: string
    email?: string
    avatar_url?: string
    user_id?: string
  } | null>(null)

  // Load user data from users table
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setUserData(null)
        return
      }

      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data } = await supabase
          .from('users')
          .select('name, first_name, last_name')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        
        setUserData(data)
      } catch (error) {
        console.error('Error loading user data:', error)
        setUserData(null)
      }
    }

    loadUserData()
  }, [user?.id])

  // Load FDE data from adolfo@sapira.ai user
  useEffect(() => {
    const loadFdeData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data } = await supabase
          .from('users')
          .select('id, auth_user_id, email, name, first_name, last_name, avatar_url')
          .eq('email', 'adolfo@sapira.ai')
          .maybeSingle()
        
        if (data) {
          const userData = data as {
            id: string
            auth_user_id?: string | null
            email?: string | null
            name?: string | null
            first_name?: string | null
            last_name?: string | null
            avatar_url?: string | null
          }
          
          const fullName = userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.name || 'Adolfo'
          
          setFdeData({
            name: fullName,
            email: userData.email || 'adolfo@sapira.ai',
            avatar_url: userData.avatar_url || undefined,
            user_id: userData.auth_user_id || userData.id,
          })
        } else {
          setFdeData(null)
        }
      } catch (error) {
        console.error('Error loading FDE data:', error)
        setFdeData(null)
      }
    }

    loadFdeData()
  }, [])

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
  
  const homeItems = filteredSidebarItems.filter(item => item.section === "home")
  const globalItems = filteredSidebarItems.filter(item => item.section === "global")
  const workspaceItems = filteredSidebarItems.filter(item => item.section === "workspace")
  const deployItems = filteredSidebarItems.filter(item => item.section === "deploy")
  const footerItems = filteredSidebarItems.filter(item => item.section === "footer")
  
  // Separate My Sapira and Your Profile from other footer items
  const mySapiraItem = footerItems.find(item => item.id === "my-sapira-relationship")
  const yourProfileItem = footerItems.find(item => item.id === "your-profile")
  const otherFooterItems = footerItems.filter(item => 
    item.id !== "my-sapira-relationship" && item.id !== "your-profile"
  )



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

    // Special handling for Home with count
    if (item.id === "home") {
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
                <Badge variant="secondary" className="h-5 px-1.5 text-xs transition-all duration-200 group-hover:scale-105 bg-red-500 text-white border-red-600">
                  1
                </Badge>
              </>
            )}
          </Button>
        </Link>
      )
    }

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
      // Get user name from users table (first_name + last_name or name)
      const getUserName = () => {
        if (userData?.first_name && userData?.last_name) {
          return `${userData.first_name} ${userData.last_name}`
        }
        if (userData?.name) {
          return userData.name
        }
        if (!user?.email) return 'Your Profile'
        
        // Fallback: Extract name from email
        const namePart = user.email.split('@')[0]
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
          <div className="flex items-center justify-center w-full max-w-[200px] h-8 px-3 py-1 rounded-md bg-white border border-gray-200">
            {currentOrg.organization.logo_url ? (
              <div className="relative w-full h-full max-h-6 flex items-center justify-center">
                <Image 
                  src={currentOrg.organization.logo_url}
                  alt={`${currentOrg.organization.name} Logo`}
                  fill
                  sizes="(max-width: 200px) 200px, 200px"
                  className="object-contain object-center"
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    // Hide image on error, show initials instead
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="h-6 flex items-center justify-center px-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
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

        {/* Home Section */}
        {homeItems.length > 0 && (
          <div className="px-4 pb-4">
            <div className="space-y-1 group/item-list">
              {homeItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}

        {/* Discovery Section */}
        {globalItems.length > 0 && (
          <div className="px-4 pb-4">
            {renderSectionHeader("Discovery", isCollapsed)}
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

        {/* Deploy Section */}
        {deployItems.length > 0 && (
          <div className="px-4 pb-4">
            {renderSectionHeader("Deploy", isCollapsed)}
            <div className="space-y-1 group/item-list">
              {deployItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 space-y-2 border-t border-border">
        {/* My Sapira Card - Separated from profile */}
        {mySapiraItem && !isCollapsed && fdeData && (
          <Link href={mySapiraItem.href || "#"} className="mb-3 block">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-auto p-2.5 rounded-lg border border-border bg-transparent hover:bg-sidebar-accent/50 transition-colors",
                "flex items-center gap-2.5 justify-start",
                pathname === mySapiraItem.href && "bg-sidebar-accent/50"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {fdeData.avatar_url ? (
                  <AvatarImage src={fdeData.avatar_url} alt={fdeData.name || "Adolfo Güell"} />
                ) : null}
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                  {(fdeData.name || "Adolfo Güell")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join("") || "AG"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-xs font-medium text-sidebar-foreground">
                    {fdeData.name || "Adolfo Güell"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    FDE
                  </div>
                </div>
                <div className="text-[10px] font-medium text-sidebar-foreground shrink-0">
                  Contactar
                </div>
              </div>
            </Button>
          </Link>
        )}
        
        {/* Your Profile - Separated from My Sapira */}
        {yourProfileItem && (
          <div className="pt-2 border-t border-border">
            {renderSidebarItem(yourProfileItem)}
          </div>
        )}
        
        {/* Other Footer Items */}
        {otherFooterItems.length > 0 && (
          <div className="space-y-1 group/item-list">
            {otherFooterItems.map(item => renderSidebarItem(item))}
          </div>
        )}
      </div>

    </div>
  )
}