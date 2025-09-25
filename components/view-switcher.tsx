"use client"

import { Button } from "@/components/ui/button"
import { List, Kanban, Calendar } from "lucide-react"

interface ViewSwitcherProps {
  currentView: "list" | "board" | "timeline"
  onViewChange: (view: "list" | "board" | "timeline") => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: "list" as const, label: "Lista", icon: List },
    { id: "board" as const, label: "Board", icon: Kanban },
    { id: "timeline" as const, label: "Timeline", icon: Calendar },
  ]

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {views.map((view) => (
        <Button
          key={view.id}
          variant={currentView === view.id ? "secondary" : "ghost"}
          size="sm"
          className="gap-2 h-8"
          onClick={() => onViewChange(view.id)}
        >
          <view.icon className="h-4 w-4" />
          {view.label}
        </Button>
      ))}
    </div>
  )
}
