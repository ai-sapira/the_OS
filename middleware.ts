import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RESERVED_SLUGS = new Set(['login', 'api', '_next', 'favicon.ico'])

function extractSlug(pathname: string): string | null {
  const match = pathname.match(/^\/([^\/]+)(?:\/.*)?$/)
  if (!match) return null
  const slug = match[1].toLowerCase()
  if (RESERVED_SLUGS.has(slug)) return null
  return slug
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API routes - they handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  const slug = extractSlug(pathname)
  const isOrgLanding = !!slug && (pathname === `/${slug}` || pathname === `/${slug}/`)
  const isOrgSignup = !!slug && pathname.startsWith(`/${slug}/signup`)
  const isRoot = pathname === '/' || pathname === ''
  const isLogin = pathname.startsWith('/login')
  const isSelectOrg = pathname.startsWith('/select-org')
  const isAuthPage = isRoot || isLogin
  const isPublic = isAuthPage || isOrgLanding || isOrgSignup

  // For public routes, only set org slug cookie if needed, no auth check
  if (isPublic) {
    const res = NextResponse.next()
    if (slug && (isOrgLanding || isOrgSignup)) {
      res.cookies.set({
        name: 'sapira-org-slug',
        value: slug,
        path: '/',
        sameSite: 'lax',
      })
    }
    return res
  }

  // For private routes, check session (but only create client when needed)
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Get environment variables inside the function (lazy evaluation)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // Only check session for private routes
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect authenticated users away from auth pages
  if (session && (isRoot || isLogin)) {
    const redirectUrl = new URL('/issues', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect unauthenticated users to landing
  if (!session) {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}

