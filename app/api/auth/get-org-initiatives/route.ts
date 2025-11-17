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

  // Get active initiatives (Business Units) for this organization
  const { data: initiatives, error: initiativesError } = await admin
    .from("initiatives")
    .select("id, name, slug")
    .eq("organization_id", org.id)
    .eq("active", true)
    .order("name")

  if (initiativesError) {
    return NextResponse.json({ error: "Error al obtener Business Units" }, { status: 500 })
  }

  return NextResponse.json({
    initiatives: initiatives || [],
  })
}

