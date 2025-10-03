"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttTimeline,
  GanttHeader,
  GanttInitiativeList,
  GanttInitiativeListGroup,
  GanttInitiativeItem,
  GanttMarker,
  GanttToday,
  type GanttInitiative,
} from '@/components/ui/gantt'
import {
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { ProjectsAPI, type ProjectWithRelations } from "@/lib/api/projects"
import { IssuesAPI, type IssueWithRelations } from "@/lib/api/issues"


export default function RoadmapPage() {
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
      itemType: "project" as const,
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
      itemType: "issue" as const,
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Roadmap</h1>
            <p className="text-gray-600 text-sm mt-1">
              Iniciativas estratégicas y proyectos transversales
            </p>
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
          ) : (
            // Gantt View - Visual only (no editing)
            <Card className="h-full overflow-hidden">
                <GanttProvider 
                  range="monthly" 
                  zoom={120}
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
                                  className="pointer-events-none h-2 w-2 shrink-0 rounded-full bg-purple-500"
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
                                  className="relative flex items-center gap-2.5 p-2.5 pl-8 text-xs hover:bg-accent/50"
                                  style={{ height: 'var(--gantt-row-height)' }}
                                >
                                  <div className="pointer-events-none h-2 w-2 shrink-0 rounded-full bg-slate-400" />
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
                                  <button
                                    type="button"
                                    onClick={() => toggleProjectExpansion(project.id)}
                                    className="w-full"
                                  >
                                    <GanttInitiativeItem
                                      {...projectGanttItem}
                                    />
                                  </button>
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
                                      <div className="w-full relative" style={{ height: '100%' }}>
                                        <GanttInitiativeItem
                                          {...issueGanttItem}
                                        />
                                      </div>
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
                      />
                    ))}
                    <GanttToday />
                  </GanttTimeline>
                </GanttProvider>
              </Card>
          )}
        </div>
      </div>
    </div>
  )
}
