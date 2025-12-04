import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// These are app routes that should NOT be treated as organization slugs
// Only add routes here that exist as top-level folders in /app
const APP_ROUTES = new Set([
  'fde',
  'meetings',
  'my-sapira',
  'home',
  'initiatives',
  'projects',
  'business-units',
  'insights',
  'integrations',
  'metrics',
  'compliance',
  'surveys',
  'users',
  'evals',
  'roadmap',
  'billing',
  'onboarding',
  'triage-new',
  'user-monitoring',
  'auth',
  'select-org',
  'demo',
  'layout-test',
])

// Reserved slugs that have special handling
const RESERVED_SLUGS = new Set(['login', 'api', '_next', 'favicon.ico'])

function extractSlug(pathname: string): string | null {
  const match = pathname.match(/^\/([^\/]+)(?:\/.*)?$/)
  if (!match) return null
  const slug = match[1].toLowerCase()
  // If it's a reserved slug or an app route, it's not an org slug
  if (RESERVED_SLUGS.has(slug) || APP_ROUTES.has(slug)) return null
  return slug
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets - these don't need auth
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Skip API routes - they handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const slug = extractSlug(pathname)
  const isOrgLanding = !!slug && (pathname === `/${slug}` || pathname === `/${slug}/`)
  const isOrgSignup = !!slug && pathname.startsWith(`/${slug}/signup`)
  const isRoot = pathname === '/' || pathname === ''
  const isLogin = pathname.startsWith('/login')
  const isSelectOrg = pathname.startsWith('/select-org')
  const isAuthCallback = pathname.startsWith('/auth/')
  const isPublicRoute = isRoot || isLogin || isOrgLanding || isOrgSignup || isAuthCallback

  // CRITICAL: Always update session - this refreshes cookies
  // Even for public routes, we need to refresh the session if it exists
  const { supabaseResponse, user } = await updateSession(req)

  // Set org slug cookie for landing/signup pages
  if (slug && (isOrgLanding || isOrgSignup)) {
    supabaseResponse.cookies.set({
      name: 'sapira-org-slug',
      value: slug,
      path: '/',
      sameSite: 'lax',
    })
  }

  // Redirect authenticated users away from auth pages
  if (user && (isRoot || isLogin)) {
    const redirectUrl = new URL('/initiatives', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // For protected routes, if no user, redirect to login
  // But DON'T redirect immediately after login - let client handle org selection
  if (!user && !isPublicRoute && !isSelectOrg) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // CRITICAL: Return the supabaseResponse, not a new NextResponse.next()
  // This ensures the refreshed cookies are sent to the browser
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
