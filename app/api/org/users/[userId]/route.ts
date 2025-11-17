import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient, getAuthUserId, isOrgAdmin } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Get user_organization
    const { data: userOrg, error: orgError } = await admin
      .from("user_organizations")
      .select("id, role, status, is_org_admin, invited_at, last_login_at, auth_user_id")
      .eq("id", params.userId)
      .eq("organization_id", organizationId)
      .single()

    if (orgError || !userOrg) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user details
    const { data: userData } = await admin
      .from("users")
      .select("id, email, name, first_name, last_name, phone, avatar_url, reports_to_user_id, team")
      .eq("auth_user_id", userOrg.auth_user_id)
      .maybeSingle()

    // Get reports_to user name if exists
    let reportsToName = null
    if (userData?.reports_to_user_id) {
      const { data: reportsToUser } = await admin
        .from("users")
        .select("name, first_name, last_name")
        .eq("id", userData.reports_to_user_id)
        .maybeSingle()
      
      if (reportsToUser) {
        reportsToName = reportsToUser.first_name && reportsToUser.last_name
          ? `${reportsToUser.first_name} ${reportsToUser.last_name}`
          : reportsToUser.name
      }
    }

    return NextResponse.json({
      user: {
        ...userOrg,
        user: userData || {
          id: userOrg.auth_user_id,
          email: null,
          name: null,
          first_name: null,
          last_name: null,
          phone: null,
          avatar_url: null,
          reports_to_user_id: null,
          team: null,
        },
        reports_to_name: reportsToName,
      },
    })
  } catch (err: any) {
    console.error("[API /org/users/[userId]] Error:", err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const body = await req.json().catch(() => ({}))
    const {
      first_name,
      last_name,
      phone,
      team,
      role,
      status,
      is_org_admin,
      reports_to_user_id,
    } = body

    const admin = createAdminSupabaseClient()

    // Get user_organization to find auth_user_id
    const { data: userOrg } = await admin
      .from("user_organizations")
      .select("auth_user_id")
      .eq("id", params.userId)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (!userOrg) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user_organizations
    const orgUpdates: Record<string, any> = {}
    if (role !== undefined && ["SAP", "CEO", "BU", "EMP"].includes(role)) {
      orgUpdates.role = role
    }
    if (status !== undefined && ["invited", "registered", "suspended"].includes(status)) {
      orgUpdates.status = status
    }
    if (is_org_admin !== undefined) {
      orgUpdates.is_org_admin = is_org_admin
    }

    if (Object.keys(orgUpdates).length > 0) {
      const { error: orgError } = await admin
        .from("user_organizations")
        .update(orgUpdates)
        .eq("id", params.userId)

      if (orgError) {
        return NextResponse.json({ error: orgError.message }, { status: 500 })
      }
    }

    // Update users table
    const userUpdates: Record<string, any> = {}
    if (first_name !== undefined) userUpdates.first_name = first_name
    if (last_name !== undefined) userUpdates.last_name = last_name
    if (phone !== undefined) userUpdates.phone = phone
    if (team !== undefined) userUpdates.team = team
    if (reports_to_user_id !== undefined) {
      userUpdates.reports_to_user_id = reports_to_user_id || null
    }

    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await admin
        .from("users")
        .update(userUpdates)
        .eq("auth_user_id", userOrg.auth_user_id)

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[API /org/users/[userId]] Error:", err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}



