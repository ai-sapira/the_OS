"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface EditUserModalProps {
  organizationId: string
  userId: string
  onClose: () => void
  onSave: () => void
}

type UserData = {
  id: string
  role: string
  status: string
  is_org_admin: boolean
  user: {
    id: string
    email: string
    name: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
    reports_to_user_id: string | null
    team: string | null
  }
  reports_to_name: string | null
}

export default function EditUserModal({ organizationId, userId, onClose, onSave }: EditUserModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [team, setTeam] = useState("")
  const [role, setRole] = useState<"SAP" | "CEO" | "BU" | "EMP">("EMP")
  const [status, setStatus] = useState<"invited" | "registered" | "suspended">("registered")
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          throw new Error("No session")
        }

        const res = await fetch(`/api/org/users/${userId}?organization_id=${organizationId}`, {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        })

        if (!res.ok) {
          let errorMessage = "Error al cargar usuario"
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
        setUserData(data.user)
        setFirstName(data.user.user.first_name || "")
        setLastName(data.user.user.last_name || "")
        setPhone(data.user.user.phone || "")
        setTeam(data.user.user.team || "")
        setRole(data.user.role)
        setStatus(data.user.status)
        setIsOrgAdmin(data.user.is_org_admin || false)
      } catch (e: any) {
        setError(e?.message || "Error")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [organizationId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error("No session")
      }

      const res = await fetch(`/api/org/users/${userId}?organization_id=${organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          team: team || null,
          role,
          status,
          is_org_admin: isOrgAdmin,
        }),
      })

      if (!res.ok) {
        let errorMessage = "Error al actualizar usuario"
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          const errorText = await res.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      onSave()
      onClose()
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
          <div className="text-sm text-muted-foreground">Cargando usuario...</div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Editar usuario</h2>
            <p className="text-sm text-muted-foreground mt-1">{userData.user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
                  Apellidos
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={userData.user.email}
                disabled
                className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">El email no se puede cambiar</p>
            </div>

            {/* Phone and Team */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="team" className="mb-1 block text-sm font-medium">
                  Equipo
                </label>
                <input
                  id="team"
                  type="text"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium">
                  Rol
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "SAP" | "CEO" | "BU" | "EMP")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="EMP">Employee</option>
                  <option value="BU">BU Manager</option>
                  <option value="CEO">CEO</option>
                  <option value="SAP">Sapira</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium">
                  Estado
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "invited" | "registered" | "suspended")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="invited">Invitado</option>
                  <option value="registered">Registrado</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>

            {/* Org Admin */}
            <div className="flex items-center gap-2">
              <input
                id="isOrgAdmin"
                type="checkbox"
                checked={isOrgAdmin}
                onChange={(e) => setIsOrgAdmin(e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              <label htmlFor="isOrgAdmin" className="text-sm font-medium">
                Administrador de organización
              </label>
            </div>

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



