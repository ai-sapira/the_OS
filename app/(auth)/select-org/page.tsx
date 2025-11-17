"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ChevronRight } from 'lucide-react'

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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
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
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Volver al login
            </Button>
          </CardContent>
        </Card>
      </div>
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cargando organizaciones...</CardTitle>
            <CardDescription>
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
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selecciona una organización</CardTitle>
          <CardDescription>
            Elige la organización a la que deseas acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {userOrgs.map(({ organization, role }) => (
              <button
                key={organization.id}
                onClick={() => handleSelectOrg(organization.id)}
                className="flex items-center justify-between p-4 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{organization.name}</h3>
                    <p className="text-sm text-gray-500">
                      Rol: <span className="font-medium">{getRoleLabel(role)}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-center text-gray-500">
            Para cambiar de organización, deberás cerrar sesión
          </p>
        </CardContent>
      </Card>
    </div>
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

