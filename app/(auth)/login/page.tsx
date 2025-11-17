"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Organization {
  name: string
  slug: string
  logo_url: string | null
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryOrg = searchParams.get('org')?.toLowerCase() || null
  const [orgSlug, setOrgSlug] = useState<string | null>(queryOrg)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadingOrg, setLoadingOrg] = useState(false)

  // Fetch organization details when orgSlug is available
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgSlug) return

      setLoadingOrg(true)
      try {
        const response = await fetch(`/api/auth/check-org-signup?slug=${encodeURIComponent(orgSlug)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.organization) {
            setOrganization({
              name: data.organization.name || data.orgName || orgSlug.toUpperCase(),
              slug: data.organization.slug || orgSlug,
              logo_url: data.organization.logo_url || null,
            })
          } else if (data.orgName) {
            // Fallback if organization object is not present
            setOrganization({
              name: data.orgName,
              slug: orgSlug,
              logo_url: null,
            })
          }
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err)
      } finally {
        setLoadingOrg(false)
      }
    }

    fetchOrganization()
  }, [orgSlug])

  useEffect(() => {
    const registered = searchParams.get('registered')
    const emailParam = searchParams.get('email')

    if (emailParam) {
      setEmail(emailParam)
    }

    if (!queryOrg) {
      const cookieSlug = getCookie('sapira-org-slug')
      if (cookieSlug) {
        setOrgSlug(cookieSlug)
      }
    }

    if (registered === 'true' && emailParam) {
      setSuccessMessage('Cuenta creada exitosamente. Por favor, inicia sesión.')
    }
  }, [searchParams, queryOrg])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Login] Form submitted, starting login...')
    setLoading(true)
    setError(null)

    try {
      console.log('[Login] Calling signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[Login] signInWithPassword response:', { hasData: !!data, hasError: !!error, error })

      if (error) throw error

      console.log('[Login] ✅ Auth successful! User:', data?.user?.id)

      // Check if user is from Sapira (@sapira.ai domain)
      const userEmail = data?.user?.email || email
      const isSapiraUser = userEmail?.toLowerCase().endsWith('@sapira.ai')
      const redirectParam = searchParams.get('redirect')

      if (isSapiraUser) {
        // For Sapira users, redirect to organization selector
        console.log('[Login] Sapira user detected, redirecting to organization selector')
        setIsTransitioning(true)
        await new Promise(resolve => setTimeout(resolve, 600))
        // Use redirect param if provided, otherwise default to select-org
        const redirectPath = redirectParam === 'select-org' ? '/select-org' : '/select-org'
        router.push(redirectPath)
        return
      }

      // For non-Sapira users, continue with normal flow
      if (orgSlug) {
        localStorage.setItem('sapira.pendingOrgSlug', orgSlug)
        try {
          await fetch('/api/auth/select-org', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug: orgSlug }),
          })
        } catch (selectError) {
          console.error('[Login] Failed to persist selected org:', selectError)
        }
      }

      // Start transition animation
      setIsTransitioning(true)

      await new Promise(resolve => setTimeout(resolve, 600))

      router.push('/issues')
    } catch (err: any) {
      console.error('[Login] ❌ Login error:', err)
      setError(err.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Transition overlay */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 transition-all duration-700 pointer-events-none ${
          isTransitioning 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            <p className="text-white font-medium">Entrando a Sapira Pharo...</p>
          </div>
        </div>
      </div>

      <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 z-10 transition-all duration-500 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 overflow-hidden ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none"></div>
        {/* Logo and title */}
        <div className="mb-8 text-center space-y-4 relative z-10">
          {organization?.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="mx-auto h-16 w-auto mb-4"
            />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold text-white mb-4">
              {organization?.name?.substring(0, 2).toUpperCase() || orgSlug?.substring(0, 2).toUpperCase() || 'SA'}
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Sapira </span>
            <span className="text-gray-400 font-normal">Pharo</span>
          </h1>
          <p className="text-lg text-gray-200">Bienvenido de vuelta</p>
          <p className="text-sm text-gray-400">Conecta con profesionales de tu organización</p>
          {organization && (
            <p className="text-xs text-gray-400">
              Accediendo a la instancia de <span className="font-semibold uppercase">{organization.name}</span>
            </p>
          )}
          {orgSlug && !organization && (
            <p className="text-xs text-gray-400">
              Accediendo a la instancia de <span className="font-semibold uppercase">{orgSlug}</span>
            </p>
          )}
        </div>

        {/* Tab buttons */}
        <div className="flex gap-3 mb-8 relative z-10">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-lg'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-lg'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 relative z-10">
          {activeTab === 'login' ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Iniciar sesión
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Accede a tu cuenta para conectar con la comunidad
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all"
                  />
                </div>

                {successMessage && (
                  <div className="p-4 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-medium text-base rounded-lg shadow-lg transition-all"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Crear cuenta
              </h2>
              <p className="text-sm text-gray-400">
                El registro se gestiona desde la landing de tu organización.
              </p>
              <Button
                onClick={() => setActiveTab('login')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Volver a iniciar sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

