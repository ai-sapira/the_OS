"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  SearchIcon,
  ListFilter,
  ArrowUp,
  ArrowDown,
  Folder,
  FileText,
  Download,
  Target,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// API imports
import { InitiativesAPI } from "@/lib/api/initiatives"
import { ProjectsAPI } from "@/lib/api/projects"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"

type ViewType = "business_units" | "projects" | "issues"

// Unified metric type for all levels
type UnifiedMetric = {
  id: string
  name: string
  roi: number // % ROI
  hoursSaved: number // Total hours saved
  moneySaved: number // Total money saved ($)
  activeUsers: number // Number of active users
  activeIssues: number // Number of active issues
}

// Filters Bar Component
function MetricsFiltersBar({
  currentView,
  onViewChange
}: {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<string | null>(null)
  const [commandInput, setCommandInput] = useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState<any[]>([])

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(event.target.value)
  }

  const viewOptions = [
    { value: "business_units", label: "Business Units", icon: <Target className="h-4 w-4" /> },
    { value: "projects", label: "Projects", icon: <Folder className="h-4 w-4" /> },
    { value: "issues", label: "Issues", icon: <FileText className="h-4 w-4" /> },
  ]

  const filterOptions = [
    {
      name: "Activity",
      icon: <ArrowUp className="w-2.5 h-2.5 text-gray-600" />,
      options: [
        { name: "High (90+)", icon: <ArrowUp className="w-2.5 h-2.5 text-green-600" /> },
        { name: "Medium (70-90)", icon: <ArrowUp className="w-2.5 h-2.5 text-blue-600" /> },
        { name: "Low (<70)", icon: <ArrowDown className="w-2.5 h-2.5 text-yellow-600" /> },
      ]
    }
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* View Selector */}
        <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
          {viewOptions.map((view) => (
            <Button
              key={view.value}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(view.value as ViewType)}
              className={`h-6 px-3 text-xs gap-1.5 ${
                currentView === view.value
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {view.icon}
              {view.label}
            </Button>
          ))}
      </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search metrics..."
            value={globalFilter ?? ""}
            onChange={handleGlobalFilterChange}
            className="pl-9 h-7 max-w-sm bg-gray-50 border-gray-200 rounded-lg border-dashed focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:outline-none text-gray-900 placeholder-gray-500 shadow-none hover:bg-gray-100 transition-colors text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
        </div>

        {/* Active Filters */}
        <div className="flex gap-2">
          {filters
            .filter((filter) => filter.value?.length > 0)
            .map((filter, index) => {
              const filterType = filterOptions.find(opt => opt.name === filter.type)
              const filterValue = filter.value[0]
              const matchingOption = filterType?.options.find(option => option.name === filterValue)

              return (
                <div key={index} className="flex items-center text-xs h-7 rounded-lg overflow-hidden border-dashed border border-gray-200 bg-gray-50">
                  <div className="flex gap-1.5 shrink-0 hover:bg-gray-100 px-3 h-full items-center transition-colors">
                    {filterType?.icon}
                    <span className="text-gray-600 font-medium text-xs">{filter.type}</span>
                  </div>
                  <div className="hover:bg-gray-100 px-2 h-full flex items-center text-gray-600 transition-colors shrink-0 text-xs border-l border-gray-200">
                    is
                  </div>
                  <div className="hover:bg-gray-100 px-3 h-full flex items-center text-gray-600 transition-colors shrink-0 border-l border-gray-200">
                    <div className="flex gap-1.5 items-center">
                      {matchingOption?.icon}
                      <span className="text-gray-600 text-xs">{filterValue}</span>
                </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFilters((prev) => prev.filter((_, i) => i !== index))
                    }}
                    className="hover:bg-gray-100 h-full w-8 text-gray-500 hover:text-gray-700 transition-colors shrink-0 border-l border-gray-200"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              )
            })}
        </div>

        {/* Clear Filters Button */}
        {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition flex gap-1.5 items-center rounded-lg px-3 text-xs"
            onClick={() => setFilters([])}
          >
            Clear
          </Button>
        )}

        {/* Filter Dropdown */}
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open)
            if (!open) {
              setTimeout(() => {
                setSelectedView(null)
                setCommandInput("")
              }, 200)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              size="sm"
              className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
            >
              <ListFilter className="h-3 w-3 shrink-0 transition-all text-gray-500" />
              <span className="text-xs">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-1 rounded-2xl border-gray-200 shadow-lg"
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgb(229 229 229)',
              backgroundColor: '#ffffff',
            }}
          >
            <Command>
              <CommandInput
                placeholder={selectedView ? selectedView : "Search..."}
                className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value)
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
                  No filters found.
                </CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterOptions.find(opt => opt.name === selectedView)?.options.map((option) => (
                      <CommandItem
                        className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          setFilters(prev => [...prev, { type: selectedView, value: [option.name] }])
                          setTimeout(() => {
                            setSelectedView(null)
                            setCommandInput("")
                          }, 200)
                          setOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                            {option.icon}
                          </div>
                          <span className="text-black font-normal text-[14px] flex-1">
                            {option.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandGroup>
                    {filterOptions.map((option) => (
                      <CommandItem
                        className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          setSelectedView(option.name)
                          setCommandInput("")
                          commandInputRef.current?.focus()
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                            {option.icon}
                          </div>
                          <span className="text-black font-normal text-[14px] flex-1">
                            {option.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
          </div>

      {/* Export Button */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-7 bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 border-dashed px-3 text-xs rounded-lg">
          <Download className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
          Export
        </Button>
      </div>
              </div>
  )
}

// Hourly rate for money calculation (configurable)
const HOURLY_RATE = 75 // USD per hour

// Generate dummy metrics based on a seed (for consistent randomization)
const generateDummyMetrics = (seed: string, baseMultiplier: number = 1) => {
  // Simple hash function for consistent random values based on seed
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const roi = 50 + (hash % 250) // 50-300%
  const hoursSaved = Math.round((100 + (hash % 400)) * baseMultiplier) // 100-500 hours base
  const moneySaved = hoursSaved * HOURLY_RATE
  const activeUsers = 3 + (hash % 15) // 3-18 users
  const activeIssues = 5 + (hash % 25) // 5-30 issues
  
  return { roi, hoursSaved, moneySaved, activeUsers, activeIssues }
}

// Helper function to get ROI color
const getROIColor = (roi: number) => {
  if (roi >= 200) return "bg-green-100 text-green-800"
  if (roi >= 100) return "bg-blue-100 text-blue-800"
  if (roi >= 50) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return `$${amount.toFixed(0)}`
}

// Helper to format hours
const formatHours = (hours: number) => {
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}K`
  }
  return hours.toFixed(0)
}

// Business Units Metrics List - Aggregates all Projects metrics
function BusinessUnitsMetrics() {
  const { currentOrg } = useAuth()
  const [data, setData] = useState<UnifiedMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const organizationId = currentOrg.organization.id
        
        // Get all initiatives (BUs)
        const initiatives = await InitiativesAPI.getInitiatives(organizationId)
        
        // Get all projects with their initiative_id
        const projects = await ProjectsAPI.getProjects(organizationId)
        
        // Get all issues with estimated_hours
        const { data: issues, error: issuesError } = await supabase
          .from('issues')
          .select('id, state, estimated_hours, project_id, initiative_id, assignee_id, reporter_id')
          .eq('organization_id', organizationId)
        
        if (issuesError) throw issuesError
        
        // Calculate metrics for each BU (aggregating from all its projects)
        const metrics: UnifiedMetric[] = initiatives.map(bu => {
          // Get all projects belonging to this BU
          const buProjects = projects.filter(p => p.initiative_id === bu.id)
          const projectIds = buProjects.map(p => p.id)
          
          // Get all issues belonging to this BU (directly or through projects)
          const buIssues = (issues || []).filter(issue => 
            issue.initiative_id === bu.id || projectIds.includes(issue.project_id || '')
          )
          
          // Active states
          const activeStates = ['todo', 'in_progress', 'blocked', 'waiting_info']
          const completedStates = ['done']
          
          const realActiveIssues = buIssues.filter(issue => activeStates.includes(issue.state || '')).length
          const completedIssues = buIssues.filter(issue => completedStates.includes(issue.state || ''))
          
          // Calculate hours saved from completed issues
          const realHoursSaved = completedIssues.reduce((acc, issue) => acc + (issue.estimated_hours || 0), 0)
          
          // Active users: unique assignees and reporters
          const userIds = new Set<string>()
          buIssues.forEach(issue => {
            if (issue.assignee_id) userIds.add(issue.assignee_id)
            if (issue.reporter_id) userIds.add(issue.reporter_id)
          })
          const realActiveUsers = userIds.size
          
          // Use dummy data if real data is too low (BU level = highest multiplier)
          const dummy = generateDummyMetrics(bu.id, 3)
          const hoursSaved = realHoursSaved > 0 ? realHoursSaved : dummy.hoursSaved
          const moneySaved = hoursSaved * HOURLY_RATE
          const activeIssues = realActiveIssues > 0 ? realActiveIssues : dummy.activeIssues
          const activeUsers = realActiveUsers > 0 ? realActiveUsers : dummy.activeUsers
          
          // ROI calculation
          const totalHoursWorked = buIssues.reduce((acc, issue) => acc + (issue.estimated_hours || 0), 0)
          const investment = totalHoursWorked * HOURLY_RATE * 0.3
          const realRoi = investment > 0 ? Math.round((moneySaved / investment) * 100) : 0
          const roi = realRoi > 0 ? realRoi : dummy.roi
          
          return {
            id: bu.id,
            name: bu.name,
            roi: Math.min(999, roi),
            hoursSaved,
            moneySaved,
            activeUsers,
            activeIssues
          }
        })
        
        setData(metrics)
      } catch (error) {
        console.error('Error loading BU metrics:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentOrg?.organization?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading metrics...</div>
      </div>
    )
  }

  return (
    <div>
      {data.map((metric) => (
        <div
          key={metric.id}
          className="py-3 hover:bg-gray-50/50 transition-colors"
        >
          <div className="grid grid-cols-[1fr_100px_120px_130px_110px_110px] gap-4 items-center">
            {/* Name Column */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{metric.name}</div>
              </div>
            </div>

            {/* ROI */}
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className={getROIColor(metric.roi)}
              >
                {metric.roi}%
              </Badge>
            </div>

            {/* Hours Saved */}
            <div className="text-sm">
              <span className="font-medium text-emerald-600">{formatHours(metric.hoursSaved)}</span>
              <span className="text-gray-500 ml-1 text-xs">hrs</span>
            </div>

            {/* Money Saved */}
            <div className="text-sm">
              <span className="font-semibold text-green-600">{formatCurrency(metric.moneySaved)}</span>
            </div>

            {/* Active Users */}
            <div className="text-sm">
              <span className="font-medium text-blue-600">{metric.activeUsers}</span>
              <span className="text-gray-500 ml-1 text-xs">users</span>
            </div>

            {/* Active Issues */}
            <div className="text-sm">
              <span className="font-medium text-orange-600">{metric.activeIssues}</span>
              <span className="text-gray-500 ml-1 text-xs">issues</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Projects Metrics List - Aggregates all Initiatives metrics within each project
function ProjectsMetrics() {
  const { currentOrg } = useAuth()
  const [data, setData] = useState<UnifiedMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const organizationId = currentOrg.organization.id
        
        // Get all projects
        const projects = await ProjectsAPI.getProjects(organizationId)
        
        // Get all issues with estimated_hours
        const { data: issues, error: issuesError } = await supabase
          .from('issues')
          .select('id, state, estimated_hours, project_id, assignee_id, reporter_id')
          .eq('organization_id', organizationId)
        
        if (issuesError) throw issuesError
        
        // Calculate metrics for each project (aggregating from all its issues)
        const metrics: UnifiedMetric[] = projects.map(proj => {
          // Get all issues belonging to this project
          const projectIssues = (issues || []).filter(issue => issue.project_id === proj.id)
          
          // Active states
          const activeStates = ['todo', 'in_progress', 'blocked', 'waiting_info']
          const completedStates = ['done']
          
          const realActiveIssues = projectIssues.filter(issue => activeStates.includes(issue.state || '')).length
          const completedIssues = projectIssues.filter(issue => completedStates.includes(issue.state || ''))
          
          // Calculate hours saved from completed issues
          const realHoursSaved = completedIssues.reduce((acc, issue) => acc + (issue.estimated_hours || 0), 0)
          
          // Active users: unique assignees and reporters
          const userIds = new Set<string>()
          projectIssues.forEach(issue => {
            if (issue.assignee_id) userIds.add(issue.assignee_id)
            if (issue.reporter_id) userIds.add(issue.reporter_id)
          })
          const realActiveUsers = userIds.size
          
          // Use dummy data if real data is too low (Project level = medium multiplier)
          const dummy = generateDummyMetrics(proj.id, 2)
          const hoursSaved = realHoursSaved > 0 ? realHoursSaved : dummy.hoursSaved
          const moneySaved = hoursSaved * HOURLY_RATE
          const activeIssues = realActiveIssues > 0 ? realActiveIssues : dummy.activeIssues
          const activeUsers = realActiveUsers > 0 ? realActiveUsers : dummy.activeUsers
          
          // ROI calculation
          const totalHoursWorked = projectIssues.reduce((acc, issue) => acc + (issue.estimated_hours || 0), 0)
          const investment = totalHoursWorked * HOURLY_RATE * 0.3
          const realRoi = investment > 0 ? Math.round((moneySaved / investment) * 100) : 0
          const roi = realRoi > 0 ? realRoi : dummy.roi
          
          return {
            id: proj.id,
            name: proj.name,
            roi: Math.min(999, roi),
            hoursSaved,
            moneySaved,
            activeUsers,
            activeIssues
          }
        })
        
        setData(metrics)
      } catch (error) {
        console.error('Error loading project metrics:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentOrg?.organization?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading metrics...</div>
      </div>
    )
  }

  return (
    <div>
      {data.map((metric) => (
        <div
          key={metric.id}
          className="py-3 hover:bg-gray-50/50 transition-colors"
        >
          <div className="grid grid-cols-[1fr_100px_120px_130px_110px_110px] gap-4 items-center">
            {/* Name Column */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Folder className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{metric.name}</div>
              </div>
            </div>

            {/* ROI */}
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className={getROIColor(metric.roi)}
              >
                {metric.roi}%
              </Badge>
            </div>

            {/* Hours Saved */}
            <div className="text-sm">
              <span className="font-medium text-emerald-600">{formatHours(metric.hoursSaved)}</span>
              <span className="text-gray-500 ml-1 text-xs">hrs</span>
            </div>

            {/* Money Saved */}
            <div className="text-sm">
              <span className="font-semibold text-green-600">{formatCurrency(metric.moneySaved)}</span>
            </div>

            {/* Active Users */}
            <div className="text-sm">
              <span className="font-medium text-blue-600">{metric.activeUsers}</span>
              <span className="text-gray-500 ml-1 text-xs">users</span>
            </div>

            {/* Active Issues */}
            <div className="text-sm">
              <span className="font-medium text-orange-600">{metric.activeIssues}</span>
              <span className="text-gray-500 ml-1 text-xs">issues</span>
            </div>
                    </div>
                  </div>
                ))}
              </div>
  )
}

// Issue metric type with additional fields
type IssueMetric = {
  id: string
  key: string
  title: string
  roi: number
  hoursSaved: number
  moneySaved: number
  activeUsers: number
  state: string
}

// Issues Metrics List - Individual issue metrics
function IssuesMetrics() {
  const { currentOrg } = useAuth()
  const [data, setData] = useState<IssueMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const organizationId = currentOrg.organization.id
        
        // Get all issues with estimated_hours
        const { data: issues, error: issuesError } = await supabase
          .from('issues')
          .select('id, key, title, state, estimated_hours, assignee_id, reporter_id')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (issuesError) throw issuesError
        
        // Calculate metrics for each issue
        const metrics: IssueMetric[] = (issues || []).map(issue => {
          const isCompleted = issue.state === 'done'
          
          // Hours saved = estimated_hours if completed
          const realHoursSaved = isCompleted ? (issue.estimated_hours || 0) : 0
          
          // Active users: count assignee and reporter as users involved
          let realActiveUsers = 0
          if (issue.assignee_id) realActiveUsers++
          if (issue.reporter_id && issue.reporter_id !== issue.assignee_id) realActiveUsers++
          
          // Use dummy data if real data is too low
          const dummy = generateDummyMetrics(issue.id, 0.5)
          const hoursSaved = realHoursSaved > 0 ? realHoursSaved : dummy.hoursSaved * 0.1 // Smaller values for issues
          const moneySaved = hoursSaved * HOURLY_RATE
          const activeUsers = realActiveUsers > 0 ? realActiveUsers : Math.min(3, dummy.activeUsers)
          
          // ROI for individual issue
          const investment = (issue.estimated_hours || dummy.hoursSaved * 0.1) * HOURLY_RATE * 0.3
          const realRoi = investment > 0 ? Math.round((moneySaved / investment) * 100) : 0
          const roi = realRoi > 0 ? realRoi : dummy.roi
          
          return {
            id: issue.id,
            key: issue.key,
            title: issue.title,
            roi: Math.min(999, roi),
            hoursSaved,
            moneySaved,
            activeUsers,
            state: issue.state || 'triage'
          }
        })
        
        setData(metrics)
      } catch (error) {
        console.error('Error loading issue metrics:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentOrg?.organization?.id])

  // Get state badge color
  const getStateColor = (state: string) => {
    switch (state) {
      case 'done': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      case 'waiting_info': return 'bg-yellow-100 text-yellow-800'
      case 'triage': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading metrics...</div>
      </div>
    )
  }

  return (
    <div>
      {data.map((metric) => (
        <div
          key={metric.id}
          className="py-3 hover:bg-gray-50/50 transition-colors"
        >
          <div className="grid grid-cols-[1fr_100px_120px_130px_110px_110px] gap-4 items-center">
            {/* Name Column */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{metric.title}</div>
                <div className="text-xs text-gray-500 truncate">{metric.key}</div>
              </div>
            </div>

            {/* ROI */}
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className={getROIColor(metric.roi)}
              >
                {metric.roi}%
              </Badge>
            </div>

            {/* Hours Saved */}
            <div className="text-sm">
              <span className="font-medium text-emerald-600">{formatHours(metric.hoursSaved)}</span>
              <span className="text-gray-500 ml-1 text-xs">hrs</span>
            </div>

            {/* Money Saved */}
            <div className="text-sm">
              <span className="font-semibold text-green-600">{formatCurrency(metric.moneySaved)}</span>
            </div>

            {/* Active Users */}
            <div className="text-sm">
              <span className="font-medium text-blue-600">{metric.activeUsers}</span>
              <span className="text-gray-500 ml-1 text-xs">users</span>
            </div>

            {/* State instead of Active Issues */}
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className={getStateColor(metric.state)}
              >
                {metric.state.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MetricsPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("business_units")

  const getColumnHeaders = () => {
    const labels = {
      business_units: "Business Unit",
      projects: "Project",
      issues: "Issue"
    }
    
    // Last column changes based on view
    const lastColumn = currentView === 'issues' ? 'State' : 'Active Issues'
    
    return (
      <div className="grid grid-cols-[1fr_100px_120px_130px_110px_110px] gap-4">
        <div className="text-[13px] font-medium text-gray-500">{labels[currentView]}</div>
        <div className="text-[13px] font-medium text-gray-500">ROI</div>
        <div className="text-[13px] font-medium text-gray-500">Hours Saved</div>
        <div className="text-[13px] font-medium text-gray-500">Money Saved</div>
        <div className="text-[13px] font-medium text-gray-500">Active Users</div>
        <div className="text-[13px] font-medium text-gray-500">{lastColumn}</div>
      </div>
    )
  }

  const getCurrentViewComponent = () => {
    switch (currentView) {
      case "business_units":
        return <BusinessUnitsMetrics />
      case "projects":
        return <ProjectsMetrics />
      case "issues":
        return <IssuesMetrics />
    }
  }

  return (
    <ResizableAppShell
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
    >
      <ResizablePageSheet
        header={
          <div className="flex items-center h-full">
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Workspace</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Metrics</span>
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div className="flex items-center justify-between h-full" style={{ paddingLeft: '18px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              <MetricsFiltersBar currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </div>
        }
      >
        {/* Container that goes to edges - compensate sheet padding exactly */}
        <div className="-mx-5 -mt-4">
          {/* Level 1: Column Names - border goes edge to edge */}
          <div className="py-2 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            {getColumnHeaders()}
          </div>

          {/* Content: Metrics List */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            {getCurrentViewComponent()}
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
