"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  User,
  Target,
  Hexagon,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Calendar,
  MessageSquare
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IssuesAPI } from "@/lib/api/initiatives"
import type { IssuePriority } from "@/lib/database/types"
import { useAuth } from "@/lib/context/auth-context"
import { getSapiraProfileLabel } from "@/components/role-switcher"

// Priority configurations
const PRIORITIES: { value: IssuePriority; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "P0", label: "Crítica", icon: <ArrowUp className="w-3 h-3" />, color: "text-red-500" },
  { value: "P1", label: "Alta", icon: <ArrowUp className="w-3 h-3" />, color: "text-orange-500" },
  { value: "P2", label: "Media", icon: <Minus className="w-3 h-3" />, color: "text-yellow-500" },
  { value: "P3", label: "Baja", icon: <ArrowDown className="w-3 h-3" />, color: "text-green-500" },
]

// Action configurations
const ACTIONS = [
  { 
    id: 'accept' as const, 
    label: 'Accept', 
    icon: CheckCircle2, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Move to backlog and assign'
  },
  { 
    id: 'decline' as const, 
    label: 'Decline', 
    icon: XCircle, 
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'Reject with reason'
  },
  { 
    id: 'snooze' as const, 
    label: 'Snooze', 
    icon: Clock, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    description: 'Review later'
  },
]

interface AcceptIssueModalProps {
  issue: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (data: any) => void
  onDecline: (data: any) => void
  onSnooze: (data: any) => void
}

export function AcceptIssueModal({
  issue,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onSnooze
}: AcceptIssueModalProps) {
  const { currentOrg } = useAuth()
  const organizationId = currentOrg?.organization?.id
  const [action, setAction] = useState<'accept' | 'decline' | 'snooze'>('accept')
  const [comment, setComment] = useState("")
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority | null>(null)
  
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [initiatives, setInitiatives] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const lastLoadedOrgRef = useRef<string | null>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // Load data when modal opens
  useEffect(() => {
    if (!open || !organizationId) return
    const hasInitialData = users.length > 0 && projects.length > 0 && initiatives.length > 0
    const orgChanged = lastLoadedOrgRef.current !== organizationId
    if (!orgChanged && hasInitialData) return
    
    const loadData = async () => {
      try {
        setLoading(!hasInitialData)
        const [usersData, projectsData, initiativesData] = await Promise.all([
          IssuesAPI.getAvailableUsers(organizationId),
          IssuesAPI.getProjects(organizationId),
          IssuesAPI.getInitiatives(organizationId)
        ])
        setUsers(usersData)
        setProjects(projectsData)
        setInitiatives(initiativesData)
        lastLoadedOrgRef.current = organizationId
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [open, organizationId, users.length, projects.length, initiatives.length])

  // Reset form when modal opens
  useEffect(() => {
    if (open && issue) {
      setAction('accept')
      setComment("")
      
      const initiativeId = issue.initiative_id || (typeof issue.initiative === 'string' ? issue.initiative : issue.initiative?.id) || null
      const projectId = issue.project_id || (typeof issue.project === 'string' ? issue.project : issue.project?.id) || null
      const assigneeId = issue.assignee_id || (typeof issue.assignee === 'string' ? issue.assignee : issue.assignee?.id) || null
      
      setSelectedInitiativeId(initiativeId)
      setSelectedProjectId(projectId)
      setSelectedAssigneeId(assigneeId)
      setSelectedPriority(issue.priority || null)
      
      setTimeout(() => commentRef.current?.focus(), 100)
    }
  }, [open, issue])

  const handleSubmit = () => {
    if (!issue) return

    switch (action) {
      case 'accept':
        if (!selectedInitiativeId) return
        onAccept({
          comment,
          initiative: selectedInitiativeId,
          project: selectedProjectId,
          assignee: selectedAssigneeId,
          priority: selectedPriority,
          subscribeToUpdates: true
        })
        onOpenChange(false)
        break
      case 'decline':
        if (!comment.trim()) return
        onDecline({
          comment: comment.trim(),
          reason: comment.trim()
        })
        onOpenChange(false)
        break
      case 'snooze':
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        onSnooze({
          comment,
          until: tomorrow
        })
        onOpenChange(false)
        break
    }
  }

  if (!issue) return null

  const selectedInitiative = selectedInitiativeId ? initiatives.find(i => i.id === selectedInitiativeId) : null
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null
  const selectedAssignee = selectedAssigneeId ? users.find(u => u.id === selectedAssigneeId) : null
  const selectedPriorityConfig = selectedPriority ? PRIORITIES.find(p => p.value === selectedPriority) : null
  const currentAction = ACTIONS.find(a => a.id === action)!

  const isDisabled = action === 'accept' ? !selectedInitiativeId : (action === 'decline' ? !comment.trim() : false)
  const displayTitle = issue.title || "Issue"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="overflow-hidden p-0 sm:max-w-2xl max-h-[85vh] gap-0 data-[state=open]:animate-none data-[state=closed]:animate-none flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.2 }
              }}
              className="flex flex-col max-h-[85vh] overflow-hidden"
            >
          {/* Header */}
              <DialogHeader className="border-b px-6 py-3 mb-0">
                <DialogTitle className="text-base">Triage Issue</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Review and decide the fate of this issue.
                </p>
              </DialogHeader>

              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {/* Two-column layout */}
              <div className="flex flex-col-reverse md:flex-row flex-1 overflow-y-auto min-h-0">
                {/* Left sidebar */}
                <div className="md:w-80 md:border-r">
                  <div className="border-t p-3 md:border-none">
                    {/* Issue preview */}
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex shrink-0 items-center justify-center rounded-sm p-2 ${currentAction.bgColor}`}>
                        <currentAction.icon className={`size-4 ${currentAction.color}`} aria-hidden />
              </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{displayTitle}</h3>
                        <p className="text-xs text-muted-foreground">
                          {issue.key || 'New issue'}
                        </p>
              </div>
            </div>
                    
                    <Separator className="my-2" />
                    
                    {/* Action selection */}
                    <h4 className="text-xs font-medium text-foreground mb-2">Action</h4>
                    <div className="space-y-1">
                      {ACTIONS.map((actionItem) => (
                        <motion.button
                          key={actionItem.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setAction(actionItem.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-150 ${
                            action === actionItem.id 
                              ? `${actionItem.bgColor} ring-1 ring-inset ring-current/20` 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <actionItem.icon className={`h-3.5 w-3.5 ${actionItem.color}`} />
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-medium ${action === actionItem.id ? actionItem.color : 'text-foreground'}`}>
                              {actionItem.label}
                            </span>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {actionItem.description}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <Separator className="my-2" />
                    
                    {/* Context info */}
                    <h4 className="text-xs font-medium text-foreground">Context</h4>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">
                      {action === 'accept' && 'Assign the issue to a business unit and optionally set project, owner and priority.'}
                      {action === 'decline' && 'Provide a reason for declining this issue. The reporter will be notified.'}
                      {action === 'snooze' && 'Postpone the review. The issue will reappear tomorrow.'}
                    </p>

                    {/* Selected values preview */}
                    {action === 'accept' && (selectedInitiative || selectedAssignee || selectedProject) && (
                      <div className="mt-3 space-y-2 rounded-lg border bg-muted/40 p-2">
                        {selectedInitiative && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Business Unit</p>
                            <p className="text-xs font-medium text-foreground">{selectedInitiative.name}</p>
                          </div>
                        )}
                        {selectedProject && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Project</p>
                            <p className="text-xs font-medium text-foreground">{selectedProject.name}</p>
                          </div>
                        )}
                        {selectedAssignee && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assignee</p>
                            <p className="text-xs font-medium text-foreground">{selectedAssignee.name}</p>
                          </div>
                        )}
                      </div>
                    )}
            </div>
          </div>

                {/* Right content */}
                <div className="flex flex-1 flex-col p-3 md:px-5 md:pb-4 md:pt-3">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="flex-1 space-y-3"
                  >
                    {/* Comment section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.25 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex size-5 items-center justify-center rounded-sm bg-muted text-xs text-foreground">
                          1
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            {action === 'decline' ? 'Reason (required)' : 'Comment'}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {action === 'decline' ? 'Explain why this issue is being declined.' : 'Add context or notes about this decision.'}
                          </p>
                        </div>
          </div>
            <textarea
              ref={commentRef}
                        placeholder={action === 'decline' ? "Reason for declining..." : "Add a comment..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
                        className="w-full min-h-[80px] text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg px-4 py-2 bg-background/70 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 shadow-sm"
            />
                    </motion.div>

                    {/* Accept-specific fields */}
            {action === 'accept' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.25 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="inline-flex size-5 items-center justify-center rounded-sm bg-muted text-xs text-foreground">
                            2
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-foreground">
                              Assignment
                            </Label>
                            <p className="text-xs text-muted-foreground">Select where this issue belongs.</p>
                          </div>
                        </div>

                        {/* Business Unit (required) */}
                        <Select
                          value={selectedInitiativeId ?? "unassigned"}
                          onValueChange={(value) => setSelectedInitiativeId(value === "unassigned" ? null : value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-background/70 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Target className="h-3.5 w-3.5 text-muted-foreground" />
                              <SelectValue placeholder={loading ? "Loading..." : "Select Business Unit *"} />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">No business unit</SelectItem>
                            {initiatives.map((initiative) => (
                              <SelectItem key={initiative.id} value={initiative.id}>
                                {initiative.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Project */}
                        <Select
                          value={selectedProjectId ?? "none"}
                          onValueChange={(value) => setSelectedProjectId(value === "none" ? null : value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-background/70 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Hexagon className="h-3.5 w-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Select Project (optional)" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No project</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Assignee */}
                        <Select
                          value={selectedAssigneeId ?? "unassigned"}
                          onValueChange={(value) => setSelectedAssigneeId(value === "unassigned" ? null : value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-background/70 shadow-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Select Assignee (optional)" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {users.map((user) => {
                      const isSapira = user.email?.toLowerCase().endsWith('@sapira.ai')
                      const profileLabel = isSapira && user.sapira_role_type 
                        ? getSapiraProfileLabel(user.sapira_role_type)
                        : null
                              const displayName = profileLabel ? `${user.name} (${profileLabel})` : user.name
                              return (
                                <SelectItem key={user.id} value={user.id}>
                                  {displayName}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>

                        {/* Priority */}
                        <Select
                          value={selectedPriority ?? "none"}
                          onValueChange={(value) => setSelectedPriority(value === "none" ? null : value as IssuePriority)}
                        >
                          <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-background/70 shadow-sm">
                            <div className="flex items-center gap-2">
                              {selectedPriorityConfig ? (
                                <span className={selectedPriorityConfig.color}>{selectedPriorityConfig.icon}</span>
                              ) : (
                                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <SelectValue placeholder="Select Priority (optional)" />
              </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No priority</SelectItem>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <span className="flex items-center gap-2">
                                  <span className={p.color}>{p.icon}</span>
                                  {p.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}

                    {/* Submit button */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.2 }}
                      className="mt-3 flex items-center justify-end gap-2 pt-2"
                    >
            <Button 
              variant="outline"
                        size="sm" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
                        size="sm" 
                        disabled={isDisabled}
                        onClick={handleSubmit}
                        className={`${
                action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                action === 'decline' ? 'bg-red-500 hover:bg-red-600' : 
                          'bg-amber-500 hover:bg-amber-600'
                        } text-white`}
            >
              {action === 'accept' ? 'Accept Issue' : action === 'decline' ? 'Decline Issue' : 'Snooze Issue'}
            </Button>
                    </motion.div>
                  </motion.div>
          </div>
        </div>
            </motion.div>
      </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
