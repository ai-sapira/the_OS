import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/select-org')

  // MODO DEMO: Autenticación desactivada - Permitir acceso sin login
  
  // // If not authenticated and trying to access protected route
  // if (!session && !isAuthPage) {
  //   const redirectUrl = new URL('/login', req.url)
  //   return NextResponse.redirect(redirectUrl)
  // }

  // // If authenticated and on login page, redirect to app
  // if (session && req.nextUrl.pathname === '/login') {
  //   const redirectUrl = new URL('/', req.url)
  //   return NextResponse.redirect(redirectUrl)
  // }

  // Check if user has selected an organization (except for select-org page itself)
  if (session && !isAuthPage && req.nextUrl.pathname !== '/select-org') {
    // Check if user has currentOrg in their session
    // This will be handled by the AuthProvider in the client
    // For now, just let them through
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

