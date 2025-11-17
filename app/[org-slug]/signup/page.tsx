"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SignupPage() {
  const params = useParams<{ 'org-slug': string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const orgSlug = params['org-slug'].toLowerCase()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'EMP' | 'BU' | 'CEO'>('EMP')
  const [initiativeId, setInitiativeId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [initiatives, setInitiatives] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [checkingOrg, setCheckingOrg] = useState(true)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Check if organization exists and allows self-registration
  useEffect(() => {
    const checkOrg = async () => {
      try {
        const res = await fetch(`/api/auth/check-org-signup?slug=${encodeURIComponent(orgSlug)}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Organización no encontrada')
          setCheckingOrg(false)
          return
        }

        if (!data.allowsSignup) {
          setError('El registro automático no está habilitado para esta organización')
          setCheckingOrg(false)
          return
        }

        setOrgName(data.orgName)
        setInitiatives(data.initiatives || [])
        setCheckingOrg(false)
      } catch (e: any) {
        setError('Error al verificar la organización')
        setCheckingOrg(false)
      }
    }
    
    if (orgSlug) {
      checkOrg()
    }
  }, [orgSlug])

  // Reset initiative when role changes
  useEffect(() => {
    if (role !== 'BU') {
      setInitiativeId('')
    }
  }, [role])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate BU role requires initiative
    if (role === 'BU' && !initiativeId) {
      setError('Debes seleccionar una Business Unit para el rol de BU Manager')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/auto-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          org_slug: orgSlug,
          role,
          initiative_id: role === 'BU' ? initiativeId : null,
        }),
      })

      // Read response text first to check if it's valid JSON
      const responseText = await res.text()
      console.log('[Signup] Response status:', res.status)
      console.log('[Signup] Response text:', responseText.substring(0, 200))

      if (!res.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || `Error ${res.status}: ${res.statusText}` }
        }
        throw new Error(errorData.error || 'Error al registrarse')
      }

      // Parse JSON response
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('[Signup] Failed to parse JSON:', parseError)
        throw new Error("Respuesta inválida del servidor")
      }

      // Guardar slug pendiente para selección posterior
      localStorage.setItem('sapira.pendingOrgSlug', orgSlug)

      // Success - try to auto-login
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })

        if (signInError) {
          router.push(`/login?registered=true&org=${encodeURIComponent(orgSlug)}&email=${encodeURIComponent(email)}`)
        } else {
          try {
            await fetch('/api/auth/select-org', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ slug: orgSlug }),
            })
          } catch (selectError) {
            console.error('[Signup] Failed to persist selected org:', selectError)
          }
          router.push('/issues')
        }
      } catch (loginErr) {
        router.push(`/login?registered=true&org=${encodeURIComponent(orgSlug)}&email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
      setLoading(false)
    }
  }

  if (checkingOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none"></div>
        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <p className="text-white font-medium">Verificando organización...</p>
        </div>
      </div>
    )
  }

  if (error && !orgName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none"></div>
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Error
            </h2>
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              {error}
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-medium"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
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
        <p className="text-lg text-gray-200 mt-4">Crear cuenta</p>
        {orgName && (
          <p className="text-sm text-gray-400 mt-1">
            Únete a <span className="font-medium text-white">{orgName}</span>
          </p>
        )}
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10 relative z-10">
        <h2 className="text-xl font-semibold text-white mb-1">
          Registro
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Completa tus datos para crear tu cuenta
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium text-gray-300">
                Nombre
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="h-10 px-3 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium text-gray-300">
                Apellidos
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="h-10 px-3 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-10 px-3 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-0.5">
              Debe ser un email del dominio permitido
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-gray-300">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="h-10 px-3 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-0.5">
              Mínimo 6 caracteres
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-medium text-gray-300">
              Rol
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'EMP' | 'BU' | 'CEO')} disabled={loading}>
              <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:border-white/20 focus:ring-1 focus:ring-white/10">
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20 shadow-xl">
                <SelectItem value="CEO" className="text-white hover:bg-white/20 focus:bg-white/20 focus:text-white cursor-pointer data-[highlighted]:bg-white/20 data-[highlighted]:text-white">
                  CEO
                </SelectItem>
                <SelectItem value="BU" className="text-white hover:bg-white/20 focus:bg-white/20 focus:text-white cursor-pointer data-[highlighted]:bg-white/20 data-[highlighted]:text-white">
                  BU Manager
                </SelectItem>
                <SelectItem value="EMP" className="text-white hover:bg-white/20 focus:bg-white/20 focus:text-white cursor-pointer data-[highlighted]:bg-white/20 data-[highlighted]:text-white">
                  Employee
                </SelectItem>
              </SelectContent>
            </Select>
            {role === 'BU' && initiatives.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                No hay Business Units disponibles. Selecciona otro rol.
              </p>
            )}
          </div>

          {role === 'BU' && initiatives.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="initiative" className="text-xs font-medium text-gray-300">
                Business Unit
              </Label>
              <Select value={initiativeId} onValueChange={setInitiativeId} disabled={loading} required>
                <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:border-white/20 focus:ring-1 focus:ring-white/10">
                  <SelectValue placeholder="Selecciona tu Business Unit" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {initiatives.map((initiative) => (
                    <SelectItem key={initiative.id} value={initiative.id} className="text-white focus:bg-white/10 cursor-pointer">
                      {initiative.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!initiativeId && role === 'BU' && (
                <p className="text-xs text-amber-400 mt-1">
                  Debes seleccionar una Business Unit
                </p>
              )}
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
            className="w-full h-10 bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm rounded-lg shadow-lg mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => router.push(`/login?org=${encodeURIComponent(orgSlug)}&email=${encodeURIComponent(email)}`)}
              className="text-white hover:underline font-medium"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

