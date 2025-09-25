"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TriageActionModal } from "@/components/triage-action-modal"
import { IssueDetailModal } from "@/components/issue-detail-modal"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Paperclip,
  ChevronRight,
  Hash,
  Tag,
  Target,
  FolderOpen,
  ChevronDown,
} from "lucide-react"

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
  reporter?: string
  labels?: string[]
}

export default function TriagePage() {
  const [selectedIssueId, setSelectedIssueId] = useState<string>("SAI-458")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [triageAction, setTriageAction] = useState<"accept" | "duplicate" | "decline" | "snooze" | null>(null)
  const [triageIssue, setTriageIssue] = useState<Issue | null>(null)

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "SAI-458",
      title: "Prueba de triage",
      description: "Issue de prueba para validar el sistema de triage y workflow de revisión",
      status: "triage",
      priority: "medium",
      assignee: "pablosenabre",
      project: "Tecnología",
      projectColor: "bg-orange-500",
      created: "just now",
      updated: "just now",
      reporter: "pablosenabre",
      labels: ["test", "triage"],
    },
    {
      id: "SAI-307",
      title: "Licencia DGSFP & contratos",
      description: "Implementar sistema de licencias y gestión de contratos para cumplir con regulaciones",
      status: "triage",
      priority: "high",
      assignee: "Tech Team",
      project: "Tecnología",
      projectColor: "bg-blue-500",
      created: "hace 2 días",
      updated: "hace 1 hora",
      reporter: "Juan Pérez",
      labels: ["backend", "legal", "urgente"],
    },
    {
      id: "SAI-306",
      title: "Comparador - Resumen final modal sheet 75% en mobile",
      description: "Optimizar vista mobile del comparador de productos para mejorar UX",
      status: "triage",
      priority: "medium",
      assignee: "Design Team",
      project: "Marketing",
      projectColor: "bg-green-500",
      created: "hace 3 días",
      updated: "hace 2 horas",
      reporter: "María García",
      labels: ["frontend", "mobile", "ux"],
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      case "triage":
        return <Circle className="h-4 w-4 text-purple-400/70" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3 text-foreground" />
      case "low":
        return <ArrowDown className="h-3 w-3 text-muted-foreground" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      done: "bg-muted/50 text-muted-foreground border-border",
      "in-progress": "bg-muted/50 text-muted-foreground border-border",
      review: "bg-muted/50 text-muted-foreground border-border",
      backlog: "bg-muted text-muted-foreground border-border",
      triage: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    }

    const labels = {
      done: "Completado",
      "in-progress": "En progreso",
      review: "En revisión",
      backlog: "Backlog",
      triage: "Triage",
    }

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const handleCreateIssue = (newIssue: Issue) => {
    setIssues([{ ...newIssue, status: "triage" }, ...issues])
  }

  const handleNewTicket = () => {
    setShowCreateModal(true)
  }

  const handleTriageAction = (issue: Issue, action: "accept" | "duplicate" | "decline" | "snooze") => {
    setTriageIssue(issue)
    setTriageAction(action)
  }

  const handleTriageComplete = (action: string, data: any) => {
    if (!triageIssue) return

    setIssues(
      issues.map((issue) => {
        if (issue.id === triageIssue.id) {
          switch (action) {
            case "accept":
              return {
                ...issue,
                status: "backlog",
                priority: data.priority || issue.priority,
                assignee: data.assignee || issue.assignee,
                project: data.project || issue.project,
              }
            case "duplicate":
              return { ...issue, status: "duplicate" }
            case "decline":
              return { ...issue, status: "declined" }
            case "snooze":
              return { ...issue, status: "snoozed" }
            default:
              return issue
          }
        }
        return issue
      }),
    )

    setTriageIssue(null)
    setTriageAction(null)
  }

  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) || null

  const triageIssues = issues.filter((issue) => issue.status === "triage")

  return (
    <div className="h-screen w-screen bg-background grid grid-cols-[256px_320px_1fr_320px] gap-4 pt-6 overflow-hidden">
      {/* Sidebar - 256px */}
      <div className="bg-[#111] h-full overflow-hidden">
        <Sidebar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreateIssue={() => setShowCreateModal(true)}
        />
      </div>

      {/* Issue List - 320px */}
      <div className="bg-[#161616] h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Triage</h2>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs h-5 px-2">
              {triageIssues.length}
            </Badge>
          </div>
        </div>

        {/* Issue List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {triageIssues.map((issue) => (
            <div
              key={issue.id}
              className={`h-14 px-3 py-2 cursor-pointer transition-all duration-150 flex items-center gap-2 flex-shrink-0 ${
                selectedIssueId === issue.id ? "bg-[#1E1E1E] border-l-[3px] border-l-purple-400" : "hover:bg-[#1a1a1a]"
              }`}
              onClick={() => setSelectedIssueId(issue.id)}
            >
              {/* Avatar */}
              <Avatar className="h-4 w-4 flex-shrink-0">
                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                  {issue.reporter?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[12px] h-4 px-1.5">
                    Triage
                  </Badge>
                  <span className="text-[12px] font-mono text-blue-400">{issue.id}</span>
                </div>
                <h3 className="text-[13px] font-medium text-foreground truncate leading-tight">{issue.title}</h3>
                <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  <span>{issue.reporter}</span>
                  <span>•</span>
                  <span>{issue.created}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Detail - 1fr */}
      <div className="bg-[#1b1b1b] h-full flex flex-col overflow-hidden">
        {selectedIssue ? (
          <>
            {/* Issue Header */}
            <div className="px-6 pb-3 flex-shrink-0">
              <div className="flex items-baseline gap-3 mb-3">
                <h1 className="text-[20px] font-semibold text-foreground leading-7">{selectedIssue.title}</h1>
                <span className="text-[12px] font-mono text-blue-400 bg-muted/20 px-2 py-0.5 rounded">
                  {selectedIssue.id}
                </span>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[12px] h-5">Triage</Badge>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[13px] border-border hover:bg-purple-500/5 hover:border-purple-500/30 hover:text-purple-400 transition-all bg-transparent"
                  onClick={() => handleTriageAction(selectedIssue, "accept")}
                >
                  Accept
                  <kbd className="ml-2 text-[11px] text-muted-foreground">A</kbd>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[13px] border-border hover:bg-muted/20 transition-all bg-transparent"
                  onClick={() => handleTriageAction(selectedIssue, "duplicate")}
                >
                  Duplicate
                  <kbd className="ml-2 text-[11px] text-muted-foreground">M</kbd>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[13px] border-border hover:bg-muted/20 transition-all bg-transparent"
                  onClick={() => handleTriageAction(selectedIssue, "decline")}
                >
                  Decline
                  <kbd className="ml-2 text-[11px] text-muted-foreground">D</kbd>
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[13px] border-border hover:bg-muted/20 transition-all bg-transparent"
                    onClick={() => handleTriageAction(selectedIssue, "snooze")}
                  >
                    Snooze
                    <kbd className="ml-2 text-[11px] text-muted-foreground">S</kbd>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 space-y-6 min-h-0">
              {/* Description */}
              <div>
                <Textarea
                  placeholder="Add description..."
                  value={selectedIssue.description}
                  className="min-h-[80px] bg-transparent border-none p-0 text-[13px] text-muted-foreground resize-none focus-visible:ring-0 leading-relaxed"
                  readOnly
                />
              </div>

              {/* Sub-issues */}
              <div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Add sub-issue"
                    className="bg-transparent border-none outline-none text-[13px] text-muted-foreground placeholder:text-muted-foreground/60 flex-1"
                  />
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-3">
                  <span>Links</span>
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/5 rounded border border-border/30">
                  <div className="h-2 w-2 bg-purple-400/70 rounded-full flex-shrink-0" />
                  <span className="text-[13px] font-medium text-foreground">Message from Slack</span>
                  <span className="text-[12px] text-muted-foreground flex-1 truncate">
                    @the_boss: Pablo Senabre Catalá created a new issue {selectedIssue.id}
                  </span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[11px] h-4 px-1.5">
                    Synced
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">25min</span>
                </div>
              </div>

              {/* Activity */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-[13px] font-medium text-foreground">Activity</h3>
                  <Badge className="bg-muted/20 text-muted-foreground text-[11px] h-4 px-2 border-0">Unsubscribe</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-purple-400/70 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 text-[13px]">
                      <span className="text-foreground font-medium">{selectedIssue.reporter}</span>
                      <span className="text-muted-foreground"> created the issue from Slack</span>
                      <span className="text-muted-foreground/60 ml-2">• {selectedIssue.created}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-muted-foreground/50 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 text-[13px]">
                      <span className="text-muted-foreground">Slack thread connected in </span>
                      <span className="text-foreground font-medium">#the_boss</span>
                      <span className="text-muted-foreground/60 ml-2">• 14min ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Composer */}
              <div className="border-t border-border/30 pt-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-[11px] bg-muted text-muted-foreground">P</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Leave a reply..."
                      className="min-h-[60px] bg-transparent border-none p-0 resize-none focus-visible:ring-0 text-[13px] placeholder:text-muted-foreground/60"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">Post to Slack ↑</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-muted-foreground">Select an issue to view details</p>
          </div>
        )}
      </div>

      {/* Properties Panel - 320px */}
      <div className="bg-[#121212] h-full px-4 overflow-y-auto">
        <h3 className="text-[13px] font-medium text-foreground mb-4 sticky top-0 bg-[#121212] py-2">Properties</h3>

        {selectedIssue ? (
          <div className="space-y-2">
            {/* Status */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-purple-400/70" />
                <span className="text-[13px] text-muted-foreground">Status</span>
              </div>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[11px] h-5">Triage</Badge>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2 hover:bg-muted/5 rounded cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Set priority</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="h-2" />

            {/* Assignee */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    {selectedIssue.assignee?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] text-foreground">{selectedIssue.assignee}</span>
              </div>
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2 hover:bg-muted/5 rounded cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Add label</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="h-2" />

            {/* Cycle */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2 hover:bg-muted/5 rounded cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Add to cycle</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Project */}
            <div className="flex items-center justify-between h-9 px-2 -mx-2 hover:bg-muted/5 rounded cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Add to project</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[13px] text-muted-foreground">Select an issue to view properties</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <IssueDetailModal issue={selectedIssue} open={false} onOpenChange={() => {}} />

      <CreateIssueModal open={showCreateModal} onOpenChange={setShowCreateModal} onCreateIssue={handleCreateIssue} />

      <TriageActionModal
        issue={triageIssue}
        action={triageAction}
        open={!!triageAction}
        onOpenChange={(open) => {
          if (!open) {
            setTriageAction(null)
            setTriageIssue(null)
          }
        }}
        onAction={handleTriageComplete}
      />
    </div>
  )
}
