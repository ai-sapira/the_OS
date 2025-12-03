import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient, getAuthUserId, isOrgAdmin } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { organization_id, email, role, business_unit_id } = body

    if (!organization_id) {
      return NextResponse.json({ error: 'Missing organization_id' }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    if (!role || !["SAP", "CEO", "BU", "EMP"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (role === "BU" && !business_unit_id) {
      return NextResponse.json({ error: "BU role requires business_unit_id" }, { status: 400 })
    }

    const authUserId = await getAuthUserId()
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is org admin
    const userIsAdmin = await isOrgAdmin(authUserId, organization_id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Not an organization admin' }, { status: 403 })
    }

    const admin = createAdminSupabaseClient()

    // Check if user already exists in auth.users
    const { data: authUser } = await admin.auth.admin.getUserByEmail(email).catch(() => ({ data: { user: null } }))
    
    if (authUser?.user) {
      // Check if user is already in this organization
      const { data: existingUser } = await admin
        .from("user_organizations")
        .select("id, status")
        .eq("organization_id", organization_id)
        .eq("auth_user_id", authUser.user.id)
        .single()
        .catch(() => ({ data: null }))

      if (existingUser && existingUser.status !== "suspended") {
        return NextResponse.json({ error: "User already exists in this organization" }, { status: 409 })
      }
    }

    // Get organization slug for redirect URL
    const { data: orgData } = await admin
      .from("organizations")
      .select("slug")
      .eq("id", organization_id)
      .single()
      .catch(() => ({ data: null }))

    // Build redirect URL - ensure it's absolute and uses production URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://backofficepharo.vercel.app'
    const redirectTo = orgData?.slug
      ? `${baseUrl}/${orgData.slug}/auth/callback?organization_id=${organization_id}&role=${role}${business_unit_id ? `&business_unit_id=${business_unit_id}` : ''}`
      : `${baseUrl}/auth/callback?organization_id=${organization_id}&role=${role}${business_unit_id ? `&business_unit_id=${business_unit_id}` : ''}`

    console.log('[API /org/users/invite] Redirect URL:', redirectTo)
    console.log('[API /org/users/invite] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    // Use Supabase Auth native invite function
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        organization_id,
        role,
        business_unit_id: business_unit_id || null,
      },
      redirectTo,
    })

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Store invitation metadata in our table for tracking
    await admin
      .from("user_invitations")
      .insert({
        organization_id,
        email: email.toLowerCase(),
        role,
        business_unit_id: business_unit_id || null,
        invited_by_user_id: authUserId,
        token: inviteData.user?.id || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .catch(() => null) // Ignore errors if invitation already exists

    return NextResponse.json({
      success: true,
      message: "Invitación enviada por email",
      user: inviteData.user,
    })
  } catch (err: any) {
    console.error("[API /org/users/invite] Error:", err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}



