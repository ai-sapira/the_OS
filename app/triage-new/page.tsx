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
  Flag
} from "lucide-react"
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

// Individual chip component
interface ChipProps {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  onClick?: () => void
  isActive?: boolean
  children?: React.ReactNode
}

function PropertyChip({ icon, label, value, onClick, isActive = false, children }: ChipProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-200
          hover:bg-white hover:border-gray-300 hover:shadow-sm group text-sm font-medium
          ${isActive ? 'border-blue-300 bg-white shadow-md' : 'border-gray-300 bg-white/50'}
        `}
      >
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className="text-gray-700 whitespace-nowrap font-medium">
          {value}
        </span>
        <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Individual dropdown for this chip */}
      {isActive && children && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-white rounded-md border border-gray-200 shadow-lg z-50 transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-top-2 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )
}

// Main chip panel component
interface IssueChipPanelProps {
  issue: any
  conversationActivity?: any
  metadataActivity?: any
}

function IssueChipPanel({ issue, conversationActivity, metadataActivity }: IssueChipPanelProps) {
  const selectedIssue = issue // El issue seleccionado es el que se pasa como prop
  const [activeChip, setActiveChip] = useState<string | null>(null)

  const handleChipClick = (chipId: string) => {
    setActiveChip(activeChip === chipId ? null : chipId)
  }

  const getStateIcon = (state: string) => {
    const stateMap: Record<string, { icon: React.ReactNode; label: string }> = {
      'triage': { icon: <Circle className="h-3.5 w-3.5 text-purple-500" />, label: 'Triage' },
      'todo': { icon: <Circle className="h-3.5 w-3.5 text-gray-400" />, label: 'Por hacer' },
      'in_progress': { icon: <Clock className="h-3.5 w-3.5 text-blue-500" />, label: 'En progreso' },
      'blocked': { icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />, label: 'Bloqueado' },
      'waiting_info': { icon: <AlertCircle className="h-3.5 w-3.5 text-orange-500" />, label: 'Esperando info' },
      'done': { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />, label: 'Completado' },
      'canceled': { icon: <X className="h-3.5 w-3.5 text-gray-400" />, label: 'Cancelado' }
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
      <div className="flex-shrink-0 px-4 py-3 border-b bg-gray-50/50 relative" style={{ borderColor: 'var(--stroke)' }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <PropertyChip
            icon={getStateIcon(issue.state).icon}
            label="Estado"
            value={getStateIcon(issue.state).label}
            onClick={() => handleChipClick('state')}
            isActive={activeChip === 'state'}
          >
            <div className="py-1">
              {[
                { value: 'todo', label: 'Por hacer', icon: <Circle className="h-3.5 w-3.5 text-gray-400" /> },
                { value: 'in_progress', label: 'En progreso', icon: <Clock className="h-3.5 w-3.5 text-blue-500" /> },
                { value: 'blocked', label: 'Bloqueado', icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" /> },
                { value: 'done', label: 'Completado', icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> }
              ].map((state, index) => (
                <div key={state.value}>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                    {state.icon}
                    <span className="text-gray-900 font-medium">{state.label}</span>
                  </button>
                  {index < 3 && <div className="h-px bg-gray-100 mx-1" />}
                </div>
              ))}
            </div>
          </PropertyChip>
          
          <PropertyChip
            icon={getPriorityIcon(issue.priority).icon}
            label="Prioridad"
            value={getPriorityIcon(issue.priority).label}
            onClick={() => handleChipClick('priority')}
            isActive={activeChip === 'priority'}
          >
            <div className="py-1">
              {[
                { value: 'P0', label: 'Crítica', icon: <ArrowUp className="h-3.5 w-3.5 text-red-500" /> },
                { value: 'P1', label: 'Alta', icon: <ArrowUp className="h-3.5 w-3.5 text-orange-500" /> },
                { value: 'P2', label: 'Media', icon: <Minus className="h-3.5 w-3.5 text-yellow-500" /> },
                { value: 'P3', label: 'Baja', icon: <ArrowDown className="h-3.5 w-3.5 text-green-500" /> }
              ].map((priority, index) => (
                <div key={priority.value}>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                    {priority.icon}
                    <span className="text-gray-900 font-medium">{priority.label}</span>
                    <span className="text-gray-500 ml-auto text-xs font-mono">{priority.value}</span>
                  </button>
                  {index < 3 && <div className="h-px bg-gray-100 mx-1" />}
                </div>
              ))}
            </div>
          </PropertyChip>
          
          <PropertyChip
            icon={<User className="h-3.5 w-3.5 text-gray-500" />}
            label="Asignado"
            value={issue.assignee?.name || 'Sin asignar'}
            onClick={() => handleChipClick('assignee')}
            isActive={activeChip === 'assignee'}
          >
            <div className="py-1">
              {[
                { id: 'ps', name: 'Pablo Senabre', avatar: 'PS' },
                { id: 'jd', name: 'John Doe', avatar: 'JD' },
                { id: 'mg', name: 'María García', avatar: 'MG' }
              ].map((user, index) => (
                <div key={user.id}>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </button>
                  {index < 2 && <div className="h-px bg-gray-100 mx-1" />}
                </div>
              ))}
              <div className="h-px bg-gray-100 mx-1" />
              <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                <div className="h-6 w-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-400" />
                </div>
                <span className="text-gray-500 font-medium">Sin asignar</span>
              </button>
            </div>
          </PropertyChip>
          
          <PropertyChip
            icon={<Hash className="h-3.5 w-3.5 text-gray-500" />}
            label="Proyecto"
            value={issue.project?.name || 'Sin proyecto'}
            onClick={() => handleChipClick('project')}
            isActive={activeChip === 'project'}
          >
            <div className="py-1">
              {[
                { id: 'alpha', name: 'Proyecto Alpha', color: 'text-blue-500' },
                { id: 'beta', name: 'Proyecto Beta', color: 'text-green-500' },
                { id: 'gamma', name: 'Proyecto Gamma', color: 'text-purple-500' }
              ].map((project, index) => (
                <div key={project.id}>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                    <Hash className={`h-3.5 w-3.5 ${project.color}`} />
                    <span className="text-gray-900 font-medium">{project.name}</span>
                  </button>
                  {index < 2 && <div className="h-px bg-gray-100 mx-1" />}
                </div>
              ))}
              <div className="h-px bg-gray-100 mx-1" />
              <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500 font-medium">Sin proyecto</span>
              </button>
            </div>
          </PropertyChip>
          
          <PropertyChip
            icon={<Calendar className="h-3.5 w-3.5 text-gray-500" />}
            label="Creado"
            value={issue.created_at ? new Date(issue.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            }) : 'Sin fecha'}
            onClick={() => handleChipClick('created')}
            isActive={activeChip === 'created'}
          >
            <div className="p-3">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha de creación</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {issue.created_at ? new Date(issue.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Sin fecha'}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reportado por</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {issue.reporter?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-medium">{issue.reporter?.name || 'Desconocido'}</span>
                  </div>
                </div>
              </div>
            </div>
          </PropertyChip>
          
          <PropertyChip
            icon={<Tag className="h-3.5 w-3.5 text-gray-500" />}
            label="Etiquetas"
            value={issue.labels && issue.labels.length > 0 ? `${issue.labels.length} etiquetas` : 'Sin etiquetas'}
            onClick={() => handleChipClick('labels')}
            isActive={activeChip === 'labels'}
          >
            <div className="p-3">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Etiquetas actuales</div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Frontend
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Bug
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      Urgent
                    </Badge>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors w-full">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="font-medium">Agregar etiqueta</span>
                </button>
              </div>
            </div>
          </PropertyChip>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div className="flex-1 overflow-y-auto">
        {selectedIssue ? (
          <div className="p-6 space-y-5">
            {/* Header con título del issue */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">{selectedIssue.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-mono">{selectedIssue.key}</span>
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <span>Reportado por {selectedIssue.reporter?.name || 'Usuario desconocido'}</span>
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{selectedIssue.created_at ? new Date(selectedIssue.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Sin fecha'}</span>
              </div>
            </div>

            {/* Descripción del Issue */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <h2 className="text-base font-medium text-gray-900">Descripción</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedIssue.description || "Este issue necesita ser revisado para determinar si debe ser aceptado en el backlog del producto. El equipo de triage debe evaluar la prioridad, asignar recursos y decidir el siguiente paso."}
                </p>
              </div>
            </div>

            {/* Conversación de Teams (si existe) */}
            {conversationActivity?.payload?.messages && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <TeamsConversation
                  messages={conversationActivity.payload.messages}
                  conversationUrl={metadataActivity?.payload?.conversation_url}
                  summary={metadataActivity?.payload?.ai_analysis?.summary}
                  keyPoints={metadataActivity?.payload?.ai_analysis?.key_points}
                  suggestedAssignee={metadataActivity?.payload?.ai_analysis?.suggested_assignee}
                />
              </div>
            )}

            {/* Contexto y evaluación */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-base font-medium text-gray-900">Evaluación de triage</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Este issue requiere atención del equipo de triage. La evaluación inicial sugiere que podría impactar 
                  la experiencia del usuario si no se aborda adecuadamente.
                </p>
                
                {/* Pasos del proceso */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Proceso de evaluación:</h4>
                  {[
                    { step: 1, text: "Revisar la descripción y determinar el tipo de issue", icon: <Circle className="h-3 w-3" /> },
                    { step: 2, text: "Asignar prioridad basada en impacto y urgencia", icon: <Flag className="h-3 w-3" /> },
                    { step: 3, text: "Decidir la acción: aceptar, rechazar o posponer", icon: <CheckCircle2 className="h-3 w-3" /> }
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {item.step}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400">{item.icon}</div>
                        <p className="text-sm text-gray-700">{item.text}</p>
                      </div>
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
                  <h3 className="text-base font-medium text-gray-900">Información técnica</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50/50 border border-gray-100 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedIssue.key}</div>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Origen</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedIssue.origin || 'Manual'}</div>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado actual</div>
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
                  <h3 className="text-base font-medium text-gray-900">Acciones de triage</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm border border-green-200 text-green-700 bg-green-50 rounded-md hover:bg-green-100 hover:border-green-300 transition-all duration-200 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aceptar issue
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-700 bg-red-50 rounded-md hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium">
                    <X className="h-3.5 w-3.5" />
                    Rechazar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm border border-orange-200 text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 font-medium">
                    <Copy className="h-3.5 w-3.5" />
                    Marcar duplicado
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm border border-blue-200 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Posponer
                  </button>
                </div>
              </div>
            </div>

            {/* Comentarios y notas */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <h3 className="text-base font-medium text-gray-900">Notas del triage</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <textarea 
                    placeholder="Agregar notas sobre la decisión de triage..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
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
  const { triageIssues, loading, error} = useSupabaseData()
  
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
          <div style={{ borderBottom: '1px solid var(--stroke)' }}>
            <PageHeader>
              <div className="flex items-center justify-between w-full h-full py-1">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Team</span>
                  <span className="text-sm text-gray-400">›</span>
                  <span className="text-sm font-medium">Triage</span>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-2">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Filter className="h-4 w-4" />
                  </Button>
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
          </div>
        }
      >
        {/* Container absoluto que ignora completamente el sistema de padding */}
        <div 
          className="absolute inset-0"
          style={{ top: 'calc(var(--header-h) - 15px)' }}
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
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-400" />
                      )}
                      {/* Título del issue */}
                      <div className="mb-2">
                        <h3 className="text-[15px] font-medium text-gray-1000 leading-5">
                          {issue.title}
                        </h3>
                      </div>

                      {/* Línea inferior con autor y fecha */}
                      <div className="flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
                            style={{ fontSize: '10px' }}
                          >
                            <span className="text-gray-600 font-medium">
                              {((issue.reporter?.name || issue.assignee?.name || 'Unassigned').replace(/\s+/g, '').toLowerCase()).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-600 leading-4">
                            {(issue.reporter?.name || issue.assignee?.name || 'Unassigned').replace(/\s+/g, '').toLowerCase()}
                          </span>
                        </div>
                        <span className="text-gray-400 flex-shrink-0 leading-4">
                          {issue.created_at ? new Date(issue.created_at).toLocaleDateString('es-ES', { 
                            month: 'short', 
                            day: 'numeric' 
                          }) : 'Sin fecha'}
                        </span>
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
        onAccept={() => {}}
        onDecline={() => {}}
        onSnooze={() => {}}
      />

      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </ResizableAppShell>
  )
}
