"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/hooks/use-roles'

interface Organization {
  id: string
  name: string
  slug: string
}

interface UserOrganization {
  organization: Organization
  role: Role
  initiative_id: string | null
}

interface AuthContextType {
  user: User | null
  currentOrg: UserOrganization | null
  userOrgs: UserOrganization[]
  loading: boolean
  isSAPUser: boolean // True if current user has SAP role in current org
  selectOrganization: (orgId: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentOrg, setCurrentOrg] = useState<UserOrganization | null>(null)
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)

  // Load user and their organizations
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserOrganizations(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserOrganizations(session.user.id)
        } else {
          setUserOrgs([])
          setCurrentOrg(null)
          setLoading(false)
          localStorage.removeItem('sapira.currentOrg')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserOrganizations = async (authUserId: string) => {
    try {
      // Note: user_organizations table may not be in the generated types yet
      // We use 'any' cast temporarily until we regenerate types
      const { data, error } = await supabase
        .from('user_organizations' as any)
        .select(`
          role,
          initiative_id,
          organization:organizations(id, name, slug)
        `)
        .eq('auth_user_id', authUserId)
        .eq('active', true)

      if (error) {
        console.error('Error loading organizations:', error)
        setLoading(false)
        return
      }

      const orgs = (data || []).map((item: any) => ({
        organization: item.organization as Organization,
        role: item.role as Role,
        initiative_id: item.initiative_id
      }))

      setUserOrgs(orgs)

      // Try to restore previously selected org from localStorage
      const savedOrgId = localStorage.getItem('sapira.currentOrg')
      const savedOrg = orgs.find(o => o.organization.id === savedOrgId)

      if (savedOrg) {
        setCurrentOrg(savedOrg)
      } else if (orgs.length === 1) {
        // Auto-select if user only has one organization
        setCurrentOrg(orgs[0])
        localStorage.setItem('sapira.currentOrg', orgs[0].organization.id)
      }
      // If multiple orgs and no saved org, user will need to select one

    } catch (err) {
      console.error('Unexpected error loading organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectOrganization = (orgId: string) => {
    const org = userOrgs.find(o => o.organization.id === orgId)
    if (org) {
      setCurrentOrg(org)
      localStorage.setItem('sapira.currentOrg', orgId)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setCurrentOrg(null)
    setUserOrgs([])
    localStorage.removeItem('sapira.currentOrg')
  }

  // Check if current user has SAP role in current organization
  const isSAPUser = currentOrg?.role === 'SAP'

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOrg,
        userOrgs,
        loading,
        isSAPUser,
        selectOrganization,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

