"use client"

import { useState, useEffect, useRef } from "react"
import { X, Maximize2, Users, Box, ChevronDown, Zap, Circle, Clock, AlertCircle, CheckCircle2, ArrowUp, ArrowDown, Minus, User, Hexagon, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { IssuesAPI } from "@/lib/api/issues"
import type { IssueState, IssuePriority } from "@/lib/database/types"

interface NewIssueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIssue?: () => void
}

// Status configurations matching database enums
const STATUSES: { value: IssueState; label: string; icon: React.ReactNode }[] = [
  { value: "triage", label: "Triage", icon: <Circle className="w-2.5 h-2.5 text-purple-500" /> },
  { value: "todo", label: "To do", icon: <Circle className="w-2.5 h-2.5 text-gray-400" /> },
  { value: "in_progress", label: "In progress", icon: <Clock className="w-2.5 h-2.5 text-blue-500" /> },
  { value: "blocked", label: "Blocked", icon: <AlertCircle className="w-2.5 h-2.5 text-red-500" /> },
  { value: "waiting_info", label: "Waiting info", icon: <AlertCircle className="w-2.5 h-2.5 text-orange-500" /> },
  { value: "done", label: "Done", icon: <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> },
  { value: "canceled", label: "Canceled", icon: <X className="w-2.5 h-2.5 text-gray-400" /> },
  { value: "duplicate", label: "Duplicate", icon: <Circle className="w-2.5 h-2.5 text-purple-400" /> },
]

// Priority configurations matching database enums
const PRIORITIES: { value: IssuePriority; label: string; icon: React.ReactNode }[] = [
  { value: "P0", label: "Crítica", icon: <ArrowUp className="w-2.5 h-2.5 text-red-500" /> },
  { value: "P1", label: "Alta", icon: <ArrowUp className="w-2.5 h-2.5 text-orange-500" /> },
  { value: "P2", label: "Media", icon: <Minus className="w-2.5 h-2.5 text-yellow-500" /> },
  { value: "P3", label: "Baja", icon: <ArrowDown className="w-2.5 h-2.5 text-green-500" /> },
]

// PropertyChip component - matching the app's style
interface PropertyChipProps {
  icon: React.ReactNode
  label: string
  value: string
  options: Array<{ name: string; label: string; icon?: React.ReactNode; avatar?: string }>
  onSelect: (value: string) => void
  loading?: boolean
}

function PropertyChip({ icon, label, value, options, onSelect, loading = false }: PropertyChipProps) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")

  const dropdownWidth = label === "Proyecto" || label === "Business Unit" ? "w-[280px]" : "w-[200px]"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          <div className="flex-shrink-0 text-gray-500">
            {icon}
          </div>
          <span className="text-gray-700 whitespace-nowrap">
            {value}
          </span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`${dropdownWidth} p-1 rounded-2xl border-gray-200 shadow-lg`}
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black">
          <CommandInput
            placeholder="Buscar..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
            value={commandInput}
            onValueChange={setCommandInput}
          />
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Cargando..." : "No se encontraron opciones."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.name}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.name)
                    setOpen(false)
                    setCommandInput("")
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
                    {option.avatar && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
                        {option.avatar}
                      </div>
                    )}
                    <span className="flex-1 text-sm">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

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

  const { createIssue: createIssueApi, projects } = useSupabaseData()

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const availableUsers = await IssuesAPI.getAvailableUsers()
        setUsers(availableUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoadingUsers(false)
      }
    }
    
    if (open) {
      loadUsers()
    }
  }, [open])

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
      // First create the issue with basic data
      const issueData = await createIssueApi({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: selectedPriority ?? undefined,
        origin: "url" as const,
      })

      // If we have a created issue and additional fields, update them
      if (issueData && (selectedStatus !== "triage" || selectedAssigneeId || selectedProjectId)) {
        // We need to get the issue ID somehow - for now we'll skip the update
        // In a real implementation, createIssue should return the created issue
        console.log("Issue created, additional updates would go here")
      }

      if (issueData) {
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  const selectedStatusConfig = STATUSES.find(s => s.value === selectedStatus)
  const selectedPriorityConfig = selectedPriority ? PRIORITIES.find(p => p.value === selectedPriority) : null
  const selectedAssignee = selectedAssigneeId ? users.find(u => u.id === selectedAssigneeId) : null
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null

  const getStateIcon = (state: IssueState) => {
    return STATUSES.find(s => s.value === state)?.icon || <Circle className="h-3.5 w-3.5 text-gray-400" />
  }

  const getPriorityIcon = (priority: IssuePriority) => {
    return PRIORITIES.find(p => p.value === priority)?.icon || <Minus className="h-3.5 w-3.5 text-gray-400" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 border border-gray-200">
        <div className="flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium">Gonvarri</span>
                <span className="text-neutral-400">›</span>
                <span className="font-medium text-neutral-900">New issue</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:bg-gray-100 hover:text-neutral-700">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:bg-gray-100 hover:text-neutral-700"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-5 space-y-3">
            {/* Issue Title */}
            <input
              type="text"
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-medium text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0"
              autoFocus
            />

            {/* Description */}
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] text-sm text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none"
            />
          </div>

          {/* Action Buttons - Using PropertyChips */}
          <div className="px-6 py-4 flex items-center gap-2 flex-wrap">
            <PropertyChip
              icon={getStateIcon(selectedStatus)}
              label="Estado"
              value={selectedStatusConfig?.label || "Triage"}
              options={STATUSES.map(s => ({
                name: s.value,
                label: s.label,
                icon: s.icon
              }))}
              onSelect={(value) => setSelectedStatus(value as IssueState)}
            />

            <PropertyChip
              icon={selectedPriority ? getPriorityIcon(selectedPriority) : <Minus className="w-2.5 h-2.5 text-gray-400" />}
              label="Prioridad"
              value={selectedPriorityConfig?.label || "Sin prioridad"}
              options={[
                { name: "null", label: "Sin prioridad", icon: <Minus className="w-2.5 h-2.5 text-gray-400" /> },
                ...PRIORITIES.map(p => ({
                  name: p.value,
                  label: p.label,
                  icon: p.icon
                }))
              ]}
              onSelect={(value) => setSelectedPriority(value === "null" ? null : value as IssuePriority)}
            />

            <PropertyChip
              icon={<User className="h-3.5 w-3.5 text-gray-500" />}
              label="Asignado"
              value={selectedAssignee?.name || "Sin asignar"}
              options={[
                { name: "null", label: "Sin asignar", icon: <User className="w-2.5 h-2.5 text-gray-400" /> },
                ...users.map(user => ({
                  name: user.id,
                  label: user.name,
                  avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                }))
              ]}
              onSelect={(value) => setSelectedAssigneeId(value === "null" ? null : value)}
              loading={loadingUsers}
            />

            <PropertyChip
              icon={<Hexagon className="h-3.5 w-3.5 text-gray-500" />}
              label="Proyecto"
              value={selectedProject?.name || "Sin proyecto"}
              options={[
                { name: "null", label: "Sin proyecto", icon: <Hexagon className="w-2.5 h-2.5 text-gray-400" /> },
                ...projects.map(project => ({
                  name: project.id,
                  label: project.name,
                  icon: <Hexagon className="w-2.5 h-2.5 text-gray-600" />
                }))
              ]}
              onSelect={(value) => setSelectedProjectId(value === "null" ? null : value)}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={createMore}
                onCheckedChange={setCreateMore}
                className="data-[state=checked]:bg-blue-500"
              />
              <span className="text-sm text-neutral-600">Create more</span>
            </div>

            <Button 
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create issue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}