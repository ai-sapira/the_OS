import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  console.log('[API /user/organizations] Request received')

  try {
    const supabaseServer = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabaseServer.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized', data: [], defaultOrganizationId: null }, { status: 401 })
    }

    const userId = session.user.id

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    }

    if (!supabaseServiceKey && !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials')
    }

    console.log('[API /user/organizations] Config:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      keyPrefix: (supabaseServiceKey || supabaseAnonKey || '').substring(0, 20)
    })

    const apiKey = supabaseServiceKey || supabaseAnonKey!

    if (!supabaseServiceKey) {
      console.warn('[API /user/organizations] ⚠️ Using ANON key as fallback - configure SUPABASE_SERVICE_ROLE_KEY for full access')
    }

    const supabaseAdmin = createClient(supabaseUrl, apiKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'sapira-app-server',
        },
      },
    })

    console.log('[API /user/organizations] Querying database...')

    const { data, error } = await supabaseAdmin
      .from('user_organizations')
      .select(`
        role,
        initiative_id,
        sapira_role_type,
        organization_id,
        organizations (
          id,
          name,
          slug,
          logo_url,
          settings
        )
      `)
      .eq('auth_user_id', userId)
      .eq('active', true)

    if (error) {
      console.error('[API /user/organizations] Database error:', error)
      return NextResponse.json({
        error: error.message,
        data: [],
        defaultOrganizationId: null,
      }, { status: 500 })
    }

    // Generate signed URLs for logos if they exist
    const dataWithSignedUrls = await Promise.all(
      (data || []).map(async (item: any) => {
        if (item.organizations?.logo_url) {
          try {
            const { data: signedData, error: signedError } = await supabaseAdmin
              .storage
              .from('org-logos')
              .createSignedUrl(item.organizations.logo_url, 60 * 60 * 24 * 7) // 7 days
            
            if (!signedError && signedData?.signedUrl) {
              return {
                ...item,
                organizations: {
                  ...item.organizations,
                  logo_url: signedData.signedUrl,
                },
              }
            }
          } catch (err) {
            console.error('[API /user/organizations] Error generating signed URL:', err)
          }
        }
        return item
      })
    )

    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('[API /user/organizations] Error fetching user record:', userError)
    }

    const defaultOrganizationId = userRecord?.organization_id || null

    console.log('[API /user/organizations] Success - found', dataWithSignedUrls?.length || 0, 'organizations')

    return NextResponse.json({
      data: dataWithSignedUrls || [],
      defaultOrganizationId,
    })

  } catch (err: any) {
    console.error('[API /user/organizations] Unexpected error:', err)
    return NextResponse.json({
      error: err?.message || 'Unknown error',
      data: [],
      defaultOrganizationId: null,
    }, { status: 500 })
  }
}

