"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FloatingPaths } from '@/components/floating-paths'
import { Github, X, AtSign } from 'lucide-react'

interface Organization {
  name: string
  slug: string
  logo_url: string | null
  id?: string
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
              id: data.organization.id || data.organizationId || undefined,
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

      // Store pending org slug for AuthProvider
      if (orgSlug) {
        localStorage.setItem('sapira.pendingOrgSlug', orgSlug)
      }

      // Start transition animation
      setIsTransitioning(true)

      // Small delay to allow auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100))

      // Determine redirect path
      const redirectPath = isSapiraUser ? '/select-org' : '/initiatives'
      console.log('[Login] Redirecting to:', redirectPath)

      router.push(redirectPath)
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
        className={`fixed inset-0 z-50 bg-white transition-all duration-700 pointer-events-none ${
          isTransitioning 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-foreground font-medium">Entrando a Sapira Pharo...</p>
          </div>
        </div>
      </div>

      <main className={`relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
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

        {/* Right side - Login form */}
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
              {organization?.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                  {organization?.name?.substring(0, 2).toUpperCase() || orgSlug?.substring(0, 2).toUpperCase() || 'SA'}
                </div>
              )}
              <p className="text-xl font-semibold text-foreground">Sapira Pharo</p>
            </div>

            {/* Corporate Logo - Prominent placement */}
            {(organization?.logo_url || orgSlug) && (
              <div className="flex justify-center lg:justify-start mb-6 -mt-2 transition-all duration-300">
                <img
                  src={
                    organization?.logo_url || 
                    (orgSlug === 'gonvarri' ? '/gonvarri_vector.png' : `/logos/${orgSlug}.svg`)
                  }
                  alt={organization?.name || orgSlug || 'Organization'}
                  className="h-14 lg:h-16 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to gonvarri logo if logo_url fails
                    const target = e.target as HTMLImageElement;
                    if (orgSlug === 'gonvarri') {
                      target.src = '/gonvarri_vector.png';
                    } else {
                      target.style.display = 'none';
                    }
                  }}
                />
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-bold tracking-wide text-zinc-800 dark:text-zinc-200">
                {activeTab === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-base">
                {activeTab === 'login' 
                  ? 'Accede a tu cuenta para conectar con la comunidad'
                  : 'Completa tus datos para crear tu cuenta'}
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('login')}
                className={`relative z-0 flex items-center justify-center overflow-hidden rounded-md border px-4 py-2 font-semibold transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:transition-transform before:duration-1000 before:content-[''] hover:scale-105 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95 flex-1 text-sm ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-br from-gray-700 via-gray-600 via-gray-600 to-gray-700 text-white shadow-lg shadow-gray-700/40 border-gray-600 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 hover:shadow-none before:bg-zinc-100 dark:before:bg-zinc-800 hover:before:bg-zinc-100 dark:hover:before:bg-zinc-800'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-gray-600 hover:text-white hover:shadow-lg hover:shadow-gray-700/40 before:bg-gradient-to-br before:from-gray-700 before:via-gray-600 before:via-gray-600 before:to-gray-700 hover:before:bg-gradient-to-br hover:before:from-gray-700 hover:before:via-gray-600 hover:before:via-gray-600 hover:before:to-gray-700'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`relative z-0 flex items-center justify-center overflow-hidden rounded-md border px-4 py-2 font-semibold transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:transition-transform before:duration-1000 before:content-[''] hover:scale-105 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95 flex-1 text-sm ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-br from-gray-700 via-gray-600 via-gray-600 to-gray-700 text-white shadow-lg shadow-gray-700/40 border-gray-600 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 hover:shadow-none before:bg-zinc-100 dark:before:bg-zinc-800 hover:before:bg-zinc-100 dark:hover:before:bg-zinc-800'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-gray-600 hover:text-white hover:shadow-lg hover:shadow-gray-700/40 before:bg-gradient-to-br before:from-gray-700 before:via-gray-600 before:via-gray-600 before:to-gray-700 hover:before:bg-gradient-to-br hover:before:from-gray-700 hover:before:via-gray-600 hover:before:via-gray-600 hover:before:to-gray-700'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Login Card */}
            <div className="bg-card rounded-2xl shadow-lg p-10 border border-border relative input-energy-border">
          {activeTab === 'login' ? (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email field */}
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@provider.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
                  />
                </div>

                {/* Password field */}
                <div className="mb-6">
                  <div className="mb-1.5 flex items-end justify-between">
                    <label
                      htmlFor="password"
                      className="block text-zinc-500 dark:text-zinc-400"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 dark:text-blue-400"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
                  />
                </div>

                {successMessage && (
                  <div className="p-4 text-sm text-green-700 bg-green-50/80 border border-green-200/60 rounded-lg backdrop-blur-sm">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Sign in button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="!bg-gradient-to-br !from-gray-700 !via-gray-600 !via-gray-600 !to-gray-700 hover:!from-gray-600 hover:!via-gray-500 hover:!to-gray-600 !text-white font-sans font-medium text-base rounded-lg shadow-lg shadow-gray-700/40 transition-all duration-200 w-full h-12"
                >
                  {loading ? 'Iniciando sesión...' : 'Sign in'}
                </Button>

                {/* Terms and conditions */}
                <p className="text-xs text-center text-muted-foreground font-sans mt-6">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium">
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <h2 className="text-2xl font-semibold text-card-foreground font-sans">
                Crear cuenta
              </h2>
              <p className="text-sm text-muted-foreground font-sans">
                El registro se gestiona desde la landing de tu organización.
              </p>
              <Button
                onClick={() => setActiveTab('login')}
                variant="outline"
                className="border-border text-foreground hover:bg-muted font-sans"
              >
                Volver a iniciar sesión
              </Button>
            </div>
          )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

