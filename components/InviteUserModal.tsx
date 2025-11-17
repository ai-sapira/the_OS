"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { InitiativesAPI } from "@/lib/api/initiatives"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InviteUserModalProps {
  organizationId: string
  onClose: () => void
}

type Role = "SAP" | "CEO" | "BU" | "EMP"

export default function InviteUserModal({ organizationId, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("EMP")
  const [initiativeId, setInitiativeId] = useState<string | null>(null)
  const [initiatives, setInitiatives] = useState<Array<{ id: string; name: string }>>([])
  const [loadingInitiatives, setLoadingInitiatives] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load initiatives when role is BU
  useEffect(() => {
    if (role === "BU") {
      setLoadingInitiatives(true)
      InitiativesAPI.getInitiatives(organizationId)
        .then((data) => {
          setInitiatives(data.map((i) => ({ id: i.id, name: i.name })))
        })
        .catch((err) => {
          console.error("Error loading initiatives:", err)
          setError("Error al cargar Business Units")
        })
        .finally(() => {
          setLoadingInitiatives(false)
        })
    } else {
      setInitiativeId(null)
      setInitiatives([])
    }
  }, [role, organizationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error("No session")
      }

      const res = await fetch(`/api/org/users/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ 
          organization_id: organizationId, 
          email, 
          role,
          initiative_id: role === "BU" ? initiativeId : null,
        }),
      })

      if (!res.ok) {
        let errorMessage = "Error al invitar usuario"
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
      setSuccess(true)
      setEmail("")
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Invitación enviada</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Se ha enviado un email de invitación a <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                El usuario recibirá un email con un enlace para configurar su contraseña y unirse a la organización.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Invitar usuario</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Envía una invitación para que el usuario se una a la organización
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium">
                Rol
              </label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMP">Employee</SelectItem>
                  <SelectItem value="BU">BU Manager</SelectItem>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="SAP">Sapira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "BU" && (
              <div>
                <label htmlFor="initiative" className="mb-1 block text-sm font-medium">
                  Business Unit <span className="text-destructive">*</span>
                </label>
                {loadingInitiatives ? (
                  <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                    Cargando Business Units...
                  </div>
                ) : (
                  <Select
                    value={initiativeId || ""}
                    onValueChange={(value) => setInitiativeId(value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una Business Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {initiatives.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No hay Business Units disponibles
                        </div>
                      ) : (
                        initiatives.map((initiative) => (
                          <SelectItem key={initiative.id} value={initiative.id}>
                            {initiative.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {initiatives.length === 0 && !loadingInitiatives && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Debes crear al menos una Business Unit antes de invitar un BU Manager
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || (role === "BU" && !initiativeId)} 
                className="flex-1"
              >
                {loading ? "Enviando..." : "Enviar invitación"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



