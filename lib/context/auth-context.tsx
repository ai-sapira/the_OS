"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/hooks/use-roles'

interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  settings?: Record<string, any> | null
}

interface UserOrganization {
  organization: Organization
  role: Role
  initiative_id: string | null
  sapira_role_type?: 'FDE' | 'ADVISORY_LEAD' | 'ACCOUNT_MANAGER' | null
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
  
  // Use refs to prevent race conditions
  const loadingRef = useRef(false)
  const lastLoadedUserIdRef = useRef<string | null>(null)

  // Load user and their organizations
  useEffect(() => {
    let mounted = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
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
        if (!mounted) return
        
        console.log('[AuthProvider] Auth state changed:', event)
        
        // Only process SIGNED_IN events to avoid duplicates
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          if (session?.user) {
            await loadUserOrganizations(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserOrgs([])
          setCurrentOrg(null)
          setLoading(false)
          localStorage.removeItem('sapira.currentOrg')
          lastLoadedUserIdRef.current = null
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserOrganizations = async (authUserId: string) => {
    // Prevent concurrent calls and skip if already loaded for this user
    if (loadingRef.current) {
      console.log('[AuthProvider] Already loading organizations, skipping...')
      return
    }
    
    if (lastLoadedUserIdRef.current === authUserId && userOrgs.length > 0) {
      console.log('[AuthProvider] Organizations already loaded for this user, skipping...')
      setLoading(false)
      return
    }
    
    console.log('[AuthProvider] Loading organizations for user:', authUserId)
    loadingRef.current = true
    lastLoadedUserIdRef.current = authUserId
    
    try {
      // Use API route instead of direct Supabase query
      console.log('[AuthProvider] Calling API route...')
      const response = await fetch('/api/user/organizations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
      
      console.log('[AuthProvider] Response status:', response.status, response.statusText)
      console.log('[AuthProvider] Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Get the response text first to see what we're actually receiving
      const responseText = await response.text()
      console.log('[AuthProvider] Response text (first 200 chars):', responseText.substring(0, 200))
      
      // Try to parse as JSON
      let data, error, defaultOrgId
      try {
        const parsed = JSON.parse(responseText)
        data = parsed.data
        error = parsed.error
        defaultOrgId = parsed.defaultOrganizationId || null
      } catch (parseError) {
        console.error('[AuthProvider] Failed to parse response as JSON:', parseError)
        console.error('[AuthProvider] Full response:', responseText)
        throw new Error(`API returned non-JSON response: ${responseText.substring(0, 100)}`)
      }
      
      console.log('[AuthProvider] API response:', { data, error })

      if (error) {
        console.error('[AuthProvider] API returned error:', error)
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        loadingRef.current = false
        return
      }

      if (!data || data.length === 0) {
        console.warn('[AuthProvider] No organizations found for user')
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        loadingRef.current = false
        return
      }

      // Map the data from API response
      const orgs = (data || []).map((item: any) => ({
        organization: item.organizations as Organization,
        role: item.role as Role,
        initiative_id: item.initiative_id,
        sapira_role_type: item.sapira_role_type || null
      })).filter((org: any) => org.organization) // Filter out any without organization data

      console.log('[AuthProvider] Mapped organizations:', orgs)
      setUserOrgs(orgs)

      // Check if we're on the select-org page - if so, don't auto-select
      const isOnSelectOrgPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/select-org')

      // Check if there is a pending slug to select (set during login/signup)
      const pendingSlug = typeof window !== 'undefined' ? localStorage.getItem('sapira.pendingOrgSlug') : null
      if (pendingSlug) {
        const pendingOrg = orgs.find(
          (o: any) => o.organization?.slug?.toLowerCase() === pendingSlug.toLowerCase()
        )
        if (pendingOrg) {
          console.log('[AuthProvider] Selecting pending org from slug:', pendingSlug)
          setCurrentOrg(pendingOrg)
          localStorage.setItem('sapira.currentOrg', pendingOrg.organization.id)
        }
        localStorage.removeItem('sapira.pendingOrgSlug')
      }

      // Don't auto-select if user is on select-org page (they need to choose)
      if (!pendingSlug && !isOnSelectOrgPage && orgs.length === 1) {
        console.log('[AuthProvider] Auto-selecting single org:', orgs[0].organization.name)
        setCurrentOrg(orgs[0])
        localStorage.setItem('sapira.currentOrg', orgs[0].organization.id)
      }
      else if (!pendingSlug && !isOnSelectOrgPage && defaultOrgId) {
        const defaultOrg = orgs.find((o: any) => o.organization?.id === defaultOrgId)
        if (defaultOrg) {
          console.log('[AuthProvider] Selecting default org from user profile:', defaultOrg.organization.name)
          setCurrentOrg(defaultOrg)
          localStorage.setItem('sapira.currentOrg', defaultOrg.organization.id)
        }
      }
      else if (!pendingSlug && !isOnSelectOrgPage && orgs.length > 1) {
        const savedOrgId = localStorage.getItem('sapira.currentOrg')
        const savedOrg = orgs.find((o: any) => o.organization?.id === savedOrgId)

        if (savedOrg) {
          console.log('[AuthProvider] Restored saved org:', savedOrg.organization.name)
          setCurrentOrg(savedOrg)
        } else {
          console.log('[AuthProvider] Multiple orgs, waiting for user selection')
        }
      }
      else if (isOnSelectOrgPage) {
        console.log('[AuthProvider] On select-org page, waiting for user to choose organization')
      }

    } catch (err) {
      console.error('[AuthProvider] Unexpected error loading organizations:', err)
      setUserOrgs([])
      setCurrentOrg(null)
    } finally {
      console.log('[AuthProvider] Setting loading to false')
      setLoading(false)
      loadingRef.current = false
    }
  }

  const selectOrganization = async (orgId: string) => {
    const org = userOrgs.find(o => o.organization.id === orgId)
    if (org) {
      setCurrentOrg(org)
      if (typeof window !== 'undefined') {
        localStorage.setItem('sapira.currentOrg', orgId)
        localStorage.setItem('sapira.pendingOrgSlug', org.organization.slug)
      }
      try {
        await fetch('/api/auth/select-org', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organization_id: orgId }),
        })
      } catch (error) {
        console.error('[AuthProvider] Failed to persist selected org:', error)
      }
    }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setCurrentOrg(null)
      setUserOrgs([])
      setUser(null)
      setLoading(false)
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sapira.currentOrg')
        localStorage.removeItem('sapira.pendingOrgSlug')
      }
      
      // Call API to clear server-side cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Sign out from Supabase client
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[AuthProvider] Error during signOut:', error)
      // Still try to sign out from client even if API fails
      await supabase.auth.signOut()
    }
  }

  // Check if current user has SAP role in current organization
  // isSAPUser should be true only if:
  // 1. User has SAP role in current org AND
  // 2. User email ends with @sapira.ai (actual Sapira team member)
  const isSAPUser = currentOrg?.role === 'SAP' && user?.email?.toLowerCase().endsWith('@sapira.ai') === true

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

