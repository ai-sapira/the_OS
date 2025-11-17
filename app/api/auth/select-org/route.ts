import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let slug: string | null = null
  let organizationId: string | null = null

  try {
    const body = await req.json()
    if (typeof body?.slug === "string") {
      slug = body.slug.trim().toLowerCase()
    }
    if (typeof body?.organization_id === "string") {
      organizationId = body.organization_id
    }
  } catch (error) {
    // ignore parse error, we handle below
  }

  if (!slug && !organizationId) {
    return NextResponse.json({ error: "Missing slug or organization_id" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  try {
    let targetOrganizationId = organizationId

    if (!targetOrganizationId && slug) {
      const { data: org, error: orgError } = await admin
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()

      if (orgError) {
        throw orgError
      }

      if (!org) {
        return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
      }

      targetOrganizationId = org.id
    }

    if (!targetOrganizationId) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
    }

    const { data: membership } = await admin
      .from("user_organizations")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .eq("organization_id", targetOrganizationId)
      .eq("active", true)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a esta organización" }, { status: 403 })
    }

    const { error: updateError } = await admin
      .from("users")
      .update({ organization_id: targetOrganizationId })
      .eq("auth_user_id", session.user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[select-org] Error:", error)
    return NextResponse.json({ error: error?.message || "Error al seleccionar organización" }, { status: 500 })
  }
}

