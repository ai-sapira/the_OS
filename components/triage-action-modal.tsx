"use client"

// 🚨 DEPRECATED: Este modal ha sido reemplazado por el nuevo Design System
// 👀 Usar: import { AcceptIssueModal } from "@/components/ui/modal"
// 📚 Ver: components/ui/modal/README.md para migración completa

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, User, Building2, CheckCircle, Copy, XCircle, Clock } from "lucide-react"

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

interface TriageActionModalProps {
  issue: Issue | null
  action: "accept" | "duplicate" | "decline" | "snooze" | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: string, data: any) => void
}

export function TriageActionModal({ issue, action, open, onOpenChange, onAction }: TriageActionModalProps) {
  const [comment, setComment] = useState("")
  const [priority, setPriority] = useState("")
  const [assignee, setAssignee] = useState("Assign to me")
  const [project, setProject] = useState("")
  const [duplicateIssue, setDuplicateIssue] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [snoozeDate, setSnoozeDate] = useState("")
  const [snoozeTime, setSnoozeTime] = useState("")

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A' && action === 'accept') {
        e.preventDefault()
        setAssignee("Assign to me")
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, action])

  if (!issue || !action) return null

  const getActionIcon = () => {
    switch (action) {
      case "accept":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "duplicate":
        return <Copy className="h-4 w-4 text-orange-500" />
      case "decline":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "snooze":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getActionTitle = () => {
    switch (action) {
      case "accept":
        return `Accept: ${issue.id} ${issue.title}`
      case "duplicate":
        return `Mark as duplicate: ${issue.id} ${issue.title}`
      case "decline":
        return `Decline: ${issue.id} ${issue.title}`
      case "snooze":
        return `Snooze: ${issue.id} ${issue.title}`
      default:
        return ""
    }
  }

  const getActionButtonText = () => {
    switch (action) {
      case "accept":
        return "Accept"
      case "duplicate":
        return "Mark as duplicate"
      case "decline":
        return "Decline"
      case "snooze":
        return "Snooze"
      default:
        return ""
    }
  }

  const handleAction = () => {
    const data = {
      comment,
      priority,
      assignee,
      project,
      duplicateIssue,
      declineReason,
      snoozeDate,
      snoozeTime,
    }
    onAction(action, data)
    onOpenChange(false)
    // Reset form
    setComment("")
    setPriority("")
    setAssignee("Assign to me")
    setProject("")
    setDuplicateIssue("")
    setDeclineReason("")
    setSnoozeDate("")
    setSnoozeTime("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 px-6 py-4 border-b">
          {getActionIcon()}
          <DialogTitle className="text-lg font-semibold">
            {getActionTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Comment textarea */}
          <div>
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Accept-specific content */}
          {action === "accept" && (
            <div className="space-y-4">
              {/* Three required chips */}
              <div className="space-y-3">
                {/* Project - Required */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Project (Departamento/BU) <span className="text-red-500">*</span>
                  </label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <SelectValue placeholder="Select project..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tecnología</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="hr">Recursos Humanos</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Assignee (propietario inicial)
                  </label>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assign to me">Assign to me (Shift+A)</SelectItem>
                      <SelectItem value="pablosenabre">pablosenabre</SelectItem>
                      <SelectItem value="tech-team">Tech Team</SelectItem>
                      <SelectItem value="design-team">Design Team</SelectItem>
                      <SelectItem value="auto-assign">Auto-assign (FDE de la BU)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Priority (P0–P3)
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority (suggested by AI)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P0">P0 - Critical</SelectItem>
                      <SelectItem value="P1">P1 - High</SelectItem>
                      <SelectItem value="P2">P2 - Medium</SelectItem>
                      <SelectItem value="P3">P3 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Duplicate-specific fields */}
          {action === "duplicate" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Reference to canonical issue</label>
              <input
                type="text"
                placeholder="SAI-123"
                value={duplicateIssue}
                onChange={(e) => setDuplicateIssue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              />
            </div>
          )}

          {/* Snooze-specific fields */}
          {action === "snooze" && (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Snooze until</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={snoozeDate}
                  onChange={(e) => setSnoozeDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-input rounded-md bg-background"
                />
                <input
                  type="time"
                  value={snoozeTime}
                  onChange={(e) => setSnoozeTime(e.target.value)}
                  className="px-3 py-2 text-sm border border-input rounded-md bg-background"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={
              (action === "accept" && !project) ||
              (action === "decline" && !comment.trim()) ||
              (action === "duplicate" && !duplicateIssue.trim()) ||
              (action === "snooze" && (!snoozeDate || !snoozeTime))
            }
          >
            {getActionButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
