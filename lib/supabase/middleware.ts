import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase session by refreshing tokens and syncing cookies.
 * 
 * This follows the official Supabase SSR pattern:
 * 1. Creates a server client with cookie handlers
 * 2. Refreshes the auth token with getUser()
 * 3. Returns the response with updated cookies
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */
export async function updateSession(request: NextRequest) {
  // Create initial response - we'll update cookies on this
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First, set on request for downstream handlers
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          // Create new response with updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Then set on response for browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: This refreshes the auth token and updates cookies
  // getUser() validates the JWT with the Supabase Auth server
  // This is THE key to maintaining session across page loads
  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}


