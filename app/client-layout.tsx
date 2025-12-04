"use client"

import type React from "react"

import { useState, Suspense, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CommandPaletteV2 } from "@/components/command-palette-v2"
import { HotkeyProvider } from "@/lib/context/hotkey-context"
import { HotkeyIndicator, HotkeyHelpModal } from "@/components/hotkeys"
import { AppHotkeys } from "@/components/app-hotkeys"
import { AuthProvider, useAuth } from "@/lib/context/auth-context"
import { NewIssueModal } from "@/components/new-issue-modal"
import { NewInitiativeModal } from "@/components/new-initiative-modal"
import { NewProjectModal } from "@/components/new-project-modal"

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

    // Wait for auth to finish loading
    if (loading) {
      return
    }

    // If user is not authenticated, redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // If user is authenticated
    if (user) {
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

// Inner component that uses hotkey context
function AppWithHotkeys({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  
  // Modals state - Nomenclatura corregida
  const [createInitiativeOpen, setCreateInitiativeOpen] = useState(false)  // Iniciativa = issues table
  const [createBusinessUnitOpen, setCreateBusinessUnitOpen] = useState(false)  // Business Unit = initiatives table
  const [createProjectOpen, setCreateProjectOpen] = useState(false)  // Project = projects table

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])

  // Crear Iniciativa (en tabla issues)
  const handleOpenCreateInitiative = useCallback(() => {
    setCreateInitiativeOpen(true)
  }, [])

  // Crear Business Unit (en tabla initiatives)
  const handleOpenCreateBusinessUnit = useCallback(() => {
    setCreateBusinessUnitOpen(true)
  }, [])

  // Crear Project (en tabla projects)
  const handleOpenCreateProject = useCallback(() => {
    setCreateProjectOpen(true)
  }, [])

  // Listen for Cmd+K from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close command palette on ESC (backup handler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault()
        setCommandPaletteOpen(false)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [commandPaletteOpen])

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        {children}
      </Suspense>

      {/* Hotkey system */}
      <AppHotkeys
        onOpenCommandPalette={handleOpenCommandPalette}
        onOpenCreateInitiative={handleOpenCreateInitiative}
        onOpenCreateBusinessUnit={handleOpenCreateBusinessUnit}
        onOpenCreateProject={handleOpenCreateProject}
      />
      
      {/* Command Palette V2 */}
      <CommandPaletteV2 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen}
        onCreateInitiative={handleOpenCreateInitiative}
        onCreateBusinessUnit={handleOpenCreateBusinessUnit}
        onCreateProject={handleOpenCreateProject}
      />
      
      {/* Modals - Nomenclatura corregida */}
      {/* Nueva Iniciativa = NewIssueModal (crea en tabla issues) */}
      <NewIssueModal 
        open={createInitiativeOpen}
        onOpenChange={setCreateInitiativeOpen}
      />
      
      {/* Nuevo Business Unit = NewInitiativeModal (crea en tabla initiatives) */}
      <NewInitiativeModal 
        open={createBusinessUnitOpen}
        onOpenChange={setCreateBusinessUnitOpen}
      />
      
      {/* Nuevo Project = NewProjectModal (crea en tabla projects) */}
      <NewProjectModal 
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
      
      {/* Hotkey visual feedback */}
      <HotkeyIndicator />
      <HotkeyHelpModal />
    </>
  )
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <HotkeyProvider>
        <AuthGuard>
          <AppWithHotkeys>
            {children}
          </AppWithHotkeys>
        </AuthGuard>
      </HotkeyProvider>
    </AuthProvider>
  )
}
