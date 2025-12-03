"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, X, Hexagon, CheckCircle2, ArrowRight } from "lucide-react"
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
import { InitiativesAPI } from "@/lib/api/initiatives"
import { useAuth } from "@/lib/context/auth-context"
import { getSapiraProfileLabel } from "@/components/role-switcher"
import { NewProjectModal } from "@/components/new-project-modal"

interface NewInitiativeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateInitiative?: (initiativeId?: string) => void
}

export function NewInitiativeModal({ open, onOpenChange, onCreateInitiative }: NewInitiativeModalProps) {
  const { currentOrg } = useAuth()
  const [createMore, setCreateMore] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [managers, setManagers] = useState<any[]>([])
  const [loadingManagers, setLoadingManagers] = useState(true)
  
  // Chained flow state
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdInitiativeId, setCreatedInitiativeId] = useState<string | null>(null)
  const [createdInitiativeName, setCreatedInitiativeName] = useState<string>("")
  const [showProjectModal, setShowProjectModal] = useState(false)

  const { refreshData } = useSupabaseData()

  useEffect(() => {
    const loadManagers = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingManagers(false)
        return
      }

      try {
        setLoadingManagers(true)
        const availableManagers = await InitiativesAPI.getAvailableManagers(currentOrg.organization.id)
        setManagers(availableManagers)
      } catch (error) {
        console.error("Error loading managers:", error)
      } finally {
        setLoadingManagers(false)
      }
    }

    if (open) {
      loadManagers()
    }
  }, [open, currentOrg?.organization?.id])

  const resetForm = () => {
    setName("")
    setDescription("")
    setSelectedManagerId(null)
    setShowSuccess(false)
    setCreatedInitiativeId(null)
    setCreatedInitiativeName("")
  }

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

      const newInitiative = await InitiativesAPI.createInitiative(
        {
          name: name.trim(),
          slug,
          description: description.trim() || null,
          manager_user_id: selectedManagerId,
          active: true,
        },
        currentOrg.organization.id,
      )

      await refreshData()
      
      // Store created initiative info for chained flow
      if (newInitiative?.id) {
        setCreatedInitiativeId(newInitiative.id)
        setCreatedInitiativeName(name.trim())
      }
      
      onCreateInitiative?.(newInitiative?.id)

      if (createMore) {
        resetForm()
      } else {
        // Show success state with next actions
        setShowSuccess(true)
      }
    } catch (error) {
      console.error("Error creating initiative:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDone = () => {
    onOpenChange(false)
    setTimeout(resetForm, 300)
  }

  const handleCreateProject = () => {
    setShowProjectModal(true)
  }

  const handleProjectCreated = () => {
    setShowProjectModal(false)
    onOpenChange(false)
    setTimeout(resetForm, 300)
  }

  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  const selectedManager = selectedManagerId ? managers.find((m) => m.id === selectedManagerId) : null
  const displayName = name.trim() || "Business Unit"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <AnimatePresence mode="wait">
          {open && (
            <DialogContent className="overflow-hidden p-0 sm:max-w-3xl max-h-[70vh] gap-0 data-[state=open]:animate-none data-[state=closed]:animate-none flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 4 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 0.2 }
                }}
                className="flex flex-col max-h-[70vh] overflow-hidden"
              >
                <DialogHeader className="border-b px-6 py-3 mb-0">
                  <DialogTitle className="text-base">
                    {showSuccess ? "Business unit created" : "New business unit"}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {showSuccess 
                      ? "What would you like to do next?"
                      : "Structure your org by grouping related teams and projects."
                    }
                  </p>
                </DialogHeader>

                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>

                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    // Success state with next actions
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center p-8 space-y-6"
                    >
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {createdInitiativeName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Business unit created successfully
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleDone}
                        >
                          Done
                        </Button>
                        <Button
                          className="flex-1 gap-2"
                          onClick={handleCreateProject}
                        >
                          <Hexagon className="w-4 h-4" />
                          Create Project
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    // Form state
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <form
                        onSubmit={async (event) => {
                          event.preventDefault()
                          await handleSubmit()
                        }}
                        className="flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <div className="flex flex-col-reverse md:flex-row flex-1 overflow-y-auto min-h-0">
                          <div className="md:w-72 md:border-r shrink-0">
                            <div className="border-t p-3 md:border-none">
                              <div className="flex items-center space-x-2">
                                <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-2">
                                  <Target className="size-4 text-foreground" aria-hidden />
                                </div>
                                <div className="space-y-0.5">
                                  <h3 className="text-sm font-medium text-foreground">{displayName}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {currentOrg?.organization.name || "Organization workspace"}
                                  </p>
                                </div>
                              </div>
                              <Separator className="my-2" />
                              <h4 className="text-xs font-medium text-foreground">Description</h4>
                              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                                Business unit owners can connect planning to execution, monitor dependencies, and surface risks early.
                              </p>
                              <h4 className="mt-3 text-xs font-medium text-foreground">Info</h4>
                              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                                Add an owner to unlock dashboards and automations tailored to {displayName.toLowerCase()}.
                              </p>
                              {selectedManager && (
                                <div className="mt-3 space-y-2 rounded-lg border bg-muted/40 p-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Manager</p>
                                    <p className="text-sm font-medium text-foreground">{selectedManager.name}</p>
                                    {selectedManager.email && (
                                      <p className="text-xs text-muted-foreground">{selectedManager.email}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="mt-3 flex items-center justify-between rounded-md border px-2 py-1.5">
                                <div>
                                  <p className="text-xs font-medium text-foreground">Create another after saving</p>
                                  <p className="text-[10px] text-muted-foreground">Keep the modal open to speed up data entry.</p>
                                </div>
                                <Switch checked={createMore} onCheckedChange={setCreateMore} />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-3 md:px-5 md:pb-4 md:pt-3">
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="flex-1 space-y-3"
                            >
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
                                    <Label htmlFor="initiative-name" className="text-sm font-medium text-foreground">
                                      Name & summary
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Capture the business unit goal in a sentence.</p>
                                  </div>
                                </div>
                                <Input
                                  id="initiative-name"
                                  placeholder="Business unit name"
                                  value={name}
                                  onChange={(event) => setName(event.target.value)}
                                  className="h-10 rounded-lg border border-border bg-background/70 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                                  autoFocus
                                />
                                <Textarea
                                  id="initiative-description"
                                  placeholder="Add context, scope, or success metrics..."
                                  value={description}
                                  onChange={(event) => setDescription(event.target.value)}
                                  className="min-h-[60px] rounded-lg border border-border bg-background/70 px-4 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                                />
                              </motion.div>

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
                                    <Label htmlFor="initiative-manager" className="text-sm font-medium text-foreground">
                                      Assign an owner
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Choose who is accountable for this unit.</p>
                                  </div>
                                </div>
                                <Select
                                  value={selectedManagerId ?? "unassigned"}
                                  onValueChange={(value) => setSelectedManagerId(value === "unassigned" ? null : value)}
                                  disabled={loadingManagers}
                                >
                                  <SelectTrigger id="initiative-manager" className="w-full">
                                    <SelectValue placeholder={loadingManagers ? "Loading managers..." : "Select manager"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {managers.length === 0 && !loadingManagers ? (
                                      <SelectItem value="__no_managers" disabled>
                                        No managers available
                                      </SelectItem>
                                    ) : (
                                      managers.map((manager) => {
                                        const isSapira = manager.email?.toLowerCase().endsWith("@sapira.ai")
                                        const profileLabel =
                                          isSapira && manager.sapira_role_type ? getSapiraProfileLabel(manager.sapira_role_type) : null
                                        const displayName = profileLabel ? `${manager.name} (${profileLabel})` : manager.name

                                        return (
                                          <SelectItem key={manager.id} value={manager.id}>
                                            <span className="flex flex-col">
                                              <span className="font-medium">{displayName}</span>
                                              {manager.email && (
                                                <span className="text-xs text-muted-foreground">{manager.email}</span>
                                              )}
                                            </span>
                                          </SelectItem>
                                        )
                                      })
                                    )}
                                  </SelectContent>
                                </Select>
                              </motion.div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.35, duration: 0.2 }}
                              className="mt-3 flex items-center justify-end pt-2"
                            >
                              <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create business unit"}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Chained Project Modal */}
      <NewProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        onCreateProject={handleProjectCreated}
        defaultInitiativeId={createdInitiativeId}
      />
    </>
  )
}
