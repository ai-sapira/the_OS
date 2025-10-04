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
    console.log('[AuthProvider] Loading organizations for user:', authUserId)
    
    try {
      // Use API route instead of direct Supabase query
      console.log('[AuthProvider] Calling API route...')
      
      const response = await fetch(`/api/user/organizations?userId=${authUserId}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const { data, error } = await response.json()
      
      console.log('[AuthProvider] API response:', { data, error })

      if (error) {
        console.error('[AuthProvider] API returned error:', error)
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        console.warn('[AuthProvider] No organizations found for user')
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        return
      }

      // Map the data from API response
      const orgs = (data || []).map((item: any) => ({
        organization: item.organizations as Organization,
        role: item.role as Role,
        initiative_id: item.initiative_id
      })).filter((org: any) => org.organization) // Filter out any without organization data

      console.log('[AuthProvider] Mapped organizations:', orgs)
      setUserOrgs(orgs)

      // Try to restore previously selected org from localStorage
      const savedOrgId = localStorage.getItem('sapira.currentOrg')
      const savedOrg = orgs.find(o => o.organization?.id === savedOrgId)

      if (savedOrg) {
        console.log('[AuthProvider] Restored saved org:', savedOrg.organization.name)
        setCurrentOrg(savedOrg)
      } else if (orgs.length === 1) {
        // Auto-select if user only has one organization
        console.log('[AuthProvider] Auto-selecting single org:', orgs[0].organization.name)
        setCurrentOrg(orgs[0])
        localStorage.setItem('sapira.currentOrg', orgs[0].organization.id)
      } else {
        console.log('[AuthProvider] Multiple orgs, waiting for user selection')
      }

    } catch (err) {
      console.error('[AuthProvider] Unexpected error loading organizations:', err)
      setUserOrgs([])
      setCurrentOrg(null)
    } finally {
      console.log('[AuthProvider] Setting loading to false')
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

