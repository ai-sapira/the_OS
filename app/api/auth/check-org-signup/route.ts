import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Get organization by slug
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, name, slug, allow_self_registration, logo_url")
    .eq("slug", slug)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
  }

  // Generate signed URL for logo if it exists
  let logoUrl: string | null = null
  if (org.logo_url) {
    try {
      const { data: signedData, error: signedError } = await admin
        .storage
        .from('org-logos')
        .createSignedUrl(org.logo_url, 60 * 60 * 24 * 7) // 7 days
      
      if (!signedError && signedData?.signedUrl) {
        logoUrl = signedData.signedUrl
      }
    } catch (err) {
      console.error('[check-org-signup] Error generating signed URL:', err)
    }
  }

  const organization = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo_url: logoUrl,
  }

  if (!org.allow_self_registration) {
    return NextResponse.json({
      allowsSignup: false,
      orgName: org.name,
      organization,
      error: "El registro automático no está habilitado para esta organización",
    })
  }

  // Get active initiatives (Business Units) for this organization
  const { data: initiatives } = await admin
    .from("initiatives")
    .select("id, name, slug")
    .eq("organization_id", org.id)
    .eq("active", true)
    .order("name")

  return NextResponse.json({
    allowsSignup: true,
    orgName: org.name,
    organizationId: org.id,
    organization,
    initiatives: initiatives || [],
  })
}


