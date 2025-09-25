"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Circle, CheckCircle2, Clock, AlertCircle, ArrowUp, ArrowDown, Minus, Plus } from "lucide-react"

interface Issue {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  project: string
  projectColor: string
  created: string
  updated: string
}

interface KanbanBoardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function KanbanBoard({ issues, onIssueClick }: KanbanBoardProps) {
  const columns = [
    { id: "backlog", title: "Backlog", color: "border-muted" },
    { id: "in-progress", title: "En progreso", color: "border-blue-500" },
    { id: "review", title: "En revisión", color: "border-orange-500" },
    { id: "done", title: "Completado", color: "border-green-500" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case "low":
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status)
  }

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-6">
      {columns.map((column) => {
        const columnIssues = getIssuesByStatus(column.id)

        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {columnIssues.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className={`border-t-2 ${column.color} pt-4`}>
              <div className="space-y-3">
                {columnIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onIssueClick(issue)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                          {getPriorityIcon(issue.priority)}
                        </div>
                        {getStatusIcon(issue.status)}
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1 text-balance">{issue.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{issue.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${issue.projectColor}`} />
                          <span className="text-xs text-muted-foreground">{issue.project}</span>
                        </div>

                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {issue.assignee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </Card>
                ))}

                {columnIssues.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No hay tickets</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
