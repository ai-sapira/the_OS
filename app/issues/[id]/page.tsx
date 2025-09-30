"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
import { 
  MoreHorizontal, 
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
import { TeamsConversation } from "@/components/teams-conversation"
import { IssuesAPI } from "@/lib/api/issues"

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

export default function IssueDetailPage() {
  const params = useParams()
  const issueId = params.id as string
  
  const [issue, setIssue] = useState<any | null>(null)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [availableProjects, setAvailableProjects] = useState<any[]>([])
  const [availableInitiatives, setAvailableInitiatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [localIssue, setLocalIssue] = useState<any | null>(null)
  const [issueActivities, setIssueActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  // Load issue and data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [issueData, users, projects, initiatives] = await Promise.all([
          IssuesAPI.getIssueById(issueId),
          IssuesAPI.getAvailableUsers(),
          IssuesAPI.getProjects(),
          IssuesAPI.getInitiatives()
        ])
        
        setIssue(issueData)
        setLocalIssue(issueData)
        setAvailableUsers(users)
        setAvailableProjects(projects)
        setAvailableInitiatives(initiatives)

        // Load activities for this issue
        if (issueData?.id) {
          setLoadingActivities(true)
          try {
            const activities = await IssuesAPI.getIssueActivities(issueData.id)
            setIssueActivities(activities)
          } catch (error) {
            console.error('Error loading issue activities:', error)
            setIssueActivities([])
          } finally {
            setLoadingActivities(false)
          }
        }
      } catch (error) {
        console.error('Error loading issue data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (issueId) {
      loadData()
    }
  }, [issueId])

  // Sync local issue with prop
  useEffect(() => {
    setLocalIssue(issue)
  }, [issue])

  // Get Teams conversation data from activities
  const conversationActivity = issueActivities.find(
    (activity: any) => activity.payload?.source === 'teams_conversation_history'
  )
  const metadataActivity = issueActivities.find(
    (activity: any) => activity.payload?.source === 'teams_conversation'
  )

  // Update functions
  const updateIssueState = async (newState: string) => {
    if (!localIssue) return
    try {
      await IssuesAPI.updateIssue(localIssue.id, { state: newState as any })
      const updatedIssue = { ...localIssue, state: newState as any }
      setLocalIssue(updatedIssue)
      setIssue(updatedIssue)
    } catch (error) {
      console.error('Error updating state:', error)
    }
  }

  const updateIssuePriority = async (newPriority: string) => {
    if (!localIssue) return
    try {
      await IssuesAPI.updateIssue(localIssue.id, { priority: newPriority as any })
      const updatedIssue = { ...localIssue, priority: newPriority as any }
      setLocalIssue(updatedIssue)
      setIssue(updatedIssue)
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const updateIssueAssignee = async (assigneeId: string) => {
    if (!localIssue) return
    try {
      const actualAssigneeId = assigneeId === 'unassigned' ? null : assigneeId
      await IssuesAPI.updateIssue(localIssue.id, { assignee_id: actualAssigneeId })
      const newAssignee = actualAssigneeId ? availableUsers.find(u => u.id === actualAssigneeId) : null
      const updatedIssue = { ...localIssue, assignee: newAssignee, assignee_id: actualAssigneeId }
      setLocalIssue(updatedIssue)
      setIssue(updatedIssue)
    } catch (error) {
      console.error('Error updating assignee:', error)
    }
  }

  const updateIssueProject = async (projectId: string) => {
    if (!localIssue) return
    try {
      const actualProjectId = projectId === 'unassigned' ? null : projectId
      await IssuesAPI.updateIssue(localIssue.id, { project_id: actualProjectId })
      const newProject = actualProjectId ? availableProjects.find(p => p.id === actualProjectId) : null
      const updatedIssue = { ...localIssue, project: newProject, project_id: actualProjectId }
      setLocalIssue(updatedIssue)
      setIssue(updatedIssue)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const updateIssueInitiative = async (initiativeId: string) => {
    if (!localIssue) return
    try {
      const actualInitiativeId = initiativeId === 'unassigned' ? null : initiativeId
      await IssuesAPI.updateIssue(localIssue.id, { initiative_id: actualInitiativeId })
      const newInitiative = actualInitiativeId ? availableInitiatives.find(i => i.id === actualInitiativeId) : null
      const updatedIssue = { ...localIssue, initiative: newInitiative, initiative_id: actualInitiativeId }
      setLocalIssue(updatedIssue)
      setIssue(updatedIssue)
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

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet
          header={
            <div style={{ borderBottom: '1px solid var(--stroke)' }}>
              <PageHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Issues</span>
                  <span className="text-sm text-gray-400">›</span>
                  <span className="text-sm font-medium">Cargando...</span>
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

  if (!localIssue) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet
          header={
            <div style={{ borderBottom: '1px solid var(--stroke)' }}>
              <PageHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Issues</span>
                  <span className="text-sm text-gray-400">›</span>
                  <span className="text-sm font-medium">No encontrado</span>
                </div>
              </PageHeader>
            </div>
          }
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Issue no encontrado
              </h3>
              <p className="text-sm text-gray-400">
                El issue que buscas no existe o no tienes permisos para verlo
              </p>
            </div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Issues</span>
                <span className="text-sm text-gray-400">›</span>
                <span className="text-sm font-medium">{localIssue.key}</span>
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
        <div className="flex flex-col h-full">
          {/* Sección de chips de propiedades */}
          <div className="flex-shrink-0 border-b bg-white relative" style={{ borderColor: 'var(--stroke)' }}>
            <div className="flex items-center gap-2 flex-wrap px-6 py-2">
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
            </div>
          </div>

          {/* Área de contenido principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Header con título del issue */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Badge con número del issue */}
                    {localIssue.key && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 border border-dashed border-gray-300 text-gray-700 shrink-0">
                        <Hash className="h-3 w-3" />
                        <span>{localIssue.key.replace('GON-', '')}</span>
                      </div>
                    )}
                    
                    <h1 className="text-lg font-semibold text-gray-900 flex-1">{localIssue.title}</h1>
                    
                    {/* Badge de tecnología core (estilo filtros) */}
                    {localIssue.core_technology && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 border border-dashed border-gray-300 text-gray-700 shrink-0">
                        <Hexagon className="h-3 w-3" />
                        <span>{localIssue.core_technology}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{localIssue.reporter?.name || 'Usuario desconocido'}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{localIssue.created_at ? new Date(localIssue.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Sin fecha'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido unificado: Resumen, Impacto y Descripción */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="p-5 space-y-4">
                  {/* Resumen (si existe) */}
                  {localIssue.short_description && (
                    <div>
                      <h3 className="text-[13px] text-gray-600 mb-2">Resumen</h3>
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {localIssue.short_description}
                      </p>
                    </div>
                  )}
                  
                  {/* Impacto (si existe) */}
                  {localIssue.impact && (
                    <div>
                      <h3 className="text-[13px] text-gray-600 mb-2">Impacto en negocio</h3>
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {localIssue.impact}
                      </p>
                    </div>
                  )}
                  
                  {/* Separador si hay contenido adicional */}
                  {(localIssue.short_description || localIssue.impact) && localIssue.description && (
                    <div className="border-t border-gray-100 my-4" />
                  )}
                  
                  {/* Descripción completa */}
                  {localIssue.description && (
                    <div>
                      <h3 className="text-[13px] text-gray-600 mb-2">Detalles</h3>
                      <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {localIssue.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Mensaje por defecto si no hay nada */}
                  {!localIssue.short_description && !localIssue.impact && !localIssue.description && (
                    <p className="text-sm text-gray-500 italic">
                      No hay descripción disponible para este issue.
                    </p>
                  )}
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

              {/* Notas internas */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-1 rounded-full bg-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas internas</h3>
                  </div>
                  <textarea 
                    placeholder="Añade comentarios sobre este issue para tu equipo..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors resize-none bg-white text-gray-900 placeholder:text-gray-400"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors">
                      <Save className="h-3 w-3" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
