"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have hash fragments (client-side auth)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const hashError = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        const errorCode = hashParams.get('error_code')

        // Handle errors from hash
        if (hashError) {
          console.error('[Auth Callback] Error from hash:', hashError, errorCode, errorDescription)
          let errorMessage = 'Error de autenticación'
          
          if (errorCode === 'otp_expired') {
            errorMessage = 'El enlace de acceso ha expirado. Por favor, solicita un nuevo enlace.'
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription)
          }
          
          setError(errorMessage)
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
          return
        }

        if (accessToken && refreshToken) {
          try {
            // Set the session using the tokens from hash
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (sessionError) {
              console.error('[Auth Callback] Error setting session:', sessionError)
              router.push(`/login?error=${encodeURIComponent(sessionError.message)}`)
              return
            }

            if (sessionData.session) {
              // Get organization info from URL params or user metadata
              const organizationId = searchParams.get('organization_id')
              const role = searchParams.get('role')
              const initiativeId = searchParams.get('initiative_id')

              // If we have organization info, we need to create user records via API
              if (organizationId) {
                try {
                  // Call our API to create user records
                  const response = await fetch('/api/auth/complete-invitation', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      organization_id: organizationId,
                      role: role || 'EMP',
                      initiative_id: initiativeId || null,
                    }),
                  })

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || 'Error al completar la invitación')
                  }

                  const data = await response.json()
                  
                  // Redirect based on organization slug
                  if (data.organization_slug) {
                    router.push(`/${data.organization_slug}`)
                  } else {
                    router.push('/initiatives')
                  }
                  return
                } catch (apiError: any) {
                  console.error('[Auth Callback] Error calling API:', apiError)
                  router.push(`/login?error=${encodeURIComponent(apiError.message || 'Error al completar la invitación')}`)
                  return
                }
              }

              // No organization info - check if user is Sapira
              const userEmail = sessionData.session.user.email?.toLowerCase() || ''
              if (userEmail.endsWith('@sapira.ai')) {
                router.push('/select-org')
                return
              }

              // Regular user - redirect to initiatives
              router.push('/initiatives')
              return
            }
          } catch (err: any) {
            console.error('[Auth Callback] Unexpected error:', err)
            router.push(`/login?error=${encodeURIComponent(err.message || 'Error inesperado')}`)
            return
          }
        }
      }

      // Check if we have a code parameter (server-side auth)
      const code = searchParams.get('code')
      if (code) {
        // This should be handled by the server route, redirect to it
        const callbackUrl = new URL('/auth/callback', window.location.origin)
        searchParams.forEach((value, key) => {
          callbackUrl.searchParams.set(key, value)
        })
        window.location.href = callbackUrl.toString()
        return
      }

      // No hash or code - check for error in query params
      const queryError = searchParams.get('error')
      if (queryError) {
        setError(decodeURIComponent(queryError))
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(queryError)}`)
        }, 2000)
        return
      }

      // No auth data - redirect to login
      router.push('/login?error=missing_auth_data')
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">⚠️ Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Procesando autenticación...</p>
      </div>
    </div>
  )
}
