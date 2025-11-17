import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient, getAuthUserId, isOrgAdmin } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organization_id')

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization_id' }, { status: 400 })
    }

    const authUserId = await getAuthUserId()
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is org admin
    const userIsAdmin = await isOrgAdmin(authUserId, organizationId)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Not an organization admin' }, { status: 403 })
    }

    const admin = createAdminSupabaseClient()

    // Get user_organizations for this org
    const { data: userOrgs, error } = await admin
      .from("user_organizations")
      .select("id, role, status, is_org_admin, invited_at, last_login_at, created_at, auth_user_id")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user details for each auth_user_id
    const users = await Promise.all(
      (userOrgs || []).map(async (uo) => {
        const { data: userData } = await admin
          .from("users")
          .select("id, email, name, first_name, last_name, phone, avatar_url, reports_to_user_id, team")
          .eq("auth_user_id", uo.auth_user_id)
          .maybeSingle()

        // Get auth user email if user not found in users table
        let email = userData?.email
        if (!email && uo.auth_user_id) {
          const { data: authUser } = await admin.auth.admin.getUserById(uo.auth_user_id).catch(() => ({ data: { user: null } }))
          email = authUser?.user?.email || null
        }

        return {
          ...uo,
          user: userData || {
            id: uo.auth_user_id,
            email,
            name: email?.split("@")[0] || null,
            first_name: null,
            last_name: null,
            phone: null,
            avatar_url: null,
            reports_to_user_id: null,
            team: null,
          },
        }
      })
    )

    // Get pending invitations
    const { data: invitations, error: invError } = await admin
      .from("user_invitations")
      .select("id, email, role, created_at, expires_at, accepted_at")
      .eq("organization_id", organizationId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })

    if (invError) {
      console.error("Error fetching invitations:", invError)
    }

    return NextResponse.json({
      users: users || [],
      invitations: invitations || [],
    })
  } catch (err: any) {
    console.error("[API /org/users] Error:", err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}



