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

  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient<Database>>]
  }
})
