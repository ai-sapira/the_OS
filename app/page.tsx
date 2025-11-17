"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface ResolveOrgResponse {
  email: string
  domain: string
  existing_user: boolean
  organization?: {
    id: string
    slug: string
    name: string
    allow_registration: boolean
    logo_url: string | null
  }
  message?: string
  error?: string
}

export default function HomeLanding() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // If user is Sapira, redirect to org selector instead of issues
        const userEmail = session.user.email?.toLowerCase() || ""
        if (userEmail.endsWith("@sapira.ai")) {
          router.replace("/select-org")
        } else {
          router.replace("/issues")
        }
      }
    })
  }, [router])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setInfo(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Introduce un email válido")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/resolve-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = (await response.json()) as ResolveOrgResponse

      if (!response.ok) {
        throw new Error(data.error || data.message || "No hemos encontrado tu organización")
      }

      // Special handling for @sapira.ai users - they don't have a single organization
      if (data.domain === "sapira.ai" && !data.organization) {
        const params = new URLSearchParams({ email: data.email })
        if (data.existing_user) {
          // Existing user - redirect to login, then to select-org after login
          router.push(`/login?${params.toString()}&redirect=select-org`)
        } else {
          // New user - redirect to login with message
          router.push(`/login?${params.toString()}&message=Por favor contacta a soporte para crear tu cuenta Sapira&redirect=select-org`)
        }
        return
      }

      if (!data.organization) {
        throw new Error("No hemos encontrado tu organización")
      }

      const params = new URLSearchParams({ email: data.email })
      const slug = data.organization.slug

      if (data.existing_user) {
        if (typeof document !== "undefined") {
          document.cookie = `sapira-org-slug=${slug}; path=/; SameSite=Lax`
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("sapira.pendingOrgSlug", slug)
        }
        router.push(`/login?org=${encodeURIComponent(slug)}&${params.toString()}`)
        return
      }

      if (!data.organization.allow_registration) {
        setInfo(
          data.message ||
            "El registro automático no está disponible para esta organización. Contacta a soporte para obtener acceso."
        )
        return
      }

      if (typeof document !== "undefined") {
        document.cookie = `sapira-org-slug=${slug}; path=/; SameSite=Lax`
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("sapira.pendingOrgSlug", slug)
      }

      router.push(`/${encodeURIComponent(slug)}?${params.toString()}`)
    } catch (err: any) {
      setError(err?.message || "No hemos encontrado tu organización")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none"></div>
      
      {/* Logo and title */}
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-white">Sapira </span>
          <span className="text-gray-400 font-normal">Pharo</span>
        </h1>
        <p className="text-lg text-gray-200 mt-4">Bienvenido</p>
        <p className="text-sm text-gray-400 mt-1">
          Introduce tu email corporativo para acceder a la instancia de tu organización
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="email" className="text-sm font-medium text-gray-200 block">
              Email corporativo
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu.email@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              className="w-full h-12 px-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none rounded-md transition-all"
            />
          </div>

          {error && (
            <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          {info && (
            <div className="p-4 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-medium text-base rounded-lg shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Buscando tu organización…" : "Continuar"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 relative z-10">
        ¿Tu organización aún no está activa? Escríbenos a <span className="font-medium text-gray-300">soporte@sapira.ai</span>
      </div>
    </div>
  )
}
