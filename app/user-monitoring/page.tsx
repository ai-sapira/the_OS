"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Activity,
  MousePointerClick,
  Navigation,
  Focus,
  Timer,
  Users,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Mail,
  Eye,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"
import { format, subDays, parseISO } from "date-fns"

// Types
type EventType = "click" | "navigation" | "focus" | "error" | "load" | "input"

interface UserEvent {
  id: string
  type: EventType
  application: string
  url: string
  title: string
  description: string
  timestamp: Date
  duration?: number
  userId: string
  date: string
}

interface Employee {
  id: string
  name: string
  email: string
  avatar_url?: string
  monitoringEnabled?: boolean
  lastActive?: Date
  totalEvents?: number
  isRecording?: boolean
}

// Helper functions
const getEventTypeIcon = (type: EventType) => {
  switch (type) {
    case "click":
      return MousePointerClick
    case "navigation":
      return Navigation
    case "focus":
      return Focus
    case "error":
      return AlertCircle
    case "load":
      return RefreshCw
    default:
      return Activity
  }
}

const getEventTypeLabel = (type: EventType): string => {
  const labels: Record<EventType, string> = {
    click: "Click",
    navigation: "Nav",
    focus: "Focus",
    error: "Error",
    load: "Load",
    input: "Input",
  }
  return labels[type] || type
}

const getEventTypeBadge = (type: EventType) => {
  const Icon = getEventTypeIcon(type)
  const colors: Record<EventType, string> = {
    click: "bg-gray-50 text-gray-700 border-gray-200",
    navigation: "bg-blue-50 text-blue-700 border-blue-200",
    focus: "bg-gray-50 text-gray-700 border-gray-200",
    error: "bg-red-50 text-red-700 border-red-200",
    load: "bg-gray-50 text-gray-700 border-gray-200",
    input: "bg-green-50 text-green-700 border-green-200",
  }
  return { Icon, color: colors[type] || "bg-gray-50 text-gray-700 border-gray-200" }
}

// Dummy data - will be replaced with real data
const generateDummyEvents = (userId: string, daysAgo: number): UserEvent[] => {
  const date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd")
  const baseTime = subDays(new Date(), daysAgo).getTime()
  const events: UserEvent[] = []
  
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  const eventCount = 40 + Math.floor(Math.random() * 30) // Increased event count
  
  // Applications with weights - SAP and Salesforce have higher probability
  const applications = [
    { name: "SAP", domains: ["sap.com", "sapfiori.com"], weight: 8, pages: [
      "SAP Fiori Launchpad", "SAP GUI", "Invoice Management", "Purchase Orders", 
      "Material Management", "Financial Accounting", "Sales & Distribution"
    ] },
    { name: "Salesforce", domains: ["salesforce.com", "lightning.force.com"], weight: 8, pages: [
      "Sales Cloud", "Service Cloud", "Leads", "Opportunities", "Accounts", 
      "Contacts", "Reports", "Dashboards", "Cases"
    ] },
    { name: "sapira.ai", domains: ["sapira.ai"], weight: 6, pages: [
      "/insights", "/triage-new", "/business-units", "/projects", "/initiatives", "/metrics"
    ] },
    { name: "Google", domains: ["google.com", "google.es"], weight: 5, pages: [
      "Google Search", "Google Drive", "Google Sheets", "Google Docs", "Google Calendar"
    ] },
    { name: "gmail.com", domains: ["mail.google.com", "gmail.com"], weight: 4, pages: [
      "Inbox", "Sent", "Drafts", "Important"
    ] },
    { name: "slack.com", domains: ["slack.com"], weight: 3, pages: [
      "general", "engineering", "sales", "support"
    ] },
    { name: "github.com", domains: ["github.com"], weight: 2, pages: [
      "Repositories", "Pull Requests", "Issues", "Actions"
    ] },
  ]
  
  // Create weighted array
  const weightedApps: typeof applications = []
  applications.forEach(app => {
    for (let i = 0; i < app.weight; i++) {
      weightedApps.push(app)
    }
  })
  
  const eventTypes: EventType[] = ["click", "navigation", "focus", "input", "load"]
  
  // Search queries for Google
  const searchQueries = [
    "SAP invoice management",
    "Salesforce lead conversion",
    "purchase order workflow",
    "financial reporting SAP",
    "customer relationship management",
    "sales pipeline optimization",
    "invoice processing automation",
    "deal tracking best practices"
  ]
  
  for (let i = 0; i < eventCount; i++) {
    const progress = i / eventCount
    const minutesFromStart = Math.floor(totalMinutes * progress)
    const hour = startHour + Math.floor(minutesFromStart / 60)
    const minute = minutesFromStart % 60
    const randomOffset = Math.floor(Math.random() * 15) - 7
    const finalMinute = Math.max(0, Math.min(59, minute + randomOffset))
    
    const app = weightedApps[Math.floor(Math.random() * weightedApps.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const domain = app.domains[Math.floor(Math.random() * app.domains.length)]
    
    let url = `https://${domain}`
    let title = ""
    let description = ""
    
    // Generate realistic URLs and titles based on application
    if (app.name === "SAP") {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/sap/bc/ui5_ui5/sap/${page.toLowerCase().replace(/\s+/g, '')}`
      title = page
      description = `Accessed ${page} in SAP`
    } else if (app.name === "Salesforce") {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/lightning/o/${page}/list`
      title = page
      description = `Viewed ${page} in Salesforce`
    } else if (app.name === "sapira.ai") {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}${page}`
      title = page.charAt(1).toUpperCase() + page.slice(2).replace("-", " ")
      description = `Navigated to ${title}`
    } else if (app.name === "Google") {
      if (Math.random() > 0.5) {
        // Search query
        const query = searchQueries[Math.floor(Math.random() * searchQueries.length)]
        url = `https://${domain}/search?q=${encodeURIComponent(query)}`
        title = `Search: ${query}`
        description = `Searched for "${query}"`
      } else {
        // Google service
        const page = app.pages[Math.floor(Math.random() * app.pages.length)]
        url = `https://${domain}/${page.toLowerCase().replace(/\s+/g, '')}`
        title = page
        description = `Opened ${page}`
      }
    } else if (app.name === "gmail.com") {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/mail/u/0/#${page.toLowerCase()}`
      title = page
      description = `Opened ${page}`
    } else if (app.name === "slack.com") {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/archives/${page}`
      title = `#${page}`
      description = `Opened ${page} channel`
    } else {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/${page.toLowerCase().replace(/\s+/g, '-')}`
      title = page
      description = `Opened ${page}`
    }
    
    const timestamp = new Date(baseTime + (hour * 60 + finalMinute) * 60 * 1000)
    const duration = (eventType === "focus" || eventType === "input") && Math.random() > 0.5
      ? (30000 + Math.random() * 120000)
      : undefined
    
    events.push({
      id: `${userId}-${date}-${i + 1}`,
      type: eventType,
      application: app.name,
      url,
      title,
      description,
      timestamp,
      userId,
      date,
      duration,
    })
  }
  
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const allEvents: UserEvent[] = []
for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
  const userIds = ["user-1", "user-2", "user-3"]
  userIds.forEach((userId) => {
    const events = generateDummyEvents(userId, daysAgo)
    allEvents.push(...events)
  })
}

function EventsList({ events, employees }: { events: UserEvent[], employees: Employee[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No events recorded</p>
      </div>
    )
  }

  const getUserInfo = (userId: string) => {
    const employee = employees.find(e => e.id === userId)
    if (employee) {
      return employee.email.split("@")[0] // Return username part of email
    }
    return null // Return null if no employee found, we'll conditionally render
  }

  // Calculate event context info for each event
  const getEventContext = (event: UserEvent, allEvents: UserEvent[]) => {
    const sameHourEvents = allEvents.filter(e => {
      const eventHour = new Date(event.timestamp).getHours()
      const eHour = new Date(e.timestamp).getHours()
      return e.application === event.application && 
             eHour === eventHour &&
             e.date === event.date
    }).length

    const sameTypeEvents = allEvents.filter(e => 
      e.type === event.type && 
      e.date === event.date
    ).length

    return {
      appEventsThisHour: sameHourEvents,
      typeEventsToday: sameTypeEvents,
    }
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--stroke)' }}>
      {events.map((event) => {
        const { Icon, color } = getEventTypeBadge(event.type)
        const userInfo = getUserInfo(event.userId)
        const context = getEventContext(event, events)
        
        return (
          <div
            key={event.id}
            className="px-6 py-3 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${color} shrink-0`}>
                <Icon className="h-3 w-3" />
                <span>{getEventTypeLabel(event.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">
                    {event.application}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(event.timestamp, "HH:mm:ss")}
                  </span>
                  {context.appEventsThisHour > 1 && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {context.appEventsThisHour}x this hour
                      </span>
                    </>
                  )}
                  {userInfo && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{userInfo}</span>
                    </>
                  )}
                </div>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline truncate block mb-1"
                >
                  {event.url}
                </a>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {event.title}
                </div>
                {event.description && (
                  <div className="text-xs text-gray-500">
                    {event.description}
                  </div>
                )}
                {event.duration && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Timer className="h-3 w-3" />
                    <span>Duration: {Math.round(event.duration / 1000)}s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DateSelector({
  selectedDate,
  onDateChange,
  availableDates,
}: {
  selectedDate: string
  onDateChange: (date: string) => void
  availableDates: string[]
}) {
  const currentIndex = availableDates.indexOf(selectedDate)
  const canGoPrev = currentIndex < availableDates.length - 1
  const canGoNext = currentIndex > 0

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    return format(date, "MMM d, yyyy")
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100"
        onClick={() => canGoPrev && onDateChange(availableDates[currentIndex + 1])}
        disabled={!canGoPrev}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <Select value={selectedDate} onValueChange={onDateChange}>
        <SelectTrigger className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg w-[200px]">
          <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
          <span>{formatDate(selectedDate)}</span>
        </SelectTrigger>
        <SelectContent>
          {availableDates.map((date) => (
            <SelectItem key={date} value={date}>
              {format(parseISO(date), "EEEE, MMM d, yyyy")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100"
        onClick={() => canGoNext && onDateChange(availableDates[currentIndex - 1])}
        disabled={!canGoNext}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function EmployeeSelector({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
}: {
  employees: Employee[]
  selectedEmployeeId: string | null
  onEmployeeChange: (id: string | null) => void
}) {
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId)
  
  return (
    <Select value={selectedEmployeeId || "all"} onValueChange={(v) => onEmployeeChange(v === "all" ? null : v)}>
      <SelectTrigger className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg min-w-[180px]">
        {selectedEmployee ? (
          <>
            <Avatar className="h-4 w-4">
              {selectedEmployee.avatar_url ? (
                <AvatarImage src={selectedEmployee.avatar_url} />
              ) : null}
              <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                {selectedEmployee.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium truncate">{selectedEmployee.name}</span>
          </>
        ) : (
          <>
            <Users className="h-3.5 w-3.5 text-gray-500" />
            <span>All employees</span>
          </>
        )}
      </SelectTrigger>
      <SelectContent className="text-xs">
        <SelectItem value="all" className="text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">All employees</span>
          </div>
        </SelectItem>
        {employees.map((emp) => (
          <SelectItem key={emp.id} value={emp.id} className="text-xs">
            <div className="flex items-center gap-2">
              <Avatar className="h-4 w-4">
                {emp.avatar_url ? (
                  <AvatarImage src={emp.avatar_url} />
                ) : null}
                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                  {emp.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-xs">{emp.name}</span>
                <span className="text-[10px] text-gray-500">{emp.email}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function UserMonitoringPage() {
  const { currentOrg } = useAuth()
  const [activeTab, setActiveTab] = useState<"events" | "team">("events")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [orgEmployees, setOrgEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  const availableDates = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), i), "yyyy-MM-dd")
  ).reverse()

  // Load organization users
  useEffect(() => {
    const loadOrgUsers = async () => {
      if (!currentOrg) {
        setLoadingEmployees(false)
        return
      }

      setLoadingEmployees(true)
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          setLoadingEmployees(false)
          return
        }

        const res = await fetch(`/api/org/users?organization_id=${currentOrg.organization.id}`, {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        })

        if (!res.ok) {
          console.error("Error loading org users")
          setLoadingEmployees(false)
          return
        }

        const data = await res.json()
        const users = (data.users || []).map((u: any) => ({
          id: u.auth_user_id || u.user?.id || "",
          name: u.user?.name || u.user?.first_name && u.user?.last_name 
            ? `${u.user.first_name} ${u.user.last_name}` 
            : u.user?.email?.split("@")[0] || "Unknown",
          email: u.user?.email || "",
          avatar_url: u.user?.avatar_url || null,
          monitoringEnabled: Math.random() > 0.3, // Dummy data
          lastActive: Math.random() > 0.5 ? new Date() : undefined,
          totalEvents: Math.floor(Math.random() * 1000),
          isRecording: Math.random() > 0.5,
        })).filter((u: Employee) => u.id)

        setOrgEmployees(users)
      } catch (error) {
        console.error("Error loading org users:", error)
      } finally {
        setLoadingEmployees(false)
      }
    }

    loadOrgUsers()
  }, [currentOrg])

  const filteredEvents = allEvents.filter(e => {
    if (selectedEmployeeId && e.userId !== selectedEmployeeId) return false
    if (e.date !== selectedDate) return false
    return true
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const teamStats = {
    totalUsers: orgEmployees.length,
    enabledUsers: orgEmployees.filter(e => e.monitoringEnabled).length,
    activeUsers: orgEmployees.filter(e => e.isRecording).length,
    usersWithEvents: orgEmployees.filter(e => (e.totalEvents || 0) > 0).length,
    totalEvents: orgEmployees.reduce((sum, e) => sum + (e.totalEvents || 0), 0),
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Discovery</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">User monitoring</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          {/* Toolbar with tabs and filters */}
          <div className="bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center justify-between h-full gap-4" style={{ height: 'var(--header-h)' }}>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-w-0 h-full flex items-end">
                <div className="flex items-center gap-4 w-full">
                  <TabsList className="relative h-auto w-fit gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                    <TabsTrigger
                      value="events"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      Events & metrics
                    </TabsTrigger>
                    <TabsTrigger
                      value="team"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      Team Configuration
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Filters - only show for events tab */}
                  {activeTab === "events" && (
                    <>
                      <div className="shrink-0 flex items-center">
                        <DateSelector
                          selectedDate={selectedDate}
                          onDateChange={setSelectedDate}
                          availableDates={availableDates}
                        />
              </div>
                      <div className="shrink-0 ml-auto flex items-center">
                        <EmployeeSelector
                          employees={orgEmployees}
                          selectedEmployeeId={selectedEmployeeId}
                          onEmployeeChange={setSelectedEmployeeId}
                        />
                </div>
                    </>
                  )}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>

              <TabsContent value="events" className="mt-0 space-y-6">
                {/* Quick Metrics Summary */}
                {filteredEvents.length > 0 && (() => {
                  const eventTypes = filteredEvents.reduce((acc, e) => {
                    acc[e.type] = (acc[e.type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const applications = filteredEvents.reduce((acc, e) => {
                    acc[e.application] = (acc[e.application] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const mostUsedApp = Object.entries(applications).sort((a, b) => b[1] - a[1])[0]
                  const totalDuration = filteredEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
                  const avgDuration = filteredEvents.filter(e => e.duration).length > 0
                    ? totalDuration / filteredEvents.filter(e => e.duration).length
                    : 0
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Total Events</span>
                      </div>
                        <div className="text-lg font-semibold text-gray-900">{filteredEvents.length}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Most Used App</span>
                      </div>
                        <div className="text-sm font-medium text-gray-900 truncate">{mostUsedApp?.[0] || "—"}</div>
                        <div className="text-xs text-gray-400">{mostUsedApp?.[1] || 0} events</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointerClick className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Top Event Type</span>
                      </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
                    </div>
                        <div className="text-xs text-gray-400">
                          {Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} occurrences
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Avg Duration</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {avgDuration > 0 ? `${Math.round(avgDuration / 1000)}s` : "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {filteredEvents.filter(e => e.duration).length} timed events
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Events List */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Events & metrics</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {filteredEvents.length} events recorded
                      </div>
                    </div>
                  </div>
                  <EventsList events={filteredEvents} employees={orgEmployees} />
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-0 space-y-6">
                {/* Team Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="border border-gray-200 rounded-lg bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Total Users</div>
                    <div className="text-2xl font-semibold text-gray-900">{teamStats.totalUsers}</div>
                      </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Monitoring Enabled</div>
                    <div className="text-2xl font-semibold text-gray-900">{teamStats.enabledUsers}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {teamStats.totalUsers > 0 
                        ? `${Math.round((teamStats.enabledUsers / teamStats.totalUsers) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Currently Recording</div>
                    <div className="text-2xl font-semibold text-gray-900">{teamStats.activeUsers}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`h-2 w-2 rounded-full ${teamStats.activeUsers > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-400">
                        {teamStats.activeUsers > 0 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Users with Events</div>
                    <div className="text-2xl font-semibold text-gray-900">{teamStats.usersWithEvents}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {teamStats.totalUsers > 0 
                        ? `${Math.round((teamStats.usersWithEvents / teamStats.totalUsers) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Total Events</div>
                    <div className="text-2xl font-semibold text-gray-900">{teamStats.totalEvents.toLocaleString()}</div>
                  </div>
                </div>

                {/* Users List */}
                <div className="border border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b border-dashed border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
                    </div>
                  </div>
                  <div>
                    {orgEmployees.length === 0 ? (
                      <div className="py-12 text-center text-gray-500">
                        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No team members found</p>
                      </div>
                    ) : (
                      orgEmployees.map((employee, index) => {
                        // Determine if user needs invite or notify
                        const needsInvite = !employee.monitoringEnabled
                        // Use a fixed date if lastActive is not available (to prevent continuous changes)
                        // Use employee ID hash to generate consistent date
                        const idHash = employee.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                        const daysAgo = idHash % 7
                        const lastActiveDate = employee.lastActive || subDays(new Date(), daysAgo)
                        
                        return (
                          <div 
                            key={employee.id} 
                            className={`px-6 py-4 hover:bg-gray-50/50 transition-colors ${index > 0 ? 'border-t border-dashed border-gray-300' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  {employee.avatar_url ? (
                                    <AvatarImage src={employee.avatar_url} />
                                  ) : null}
                                  <AvatarFallback className="bg-gray-100 text-gray-600">
                                    {employee.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-xs text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                    
                              <div className="flex items-center gap-4">
                                {/* Action Buttons - Now on the left */}
                                <div className="flex items-center gap-2">
                                  {needsInvite ? (
                                    <button
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                      onClick={() => {
                                        // TODO: Implement invite functionality
                                        console.log("Invite", employee.email)
                                      }}
                                    >
                                      <Mail className="h-3 w-3" />
                                      Invite
                                    </button>
                                  ) : (
                                    <button
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                      onClick={() => {
                                        // TODO: Implement notify functionality
                                        console.log("Notify", employee.email)
                                      }}
                                    >
                                      <Mail className="h-3 w-3" />
                                      Notify
                                    </button>
                                  )}
                                  <button
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    onClick={() => {
                                      // TODO: Implement view details functionality
                                      console.log("View details", employee.id)
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                    View details
                                  </button>
                                </div>
                                
                                {/* Status and Stats - Now on the right */}
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2">
                                    {employee.monitoringEnabled ? (
                                      <>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                                          Enabled
                                        </Badge>
                                        {employee.isRecording && (
                                          <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs text-gray-500">Recording</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200">
                                        Disabled
                                      </Badge>
                                    )}
                      </div>
                                  
                                  {/* Last Active - Always visible */}
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>Last active: {format(lastActiveDate, "MMM d, HH:mm")}</span>
                    </div>
                    
                                  {employee.totalEvents !== undefined && (
                                    <div className="text-xs text-gray-500">
                                      {employee.totalEvents.toLocaleString()} events
                                    </div>
                                  )}
                      </div>
                    </div>
                  </div>
                </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

