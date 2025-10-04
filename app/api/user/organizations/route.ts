import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role to bypass RLS for initial auth check
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    console.log('[API /user/organizations] Getting orgs for user:', userId)

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
      console.error('[API /user/organizations] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API /user/organizations] Success:', data)
    return NextResponse.json({ data })

  } catch (err: any) {
    console.error('[API /user/organizations] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

