import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { Database } from "../database/types"

// Server-side Supabase client with user session (for RLS)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
  }

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
  }

  const cookieStore = cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Server-side Supabase client with service role (bypasses RLS)
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
  }

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "sapira-admin-app" },
    },
  })
}

// Check if a user is an org admin (CEO, SAP, or is_org_admin = true)
export async function isOrgAdmin(authUserId: string, organizationId: string): Promise<boolean> {
  const admin = createAdminSupabaseClient()
  
  const { data, error } = await admin
    .from("user_organizations")
    .select("role, is_org_admin")
    .eq("auth_user_id", authUserId)
    .eq("organization_id", organizationId)
    .eq("active", true)
    .maybeSingle()
  
  if (error || !data) {
    return false
  }
  
  // CEO, SAP, or explicitly marked as org admin
  return data.role === "CEO" || data.role === "SAP" || data.is_org_admin === true
}

// Get user's auth ID from session
export async function getAuthUserId(): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id || null
}


