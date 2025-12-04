import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../database/types'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  // Create browser client with default cookie handling from @supabase/ssr
  // This automatically handles cookie persistence for auth sessions
  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    // Ensure cookies are properly configured for auth persistence
    cookieOptions: {
      // Use 'lax' for cross-site navigation support
      sameSite: 'lax',
      // Don't require secure for localhost
      secure: process.env.NODE_ENV === 'production',
      // Explicit path to ensure cookies are sent for all routes
      path: '/',
    },
    auth: {
      // Ensure session is stored in cookies, not just localStorage
      flowType: 'pkce',
      // Detect session from URL (for OAuth/magic links)
      detectSessionInUrl: true,
      // Persist session
      persistSession: true,
      // Auto refresh token before expiry
      autoRefreshToken: true,
    },
  })
  
  return supabaseClient
}

// Proxy to lazy-load the client
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient<Database>>]
  }
})
