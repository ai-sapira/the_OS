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
      // First get user_organizations
      console.log('[AuthProvider] ABOUT TO QUERY user_organizations...')
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      )
      
      const queryPromise = supabase
        .from('user_organizations' as any)
        .select('role, initiative_id, organization_id')
        .eq('auth_user_id', authUserId)
        .eq('active', true)
      
      console.log('[AuthProvider] Query created, waiting for response...')
      
      const { data: userOrgsData, error: userOrgsError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any

      console.log('[AuthProvider] User orgs query result:', { userOrgsData, error: userOrgsError })

      if (userOrgsError) {
        console.error('[AuthProvider] Error loading user_organizations:', userOrgsError)
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        return
      }

      if (!userOrgsData || userOrgsData.length === 0) {
        console.warn('[AuthProvider] No organizations found for user')
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        return
      }

      // Then get organizations details
      const orgIds = userOrgsData.map((uo: any) => uo.organization_id)
      console.log('[AuthProvider] ABOUT TO QUERY organizations for IDs:', orgIds)
      
      const orgsQueryPromise = supabase
        .from('organizations' as any)
        .select('id, name, slug')
        .in('id', orgIds)
      
      console.log('[AuthProvider] Organizations query created, waiting...')
      
      const { data: orgsData, error: orgsError } = await Promise.race([
        orgsQueryPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Organizations query timeout after 5s')), 5000)
        )
      ]) as any

      console.log('[AuthProvider] Organizations query result:', { orgsData, error: orgsError })

      if (orgsError) {
        console.error('[AuthProvider] Error loading organizations:', orgsError)
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        return
      }

      // Combine the data
      const data = userOrgsData.map((uo: any) => ({
        ...uo,
        organization: orgsData?.find((o: any) => o.id === uo.organization_id)
      }))

      console.log('[AuthProvider] Combined data:', data)

      const orgs = (data || []).map((item: any) => ({
        organization: item.organization as Organization,
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

