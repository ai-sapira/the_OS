"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { FloatingPaths } from "@/components/floating-paths"

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
        {/* Animated background effects - blue/purple gradient */}
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(99,102,241,0.06)_0,hsla(0,0%,55%,.02)_50%,rgba(99,102,241,0.01)_80%)] absolute top-0 right-0 h-80 w-56 -translate-y-24 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(99,102,241,0.04)_0,rgba(99,102,241,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-80 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(139,92,246,0.04)_0,rgba(139,92,246,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-80 w-60 -translate-y-24 rounded-full" />
        </div>

        <div className="mx-auto space-y-6 sm:w-sm w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <p className="text-xl font-semibold text-foreground">Sapira Pharo</p>
          </div>

          {/* Title */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-bold tracking-wide text-zinc-800 dark:text-zinc-200 font-sans">
              Bienvenido
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-sans">
              Introduce tu email corporativo para acceder a la instancia de tu organización
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl shadow-lg p-10 border border-border relative input-energy-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-zinc-500 dark:text-zinc-400 font-sans"
                >
                  Email corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu.email@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700 font-sans"
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg backdrop-blur-sm font-sans">
                  {error}
                </div>
              )}

              {info && (
                <div className="p-4 text-sm text-yellow-700 bg-yellow-50/80 border border-yellow-200/60 rounded-lg backdrop-blur-sm font-sans">
                  {info}
                </div>
              )}

              {/* Continue button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 !bg-gradient-to-br !from-gray-700 !via-gray-600 !via-gray-600 !to-gray-700 hover:!from-gray-600 hover:!via-gray-500 hover:!to-gray-600 !text-white font-sans font-medium text-base rounded-lg shadow-lg shadow-gray-700/40 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Buscando tu organización…" : "Continuar"}
              </button>
            </form>
          </div>

          {/* Support message */}
          <div className="text-center text-xs text-muted-foreground font-sans">
            ¿Tu organización aún no está activa? Escríbenos a{' '}
            <a href="mailto:soporte@sapira.ai" className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium">
              soporte@sapira.ai
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
