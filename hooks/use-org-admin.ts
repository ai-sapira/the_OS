"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"

export function useOrgAdmin() {
  const { user, currentOrg } = useAuth()
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !currentOrg) {
      setIsOrgAdmin(false)
      setLoading(false)
      return
    }

    // Check if user is org admin based on role or flag
    const checkOrgAdmin = async () => {
      try {
        // CEO and SAP are always org admins
        if (currentOrg.role === "CEO" || currentOrg.role === "SAP") {
          setIsOrgAdmin(true)
          setLoading(false)
          return
        }

        // For other roles, check is_org_admin flag from user_organizations
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          setIsOrgAdmin(false)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("user_organizations")
          .select("is_org_admin")
          .eq("auth_user_id", user.id)
          .eq("organization_id", currentOrg.organization.id)
          .eq("active", true)
          .single()

        if (error || !data) {
          setIsOrgAdmin(false)
        } else {
          setIsOrgAdmin(data.is_org_admin === true)
        }
      } catch (err) {
        setIsOrgAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkOrgAdmin()
  }, [user, currentOrg])

  return { isOrgAdmin, loading }
}

