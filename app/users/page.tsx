"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useOrgAdmin } from "@/hooks/use-org-admin"
import { Plus, Mail, UserCheck, Clock, X, Users as UsersIcon } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import InviteUserModal from "@/components/InviteUserModal"
import EditUserModal from "@/components/EditUserModal"

type User = {
  id: string
  role: string
  status: string
  is_org_admin: boolean
  invited_at: string | null
  last_login_at: string | null
  created_at: string
  user: {
    id: string
    email: string
    name: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
  }
}

type Invitation = {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

export default function UsersPage() {
  const { currentOrg, user } = useAuth()
  const { isOrgAdmin, loading: adminLoading } = useOrgAdmin()
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const reload = async () => {
    if (!currentOrg) return

    setLoading(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setError("No session")
        return
      }

      const res = await fetch(`/api/org/users?organization_id=${currentOrg.organization.id}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!res.ok) {
        let errorMessage = "Error al cargar usuarios"
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          const errorText = await res.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      setUsers(data.users || [])
      setInvitations(data.invitations || [])
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentOrg && isOrgAdmin) {
      reload()
    }
  }, [currentOrg, isOrgAdmin])

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      SAP: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
      CEO: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
      BU: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      EMP: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400",
    }
    return (
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${roleColors[role] || roleColors.EMP}`}
      >
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      invited: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
      registered: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      suspended: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    }
    const statusLabels: Record<string, string> = {
      invited: "Invitado",
      registered: "Registrado",
      suspended: "Suspendido",
    }
    return (
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${statusStyles[status] || statusStyles.invited}`}
      >
        {statusLabels[status] || status}
      </Badge>
    )
  }

  if (adminLoading || loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Cargando...</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  if (!isOrgAdmin) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">No tienes permisos para gestionar usuarios</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  if (!currentOrg) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Selecciona una organización</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-500">Workspace</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">Gestión de usuarios</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowInviteModal(true)} size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 text-white gap-2">
                <Plus className="h-4 w-4" />
                Invitar usuario
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Invitations Section */}
          {invitations.length > 0 && (
            <div className="-mx-5 -mt-4 mb-6">
              {/* Column Headers */}
              <div className="py-2.5 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
                <div className="grid grid-cols-[1fr_140px_200px_120px] gap-6">
                  <div className="text-[13px] font-medium text-gray-500 pr-4">Invitación</div>
                  <div className="text-[13px] font-medium text-gray-500">Rol</div>
                  <div className="text-[13px] font-medium text-gray-500">Fecha invitación</div>
                  <div className="text-[13px] font-medium text-gray-500">Expira</div>
                </div>
              </div>

              {/* Invitations List */}
              <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="group py-3.5 hover:bg-gray-50/50 transition-colors border-b border-stroke last:border-b-0"
                  >
                    <div className="grid grid-cols-[1fr_140px_200px_120px] gap-6 items-center">
                      {/* Email Column */}
                      <div className="flex items-center space-x-3 min-w-0 pr-4">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{inv.email}</div>
                        </div>
                      </div>

                      {/* Role Column */}
                      <div className="flex items-center">
                        {getRoleBadge(inv.role)}
                      </div>

                      {/* Invited Date Column */}
                      <div className="text-sm text-gray-500">
                        <span className="text-xs">{formatDate(inv.created_at)}</span>
                      </div>

                      {/* Expires Date Column */}
                      <div className="text-sm text-gray-500">
                        <span className="text-xs">{formatDate(inv.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          <div className={invitations.length > 0 ? "-mx-5" : "-mx-5 -mt-4"}>
            {/* Column Headers */}
            <div className="py-2.5 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <div className="grid grid-cols-[1fr_140px_120px_180px_100px] gap-6">
                <div className="text-[13px] font-medium text-gray-500 pr-4">Usuario</div>
                <div className="text-[13px] font-medium text-gray-500">Rol</div>
                <div className="text-[13px] font-medium text-gray-500">Estado</div>
                <div className="text-[13px] font-medium text-gray-500">Último acceso</div>
                <div className="text-[13px] font-medium text-gray-500"></div>
              </div>
            </div>

            {/* Users List */}
            {users.length === 0 ? (
              <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
                <div className="py-12 text-center">
                  <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <div className="text-sm font-medium text-foreground mb-1">
                    No hay usuarios registrados
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Invita usuarios para comenzar a trabajar en equipo
                  </div>
                  <Button onClick={() => setShowInviteModal(true)} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Invitar primer usuario
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="group py-3.5 hover:bg-gray-50/50 transition-colors border-b border-stroke last:border-b-0"
                  >
                    <div className="grid grid-cols-[1fr_140px_120px_180px_100px] gap-6 items-center">
                      {/* User Column */}
                      <div className="flex items-center space-x-3 min-w-0 pr-4">
                        {u.user.avatar_url ? (
                          <Avatar className="h-8 w-8 border border-border flex-shrink-0">
                            <AvatarImage src={u.user.avatar_url} alt={u.user.name || ""} />
                            <AvatarFallback className="text-xs">
                              {u.user.first_name && u.user.last_name
                                ? `${u.user.first_name[0]}${u.user.last_name[0]}`
                                : u.user.email?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-border flex-shrink-0">
                            <UserCheck className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {u.user.first_name && u.user.last_name
                                ? `${u.user.first_name} ${u.user.last_name}`
                                : u.user.name || u.user.email?.split("@")[0] || "Usuario"}
                            </div>
                            {u.is_org_admin && (
                              <Badge variant="outline" className="text-xs font-medium bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 h-4 px-1.5">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{u.user.email}</div>
                        </div>
                      </div>

                      {/* Role Column */}
                      <div className="flex items-center">
                        {getRoleBadge(u.role)}
                      </div>

                      {/* Status Column */}
                      <div className="flex items-center">
                        {getStatusBadge(u.status)}
                      </div>

                      {/* Last Access Column */}
                      <div className="text-sm text-gray-500">
                        {u.last_login_at ? (
                          <span className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(u.last_login_at)}
                          </span>
                        ) : u.invited_at ? (
                          <span className="text-xs flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {formatDate(u.invited_at)}
                          </span>
                        ) : (
                          <span className="text-xs">{formatDate(u.created_at)}</span>
                        )}
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUserId(u.id)}
                          className="h-7 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResizablePageSheet>

      {showInviteModal && currentOrg && (
        <InviteUserModal
          organizationId={currentOrg.organization.id}
          onClose={() => {
            setShowInviteModal(false)
            reload()
          }}
        />
      )}

      {editingUserId && currentOrg && (
        <EditUserModal
          organizationId={currentOrg.organization.id}
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSave={() => {
            setEditingUserId(null)
            reload()
          }}
        />
      )}
    </ResizableAppShell>
  )
}
