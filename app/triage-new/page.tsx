"use client"

import React, { useState, useEffect } from "react"
import { 
  ResizableAppShell, 
  ResizablePageSheet, 
  PageHeader
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { AcceptIssueModal } from "@/components/ui/modal/accept-issue-modal"
import { CommandPalette } from "@/components/command-palette"
import { 
  Filter, 
  MoreHorizontal, 
  Star, 
  Copy, 
  ExternalLink,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Edit3,
  Save,
  X,
  ChevronDown,
  Hash,
  Flag,
  Target,
  Hexagon
} from "lucide-react"
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
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useResizableSections } from "@/hooks/use-resizable-sections"
import { TeamsConversation } from "@/components/teams-conversation"
import { IssuesAPI } from "@/lib/api/issues"

// Component for empty state when no issue is selected
function EmptyIssueState() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          Selecciona un issue
        </h3>
        <p className="text-sm text-gray-400">
          Elige un issue de la lista para ver sus detalles
        </p>
      </div>
    </div>
  )
}

// Individual chip component with Command dropdown (like Projects filters)
interface ChipProps {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  options: Array<{ name: string; label?: string; icon?: React.ReactNode; avatar?: string }>
  onSelect?: (value: string) => void
  loading?: boolean
}

function PropertyChip({ icon, label, value, options, onSelect, loading = false }: ChipProps) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)

  // Determine width based on label
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
        <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]]:py-1.5 [&_[cmdk-input-wrapper]_svg]:!text-black [&_[cmdk-input-wrapper]_svg]:!opacity-100 [&_[cmdk-input-wrapper]_svg]:!w-4 [&_[cmdk-input-wrapper]_svg]:!h-4 [&_[cmdk-input-wrapper]_svg]:!mr-2 [&_[cmdk-input-wrapper]]:!flex [&_[cmdk-input-wrapper]]:!items-center [&_[cmdk-input-wrapper]_svg]:!stroke-2">
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
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  key={option.name}
                  value={option.name}
                  onSelect={() => {
                    onSelect?.(option.name)
                    setOpen(false)
                    setCommandInput("")
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {option.avatar ? (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 font-medium">{option.avatar}</AvatarFallback>
                      </Avatar>
                    ) : option.icon ? (
                      <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                        {option.icon}
                      </div>
                    ) : null}
                    <span className="text-black font-normal text-[14px] flex-1">
                      {option.label || option.name}
                    </span>
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

// Main chip panel component
interface IssueChipPanelProps {
  issue: any
  conversationActivity?: any
  metadataActivity?: any
  onTriageAction?: (issue: any, action: string) => void
  onIssueUpdate?: (updatedIssue: any) => void
}

function IssueChipPanel({ issue, conversationActivity, metadataActivity, onTriageAction, onIssueUpdate }: IssueChipPanelProps) {
  const selectedIssue = issue // El issue seleccionado es el que se pasa como prop
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [availableProjects, setAvailableProjects] = useState<any[]>([])
  const [availableInitiatives, setAvailableInitiatives] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [localIssue, setLocalIssue] = useState(issue)

  // Sync local issue with prop
  useEffect(() => {
    setLocalIssue(issue)
  }, [issue])

  // Load data for dropdowns
  useEffect(() => {
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
        console.error('Error loading chip data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Update functions
  const updateIssueState = async (newState: string) => {
    try {
      await IssuesAPI.updateIssue(issue.id, { state: newState as any })
      const updatedIssue = { ...localIssue, state: newState as any }
      setLocalIssue(updatedIssue)
      onIssueUpdate?.(updatedIssue) // Notify parent
    } catch (error) {
      console.error('Error updating state:', error)
    }
  }

  const updateIssuePriority = async (newPriority: string) => {
    try {
      await IssuesAPI.updateIssue(issue.id, { priority: newPriority as any })
      const updatedIssue = { ...localIssue, priority: newPriority as any }
      setLocalIssue(updatedIssue)
      onIssueUpdate?.(updatedIssue) // Notify parent
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const updateIssueAssignee = async (assigneeId: string) => {
    try {
      const actualAssigneeId = assigneeId === 'unassigned' ? null : assigneeId
      await IssuesAPI.updateIssue(issue.id, { assignee_id: actualAssigneeId })
      const newAssignee = actualAssigneeId ? availableUsers.find(u => u.id === actualAssigneeId) : null
      const updatedIssue = { ...localIssue, assignee: newAssignee, assignee_id: actualAssigneeId }
      setLocalIssue(updatedIssue)
      onIssueUpdate?.(updatedIssue) // Notify parent
    } catch (error) {
      console.error('Error updating assignee:', error)
    }
  }

  const updateIssueProject = async (projectId: string) => {
    try {
      const actualProjectId = projectId === 'unassigned' ? null : projectId
      await IssuesAPI.updateIssue(issue.id, { project_id: actualProjectId })
      const newProject = actualProjectId ? availableProjects.find(p => p.id === actualProjectId) : null
      const updatedIssue = { ...localIssue, project: newProject, project_id: actualProjectId }
      setLocalIssue(updatedIssue)
      onIssueUpdate?.(updatedIssue) // Notify parent
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const updateIssueInitiative = async (initiativeId: string) => {
    try {
      const actualInitiativeId = initiativeId === 'unassigned' ? null : initiativeId
      await IssuesAPI.updateIssue(issue.id, { initiative_id: actualInitiativeId })
      const newInitiative = actualInitiativeId ? availableInitiatives.find(i => i.id === actualInitiativeId) : null
      const updatedIssue = { ...localIssue, initiative: newInitiative, initiative_id: actualInitiativeId }
      setLocalIssue(updatedIssue)
      onIssueUpdate?.(updatedIssue) // Notify parent
    } catch (error) {
      console.error('Error updating initiative:', error)
    }
  }

  const getStateIcon = (state: string) => {
    const stateMap: Record<string, { icon: React.ReactNode; label: string }> = {
      'triage': { icon: <Circle className="h-3.5 w-3.5 text-purple-500" />, label: 'Triage' },
      'todo': { icon: <Circle className="h-3.5 w-3.5 text-gray-400" />, label: 'To do' },
      'in_progress': { icon: <Clock className="h-3.5 w-3.5 text-blue-500" />, label: 'In progress' },
      'blocked': { icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />, label: 'Blocked' },
      'waiting_info': { icon: <AlertCircle className="h-3.5 w-3.5 text-orange-500" />, label: 'Waiting info' },
      'done': { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />, label: 'Done' },
      'canceled': { icon: <X className="h-3.5 w-3.5 text-gray-400" />, label: 'Canceled' }
    }
    
    return stateMap[state] || { icon: <Circle className="h-3.5 w-3.5 text-gray-400" />, label: 'Sin estado' }
  }

  const getPriorityIcon = (priority: string) => {
    const priorityMap: Record<string, { icon: React.ReactNode; label: string }> = {
      'P0': { icon: <ArrowUp className="h-3.5 w-3.5 text-red-500" />, label: 'Crítica' },
      'P1': { icon: <ArrowUp className="h-3.5 w-3.5 text-orange-500" />, label: 'Alta' },
      'P2': { icon: <Minus className="h-3.5 w-3.5 text-yellow-500" />, label: 'Media' },
      'P3': { icon: <ArrowDown className="h-3.5 w-3.5 text-green-500" />, label: 'Baja' }
    }
    
    return priorityMap[priority] || { icon: <Minus className="h-3.5 w-3.5 text-gray-400" />, label: 'Sin prioridad' }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sección de chips de propiedades */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-white relative" style={{ borderColor: 'var(--stroke)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <PropertyChip
            icon={getStateIcon(localIssue.state).icon}
            label="Estado"
            value={getStateIcon(localIssue.state).label}
            options={[
              { name: 'triage', label: 'Triage', icon: <Circle className="w-2.5 h-2.5 text-purple-500" /> },
              { name: 'todo', label: 'To do', icon: <Circle className="w-2.5 h-2.5 text-gray-400" /> },
              { name: 'in_progress', label: 'In progress', icon: <Clock className="w-2.5 h-2.5 text-blue-500" /> },
              { name: 'blocked', label: 'Blocked', icon: <AlertCircle className="w-2.5 h-2.5 text-red-500" /> },
              { name: 'done', label: 'Done', icon: <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> }
            ]}
            onSelect={updateIssueState}
            loading={loading}
          />
          
          <PropertyChip
            icon={getPriorityIcon(localIssue.priority).icon}
            label="Prioridad"
            value={getPriorityIcon(localIssue.priority).label}
            options={[
              { name: 'P0', label: 'Crítica', icon: <ArrowUp className="w-2.5 h-2.5 text-red-500" /> },
              { name: 'P1', label: 'Alta', icon: <ArrowUp className="w-2.5 h-2.5 text-orange-500" /> },
              { name: 'P2', label: 'Media', icon: <Minus className="w-2.5 h-2.5 text-yellow-500" /> },
              { name: 'P3', label: 'Baja', icon: <ArrowDown className="w-2.5 h-2.5 text-green-500" /> }
            ]}
            onSelect={updateIssuePriority}
            loading={loading}
          />
          
          <PropertyChip
            icon={<User className="h-3.5 w-3.5 text-gray-500" />}
            label="Asignado"
            value={localIssue.assignee?.name || 'Sin asignar'}
            options={[
              ...availableUsers.map(user => ({
                name: user.id,
                label: user.name,
                avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
              })),
              { name: 'unassigned', label: 'Sin asignar', icon: <User className="w-2.5 h-2.5 text-gray-400" /> }
            ]}
            onSelect={updateIssueAssignee}
            loading={loading}
          />
          
          <PropertyChip
            icon={<Hexagon className="h-3.5 w-3.5 text-gray-500" />}
            label="Proyecto"
            value={localIssue.project?.name || 'Sin proyecto'}
            options={[
              ...availableProjects.map(project => ({
                name: project.id,
                label: project.name,
                icon: <Hexagon className="w-2.5 h-2.5 text-gray-600" />
              })),
              { name: 'unassigned', label: 'Sin proyecto', icon: <Hexagon className="w-2.5 h-2.5 text-gray-400" /> }
            ]}
            onSelect={updateIssueProject}
            loading={loading}
          />
          
          <PropertyChip
            icon={<Target className="h-3.5 w-3.5 text-gray-500" />}
            label="Business Unit"
            value={localIssue.initiative?.name || 'Sin BU'}
            options={[
              ...availableInitiatives.map(initiative => ({
                name: initiative.id,
                label: initiative.name,
                icon: <Target className="w-2.5 h-2.5 text-gray-600" />
              })),
              { name: 'unassigned', label: 'Sin BU', icon: <Target className="w-2.5 h-2.5 text-gray-400" /> }
            ]}
            onSelect={updateIssueInitiative}
            loading={loading}
          />

          {/* Separador visual */}
          <div className="h-7 w-px bg-gray-200 mx-1" />

          {/* Actions Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-dashed bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 gap-1.5 px-3 text-xs rounded-lg font-medium transition-all duration-200"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Actions</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-2" align="end">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    if (onTriageAction) {
                      onTriageAction(selectedIssue, 'accept')
                    }
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 text-left pt-0.5">
                    <div className="text-sm font-semibold text-gray-900">Accept</div>
                    <div className="text-xs text-gray-500 mt-0.5">Move to backlog</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onTriageAction) {
                      onTriageAction(selectedIssue, 'decline')
                    }
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 text-left pt-0.5">
                    <div className="text-sm font-semibold text-gray-900">Decline</div>
                    <div className="text-xs text-gray-500 mt-0.5">Reject this issue</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onTriageAction) {
                      onTriageAction(selectedIssue, 'snooze')
                    }
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 text-left pt-0.5">
                    <div className="text-sm font-semibold text-gray-900">Snooze</div>
                    <div className="text-xs text-gray-500 mt-0.5">Review later</div>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div className="flex-1 overflow-y-auto">
        {selectedIssue ? (
          <div className="p-6 space-y-5">
            {/* Header con título del issue */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="p-4">
                <h1 className="text-lg font-semibold text-gray-900 mb-3">{selectedIssue.title}</h1>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{selectedIssue.key}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{selectedIssue.reporter?.name || 'Usuario desconocido'}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{selectedIssue.created_at ? new Date(selectedIssue.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Sin fecha'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción del Issue */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-medium text-gray-900">Descripción</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedIssue.description || "Este issue necesita ser revisado para determinar si debe ser aceptado en el backlog del producto. El equipo de triage debe evaluar la prioridad, asignar recursos y decidir el siguiente paso."}
                </p>
              </div>
            </div>

            {/* Conversación de Teams (si existe) */}
            {conversationActivity?.payload?.messages && (
              <TeamsConversation
                messages={conversationActivity.payload.messages}
                conversationUrl={metadataActivity?.payload?.conversation_url}
                summary={metadataActivity?.payload?.ai_analysis?.summary}
                keyPoints={metadataActivity?.payload?.ai_analysis?.key_points}
                suggestedAssignee={metadataActivity?.payload?.ai_analysis?.suggested_assignee}
              />
            )}

            {/* Contexto y evaluación */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-gray-900">Guía de evaluación</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Sigue estos pasos para evaluar correctamente este issue y determinar la acción a tomar.
                </p>
                
                {/* Pasos del proceso */}
                <div className="space-y-2.5">
                  {[
                    { step: 1, text: "Revisar la descripción y determinar el tipo de issue", icon: <Circle className="h-3 w-3" /> },
                    { step: 2, text: "Asignar prioridad basada en impacto y urgencia", icon: <Flag className="h-3 w-3" /> },
                    { step: 3, text: "Decidir la acción: aceptar, rechazar o posponer", icon: <CheckCircle2 className="h-3 w-3" /> }
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {item.step}
                      </div>
                      <p className="text-sm text-gray-700 pt-0.5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Información técnica */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Metadata</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedIssue.key}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Origen</div>
                    <div className="text-sm text-gray-900 flex items-center gap-1.5">
                      {selectedIssue.origin === 'teams' && <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />}
                      <span className="capitalize">{selectedIssue.origin || 'Manual'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Estado actual</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedIssue.state || 'Triage'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de triage */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-medium text-gray-900">Acciones</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-green-200 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Aceptar
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-red-200 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium">
                    <X className="h-4 w-4" />
                    Rechazar
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-orange-200 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 font-medium">
                    <Copy className="h-4 w-4" />
                    Duplicado
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium">
                    <Clock className="h-4 w-4" />
                    Posponer
                  </button>
                </div>
              </div>
            </div>

            {/* Comentarios y notas */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Notas</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <textarea 
                    placeholder="Agregar notas sobre la decisión de triage..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors resize-none bg-white"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                      Guardar nota
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un issue para revisar
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Elige un issue de la lista de triage para ver los detalles completos y tomar una decisión sobre su estado.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TriageNewPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [triageAction, setTriageAction] = useState<"accept" | "duplicate" | "decline" | "snooze" | null>(null)
  const [triageIssue, setTriageIssue] = useState<any | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")
  const [issueActivities, setIssueActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  // Conectar con datos reales de Supabase
  const { 
    triageIssues, 
    loading, 
    error,
    acceptIssue,
    declineIssue,
    snoozeIssue
  } = useSupabaseData()
  
  // Get Teams conversation data from activities
  const conversationActivity = issueActivities.find(
    (activity: any) => activity.payload?.source === 'teams_conversation_history'
  )
  const metadataActivity = issueActivities.find(
    (activity: any) => activity.payload?.source === 'teams_conversation'
  )
  
  // Hook para manejar el redimensionamiento entre secciones
  const {
    leftWidthPercent,
    rightWidthPercent,
    isDragging,
    handleMouseDown,
    containerRef
  } = useResizableSections({ initialLeftWidth: 35 })

  const handleTriageAction = (issue: any, action: string) => {
    setTriageAction(action as any)
    setTriageIssue(issue)
  }

  const handleIssueSelect = async (issue: any) => {
    setSelectedIssue(issue)
    setEditedDescription(issue.description || "")
    setIsEditingDescription(false)
    
    // Load activities for this issue
    if (issue?.id) {
      setLoadingActivities(true)
      try {
        const activities = await IssuesAPI.getIssueActivities(issue.id)
        setIssueActivities(activities)
      } catch (error) {
        console.error('Error loading issue activities:', error)
        setIssueActivities([])
      } finally {
        setLoadingActivities(false)
      }
    }
  }

  // Handle issue updates from IssueChipPanel
  const handleIssueUpdate = (updatedIssue: any) => {
    setSelectedIssue(updatedIssue)
    // Also update in triageIssue if it's the same issue
    if (triageIssue?.id === updatedIssue.id) {
      setTriageIssue(updatedIssue)
    }
  }

  // Triage action handlers
  const handleAcceptIssue = async (data: any) => {
    if (!triageIssue) return
    
    try {
      // Map modal data to API format
      const acceptData = {
        initiative_id: data.initiative,    // Business Unit (OBLIGATORIO)
        project_id: data.project || null,  // Proyecto estratégico (OPCIONAL)
        assignee_id: data.assignee || null, // Allow null if not selected
        priority: data.priority || triageIssue.priority || null // Use modal priority, fallback to current issue priority
      }

      // Pass comment to send Teams notification
      const success = await acceptIssue(triageIssue.id, acceptData, data.comment)
      
      if (success) {
        // Close modal and clear selection
        setTriageAction(null)
        setTriageIssue(null)
        
        // If selected issue was the one accepted, clear it from view
        if (selectedIssue?.id === triageIssue.id) {
          setSelectedIssue(null)
        }
      }
    } catch (error) {
      console.error('Error accepting issue:', error)
    }
  }

  const handleDeclineIssue = async (data: any) => {
    if (!triageIssue) return
    
    try {
      const success = await declineIssue(triageIssue.id, data.reason || data.comment)
      
      if (success) {
        // Close modal and clear selection
        setTriageAction(null)
        setTriageIssue(null)
        
        // If selected issue was the one declined, clear it from view
        if (selectedIssue?.id === triageIssue.id) {
          setSelectedIssue(null)
        }
      }
    } catch (error) {
      console.error('Error declining issue:', error)
    }
  }

  const handleSnoozeIssue = async (data: any) => {
    if (!triageIssue) return
    
    try {
      const success = await snoozeIssue(
        triageIssue.id, 
        data.until.toISOString(),
        data.comment
      )
      
      if (success) {
        // Close modal and clear selection
        setTriageAction(null)
        setTriageIssue(null)
        
        // If selected issue was the one snoozed, clear it from view
        if (selectedIssue?.id === triageIssue.id) {
          setSelectedIssue(null)
        }
      }
    } catch (error) {
      console.error('Error snoozing issue:', error)
    }
  }

  // Helper functions for icons and status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "waiting_info":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "P0":
      case "P1":
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case "P3":
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800 border-red-200"
      case "P1":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "P2":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "P3":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "triage":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      case "waiting_info":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      case "canceled":
        return "bg-gray-100 text-gray-600 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet
          header={
            <div style={{ borderBottom: '1px solid var(--stroke)' }}>
              <PageHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Team</span>
                  <span className="text-sm text-gray-400">›</span>
                  <span className="text- font-medium">Triage</span>
                </div>
              </PageHeader>
            </div>
          }
        >
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  return (
    <ResizableAppShell
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      onOpenCreateIssue={() => setShowCreateModal(true)}
    >
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Team</span>
                <span className="text-sm text-gray-400">›</span>
                <span className="text-sm font-medium">Triage</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        {/* Container absoluto que ignora completamente el sistema de padding */}
        <div 
          className="absolute inset-0"
          style={{ top: 'var(--header-h)' }}
        >
          <div 
            ref={containerRef}
            className="flex h-full overflow-hidden relative"
          >
          {/* Sección Izquierda - Lista de Issues de Triage */}
          <div 
            className="flex flex-col overflow-hidden"
            style={{ 
              width: `${leftWidthPercent}%`
            }}
          >
            <div className="flex-1 overflow-y-auto">
              {triageIssues && triageIssues.length > 0 ? (
                <div className="divide-y" style={{ borderColor: 'var(--stroke)' }}>
                  {triageIssues.map((issue, index) => (
                    <div
                      key={issue.id}
                      className={`px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 relative ${
                        selectedIssue?.id === issue.id ? '' : ''
                      }`}
                      onClick={() => handleIssueSelect(issue)}
                    >
                      {/* Resalte fino de todo el ancho cuando está seleccionado */}
                      {selectedIssue?.id === issue.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400" />
                      )}
                      {/* Título del issue */}
                      <div className="mb-2.5">
                        <h3 className="text-sm font-medium text-gray-900 leading-5 mb-1">
                          {issue.title}
                        </h3>
                        {/* Tags y metadata */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Estado badge */}
                          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            issue.state === 'triage' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            issue.state === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {getStatusIcon(issue.state || 'triage')}
                            <span className="capitalize">{issue.state === 'triage' ? 'Triage' : issue.state || 'triage'}</span>
                          </div>
                          
                          {/* Prioridad badge */}
                          {issue.priority && (
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                              issue.priority === 'P0' ? 'bg-red-50 text-red-700 border border-red-200' :
                              issue.priority === 'P1' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              issue.priority === 'P2' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              {getPriorityIcon(issue.priority)}
                              <span>{issue.priority}</span>
                            </div>
                          )}
                          
                          {/* Teams badge si viene de Teams */}
                          {issue.origin === 'teams' && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <MessageSquare className="h-3 w-3" />
                              <span>Teams</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Línea inferior con autor y fecha */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <User className="h-3 w-3" />
                          <span>
                            {issue.reporter?.name || issue.assignee?.name || 'Sin asignar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {issue.created_at ? new Date(issue.created_at).toLocaleDateString('es-ES', { 
                              month: 'short', 
                              day: 'numeric' 
                            }) : 'Sin fecha'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-sm mb-2">No hay issues en triage</p>
                    <p className="text-xs text-gray-400">
                      Los nuevos issues aparecerán aquí automáticamente
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Drag Handle - Línea divisoria simple que va de arriba a abajo */}
          <div
            className="relative cursor-col-resize hover:bg-blue-500/10 transition-colors duration-200"
            style={{ 
              width: '1px',
              backgroundColor: 'var(--stroke)',
              zIndex: 10
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Área de hit más amplia para facilitar el arrastre */}
            <div 
              className="absolute inset-y-0 -left-2 -right-2"
              style={{ zIndex: 1 }}
            />
          </div>

          {/* Sección Derecha - Detalles del Issue */}
          <div 
            className="flex flex-col overflow-hidden bg-white"
            style={{ 
              width: `${rightWidthPercent}%`
            }}
          >
            {selectedIssue ? (
              <IssueChipPanel 
                issue={selectedIssue} 
                conversationActivity={conversationActivity}
                metadataActivity={metadataActivity}
                onTriageAction={handleTriageAction}
                onIssueUpdate={handleIssueUpdate}
              />
            ) : (
              <EmptyIssueState />
            )}
          </div>
        </div>
        </div>
        
        {/* Overlay durante el arrastre para una experiencia suave */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize" />
        )}
      </ResizablePageSheet>

      {/* Modales */}
      <CreateIssueModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onCreateIssue={() => {}} 
      />

      <AcceptIssueModal
        issue={triageIssue}
        open={!!triageAction}
        onOpenChange={(open) => {
          if (!open) {
            setTriageAction(null)
            setTriageIssue(null)
          }
        }}
        onAccept={handleAcceptIssue}
        onDecline={handleDeclineIssue}
        onSnooze={handleSnoozeIssue}
      />

      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </ResizableAppShell>
  )
}
