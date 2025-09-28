"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AcceptIssueModal } from "@/components/ui/modal/accept-issue-modal"
import { IssueDetailModal } from "@/components/issue-detail-modal"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { TriageWrapper } from "@/components/triage-wrapper"
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
  key: string // Add key property for new modal
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
  const [editingDescription, setEditingDescription] = useState<string>("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "SAI-458",
      key: "SAI-458", // Add key property
      title: "Prueba de triage",
      description: "",
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
      key: "SAI-307", // Add key property
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
      key: "SAI-306", // Add key property
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

  const handleAccept = (data: any) => {
    if (!triageIssue) return

    setIssues(
      issues.map((issue) => {
        if (issue.id === triageIssue.id) {
          return {
            ...issue,
            status: "backlog",
            priority: data.priority || issue.priority,
            assignee: data.assignee || issue.assignee,
            project: data.project || issue.project,
          }
        }
        return issue
      }),
    )

    setTriageIssue(null)
  }


  const handleDecline = (data: any) => {
    if (!triageIssue) return

    setIssues(
      issues.map((issue) => {
        if (issue.id === triageIssue.id) {
          return { ...issue, status: "declined" }
        }
        return issue
      }),
    )

    setTriageIssue(null)
  }

  const handleSnooze = (data: any) => {
    if (!triageIssue) return

    setIssues(
      issues.map((issue) => {
        if (issue.id === triageIssue.id) {
          return { ...issue, status: "snoozed" }
        }
        return issue
      }),
    )

    setTriageIssue(null)
  }

  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) || null

  const triageIssues = issues.filter((issue) => issue.status === "triage")

  // Initialize editing description when selected issue changes
  React.useEffect(() => {
    if (selectedIssue) {
      setEditingDescription(selectedIssue.description || "")
    }
  }, [selectedIssue])

  const handleDescriptionChange = (value: string) => {
    setEditingDescription(value)
  }

  const handleDescriptionBlur = () => {
    if (selectedIssue && editingDescription !== selectedIssue.description) {
      // Update the issue description
      setIssues(issues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, description: editingDescription }
          : issue
      ))
    }
  }


  return (
    <div 
      className={`h-screen w-screen bg-white grid overflow-hidden transition-all duration-200 ${
        sidebarCollapsed 
          ? 'grid-cols-[72px_1px_320px_1px_1fr_1px_300px]' 
          : 'grid-cols-[256px_1px_320px_1px_1fr_1px_300px]'
      }`}
    >
        {/* Sidebar */}
        <div className="bg-white border-r border-gray-200 h-full overflow-hidden">
          <Sidebar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenCreateIssue={() => setShowCreateModal(true)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

      {/* Separator */}
      <div className="bg-gray-200 w-px" />

      {/* Issue List - 320px */}
      <div className="bg-gray-50 h-full flex flex-col overflow-hidden border-r border-gray-200">
        {/* Header */}
        <div className="px-4 py-4 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Triage</h2>
            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs h-6 px-2 font-medium">
              {triageIssues.length}
            </Badge>
          </div>
        </div>

        {/* Issue List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {triageIssues.map((issue) => (
            <div
              key={issue.id}
              className={`min-h-[70px] px-4 py-4 cursor-pointer transition-all duration-150 flex items-start gap-3 flex-shrink-0 border-b border-gray-200 ${
                selectedIssueId === issue.id ? "bg-white border-l-[3px] border-l-gray-900 shadow-sm" : "hover:bg-white"
              }`}
              onClick={() => setSelectedIssueId(issue.id)}
            >
              {/* Avatar */}
              <Avatar className="h-6 w-6 flex-shrink-0 mt-1">
                <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-medium">
                  {issue.reporter?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs h-5 px-2 font-medium">
                    Triage
                  </Badge>
                  <span className="text-xs font-mono text-gray-500">{issue.id}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 truncate leading-tight mb-2">{issue.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">{issue.reporter}</span>
                  <span>•</span>
                  <span>{issue.created}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="bg-gray-200 w-px" />

      {/* Main Detail - 1fr */}
      <div className="bg-white h-full flex flex-col overflow-hidden">
        {selectedIssue ? (
          <>
            {/* Issue Header */}
            <div className="px-6 py-6 flex-shrink-0 border-b border-gray-200">
              <div className="flex items-baseline gap-4 mb-6 pr-8">
                <h1 className="text-xl font-semibold text-gray-900 leading-6 flex-1 truncate">{selectedIssue.title}</h1>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {selectedIssue.id}
                </span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs h-6 px-2 font-medium flex-shrink-0">Triage</Badge>
              </div>

              {/* Action Bar */}
              <div className="overflow-hidden pr-8">
                <TriageWrapper onAction={(action) => handleTriageAction(selectedIssue, action)} />
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 min-h-0">
              {/* Description */}
              <div className="group">
                <div className="relative">
                  <Textarea
                    value={editingDescription}
                    className="min-h-[120px] bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 resize-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 leading-relaxed transition-colors hover:border-gray-400"
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    onBlur={handleDescriptionBlur}
                  />
                  {!editingDescription && (
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <span className="text-sm text-gray-500">Añadir descripción</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-issues */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Add sub-issue"
                    className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-gray-400 flex-1"
                  />
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <span className="font-medium">Links</span>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Message from Slack</span>
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    @the_boss: Pablo Senabre Catalá created a new issue {selectedIssue.id}
                  </span>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs h-5 px-2">
                    Synced
                  </Badge>
                  <span className="text-xs text-gray-500">25min</span>
                </div>
              </div>

              {/* Activity */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
                  <Badge className="bg-gray-100 text-gray-600 text-xs h-5 px-2 border-0">Unsubscribe</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <span className="text-gray-900 font-medium">{selectedIssue.reporter}</span>
                      <span className="text-gray-600"> created the issue from Slack</span>
                      <span className="text-gray-500 ml-2">• {selectedIssue.created}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <span className="text-gray-600">Slack thread connected in </span>
                      <span className="text-gray-900 font-medium">#the_boss</span>
                      <span className="text-gray-500 ml-2">• 14min ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Composer */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-medium">P</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="relative">
                      <Textarea
                        placeholder="Leave a reply..."
                        className="min-h-[90px] bg-white border border-gray-300 rounded-lg px-4 py-3 resize-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm placeholder:text-gray-500 transition-colors hover:border-gray-400"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Post to Slack</span>
                        <kbd className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">↑</kbd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900">
                          Cancel
                        </Button>
                        <Button size="sm" className="h-8 px-4 text-xs bg-gray-900 hover:bg-gray-800 text-white">
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-500">Select an issue to view details</p>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="bg-gray-200 w-px" />

      {/* Properties Panel - 300px */}
      <div className="bg-gray-50 h-full overflow-y-auto border-l border-gray-200">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        </div>

        <div className="px-4">
          {selectedIssue ? (
            <div className="space-y-2 py-4">
              {/* Status */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-700">Status</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs h-6 px-2 font-medium">Triage</Badge>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Minus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Set priority</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="h-2" />

              {/* Assignee */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-medium">
                      {selectedIssue.assignee?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900 font-medium">{selectedIssue.assignee}</span>
                </div>
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Add label</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="h-2" />

              {/* Cycle */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Add to cycle</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              {/* Project */}
              <div className="flex items-center justify-between h-11 px-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Add to project</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Select an issue to view properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <IssueDetailModal issue={selectedIssue} open={false} onOpenChange={() => {}} />

      <CreateIssueModal open={showCreateModal} onOpenChange={setShowCreateModal} onCreateIssue={handleCreateIssue} />

      <AcceptIssueModal
        issue={triageIssue}
        open={!!triageAction}
        onOpenChange={(open) => {
          if (!open) {
            setTriageAction(null)
            setTriageIssue(null)
          }
        }}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onSnooze={handleSnooze}
      />
    </div>
  )
}
