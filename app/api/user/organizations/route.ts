import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Disable static optimization for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Explicitly use Node.js runtime

export async function GET(request: Request) {
  console.log('[API /user/organizations] Request received')
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('[API /user/organizations] userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Initialize Supabase client at runtime (not build time)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iaazpsvjiltlkhyeakmx.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Nzk1MTAsImV4cCI6MjA3NDQ1NTUxMH0.kVn7eIZEzNjImOe5yNgqPJOzN-IGUjN2AkzOALflZms'
    
    console.log('[API /user/organizations] Config:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      keyPrefix: (supabaseServiceKey || supabaseAnonKey)?.substring(0, 20)
    })
    
    // Use service role if available, fallback to anon key (temporary workaround)
    const apiKey = supabaseServiceKey || supabaseAnonKey
    
    if (!apiKey) {
      console.error('[API /user/organizations] No API key available')
      return NextResponse.json({ 
        error: 'Server configuration error - missing API key',
        data: []
      }, { status: 500 })
    }

    if (!supabaseServiceKey) {
      console.warn('[API /user/organizations] ⚠️ Using ANON key as fallback - get Service Role Key from Supabase Dashboard!')
    }

    // Use service role to bypass RLS for initial auth check
    const supabaseAdmin = createClient(supabaseUrl, apiKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('[API /user/organizations] Querying database...')

    // Simple direct query with service role
    const { data, error } = await supabaseAdmin
      .from('user_organizations')
      .select(`
        role,
        initiative_id,
        organization_id,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('auth_user_id', userId)
      .eq('active', true)

    if (error) {
      console.error('[API /user/organizations] Database error:', error)
      return NextResponse.json({ 
        error: error.message,
        data: []
      }, { status: 500 })
    }

    console.log('[API /user/organizations] Success - found', data?.length || 0, 'organizations')
    return NextResponse.json({ data: data || [] })

  } catch (err: any) {
    console.error('[API /user/organizations] Unexpected error:', err)
    return NextResponse.json({ 
      error: err?.message || 'Unknown error',
      data: []
    }, { status: 500 })
  }
}

