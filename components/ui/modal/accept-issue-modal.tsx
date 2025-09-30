"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Circle,
  Target,
  Hexagon,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2
} from "lucide-react"
import { Modal } from "./modal"
import { ModalToolbar } from "./modal-toolbar"
import { ModalBody } from "./modal-body"
import { ModalFooter } from "./modal-footer"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover-shadcn"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { IssuesAPI } from "@/lib/api/issues"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// PropertyChip component for dropdowns
interface ChipOption {
  name: string
  label: string
  icon?: React.ReactNode
  avatar?: string
}

interface ChipProps {
  icon: React.ReactNode
  label: string
  value: string
  options: ChipOption[]
  onSelect: (value: string) => void
  loading?: boolean
}

function PropertyChip({ icon, label, value, options, onSelect, loading = false }: ChipProps) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)

  const dropdownWidth = label === "Business Unit" || label === "Proyecto" ? "w-[280px]" : "w-[200px]"

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
          onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]]:py-1.5">
          <CommandInput
            placeholder="Buscar..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
            value={commandInput}
            onInputCapture={(e) => {
              setCommandInput(e.currentTarget.value)
            }}
            ref={commandInputRef}
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
                  className="flex items-center gap-2 px-2 py-2 text-[14px] rounded-lg cursor-pointer aria-selected:bg-gray-100 text-black"
                >
                  {option.avatar ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white">
                      {option.avatar}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 text-gray-500">
                      {option.icon}
                    </div>
                  )}
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface Issue {
  id: string
  key: string
  title: string
  description: string
  status: string
  priority?: string
  assignee?: string
  project?: string
  projectColor?: string
  created: string
  updated: string
  reporter?: string
  labels?: string[]
}

interface AcceptIssueModalProps {
  issue: Issue | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (data: AcceptData) => void
  onDecline: (data: DeclineData) => void
  onSnooze: (data: SnoozeData) => void
}

interface AcceptData {
  comment: string
  initiative: string  // Business Unit (OBLIGATORIO)
  project?: string    // Proyecto estratégico (OPCIONAL)
  assignee: string
  priority?: string
  subscribeToUpdates: boolean
}


interface DeclineData {
  comment: string
  reason: string
}

interface SnoozeData {
  comment: string
  until: Date
}

type ModalAction = 'accept' | 'decline' | 'snooze' | null

export function AcceptIssueModal({
  issue,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onSnooze
}: AcceptIssueModalProps) {
  const [action, setAction] = useState<ModalAction>('accept')
  const [comment, setComment] = useState("")
  const [initiative, setInitiative] = useState("")  // Business Unit
  const [project, setProject] = useState("")         // Proyecto estratégico (opcional)
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("To Do")
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true)
  const [duplicateOf, setDuplicateOf] = useState("")
  
  // Data loading states
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [availableProjects, setAvailableProjects] = useState<any[]>([])
  const [availableInitiatives, setAvailableInitiatives] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  // Reset form when modal opens/closes  
  useEffect(() => {
    if (open && issue) {
      setAction('accept')
      setComment("")
      // Pre-populate with issue values if available
      const initiativeId = issue.initiative_id || (typeof issue.initiative === 'string' ? issue.initiative : issue.initiative?.id) || ""
      const projectId = issue.project_id || (typeof issue.project === 'string' ? issue.project : issue.project?.id) || ""
      const assigneeId = issue.assignee_id || (typeof issue.assignee === 'string' ? issue.assignee : issue.assignee?.id) || ""
      
      setInitiative(initiativeId)
      setProject(projectId)
      setAssignee(assigneeId)
      setPriority(issue.priority || "")
      setStatus("todo")  // Default to "todo" (not "triage")
      setSubscribeToUpdates(true)
      setDuplicateOf("")
      
      // Focus on textarea instead of close button
      setTimeout(() => {
        commentRef.current?.focus()
      }, 100)
    }
  }, [open, issue])

  // Load users, projects, and initiatives
  const loadData = async () => {
    try {
      setLoading(true)
      const [users, projects, initiatives] = await Promise.all([
        IssuesAPI.getAvailableUsers(),
        IssuesAPI.getProjects(),
        IssuesAPI.getInitiatives()
      ])
      setAvailableUsers(users)
      setAvailableProjects(projects)
      setAvailableInitiatives(initiatives)
    } catch (error) {
      console.error('Error loading modal data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hotkeys for modal actions
  useHotkeys([
    { key: 'enter', modifier: 'cmd', handler: handlePrimaryAction },
  ], open)

  function handlePrimaryAction() {
    if (!issue) return
    
    switch (action) {
      case 'accept':
        if (!initiative) return  // Initiative (BU) es OBLIGATORIO - NO cierra modal
        onAccept({
          comment,
          initiative,  // Business Unit (OBLIGATORIO)
          project,     // Proyecto estratégico (OPCIONAL)
          assignee,
          priority,
          subscribeToUpdates
        })
        onOpenChange(false)  // Solo cierra si pasó validación
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
        // For simplicity, snooze for 1 day
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

  const getActionIcon = () => {
    switch (action) {
      case "accept":
        return <CheckCircle className="h-4 w-4 text-[color:var(--modal-success)]" />
      case "decline":
        return <XCircle className="h-4 w-4 text-[color:var(--modal-danger)]" />
      case "snooze":
        return <Clock className="h-4 w-4 text-[color:var(--modal-accent)]" />
      default:
        return null
    }
  }

  const getActionTitle = () => {
    switch (action) {
      case "accept":
        return `Accept: ${issue.key} ${issue.title}`
      case "decline":
        return `Decline: ${issue.key} ${issue.title}`
      case "snooze":
        return `Snooze: ${issue.key} ${issue.title}`
      default:
        return ""
    }
  }

  const getPrimaryLabel = () => {
    switch (action) {
      case "accept": return "Accept"
      case "decline": return "Decline"
      case "snooze": return "Snooze"
      default: return ""
    }
  }

  const isPrimaryDisabled = () => {
    switch (action) {
      case "accept": return !initiative  // Valida que haya Business Unit seleccionada
      case "decline": return !comment.trim()
      case "snooze": return false
      default: return true
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={getActionTitle()}
      icon={getActionIcon()}
    >

      <ModalBody>
        <div>
        {/* Comment textarea */}
        <div className="relative p-1">
          <Textarea
            ref={commentRef}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-[120px] max-h-[200px] bg-[color:var(--surface-3)] border border-[color:var(--stroke)] rounded-lg px-3 py-3 text-[13px] placeholder:text-[color:var(--muted-text)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--modal-accent)] focus-visible:ring-offset-0 focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)] focus:ring-offset-0"
          />
        </div>

        {/* Action-specific content */}
        {action === 'duplicate' && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Reference to canonical issue</label>
            <input
              type="text"
              placeholder="SAI-123"
              value={duplicateOf}
              onChange={(e) => setDuplicateOf(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-[color:var(--stroke)] rounded-lg bg-[color:var(--surface-3)] focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)]"
            />
          </div>
        )}

        {/* Chip row for accept action */}
        {action === 'accept' && (
          <div className="mt-4 flex items-center gap-2 flex-wrap p-2 bg-gray-50 rounded-lg border border-gray-200">
            {/* Status PropertyChip - No permitir "triage" */}
            <PropertyChip
              icon={status === 'todo' ? <Circle className="h-3.5 w-3.5 text-gray-400" /> :
                    status === 'in_progress' ? <Clock className="h-3.5 w-3.5 text-blue-500" /> :
                    status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> :
                    <Circle className="h-3.5 w-3.5 text-gray-400" />}
              label="Estado"
              value={status === 'todo' ? 'To do' : 
                     status === 'in_progress' ? 'In progress' :
                     status === 'done' ? 'Done' : 'To do'}
              options={[
                { name: 'todo', label: 'To do', icon: <Circle className="w-2.5 h-2.5 text-gray-400" /> },
                { name: 'in_progress', label: 'In progress', icon: <Clock className="w-2.5 h-2.5 text-blue-500" /> },
                { name: 'done', label: 'Done', icon: <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> }
              ]}
              onSelect={setStatus}
              loading={loading}
            />

            {/* Priority PropertyChip */}
            <PropertyChip
              icon={priority === 'P0' ? <ArrowUp className="h-3.5 w-3.5 text-red-500" /> :
                    priority === 'P1' ? <ArrowUp className="h-3.5 w-3.5 text-orange-500" /> :
                    priority === 'P2' ? <Minus className="h-3.5 w-3.5 text-yellow-500" /> :
                    priority === 'P3' ? <ArrowDown className="h-3.5 w-3.5 text-green-500" /> :
                    <Minus className="h-3.5 w-3.5 text-gray-400" />}
              label="Prioridad"
              value={priority === 'P0' ? 'Crítica' :
                     priority === 'P1' ? 'Alta' :
                     priority === 'P2' ? 'Media' :
                     priority === 'P3' ? 'Baja' : 'Sin prioridad'}
              options={[
                { name: 'P0', label: 'Crítica', icon: <ArrowUp className="w-2.5 h-2.5 text-red-500" /> },
                { name: 'P1', label: 'Alta', icon: <ArrowUp className="w-2.5 h-2.5 text-orange-500" /> },
                { name: 'P2', label: 'Media', icon: <Minus className="w-2.5 h-2.5 text-yellow-500" /> },
                { name: 'P3', label: 'Baja', icon: <ArrowDown className="w-2.5 h-2.5 text-green-500" /> }
              ]}
              onSelect={setPriority}
              loading={loading}
            />

            {/* Assignee PropertyChip */}
            <PropertyChip
              icon={<User className="h-3.5 w-3.5 text-gray-500" />}
              label="Asignado"
              value={assignee ? (availableUsers.find(u => u.id === assignee)?.name || 'Sin asignar') : 'Sin asignar'}
              options={[
                ...availableUsers.map(user => ({
                  name: user.id,
                  label: user.name,
                  avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                })),
                { name: '', label: 'Sin asignar', icon: <User className="w-2.5 h-2.5 text-gray-400" /> }
              ]}
              onSelect={setAssignee}
              loading={loading}
            />

            {/* Business Unit PropertyChip - REQUIRED */}
            <PropertyChip
              icon={<Target className="h-3.5 w-3.5 text-gray-500" />}
              label="Business Unit"
              value={initiative ? (availableInitiatives.find(i => i.id === initiative)?.name || 'Sin BU *') : 'Sin BU *'}
              options={availableInitiatives.map(init => ({
                name: init.id,
                label: init.name,
                icon: <Target className="w-2.5 h-2.5 text-gray-600" />
              }))}
              onSelect={setInitiative}
              loading={loading}
            />

            {/* Project PropertyChip - Optional */}
            <PropertyChip
              icon={<Hexagon className="h-3.5 w-3.5 text-gray-500" />}
              label="Proyecto"
              value={project ? (availableProjects.find(p => p.id === project)?.name || 'Sin proyecto') : 'Sin proyecto'}
              options={[
                ...availableProjects.map(proj => ({
                  name: proj.id,
                  label: proj.name,
                  icon: <Hexagon className="w-2.5 h-2.5 text-gray-600" />
                })),
                { name: '', label: 'Sin proyecto', icon: <Hexagon className="w-2.5 h-2.5 text-gray-400" /> }
              ]}
              onSelect={setProject}
              loading={loading}
            />
          </div>
        )}
        </div>
      </ModalBody>

      <ModalFooter
        leftContent={
          <div className="flex items-center space-x-2">
            <Switch 
              id="subscribe" 
              checked={subscribeToUpdates}
              onCheckedChange={setSubscribeToUpdates}
            />
            <label 
              htmlFor="subscribe" 
              className="text-sm text-[color:var(--muted-text)] cursor-pointer"
            >
              Subscribe to updates
            </label>
          </div>
        }
        secondaryLabel="Cancel"
        onSecondary={() => onOpenChange(false)}
        primaryLabel={getPrimaryLabel()}
        primaryDisabled={isPrimaryDisabled()}
        onPrimary={handlePrimaryAction}
      />
    </Modal>
  )
}

AcceptIssueModal.displayName = "AcceptIssueModal"
