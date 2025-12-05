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
import { useState, useEffect, useMemo } from "react"
import { FDEContactModal } from "@/components/fde-contact-modal"
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
  CreditCard,
  MessageSquare,
  Calendar,
  Info,
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
  CreditCard,
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
  const [userData, setUserData] = useState<{ name?: string | null } | null>(null)
  const [fdeData, setFdeData] = useState<{
    name?: string
    email?: string
    avatar_url?: string
    user_id?: string
  } | null>(null)
  const [fdeExpanded, setFdeExpanded] = useState(false)
  const [fdeContactOpen, setFdeContactOpen] = useState(false)

  // Get full FDE contact info from organization settings
  const fdeFullData = useMemo(() => {
    const organizationSettings = (currentOrg?.organization?.settings as Record<string, any> | undefined) ?? {}
    const sapiraContact = organizationSettings.sapira_contact as {
      name?: string
      email?: string
      role?: string
      calendly_url?: string
      avatar_url?: string
      user_id?: string
      bio?: string
      location?: string
      phone?: string
      skills?: string[]
    } | undefined

    if (!sapiraContact && !fdeData) return null

    return {
      name: sapiraContact?.name || fdeData?.name || 'Sapira Team',
      email: sapiraContact?.email || fdeData?.email || 'support@sapira.ai',
      role: sapiraContact?.role || 'Forward Deploy Engineer',
      avatar_url: sapiraContact?.avatar_url || fdeData?.avatar_url || null,
      bio: sapiraContact?.bio || 'Tu FDE asignado, aquí para ayudarte a sacar el máximo partido a Sapira.',
      location: sapiraContact?.location || 'Madrid, Spain',
      phone: sapiraContact?.phone || null,
      skills: sapiraContact?.skills || ['Automatización', 'AI/ML', 'Optimización de Procesos', 'Integración'],
      calendly_url: sapiraContact?.calendly_url || null,
      isActive: true, // Could be dynamic based on availability
    }
  }, [currentOrg?.organization?.settings, fdeData])

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
          .select('name')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        
        setUserData(data ? { name: data.name } : null)
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
          .select('id, auth_user_id, email, name, avatar_url')
          .eq('email', 'adolfo@sapira.ai')
          .maybeSingle()
        
        if (data) {
          setFdeData({
            name: data.name || 'Adolfo',
            email: data.email || 'adolfo@sapira.ai',
            avatar_url: data.avatar_url || undefined,
            user_id: data.auth_user_id || data.id,
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
  
  // Get sections visibility from organization settings (default all visible)
  const sectionsVisibility = currentOrg?.organization?.settings?.sections_visibility as {
    discovery?: boolean
    workspace?: boolean
    deploy?: boolean
  } | undefined
  
  const homeItems = filteredSidebarItems.filter(item => item.section === "home")
  // Filter sections based on organization settings
  const globalItems = sectionsVisibility?.discovery !== false 
    ? filteredSidebarItems.filter(item => item.section === "global")
    : []
  const workspaceItems = sectionsVisibility?.workspace !== false
    ? filteredSidebarItems.filter(item => item.section === "workspace")
    : []
  const deployItems = sectionsVisibility?.deploy !== false
    ? filteredSidebarItems.filter(item => item.section === "deploy")
    : []
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
      // Get user name from users table
      const getUserName = () => {
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
      
      {/* Spacer after logo */}
      <div className="h-2" />

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
        {/* FDE Section - Expandable with same sidebar aesthetic */}
        {!isCollapsed && fdeFullData && (
          <div className="space-y-1">
            {/* FDE Header - Main clickable row */}
            <Button
              variant="ghost"
              onClick={() => setFdeExpanded(!fdeExpanded)}
              className={cn(
                "w-full justify-start h-8 px-2 relative group",
                "transition-all duration-200 ease-out",
                "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                "text-sidebar-foreground",
                "border-l-2 border-transparent",
                "hover:border-l-2 hover:border-primary/50",
                fdeExpanded && "bg-sidebar-accent/50"
              )}
            >
              {/* FDE Badge */}
              <span className="shrink-0 mr-2 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded">
                FDE
              </span>
              
              {/* Name with status indicator */}
              <span className="flex-1 text-left text-sm truncate flex items-center gap-1.5">
                {fdeFullData.name}
                <span 
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full shrink-0",
                    fdeFullData.isActive ? "bg-emerald-500" : "bg-gray-400"
                  )}
                />
              </span>
              
              <div className="flex items-center gap-0.5">
                {/* Info button - opens contact modal */}
                <div
                  role="button"
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-sidebar-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFdeContactOpen(true)
                  }}
                >
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                
                {/* Chevron indicator */}
                <ChevronDown 
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-200",
                    fdeExpanded && "rotate-180"
                  )}
                />
              </div>
            </Button>
            
            {/* Expanded dropdown content - Child items */}
            {fdeExpanded && (
              <div className="space-y-0.5">
                {/* Chat link */}
                <Link href="/fde/chat">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-7 px-2 ml-6 text-sm",
                      "transition-all duration-200 ease-out",
                      "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                      "text-sidebar-foreground",
                      pathname === "/fde/chat" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </Link>
                
                {/* Meetings link */}
                <Link href="/meetings">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-7 px-2 ml-6 text-sm",
                      "transition-all duration-200 ease-out",
                      "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                      "text-sidebar-foreground",
                      pathname === "/meetings" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Meetings
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* FDE Contact Modal */}
        {fdeFullData && (
          <FDEContactModal
            open={fdeContactOpen}
            onOpenChange={setFdeContactOpen}
            fdeData={fdeFullData}
            onOpenChat={() => router.push('/fde/chat')}
            onOpenCalendly={() => {
              if (fdeFullData.calendly_url) {
                window.open(fdeFullData.calendly_url, '_blank')
              }
            }}
          />
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