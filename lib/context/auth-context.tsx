"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react'
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
  business_unit_id: string | null
  // Legacy alias
  initiative_id?: string | null
  sapira_role_type?: 'FDE' | 'ADVISORY_LEAD' | 'ACCOUNT_MANAGER' | null
}

interface AuthContextType {
  user: User | null
  currentOrg: UserOrganization | null
  userOrgs: UserOrganization[]
  loading: boolean
  isSAPUser: boolean
  selectOrganization: (orgId: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentOrg, setCurrentOrg] = useState<UserOrganization | null>(null)
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)
  
  // Refs to prevent race conditions
  const loadingRef = useRef(false)
  const lastLoadedUserIdRef = useRef<string | null>(null)
  const isSigningOutRef = useRef(false)
  const mountedRef = useRef(true)

  const loadUserOrganizations = useCallback(async (authUserId: string) => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      console.log('[AuthProvider] Already loading organizations, skipping...')
      return
    }
    
    // Skip if already loaded for this user
    if (lastLoadedUserIdRef.current === authUserId && userOrgs.length > 0) {
      console.log('[AuthProvider] Organizations already loaded for this user')
      setLoading(false)
      return
    }
    
    console.log('[AuthProvider] Loading organizations for user:', authUserId)
    loadingRef.current = true
    lastLoadedUserIdRef.current = authUserId
    
    try {
      const response = await fetch('/api/user/organizations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        credentials: 'include',
      })
      
      if (!mountedRef.current) return
      
      if (!response.ok) {
        console.error('[AuthProvider] API error:', response.status)
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        loadingRef.current = false
        return
      }
      
      const { data, error, defaultOrganizationId } = await response.json()
      
      if (error || !data || data.length === 0) {
        console.log('[AuthProvider] No organizations found')
        setUserOrgs([])
        setCurrentOrg(null)
        setLoading(false)
        loadingRef.current = false
        return
      }

      // Map the data from API response
      const orgs: UserOrganization[] = data
        .map((item: any) => ({
          organization: item.organizations as Organization,
          role: item.role as Role,
          business_unit_id: item.business_unit_id,
          initiative_id: item.business_unit_id,
          sapira_role_type: item.sapira_role_type || null
        }))
        .filter((org: UserOrganization) => org.organization)

      console.log('[AuthProvider] Loaded', orgs.length, 'organizations')
      setUserOrgs(orgs)

      // Auto-select organization logic
      const isOnSelectOrgPage = typeof window !== 'undefined' && 
        window.location.pathname.startsWith('/select-org')
      
      // Check for pending org from login
      const pendingSlug = typeof window !== 'undefined' 
        ? localStorage.getItem('sapira.pendingOrgSlug') 
        : null
      
      if (pendingSlug) {
        const pendingOrg = orgs.find(
          (o: UserOrganization) => o.organization?.slug?.toLowerCase() === pendingSlug.toLowerCase()
        )
        if (pendingOrg) {
          console.log('[AuthProvider] Selecting pending org:', pendingSlug)
          setCurrentOrg(pendingOrg)
          localStorage.setItem('sapira.currentOrg', pendingOrg.organization.id)
        }
        localStorage.removeItem('sapira.pendingOrgSlug')
      }
      // Single org - auto-select
      else if (!isOnSelectOrgPage && orgs.length === 1) {
        console.log('[AuthProvider] Auto-selecting single org')
        setCurrentOrg(orgs[0])
        localStorage.setItem('sapira.currentOrg', orgs[0].organization.id)
      }
      // Default org from user profile
      else if (!isOnSelectOrgPage && defaultOrganizationId) {
        const defaultOrg = orgs.find((o: UserOrganization) => o.organization?.id === defaultOrganizationId)
        if (defaultOrg) {
          console.log('[AuthProvider] Selecting default org from profile')
          setCurrentOrg(defaultOrg)
          localStorage.setItem('sapira.currentOrg', defaultOrg.organization.id)
        }
      }
      // Multiple orgs - try to restore saved selection
      else if (!isOnSelectOrgPage && orgs.length > 1) {
        const savedOrgId = localStorage.getItem('sapira.currentOrg')
        const savedOrg = orgs.find((o: UserOrganization) => o.organization?.id === savedOrgId)
        if (savedOrg) {
          console.log('[AuthProvider] Restored saved org')
          setCurrentOrg(savedOrg)
        }
      }

    } catch (err) {
      console.error('[AuthProvider] Error loading organizations:', err)
      setUserOrgs([])
      setCurrentOrg(null)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
      loadingRef.current = false
    }
  }, [userOrgs.length])

  // Initialize auth state
  useEffect(() => {
    mountedRef.current = true
    
    const initializeAuth = async () => {
      try {
        // Use getUser() to validate the JWT with Supabase server
        // This is more reliable than getSession() which only reads from storage
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (!mountedRef.current) return
        
        if (error) {
          // Session missing or invalid - this is expected for unauthenticated users
          if (error.message !== 'Auth session missing!') {
            console.log('[AuthProvider] Auth error:', error.message)
          }
          setUser(null)
          setLoading(false)
          return
        }
        
        console.log('[AuthProvider] Initial user:', authUser?.id ? 'Found' : 'None')
        setUser(authUser)
        
        if (authUser) {
          await loadUserOrganizations(authUser.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('[AuthProvider] Init error:', err)
        setUser(null)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return
        
        console.log('[AuthProvider] Auth event:', event, 'User:', session?.user?.id || 'none')
        
        // Handle sign in
        if (event === 'SIGNED_IN' && session?.user) {
          isSigningOutRef.current = false
          setUser(session.user)
          await loadUserOrganizations(session.user.id)
          return
        }
        
        // Handle token refresh - just update user, don't reload orgs
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('[AuthProvider] Token refreshed')
          setUser(session.user)
          return
        }
        
        // Handle sign out - only if intentional
        if (event === 'SIGNED_OUT') {
          if (isSigningOutRef.current) {
            console.log('[AuthProvider] Processing sign out')
            setUser(null)
            setUserOrgs([])
            setCurrentOrg(null)
            setLoading(false)
            localStorage.removeItem('sapira.currentOrg')
            localStorage.removeItem('sapira.pendingOrgSlug')
            lastLoadedUserIdRef.current = null
          } else {
            // Spurious SIGNED_OUT event - verify with getUser()
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (!currentUser) {
              console.log('[AuthProvider] Session actually ended')
              setUser(null)
              setUserOrgs([])
              setCurrentOrg(null)
              setLoading(false)
              localStorage.removeItem('sapira.currentOrg')
              lastLoadedUserIdRef.current = null
            } else {
              console.log('[AuthProvider] Ignoring spurious SIGNED_OUT, user still valid')
            }
          }
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [loadUserOrganizations])

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organization_id: orgId }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('[AuthProvider] Failed to persist org selection:', error)
      }
    }
  }

  const signOut = async () => {
    try {
      isSigningOutRef.current = true
      
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
        headers: { 'Content-Type': 'application/json' },
      })
      
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error)
      // Still try to sign out from client
      await supabase.auth.signOut()
    }
  }

  // Check if user is Sapira team member
  const isSAPUser = currentOrg?.role === 'SAP' && 
    user?.email?.toLowerCase().endsWith('@sapira.ai') === true

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
