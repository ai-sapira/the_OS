"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Circle, Clock, AlertCircle, CheckCircle2, ArrowUp, ArrowDown, Minus, User, Hexagon, Target, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { IssuesAPI } from "@/lib/api/issues"
import type { IssueState, IssuePriority } from "@/lib/database/types"
import { useAuth } from "@/lib/context/auth-context"
import { getSapiraProfileLabel } from "@/components/role-switcher"

interface NewIssueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIssue?: () => void
}

const STATUSES: {
  value: IssueState
  label: string
  description: string
}[] = [
  { value: "triage", label: "Triage", description: "Needs review before being accepted." },
  { value: "todo", label: "To do", description: "Ready to start work." },
  { value: "in_progress", label: "In progress", description: "Currently being worked on." },
  { value: "blocked", label: "Blocked", description: "Waiting on external dependency." },
  { value: "waiting_info", label: "Waiting info", description: "Needs more information to proceed." },
  { value: "done", label: "Done", description: "Work completed successfully." },
  { value: "canceled", label: "Canceled", description: "Work was canceled." },
  { value: "duplicate", label: "Duplicate", description: "Duplicate of another issue." },
]

const PRIORITIES: {
  value: IssuePriority
  label: string
  description: string
}[] = [
  { value: "P0", label: "Crítica", description: "Immediate attention required." },
  { value: "P1", label: "Alta", description: "High priority, address soon." },
  { value: "P2", label: "Media", description: "Normal priority." },
  { value: "P3", label: "Baja", description: "Low priority, can wait." },
]

export function NewIssueModal({ open, onOpenChange, onCreateIssue }: NewIssueModalProps) {
  const [createMore, setCreateMore] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<IssueState>("triage")
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const { createIssue: createIssueApi, projects, initiatives, refreshData } = useSupabaseData()
  const { currentOrg } = useAuth()

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingUsers(false)
        return
      }

      try {
        setLoadingUsers(true)
        const availableUsers = await IssuesAPI.getAvailableUsers(currentOrg.organization.id)
        setUsers(availableUsers)
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open, currentOrg?.organization?.id])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedStatus("triage")
    setSelectedPriority(null)
    setSelectedAssigneeId(null)
    setSelectedProjectId(null)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!currentOrg?.organization?.id) {
        throw new Error("No organization selected")
      }

      const issueData = await createIssueApi({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: selectedPriority ?? undefined,
        origin: "url" as const,
        project_id: selectedProjectId ?? undefined,
        assignee_id: selectedAssigneeId ?? undefined,
      })

      if (issueData) {
        await refreshData()
        onCreateIssue?.()

        if (createMore) {
          resetForm()
        } else {
          onOpenChange(false)
          setTimeout(resetForm, 300)
        }
      }
    } catch (error) {
      console.error("Error creating issue:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  const selectedStatusConfig = STATUSES.find((status) => status.value === selectedStatus)
  const selectedPriorityConfig = selectedPriority ? PRIORITIES.find((p) => p.value === selectedPriority) : null
  const selectedAssignee = selectedAssigneeId ? users.find((user) => user.id === selectedAssigneeId) : null
  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null
  const displayTitle = title.trim() || "Issue"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="overflow-visible p-0 sm:max-w-2xl gap-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.2 }
              }}
            >
              <DialogHeader className="border-b px-6 py-4 mb-0">
                <DialogTitle>New issue</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Track work, assign owners, and connect issues to projects.
                </p>
              </DialogHeader>

              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSubmit()
                }}
              >
                <div className="flex flex-col-reverse md:flex-row">
                  <div className="md:w-80 md:border-r">
                    <div className="border-t p-6 md:border-none">
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                          <Circle className="size-5 text-foreground" aria-hidden />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium text-foreground">{displayTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {currentOrg?.organization.name || "Organization workspace"}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <h4 className="text-sm font-medium text-foreground">Description</h4>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Issues help teams track work, assign owners, and monitor progress across projects.
                      </p>
                      <h4 className="mt-6 text-sm font-medium text-foreground">Status insight</h4>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {selectedStatusConfig?.description || "Select how this issue should start."}
                      </p>
                      {(selectedAssignee || selectedProject) && (
                        <div className="mt-4 space-y-3 rounded-lg border bg-muted/40 p-3">
                          {selectedAssignee && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Assignee</p>
                              <p className="text-sm font-medium text-foreground">{selectedAssignee.name}</p>
                              {selectedAssignee.email && (
                                <p className="text-xs text-muted-foreground">{selectedAssignee.email}</p>
                              )}
                            </div>
                          )}
                          {selectedProject && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Project</p>
                              <p className="text-sm font-medium text-foreground">{selectedProject.name}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-6 flex items-center justify-between rounded-md border px-3 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Create another after saving</p>
                          <p className="text-xs text-muted-foreground">Keep the modal open to speed up data entry.</p>
                        </div>
                        <Switch checked={createMore} onCheckedChange={setCreateMore} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:px-6 md:pb-8 md:pt-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="flex-1 space-y-6"
                    >
                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            1
                          </div>
                          <div>
                            <Label htmlFor="issue-title" className="text-sm font-medium text-foreground">
                              Title & description
                            </Label>
                            <p className="text-xs text-muted-foreground">Capture the issue goal in a sentence.</p>
                          </div>
                        </div>
                        <Input
                          id="issue-title"
                          placeholder="Issue title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          className="h-11 rounded-lg border border-border bg-background/70 px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                          autoFocus
                        />
                        <Textarea
                          id="issue-description"
                          placeholder="Add context, scope, or acceptance criteria..."
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          className="min-h-[120px] rounded-lg border border-border bg-background/70 px-4 py-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            2
                          </div>
                          <div>
                            <Label htmlFor="issue-status" className="text-sm font-medium text-foreground">
                              Issue status
                            </Label>
                            <p className="text-xs text-muted-foreground">Signal where the work stands today.</p>
                          </div>
                        </div>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as IssueState)}>
                          <SelectTrigger id="issue-status" className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            3
                          </div>
                          <div>
                            <Label htmlFor="issue-priority" className="text-sm font-medium text-foreground">
                              Priority
                            </Label>
                            <p className="text-xs text-muted-foreground">Set the urgency level for this work.</p>
                          </div>
                        </div>
                        <Select
                          value={selectedPriority ?? "unassigned"}
                          onValueChange={(value) => setSelectedPriority(value === "unassigned" ? null : value as IssuePriority)}
                        >
                          <SelectTrigger id="issue-priority" className="w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">No priority</SelectItem>
                            {PRIORITIES.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            4
                          </div>
                          <div>
                            <Label htmlFor="issue-assignee" className="text-sm font-medium text-foreground">
                              Assign an owner
                            </Label>
                            <p className="text-xs text-muted-foreground">Route updates and approvals to the right person.</p>
                          </div>
                        </div>
                        <Select
                          value={selectedAssigneeId ?? "unassigned"}
                          onValueChange={(value) => setSelectedAssigneeId(value === "unassigned" ? null : value)}
                          disabled={loadingUsers}
                        >
                          <SelectTrigger id="issue-assignee" className="w-full">
                            <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select assignee"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {users.length === 0 && !loadingUsers ? (
                              <SelectItem value="__no_users" disabled>
                                No users available
                              </SelectItem>
                            ) : (
                              users.map((user) => {
                                const isSapira = user.email?.toLowerCase().endsWith("@sapira.ai")
                                const profileLabel =
                                  isSapira && user.sapira_role_type ? getSapiraProfileLabel(user.sapira_role_type) : null
                                const displayName = profileLabel ? `${user.name} (${profileLabel})` : user.name

                                return (
                                  <SelectItem key={user.id} value={user.id}>
                                    <span className="flex flex-col">
                                      <span className="font-medium">{displayName}</span>
                                      {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                                    </span>
                                  </SelectItem>
                                )
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            5
                          </div>
                          <div>
                            <Label htmlFor="issue-project" className="text-sm font-medium text-foreground">
                              Connect to a project
                            </Label>
                            <p className="text-xs text-muted-foreground">Improve reporting by attaching the right project.</p>
                          </div>
                        </div>
                        <Select
                          value={selectedProjectId ?? "unassigned"}
                          onValueChange={(value) => setSelectedProjectId(value === "unassigned" ? null : value)}
                        >
                          <SelectTrigger id="issue-project" className="w-full">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">No project</SelectItem>
                            {projects.length === 0 ? (
                              <SelectItem value="__no_projects" disabled>
                                No projects available
                              </SelectItem>
                            ) : (
                              projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  <span className="flex items-center gap-2">
                                    <Hexagon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{project.name}</span>
                                  </span>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.2 }}
                      className="mt-6 flex items-center justify-end pt-4"
                    >
                      <Button type="submit" size="sm" disabled={!title.trim() || isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create issue"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
