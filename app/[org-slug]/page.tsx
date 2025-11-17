import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

interface OrgLandingProps {
  params: { "org-slug": string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

async function fetchOrganization(slug: string) {
  const admin = createAdminSupabaseClient()

  const { data, error } = await admin
    .from("organizations")
    .select("id, name, slug, allow_self_registration, logo_url")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw error
  }

  // Generate signed URL for logo if it exists
  if (data?.logo_url) {
    try {
      const { data: signedData, error: signedError } = await admin
        .storage
        .from('org-logos')
        .createSignedUrl(data.logo_url, 60 * 60 * 24 * 7) // 7 days
      
      if (!signedError && signedData?.signedUrl) {
        return {
          ...data,
          logo_url: signedData.signedUrl,
        }
      }
    } catch (err) {
      console.error('[org-slug] Error generating signed URL:', err)
    }
  }

  return data
}

export default async function OrgLandingPage({ params, searchParams }: OrgLandingProps) {
  const slug = params["org-slug"].toLowerCase()
  const organization = await fetchOrganization(slug)

  if (!organization) {
    notFound()
  }

  // Note: The cookie is set by middleware, no need to set it here

  const emailParam = typeof searchParams?.email === "string" ? searchParams?.email : ""
  const queryEmail = emailParam ? `&email=${encodeURIComponent(emailParam)}` : ""

  const loginUrl = `/login?org=${encodeURIComponent(slug)}${queryEmail}`
  const signupUrl = `/${encodeURIComponent(slug)}/signup${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ""}`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-2xl space-y-10 text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="mx-auto h-16 w-auto mb-6"
            />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold text-white mb-6">
              {organization.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {organization.name.toLowerCase()} en Sapira Pharo
          </h1>
          <p className="text-sm text-gray-400">
            Accede a la instancia de Sapira Pharo para tu organización.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
          <Link
            href={loginUrl}
            className="flex items-center justify-center rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all shadow-lg"
          >
            Iniciar sesión
          </Link>

          {organization.allow_self_registration ? (
            <Link
              href={signupUrl}
              className="flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 text-sm font-medium shadow-lg transition-all"
            >
              Registrarse
            </Link>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-600 bg-gray-800/50 px-6 py-3 text-sm text-gray-400">
              El registro está gestionado por un administrador
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-400">
          ¿Necesitas ayuda? Escríbenos a <span className="font-medium text-gray-300">soporte@sapira.ai</span>
        </div>
      </div>
    </div>
  )
}
