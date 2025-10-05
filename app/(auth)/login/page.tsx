"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [isTransitioning, setIsTransitioning] = useState(false)

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
      console.log('[Login] Session:', data?.session)
      
      // Start transition animation
      setIsTransitioning(true)
      
      // Wait for cookies to be set and animation to start
      console.log('[Login] Waiting for cookies and transition animation...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log('[Login] Executing redirect now...')
      // Use router.push for client-side navigation with cookies
      router.push('/')
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
            <p className="text-gray-700 font-medium">Entrando a Sapira OS...</p>
          </div>
        </div>
      </div>

      <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 z-10 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {/* Logo and title */}
        <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-white">Sapira </span>
          <span className="text-gray-400 font-normal">OS</span>
        </h1>
        <p className="text-lg text-gray-200 mt-4">Bienvenido de vuelta</p>
        <p className="text-sm text-gray-400 mt-1">Conecta con profesionales de tu organización</p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-3 mb-8">
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
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Crear cuenta
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              El registro estará disponible próximamente
            </p>
            <Button
              onClick={() => setActiveTab('login')}
              variant="outline"
              className="mt-4 border-white/20 text-white hover:bg-white/10"
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

