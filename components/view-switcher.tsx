"use client"

import { Button } from "@/components/ui/button"
import { List, Kanban } from "lucide-react"

interface ViewSwitcherProps {
  currentView: "list" | "board"
  onViewChange: (view: "list" | "board") => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: "list" as const, label: "Lista", icon: List },
    { id: "board" as const, label: "Board", icon: Kanban },
  ]

  return (
    <div className="inline-flex items-center gap-0 h-7 rounded-lg border-dashed border border-gray-200 bg-gray-50">
      {views.map((view, index) => (
        <button
          key={view.id}
          className={`h-full px-3 text-xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
            index > 0 ? 'border-l border-gray-200' : ''
          } ${
            index === 0 ? 'rounded-l-lg' : ''
          } ${
            index === views.length - 1 ? 'rounded-r-lg' : ''
          } ${
            currentView === view.id 
              ? "bg-gray-100 text-gray-900 font-medium" 
              : "text-gray-600 hover:text-gray-700 hover:bg-gray-100 bg-gray-50"
          }`}
          onClick={() => onViewChange(view.id)}
        >
          <view.icon className="h-3 w-3 text-gray-500 flex-shrink-0" />
          <span className="flex-shrink-0">{view.label}</span>
        </button>
      ))}
    </div>
  )
}
