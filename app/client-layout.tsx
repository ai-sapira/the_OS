"use client"

import type React from "react"

import { useState, Suspense, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CommandPalette } from "@/components/command-palette"
import { AuthProvider, useAuth } from "@/lib/context/auth-context"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, currentOrg, userOrgs, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    console.log('[AuthGuard] State:', { 
      pathname, 
      loading, 
      hasUser: !!user, 
      currentOrg: currentOrg?.organization?.name,
      userOrgsCount: userOrgs.length 
    })

    // Don't redirect on auth pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/select-org')) {
      console.log('[AuthGuard] On auth page, skipping checks')
      return
    }

    // If not loading and user is authenticated
    if (!loading && user) {
      console.log('[AuthGuard] User authenticated, checking org status...')
      
      // If user has multiple orgs but none selected, redirect to selector
      if (userOrgs.length > 1 && !currentOrg) {
        console.log('[AuthGuard] Multiple orgs but none selected, redirecting to select-org')
        router.push('/select-org')
      }
      // If user has no orgs at all, show message (handled in select-org page)
      else if (userOrgs.length === 0) {
        console.log('[AuthGuard] No orgs found, redirecting to select-org')
        router.push('/select-org')
      }
      else if (currentOrg) {
        console.log('[AuthGuard] ✅ User has org selected:', currentOrg.organization.name)
      }
    }
  }, [user, currentOrg, userOrgs, loading, pathname, router])

  if (loading) {
    console.log('[AuthGuard] Showing loading spinner...')
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  console.log('[AuthGuard] Rendering children for path:', pathname)
  return <>{children}</>
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <AuthProvider>
      <AuthGuard>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen bg-background">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          {children}
        </Suspense>

        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      </AuthGuard>
    </AuthProvider>
  )
}
