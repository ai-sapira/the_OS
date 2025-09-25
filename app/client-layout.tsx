"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { CommandPalette } from "@/components/command-palette"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { CreateIssueModal } from "@/components/create-issue-modal"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)

  const handleCreateIssue = (issue: any) => {
    console.log("Created issue:", issue)
    // This would typically update global state or trigger a refetch
  }

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

      <CreateIssueModal open={createIssueOpen} onOpenChange={setCreateIssueOpen} onCreateIssue={handleCreateIssue} />

      {/* Global Keyboard Shortcuts */}
      <KeyboardShortcuts
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenCreateIssue={() => setCreateIssueOpen(true)}
      />
    </>
  )
}
