"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleSwitcher } from "@/components/role-switcher"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Filter, Sun, Moon, LogOut, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useOrgAdmin } from "@/hooks/use-org-admin"
import Image from "next/image"

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [isDark, setIsDark] = useState(true)
  const { currentOrg, signOut, user, isSAPUser } = useAuth()
  const { isOrgAdmin } = useOrgAdmin()
  const router = useRouter()
  const [userData, setUserData] = useState<{ name?: string | null; first_name?: string | null; last_name?: string | null } | null>(null)

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

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // Force redirect to landing page and clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  const getUserName = () => {
    // Get user name from users table (first_name + last_name or name)
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`
    }
    if (userData?.name) {
      return userData.name
    }
    if (!user?.email) {
      return 'Usuario'
    }
    
    // Fallback: Extract name from email
    const namePart = user.email.split('@')[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Organization Logo and Name */}
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white border border-gray-200">
          {currentOrg?.organization.logo_url ? (
            <Image 
              src={currentOrg.organization.logo_url}
              alt={`${currentOrg.organization.name} Logo`}
              width={18} 
              height={18}
              className="object-contain"
              onError={(e) => {
                // Hide image on error, show initials instead
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : currentOrg?.organization.name ? (
            <div className="w-[18px] h-[18px] rounded flex items-center justify-center bg-gray-100 text-[10px] font-semibold text-gray-700">
              {currentOrg.organization.name.substring(0, 2).toUpperCase()}
            </div>
          ) : null}
          <span className="text-[11px] font-normal text-black">
            {currentOrg?.organization.name || 'Organización'}
          </span>
        </div>
        
        {/* RoleSwitcher only visible for SAP users (for demo purposes) */}
        {isSAPUser && <RoleSwitcher />}
        
        {actions}

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Filter className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
        </Button>

        {/* User Profile Name - MODO DEMO: Funciona con o sin autenticación */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {getUserName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
                onSelect={() => handleLogout()} 
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
