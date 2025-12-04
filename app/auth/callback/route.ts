import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get("code")
  const organizationId = requestUrl.searchParams.get("organization_id")
  const role = requestUrl.searchParams.get("role")
  const initiativeId = requestUrl.searchParams.get("initiative_id")

  if (!code) {
    // If no code, redirect to client-side callback page to handle hash fragments
    // Preserve query params for organization_id, role, etc.
    const clientCallbackUrl = new URL('/auth/callback-client', requestUrl.origin)
    requestUrl.searchParams.forEach((value, key) => {
      if (key !== 'code') {
        clientCallbackUrl.searchParams.set(key, value)
      }
    })
    return NextResponse.redirect(clientCallbackUrl.toString())
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )

  // Exchange code for session
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData.session) {
    const errorMessage = sessionError?.message || 'Error al iniciar sesión'
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }

  const authUserId = sessionData.session.user.id

  // Get invitation metadata from user metadata or query params
  const userMetadata = sessionData.session.user.user_metadata
  const orgId = organizationId || userMetadata?.organization_id
  const userRole = role || userMetadata?.role || "EMP"
  const initId = initiativeId || userMetadata?.initiative_id || null

  if (!orgId) {
    // If no organization_id, check if user is Sapira and redirect to org selector
    const userEmail = sessionData.session.user.email?.toLowerCase() || ""
    if (userEmail.endsWith("@sapira.ai")) {
      return NextResponse.redirect(`${requestUrl.origin}/select-org`)
    }
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('missing_organization')}`)
  }

  // Use admin client to create user records
  const admin = createAdminSupabaseClient()

  // Create or update user in users table
  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle()

  // Get invitation metadata to retrieve sapira_role_type if exists (before creating user_organizations)
  const { data: invitation } = await admin
    .from("user_invitations")
    .select("sapira_role_type")
    .eq("email", sessionData.session.user.email?.toLowerCase())
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .maybeSingle()

  const sapiraRoleType = invitation?.sapira_role_type || null

  if (!existingUser) {
    const { error: userError } = await admin.from("users").insert({
      id: authUserId,
      auth_user_id: authUserId,
      email: sessionData.session.user.email || "",
      name: sessionData.session.user.email?.split("@")[0] || "Usuario",
      organization_id: orgId,
      role: userRole as any,
      active: true,
    })

    if (userError) {
      console.error("Error creating user:", userError)
    }
  }

  // Create user_organizations entry
  let orgError = null
  const { error: insertOrgError } = await admin
    .from("user_organizations")
    .insert({
      auth_user_id: authUserId,
      organization_id: orgId,
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
      .eq("organization_id", orgId)
    orgError = updateOrgError
  } else {
    orgError = insertOrgError
  }

  if (orgError) {
    console.error("Error creating user_organization:", orgError)
  }

  // Mark invitation as accepted if exists
  const { error: invitationUpdateError } = await admin
    .from("user_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("email", sessionData.session.user.email?.toLowerCase())
    .eq("organization_id", orgId)
    .is("accepted_at", null)

  if (invitationUpdateError) {
    console.warn("[auth/callback] Error updating invitation:", invitationUpdateError)
  }

  // Get organization slug for redirect
  const { data: orgData } = await admin
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .maybeSingle()

  // Redirect to app (or organization-specific route if slug exists)
  const redirectPath = orgData?.slug ? `/${orgData.slug}` : "/"
  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}



