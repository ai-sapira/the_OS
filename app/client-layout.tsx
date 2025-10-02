"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { CommandPalette } from "@/components/command-palette"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        {children}
      </Suspense>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
