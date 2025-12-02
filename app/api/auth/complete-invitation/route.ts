import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient, getAuthUserId } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const authUserId = await getAuthUserId()
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { organization_id, role, initiative_id } = body

    if (!organization_id) {
      return NextResponse.json({ error: 'Missing organization_id' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()

    // Get user email from auth
    const { data: authUser } = await admin.auth.admin.getUserById(authUserId)
    if (!authUser?.user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const userEmail = authUser.user.email.toLowerCase()
    const userRole = role || authUser.user.user_metadata?.role || "EMP"
    const initId = initiative_id || authUser.user.user_metadata?.initiative_id || null

    // Create or update user in users table
    const { data: existingUser } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle()

    if (!existingUser) {
      const { error: userError } = await admin.from("users").insert({
        id: authUserId,
        auth_user_id: authUserId,
        email: userEmail,
        name: userEmail.split("@")[0] || "Usuario",
        organization_id: organization_id,
        role: userRole as any,
        active: true,
      })

      if (userError) {
        console.error("Error creating user:", userError)
        return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
      }
    }

    // Get invitation metadata to retrieve sapira_role_type if exists
    const { data: invitation } = await admin
      .from("user_invitations")
      .select("sapira_role_type")
      .eq("email", userEmail)
      .eq("organization_id", organization_id)
      .is("accepted_at", null)
      .maybeSingle()

    const sapiraRoleType = invitation?.sapira_role_type || null

    // Create user_organizations entry
    let orgError = null
    const { error: insertOrgError } = await admin
      .from("user_organizations")
      .insert({
        auth_user_id: authUserId,
        organization_id: organization_id,
        role: userRole,
        initiative_id: initId,
        sapira_role_type: userRole === "SAP" ? sapiraRoleType : null,
        active: true,
      })

    if (insertOrgError?.code === "23505") {
      const { error: updateOrgError } = await admin
        .from("user_organizations")
        .update({
          active: true,
          role: userRole,
          sapira_role_type: userRole === "SAP" ? sapiraRoleType : null,
        })
        .eq("auth_user_id", authUserId)
        .eq("organization_id", organization_id)
      orgError = updateOrgError
    } else {
      orgError = insertOrgError
    }

    if (orgError) {
      console.error("Error creating user_organization:", orgError)
      return NextResponse.json({ error: "Error al vincular usuario con organización" }, { status: 500 })
    }

    // Mark invitation as accepted if exists
    await admin
      .from("user_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("email", userEmail)
      .eq("organization_id", organization_id)
      .is("accepted_at", null)
      .catch(() => null) // Ignore errors

    // Get organization slug for redirect
    const { data: orgData } = await admin
      .from("organizations")
      .select("slug")
      .eq("id", organization_id)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      organization_slug: orgData?.slug || null,
    })
  } catch (err: any) {
    console.error("[API /auth/complete-invitation] Error:", err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}






