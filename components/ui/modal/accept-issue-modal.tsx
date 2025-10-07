"use client"

import { useState, useEffect, useRef } from "react"
import { 
  X,
  Maximize2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  User,
  Target,
  Hexagon,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { IssuesAPI } from "@/lib/api/issues"
import type { IssuePriority } from "@/lib/database/types"
import { useAuth } from "@/lib/context/auth-context"

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

  const dropdownWidth = label === "Business Unit" || label === "Proyecto" ? "w-[280px]" : "w-[200px]"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1 px-2 text-xs rounded-lg flex-shrink-0"
        >
          <div className="flex-shrink-0 text-gray-500">
            {icon}
          </div>
          <span className="text-gray-700 whitespace-nowrap max-w-[100px] truncate">
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

// Priority configurations
const PRIORITIES: { value: IssuePriority; label: string; icon: React.ReactNode }[] = [
  { value: "P0", label: "Crítica", icon: <ArrowUp className="w-2.5 h-2.5 text-red-500" /> },
  { value: "P1", label: "Alta", icon: <ArrowUp className="w-2.5 h-2.5 text-orange-500" /> },
  { value: "P2", label: "Media", icon: <Minus className="w-2.5 h-2.5 text-yellow-500" /> },
  { value: "P3", label: "Baja", icon: <ArrowDown className="w-2.5 h-2.5 text-green-500" /> },
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

  const commentRef = useRef<HTMLTextAreaElement>(null)

  // Load data when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!open) return
      
      try {
        setLoading(true)
        const [usersData, projectsData, initiativesData] = await Promise.all([
          IssuesAPI.getAvailableUsers(),
          IssuesAPI.getProjects(),
          IssuesAPI.getInitiatives()
        ])
        setUsers(usersData)
        setProjects(projectsData)
        setInitiatives(initiativesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [open])

  // Reset form when modal opens
  useEffect(() => {
    if (open && issue) {
      setAction('accept')
      setComment("")
      
      // Pre-populate with issue values if available
      const initiativeId = issue.initiative_id || (typeof issue.initiative === 'string' ? issue.initiative : issue.initiative?.id) || null
      const projectId = issue.project_id || (typeof issue.project === 'string' ? issue.project : issue.project?.id) || null
      const assigneeId = issue.assignee_id || (typeof issue.assignee === 'string' ? issue.assignee : issue.assignee?.id) || null
      
      setSelectedInitiativeId(initiativeId)
      setSelectedProjectId(projectId)
      setSelectedAssigneeId(assigneeId)
      setSelectedPriority(issue.priority || null)
      
      setTimeout(() => {
        commentRef.current?.focus()
      }, 100)
    }
  }, [open, issue])

  const handleSubmit = () => {
    if (!issue) return

    switch (action) {
      case 'accept':
        if (!selectedInitiativeId) return // Initiative is required
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

  const isDisabled = action === 'accept' ? !selectedInitiativeId : (action === 'decline' ? !comment.trim() : false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 border border-gray-200">
        <div className="flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium">{currentOrg?.organization.name || 'Organización'}</span>
                <span className="text-neutral-400">›</span>
                <span className="font-medium text-neutral-900">
                  {action === 'accept' ? 'Accept' : action === 'decline' ? 'Decline' : 'Snooze'} Issue
                </span>
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

          {/* Issue Info */}
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">{issue.key}</span>
              <span className="text-sm font-medium text-gray-900 truncate">{issue.title}</span>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="px-6 pt-3 flex gap-1.5">
            <Button
              size="sm"
              variant={action === 'accept' ? 'default' : 'ghost'}
              onClick={() => setAction('accept')}
              className={`h-7 text-xs ${action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant={action === 'decline' ? 'default' : 'ghost'}
              onClick={() => setAction('decline')}
              className={`h-7 text-xs ${action === 'decline' ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              variant={action === 'snooze' ? 'default' : 'ghost'}
              onClick={() => setAction('snooze')}
              className={`h-7 text-xs ${action === 'snooze' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              Snooze
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-3">
            {/* Comment */}
            <textarea
              ref={commentRef}
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[80px] text-sm text-neutral-900 placeholder:text-neutral-400 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Properties - Only show for Accept action */}
            {action === 'accept' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
                <PropertyChip
                  icon={<Target className="h-3.5 w-3.5 text-gray-500" />}
                  label="Business Unit"
                  value={selectedInitiative?.name || "Seleccionar BU (Requerido)"}
                  options={initiatives.map(initiative => ({
                    name: initiative.id,
                    label: initiative.name,
                    icon: <Target className="w-2.5 h-2.5 text-gray-600" />
                  }))}
                  onSelect={(value) => setSelectedInitiativeId(value)}
                  loading={loading}
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
                  loading={loading}
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
                  loading={loading}
                />

                <PropertyChip
                  icon={selectedPriority ? selectedPriorityConfig?.icon : <Minus className="w-2.5 h-2.5 text-gray-400" />}
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
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9"
            >
              Cancel
            </Button>
            <Button 
              className={`h-9 px-4 text-white font-medium ${
                action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                action === 'decline' ? 'bg-red-500 hover:bg-red-600' : 
                'bg-yellow-500 hover:bg-yellow-600'
              }`}
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {action === 'accept' ? 'Accept Issue' : action === 'decline' ? 'Decline Issue' : 'Snooze Issue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}