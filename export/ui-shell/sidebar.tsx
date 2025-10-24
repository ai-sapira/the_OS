"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { cn } from "./utils"

export interface SidebarItem {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  section?: "global" | "workspace" | "context" | "footer"
  children?: SidebarItem[]
}

export interface SidebarProps {
  items: SidebarItem[]
  header?: ReactNode
  footer?: ReactNode
  isCollapsed?: boolean
}

export function Sidebar({ items, header, footer, isCollapsed = false }: SidebarProps) {
  const grouped = {
    global: items.filter((i) => i.section === "global"),
    workspace: items.filter((i) => i.section === "workspace"),
    context: items.filter((i) => i.section === "context"),
    footer: items.filter((i) => i.section === "footer"),
  }

  const renderItem = (item: SidebarItem, isChild = false) => {
    const content = (
      <div
        className={cn(
          "w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isChild && "ml-6 h-7 text-sm"
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
        </div>
      </div>
    )

    if (item.href) {
      return (
        <Link key={item.id} href={item.href} className="block">
          {content}
        </Link>
      )
    }
    return (
      <div key={item.id} className="block">
        {content}
      </div>
    )
  }

  const renderSection = (title: string, sectionItems: SidebarItem[]) => {
    if (sectionItems.length === 0) return null
    return (
      <div className="px-4 pb-4">
        {!isCollapsed && (
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            {title}
          </h3>
        )}
        <div className="space-y-1">{sectionItems.map((i) => renderItem(i))}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col transition-all duration-200 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{ background: "var(--bg-app)" }}
    >
      {header}
      <div className="flex-1 overflow-auto pt-2">
        {renderSection("Global", grouped.global)}
        {renderSection("Workspace", grouped.workspace)}
        {renderSection("Quick Access", grouped.context)}
      </div>
      {footer && <div className="px-4 py-3">{footer}</div>}
    </div>
  )
}



