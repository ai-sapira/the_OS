"use client"

import * as React from "react";
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Issue, Project, Initiative, User, IssueState, IssuePriority } from "@/lib/database/types"
import type { IssueWithRelations } from "@/lib/api/initiatives"
import type { ProjectWithRelations } from "@/lib/api/projects"
import { Sidebar } from "@/components/sidebar"
import { NewIssueModal } from "@/components/new-issue-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout"
import { ViewSwitcher } from "@/components/view-switcher"
import { Spinner } from "@/components/ui/spinner"
import { EditableIssueStateDropdown } from "@/components/ui/editable-issue-state-dropdown"
import { EditableIssuePriorityDropdown } from "@/components/ui/editable-issue-priority-dropdown"
import { EditableIssueAssigneeDropdown } from "@/components/ui/editable-issue-assignee-dropdown"
import { EditableIssueProjectDropdown } from "@/components/ui/editable-issue-project-dropdown"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { 
  Search, 
  Settings2, 
  Plus, 
  GripVertical, 
  MoreHorizontal, 
  Calendar, 
  User as UserIcon, 
  Building2, 
  Link,
  AlertCircle,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Circle,
  ArrowRight,
  HelpCircle,
  Ban,
  Copy,
  Filter,
  X,
  SearchIcon,
  ListFilter,
  SettingsIcon,
  PlusIcon,
  ChevronDownIcon,
  Target,
  Pause,
  CheckSquare
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Initiative states mapping
const ISSUE_STATES: { value: IssueState; label: string; color: string }[] = [
  { value: "todo", label: "Todo", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { value: "blocked", label: "Blocked", color: "bg-red-500" },
  { value: "waiting_info", label: "Waiting Info", color: "bg-orange-500" },
  { value: "done", label: "Done", color: "bg-green-500" },
  { value: "canceled", label: "Canceled", color: "bg-gray-500" },
  { value: "duplicate", label: "Duplicate", color: "bg-gray-400" }
]

// Display properties for issue cards
interface DisplayProperties {
  showId: boolean
  showStatus: boolean
  showAssignee: boolean
  showPriority: boolean
  showDueDate: boolean
  showProject: boolean
  showLabels: boolean
  showLinks: boolean
}

const DEFAULT_DISPLAY_PROPERTIES: DisplayProperties = {
  showId: true,
  showStatus: false,
  showAssignee: true,
  showPriority: true,
  showDueDate: false,
  showProject: false,
  showLabels: true,
  showLinks: false
}

// Filters interface
interface BoardFilters {
  search: string
  initiatives: string[]
  assignees: string[]
  priorities: string[]
  states: string[]
  origins: string[]
  labels: string[]
}

const DEFAULT_FILTERS: BoardFilters = {
  search: "",
  initiatives: [],
  assignees: [],
  priorities: [],
  states: [],
  origins: [],
  labels: []
}

// Board settings
interface BoardSettings {
  showEmptyRows: boolean
  showSubIssues: boolean
  showTriageIssues: boolean
  columnOrder: IssueState[]
  rowOrder: "name" | "status"
  sortInColumns: "priority" | "updated" | "created"
}

const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  showEmptyRows: true,
  showSubIssues: true,
  showTriageIssues: false,
  columnOrder: ["todo", "in_progress", "done", "waiting_info"],
  rowOrder: "name",
  sortInColumns: "priority"
}

// Initiatives Filters Bar Component
function IssuesFiltersBar({
  onFiltersChange
}: {
  onFiltersChange?: (filters: BoardFilters) => void
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_FILTERS);

  // Notify parent when filters change
  React.useEffect(() => {
    const combinedFilters = { ...filters, search: globalFilter };
    onFiltersChange?.(combinedFilters);
  }, [filters, globalFilter, onFiltersChange]);

  // Handle global filter changes
  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
  };

  // Generate filter options
  const filterOptions = React.useMemo(() => {
    const priorityOptions = [
      { name: "P0 - Critical", icon: <AlertCircle className="w-2.5 h-2.5 text-red-600" /> },
      { name: "P1 - High", icon: <AlertCircle className="w-2.5 h-2.5 text-orange-600" /> },
      { name: "P2 - Medium", icon: <AlertCircle className="w-2.5 h-2.5 text-yellow-600" /> },
      { name: "P3 - Low", icon: <AlertCircle className="w-2.5 h-2.5 text-green-600" /> },
    ];

    const stateOptions = ISSUE_STATES.map(state => ({
      name: state.label,
      icon: <div className={`w-2.5 h-2.5 rounded-full ${state.color}`} />
    }));

    const assigneeOptions = [
      { name: "Unassigned", icon: <UserIcon className="w-2.5 h-2.5 text-gray-400" /> },
    ];

    return [
      {
        name: "Priority",
        icon: <AlertCircle className="w-2.5 h-2.5 text-gray-600" />,
        options: priorityOptions
      },
      {
        name: "State",
        icon: <CheckCircle className="w-2.5 h-2.5 text-gray-600" />,
        options: stateOptions
      },
      {
        name: "Assignee",
        icon: <UserIcon className="w-2.5 h-2.5 text-gray-600" />,
        options: assigneeOptions
      }
    ];
  }, []);

  // Get active filters for display
  const activeFilters = React.useMemo(() => {
    const active = [];
    
    if (filters.priorities.length > 0) {
      active.push({ type: "Priority", value: filters.priorities });
    }
    if (filters.states.length > 0) {
      active.push({ type: "State", value: filters.states });
    }
    if (filters.assignees.length > 0) {
      active.push({ type: "Assignee", value: filters.assignees });
    }

    return active;
  }, [filters.priorities, filters.states, filters.assignees]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search initiatives..."
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            className="pl-9 h-7 max-w-sm bg-gray-50 border-gray-200 rounded-lg border-dashed focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:outline-none text-gray-900 placeholder-gray-500 shadow-none hover:bg-gray-100 transition-colors text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
        </div>

        {/* Active Filters */}
        <div className="flex gap-2">
          {activeFilters
            .filter((filter) => filter.value?.length > 0)
            .map((filter, index) => {
              const filterType = filterOptions.find(opt => opt.name === filter.type);
              const filterValue = filter.value[0];
              const matchingOption = filterType?.options.find(option => option.name === filterValue);

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
                      const newFilters = { ...filters };
                      if (filter.type === "Priority") {
                        newFilters.priorities = [];
                      } else if (filter.type === "State") {
                        newFilters.states = [];
                      } else if (filter.type === "Assignee") {
                        newFilters.assignees = [];
                      }
                      setFilters(newFilters);
                    }}
                    className="hover:bg-gray-100 h-full w-8 text-gray-500 hover:text-gray-700 transition-colors shrink-0 border-l border-gray-200"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              );
            })}
        </div>

        {/* Clear Filters Button */}
        {activeFilters.filter((filter) => filter.value?.length > 0).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition flex gap-1.5 items-center rounded-lg px-3 text-xs"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Clear
          </Button>
        )}

        {/* Filter Dropdown */}
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              setTimeout(() => {
                setSelectedView(null);
                setCommandInput("");
              }, 200);
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
            <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]]:py-1.5 [&_[cmdk-input-wrapper]_svg]:!text-black [&_[cmdk-input-wrapper]_svg]:!opacity-100 [&_[cmdk-input-wrapper]_svg]:!w-4 [&_[cmdk-input-wrapper]_svg]:!h-4 [&_[cmdk-input-wrapper]_svg]:!mr-2 [&_[cmdk-input-wrapper]]:!flex [&_[cmdk-input-wrapper]]:!items-center [&_[cmdk-input-wrapper]_svg]:!stroke-2">
              <CommandInput
                placeholder={selectedView ? selectedView : "Search..."}
                className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
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
                          const newFilters = { ...filters };
                          if (selectedView === "Priority") {
                            newFilters.priorities = [option.name.split(" - ")[0]];
                          } else if (selectedView === "State") {
                            newFilters.states = [ISSUE_STATES.find(s => s.label === option.name)?.value || ""];
                          } else if (selectedView === "Assignee") {
                            newFilters.assignees = [option.name];
                          }
                          setFilters(newFilters);
                          setTimeout(() => {
                            setSelectedView(null);
                            setCommandInput("");
                          }, 200);
                          setOpen(false);
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
                          setSelectedView(option.name);
                          setCommandInput("");
                          commandInputRef.current?.focus();
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
    </div>
  );
}

export default function IssuesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_FILTERS)
  const [displayProperties, setDisplayProperties] = useState<DisplayProperties>(DEFAULT_DISPLAY_PROPERTIES)
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS)
  const [displayPopoverOpen, setDisplayPopoverOpen] = useState(false)
  
  // View state
  const [currentView, setCurrentView] = useState<"list" | "board">("board")
  
  // Drag and drop state
  const [activeIssue, setActiveIssue] = useState<IssueWithRelations | null>(null)
  const [dragOverlay, setDragOverlay] = useState<IssueWithRelations | null>(null)
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  
  // Modal state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)
  
  // Load data
  const { 
    allIssues, 
    projects: allProjects, 
    initiatives: allInitiatives,
    updateIssue,
    loading
  } = useSupabaseData()
  
  // Debug: Log issues data
  React.useEffect(() => {
    console.log('[Issues Page] Total issues loaded:', allIssues.length);
    console.log('[Issues Page] Sample issues:', allIssues.slice(0, 3).map(i => ({
      key: i.key,
      title: i.title,
      assignee_id: i.assignee_id,
      assignee: i.assignee,
      assignee_name: i.assignee?.name
    })));
  }, [allIssues]);
  
  // Extract all available labels from issues for filtering
  const allLabels = React.useMemo(() => {
    const labelMap = new Map()
    allIssues.forEach(issue => {
      issue.labels?.forEach(label => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label)
        }
      })
    })
    return Array.from(labelMap.values())
  }, [allIssues])

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  )

  // Filter issues based on current filters and board settings
  const filteredIssues = allIssues.filter(issue => {
    // For list view, show ALL issues including triage
    // For board view, exclude triage issues unless enabled
    if (currentView === "board" && !boardSettings.showTriageIssues && issue.state === "triage") return false
    
    // Search filter
    if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !issue.key.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    
    // Initiative filter
    if (filters.initiatives.length > 0 && (!issue.initiative_id || !filters.initiatives.includes(issue.initiative_id))) {
      return false
    }
    
    // Assignee filter
    if (filters.assignees.length > 0 && (!issue.assignee_id || !filters.assignees.includes(issue.assignee_id))) {
      return false
    }
    
    // Priority filter
    if (filters.priorities.length > 0 && (!issue.priority || !filters.priorities.includes(issue.priority))) {
      return false
    }
    
    // State filter
    if (filters.states.length > 0 && (!issue.state || !filters.states.includes(issue.state))) {
      return false
    }
    
    return true
  })

  // Handle filter changes from the filter bar
  const handleFiltersChange = useCallback((newFilters: BoardFilters) => {
    setFilters(newFilters);
  }, []);

  // Get projects that have issues or show empty rows
  const getProjectsWithIssues = useCallback(() => {
    console.log('[Issues Page] allProjects count:', allProjects.length)
    console.log('[Issues Page] showEmptyRows:', boardSettings.showEmptyRows)
    console.log('[Issues Page] filteredIssues count:', filteredIssues.length)
    console.log('[Issues Page] allIssues count:', allIssues.length)
    
    // When showing all rows, use all projects; otherwise filter by issues
    const projects = boardSettings.showEmptyRows ? allProjects : 
      allProjects.filter(p => filteredIssues.some(i => i.project_id === p.id))
    
    console.log('[Issues Page] projects to display:', projects.length, projects.map(p => p.name))
    
    const orderedProjects = [...projects].sort((a, b) => {
      if (boardSettings.rowOrder === "name") {
        return a.name.localeCompare(b.name)
      } else {
        const statusOrder = { active: 0, planned: 1, paused: 2, done: 3 }
        const aStatus = a.status ? statusOrder[a.status] : 999
        const bStatus = b.status ? statusOrder[b.status] : 999
        return aStatus - bStatus
      }
    })

    // Add unassigned project if there are any issues without a project
    // Check in all issues, not just filtered ones
    if (allIssues.some(i => !i.project_id)) {
    orderedProjects.push({
      id: "unassigned",
      name: "Unassigned",
      slug: "unassigned",
      organization_id: "",
      status: null,
      created_at: null,
      updated_at: null,
      description: null,
      owner_user_id: null,
      planned_start_at: null,
      planned_end_at: null,
      progress: null,
      initiative_id: null
    } as ProjectWithRelations)
  }
    
    return orderedProjects
  }, [filteredIssues, allProjects, allIssues, boardSettings]);


  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const issue = allIssues.find(i => i.id === active.id)
    if (issue) {
      setActiveIssue(issue)
      setDragOverlay(issue)
    }
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveIssue(null)
    setDragOverlay(null)

    console.log('🎯 Drag ended:', { activeId: active.id, overId: over?.id })

    if (!over || !active.id) {
      console.log('❌ No over or active.id')
      return
    }

    const issueId = active.id as string
    const overId = over.id as string
    
    // Parse drop target: format is "project___{projectId}___state___{state}"
    const overIdParts = overId.split('___')
    console.log('📍 Over ID parts:', overIdParts)
    
    if (overIdParts.length !== 4 || overIdParts[0] !== 'project' || overIdParts[2] !== 'state') {
      console.log('❌ Invalid drop target format')
      return
    }
    
    const targetState = overIdParts[3] as IssueState
    
    const issue = allIssues.find(i => i.id === issueId)
    if (!issue) {
      console.log('❌ Issue not found')
      return
    }
    
    console.log('🔄 Changing state:', { from: issue.state, to: targetState })
    
    // Don't update if dropping on the same state
    if (issue.state === targetState) {
      console.log('⏭️ Same state, skipping')
      return
    }
    
    // Don't allow dropping on terminal states unless coming from terminal states
    if ((targetState === 'canceled' || targetState === 'duplicate') && 
        (issue.state !== 'canceled' && issue.state !== 'duplicate')) {
      console.log('❌ Cannot drop on terminal state')
      return
    }
    
    try {
      console.log('✅ Updating issue state...')
      await updateIssue(issueId, {
        state: targetState
      })
      console.log('✅ Issue updated successfully!')
    } catch (error) {
      console.error('❌ Failed to update issue:', error)
    }
  }

  // Handle initiative card click
  const handleInitiativeClick = (initiative: IssueWithRelations) => {
    router.push(`/initiatives/${initiative.id}`)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  // Handle create issue
  const handleCreateIssue = (issue: any) => {
    console.log("Created issue:", issue)
    // TODO: Implement issue creation
  }

  // Save display preferences
  const saveDisplayPreferences = () => {
    localStorage.setItem('issues-display-properties', JSON.stringify(displayProperties))
    localStorage.setItem('issues-board-settings', JSON.stringify(boardSettings))
    setDisplayPopoverOpen(false)
  }

  // Handle responsive breakpoints - use matchMedia instead of innerWidth
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 1023px)')
    const tabletQuery = window.matchMedia('(min-width: 1024px) and (max-width: 1279px)')
    
    const handleResize = () => {
      setIsMobile(mobileQuery.matches)
      setIsTablet(tabletQuery.matches)
    }

    handleResize()
    
    // Modern browsers support addEventListener on MediaQueryList
    mobileQuery.addEventListener('change', handleResize)
    tabletQuery.addEventListener('change', handleResize)
    
    return () => {
      mobileQuery.removeEventListener('change', handleResize)
      tabletQuery.removeEventListener('change', handleResize)
    }
  }, [])

  // Load display preferences on mount
  useEffect(() => {
    const savedDisplayProperties = localStorage.getItem('issues-display-properties')
    const savedBoardSettings = localStorage.getItem('issues-board-settings')
    
    if (savedDisplayProperties) {
      setDisplayProperties(JSON.parse(savedDisplayProperties))
    }
    
    if (savedBoardSettings) {
      setBoardSettings(JSON.parse(savedBoardSettings))
    }
  }, [])

  // Load selected project for mobile
  useEffect(() => {
    if (isMobile) {
      const savedSelectedProject = localStorage.getItem('issues-selected-project')
      if (savedSelectedProject) {
      setSelectedProjectId(savedSelectedProject)
      }
    }
  }, [isMobile])

  // Save selected project for mobile
  useEffect(() => {
    if (isMobile && selectedProjectId) {
      localStorage.setItem('issues-selected-project', selectedProjectId)
    }
  }, [selectedProjectId, isMobile])

  return (
    <ResizableAppShell
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
    >
      <ResizablePageSheet
        header={
          <div>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Workspace</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Initiatives</span>
          </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100" 
                  onClick={() => setCreateIssueOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
              </Button>
          </div>
        </div>
        </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div className="flex items-center justify-between h-full" style={{ paddingLeft: '18px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              <div className="min-w-0 flex-1">
                <IssuesFiltersBar onFiltersChange={handleFiltersChange} />
              </div>
              <div className="shrink-0 ml-2">
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
              </div>
      </div>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-12"
            >
              <Spinner size="md" />
            </motion.div>
          ) : (
            <>
              {/* List View */}
              {currentView === "list" && (
          <div className="-mx-5 -mt-4 h-full flex flex-col">
            {/* Column Headers - Sticky */}
            <div className="flex-shrink-0 py-2.5 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <div className="grid grid-cols-[1fr_160px_200px_140px_200px] gap-6">
                <div className="text-[13px] font-medium text-gray-500 pr-4">Issue</div>
                <div className="text-[13px] font-medium text-gray-500">State</div>
                <div className="text-[13px] font-medium text-gray-500">Assignee</div>
                <div className="text-[13px] font-medium text-gray-500">Priority</div>
                <div className="text-[13px] font-medium text-gray-500">Project</div>
              </div>
            </div>

            {/* Issues List - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <IssuesListView
                issues={filteredIssues}
                projects={allProjects}
                onIssueClick={handleInitiativeClick}
                onDataChange={() => {
                  // Optionally refresh data
                  console.log('Issue data updated');
                }}
              />
            </div>
          </div>
        )}

        {/* Board View */}
        {currentView === "board" && (
          <div className="-mx-5 -mt-4 -mb-5 h-[calc(100vh-var(--header-h)*2)]">
            {/* Main Content */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Mobile State Selector */}
        {isMobile && (
              <div className="px-4 py-2 bg-background border-b border-border">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state to view..." />
            </SelectTrigger>
            <SelectContent>
                    {boardSettings.columnOrder.map(state => {
                      const stateInfo = ISSUE_STATES.find(s => s.value === state)
                      const count = filteredIssues.filter(issue => issue.state === state).length
                      return (
                        <SelectItem key={state} value={state}>
                  <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stateInfo?.color}`} />
                            <span>{stateInfo?.label}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {count}
                            </Badge>
                  </div>
                </SelectItem>
                      )
                    })}
            </SelectContent>
          </Select>
        </div>
      )}

            {/* Project Matrix Board Container */}
      <div className="flex-1 overflow-hidden">
        <div className="relative h-full">
                {/* Desktop Layout (≥1280px) - Project Rows × State Columns Matrix */}
          {!isMobile && !isTablet && (
                  <div className="h-full flex flex-col">
                      {/* Column Headers - Sticky at top */}
                      <div className="sticky top-0 z-40 bg-background border-b border-border flex">
                        {boardSettings.columnOrder.map(state => {
                          const stateInfo = ISSUE_STATES.find(s => s.value === state)
                          const count = filteredIssues.filter(issue => issue.state === state).length
                          
                          const getStateIcon = (stateValue: string) => {
                            switch (stateValue) {
                              case 'done':
                                return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                              case 'in_progress':
                                return <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              case 'blocked':
                                return <XCircle className="h-3 w-3 text-muted-foreground" />
                              case 'waiting_info':
                                return <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              case 'canceled':
                                return <Ban className="h-3 w-3 text-muted-foreground" />
                              case 'duplicate':
                                return <Copy className="h-3 w-3 text-muted-foreground" />
                              case 'todo':
                              default:
                                return <Circle className="h-3 w-3 text-muted-foreground" />
                            }
                          }
                          
                          return (
                            <div key={state} className="flex-1 min-w-[280px] px-3 py-3 border-r border-border last:border-r-0">
                              <div className="flex items-center gap-2">
                                {getStateIcon(state)}
                                <span className="font-semibold text-xs">{stateInfo?.label}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Project Rows - Scrollable */}
                      <div className="flex-1 overflow-y-auto">
                        {getProjectsWithIssues().map(project => (
                          <ProjectMatrixRow
                      key={project.id}
                      project={project}
                            issues={filteredIssues.filter(issue => 
                              (issue.project_id || "unassigned") === project.id
                            )}
                      columnOrder={boardSettings.columnOrder}
                      displayProperties={displayProperties}
                      onIssueClick={handleInitiativeClick}
                    />
                  ))}
                      </div>
                  </div>
          )}

                {/* Tablet Layout (1024-1279px) - Horizontal Scrollable Kanban */}
          {isTablet && (
                  <div className="h-[calc(100vh-200px)] overflow-x-auto">
                    <div className="flex min-w-max">
                      {boardSettings.columnOrder.map(state => {
                        const stateInfo = ISSUE_STATES.find(s => s.value === state)
                        const issuesInState = filteredIssues.filter(issue => issue.state === state)
                        const count = issuesInState.length
                        
                        return (
                          <div key={state} className="w-80 flex-shrink-0 border-r border-border last:border-r-0">
                            <KanbanColumn
                              state={state}
                              stateInfo={stateInfo}
                              issues={issuesInState}
                              count={count}
                  displayProperties={displayProperties}
                  onIssueClick={handleInitiativeClick}
                              allProjects={allProjects}
                />
                          </div>
                        )
                      })}
                    </div>
            </div>
          )}

                {/* Mobile Layout (≤1023px) - Single Column View */}
                {isMobile && (
                  <div className="h-[calc(100vh-240px)] overflow-hidden">
                    <MobileKanbanView
                      filteredIssues={filteredIssues}
                columnOrder={boardSettings.columnOrder}
                displayProperties={displayProperties}
                onIssueClick={handleInitiativeClick}
                      allProjects={allProjects}
              />
            </div>
          )}
              </div>
            </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {dragOverlay ? (
                  <IssueCard
                    issue={dragOverlay}
                    displayProperties={displayProperties}
                    onClick={() => {}}
                    isDragging={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}

              {/* Create Issue Modal */}
              <NewIssueModal 
                open={createIssueOpen} 
                onOpenChange={setCreateIssueOpen} 
              />
            </>
          )}
        </AnimatePresence>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

// Initiatives List View Component (similar to projects/initiatives)
interface IssuesListViewProps {
  issues: IssueWithRelations[]
  projects: ProjectWithRelations[]
  onIssueClick: (issue: IssueWithRelations) => void
  onDataChange?: () => void
}

function IssuesListView({ issues, projects, onIssueClick, onDataChange }: IssuesListViewProps) {
  const [localIssues, setLocalIssues] = React.useState<IssueWithRelations[]>(issues)
  
  React.useEffect(() => {
    setLocalIssues(issues)
  }, [issues])

  return (
    <div>
      {localIssues.length > 0 ? (
        localIssues.map((issue) => {
          const project = projects.find(p => p.id === issue.project_id)
          
          return (
            <div
              key={issue.id}
              className="group py-3.5 hover:bg-gray-50/50 transition-colors border-b border-stroke last:border-b-0"
            >
              <div className="grid grid-cols-[1fr_160px_200px_140px_200px] gap-6 items-center">
                {/* Issue Column */}
                <div 
                  className="flex items-start space-x-3 min-w-0 cursor-pointer pr-4"
                  onClick={() => onIssueClick(issue)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">{issue.key}</span>
                      {issue.core_technology && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-medium text-xs h-5 px-1.5 border">
                          {issue.core_technology}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate mb-0.5">{issue.title}</div>
                    {issue.short_description && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {issue.short_description}
                      </div>
                    )}
                  </div>
                </div>

                {/* State Column */}
                <div className="flex justify-start items-center" onClick={(e) => e.stopPropagation()}>
                  {issue.state && (
                    <EditableIssueStateDropdown
                      currentState={issue.state}
                      issueId={issue.id}
                      onStateChange={(newState) => {
                        const updatedIssues = localIssues.map(i =>
                          i.id === issue.id ? { ...i, state: newState } : i
                        )
                        setLocalIssues(updatedIssues)
                        onDataChange?.()
                      }}
                    />
                  )}
                </div>

                {/* Assignee Column */}
                <div className="flex justify-start items-center" onClick={(e) => e.stopPropagation()}>
                  <EditableIssueAssigneeDropdown
                    currentAssignee={issue.assignee}
                    issueId={issue.id}
                    onAssigneeChange={(newAssignee) => {
                      const updatedIssues = localIssues.map(i =>
                        i.id === issue.id ? { ...i, assignee: newAssignee || undefined } : i
                      )
                      setLocalIssues(updatedIssues)
                      onDataChange?.()
                    }}
                  />
                </div>

                {/* Priority Column */}
                <div className="flex justify-start items-center" onClick={(e) => e.stopPropagation()}>
                  <EditableIssuePriorityDropdown
                    currentPriority={issue.priority}
                    issueId={issue.id}
                    onPriorityChange={(newPriority) => {
                      const updatedIssues = localIssues.map(i =>
                        i.id === issue.id ? { ...i, priority: newPriority } : i
                      )
                      setLocalIssues(updatedIssues)
                      onDataChange?.()
                    }}
                  />
                </div>

                {/* Project Column */}
                <div className="flex justify-start items-center min-w-0" onClick={(e) => e.stopPropagation()}>
                  <EditableIssueProjectDropdown
                    currentProject={project}
                    issueId={issue.id}
                    onProjectChange={(newProject) => {
                      const updatedIssues = localIssues.map(i =>
                        i.id === issue.id ? { ...i, project_id: newProject?.id || null, project: newProject || undefined } : i
                      )
                      setLocalIssues(updatedIssues)
                      onDataChange?.()
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })
      ) : (
        <div className="py-12 text-center text-gray-500">
          <Circle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p>No initiatives found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

// Project Matrix Row Component
interface ProjectMatrixRowProps {
  project: ProjectWithRelations
  issues: IssueWithRelations[]
  columnOrder: IssueState[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
}

function ProjectMatrixRow({ 
  project, 
  issues, 
  columnOrder, 
  displayProperties, 
  onIssueClick
}: ProjectMatrixRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const getProjectStatusIcon = (status: string | null) => {
    switch (status) {
      case "active": 
        return <Target className="h-3 w-3 text-muted-foreground" />
      case "planned": 
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "paused": 
        return <Pause className="h-3 w-3 text-muted-foreground" />
      case "done": 
        return <CheckSquare className="h-3 w-3 text-muted-foreground" />
      default: 
        return <Circle className="h-3 w-3 text-muted-foreground" />
    }
  }

  // Group issues by state
  const issuesByState = React.useMemo(() => {
    const grouped: Record<string, IssueWithRelations[]> = {}
    columnOrder.forEach(state => {
      grouped[state] = issues.filter(issue => issue.state === state)
    })
    return grouped
  }, [issues, columnOrder])

  return (
    <div className="border-b border-border">
      {/* Project Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors"
      >
        <ChevronDownIcon 
          className={`h-3 w-3 text-muted-foreground transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`} 
        />
        
        {project.status && project.id !== "unassigned" && (
          <div className="flex-shrink-0">
            {getProjectStatusIcon(project.status)}
          </div>
        )}
        
        <span className="font-semibold text-sm flex-1 text-left truncate">
          {project.name}
        </span>
        
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {issues.length}
        </span>
      </button>

      {/* Project Content - State Columns */}
      {isExpanded && (
        <div className="flex">
          {columnOrder.map((state) => {
            const stateIssues = issuesByState[state] || []
            
            return (
              <ProjectStateColumn
                key={state}
                projectId={project.id}
                state={state}
                issues={stateIssues}
                displayProperties={displayProperties}
                onIssueClick={onIssueClick}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// Project State Column Component (intersection of project row and state column)
interface ProjectStateColumnProps {
  projectId: string
  state: IssueState
  issues: IssueWithRelations[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
}

function ProjectStateColumn({ 
  projectId, 
  state, 
  issues, 
  displayProperties, 
  onIssueClick
}: ProjectStateColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `project___${projectId}___state___${state}`,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] border-r border-border last:border-r-0 transition-colors ${
        isOver ? 'bg-accent/20' : ''
      }`}
    >
      <div className="px-3 py-2 space-y-2 min-h-[80px] pb-4">
        {/* Issues as Cards */}
        {issues.map(issue => (
          <DraggableIssueCard
            key={issue.id}
            issue={issue}
            displayProperties={displayProperties}
            onClick={() => onIssueClick(issue)}
          />
        ))}
        
        {/* Empty state placeholder */}
        {issues.length === 0 && !isOver && (
          <div className="h-16 flex items-center justify-center text-muted-foreground text-xs opacity-0 hover:opacity-30 transition-opacity">
            Drop here
          </div>
        )}
        
        {/* Drop indicator when dragging over */}
        {isOver && issues.length === 0 && (
          <div className="h-16 border-2 border-dashed border-primary rounded opacity-50 transition-opacity" />
        )}
      </div>
    </div>
  )
}

// Kanban Column Component (kept for tablet layout)
interface KanbanColumnProps {
  state: IssueState
  stateInfo: { value: IssueState; label: string; color: string } | undefined
  issues: IssueWithRelations[]
  count: number
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
  allProjects: ProjectWithRelations[]
}

function KanbanColumn({ 
  state, 
  stateInfo, 
  issues, 
  count, 
  displayProperties, 
  onIssueClick,
  allProjects 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `kanban-column-${state}`,
  })

  // Group issues by project for display
  const issuesByProject = React.useMemo(() => {
    const grouped: Record<string, IssueWithRelations[]> = {}
    
    issues.forEach(issue => {
      const projectId = issue.project_id || "unassigned"
      if (!grouped[projectId]) {
        grouped[projectId] = []
      }
      grouped[projectId].push(issue)
    })
    
    return grouped
  }, [issues])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Column Header - Sticky */}
      <div className="flex-shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stateInfo?.color}`} />
          <span className="font-semibold text-sm">{stateInfo?.label}</span>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {count}
          </span>
        </div>
      </div>

      {/* Column Content - Scrollable */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-3 py-2 space-y-3 transition-colors ${
          isOver ? 'bg-accent/20' : ''
        }`}
      >
        {/* Issues grouped by project */}
        {Object.entries(issuesByProject).map(([projectId, projectIssues]) => {
          const project = allProjects.find(p => p.id === projectId) || {
            id: "unassigned",
            name: "Unassigned",
            slug: "unassigned",
          }

          return (
            <ProjectGroup
              key={projectId}
              project={project}
              issues={projectIssues}
              displayProperties={displayProperties}
              onIssueClick={onIssueClick}
              showProjectHeader={Object.keys(issuesByProject).length > 1 || projectId !== "unassigned"}
            />
          )
        })}
        
        {/* Empty state */}
        {issues.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            No issues
          </div>
        )}
        
        {/* Drop indicator when dragging over */}
        {isOver && (
          <div className="h-1 bg-primary rounded opacity-50 transition-opacity" />
        )}
      </div>
    </div>
  )
}

// Project Group Component within Kanban Column
interface ProjectGroupProps {
  project: Partial<ProjectWithRelations>
  issues: IssueWithRelations[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
  showProjectHeader: boolean
}

function ProjectGroup({ 
  project, 
  issues, 
  displayProperties, 
  onIssueClick,
  showProjectHeader 
}: ProjectGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  return (
    <div className="space-y-2">
      {/* Project Header - Collapsible */}
      {showProjectHeader && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full px-2 py-1 hover:bg-muted/50 rounded transition-colors group"
        >
          <ChevronDownIcon 
            className={`h-3 w-3 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`} 
          />
          <span className="text-xs font-medium text-muted-foreground">
            {project.name}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {issues.length}
          </span>
        </button>
      )}
      
      {/* Issues */}
      {isExpanded && (
        <div className="space-y-1">
          {issues.map(issue => (
            <DraggableIssueCard
              key={issue.id}
              issue={issue}
              displayProperties={displayProperties}
              onClick={() => onIssueClick(issue)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Board Row Component (kept for tablet/mobile layouts)
interface BoardRowProps {
  project: ProjectWithRelations
  issues: Record<string, IssueWithRelations[]>
  columnOrder: IssueState[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
}

function BoardRow({ project, issues, columnOrder, displayProperties, onIssueClick }: BoardRowProps) {
  const getProjectStatusIcon = (status: string | null) => {
    switch (status) {
      case "active": 
        return <Target className="h-3 w-3 text-muted-foreground" />
      case "planned": 
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "paused": 
        return <Pause className="h-3 w-3 text-muted-foreground" />
      case "done": 
        return <CheckSquare className="h-3 w-3 text-muted-foreground" />
      default: 
        return <Circle className="h-3 w-3 text-muted-foreground" />
    }
  }

  return (
    <div className="flex border-b border-border min-h-[120px]">
      {/* Row Header - Sticky */}
      <div className="w-60 flex-shrink-0 border-r border-border bg-card sticky left-0 z-30">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {project.status && (
              <div className="flex-shrink-0">
                {getProjectStatusIcon(project.status)}
              </div>
            )}
            <h3 className="font-medium text-sm">{project.name}</h3>
          </div>
          {project.id !== "unassigned" && (
            <p className="text-xs text-muted-foreground">
              {project.description || "No description"}
            </p>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 flex">
        {columnOrder.map(state => (
          <BoardColumn
            key={state}
            state={state}
            issues={issues[state] || []}
            displayProperties={displayProperties}
            onIssueClick={onIssueClick}
            projectId={project.id}
          />
        ))}
      </div>
    </div>
  )
}

// Board Column Component
interface BoardColumnProps {
  state: IssueState
  issues: IssueWithRelations[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
  projectId: string
}

function BoardColumn({ state, issues, displayProperties, onIssueClick, projectId }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `project___${projectId}___state___${state}`,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] border-r border-border last:border-r-0 transition-colors ${
        isOver ? 'bg-accent border-accent-foreground' : ''
      }`}
    >
      <div className="p-3 space-y-3 min-h-[120px]">
        {issues.map(issue => (
          <DraggableIssueCard
            key={issue.id}
            issue={issue}
            displayProperties={displayProperties}
            onClick={() => onIssueClick(issue)}
          />
        ))}
        
        {/* Empty state */}
        {issues.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No issues
          </div>
        )}
        
        {/* Drop indicator when dragging over */}
        {isOver && (
          <div className="h-2 bg-primary rounded opacity-50 transition-opacity" />
        )}
      </div>
    </div>
  )
}

// Fully Draggable Issue Card Component (entire card is draggable)
interface FullyDraggableIssueCardProps {
  issue: IssueWithRelations
  displayProperties: DisplayProperties
  onClick: () => void
}

function FullyDraggableIssueCard({ issue, displayProperties, onClick }: FullyDraggableIssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: issue.id,
    disabled: issue.state === 'canceled' || issue.state === 'duplicate'
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const isDisabled = issue.state === 'canceled' || issue.state === 'duplicate'

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className={`${isDisabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <IssueCard
        issue={issue}
        displayProperties={displayProperties}
        onClick={onClick}
        isDragging={isDragging}
        isFullyDraggable={true}
      />
    </div>
  )
}

// Draggable Issue Card Component (with handle)
interface DraggableIssueCardProps {
  issue: IssueWithRelations
  displayProperties: DisplayProperties
  onClick: () => void
}

function DraggableIssueCard({ issue, displayProperties, onClick }: DraggableIssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: issue.id,
    disabled: issue.state === 'canceled' || issue.state === 'duplicate'
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  const handleClick = (e?: React.MouseEvent) => {
    // Don't trigger onClick if we're dragging
    if (isDragging) {
      e?.stopPropagation()
      return
    }
    onClick()
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <IssueCard
        issue={issue}
        displayProperties={displayProperties}
        onClick={handleClick}
        isDragging={isDragging}
        isFullyDraggable={true}
      />
    </div>
  )
}

// Issue Card Component
interface IssueCardProps {
  issue: IssueWithRelations
  displayProperties: DisplayProperties
  onClick: () => void
  isDragging?: boolean
  dragListeners?: any
  isFullyDraggable?: boolean
}

function IssueCard({ issue, displayProperties, onClick, isDragging = false, dragListeners, isFullyDraggable = false }: IssueCardProps) {
  const [localIssue, setLocalIssue] = useState(issue);
  
  // Update local issue when prop changes
  React.useEffect(() => {
    setLocalIssue(issue);
  }, [issue]);

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "P0": return "bg-red-500"
      case "P1": return "bg-orange-500"
      case "P2": return "bg-yellow-500"
      case "P3": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'done':
        return <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
      case 'in_progress':
        return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      case 'blocked':
        return <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
      case 'waiting_info':
        return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
      case 'canceled':
        return <Ban className="h-3.5 w-3.5 text-muted-foreground" />
      case 'duplicate':
        return <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      case 'todo':
      default:
        return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const isDisabled = localIssue.state === 'canceled' || localIssue.state === 'duplicate'

  return (
    <Card
      className={`group relative p-2 hover:shadow-md transition-all duration-200 border-border ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={onClick}
    >

      {/* Top Row: Title (left) + Key (right) */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Title */}
        <h4 className="text-sm font-medium line-clamp-1 flex-1">
          {localIssue.title}
        </h4>

        {/* Key */}
        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
          {localIssue.key}
        </span>
      </div>

      {/* Middle Row: Short description (if exists) - more compact */}
      {localIssue.short_description && (
        <div className="mb-2">
          <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
            {localIssue.short_description}
          </p>
        </div>
      )}

      {/* Technology Badge (if exists) - inline with bottom row if possible */}
      {localIssue.core_technology && (
        <div className="mb-1.5">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-200">
            <span className="text-[10px] font-medium text-gray-700">{localIssue.core_technology}</span>
          </div>
        </div>
      )}

      {/* Bottom Row: Owner (left) + Priority (right) - NOW EDITABLE */}
      <div className="flex items-center justify-between gap-2">
        {/* Owner - Editable Assignee */}
        {displayProperties.showAssignee && (
          <div onClick={(e) => e.stopPropagation()}>
            <EditableIssueAssigneeDropdown
              currentAssignee={localIssue.assignee}
              issueId={localIssue.id}
              onAssigneeChange={(newAssignee) => {
                console.log('[IssueCard] Assignee changed:', newAssignee);
                setLocalIssue({ ...localIssue, assignee: newAssignee || undefined });
                // Note: The EditableIssueAssigneeDropdown already saves to DB
                // We just update local state for immediate UI feedback
              }}
            />
          </div>
        )}

        {/* Priority - Editable */}
        {displayProperties.showPriority && (
          <div onClick={(e) => e.stopPropagation()}>
            <EditableIssuePriorityDropdown
              currentPriority={localIssue.priority}
              issueId={localIssue.id}
              onPriorityChange={(newPriority) => {
                console.log('[IssueCard] Priority changed:', newPriority);
                setLocalIssue({ ...localIssue, priority: newPriority });
              }}
            />
          </div>
        )}
      </div>

      {/* More Options - Absolute positioned top right */}
      <div className="absolute right-1 top-1">
        <MoreHorizontal className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Card>
  )
}

// Tablet Project Accordion Component (1024-1279px)
interface TabletProjectAccordionProps {
  project: ProjectWithRelations
  issues: Record<string, IssueWithRelations[]>
  columnOrder: IssueState[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
}

function TabletProjectAccordion({ project, issues, columnOrder, displayProperties, onIssueClick }: TabletProjectAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getProjectStatusIcon = (status: string | null) => {
    switch (status) {
      case "active": 
        return <Target className="h-3 w-3 text-muted-foreground" />
      case "planned": 
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "paused": 
        return <Pause className="h-3 w-3 text-muted-foreground" />
      case "done": 
        return <CheckSquare className="h-3 w-3 text-muted-foreground" />
      default: 
        return <Circle className="h-3 w-3 text-muted-foreground" />
    }
  }

  const totalIssues = Object.values(issues).reduce((acc, stateIssues) => acc + stateIssues.length, 0)

  return (
    <div className="border-b border-border">
      {/* Project Header - Collapsible */}
      <div 
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.status && (
              <div className="flex-shrink-0">
                {getProjectStatusIcon(project.status)}
              </div>
            )}
            <h3 className="font-medium">{project.name}</h3>
            <Badge variant="secondary">{totalIssues} issues</Badge>
          </div>
          <div className="flex items-center gap-2">
            {project.status && (
              <Badge variant="outline" className="text-xs">
                {project.status}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              {isExpanded ? "−" : "+"}
            </Button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Columns */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <div className="flex min-w-max p-4 gap-4">
            {columnOrder.map(state => {
              const stateInfo = ISSUE_STATES.find(s => s.value === state)
              const stateIssues = issues[state] || []
              
                return (
                  <div key={state} className="w-80 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3 p-2 bg-card rounded">
                    <div className={`w-2 h-2 rounded-full ${stateInfo?.color}`} />
                    <span className="font-medium text-sm">{stateInfo?.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {stateIssues.length}
                    </Badge>
                  </div>
                  
                  <BoardColumn
                    state={state}
                    issues={stateIssues}
                    displayProperties={displayProperties}
                    onIssueClick={onIssueClick}
                    projectId={project.id}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile Kanban View Component (≤1023px)
interface MobileKanbanViewProps {
  filteredIssues: IssueWithRelations[]
  columnOrder: IssueState[]
  displayProperties: DisplayProperties
  onIssueClick: (issue: IssueWithRelations) => void
  allProjects: ProjectWithRelations[]
}

function MobileKanbanView({ 
  filteredIssues, 
  columnOrder, 
  displayProperties, 
  onIssueClick,
  allProjects 
}: MobileKanbanViewProps) {
  const [selectedState, setSelectedState] = useState<IssueState>(columnOrder[0])

  const issuesInSelectedState = filteredIssues.filter(issue => issue.state === selectedState)
  const stateInfo = ISSUE_STATES.find(s => s.value === selectedState)

  return (
    <div className="h-full flex flex-col">
      {/* State Selector */}
      <div className="p-4 border-b border-border bg-card">
        <Select value={selectedState} onValueChange={(value) => setSelectedState(value as IssueState)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
          {columnOrder.map(state => {
              const info = ISSUE_STATES.find(s => s.value === state)
              const count = filteredIssues.filter(issue => issue.state === state).length
            return (
                <SelectItem key={state} value={state}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${info?.color}`} />
                    <span>{info?.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {count}
                    </Badge>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
                </div>
                
      {/* Single Column Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* State Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${stateInfo?.color}`} />
            <span className="font-semibold text-sm">{stateInfo?.label}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {issuesInSelectedState.length}
            </Badge>
          </div>

          {/* Issues grouped by project */}
          <ProjectGroup
            project={{ name: "All Initiatives" }}
            issues={issuesInSelectedState}
                      displayProperties={displayProperties}
            onIssueClick={onIssueClick}
            showProjectHeader={false}
          />
          
          {/* Empty state */}
          {issuesInSelectedState.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No issues in {stateInfo?.label}
                    </div>
                  )}
        </div>
      </div>
    </div>
  )
}

