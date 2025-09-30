"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttInitiativeList,
  GanttInitiativeListGroup,
  GanttInitiativeItem,
  GanttMarker,
  GanttToday,
  GanttCreateMarkerTrigger,
  type GanttInitiative,
} from '@/components/ui/gantt'
import {
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  EyeIcon,
  LinkIcon,
  TrashIcon,
  BarChart3,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { ProjectsAPI, type ProjectWithRelations } from "@/lib/api/projects"
import { IssuesAPI, type IssueWithRelations } from "@/lib/api/issues"
import { InitiativesAPI } from "@/lib/api/initiatives"

// Types for expanded projects and issues
interface ProjectItem {
  type: 'project'
  project: ProjectWithRelations
  expanded: boolean
}

interface IssueItem {
  type: 'issue'
  issue: IssueWithRelations
  projectId: string
}

type RoadmapItem = ProjectItem | IssueItem

type ZoomLevel = 'week' | 'month' | 'quarter' | 'year'

export default function RoadmapPage() {
  const [viewMode, setViewMode] = useState<"cards" | "gantt">("gantt")
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month')
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [issues, setIssues] = useState<IssueWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [projectsData, issuesData] = await Promise.all([
          ProjectsAPI.getProjects(),
          IssuesAPI.getIssues()
        ])
        setProjects(projectsData)
        setIssues(issuesData)
      } catch (error) {
        console.error('Error loading roadmap data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  // Convert ZoomLevel to Gantt range and zoom percentage
  const getGanttConfig = (level: ZoomLevel): { range: 'daily' | 'monthly' | 'quarterly', zoom: number } => {
    switch (level) {
      case 'week':
        // Week view: show days with detailed zoom
        return { range: 'daily', zoom: 200 }
      case 'month':
        // Month view: show months with medium zoom
        return { range: 'monthly', zoom: 120 }
      case 'quarter':
        // Quarter view: show months with less zoom to see more context
        return { range: 'monthly', zoom: 70 }
      case 'year':
        // Year view: show quarters
        return { range: 'quarterly', zoom: 100 }
    }
  }

  const getZoomLabel = (level: ZoomLevel): string => {
    switch (level) {
      case 'week':
        return 'Semana'
      case 'month':
        return 'Mes'
      case 'quarter':
        return 'Trimestre'
      case 'year':
        return 'Año'
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "done":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "planned":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "paused":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "done":
        return "Completado"
      case "active":
        return "Activo"
      case "planned":
        return "Planificado"
      case "paused":
        return "Pausado"
      default:
        return status || "Sin estado"
    }
  }

  const getIssueStateLabel = (state: string | null) => {
    switch (state) {
      case "todo":
        return "Por hacer"
      case "in_progress":
        return "En progreso"
      case "done":
        return "Completado"
      case "blocked":
        return "Bloqueado"
      case "waiting_info":
        return "Esperando info"
      case "canceled":
        return "Cancelado"
      default:
        return state || "Sin estado"
    }
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "P0":
      case "P1":
        return "text-red-500"
      case "P2":
        return "text-orange-500"
      case "P3":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  // Helper function to convert ISO date strings to Date objects
  const convertToDate = (dateString: string | null): Date => {
    if (!dateString) return new Date()
    return new Date(dateString)
  }

  // Get issues for a specific project
  const getProjectIssues = (projectId: string): IssueWithRelations[] => {
    return issues.filter(issue => issue.project_id === projectId)
  }

  // Convert project to Gantt format
  const projectToGanttItem = (project: ProjectWithRelations): GanttInitiative => {
    const projectIssues = getProjectIssues(project.id)
    const completedIssues = projectIssues.filter(i => i.state === 'done').length
    const progress = project._progress?.manual || project._progress?.calculated || 0

    return {
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: project.status === 'done' ? 'completed' : project.status === 'active' ? 'in-progress' : project.status === 'paused' ? 'on-hold' : 'planning',
      progress,
      startDate: convertToDate(project.planned_start_at),
      endDate: convertToDate(project.planned_end_at),
      owner: project.owner?.name || 'Sin asignar',
      projects: project.initiative?.name ? [project.initiative.name] : [],
      priority: "medium",
    }
  }

  // Convert issue to Gantt format
  const issueToGanttItem = (issue: IssueWithRelations): GanttInitiative => {
    const progress = issue.state === 'done' ? 100 : issue.state === 'in_progress' ? 50 : 0
    
    // Use planned_start_at if available, otherwise fall back to created_at or due_at - 14 days
    const startDate = convertToDate(issue.planned_start_at) || 
                     (issue.due_at ? new Date(convertToDate(issue.due_at).getTime() - 14 * 24 * 60 * 60 * 1000) : convertToDate(issue.created_at))
    
    // Use due_at if available, otherwise default to 14 days after start
    const endDate = convertToDate(issue.due_at) || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description || '',
      status: issue.state === 'done' ? 'completed' : issue.state === 'in_progress' ? 'in-progress' : 'planning',
      progress,
      startDate,
      endDate,
      owner: issue.assignee?.name || 'Sin asignar',
      projects: [],
      priority: issue.priority === 'P0' || issue.priority === 'P1' ? 'high' : issue.priority === 'P2' ? 'medium' : 'low',
    }
  }

  // Group projects by BU (Initiative)
  const groupedByBU = projects.reduce<Record<string, ProjectWithRelations[]>>((acc, project) => {
    const buName = project.initiative?.name || 'Sin BU'
    if (!acc[buName]) {
      acc[buName] = []
    }
    acc[buName].push(project)
    return acc
  }, {})

  // Sort BUs alphabetically
  const sortedGroupedByBU = Object.fromEntries(
    Object.entries(groupedByBU).sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB)
    )
  )

  // Gantt event handlers
  const handleViewProject = (id: string) => {
    // Check if it's a project or issue
    const project = projects.find(p => p.id === id)
    if (project) {
      // Toggle project expansion
      toggleProjectExpansion(id)
    } else {
      // It's an issue, open issue detail
      console.log(`Issue selected: ${id}`)
      // TODO: Open issue detail modal
    }
  }

  const handleCopyLink = (id: string) => {
    console.log(`Copy link: ${id}`)
    // TODO: Copy project/issue link to clipboard
  }

  const handleRemoveItem = (id: string) => {
    console.log(`Remove item: ${id}`)
    // TODO: Remove project/issue from roadmap
  }

  const handleRemoveMarker = (id: string) => {
    console.log(`Remove marker: ${id}`)
    // TODO: Remove marker
  }

  const handleCreateMarker = (date: Date) => {
    console.log(`Create marker: ${date.toISOString()}`)
    // TODO: Create new marker
  }

  const handleMoveItem = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    
    console.log(`Move item: ${id} from ${startAt} to ${endAt}`)
    // TODO: Update project/issue dates
  }

  const handleAddProject = (date: Date) => {
    console.log(`Add project: ${date.toISOString()}`)
    // TODO: Create new project
  }

  // Sample markers for the Gantt
  const exampleMarkers = [
    {
      id: '1',
      date: new Date(2025, 2, 1), // March 1, 2025
      label: 'Q1 Review',
      className: 'bg-blue-100 text-blue-900',
    },
    {
      id: '2',
      date: new Date(2025, 5, 1), // June 1, 2025
      label: 'Mid-Year Review',
      className: 'bg-green-100 text-green-900',
    },
  ]

  return (
    <div className="h-screen w-screen bg-background grid overflow-hidden transition-all duration-200 grid-cols-[256px_1px_1fr]">
      {/* Sidebar */}
      <div className="bg-white border-r border-gray-200 h-full overflow-hidden">
        <Sidebar />
      </div>

      {/* Separator */}
      <div className="bg-gray-200 w-px" />

      {/* Main Content */}
      <div className="bg-white h-full flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="px-6 py-6 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Roadmap</h1>
              <p className="text-gray-600 text-sm mt-1">
                Iniciativas estratégicas y proyectos transversales
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={viewMode === "gantt" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setViewMode("gantt")}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Gantt
                </Button>
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setViewMode("cards")}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Tarjetas
                </Button>
              </div>
              
              {/* Zoom Controls (only show in Gantt mode) */}
              {viewMode === "gantt" && (
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={zoomLevel === 'week' ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setZoomLevel('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={zoomLevel === 'month' ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setZoomLevel('month')}
                  >
                    Mes
                  </Button>
                  <Button
                    variant={zoomLevel === 'quarter' ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setZoomLevel('quarter')}
                  >
                    Trimestre
                  </Button>
                  <Button
                    variant={zoomLevel === 'year' ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setZoomLevel('year')}
                  >
                    Año
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando roadmap...</p>
              </div>
            </Card>
          ) : viewMode === "gantt" ? (
            // Gantt View - Full height without metrics
            <Card className="h-full overflow-hidden">
                <GanttProvider 
                  onAddItem={handleAddProject} 
                  range={getGanttConfig(zoomLevel).range} 
                  zoom={getGanttConfig(zoomLevel).zoom}
                >
                  <GanttSidebar>
                    {Object.entries(sortedGroupedByBU).map(([buName, buProjects]) => (
                      <GanttSidebarGroup key={buName} name={buName}>
                        {buProjects.map((project) => {
                          const isExpanded = expandedProjects.has(project.id)
                          const projectIssues = getProjectIssues(project.id)
                          
                          return (
                            <div key={project.id}>
                              {/* Project Row */}
                              <div 
                                className="relative flex items-center gap-2.5 p-2.5 text-xs hover:bg-accent/50 cursor-pointer"
                                style={{ height: 'var(--gantt-row-height)' }}
                                onClick={() => toggleProjectExpansion(project.id)}
                              >
                                {projectIssues.length > 0 && (
                                  isExpanded ? 
                                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> :
                                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                )}
                                {projectIssues.length === 0 && <div className="w-3" />}
                                <div
                                  className="pointer-events-none h-2 w-2 shrink-0 rounded-full bg-blue-500"
                                />
                                <p className="pointer-events-none flex-1 truncate text-left font-medium">
                                  {project.name}
                                </p>
                                <p className="pointer-events-none text-muted-foreground text-xs">
                                  {projectIssues.length} issues
                                </p>
                              </div>
                              
                              {/* Issue Rows (if expanded) */}
                              {isExpanded && projectIssues.map((issue) => (
                                <div 
                                  key={issue.id}
                                  className="relative flex items-center gap-2.5 p-2.5 pl-8 text-xs hover:bg-accent/50 cursor-pointer"
                                  style={{ height: 'var(--gantt-row-height)' }}
                                  onClick={() => handleViewProject(issue.id)}
                                >
                                  <div className="pointer-events-none h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                                  <p className="pointer-events-none flex-1 truncate text-left">
                                    {issue.title}
                                  </p>
                                  <p className="pointer-events-none text-muted-foreground text-xs">
                                    {issue.state === 'done' ? '✓ Completado' : issue.state === 'in_progress' ? 'En progreso' : 'Por hacer'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </GanttSidebarGroup>
                    ))}
                  </GanttSidebar>
                  <GanttTimeline>
                    <GanttHeader />
                    <GanttInitiativeList>
                      {Object.entries(sortedGroupedByBU).map(([buName, buProjects]) => (
                        <GanttInitiativeListGroup key={buName}>
                          {buProjects.map((project) => {
                            const isExpanded = expandedProjects.has(project.id)
                            const projectIssues = getProjectIssues(project.id)
                            const projectGanttItem = projectToGanttItem(project)
                            
                            return (
                              <div key={project.id}>
                                {/* Project Bar */}
                                <div className="flex">
                                  <ContextMenu>
                                    <ContextMenuTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => toggleProjectExpansion(project.id)}
                                        className="w-full"
                                      >
                                        <GanttInitiativeItem
                                          onMove={handleMoveItem}
                                          {...projectGanttItem}
                                        />
                                      </button>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                      <ContextMenuItem
                                        className="flex items-center gap-2"
                                        onClick={() => handleViewProject(project.id)}
                                      >
                                        <EyeIcon size={16} className="text-muted-foreground" />
                                        Ver proyecto
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        className="flex items-center gap-2"
                                        onClick={() => handleCopyLink(project.id)}
                                      >
                                        <LinkIcon size={16} className="text-muted-foreground" />
                                        Copiar enlace
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        className="flex items-center gap-2 text-destructive"
                                        onClick={() => handleRemoveItem(project.id)}
                                      >
                                        <TrashIcon size={16} />
                                        Eliminar del roadmap
                                      </ContextMenuItem>
                                    </ContextMenuContent>
                                  </ContextMenu>
                                </div>
                                
                                {/* Issue Bars (if expanded) - Each in its own row */}
                                {isExpanded && projectIssues.map((issue) => {
                                  const issueGanttItem = issueToGanttItem(issue)
                                  
                                  return (
                                    <div 
                                      className="flex" 
                                      key={issue.id}
                                      style={{ 
                                        height: 'var(--gantt-row-height)',
                                        minHeight: 'var(--gantt-row-height)'
                                      }}
                                    >
                                      <ContextMenu>
                                        <ContextMenuTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => handleViewProject(issue.id)}
                                            className="w-full relative"
                                            style={{ height: '100%' }}
                                          >
                                            <GanttInitiativeItem
                                              onMove={handleMoveItem}
                                              {...issueGanttItem}
                                            />
                                          </button>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                          <ContextMenuItem
                                            className="flex items-center gap-2"
                                            onClick={() => handleViewProject(issue.id)}
                                          >
                                            <EyeIcon size={16} className="text-muted-foreground" />
                                            Ver issue
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="flex items-center gap-2"
                                            onClick={() => handleCopyLink(issue.id)}
                                          >
                                            <LinkIcon size={16} className="text-muted-foreground" />
                                            Copiar enlace
                                          </ContextMenuItem>
                                        </ContextMenuContent>
                                      </ContextMenu>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </GanttInitiativeListGroup>
                      ))}
                    </GanttInitiativeList>
                    {exampleMarkers.map((marker) => (
                      <GanttMarker
                        key={marker.id}
                        {...marker}
                        onRemove={handleRemoveMarker}
                      />
                    ))}
                    <GanttToday />
                    <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
                  </GanttTimeline>
                </GanttProvider>
              </Card>
          ) : (
            // Cards View - Simple list without metrics
            <div className="h-full overflow-y-auto">
              <div className="space-y-6">
                {Object.entries(sortedGroupedByBU).map(([buName, buProjects]) => (
                  <div key={buName}>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">{buName}</h3>
                    <div className="space-y-4">
                      {buProjects.map((project) => {
                        const projectIssues = getProjectIssues(project.id)
                        const completedIssues = projectIssues.filter(i => i.state === 'done').length
                        const progress = project._progress?.manual || project._progress?.calculated || 0
                        
                        return (
                          <Card key={project.id} className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <Target className="h-5 w-5 text-blue-500 mt-1" />

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                                      <Badge className={`${getStatusColor(project.status)} border`}>
                                        {getStatusLabel(project.status)}
                                      </Badge>
                                    </div>

                                    {project.description && (
                                      <p className="text-muted-foreground mb-3 text-pretty">{project.description}</p>
                                    )}

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                          {project.planned_start_at ? new Date(project.planned_start_at).toLocaleDateString() : 'Sin fecha'} - {project.planned_end_at ? new Date(project.planned_end_at).toLocaleDateString() : 'Sin fecha'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{project.owner?.name || 'Sin asignar'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        <span>
                                          {completedIssues}/{projectIssues.length} issues completados
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Progress */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progreso</span>
                                  <span className="font-medium">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              {/* BU */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Business Unit:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {project.initiative?.name || 'Sin BU'}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
