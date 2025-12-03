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
    .select("id")
    .eq("slug", slug)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
  }

  // Get active business units for this organization
  const { data: businessUnits, error: businessUnitsError } = await admin
    .from("business_units")
    .select("id, name, slug")
    .eq("organization_id", org.id)
    .eq("active", true)
    .order("name")

  if (businessUnitsError) {
    return NextResponse.json({ error: "Error al obtener Business Units" }, { status: 500 })
  }

  return NextResponse.json({
    // Return with both names for backwards compatibility
    businessUnits: businessUnits || [],
    initiatives: businessUnits || [], // Legacy alias
  })
}

