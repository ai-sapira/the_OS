"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, User, FolderOpen, Calendar, Link2 } from "lucide-react"

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
  const [assignee, setAssignee] = useState("")
  const [project, setProject] = useState("")
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true)
  const [setPriorityBeforeAccept, setSetPriorityBeforeAccept] = useState(false)
  const [duplicateIssue, setDuplicateIssue] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [snoozeDate, setSnoozeDate] = useState("")
  const [snoozeTime, setSnoozeTime] = useState("")

  if (!issue || !action) return null

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
      priority: setPriorityBeforeAccept ? priority : undefined,
      assignee,
      project,
      subscribeToUpdates,
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
    setAssignee("")
    setProject("")
    setSubscribeToUpdates(true)
    setSetPriorityBeforeAccept(false)
    setDuplicateIssue("")
    setDeclineReason("")
    setSnoozeDate("")
    setSnoozeTime("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-background border-border">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium text-foreground">{getActionTitle()}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Comment field for all actions */}
          <div>
            <Textarea
              placeholder={
                action === "accept"
                  ? "Add a comment..."
                  : action === "decline"
                    ? "Reason for declining (required)..."
                    : action === "duplicate"
                      ? "Reference to canonical issue..."
                      : "Add a comment..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none border-border bg-background"
            />
          </div>

          {/* Accept-specific fields */}
          {action === "accept" && (
            <>
              {/* Quick assignment bar */}
              <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-md border border-border">
                <Badge variant="outline" className="text-xs">
                  {issue.id}
                </Badge>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger className="h-7 text-xs border-none bg-transparent">
                    <SelectValue placeholder="Backlog" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="tech">Tecnología</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Ventas</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">•••</div>
                <div className="text-xs text-muted-foreground">Priority</div>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="h-7 text-xs border-none bg-transparent">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <SelectValue placeholder="pablosenabre" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pablosenabre">pablosenabre</SelectItem>
                    <SelectItem value="tech-team">Tech Team</SelectItem>
                    <SelectItem value="design-team">Design Team</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <FolderOpen className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Calendar className="h-3 w-3" />
                </Button>
                <div className="text-xs text-muted-foreground">•••</div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="subscribe" checked={subscribeToUpdates} onCheckedChange={setSubscribeToUpdates} />
                  <label htmlFor="subscribe" className="text-sm text-foreground">
                    Subscribe to updates
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priority"
                    checked={setPriorityBeforeAccept}
                    onCheckedChange={setSetPriorityBeforeAccept}
                  />
                  <label htmlFor="priority" className="text-sm text-foreground">
                    Set a priority before accepting this issue
                  </label>
                </div>
              </div>

              {setPriorityBeforeAccept && (
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </>
          )}

          {/* Duplicate-specific fields */}
          {action === "duplicate" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Reference to canonical issue</label>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="SAI-123"
                  value={duplicateIssue}
                  onChange={(e) => setDuplicateIssue(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                />
              </div>
            </div>
          )}

          {/* Snooze-specific fields */}
          {action === "snooze" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Snooze until</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={snoozeDate}
                    onChange={(e) => setSnoozeDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  />
                  <input
                    type="time"
                    value={snoozeTime}
                    onChange={(e) => setSnoozeTime(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={
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
