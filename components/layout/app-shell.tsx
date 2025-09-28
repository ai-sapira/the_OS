"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "@/components/sidebar"

interface AppShellProps {
  children: ReactNode
  onOpenCommandPalette?: () => void
  onOpenCreateIssue?: () => void
}

export function AppShell({ 
  children, 
  onOpenCommandPalette, 
  onOpenCreateIssue 
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div 
      className="h-screen overflow-hidden md:grid md:grid-cols-[var(--sidebar-w)_1fr] flex flex-col"
      style={{ 
        background: 'var(--bg-app)' 
      }}
    >
      {/* Sidebar - desktop: fixed height, mobile: hidden/overlay */}
      <div 
        className="md:h-full md:z-20 hidden md:block"
        style={{ 
          background: 'transparent' 
        }}
      >
        <Sidebar 
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenCreateIssue={onOpenCreateIssue}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main canvas - responsive */}
      <main 
        className="relative z-10 flex-1 overflow-hidden"
        style={{ 
          background: 'transparent' 
        }}
      >
        {children}
      </main>
    </div>
  )
}
