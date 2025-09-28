"use client"

import { useState } from "react"
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
  ZoomIn,
  ZoomOut,
  BarChart3,
} from "lucide-react"

interface Initiative {
  id: string
  title: string
  description: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  progress: number
  startDate: string
  endDate: string
  owner: string
  projects: string[]
  totalIssues: number
  completedIssues: number
  priority: "high" | "medium" | "low"
  budget?: string
  roi?: string
}

export default function RoadmapPage() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1 2025")
  const [viewMode, setViewMode] = useState<"cards" | "gantt">("gantt")
  const [zoom, setZoom] = useState(100)

  const initiatives: Initiative[] = [
    {
      id: "INIT-001",
      title: "Transformación Digital Completa",
      description:
        "Modernización de todos los sistemas internos y procesos digitales para mejorar la eficiencia operacional",
      status: "in-progress",
      progress: 65,
      startDate: "Ene 2025",
      endDate: "Jun 2025",
      owner: "CTO",
      projects: ["Tecnología", "Marketing", "Ventas"],
      totalIssues: 45,
      completedIssues: 29,
      priority: "high",
      budget: "€150K",
      roi: "+25%",
    },
    {
      id: "INIT-002",
      title: "Expansión de Mercado Internacional",
      description: "Estrategia de entrada a nuevos mercados europeos con adaptación de productos y servicios",
      status: "planning",
      progress: 15,
      startDate: "Mar 2025",
      endDate: "Dic 2025",
      owner: "CEO",
      projects: ["Marketing", "Ventas", "Recursos Humanos"],
      totalIssues: 32,
      completedIssues: 5,
      priority: "high",
      budget: "€200K",
      roi: "+40%",
    },
    {
      id: "INIT-003",
      title: "Optimización de Procesos Internos",
      description: "Automatización y mejora de workflows internos para reducir tiempos y costos operacionales",
      status: "in-progress",
      progress: 80,
      startDate: "Nov 2024",
      endDate: "Feb 2025",
      owner: "COO",
      projects: ["Recursos Humanos", "Finanzas", "Tecnología"],
      totalIssues: 28,
      completedIssues: 22,
      priority: "medium",
      budget: "€75K",
      roi: "+15%",
    },
    {
      id: "INIT-004",
      title: "Plataforma de Customer Success",
      description: "Desarrollo de herramientas y procesos para mejorar la experiencia y retención de clientes",
      status: "completed",
      progress: 100,
      startDate: "Sep 2024",
      endDate: "Dic 2024",
      owner: "VP Customer Success",
      projects: ["Tecnología", "Marketing"],
      totalIssues: 18,
      completedIssues: 18,
      priority: "medium",
      budget: "€90K",
      roi: "+30%",
    },
  ]

  const getStatusColor = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "planning":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "on-hold":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusLabel = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En progreso"
      case "planning":
        return "Planificación"
      case "on-hold":
        return "En pausa"
      default:
        return status
    }
  }

  const getStatusIcon = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "planning":
        return <Target className="h-4 w-4 text-orange-500" />
      case "on-hold":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: Initiative["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const quarters = ["Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]

  // Helper function to convert month strings to dates
  const convertToDate = (dateString: string, isEndDate = false) => {
    const monthMap: Record<string, number> = {
      'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
    }
    
    const parts = dateString.split(' ')
    const monthName = parts[0]
    const year = parseInt(parts[1])
    const month = monthMap[monthName]
    
    if (month === undefined) {
      console.warn(`Unknown month: ${monthName}`)
      return new Date()
    }
    
    // For start dates, use the 1st of the month
    // For end dates, use the last day of the month
    if (isEndDate) {
      return new Date(year, month + 1, 0) // Last day of the month
    } else {
      return new Date(year, month, 1) // First day of the month
    }
  }

  // Convert initiatives to Gantt format
  const ganttInitiatives: GanttInitiative[] = initiatives.map(initiative => ({
    id: initiative.id,
    title: initiative.title,
    description: initiative.description,
    status: initiative.status,
    progress: initiative.progress,
    startDate: convertToDate(initiative.startDate, false),
    endDate: convertToDate(initiative.endDate, true),
    owner: initiative.owner,
    projects: initiative.projects,
    priority: initiative.priority,
    budget: initiative.budget,
    roi: initiative.roi,
  }))

  // Group initiatives by status for Gantt
  const groupedInitiatives: Record<string, GanttInitiative[]> = ganttInitiatives.reduce<
    Record<string, GanttInitiative[]>
  >((groups, initiative) => {
    const statusName = getStatusLabel(initiative.status);
    return {
        ...groups,
        [statusName]: [...(groups[statusName] || []), initiative],
      };
    },
    {}
  );

  const sortedGroupedInitiatives = Object.fromEntries(
    Object.entries(groupedInitiatives).sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB)
    )
  );

  // Gantt event handlers
  const handleViewInitiative = (id: string) => {
    console.log(`Initiative selected: ${id}`)
    // TODO: Open initiative detail modal
  }

  const handleCopyLink = (id: string) => {
    console.log(`Copy link: ${id}`)
    // TODO: Copy initiative link to clipboard
  }

  const handleRemoveInitiative = (id: string) => {
    console.log(`Remove initiative: ${id}`)
    // TODO: Remove initiative from roadmap
  }

  const handleRemoveMarker = (id: string) => {
    console.log(`Remove marker: ${id}`)
    // TODO: Remove marker
  }

  const handleCreateMarker = (date: Date) => {
    console.log(`Create marker: ${date.toISOString()}`)
    // TODO: Create new marker
  }

  const handleMoveInitiative = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    
    console.log(`Move initiative: ${id} from ${startAt} to ${endAt}`)
    // TODO: Update initiative dates
  }

  const handleAddInitiative = (date: Date) => {
    console.log(`Add initiative: ${date.toISOString()}`)
    // TODO: Create new initiative
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
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          {viewMode === "gantt" ? (
            // Gantt View - Full height without metrics
            <Card className="h-full overflow-hidden">
                <GanttProvider onAddItem={handleAddInitiative} range="monthly" zoom={zoom}>
                  <GanttSidebar>
                    {Object.entries(sortedGroupedInitiatives).map(([group, initiatives]) => (
                      <GanttSidebarGroup key={group} name={group}>
                        {initiatives.map((initiative) => (
                          <GanttSidebarItem
                            key={initiative.id}
                            initiative={initiative}
                            onSelectItem={handleViewInitiative}
                          />
                        ))}
                      </GanttSidebarGroup>
                    ))}
                  </GanttSidebar>
                  <GanttTimeline>
                    <GanttHeader />
                    <GanttInitiativeList>
                      {Object.entries(sortedGroupedInitiatives).map(([group, initiatives]) => (
                        <GanttInitiativeListGroup key={group}>
                          {initiatives.map((initiative) => (
                            <div className="flex" key={initiative.id}>
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => handleViewInitiative(initiative.id)}
                                    className="w-full"
                                  >
                                    <GanttInitiativeItem
                                      onMove={handleMoveInitiative}
                                      {...initiative}
                                    />
                                  </button>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                  <ContextMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => handleViewInitiative(initiative.id)}
                                  >
                                    <EyeIcon size={16} className="text-muted-foreground" />
                                    Ver iniciativa
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => handleCopyLink(initiative.id)}
                                  >
                                    <LinkIcon size={16} className="text-muted-foreground" />
                                    Copiar enlace
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    className="flex items-center gap-2 text-destructive"
                                    onClick={() => handleRemoveInitiative(initiative.id)}
                                  >
                                    <TrashIcon size={16} />
                                    Eliminar del roadmap
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            </div>
                          ))}
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
              <div className="space-y-4">
                {initiatives.map((initiative) => (
                  <Card key={initiative.id} className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {getStatusIcon(initiative.status)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{initiative.title}</h3>
                              <Badge className={`${getStatusColor(initiative.status)} border`}>
                                {getStatusLabel(initiative.status)}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(initiative.priority)}>
                                {initiative.priority === "high"
                                  ? "Alta"
                                  : initiative.priority === "medium"
                                    ? "Media"
                                    : "Baja"}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3 text-pretty">{initiative.description}</p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {initiative.startDate} - {initiative.endDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{initiative.owner}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                <span>
                                  {initiative.completedIssues}/{initiative.totalIssues} tickets
                                </span>
                              </div>
                              {initiative.budget && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>
                                    {initiative.budget} • ROI {initiative.roi}
                                  </span>
                                </div>
                              )}
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
                          <span className="font-medium">{initiative.progress}%</span>
                        </div>
                        <Progress value={initiative.progress} className="h-2" />
                      </div>

                      {/* Projects */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Departamentos:</span>
                        <div className="flex items-center gap-2">
                          {initiative.projects.map((project, index) => (
                            <Badge key={project} variant="secondary" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
