import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const orgId = searchParams.get("orgId")

  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  try {
    // Get organization domains from the view
    const { data: domains, error: domainsError } = await admin
      .from("control_org_domains_v")
      .select("domain")
      .eq("organization_id", orgId)

    if (domainsError) {
      console.error('[check-org-domains] Error fetching domains:', domainsError)
      return NextResponse.json({ error: "Error al obtener dominios" }, { status: 500 })
    }

    const domainList = domains?.map(d => d.domain) || []

    return NextResponse.json({
      domains: domainList,
    })
  } catch (error: any) {
    console.error("[check-org-domains] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Error al obtener dominios" },
      { status: 500 }
    )
  }
}







