"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Hexagon, Target, X } from "lucide-react"
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
import { ProjectsAPI } from "@/lib/api/projects"
import { InitiativesAPI } from "@/lib/api/initiatives"
import type { ProjectStatus } from "@/lib/database/types"
import { useAuth } from "@/lib/context/auth-context"
import { getSapiraProfileLabel } from "@/components/role-switcher"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject?: () => void
  defaultInitiativeId?: string | null
}

const STATUSES: {
  value: ProjectStatus
  label: string
  dotColor: string
  description: string
}[] = [
  { value: "planned", label: "Planned", dotColor: "bg-blue-500", description: "Define scope and success metrics." },
  { value: "active", label: "Active", dotColor: "bg-green-500", description: "Workstreams are currently running." },
  { value: "paused", label: "Paused", dotColor: "bg-yellow-500", description: "Project is on hold." },
  { value: "done", label: "Done", dotColor: "bg-gray-400", description: "All deliverables completed." },
]

export function NewProjectModal({ open, onOpenChange, onCreateProject, defaultInitiativeId }: NewProjectModalProps) {
  const [createMore, setCreateMore] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("planned")
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const { initiatives, refreshData } = useSupabaseData()
  const { currentOrg } = useAuth()

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingUsers(false)
        return
      }

      try {
        setLoadingUsers(true)
        const availableUsers = await InitiativesAPI.getAvailableManagers(currentOrg.organization.id)
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
    setName("")
    setDescription("")
    setSelectedStatus("planned")
    setSelectedOwnerId(null)
    setSelectedInitiativeId(defaultInitiativeId ?? null)
  }

  // Set default initiative when modal opens or defaultInitiativeId changes
  useEffect(() => {
    if (open && defaultInitiativeId) {
      setSelectedInitiativeId(defaultInitiativeId)
    } else if (open && !defaultInitiativeId) {
      setSelectedInitiativeId(null)
    }
  }, [open, defaultInitiativeId])

  const handleSubmit = async () => {
    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!currentOrg?.organization?.id) {
        throw new Error("No organization selected")
      }

      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")

      await ProjectsAPI.createProject(
        {
          name: name.trim(),
          slug,
          description: description.trim() || null,
          status: selectedStatus,
          owner_user_id: selectedOwnerId,
          initiative_id: selectedInitiativeId,
          progress: null,
          planned_start_at: null,
          planned_end_at: null,
        },
        currentOrg.organization.id,
      )

      await refreshData()
      onCreateProject?.()

      if (createMore) {
        resetForm()
      } else {
        onOpenChange(false)
        setTimeout(resetForm, 300)
      }
    } catch (error) {
      console.error("Error creating project:", error)
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
  const selectedOwner = selectedOwnerId ? users.find((user) => user.id === selectedOwnerId) : null
  const selectedInitiative = selectedInitiativeId ? initiatives.find((i) => i.id === selectedInitiativeId) : null
  const displayName = name.trim() || "Project"

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
                <DialogTitle>New project</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Track milestones, align teams, and connect work to a business unit.
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
                          <Hexagon className="size-5 text-foreground" aria-hidden />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium text-foreground">{displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {currentOrg?.organization.name || "Organization workspace"}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <h4 className="text-sm font-medium text-foreground">Description</h4>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Project owners can connect planning to execution, monitor dependencies, and surface risks early.
                      </p>
                      <h4 className="mt-6 text-sm font-medium text-foreground">Status insight</h4>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {selectedStatusConfig?.description || "Select how this project should start."}
                      </p>
                      {(selectedOwner || selectedInitiative) && (
                        <div className="mt-4 space-y-3 rounded-lg border bg-muted/40 p-3">
                          {selectedOwner && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner</p>
                              <p className="text-sm font-medium text-foreground">{selectedOwner.name}</p>
                              {selectedOwner.email && (
                                <p className="text-xs text-muted-foreground">{selectedOwner.email}</p>
                              )}
                            </div>
                          )}
                          {selectedInitiative && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Business unit</p>
                              <p className="text-sm font-medium text-foreground">{selectedInitiative.name}</p>
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
                            <Label htmlFor="project-name" className="text-sm font-medium text-foreground">
                              Name & summary
                            </Label>
                            <p className="text-xs text-muted-foreground">Capture the project goal in a sentence.</p>
                          </div>
                        </div>
                        <Input
                          id="project-name"
                          placeholder="Project name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="h-11 rounded-lg border border-border bg-background/70 px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                          autoFocus
                        />
                        <Textarea
                          id="project-description"
                          placeholder="Add context, scope, or success metrics..."
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
                            <Label htmlFor="project-status" className="text-sm font-medium text-foreground">
                              Project status
                            </Label>
                            <p className="text-xs text-muted-foreground">Signal where the work stands today.</p>
                          </div>
                        </div>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProjectStatus)}>
                          <SelectTrigger id="project-status" className="w-full">
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
                            <Label htmlFor="project-owner" className="text-sm font-medium text-foreground">
                              Assign an owner
                            </Label>
                            <p className="text-xs text-muted-foreground">Route updates and approvals to the right person.</p>
                          </div>
                        </div>
                        <Select
                          value={selectedOwnerId ?? "unassigned"}
                          onValueChange={(value) => setSelectedOwnerId(value === "unassigned" ? null : value)}
                          disabled={loadingUsers}
                        >
                          <SelectTrigger id="project-owner" className="w-full">
                            <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select owner"} />
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
                        transition={{ delay: 0.35, duration: 0.25 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                            4
                          </div>
                          <div>
                            <Label htmlFor="project-initiative" className="text-sm font-medium text-foreground">
                              Connect to a business unit
                            </Label>
                            <p className="text-xs text-muted-foreground">Improve reporting by attaching the right initiative.</p>
                          </div>
                        </div>
                        <Select
                          value={selectedInitiativeId ?? "unassigned"}
                          onValueChange={(value) => setSelectedInitiativeId(value === "unassigned" ? null : value)}
                          disabled={!!defaultInitiativeId}
                        >
                          <SelectTrigger id="project-initiative" className="w-full" disabled={!!defaultInitiativeId}>
                            <SelectValue placeholder="Select business unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">No business unit</SelectItem>
                            {initiatives.length === 0 ? (
                              <SelectItem value="__no_initiatives" disabled>
                                No initiatives available
                              </SelectItem>
                            ) : (
                              initiatives.map((initiative) => (
                                <SelectItem key={initiative.id} value={initiative.id}>
                                  <span className="flex items-center gap-2">
                                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{initiative.name}</span>
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
                      transition={{ delay: 0.35, duration: 0.2 }}
                      className="mt-6 flex items-center justify-end pt-4"
                    >
                      <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create project"}
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

