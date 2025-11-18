"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  Zap,
  Activity,
  Clock,
  MousePointerClick,
  Navigation,
  Focus,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Sparkles,
  Repeat,
  Workflow,
  Target,
  Users,
  Timer,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Calendar as CalendarIcon,
  Info,
  Monitor,
  Settings,
  ExternalLink,
  Shield,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"
import { format, subDays, parseISO, subMonths, startOfWeek, endOfWeek, startOfMonth } from "date-fns"
import { useRouter } from "next/navigation"

// Types
type EventType = "click" | "navigation" | "focus" | "error" | "load" | "input"
type InsightType = "pattern" | "automation" | "efficiency" | "bottleneck"

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

interface DailyInsight {
  id: string
  date: string
  userId: string
  type: InsightType
  title: string
  description: string
  impact: "high" | "medium" | "low"
  frequency: number
  timeSaved?: number
  confidence: number
  relatedEvents: string[]
  recommendation?: string
  validated?: boolean
}

interface Employee {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface DailyMetrics {
  date: string
  totalEvents: number
  clicks: number
  navigations: number
  errors: number
  avgSessionDuration: number
  activeTime: number
}

// Dummy data - will be replaced with real org users
const dummyEmployees: Employee[] = []

const generateDummyEvents = (userId: string, daysAgo: number): UserEvent[] => {
  const date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd")
  const baseTime = subDays(new Date(), daysAgo).getTime()
  const events: UserEvent[] = []
  
  // Simulate a realistic workday starting around 9 AM
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  
  // Generate 25-45 events per day with realistic distribution
  const eventCount = 25 + Math.floor(Math.random() * 20)
  const applications = [
    { name: "sapira.ai", domains: ["sapira.ai"] },
    { name: "linear.app", domains: ["linear.app"] },
    { name: "notion.so", domains: ["notion.so"] },
    { name: "slack.com", domains: ["slack.com"] },
    { name: "github.com", domains: ["github.com"] },
    { name: "gmail.com", domains: ["mail.google.com", "gmail.com"] },
    { name: "figma.com", domains: ["figma.com"] },
    { name: "confluence", domains: ["atlassian.net"] },
  ]
  
  const eventTypes: EventType[] = ["click", "navigation", "focus", "input", "load"]
  
  for (let i = 0; i < eventCount; i++) {
    const progress = i / eventCount
    const minutesFromStart = Math.floor(totalMinutes * progress)
    const hour = startHour + Math.floor(minutesFromStart / 60)
    const minute = minutesFromStart % 60
    
    // Add some randomness to make it more natural
    const randomOffset = Math.floor(Math.random() * 15) - 7 // -7 to +7 minutes
    const finalMinute = Math.max(0, Math.min(59, minute + randomOffset))
    
    const app = applications[Math.floor(Math.random() * applications.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const domain = app.domains[Math.floor(Math.random() * app.domains.length)]
    
    // Generate realistic URLs and titles
    let url = `https://${domain}`
    let title = ""
    let description = ""
    
    if (app.name === "sapira.ai") {
      const pages = ["/insights", "/triage-new", "/initiatives", "/projects", "/issues", "/metrics"]
      const page = pages[Math.floor(Math.random() * pages.length)]
      url = `https://${domain}${page}`
      title = page.charAt(1).toUpperCase() + page.slice(2).replace("-", " ")
      description = `Navigated to ${title}`
    } else if (app.name === "linear.app") {
      const projects = ["Product & Tech", "Design System", "Mobile App", "Backend Services"]
      const project = projects[Math.floor(Math.random() * projects.length)]
      url = `https://${domain}/project/${project.toLowerCase().replace(" ", "-")}`
      title = `${project} > Overview`
      description = `Opened ${project} project`
    } else if (app.name === "gmail.com") {
      url = `https://${domain}/mail/u/0/#inbox`
      title = "Inbox"
      description = "Opened email inbox"
    } else if (app.name === "slack.com") {
      const channels = ["general", "engineering", "product", "design"]
      const channel = channels[Math.floor(Math.random() * channels.length)]
      url = `https://${domain}/archives/${channel}`
      title = `#${channel}`
      description = `Opened ${channel} channel`
    } else {
      url = `https://${domain}`
      title = app.name.charAt(0).toUpperCase() + app.name.slice(1)
      description = `Opened ${app.name}`
    }
    
    const timestamp = new Date(baseTime + (hour * 60 + finalMinute) * 60 * 1000)
    
    // Some events have duration (focus, input)
    const duration = (eventType === "focus" || eventType === "input") && Math.random() > 0.5
      ? (30000 + Math.random() * 120000) // 30s to 2.5min
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
  
  // Sort by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const generateDummyInsights = (userId: string, date: string, daysAgo: number, events: UserEvent[]): DailyInsight[] => {
  const insights: DailyInsight[] = []
  
  // Analyze events to generate realistic insights
  const sapiraEvents = events.filter(e => e.application === "sapira.ai")
  const linearEvents = events.filter(e => e.application === "linear.app")
  const emailEvents = events.filter(e => e.application === "gmail.com")
  const slackEvents = events.filter(e => e.application === "slack.com")
  
  // Pattern: Linear → Sapira workflow
  if (linearEvents.length > 0 && sapiraEvents.length > 0) {
    const frequency = Math.min(linearEvents.length, sapiraEvents.length)
    if (frequency >= 3) {
      insights.push({
        id: `${userId}-${date}-insight-1`,
        date,
        userId,
        type: "pattern",
        title: "Cross-platform workflow: Linear → Sapira",
        description: `We detected ${frequency} instances where you switched between Linear and Sapira OS within short time intervals. This pattern suggests a manual workflow that could be automated through integration.`,
        impact: frequency >= 8 ? "high" : frequency >= 5 ? "medium" : "low",
        frequency,
        timeSaved: 2.5,
        confidence: 85 + Math.floor(Math.random() * 10),
        relatedEvents: [...linearEvents.slice(0, 3).map(e => e.id), ...sapiraEvents.slice(0, 2).map(e => e.id)],
        recommendation: "Consider integrating Linear with Sapira OS to automatically sync issues and initiatives",
        validated: daysAgo <= 3,
      })
    }
  }
  
  // Pattern: Repetitive navigation patterns
  const navigationPatterns = new Map<string, number>()
  events.forEach(e => {
    if (e.type === "navigation") {
      const key = `${e.application}-${e.url}`
      navigationPatterns.set(key, (navigationPatterns.get(key) || 0) + 1)
    }
  })
  
  navigationPatterns.forEach((count, key) => {
    if (count >= 5) {
      const [app, url] = key.split("-", 2)
      const event = events.find(e => e.application === app && e.url === url)
      if (event) {
        insights.push({
          id: `${userId}-${date}-insight-nav-${insights.length + 1}`,
          date,
          userId,
          type: "automation",
          title: `Frequent navigation to ${event.title}`,
          description: `We observed ${count} navigation events to "${event.title}" throughout the day. This repetitive pattern indicates an opportunity to streamline access through bookmarks or shortcuts.`,
          impact: count >= 10 ? "high" : "medium",
          frequency: count,
          timeSaved: 0.5,
          confidence: 75 + Math.floor(Math.random() * 15),
          relatedEvents: events.filter(e => e.application === app && e.url === url).slice(0, 5).map(e => e.id),
          recommendation: `Create a keyboard shortcut or bookmark for quick access to ${event.title}`,
          validated: daysAgo <= 2,
        })
      }
    }
  })
  
  // Pattern: Email checking frequency
  if (emailEvents.length >= 8) {
    insights.push({
      id: `${userId}-${date}-insight-email`,
      date,
      userId,
      type: "efficiency",
      title: "High email checking frequency",
      description: `We tracked ${emailEvents.length} email access events throughout the day. This high frequency suggests batching email checks could improve focus time and reduce context switching.`,
      impact: emailEvents.length >= 15 ? "high" : "medium",
      frequency: emailEvents.length,
      timeSaved: 1.0,
      confidence: 80 + Math.floor(Math.random() * 10),
      relatedEvents: emailEvents.slice(0, 5).map(e => e.id),
      recommendation: "Schedule dedicated email check times (e.g., 3 times per day) to reduce context switching",
      validated: daysAgo <= 4,
    })
  }
  
  // Pattern: Context switching between tools
  const appSwitches = events.filter((e, i) => i > 0 && e.application !== events[i - 1].application).length
  if (appSwitches >= 20) {
    insights.push({
      id: `${userId}-${date}-insight-switching`,
      date,
      userId,
      type: "bottleneck",
      title: "High context switching detected",
      description: `We detected ${appSwitches} application switches across ${new Set(events.map(e => e.application)).size} different tools today. This frequent context switching pattern may impact productivity and focus.`,
      impact: appSwitches >= 30 ? "high" : "medium",
      frequency: appSwitches,
      timeSaved: 0.3,
      confidence: 70 + Math.floor(Math.random() * 15),
      relatedEvents: events.filter((e, i) => i > 0 && e.application !== events[i - 1].application).slice(0, 10).map(e => e.id),
      recommendation: "Group related tasks together and use focus blocks to reduce context switching overhead",
      validated: daysAgo <= 3,
    })
  }
  
  // Pattern: Long focus sessions
  const focusEvents = events.filter(e => e.type === "focus" && e.duration && e.duration > 300000) // > 5 min
  if (focusEvents.length >= 3) {
    insights.push({
      id: `${userId}-${date}-insight-focus`,
      date,
      userId,
      type: "efficiency",
      title: "Deep work sessions identified",
      description: `We identified ${focusEvents.length} extended focus sessions (5+ minutes each) today. These deep work periods demonstrate high productivity potential and should be protected.`,
      impact: "medium",
      frequency: focusEvents.length,
      timeSaved: 0,
      confidence: 90 + Math.floor(Math.random() * 8),
      relatedEvents: focusEvents.slice(0, 3).map(e => e.id),
      recommendation: "Schedule more deep work blocks during times when focus sessions naturally occur",
      validated: daysAgo <= 5,
    })
  }
  
  // Limit to 3-5 insights per day
  return insights.slice(0, 3 + Math.floor(Math.random() * 3)).sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 }
    return impactOrder[b.impact] - impactOrder[a.impact]
  })
}

// Generate data for last 7 days
const allEvents: UserEvent[] = []
const allInsights: DailyInsight[] = []
const allMetrics: DailyMetrics[] = []

// Generate events first, then insights based on events
for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
  const date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd")
  
  // Generate events for dummy employees (will be replaced with real org users later)
  const userIds = ["user-1", "user-2", "user-3"] // Placeholder until org users load
  userIds.forEach((userId) => {
    const events = generateDummyEvents(userId, daysAgo)
    allEvents.push(...events)
    
    // Generate insights based on the events
    const dayEvents = events.filter(e => e.date === date)
    const insights = generateDummyInsights(userId, date, daysAgo, dayEvents)
    allInsights.push(...insights)
  })
  
  const dayEvents = allEvents.filter(e => e.date === date)
  const sessions = calculateSessions(dayEvents)
  const avgSessionDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60000)
    : 0
  const activeTime = Math.round(dayEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / 60000)
  
  allMetrics.push({
    date,
    totalEvents: dayEvents.length,
    clicks: dayEvents.filter(e => e.type === "click").length,
    navigations: dayEvents.filter(e => e.type === "navigation").length,
    errors: dayEvents.filter(e => e.type === "error").length,
    avgSessionDuration,
    activeTime,
  })
}

// Helper function to calculate sessions from events
function calculateSessions(events: UserEvent[]): Array<{ start: Date; end: Date; duration: number }> {
  if (events.length === 0) return []
  
  const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  const sessions: Array<{ start: Date; end: Date; duration: number }> = []
  let currentSessionStart: Date | null = null
  let currentSessionEnd: Date | null = null
  
  sortedEvents.forEach(event => {
    if (currentSessionStart === null) {
      currentSessionStart = event.timestamp
      currentSessionEnd = event.timestamp
    } else {
      if (currentSessionEnd === null) {
        currentSessionEnd = event.timestamp
      } else {
        const timeSinceLastEvent = event.timestamp.getTime() - currentSessionEnd.getTime()
        // If more than 30 minutes gap, start new session
        if (timeSinceLastEvent > 30 * 60 * 1000) {
          sessions.push({
            start: currentSessionStart,
            end: currentSessionEnd,
            duration: currentSessionEnd.getTime() - currentSessionStart.getTime(),
          })
          currentSessionStart = event.timestamp
          currentSessionEnd = event.timestamp
        } else {
          currentSessionEnd = event.timestamp
        }
      }
    }
  })
  
  if (currentSessionStart !== null && currentSessionEnd !== null) {
    const startDate: Date = currentSessionStart
    const endDate: Date = currentSessionEnd
    sessions.push({
      start: startDate,
      end: endDate,
      duration: endDate.getTime() - startDate.getTime(),
    })
  }
  
  return sessions
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

const getInsightTypeIcon = (type: InsightType) => {
  switch (type) {
    case "pattern":
      return Repeat
    case "automation":
      return Workflow
    case "efficiency":
      return TrendingUp
    case "bottleneck":
      return AlertCircle
    default:
      return Sparkles
  }
}

const getImpactBadge = (impact: "high" | "medium" | "low") => {
  const colors = {
    high: "bg-gray-900 text-white border-gray-900",
    medium: "bg-gray-100 text-gray-900 border-gray-200",
    low: "bg-gray-50 text-gray-600 border-gray-200",
  }
  return colors[impact]
}

// Components
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

function DateSelector({
  type,
  selectedDate,
  onDateChange,
  availableDates,
}: {
  type: "day" | "week" | "month"
  selectedDate: string
  onDateChange: (date: string) => void
  availableDates: string[]
}) {
  const currentIndex = availableDates.indexOf(selectedDate)
  const canGoPrev = currentIndex < availableDates.length - 1
  const canGoNext = currentIndex > 0

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (type === "day") {
      return format(date, "MMM d, yyyy")
    } else if (type === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
    } else {
      return format(date, "MMMM yyyy")
    }
  }

  const formatSelectItem = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (type === "day") {
      return format(date, "EEEE, MMM d, yyyy")
    } else if (type === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
      return `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
    } else {
      return format(date, "MMMM yyyy")
    }
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
              {formatSelectItem(date)}
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

function EventsList({ events }: { events: UserEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No events recorded for this day</p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--stroke)' }}>
      {events.map((event) => {
        const { Icon, color } = getEventTypeBadge(event.type)
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {event.application}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(event.timestamp, "HH:mm:ss")}
                  </span>
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

function InsightsList({ insights, allEvents }: { insights: DailyInsight[], allEvents: UserEvent[] }) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights)
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId)
    } else {
      newExpanded.add(insightId)
    }
    setExpandedInsights(newExpanded)
  }

  if (insights.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No insights generated for this day</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const Icon = getInsightTypeIcon(insight.type)
        const relatedEventsData = allEvents.filter(e => insight.relatedEvents.includes(e.id))
        const isExpanded = expandedInsights.has(insight.id)
        
        // Analyze events to show evidence
        const eventTypes = relatedEventsData.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const applications = [...new Set(relatedEventsData.map(e => e.application))]
        const timeRange = relatedEventsData.length > 0 ? {
          start: new Date(Math.min(...relatedEventsData.map(e => e.timestamp.getTime()))),
          end: new Date(Math.max(...relatedEventsData.map(e => e.timestamp.getTime())))
        } : null

        return (
          <div
            key={insight.id}
            className="border border-gray-200 rounded-lg bg-white"
          >
            <div className="p-4">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
                  {insight.validated && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Validated
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3">
                <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                  <div className="text-xs text-gray-500 mb-0.5">Frequency</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {insight.frequency}/day
                  </div>
                </div>
                {insight.timeSaved && (
                  <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                    <div className="text-xs text-gray-500 mb-0.5">Time Saved</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {insight.timeSaved} min/occurrence
                    </div>
                  </div>
                )}
                <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                  <div className="text-xs text-gray-500 mb-0.5">Confidence</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {insight.confidence}%
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                  <div className="text-xs text-gray-500 mb-0.5">Daily Savings</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {insight.timeSaved && insight.frequency
                      ? `${Math.round(insight.timeSaved * insight.frequency)} min`
                      : "—"}
                  </div>
                </div>
              </div>
              
              {/* How we detected this */}
              {relatedEventsData.length > 0 && (
                <div className="mt-3 pt-3">
                  <Button
                    variant="outline"
                    onClick={() => toggleInsight(insight.id)}
                    className={`w-full justify-between h-auto py-2 px-3 hover:bg-gray-100 hover:text-gray-900 ${isExpanded ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">
                        How we detected this
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {relatedEventsData.length} events
                      </Badge>
                      {applications.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {applications.length} applications
                        </Badge>
                      )}
                    </div>
                    <ChevronRight 
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </Button>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 space-y-3"
                    >
                      {/* Event breakdown */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(eventTypes).map(([type, count]) => {
                          const { Icon: EventIcon, color } = getEventTypeBadge(type as EventType)
                          return (
                            <div key={type} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${color}`}>
                              <EventIcon className="h-3 w-3" />
                              <span className="font-medium">{count}</span>
                              <span>{getEventTypeLabel(type as EventType)}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Related events timeline */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {relatedEventsData.slice(0, 8).map((event) => {
                          const { Icon: EventIcon, color } = getEventTypeBadge(event.type)
                          return (
                            <div
                              key={event.id}
                              className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-white hover:bg-gray-50/50 transition-colors"
                            >
                              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${color} shrink-0`}>
                                <EventIcon className="h-2.5 w-2.5" />
                                <span>{getEventTypeLabel(event.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  {event.title}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {event.application} • {format(event.timestamp, "HH:mm:ss")}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {relatedEventsData.length > 8 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{relatedEventsData.length - 8} more events
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              
              {insight.recommendation && (
                <div className="mt-3 pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-auto py-2 px-3 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div className="flex items-center gap-1.5 text-left">
                      <span className="text-xs font-medium text-gray-700">Recommendation - </span>
                      <span className="text-xs text-gray-600">{insight.recommendation}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                      <span>Request it</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UserMonitoringInfo() {
  const router = useRouter()

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 shrink-0">
            <Monitor className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">User monitoring</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-700 border-gray-200">
                Extensión del navegador
              </Badge>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              La extensión User monitoring rastrea automáticamente la actividad de los usuarios para generar insights sobre patrones de trabajo, oportunidades de automatización y cuellos de botella operativos.
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/user-monitoring')}
              className="h-7 text-xs gap-1.5 border-dashed hover:bg-gray-100 hover:text-gray-900"
            >
              Ver detalles y setup
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DailyMetricsCards({ metrics, previousMetrics }: { metrics: DailyMetrics, previousMetrics?: DailyMetrics }) {
  const getChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return change
  }

  const metricsData = [
    { label: "Total Events", value: metrics.totalEvents, icon: Activity, previous: previousMetrics?.totalEvents },
    { label: "Clicks", value: metrics.clicks, icon: MousePointerClick, previous: previousMetrics?.clicks },
    { label: "Navigations", value: metrics.navigations, icon: Navigation, previous: previousMetrics?.navigations },
    { label: "Errors", value: metrics.errors, icon: AlertCircle, previous: previousMetrics?.errors },
    { label: "Avg Session", value: `${metrics.avgSessionDuration}m`, icon: Timer, previous: previousMetrics?.avgSessionDuration },
    { label: "Active Time", value: `${metrics.activeTime}m`, icon: Clock, previous: previousMetrics?.activeTime },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metricsData.map((metric, idx) => {
        const Icon = metric.icon
        const change = getChange(typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value, metric.previous)
        return (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg bg-white p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs text-gray-500">{metric.label}</div>
              {change !== null && (
                <div className={`flex items-center gap-0.5 text-xs ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : change < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {metric.value}
              </div>
              <Icon className="h-5 w-5 opacity-40 text-gray-400" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeeklySummary({ 
  insights, 
  selectedEmployeeId,
  period = "week"
}: { 
  insights: DailyInsight[]
  selectedEmployeeId: string | null
  period?: "week" | "month"
}) {
  const insightsByType = new Map<string, DailyInsight[]>()
  
  insights.forEach(insight => {
    if (selectedEmployeeId && insight.userId !== selectedEmployeeId) return
    
    const key = `${insight.type}-${insight.title}`
    if (!insightsByType.has(key)) {
      insightsByType.set(key, [])
    }
    insightsByType.get(key)!.push(insight)
  })

  const validatedInsights = Array.from(insightsByType.values())
    .filter(group => group.length >= (period === "month" ? 5 : 3))
    .map(group => ({
      ...group[0],
      occurrences: group.length,
      avgFrequency: group.reduce((acc, i) => acc + i.frequency, 0) / group.length,
      avgTimeSaved: group.reduce((acc, i) => acc + (i.timeSaved || 0), 0) / group.length,
      totalTimeSaved: group.reduce((acc, i) => acc + (i.timeSaved || 0) * i.frequency, 0),
      avgConfidence: group.reduce((acc, i) => acc + i.confidence, 0) / group.length,
    }))
    .sort((a, b) => b.totalTimeSaved - a.totalTimeSaved)

  // Calculate summary metrics
  const totalInsights = insights.length
  const totalTimeSaved = insights.reduce((acc, i) => acc + (i.timeSaved || 0) * i.frequency, 0)
  const avgConfidence = insights.length > 0 
    ? insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length 
    : 0
  const uniquePatterns = new Set(insights.map(i => `${i.type}-${i.title}`)).size

  if (validatedInsights.length === 0 && totalInsights === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No patterns validated yet</p>
        <p className="text-xs text-gray-400 mt-1">Continue tracking to identify consistent behaviors</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Total Insights</div>
          <div className="text-lg font-semibold text-gray-900">{totalInsights}</div>
          <div className="text-xs text-gray-400 mt-1">{validatedInsights.length} validated</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Time Saved</div>
          <div className="text-lg font-semibold text-gray-900">{Math.round(totalTimeSaved)} min</div>
          <div className="text-xs text-gray-400 mt-1">{period === "month" ? "this month" : "this week"}</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Unique Patterns</div>
          <div className="text-lg font-semibold text-gray-900">{uniquePatterns}</div>
          <div className="text-xs text-gray-400 mt-1">patterns detected</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Avg Confidence</div>
          <div className="text-lg font-semibold text-gray-900">{Math.round(avgConfidence)}%</div>
          <div className="text-xs text-gray-400 mt-1">across all insights</div>
        </div>
      </div>

      {/* Validated Patterns */}
      {validatedInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Validated Patterns ({validatedInsights.length})
              </h3>
            </div>
            <div className="text-xs text-gray-500">
              Appearing {period === "month" ? "5+" : "3+"} days consistently
            </div>
          </div>
          
          {validatedInsights.map((insight, idx) => {
            const Icon = getInsightTypeIcon(insight.type)
            const periodMultiplier = period === "month" ? 20 : 5
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg bg-white"
              >
                <div className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {insight.occurrences} days
                      </div>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        {Math.round(insight.avgConfidence)}% confidence
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Avg Frequency</div>
                      <div className="text-sm font-semibold text-gray-900">{insight.avgFrequency.toFixed(1)}/day</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Time Saved</div>
                      <div className="text-sm font-semibold text-gray-900">{insight.avgTimeSaved.toFixed(1)} min</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                      <div className="text-xs text-gray-500 mb-0.5">{period === "month" ? "Monthly" : "Weekly"} Savings</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {Math.round(insight.avgTimeSaved * insight.avgFrequency * periodMultiplier)} min
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Total Impact</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {Math.round(insight.totalTimeSaved)} min
                      </div>
                    </div>
                  </div>
                  
                  {insight.recommendation && (
                    <div className="mt-3 pt-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-auto py-2 px-3 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <div className="flex items-center gap-1.5 text-left">
                          <span className="text-xs font-medium text-gray-700">Recommendation - </span>
                          <span className="text-xs text-gray-600">{insight.recommendation}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                          <span>Request it</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function InsightsPage() {
  const { currentOrg } = useAuth()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"))
  const [selectedMonth, setSelectedMonth] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day")
  const [innerTab, setInnerTab] = useState<"events" | "insights">("events")
  const [orgEmployees, setOrgEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const availableDates = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), i), "yyyy-MM-dd")
  ).reverse()

  const availableWeeks = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 })
    return format(weekStart, "yyyy-MM-dd")
  }).reverse()

  const availableMonths = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), i))
    return format(monthStart, "yyyy-MM-dd")
  }).reverse()

  const getCurrentDate = () => {
    if (activeTab === "day") return selectedDate
    if (activeTab === "week") return selectedWeek
    return selectedMonth
  }

  const getAvailableDates = () => {
    if (activeTab === "day") return availableDates
    if (activeTab === "week") return availableWeeks
    return availableMonths
  }

  const handleDateChange = (date: string) => {
    if (activeTab === "day") setSelectedDate(date)
    else if (activeTab === "week") setSelectedWeek(date)
    else setSelectedMonth(date)
  }

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
        })).filter((u: Employee) => u.id) // Filter out invalid users

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
    if (activeTab === "day" && e.date !== selectedDate) return false
    return true
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const filteredInsights = allInsights.filter(i => {
    if (selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    if (activeTab === "day" && i.date !== selectedDate) return false
    return true
  })

  const currentMetrics = allMetrics.find(m => m.date === selectedDate)
  const previousMetrics = allMetrics.find(m => {
    const currentIdx = availableDates.indexOf(selectedDate)
    return currentIdx > 0 && m.date === availableDates[currentIdx - 1]
  })

  const weeklyInsights = allInsights.filter(i => {
    if (selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    const insightDate = parseISO(i.date)
    const weekAgo = subDays(new Date(), 7)
    return insightDate >= weekAgo
  })

  const monthlyInsights = allInsights.filter(i => {
    if (selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    const insightDate = parseISO(i.date)
    const monthAgo = subMonths(new Date(), 1)
    return insightDate >= monthAgo
  })

  useEffect(() => {
    if (!loadingEmployees) {
      setIsLoading(false)
    }
  }, [loadingEmployees])

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Discovery</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Insights</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-900">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-900">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-32"
            >
              <Spinner size="lg" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="-mx-5 -mt-4"
            >
          {/* Toolbar with tabs and date selector */}
          <div className="bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center justify-between h-full gap-4" style={{ height: 'var(--header-h)' }}>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "day" | "week" | "month")} className="flex-1 min-w-0 h-full flex items-end">
                <div className="flex items-center gap-4 w-full">
                  <TabsList className="relative h-auto w-fit gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                    <TabsTrigger
                      value="day"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      <CalendarDays
                        className="opacity-60 shrink-0"
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Daily View
                    </TabsTrigger>
                    <TabsTrigger
                      value="week"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      <BarChart3
                        className="opacity-60 shrink-0"
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Weekly Summary
                    </TabsTrigger>
                    <TabsTrigger
                      value="month"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      <CalendarIcon
                        className="opacity-60 shrink-0"
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Monthly Summary
                    </TabsTrigger>
                  </TabsList>
                  <div className="shrink-0 flex items-center">
                    <DateSelector
                      type={activeTab}
                      selectedDate={getCurrentDate()}
                      onDateChange={handleDateChange}
                      availableDates={getAvailableDates()}
                    />
                  </div>
                  <div className="shrink-0 ml-auto flex items-center">
                    <EmployeeSelector
                      employees={orgEmployees}
                      selectedEmployeeId={selectedEmployeeId}
                      onEmployeeChange={setSelectedEmployeeId}
                    />
                  </div>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "day" | "week" | "month")}>
              <TabsContent value="day" className="mt-0">
                <div className="space-y-6">
                  {/* USER Monitoring Info */}
                  <UserMonitoringInfo />

                  {/* Daily Metrics */}
                  {currentMetrics && (
                    <DailyMetricsCards 
                      metrics={currentMetrics} 
                      previousMetrics={previousMetrics}
                    />
                  )}

                  {/* Events and Insights Tabs */}
                  <Tabs value={innerTab} onValueChange={(v) => setInnerTab(v as "events" | "insights")} className="w-full">
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                      <div className="bg-gray-50/30">
                        <div className="flex items-center justify-between">
                          <TabsList className="relative h-auto w-full gap-0.5 bg-transparent p-0 pl-44 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                            <TabsTrigger 
                              value="events" 
                              className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-1.5 px-3 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                            >
                              <Activity
                                className="opacity-60 shrink-0"
                                size={14}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              Events & Metrics
                            </TabsTrigger>
                            <TabsTrigger 
                              value="insights" 
                              className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-1.5 px-3 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                            >
                              <Sparkles
                                className="opacity-60 shrink-0"
                                size={14}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              Daily Insights
                            </TabsTrigger>
                          </TabsList>
                          <div className="px-6 py-2 flex items-center">
                            <div className="text-xs text-gray-500">
                              {innerTab === "events" 
                                ? `${filteredEvents.length} events recorded`
                                : `${filteredInsights.length} insights generated`
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      <TabsContent value="events" className="mt-0">
                        <EventsList events={filteredEvents} />
                      </TabsContent>

                      <TabsContent value="insights" className="mt-0 p-6">
                        <div className="space-y-4">
                          {filteredInsights.length > 0 && (
                            <div className="border border-gray-200 rounded-lg bg-white p-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-900">Daily Summary</span>
                                <span className="text-xs text-gray-500">
                                  {filteredInsights.length} insights generated for {format(parseISO(selectedDate), "MMMM d, yyyy")}. 
                                  Estimated time savings: {filteredInsights.reduce((acc, i) => acc + (i.timeSaved || 0) * i.frequency, 0).toFixed(0)} minutes.
                                </span>
                              </div>
                            </div>
                          )}
                          <InsightsList insights={filteredInsights} allEvents={allEvents} />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                <WeeklySummary 
                  insights={weeklyInsights}
                  selectedEmployeeId={selectedEmployeeId}
                  period="week"
                />
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                <WeeklySummary 
                  insights={monthlyInsights}
                  selectedEmployeeId={selectedEmployeeId}
                  period="month"
                />
              </TabsContent>
            </Tabs>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
