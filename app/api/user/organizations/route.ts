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
    
    console.log('[API /user/organizations] Config:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      keyPrefix: supabaseServiceKey?.substring(0, 20)
    })
    
    if (!supabaseServiceKey) {
      console.error('[API /user/organizations] Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ 
        error: 'Server configuration error - missing service key',
        data: []
      }, { status: 500 })
    }

    // Use service role to bypass RLS for initial auth check
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
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

