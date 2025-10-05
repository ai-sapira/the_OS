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
        // Gonvarri organization ID
        const organizationId = '01234567-8901-2345-6789-012345678901'
        const [projectsData, issuesData] = await Promise.all([
          ProjectsAPI.getProjects(),
          IssuesAPI.getIssues(organizationId)
        ])
        
        console.log('[Roadmap] Loaded projects:', projectsData.length)
        console.log('[Roadmap] Loaded issues:', issuesData.length)
        console.log('[Roadmap] Sample issue dates:', issuesData.slice(0, 5).map(i => ({
          key: i.key,
          title: i.title,
          planned_start_at: i.planned_start_at,
          sla_due_date: i.sla_due_date,
          state: i.state
        })))
        
        // Check if dates are actually set
        const issuesWithDates = issuesData.filter(i => i.planned_start_at && i.sla_due_date)
        console.log(`[Roadmap] Issues with dates: ${issuesWithDates.length}/${issuesData.length}`)
        
        if (issuesWithDates.length === 0) {
          console.warn('[Roadmap] ⚠️ NO ISSUES HAVE DATES SET! Check database update.')
        }
        
        // Log project date calculations
        console.log('[Roadmap] Projects will calculate dates from their issues automatically')
        
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
  const convertToDate = (dateString: string | null): Date | null => {
    if (!dateString) return null
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

    // Calculate project dates based on its issues
    // Project should span from earliest issue start to latest issue end
    let startDate: Date
    let endDate: Date
    
    if (projectIssues.length > 0) {
      // Get all issue dates
      const issueDates = projectIssues
        .map(issue => ({
          start: convertToDate(issue.planned_start_at),
          end: convertToDate(issue.sla_due_date)
        }))
        .filter(d => d.start && d.end) as { start: Date; end: Date }[]
      
      if (issueDates.length > 0) {
        // Find earliest start and latest end
        const earliestStart = new Date(Math.min(...issueDates.map(d => d.start.getTime())))
        const latestEnd = new Date(Math.max(...issueDates.map(d => d.end.getTime())))
        
        startDate = earliestStart
        endDate = latestEnd
      } else {
        // Fallback if no issues have dates
        startDate = convertToDate(project.planned_start_at) || new Date(2026, 0, 1)
        endDate = convertToDate(project.planned_end_at) || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
      }
    } else {
      // No issues, use project dates or defaults
      startDate = convertToDate(project.planned_start_at) || new Date(2026, 0, 1)
      endDate = convertToDate(project.planned_end_at) || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    }

    return {
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: project.status === 'done' ? 'completed' : project.status === 'active' ? 'in-progress' : project.status === 'paused' ? 'on-hold' : 'planning',
      progress,
      startDate,
      endDate,
      owner: project.owner?.name || 'Sin asignar',
      projects: project.initiative?.name ? [project.initiative.name] : [],
      priority: "medium",
      itemType: "project" as const,
    }
  }

  // Convert issue to Gantt format
  const issueToGanttItem = (issue: IssueWithRelations): GanttInitiative => {
    const progress = issue.state === 'done' ? 100 : issue.state === 'in_progress' ? 50 : 0
    
    // Use planned_start_at if available
    let startDate = convertToDate(issue.planned_start_at)
    let endDate = convertToDate(issue.sla_due_date)
    
    // If we have end date but no start, calculate start as end - duration (or default offset)
    if (!startDate && endDate) {
      startDate = new Date(endDate.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days before end
    }
    
    // If we have start but no end, calculate end as start + duration
    if (startDate && !endDate) {
      endDate = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days after start
    }
    
    // If neither, use default dates in 2026
    if (!startDate) {
      startDate = new Date(2026, 0, 1) // Jan 1, 2026
    }
    if (!endDate) {
      endDate = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000)
    }
    
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
