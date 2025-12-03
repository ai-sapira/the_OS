import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password, first_name, last_name, org_slug, role, business_unit_id } = body

  // Validation
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
  }

  if (!org_slug) {
    return NextResponse.json({ error: "Slug de organización requerido" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Get organization by slug
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, name, allow_self_registration")
    .eq("slug", org_slug)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
  }

  if (!org.allow_self_registration) {
    return NextResponse.json({ error: "El registro automático no está habilitado para esta organización" }, { status: 403 })
  }

  // Validate role
  const validRole = role && ["EMP", "BU", "CEO"].includes(role) ? role : "EMP"
  
  // SAP role is never allowed in self-registration
  if (role === "SAP") {
    return NextResponse.json({ error: "El rol SAP no está disponible en auto-registro" }, { status: 403 })
  }

  // BU role requires business_unit_id
  if (validRole === "BU" && !business_unit_id) {
    return NextResponse.json({ error: "El rol BU requiere seleccionar una Business Unit" }, { status: 400 })
  }

  // Validate business unit exists and belongs to organization (if BU role)
  if (validRole === "BU" && business_unit_id) {
    const { data: businessUnit, error: businessUnitError } = await admin
      .from("business_units")
      .select("id, organization_id")
      .eq("id", business_unit_id)
      .eq("organization_id", org.id)
      .eq("active", true)
      .single()

    if (businessUnitError || !businessUnit) {
      return NextResponse.json({ error: "Business Unit no válida para esta organización" }, { status: 400 })
    }
  }

  // Extract domain from email
  const emailDomain = email.toLowerCase().split("@")[1]

  // Check if domain is allowed for this organization
  // Use the view in public schema instead of direct table access
  const { data: domainData, error: domainError } = await admin
    .from("control_org_domains_v")
    .select("id")
    .eq("organization_id", org.id)
    .eq("domain", emailDomain)
    .single()

  if (domainError || !domainData) {
    return NextResponse.json(
      { error: `El dominio ${emailDomain} no está permitido para esta organización` },
      { status: 403 }
    )
  }

  // Check if user already exists in users table
  const { data: existingUser } = await admin
    .from("users")
    .select("id, auth_user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle()
  
  if (existingUser) {
    return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true, // Auto-confirm email for self-registration
    user_metadata: {
      first_name: first_name || null,
      last_name: last_name || null,
      organization_id: org.id,
    },
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || "Error al crear usuario" }, { status: 500 })
  }

  const authUserId = authData.user.id

  // Create user in users table
  const { error: userError } = await admin.from("users").insert({
    id: authUserId,
    auth_user_id: authUserId,
    email: email.toLowerCase(),
    name: first_name && last_name ? `${first_name} ${last_name}` : email.split("@")[0],
    first_name: first_name || null,
    last_name: last_name || null,
    organization_id: org.id,
    role: validRole,
    active: true,
  })

  if (userError) {
    console.error("Error creating user:", userError)
    // Try to clean up auth user if user creation fails
    await admin.auth.admin.deleteUser(authUserId).catch(() => null)
    return NextResponse.json({ error: "Error al crear perfil de usuario" }, { status: 500 })
  }

  // Create user_organizations entry
  const { error: orgUserError } = await admin.from("user_organizations").insert({
    auth_user_id: authUserId,
    organization_id: org.id,
    role: validRole,
    business_unit_id: validRole === "BU" ? business_unit_id : null,
    active: true,
  })

  if (orgUserError) {
    console.error("Error creating user_organization:", orgUserError)
    // Try to clean up
    await admin.from("users").delete().eq("id", authUserId).catch(() => null)
    await admin.auth.admin.deleteUser(authUserId).catch(() => null)
    return NextResponse.json({ error: "Error al vincular usuario con organización" }, { status: 500 })
  }

  // Return success - client will handle login
  return NextResponse.json({
    success: true,
    message: "Usuario registrado correctamente",
    userId: authUserId,
  })
}

