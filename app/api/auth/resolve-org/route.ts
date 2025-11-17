import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

interface ResolveOrgResponse {
  email: string
  domain: string
  existing_user: boolean
  organization?: {
    id: string
    slug: string
    name: string
    allow_registration: boolean
    logo_url: string | null
  }
  message?: string
}

function extractEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  const match = trimmed.match(/^[^@\s]+@([^@\s]+)$/)
  return match ? match[1] : null
}

export async function POST(req: NextRequest) {
  let email: string | undefined

  try {
    const body = await req.json()
    email = typeof body?.email === "string" ? body.email.trim() : undefined
  } catch (error) {
    // Ignore JSON parse errors, we'll handle missing email below
  }

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 })
  }

  const domain = extractEmailDomain(email)
  if (!domain) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  try {
    // Special handling for @sapira.ai users - they don't have a single organization
    // They should go directly to login and then select organization
    if (domain === "sapira.ai") {
      // Check if user already exists
      const { data: existingUser } = await admin
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle()

      const response: ResolveOrgResponse = {
        email,
        domain,
        existing_user: !!existingUser,
        // No organization field - this signals to redirect to login/select-org
        message: existingUser 
          ? "Redirigiendo al inicio de sesión..." 
          : "Redirigiendo al registro...",
      }
      return NextResponse.json(response)
    }

    // Find organization by domain for non-Sapira users
    const { data: domainMatch, error: domainError } = await admin
      .from("control_org_domains_v")
      .select("organization_id, domain")
      .eq("domain", domain)
      .maybeSingle()

    if (domainError) {
      throw domainError
    }

    if (!domainMatch?.organization_id) {
      const response: ResolveOrgResponse = {
        email,
        domain,
        existing_user: false,
        message: "Tu organización aún no está activa; contacta a soporte.",
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Get organization details
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("id, name, slug, allow_self_registration, logo_url")
      .eq("id", domainMatch.organization_id)
      .maybeSingle()

    if (orgError || !org) {
      throw orgError || new Error("Organización no encontrada")
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
        console.error('[resolve-org] Error generating signed URL:', err)
      }
    }

    // Check if user already exists
    const { data: existingUser } = await admin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    const response: ResolveOrgResponse = {
      email,
      domain,
      existing_user: !!existingUser,
      organization: {
        id: org.id,
        slug: org.slug,
        name: org.name,
        allow_registration: !!org.allow_self_registration,
        logo_url: logoUrl,
      },
    }

    if (!org.allow_self_registration) {
      response.message = "El registro automático no está disponible para esta organización."
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[resolve-org] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Error al resolver la organización" },
      { status: 500 }
    )
  }
}

