"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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

// Timeline Calendar Component
interface TimelineCalendarProps {
  startDate: Date | null
  dueDate: Date | null
  slaDate: Date | null
  onUpdateDates?: (newStart: Date | null, newDue: Date | null) => void
}

function TimelineCalendar({ startDate, dueDate, slaDate, onUpdateDates }: TimelineCalendarProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Determine the range to show in the calendar
  const dates = [startDate, dueDate, slaDate].filter(Boolean) as Date[]
  if (dates.length === 0) return null
  
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  // Generate many months: 6 months before to 6 months after the range
  const startMonth = new Date(minDate.getFullYear(), minDate.getMonth() - 6, 1)
  const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 7, 0)
  
  // Generate months to display
  const months: { name: string; year: number; month: number; days: number; startDay: number }[] = []
  let currentDate = new Date(startMonth)
  
  while (currentDate <= endMonth) {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    months.push({
      name: currentDate.toLocaleDateString('es-ES', { month: 'long' }),
      year,
      month,
      days: daysInMonth,
      startDay: firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0
    })
    
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }
  
  // Helper to check if date is in range
  const isInRange = (date: Date) => {
    if (!startDate || !dueDate) return false
    return date >= startDate && date <= dueDate
  }
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    if (!onUpdateDates) return
    
    // If no dates set, set as start
    if (!startDate && !dueDate) {
      onUpdateDates(date, null)
      return
    }
    
    // If only start is set, set as due (if after start)
    if (startDate && !dueDate) {
      if (date > startDate) {
        onUpdateDates(startDate, date)
      } else {
        onUpdateDates(date, null)
      }
      return
    }
    
    // If both are set, determine which one to update based on proximity
    if (startDate && dueDate) {
      const distToStart = Math.abs(date.getTime() - startDate.getTime())
      const distToDue = Math.abs(date.getTime() - dueDate.getTime())
      
      if (distToStart < distToDue) {
        // Closer to start, update start (but keep it before due)
        if (date < dueDate) {
          onUpdateDates(date, dueDate)
        }
      } else {
        // Closer to due, update due (but keep it after start)
        if (date > startDate) {
          onUpdateDates(startDate, date)
        }
      }
    }
  }
  
  // Day names
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  
  // Width calculation: Each month is ~220px (7 days * 28px + gaps), show 3 months
  const monthWidth = 220
  const visibleMonths = 3
  const containerWidth = monthWidth * visibleMonths
  
  // Auto-scroll to the start date on mount
  React.useEffect(() => {
    if (scrollContainerRef.current && startDate) {
      // Calculate which month index contains the start date
      const startDateMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const monthsFromStart = Math.floor((startDateMonth.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24 * 30))
      
      // Scroll to show that month as the first visible month
      // Each month is ~220px wide + 24px gap = 244px
      const scrollPosition = monthsFromStart * 244
      
      scrollContainerRef.current.scrollLeft = scrollPosition
    }
  }, [startDate]) // Only run when startDate changes
  
  return (
    <div className="space-y-4">
      {/* Duration with nice formatting - at the top */}
      {startDate && dueDate && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-dashed border-gray-300">
          <Clock className="h-3.5 w-3.5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Del {startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} al {dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            <span className="text-gray-600 ml-1.5">({Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} días)</span>
          </span>
        </div>
      )}
      
      {/* Calendar grid - horizontal scroll (always show 3 months) */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-scroll overflow-y-visible pb-3" 
        style={{ 
          scrollbarWidth: 'thin', 
          scrollBehavior: 'smooth',
          maxWidth: `${containerWidth}px`,
          width: '100%'
        }}
      >
        <div className="flex gap-6">
          {months.map((monthData, monthIdx) => (
            <div key={`${monthData.year}-${monthIdx}`} className="flex-shrink-0">
              {/* Month header */}
              <div className="text-sm font-semibold text-gray-900 mb-3 capitalize">
                {monthData.name} {monthData.year}
              </div>
              
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(dayName => (
                  <div key={dayName} className="w-7 h-6 flex items-center justify-center text-[10px] font-medium text-gray-500 uppercase">
                    {dayName}
                  </div>
                ))}
              </div>
              
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthData.startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-7 h-7" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: monthData.days }).map((_, dayIdx) => {
                  const day = dayIdx + 1
                  const currentDate = new Date(monthData.year, monthData.month, day)
                  
                  const isStart = isSameDay(startDate, currentDate)
                  const isDue = isSameDay(dueDate, currentDate)
                  const isSLA = isSameDay(slaDate, currentDate)
                  const inRange = isInRange(currentDate)
                  const isToday = isSameDay(new Date(), currentDate)
                  
                  let bgColor = 'bg-white hover:bg-gray-50'
                  let borderColor = 'border-gray-200'
                  let textColor = 'text-gray-700'
                  let ringColor = 'hover:ring-gray-300'
                  
                  if (isStart) {
                    bgColor = 'bg-blue-500 hover:bg-blue-600'
                    textColor = 'text-white'
                    borderColor = 'border-blue-500'
                    ringColor = 'hover:ring-blue-400'
                  } else if (isDue) {
                    bgColor = 'bg-purple-500 hover:bg-purple-600'
                    textColor = 'text-white'
                    borderColor = 'border-purple-500'
                    ringColor = 'hover:ring-purple-400'
                  } else if (isSLA) {
                    bgColor = 'bg-orange-500 hover:bg-orange-600'
                    textColor = 'text-white'
                    borderColor = 'border-orange-500'
                    ringColor = 'hover:ring-orange-400'
                  } else if (inRange) {
                    bgColor = 'bg-blue-50 hover:bg-blue-100'
                    borderColor = 'border-blue-200'
                    textColor = 'text-blue-900'
                    ringColor = 'hover:ring-blue-300'
                  }
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(currentDate)}
                      className={`w-7 h-7 flex items-center justify-center text-xs font-medium border ${bgColor} ${borderColor} ${textColor} rounded transition-all hover:ring-1 ${ringColor} cursor-pointer relative ${isToday && !isStart && !isDue && !isSLA ? 'ring-1 ring-gray-400' : ''}`}
                      title={currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compact legend at the bottom */}
      <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-100">
        {startDate && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-gray-600">Inicio</span>
          </div>
        )}
        {dueDate && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-purple-500" />
            <span className="text-gray-600">Vencimiento</span>
          </div>
        )}
        {slaDate && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-orange-500" />
            <span className="text-gray-600">SLA</span>
          </div>
        )}
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

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
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
      const updatedIssue = await IssuesAPI.updateIssue(localIssue.id, { assignee_id: actualAssigneeId })
      console.log('[Issue Detail] Assignee updated, new data:', {
        assignee_id: updatedIssue.assignee_id,
        assignee: updatedIssue.assignee,
        assignee_name: updatedIssue.assignee?.name
      });
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
      const updatedIssue = await IssuesAPI.updateIssue(localIssue.id, { project_id: actualProjectId })
      console.log('[Issue Detail] Project updated, new data:', updatedIssue.project);
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
      const updatedIssue = await IssuesAPI.updateIssue(localIssue.id, { initiative_id: actualInitiativeId })
      console.log('[Issue Detail] Initiative updated, new data:', updatedIssue.initiative);
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
                <span 
                  onClick={() => router.push('/issues')} 
                  className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  Issues
                </span>
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

          {/* Área de contenido principal - Layout 2 columnas */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-[1fr_320px] gap-6">
                {/* COLUMNA PRINCIPAL (Izquierda) */}
                <div className="space-y-5">
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

              {/* Timeline/Calendario visual */}
              {(localIssue.planned_start_at || localIssue.due_at || localIssue.sla_due_date) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</h3>
                    </div>
                    
                    <TimelineCalendar
                      startDate={localIssue.planned_start_at ? new Date(localIssue.planned_start_at) : null}
                      dueDate={localIssue.due_at ? new Date(localIssue.due_at) : null}
                      slaDate={localIssue.sla_due_date ? new Date(localIssue.sla_due_date) : null}
                      onUpdateDates={(newStart, newDue) => {
                        IssuesAPI.updateIssue(localIssue.id, { 
                          planned_start_at: newStart?.toISOString() || null,
                          due_at: newDue?.toISOString() || null
                        })
                        setLocalIssue({ 
                          ...localIssue, 
                          planned_start_at: newStart?.toISOString() || null,
                          due_at: newDue?.toISOString() || null
                        })
                      }}
                    />
                  </div>
                </div>
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

                {/* SIDEBAR DE PROPIEDADES (Derecha) */}
                <div className="space-y-4">
                  {/* Propiedades principales (chips funcionales) */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Propiedades</h3>
                    <div className="space-y-3">
                      {/* Estado */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Estado</span>
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
                      </div>
                      
                      {/* Prioridad */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Prioridad</span>
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
                      </div>
                      
                      {/* Asignado */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Asignado</span>
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
                      </div>
                      
                      {/* Proyecto */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Proyecto</span>
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
                      </div>
                      
                      {/* Business Unit */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Business Unit</span>
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
                  </div>

                  {/* Fechas & SLA */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Fechas & SLA</h3>
                    <div className="space-y-3">
                      {/* Fecha inicio */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Fecha inicio</span>
                        <input 
                          type="date" 
                          value={localIssue.planned_start_at ? new Date(localIssue.planned_start_at).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : null
                            IssuesAPI.updateIssue(localIssue.id, { planned_start_at: newDate })
                            setLocalIssue({ ...localIssue, planned_start_at: newDate })
                          }}
                          className="px-2.5 py-1.5 text-[13px] border border-dashed border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-gray-700"
                        />
                      </div>
                      
                      {/* Fecha vencimiento */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Fecha vencimiento</span>
                        <input 
                          type="date" 
                          value={localIssue.due_at ? new Date(localIssue.due_at).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : null
                            IssuesAPI.updateIssue(localIssue.id, { due_at: newDate })
                            setLocalIssue({ ...localIssue, due_at: newDate })
                          }}
                          className="px-2.5 py-1.5 text-[13px] border border-dashed border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-gray-700"
                        />
                      </div>
                      
                      {/* SLA límite */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">SLA límite</span>
                        <input 
                          type="date" 
                          value={localIssue.sla_due_date ? new Date(localIssue.sla_due_date).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : null
                            IssuesAPI.updateIssue(localIssue.id, { sla_due_date: newDate })
                            setLocalIssue({ ...localIssue, sla_due_date: newDate })
                          }}
                          className="px-2.5 py-1.5 text-[13px] border border-dashed border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-gray-700"
                        />
                      </div>
                      
                      {/* Estado SLA (visual indicator) */}
                      {localIssue.sla_due_date && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[13px] text-gray-600">Estado SLA</span>
                          {(() => {
                            const now = new Date()
                            const slaDate = new Date(localIssue.sla_due_date)
                            const daysRemaining = Math.ceil((slaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                            
                            let statusColor = 'bg-green-50 border-green-200 text-green-700'
                            let statusText = 'En plazo'
                            let statusIcon = '✓'
                            
                            if (daysRemaining < 0) {
                              statusColor = 'bg-red-50 border-red-200 text-red-700'
                              statusText = 'Incumplido'
                              statusIcon = '✗'
                            } else if (daysRemaining <= 2) {
                              statusColor = 'bg-orange-50 border-orange-200 text-orange-700'
                              statusText = 'En riesgo'
                              statusIcon = '⚠'
                            }
                            
                            return (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium border border-dashed ${statusColor}`}>
                                <span>{statusIcon}</span>
                                <span>{statusText}</span>
                                {daysRemaining >= 0 && (
                                  <span className="text-[11px] opacity-75">({daysRemaining}d)</span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Origen e información */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Información</h3>
                    <div className="space-y-3">
                      {/* Origen */}
                      {localIssue.origin && (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-600">Origen</span>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium border border-dashed ${
                            localIssue.origin === 'api' || localIssue.origin === 'teams'
                              ? 'bg-purple-50 border-purple-300 text-purple-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700'
                          }`}>
                            {localIssue.origin === 'api' ? 'Teams' : localIssue.origin === 'teams' ? 'Teams' : localIssue.origin}
                          </div>
                        </div>
                      )}
                      
                      {/* Reporter */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Reportado por</span>
                        <span className="text-[13px] text-gray-700">{localIssue.reporter?.name || 'Desconocido'}</span>
                      </div>
                      
                      {/* Creado */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">Creado</span>
                        <span className="text-[13px] text-gray-700">
                          {localIssue.created_at ? new Date(localIssue.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Sin fecha'}
                        </span>
                      </div>
                      
                      {/* Actualizado */}
                      {localIssue.updated_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-600">Actualizado</span>
                          <span className="text-[13px] text-gray-700">
                            {new Date(localIssue.updated_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
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
