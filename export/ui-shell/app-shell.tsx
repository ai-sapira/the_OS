"use client"

import { ReactNode } from "react"

interface AppShellProps {
  children: ReactNode
  sidebar: ReactNode
}

export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <div
      className="h-screen overflow-hidden md:grid md:grid-cols-[var(--sidebar-w)_1fr] flex flex-col"
      style={{ background: "var(--bg-app)" }}
    >
      <div className="md:h-full md:z-20 hidden md:block" style={{ background: "transparent" }}>
        {sidebar}
      </div>
      <main className="relative z-10 flex-1 overflow-hidden" style={{ background: "transparent" }}>
        {children}
      </main>
    </div>
  )
}


