"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ChevronRight } from 'lucide-react'
import { FloatingPaths } from '@/components/floating-paths'

export default function SelectOrgPage() {
  const router = useRouter()
  const { userOrgs, currentOrg, selectOrganization, loading } = useAuth()

  // If already has an org selected and we're not on select-org page, redirect to app
  useEffect(() => {
    if (!loading && currentOrg && userOrgs.length > 0) {
      // Only redirect if user has selected an org and we're not actively selecting
      const isSelecting = typeof window !== 'undefined' && window.location.pathname === '/select-org'
      if (!isSelecting) {
        router.push('/issues')
      }
    }
  }, [currentOrg, loading, router, userOrgs.length])

  // If no organizations, show message
  if (!loading && userOrgs.length === 0) {
    return (
      <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
        {/* Left side - Branding with floating paths */}
        <div className="bg-gradient-to-br from-gray-50 via-gray-50/80 to-gray-50/60 relative hidden h-full flex-col p-10 lg:flex overflow-hidden">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0.35) 80%, rgba(255,255,255,0.55) 88%, rgba(255,255,255,0.75) 93%, rgba(255,255,255,0.88) 96%, rgba(255,255,255,0.95) 98%, white 100%)' }} />
          <div className="absolute inset-0 z-10 opacity-15" style={{ background: 'radial-gradient(ellipse 60% 100% at left center, transparent 0%, transparent 40%, rgba(0,0,0,0.01) 55%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.03) 85%, rgba(0,0,0,0.02) 92%, rgba(0,0,0,0.01) 96%, transparent 100%)' }} />
          <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
          
          {/* Logo and title in top left corner */}
          <div className="z-10">
            <h1 className="text-4xl font-bold">
              <span className="text-foreground">Sapira </span>
              <span className="text-muted-foreground font-normal">Pharo</span>
            </h1>
          </div>

          {/* Floating paths background */}
          <div className="absolute inset-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        </div>

        {/* Right side - Form */}
        <div className="relative flex min-h-screen flex-col justify-center p-4 bg-white">
          <div className="mx-auto space-y-6 sm:w-sm w-full max-w-md">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Sin organizaciones</CardTitle>
                <CardDescription>
                  No tienes acceso a ninguna organización todavía.
                  Contacta con tu administrador.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full font-sans"
                  onClick={() => router.push('/login')}
                >
                  Volver al login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  const handleSelectOrg = async (orgId: string) => {
    selectOrganization(orgId)
    // Wait a bit for the organization to be set
    await new Promise(resolve => setTimeout(resolve, 100))
    router.push('/issues')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
        {/* Left side - Branding with floating paths */}
        <div className="bg-gradient-to-br from-gray-50 via-gray-50/80 to-gray-50/60 relative hidden h-full flex-col p-10 lg:flex overflow-hidden">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0.35) 80%, rgba(255,255,255,0.55) 88%, rgba(255,255,255,0.75) 93%, rgba(255,255,255,0.88) 96%, rgba(255,255,255,0.95) 98%, white 100%)' }} />
          <div className="absolute inset-0 z-10 opacity-15" style={{ background: 'radial-gradient(ellipse 60% 100% at left center, transparent 0%, transparent 40%, rgba(0,0,0,0.01) 55%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.03) 85%, rgba(0,0,0,0.02) 92%, rgba(0,0,0,0.01) 96%, transparent 100%)' }} />
          <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
          
          {/* Logo and title in top left corner */}
          <div className="z-10">
            <h1 className="text-4xl font-bold">
              <span className="text-foreground">Sapira </span>
              <span className="text-muted-foreground font-normal">Pharo</span>
            </h1>
          </div>

          {/* Floating paths background */}
          <div className="absolute inset-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        </div>

        {/* Right side - Loading */}
        <div className="relative flex min-h-screen flex-col justify-center p-4 bg-white">
          <div className="mx-auto space-y-6 sm:w-sm w-full max-w-md">
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-sans">Cargando organizaciones...</CardTitle>
                <CardDescription className="font-sans">
                  Obteniendo tus organizaciones disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left side - Branding with floating paths */}
      <div className="bg-gradient-to-br from-gray-50 via-gray-50/80 to-gray-50/60 relative hidden h-full flex-col p-10 lg:flex overflow-hidden">
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, transparent 0%, transparent 70%, rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.25) 88%, rgba(255,255,255,0.45) 93%, rgba(255,255,255,0.65) 96%, rgba(255,255,255,0.8) 98%, white 100%)' }} />
        <div className="absolute inset-0 z-10 opacity-20" style={{ background: 'radial-gradient(ellipse 60% 100% at left center, transparent 0%, transparent 40%, rgba(0,0,0,0.01) 55%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.03) 85%, rgba(0,0,0,0.02) 92%, rgba(0,0,0,0.01) 96%, transparent 100%)' }} />
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        
        {/* Logo and title in top left corner */}
        <div className="z-10">
          <h1 className="text-4xl font-bold">
            <span className="text-foreground">Sapira </span>
            <span className="text-muted-foreground font-normal">Pharo</span>
          </h1>
        </div>

        {/* Floating paths background */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right side - Organization selection */}
      <div className="relative flex min-h-screen flex-col justify-center p-4 bg-white">
        {/* Animated background effects */}
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(99,102,241,0.06)_0,hsla(0,0%,55%,.02)_50%,rgba(99,102,241,0.01)_80%)] absolute top-0 right-0 h-80 w-56 -translate-y-24 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(99,102,241,0.04)_0,rgba(99,102,241,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-80 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(139,92,246,0.04)_0,rgba(139,92,246,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-80 w-60 -translate-y-24 rounded-full" />
        </div>

        <div className="mx-auto space-y-6 sm:w-sm w-full max-w-md">
          {/* Title */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-bold tracking-wide text-zinc-800 dark:text-zinc-200 font-sans">
              Selecciona una organización
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-sans">
              Elige la organización a la que deseas acceder
            </p>
          </div>

          {/* Organization cards */}
          <Card className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <CardContent className="p-0">
              <div className="grid gap-3">
                {userOrgs.map(({ organization, role }) => (
                  <button
                    key={organization.id}
                    onClick={() => handleSelectOrg(organization.id)}
                    className="flex items-center justify-between p-4 text-left border border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group font-sans"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground font-sans">{organization.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
                          Rol: <span className="font-medium">{getRoleLabel(role)}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </button>
                ))}
              </div>

              <p className="mt-6 text-sm text-center text-zinc-500 dark:text-zinc-400 font-sans">
                Para cambiar de organización, deberás cerrar sesión
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SAP: 'Sapira (Super Admin)',
    CEO: 'Director Ejecutivo',
    BU: 'Manager de Business Unit',
    EMP: 'Empleado',
  }
  return labels[role] || role
}

