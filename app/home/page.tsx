"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  ResizableAppShell,
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Inbox,
  Target,
  Users,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Shield,
  MessageSquare,
  Mail,
  Repeat,
  Workflow,
  TrendingUp,
  Plug,
  Monitor,
  Timer,
  Info,
  ChevronRight,
  Activity,
  MousePointerClick,
  Navigation,
  Focus,
  User,
  ChevronDown,
  FileText,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"
import { format, subDays, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import { useDeployNotifications } from "@/hooks/use-deploy-notifications"

const OVERVIEW_METRICS = [
  { label: "Active issues", value: 24, delta: "+4 today", icon: Inbox },
  { label: "Active initiatives", value: 8, delta: "3 with blocks", icon: Target },
  { label: "New insights", value: 12, delta: "+30% week", icon: Sparkles },
  { label: "Automations in deploy", value: 5, delta: "2 pending QA", icon: BarChart3 },
]

// Types from insights page
type InsightType = "pattern" | "automation" | "efficiency" | "bottleneck" | "integration"
type EventType = "click" | "navigation" | "focus" | "error" | "load" | "input" | "meeting"
type IntegrationEventType = "invoice_created" | "invoice_updated" | "po_created" | "lead_created" | "deal_created" | "deal_updated" | "status_changed" | "note_added"

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
  source: "browser" | "meeting"
}

interface IntegrationEvent {
  id: string
  type: IntegrationEventType
  integration: "SAP" | "Salesforce"
  entity: string
  entityId: string
  userId?: string
  description: string
  timestamp: Date
  date: string
  metadata?: Record<string, any>
  source: "integration"
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
  relatedIntegrationEvents?: string[]
  dataSources: ("browser" | "integration")[]
  recommendation?: string
  validated?: boolean
}

// Helper functions from insights page
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
    case "integration":
      return Plug
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

const getInsightTypeLabel = (type: InsightType): string => {
  const labels: Record<InsightType, string> = {
    pattern: "Pattern",
    automation: "Automation",
    efficiency: "Efficiency",
    bottleneck: "Bottleneck",
    integration: "Integration",
  }
  return labels[type] || type
}

// Helper function to get issue type from core_technology or title
const getIssueType = (coreTechnology?: string, title?: string): string => {
  if (coreTechnology) {
    if (coreTechnology.includes("GenAI") || coreTechnology.includes("Predictive AI")) {
      return "AI"
    }
    if (coreTechnology.includes("RPA")) {
      return "Automation"
    }
    if (coreTechnology.includes("IDP")) {
      return "IDP"
    }
    if (coreTechnology.includes("Analytics")) {
      return "Analytics"
    }
  }
  
  // Infer from title if no core_technology
  const titleLower = title?.toLowerCase() || ""
  if (titleLower.includes("automatizar") || titleLower.includes("automation") || titleLower.includes("rpa")) {
    return "Automation"
  }
  if (titleLower.includes("ai") || titleLower.includes("inteligencia artificial")) {
    return "AI"
  }
  if (titleLower.includes("analytics") || titleLower.includes("análisis")) {
    return "Analytics"
  }
  
  return "Automation" // Default
}

// Things under review (from triage)
const THINGS_TO_REVIEW = [
  { 
    id: "SAI-244", 
    title: "Price discrepancy in EMEA catalog", 
    priority: "High", 
    owner: "Pricing", 
    assignee: "María García",
    businessUnit: "Pricing & Operations",
    project: "EMEA Catalog",
    labels: ["urgent", "pricing"],
    status: "Under review", 
    eta: "Today",
    origin: "teams",
    coreTechnology: "Predictive AI",
    createdAt: "2024-11-18T09:00:00Z"
  },
  { 
    id: "SAI-237", 
    title: "Automate weekly financial report", 
    priority: "Medium", 
    owner: "Finance",
    assignee: "Juan Pérez",
    businessUnit: "Finance",
    project: "Automation",
    labels: ["automation", "reports"],
    status: "Under review", 
    eta: "Tomorrow",
    origin: "email",
    coreTechnology: "RPA",
    createdAt: "2024-11-17T14:30:00Z"
  },
  { 
    id: "SAI-229", 
    title: "LATAM brokers onboarding", 
    priority: "Low", 
    owner: "Ops",
    assignee: null,
    businessUnit: "Operations",
    project: null,
    labels: ["onboarding"],
    status: "Under review", 
    eta: "This week",
    origin: "slack",
    coreTechnology: "GenAI",
    createdAt: "2024-11-16T11:15:00Z"
  },
]

// Meetings - past and upcoming
interface Meeting {
  id: string
  title: string
  date: string
  relativeDate: string
  time: string
  withFDE: boolean
  attendees?: string[]
  notes?: string
}

const PAST_MEETINGS: Meeting[] = [
  { id: "m1", title: "Weekly Meeting", date: "OCT 28", relativeDate: "3 weeks ago", time: "10:00-11:30", withFDE: true, attendees: ["María García", "Juan Pérez", "Ana López"], notes: "Discussed Q4 priorities and resource allocation. Key decisions: Focus on automation initiatives for pricing operations, allocate 2 developers to SAP integration project. Action items: María to review SAI-244 pricing catalog issue, Juan to prepare automation roadmap by next week. Blockers identified: Need approval from finance team for RPA budget increase." },
  { id: "m2", title: "Quarterly Meeting", date: "OCT 15", relativeDate: "5 weeks ago", time: "14:00-15:00", withFDE: true, attendees: ["María García", "Juan Pérez", "Ana López", "Carlos Ruiz"], notes: "Review of Q3 results and planning for Q4. Q3 achievements: 12 automations deployed, 45% reduction in manual tasks for finance team. Q4 goals: Launch GenAI pilot for broker onboarding, complete SAP integration phase 2, increase automation coverage by 30%. Budget approved for 3 new initiatives. Next review scheduled for mid-November." },
  { id: "m3", title: "Weekly Meeting", date: "NOV 4", relativeDate: "2 weeks ago", time: "11:00-12:00", withFDE: false, attendees: ["María García", "Juan Pérez"], notes: "Status update on ongoing initiatives. SAI-237 (financial report automation) is 80% complete, pending QA review. SAI-229 (broker onboarding) delayed due to API access issues with Salesforce. Action: Juan to follow up with IT team on API credentials. Next sync scheduled for Nov 11." },
]

const UPCOMING_MEETINGS: Meeting[] = [
  { id: "m4", title: "Weekly Meeting", date: "NOV 18", relativeDate: "Today", time: "10:00-11:30", withFDE: true, attendees: ["María García", "Juan Pérez", "Ana López"], notes: "Weekly sync on project progress and blockers. Agenda: Review SAI-244 pricing catalog issue status, discuss SAI-237 automation deployment timeline, address Salesforce API integration blockers for SAI-229. FDE will present new automation opportunities identified from user activity patterns. Expected outcomes: Prioritize Q4 initiatives, resolve current blockers, align on resource allocation." },
  { id: "m5", title: "Weekly Meeting", date: "NOV 25", relativeDate: "In 1 week", time: "10:00-11:30", withFDE: true, attendees: ["María García", "Juan Pérez", "Ana López"], notes: "Weekly sync and status review. Planned topics: Review automation metrics and ROI from deployed solutions, discuss GenAI pilot program kickoff, evaluate new insights from Discovery module. FDE will share recommendations for cross-platform workflow optimizations. Action items from previous meeting will be reviewed and updated." },
  { id: "m6", title: "Weekly Meeting", date: "DEC 2", relativeDate: "In 2 weeks", time: "10:00-11:30", withFDE: true, attendees: ["María García", "Juan Pérez"], notes: "Weekly standup and priority review. Focus areas: Mid-quarter progress assessment, review of automation deployment pipeline, discussion on scaling successful initiatives. Will review pending QA items and plan for December deployments. Resource planning for upcoming quarter will be initiated." },
  { id: "m7", title: "Quarterly Meeting", date: "DEC 15", relativeDate: "In 1 month", time: "14:00-16:00", withFDE: true, attendees: ["María García", "Juan Pérez", "Ana López", "Carlos Ruiz", "Laura Martínez"], notes: "Q4 planning session and strategic alignment. Comprehensive review of Q4 achievements, metrics analysis, and lessons learned. Strategic planning for Q1 2025: Define automation roadmap, identify high-impact opportunities, allocate budget and resources. FDE will present annual automation impact report and recommendations. Key stakeholders from finance, operations, and IT will align on priorities and timelines." },
]

// FDE contact info
const FDE_INFO = {
  name: "FDE",
  email: "fde@sapira.ai",
  role: "Forward Deploy Engineer",
}

// Meeting list component with toggle for details
function MeetingList({ meetings, isPast = false }: { meetings: Meeting[], isPast?: boolean }) {
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set())

  const toggleMeeting = (meetingId: string) => {
    const newExpanded = new Set(expandedMeetings)
    if (newExpanded.has(meetingId)) {
      newExpanded.delete(meetingId)
    } else {
      newExpanded.add(meetingId)
    }
    setExpandedMeetings(newExpanded)
  }

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => {
        const isExpanded = expandedMeetings.has(meeting.id)
        const hasDetails = (meeting.attendees && meeting.attendees.length > 0) || meeting.notes

        return (
          <div key={meeting.id} className={`${isPast ? 'opacity-60' : ''}`}>
            <div 
              className={`flex items-center gap-3 p-2 hover:bg-gray-50/80 rounded-lg transition-colors group ${hasDetails ? 'cursor-pointer' : ''}`}
              onClick={() => hasDetails && toggleMeeting(meeting.id)}
            >
              <Badge 
                variant="outline" 
                className={`text-[10px] font-medium shrink-0 ${
                  meeting.withFDE 
                    ? isPast
                      ? "bg-purple-50 border-purple-200 text-purple-500"
                      : "bg-purple-50 border-purple-200 text-purple-700"
                    : isPast
                      ? "bg-gray-50 border-gray-200 text-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {meeting.date}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium truncate ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>
                    {meeting.title}
                  </h3>
                  {meeting.withFDE && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 bg-purple-50 border-purple-200 ${isPast ? 'text-purple-500' : 'text-purple-600'}`}>
                      FDE
                    </Badge>
                  )}
                </div>
                <div className={`flex items-center gap-2 text-xs mt-0.5 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{meeting.relativeDate}</span>
                  <span className="text-gray-300">·</span>
                  <span>{meeting.time}</span>
                </div>
              </div>
              {hasDetails && (
                <ChevronDown 
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            
            <AnimatePresence>
              {isExpanded && hasDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 ml-11 space-y-2 pb-2"
                >
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Users className="h-3 w-3 text-gray-500" />
                        Attendees ({meeting.attendees.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.attendees.map((attendee, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-700 border-gray-200"
                          >
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {meeting.notes && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <FileText className="h-3 w-3 text-gray-500" />
                        Notes
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
                        {meeting.notes}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// Helper functions for event types
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
    case "meeting":
      return Calendar
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
    meeting: "Meeting",
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
    meeting: "bg-purple-50 text-purple-700 border-purple-200",
  }
  return { Icon, color: colors[type] || "bg-gray-50 text-gray-700 border-gray-200" }
}

// Component to display recent insights with better structure
function DiscoveryInsightsSection() {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [recentInsights, setRecentInsights] = useState<DailyInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  
  // Mock events data for demonstration
  const [mockEvents] = useState<UserEvent[]>(() => {
    const today = new Date()
    return [
      {
        id: "event-1",
        type: "navigation",
        application: "sapira.ai",
        url: "https://sapira.ai/insights",
        title: "Insights",
        description: "Navigated to Insights",
        timestamp: new Date(today.setHours(10, 30)),
        userId: "current-user",
        date: format(today, "yyyy-MM-dd"),
        source: "browser",
      },
      {
        id: "event-2",
        type: "click",
        application: "sapira.ai",
        url: "https://sapira.ai/triage-new",
        title: "Triage",
        description: "Clicked on Triage",
        timestamp: new Date(today.setHours(10, 35)),
        userId: "current-user",
        date: format(today, "yyyy-MM-dd"),
        source: "browser",
      },
    ]
  })
  
  const [mockIntegrationEvents] = useState<IntegrationEvent[]>(() => {
    const today = new Date()
    return [
      {
        id: "int-event-1",
        type: "invoice_created",
        integration: "SAP",
        entity: "Invoice",
        entityId: "INV-00123",
        description: "Nueva factura creada: INV-00123",
        timestamp: new Date(today.setHours(10, 32)),
        date: format(today, "yyyy-MM-dd"),
        source: "integration",
      },
    ]
  })

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights)
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId)
    } else {
      newExpanded.add(insightId)
    }
    setExpandedInsights(newExpanded)
  }

  useEffect(() => {
    // Generate insights for recent days - matching the same patterns as insights page
    const generateRecentInsights = async () => {
      setIsLoading(true)
      
      const insights: DailyInsight[] = []
      const today = format(new Date(), "yyyy-MM-dd")
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd")
      
      // Generate realistic insights based on common patterns from insights page
      // These match the same types of insights shown in /insights
      
      // Integration insight - SAP + Browser correlation
      insights.push({
        id: `insight-${today}-integration-1`,
        date: today,
        userId: "current-user",
        type: "integration",
        title: "SAP invoice activity correlates with Sapira usage",
        description: `We detected 5 SAP invoice events that occurred within 30 minutes of your Sapira OS activity. This suggests you're manually checking invoices after working in Sapira, indicating a potential workflow automation opportunity.`,
        impact: "high",
        frequency: 5,
        timeSaved: 3.0,
        confidence: 85,
        relatedEvents: [],
        relatedIntegrationEvents: [],
        dataSources: ["browser", "integration"],
        recommendation: "Consider creating an automated workflow that syncs SAP invoice status to Sapira OS, eliminating the need for manual checks",
        validated: true,
      })

      // Pattern insight - Cross-platform workflow
      insights.push({
        id: `insight-${today}-pattern-1`,
        date: today,
        userId: "current-user",
        type: "pattern",
        title: "Cross-platform workflow: Linear → Sapira",
        description: `We detected 8 instances where you switched between Linear and Sapira OS within short time intervals. This pattern suggests a manual workflow that could be automated through integration.`,
        impact: "medium",
        frequency: 8,
        timeSaved: 2.5,
        confidence: 88,
        relatedEvents: [],
        dataSources: ["browser"],
        recommendation: "Consider integrating Linear with Sapira OS to automatically sync issues and initiatives",
        validated: true,
      })

      // Efficiency insight - Email checking
      insights.push({
        id: `insight-${yesterday}-efficiency-1`,
        date: yesterday,
        userId: "current-user",
        type: "efficiency",
        title: "High email checking frequency",
        description: `We tracked 12 email access events throughout the day. This high frequency suggests batching email checks could improve focus time and reduce context switching.`,
        impact: "medium",
        frequency: 12,
        timeSaved: 1.0,
        confidence: 82,
        relatedEvents: [],
        dataSources: ["browser"],
        recommendation: "Schedule dedicated email check times (e.g., 3 times per day) to reduce context switching",
        validated: false,
      })

      // Integration insight - Salesforce deals after meetings
      insights.push({
        id: `insight-${today}-integration-2`,
        date: today,
        userId: "current-user",
        type: "integration",
        title: "Salesforce deal updates follow client meetings",
        description: `We detected 4 Salesforce deal updates that occurred within 1 hour after your meetings. This pattern suggests you're manually updating deals post-meeting, which could be automated with meeting transcription and AI extraction.`,
        impact: "high",
        frequency: 4,
        timeSaved: 5.0,
        confidence: 78,
        relatedEvents: [],
        relatedIntegrationEvents: [],
        dataSources: ["browser", "integration"],
        recommendation: "Automate deal updates by integrating meeting transcripts with Salesforce, using AI to extract key information",
        validated: true,
      })

      // Sort by impact (high first) and then by date (most recent first)
      insights.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 }
        const impactDiff = impactOrder[b.impact] - impactOrder[a.impact]
        if (impactDiff !== 0) return impactDiff
        return b.date.localeCompare(a.date)
      })

      // Show only top 1 insight
      setRecentInsights(insights.slice(0, 1))
      setIsLoading(false)
    }

    if (currentOrg) {
      generateRecentInsights()
    } else {
      setIsLoading(false)
    }
  }, [currentOrg])

  if (isLoading) {
    return (
      <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Discovery</p>
            <h2 className="text-sm font-semibold text-gray-900">Recent insights</h2>
          </div>
        </div>
        <div className="py-8 text-center">
          <RefreshCw className="h-6 w-6 text-gray-300 mx-auto mb-2 animate-spin" />
          <p className="text-xs text-gray-500">Loading insights...</p>
        </div>
      </section>
    )
  }

  if (recentInsights.length === 0) {
    return (
      <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Discovery</p>
            <h2 className="text-sm font-semibold text-gray-900">Recent insights</h2>
          </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 group"
          onClick={() => router.push("/insights")}
        >
          Open insights
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all duration-300" />
        </Button>
        </div>
        <div className="py-8 text-center">
          <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No insights available</p>
          <p className="text-[11px] text-gray-400 mt-1">Insights will appear here when patterns are detected</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Discovery</p>
          <h2 className="text-sm font-semibold text-gray-900">Recent insights</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 group"
          onClick={() => router.push("/insights")}
        >
          Open insights
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all duration-300" />
        </Button>
      </div>
      <div className="space-y-3">
        {recentInsights.map((insight) => {
          const isExpanded = expandedInsights.has(insight.id)
          
          // Get related events (mock for now - in production would filter from allEvents)
          const relatedEventsData = mockEvents.filter(e => insight.relatedEvents.includes(e.id) || insight.relatedEvents.length === 0)
          const relatedIntegrationEventsData = mockIntegrationEvents.filter(e => 
            insight.relatedIntegrationEvents?.includes(e.id) || (insight.dataSources.includes("integration") && insight.relatedIntegrationEvents?.length === 0)
          )
          
          // Count event types
          const eventTypes = relatedEventsData.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          const integrationEventTypes = relatedIntegrationEventsData.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          const applications = [...new Set(relatedEventsData.map(e => e.application))]
          const integrations = [...new Set(relatedIntegrationEventsData.map(e => e.integration))]
          
          return (
            <div 
              key={insight.id} 
              className="border border-gray-100 rounded-lg p-3 space-y-2.5 hover:bg-gray-50/50 transition-colors"
            >
              {/* Header with Automation badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-800 border-gray-300 font-medium shrink-0">
                    Automation
                  </Badge>
                </div>
                {insight.validated && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-800 border-gray-300 font-medium shrink-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                    Validated
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xs font-semibold text-gray-900 leading-snug">{insight.title}</h3>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>

              {/* Toggle to show events */}
              {(relatedEventsData.length > 0 || relatedIntegrationEventsData.length > 0) && (
                <div className="pt-2 border-t border-gray-100">
                  <div className={`border border-gray-200 rounded-lg p-3 space-y-2 ${isExpanded ? 'bg-gray-50' : ''}`}>
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleInsight(insight.id)
                      }}
                      className="w-full justify-between h-auto py-0 px-0 hover:bg-transparent hover:text-gray-900"
                    >
                      <span className="text-xs font-medium text-gray-700">
                        How we detected this
                      </span>
                      <ChevronRight 
                        className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </Button>
                    
                    {/* Labels in 2x2 grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {relatedEventsData.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-1.5 bg-gray-700 text-white border-gray-600 justify-center">
                          {relatedEventsData.length} browser events
                        </Badge>
                      )}
                      {relatedIntegrationEventsData.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-1.5 bg-blue-100 text-blue-800 border-blue-300 justify-center">
                          {relatedIntegrationEventsData.length} integration events
                        </Badge>
                      )}
                      {applications.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-1.5 bg-gray-50 text-gray-700 border-gray-200 justify-center">
                          {applications.length} apps
                        </Badge>
                      )}
                      {integrations.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-1.5 bg-gray-50 text-gray-700 border-gray-200 justify-center">
                          {integrations.length} integrations
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="mt-3 space-y-3 overflow-hidden"
                      >
                        {/* Event breakdown - organized in 2x2 grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {relatedEventsData.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <Monitor className="h-3 w-3 text-gray-500" />
                                Browser Events ({relatedEventsData.length})
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(eventTypes).map(([type, count]) => {
                                  const { Icon: EventIcon, color } = getEventTypeBadge(type as EventType)
                                  return (
                                    <div key={type} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${color}`}>
                                      <EventIcon className="h-2.5 w-2.5" />
                                      <span className="font-medium">{count}</span>
                                      <span>{getEventTypeLabel(type as EventType)}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {relatedIntegrationEventsData.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <Plug className="h-3 w-3 text-gray-500" />
                                Integration Events ({relatedIntegrationEventsData.length})
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(integrationEventTypes).map(([type, count]) => {
                                  const typeLabels: Record<string, string> = {
                                    invoice_created: "Invoice Created",
                                    invoice_updated: "Invoice Updated",
                                    po_created: "PO Created",
                                    lead_created: "Lead Created",
                                    deal_created: "Deal Created",
                                    deal_updated: "Deal Updated",
                                    status_changed: "Status Changed",
                                    note_added: "Note Added",
                                  }
                                  return (
                                    <div key={type} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border bg-blue-100 text-blue-800 border-blue-300">
                                      <Activity className="h-2.5 w-2.5" />
                                      <span className="font-medium">{count}</span>
                                      <span>{typeLabels[type] || type}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {applications.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <Monitor className="h-3 w-3 text-gray-500" />
                                Applications ({applications.length})
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {applications.map((app) => (
                                  <Badge key={app} variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-700 border-gray-200">
                                    {app}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {integrations.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <Plug className="h-3 w-3 text-gray-500" />
                                Integrations ({integrations.length})
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {integrations.map((integration) => (
                                  <Badge key={integration} variant="outline" className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                    {integration}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Events timeline */}
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                          {relatedEventsData.slice(0, 5).map((event) => {
                            const { Icon: EventIcon, color } = getEventTypeBadge(event.type)
                            return (
                              <div
                                key={event.id}
                                className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
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
                                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-gray-700 text-white border-gray-600 shrink-0">
                                  Browser
                                </Badge>
                              </div>
                            )
                          })}
                          
                          {relatedIntegrationEventsData.slice(0, 5).map((event) => {
                            return (
                              <div
                                key={event.id}
                                className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                              >
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-gray-50 text-gray-700 border-gray-200 shrink-0">
                                  <Activity className="h-2.5 w-2.5" />
                                  <span>{event.type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-900 truncate">
                                    {event.entity}: {event.entityId}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate">
                                    {event.integration} • {format(event.timestamp, "HH:mm:ss")}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-100 text-blue-800 border-blue-300 shrink-0">
                                  {event.integration}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )
        })}
        
        {/* View More Button */}
        {recentInsights.length > 0 && (
          <button
            onClick={() => router.push("/insights")}
            className="w-full py-2.5 px-4 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              View more
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300" />
          </button>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { notifications: DEPLOY_NOTIFICATIONS } = useDeployNotifications()
  
  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-900 font-medium">Home</span>
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          <div
            className="bg-gray-50/30"
            style={{ paddingLeft: "28px", paddingRight: "20px", paddingTop: "var(--header-padding-y)", paddingBottom: "var(--header-padding-y)" }}
          >
                        <motion.div 
                          className="grid grid-cols-2 md:grid-cols-4 gap-3"
                          initial="initial"
                          animate="animate"
                          variants={{
                            initial: { opacity: 0 },
                            animate: { 
                              opacity: 1,
                              transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                            }
                          }}
                        >
                              {OVERVIEW_METRICS.map((metric, idx) => {
                                const Icon = metric.icon
                                return (
                                  <motion.div 
                                    key={idx} 
                                    className="border border-gray-200 rounded-lg bg-white p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer card-hover"
                                    variants={{
                                      initial: { opacity: 0, y: 12 },
                                      animate: { 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] }
                                      }
                                    }}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{metric.label}</span>
                                      <Icon className="h-4 w-4 text-gray-300" />
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5">
                                      <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                                      <span className="text-[11px] text-gray-500">{metric.delta}</span>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </motion.div>
          </div>

          <div style={{ paddingLeft: "28px", paddingRight: "20px", paddingTop: "24px", paddingBottom: "24px" }} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-4">
                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Triage</p>
                      <h2 className="text-sm font-semibold text-gray-900">Things under review</h2>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-1 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 group"
                      onClick={() => router.push("/triage-new")}
                    >
                      Open triage
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all duration-300" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {THINGS_TO_REVIEW.map((item) => (
                      <div 
                        key={item.id} 
                        className="border border-gray-100 rounded-lg p-2.5 hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => router.push(`/issues/${item.id}`)}
                      >
                        {/* Header: ID + Title + ETA */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0.5">
                              {item.id}
                            </Badge>
                            <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 shrink-0">{item.eta}</span>
                        </div>
                        
                        {/* Compact badges row - 5-6 badges, larger size */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Type badge - stronger gray */}
                          <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-200 text-gray-800 border-gray-300 font-medium">
                            {getIssueType((item as any).coreTechnology, item.title)}
                          </Badge>
                          
                          {/* Status */}
                          <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200">
                            {item.status}
                          </Badge>
                          
                          {/* Owner */}
                          <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            {item.owner}
                          </Badge>
                          
                          {/* Assignee - only if exists */}
                          {item.assignee && (
                            <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1.5">
                              <User className="h-3 w-3" />
                              {item.assignee}
                            </Badge>
                          )}
                          
                          {/* Business Unit - only if exists */}
                          {item.businessUnit && (
                            <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1.5">
                              <Target className="h-3 w-3" />
                              {item.businessUnit}
                            </Badge>
                          )}
                          
                          {/* Project - only if exists */}
                          {item.project && (
                            <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1.5">
                              <BarChart3 className="h-3 w-3" />
                              {item.project}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Calendar</p>
                      <h2 className="text-sm font-semibold text-gray-900">Coming up</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 group">
                      Show more
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all duration-300" />
                    </Button>
                  </div>
                  
                  {/* Upcoming meetings */}
                  <MeetingList meetings={UPCOMING_MEETINGS} />

                  {/* Past meetings section */}
                  {PAST_MEETINGS.length > 0 && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Past meetings</p>
                        <MeetingList meetings={PAST_MEETINGS} isPast={true} />
                      </div>
                    </>
                  )}

                  {/* FDE contact info */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 border border-purple-200 shrink-0">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{FDE_INFO.name}</p>
                          <p className="text-[11px] text-gray-500">{FDE_INFO.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs gap-1.5 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:text-purple-800"
                          onClick={() => window.location.href = `mailto:${FDE_INFO.email}`}
                        >
                          <Mail className="h-3 w-3" />
                          Contact
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 border border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                          onClick={() => window.location.href = `mailto:${FDE_INFO.email}`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <DiscoveryInsightsSection />

                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Deploy</p>
                      <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs gap-1 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 group"
                      onClick={() => router.push("/metrics")}
                    >
                      View deploy
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all duration-300" />
                    </Button>
                  </div>
                  {DEPLOY_NOTIFICATIONS.length > 0 ? (
                    <div className="space-y-3">
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-xs font-medium text-gray-900 mb-1">
                          We need your intervention in the following:
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {DEPLOY_NOTIFICATIONS.length} {DEPLOY_NOTIFICATIONS.length === 1 ? 'item' : 'items'} requiring attention
                        </p>
                      </div>
                      <div className="space-y-2">
                        {DEPLOY_NOTIFICATIONS.map((item) => {
                          const Icon = item.icon
                          const isHighPriority = item.priority === "high"
                          
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all ${
                                isHighPriority 
                                  ? "border-red-200 bg-red-50/50 hover:bg-red-50" 
                                  : "border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50"
                              }`}
                              onClick={() => router.push(`/evals?notification=${item.id}`)}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Icon className={`h-4 w-4 shrink-0 ${isHighPriority ? "text-red-600" : "text-yellow-600"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium ${isHighPriority ? "text-red-900" : "text-yellow-900"}`}>
                                    {item.label}
                                  </p>
                                  <p className={`text-[11px] ${isHighPriority ? "text-red-700" : "text-yellow-700"} mt-0.5 line-clamp-1`}>
                                    {item.detail}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isHighPriority && (
                                  <Badge variant="outline" className="text-[10px] border-red-300 text-red-700 bg-red-100">
                                    Urgent
                                  </Badge>
                                )}
                                <ChevronRight className={`h-3.5 w-3.5 ${isHighPriority ? "text-red-600" : "text-yellow-600"}`} />
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No notifications</p>
                      <p className="text-[11px] text-gray-400 mt-1">Everything working correctly</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

