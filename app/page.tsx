"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    console.log('[Home Page] Redirecting to /issues...')
    router.push("/issues")
  }, [router])

  console.log('[Home Page] Rendering loading spinner')

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
