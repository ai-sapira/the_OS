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

  // Check if current path is a public route
  const isPublicRoute = pathname === '/' || 
    pathname?.match(/^\/[^\/]+$/) || // Organization landing pages like /gonvarri
    pathname?.match(/^\/[^\/]+\/signup$/) || // Signup pages
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/select-org')

  useEffect(() => {
    // Skip all checks for public routes
    if (isPublicRoute) {
      return
    }

    // If not loading and user is authenticated
    if (!loading && user) {
      // If user has multiple orgs but none selected, redirect to selector
      if (userOrgs.length > 1 && !currentOrg) {
        router.push('/select-org')
        return
      }
      // If user has no orgs at all, show message (handled in select-org page)
      if (userOrgs.length === 0) {
        router.push('/select-org')
        return
      }
    }
  }, [user, currentOrg, userOrgs, loading, pathname, router, isPublicRoute])

  // Don't show loading spinner on public routes
  if (loading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
