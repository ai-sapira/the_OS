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
  Plug,
  ChevronDown,
  Check,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/context/auth-context"
import { supabase } from "@/lib/supabase/client"
import { format, subDays, parseISO, subMonths, startOfWeek, endOfWeek, startOfMonth } from "date-fns"
import { useRouter } from "next/navigation"
import { ProjectsAPI } from "@/lib/api/projects"

// Types
type EventType = "click" | "navigation" | "focus" | "error" | "load" | "input" | "meeting"
type InsightType = "pattern" | "automation" | "efficiency" | "bottleneck" | "integration"
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

interface Employee {
  id: string
  name: string
  email: string
  avatar_url?: string
  initiativeId?: string // BU ID for filtering
}

interface BusinessUnit {
  id: string
  name: string
  slug?: string
}

type FilterType = "all" | "bu_specific" | "employee_specific"

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

// Generate integration events (SAP, Salesforce)
const generateIntegrationEvents = (userId: string, daysAgo: number): IntegrationEvent[] => {
  const date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd")
  const baseTime = subDays(new Date(), daysAgo).getTime()
  const events: IntegrationEvent[] = []
  
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  
  // Generate 5-15 integration events per day
  const eventCount = 5 + Math.floor(Math.random() * 10)
  
  const sapEvents: IntegrationEventType[] = ["invoice_created", "invoice_updated", "po_created", "status_changed", "note_added"]
  const salesforceEvents: IntegrationEventType[] = ["lead_created", "deal_created", "deal_updated", "status_changed", "note_added"]
  
  for (let i = 0; i < eventCount; i++) {
    const progress = i / eventCount
    const minutesFromStart = Math.floor(totalMinutes * progress)
    const hour = startHour + Math.floor(minutesFromStart / 60)
    const minute = minutesFromStart % 60
    const randomOffset = Math.floor(Math.random() * 15) - 7
    const finalMinute = Math.max(0, Math.min(59, minute + randomOffset))
    
    const integration = Math.random() > 0.5 ? "SAP" : "Salesforce"
    const eventTypes = integration === "SAP" ? sapEvents : salesforceEvents
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    let entity = ""
    let entityId = ""
    let description = ""
    let metadata: Record<string, any> = {}
    
    if (integration === "SAP") {
      if (eventType === "invoice_created" || eventType === "invoice_updated") {
        entity = "Invoice"
        entityId = `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = eventType === "invoice_created" 
          ? `Nueva factura creada: ${entityId}`
          : `Factura actualizada: ${entityId}`
        metadata = {
          amount: Math.floor(Math.random() * 100000) + 5000,
          status: eventType === "invoice_created" ? "pending" : (Math.random() > 0.5 ? "paid" : "pending"),
        }
      } else if (eventType === "po_created") {
        entity = "Purchase Order"
        entityId = `PO-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Nueva orden de compra creada: ${entityId}`
        metadata = {
          amount: Math.floor(Math.random() * 50000) + 1000,
          sku: `SKU-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        }
      } else if (eventType === "status_changed") {
        entity = Math.random() > 0.5 ? "Invoice" : "Purchase Order"
        entityId = entity === "Invoice" 
          ? `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
          : `PO-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Estado cambiado para ${entity}: ${entityId}`
      } else if (eventType === "note_added") {
        entity = Math.random() > 0.5 ? "Invoice" : "Purchase Order"
        entityId = entity === "Invoice" 
          ? `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
          : `PO-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Nota añadida a ${entity}: ${entityId}`
      }
    } else {
      // Salesforce
      if (eventType === "lead_created") {
        entity = "Lead"
        entityId = `LEAD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Nuevo lead creado: ${entityId}`
        metadata = {
          company: ["TechCorp", "InnovateLabs", "DigitalSolutions"][Math.floor(Math.random() * 3)],
        }
      } else if (eventType === "deal_created" || eventType === "deal_updated") {
        entity = "Deal"
        entityId = `DEAL-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = eventType === "deal_created"
          ? `Nuevo deal creado: ${entityId}`
          : `Deal actualizado: ${entityId}`
        metadata = {
          amount: Math.floor(Math.random() * 500000) + 10000,
          stage: ["Qualification", "Proposal", "Negotiation", "Closed Won"][Math.floor(Math.random() * 4)],
        }
      } else if (eventType === "status_changed") {
        entity = Math.random() > 0.5 ? "Lead" : "Deal"
        entityId = entity === "Lead"
          ? `LEAD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
          : `DEAL-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Estado cambiado para ${entity}: ${entityId}`
      } else if (eventType === "note_added") {
        entity = Math.random() > 0.5 ? "Lead" : "Deal"
        entityId = entity === "Lead"
          ? `LEAD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
          : `DEAL-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
        description = `Nota añadida a ${entity}: ${entityId}`
      }
    }
    
    const timestamp = new Date(baseTime + (hour * 60 + finalMinute) * 60 * 1000)
    
    events.push({
      id: `integration-${userId}-${date}-${i + 1}`,
      type: eventType,
      integration,
      entity,
      entityId,
      userId,
      description,
      timestamp,
      date,
      metadata,
      source: "integration",
    })
  }
  
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const generateDummyEvents = (userId: string, daysAgo: number): UserEvent[] => {
  const date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd")
  const baseTime = subDays(new Date(), daysAgo).getTime()
  const events: UserEvent[] = []
  
  // Simulate a realistic workday starting around 9 AM
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  
  // Generate 40-70 events per day with realistic distribution (increased for more SAP/Salesforce events)
  const eventCount = 40 + Math.floor(Math.random() * 30)
  
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
      "/insights", "/triage-new", "/initiatives", "/projects", "/issues", "/metrics"
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
  
  const eventTypes: EventType[] = ["click", "navigation", "focus", "input", "load", "meeting"]
  
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
    
    // Add some randomness to make it more natural
    const randomOffset = Math.floor(Math.random() * 15) - 7 // -7 to +7 minutes
    const finalMinute = Math.max(0, Math.min(59, minute + randomOffset))
    
    const app = weightedApps[Math.floor(Math.random() * weightedApps.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const domain = app.domains[Math.floor(Math.random() * app.domains.length)]
    
    // Generate realistic URLs and titles
    let url = `https://${domain}`
    let title = ""
    let description = ""
    
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
    } else if (eventType === "meeting") {
      const meetingTypes = ["Weekly Meeting", "Quarterly Meeting"]
      const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)]
      url = `https://meet.google.com/xxx-xxxx-xxx`
      title = meetingType
      description = `Meeting: ${meetingType}`
    } else {
      const page = app.pages[Math.floor(Math.random() * app.pages.length)]
      url = `https://${domain}/${page.toLowerCase().replace(/\s+/g, '-')}`
      title = page
      description = `Opened ${page}`
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
      source: eventType === "meeting" ? "meeting" : "browser",
    })
  }
  
  // Sort by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const generateDummyInsights = (
  userId: string, 
  date: string, 
  daysAgo: number, 
  events: UserEvent[], 
  integrationEvents: IntegrationEvent[]
): DailyInsight[] => {
  const insights: DailyInsight[] = []
  
  // Analyze events to generate realistic insights
  const sapiraEvents = events.filter(e => e.application === "sapira.ai")
  const sapBrowserEvents = events.filter(e => e.application === "SAP")
  const salesforceBrowserEvents = events.filter(e => e.application === "Salesforce")
  const linearEvents = events.filter(e => e.application === "linear.app")
  const emailEvents = events.filter(e => e.application === "gmail.com")
  const slackEvents = events.filter(e => e.application === "slack.com")
  const meetingEvents = events.filter(e => e.type === "meeting")
  
  // Integration events analysis
  const sapEvents = integrationEvents.filter(e => e.integration === "SAP")
  const salesforceEvents = integrationEvents.filter(e => e.integration === "Salesforce")
  const invoiceEvents = integrationEvents.filter(e => e.entity === "Invoice")
  const dealEvents = integrationEvents.filter(e => e.entity === "Deal")
  
  // NEW: Integration + Browser correlation insights
  // Pattern: SAP invoice events correlate with browser activity
  if (invoiceEvents.length > 0 && sapiraEvents.length > 0) {
    const correlatedEvents = invoiceEvents.filter(ie => {
      const timeWindow = 30 * 60 * 1000 // 30 minutes
      return sapiraEvents.some(be => 
        Math.abs(be.timestamp.getTime() - ie.timestamp.getTime()) < timeWindow
      )
    })
    
    if (correlatedEvents.length >= 2) {
      const relatedBrowserEvents = sapiraEvents
        .filter(be => correlatedEvents.some(ie => 
          Math.abs(be.timestamp.getTime() - ie.timestamp.getTime()) < 30 * 60 * 1000
        ))
        .slice(0, 3)
        .map(e => e.id)
      
      insights.push({
        id: `${userId}-${date}-insight-integration-1`,
        date,
        userId,
        type: "integration",
        title: "SAP invoice activity correlates with Sapira usage",
        description: `We detected ${correlatedEvents.length} SAP invoice events that occurred within 30 minutes of your Sapira OS activity. This suggests you're manually checking invoices after working in Sapira, indicating a potential workflow automation opportunity.`,
        impact: correlatedEvents.length >= 5 ? "high" : "medium",
        frequency: correlatedEvents.length,
        timeSaved: 3.0,
        confidence: 80 + Math.floor(Math.random() * 15),
        relatedEvents: relatedBrowserEvents,
        relatedIntegrationEvents: correlatedEvents.slice(0, 3).map(e => e.id),
        dataSources: ["browser", "integration"],
        recommendation: "Consider creating an automated workflow that syncs SAP invoice status to Sapira OS, eliminating the need for manual checks",
        validated: daysAgo <= 3,
      })
    }
  }
  
  // Pattern: Salesforce deal updates after meetings
  if (dealEvents.length > 0 && meetingEvents.length > 0) {
    const correlatedDeals = dealEvents.filter(de => {
      const timeWindow = 60 * 60 * 1000 // 1 hour after meeting
      return meetingEvents.some(me => 
        de.timestamp.getTime() > me.timestamp.getTime() &&
        de.timestamp.getTime() - me.timestamp.getTime() < timeWindow
      )
    })
    
    if (correlatedDeals.length >= 2) {
      const relatedMeetings = meetingEvents
        .filter(me => correlatedDeals.some(de => 
          de.timestamp.getTime() > me.timestamp.getTime() &&
          de.timestamp.getTime() - me.timestamp.getTime() < 60 * 60 * 1000
        ))
        .slice(0, 2)
        .map(e => e.id)
      
      insights.push({
        id: `${userId}-${date}-insight-integration-2`,
        date,
        userId,
        type: "integration",
        title: "Salesforce deal updates follow client meetings",
        description: `We detected ${correlatedDeals.length} Salesforce deal updates that occurred within 1 hour after your meetings. This pattern suggests you're manually updating deals post-meeting, which could be automated with meeting transcription and AI extraction.`,
        impact: correlatedDeals.length >= 4 ? "high" : "medium",
        frequency: correlatedDeals.length,
        timeSaved: 5.0,
        confidence: 75 + Math.floor(Math.random() * 15),
        relatedEvents: relatedMeetings,
        relatedIntegrationEvents: correlatedDeals.slice(0, 3).map(e => e.id),
        dataSources: ["browser", "integration"],
        recommendation: "Automate deal updates by integrating meeting transcripts with Salesforce, using AI to extract key information",
        validated: daysAgo <= 4,
      })
    }
  }
  
  // Pattern: High SAP activity during specific hours (browser + integration)
  const allSapEvents = [...sapEvents, ...sapBrowserEvents]
  if (allSapEvents.length >= 5) {
    const hourGroups = new Map<number, number>()
    allSapEvents.forEach(e => {
      const hour = e.timestamp.getHours()
      hourGroups.set(hour, (hourGroups.get(hour) || 0) + 1)
    })
    
    const peakHour = Array.from(hourGroups.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (peakHour && peakHour[1] >= 3) {
      const browserEventsSameHour = events.filter(e => 
        e.timestamp.getHours() === peakHour[0] &&
        e.source === "browser"
      )
      
      insights.push({
        id: `${userId}-${date}-insight-integration-3`,
        date,
        userId,
        type: "pattern",
        title: `Peak SAP activity at ${peakHour[0]}:00`,
        description: `We detected ${peakHour[1]} SAP events concentrated around ${peakHour[0]}:00. Combined with ${browserEventsSameHour.length} browser events during the same period, this suggests a focused work block that could be optimized.`,
        impact: peakHour[1] >= 6 ? "high" : "medium",
        frequency: peakHour[1],
        timeSaved: 1.5,
        confidence: 70 + Math.floor(Math.random() * 15),
        relatedEvents: browserEventsSameHour.slice(0, 3).map(e => e.id),
        relatedIntegrationEvents: sapEvents
          .filter(e => e.timestamp.getHours() === peakHour[0])
          .slice(0, 3)
          .map(e => e.id),
        dataSources: ["browser", "integration"],
        recommendation: `Schedule SAP-related tasks during ${peakHour[0]}:00 to maintain focus and reduce context switching`,
        validated: daysAgo <= 2,
      })
    }
  }
  
  // NEW: SAP browser activity patterns
  if (sapBrowserEvents.length >= 8) {
    const sapPages = new Map<string, number>()
    sapBrowserEvents.forEach(e => {
      const page = e.title || e.url
      sapPages.set(page, (sapPages.get(page) || 0) + 1)
    })
    
    const mostUsedPage = Array.from(sapPages.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostUsedPage && mostUsedPage[1] >= 5) {
      const relatedSapEvents = sapBrowserEvents
        .filter(e => (e.title || e.url) === mostUsedPage[0])
        .slice(0, 5)
        .map(e => e.id)
      
      insights.push({
        id: `${userId}-${date}-insight-sap-browser-1`,
        date,
        userId,
        type: "pattern",
        title: `Frequent SAP module access: ${mostUsedPage[0]}`,
        description: `We detected ${mostUsedPage[1]} accesses to "${mostUsedPage[0]}" in SAP today. This repetitive pattern suggests this module is central to your daily workflow and could benefit from workflow optimization.`,
        impact: mostUsedPage[1] >= 10 ? "high" : "medium",
        frequency: mostUsedPage[1],
        timeSaved: 2.0,
        confidence: 80 + Math.floor(Math.random() * 10),
        relatedEvents: relatedSapEvents,
        dataSources: ["browser"],
        recommendation: `Consider creating shortcuts or automating common tasks within ${mostUsedPage[0]} to reduce navigation time`,
        validated: daysAgo <= 3,
      })
    }
  }
  
  // NEW: SAP → Sapira workflow correlation
  if (sapBrowserEvents.length > 0 && sapiraEvents.length > 0) {
    const correlatedSap = sapBrowserEvents.filter(se => {
      const timeWindow = 20 * 60 * 1000 // 20 minutes
      return sapiraEvents.some(sae => 
        Math.abs(sae.timestamp.getTime() - se.timestamp.getTime()) < timeWindow
      )
    })
    
    if (correlatedSap.length >= 3) {
      const relatedSapiraEvents = sapiraEvents
        .filter(sae => correlatedSap.some(se => 
          Math.abs(sae.timestamp.getTime() - se.timestamp.getTime()) < 20 * 60 * 1000
        ))
        .slice(0, 3)
        .map(e => e.id)
      
      insights.push({
        id: `${userId}-${date}-insight-sap-sapira`,
        date,
        userId,
        type: "integration",
        title: "SAP usage correlates with Sapira OS activity",
        description: `We detected ${correlatedSap.length} SAP sessions that occurred within 20 minutes of your Sapira OS activity. This pattern suggests you're switching between SAP and Sapira OS frequently, indicating a potential integration opportunity.`,
        impact: correlatedSap.length >= 6 ? "high" : "medium",
        frequency: correlatedSap.length,
        timeSaved: 3.5,
        confidence: 75 + Math.floor(Math.random() * 15),
        relatedEvents: [...correlatedSap.slice(0, 3).map(e => e.id), ...relatedSapiraEvents],
        dataSources: ["browser"],
        recommendation: "Consider integrating SAP data directly into Sapira OS to eliminate context switching and streamline your workflow",
        validated: daysAgo <= 3,
      })
    }
  }
  
  // NEW: SAP invoice processing workflow
  if (invoiceEvents.length > 0 && sapBrowserEvents.length > 0) {
    const invoiceRelatedSap = sapBrowserEvents.filter(se => 
      se.title.toLowerCase().includes("invoice") || 
      se.description.toLowerCase().includes("invoice")
    )
    
    if (invoiceRelatedSap.length >= 3 && invoiceEvents.length >= 2) {
      const timeCorrelated = invoiceEvents.filter(ie => {
        const timeWindow = 15 * 60 * 1000 // 15 minutes
        return invoiceRelatedSap.some(se => 
          Math.abs(se.timestamp.getTime() - ie.timestamp.getTime()) < timeWindow
        )
      })
      
      if (timeCorrelated.length >= 2) {
        insights.push({
          id: `${userId}-${date}-insight-sap-invoice`,
          date,
          userId,
          type: "automation",
          title: "SAP invoice processing workflow detected",
          description: `We detected ${invoiceRelatedSap.length} SAP invoice-related browser sessions and ${timeCorrelated.length} invoice events that occurred within 15 minutes of each other. This suggests a manual invoice processing workflow that could be automated.`,
          impact: invoiceRelatedSap.length >= 6 ? "high" : "medium",
          frequency: invoiceRelatedSap.length,
          timeSaved: 4.0,
          confidence: 85 + Math.floor(Math.random() * 10),
          relatedEvents: invoiceRelatedSap.slice(0, 3).map(e => e.id),
          relatedIntegrationEvents: timeCorrelated.slice(0, 3).map(e => e.id),
          dataSources: ["browser", "integration"],
          recommendation: "Automate invoice processing by creating a workflow that syncs SAP invoices to Sapira OS and triggers automated approval processes",
          validated: daysAgo <= 2,
        })
      }
    }
  }
  
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
        dataSources: ["browser"],
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
          dataSources: ["browser"],
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
      dataSources: ["browser"],
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
      dataSources: ["browser"],
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
      dataSources: ["browser"],
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
const allIntegrationEvents: IntegrationEvent[] = []
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
    
    // Generate integration events
    const integrationEvents = generateIntegrationEvents(userId, daysAgo)
    allIntegrationEvents.push(...integrationEvents)
    
    // Generate insights based on both browser events and integration events
    const dayEvents = events.filter(e => e.date === date)
    const dayIntegrationEvents = integrationEvents.filter(e => e.date === date)
    const insights = generateDummyInsights(userId, date, daysAgo, dayEvents, dayIntegrationEvents)
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
    case "meeting":
      return CalendarDays
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

// Components
function FilterSelector({
  filterType,
  selectedBuId,
  selectedEmployeeId,
  businessUnits,
  employees,
  onFilterTypeChange,
  onBuChange,
  onEmployeeChange,
}: {
  filterType: FilterType
  selectedBuId: string | null
  selectedEmployeeId: string | null
  businessUnits: BusinessUnit[]
  employees: Employee[]
  onFilterTypeChange: (type: FilterType) => void
  onBuChange: (buId: string | null) => void
  onEmployeeChange: (employeeId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'main' | 'bu' | 'employee'>('main')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView('main')
        setSearchQuery('')
      }, 200)
    }
  }, [open])

  const getDisplayValue = () => {
    if (filterType === 'all') return 'All'
    if (filterType === 'bu_specific') {
      const bu = businessUnits.find(b => b.id === selectedBuId)
      return bu ? bu.name : 'Select BU'
    }
    if (filterType === 'employee_specific') {
      const emp = employees.find(e => e.id === selectedEmployeeId)
      return emp ? emp.name : 'Select employee'
    }
    return 'All'
  }

  const getDisplayIcon = () => {
    if (filterType === 'all') return <Users className="h-3.5 w-3.5 text-gray-500" />
    if (filterType === 'bu_specific') return <Target className="h-3.5 w-3.5 text-gray-500" />
    return <User className="h-3.5 w-3.5 text-gray-500" />
  }

  const filteredBUs = businessUnits.filter(bu =>
    bu.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          <div className="flex-shrink-0 text-gray-500">
            {getDisplayIcon()}
          </div>
          <span className="text-gray-700 whitespace-nowrap">
            {getDisplayValue()}
          </span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[200px] p-1 rounded-md border-gray-200 shadow-md overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    onFilterTypeChange('all')
                    onBuChange(null)
                    onEmployeeChange(null)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 transition-colors text-left"
                >
                  <Users className="w-3.5 h-3.5 text-gray-600" />
                  <span className="flex-1">All</span>
                  {filterType === 'all' && <Check className="h-3.5 w-3.5 text-gray-600" />}
                </button>

                <button
                  onClick={() => setView('bu')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 transition-colors text-left"
                >
                  <Target className="w-3.5 h-3.5 text-gray-600" />
                  <span className="flex-1">Business Unit</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => setView('employee')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-gray-600" />
                  <span className="flex-1">Employee</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'bu' && (
            <motion.div
              key="bu"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Back button */}
              <button
                onClick={() => setView('main')}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-sm mb-1"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search BU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs border-0 outline-none bg-transparent"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredBUs.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-gray-500 text-center">No business units found</div>
                ) : (
                  filteredBUs.map((bu) => (
                    <button
                      key={bu.id}
                      onClick={() => {
                        onFilterTypeChange('bu_specific')
                        onBuChange(bu.id)
                        onEmployeeChange(null)
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 transition-colors text-left"
                    >
                      <Target className="w-3.5 h-3.5 text-gray-600" />
                      <span className="flex-1 truncate">{bu.name}</span>
                      {filterType === 'bu_specific' && selectedBuId === bu.id && (
                        <Check className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                      )}
                    </button>
                  ))
                )}
          </div>
            </motion.div>
          )}

          {view === 'employee' && (
            <motion.div
              key="employee"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Back button */}
              <button
                onClick={() => setView('main')}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-sm mb-1"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs border-0 outline-none bg-transparent"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-gray-500 text-center">No employees found</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        onFilterTypeChange('employee_specific')
                        onEmployeeChange(emp.id)
                        onBuChange(null)
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-gray-100 transition-colors text-left"
                    >
                      <Avatar className="h-4 w-4">
                {emp.avatar_url ? (
                  <AvatarImage src={emp.avatar_url} />
                ) : null}
                <AvatarFallback className="text-[9px] bg-gray-100 text-gray-600">
                  {emp.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{emp.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{emp.email}</div>
              </div>
                      {filterType === 'employee_specific' && selectedEmployeeId === emp.id && (
                        <Check className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                      )}
                    </button>
                  ))
                )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
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

function InsightsList({ 
  insights, 
  allEvents, 
  allIntegrationEvents 
}: { 
  insights: DailyInsight[]
  allEvents: UserEvent[]
  allIntegrationEvents: IntegrationEvent[]
}) {
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
        const relatedIntegrationEventsData = allIntegrationEvents.filter(e => 
          insight.relatedIntegrationEvents?.includes(e.id)
        )
        const isExpanded = expandedInsights.has(insight.id)
        
        // Analyze events to show evidence
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
        const allRelatedEvents = [...relatedEventsData, ...relatedIntegrationEventsData]
        const timeRange = allRelatedEvents.length > 0 ? {
          start: new Date(Math.min(...allRelatedEvents.map(e => e.timestamp.getTime()))),
          end: new Date(Math.max(...allRelatedEvents.map(e => e.timestamp.getTime())))
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
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 border border-gray-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Validated
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  {insight.description}
                </p>
                {/* Data sources - subtle inline */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>Data sources:</span>
                  {insight.dataSources.includes("browser") && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-700 text-white border-gray-600">
                      <Monitor className="h-2.5 w-2.5 mr-1" />
                      User Monitoring
                    </Badge>
                  )}
                  {insight.dataSources.includes("integration") && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-300">
                      <Plug className="h-2.5 w-2.5 mr-1" />
                      Integrations
                    </Badge>
                  )}
                  {insight.dataSources.length > 1 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-700 border-gray-200">
                      Combined analysis
                    </Badge>
                  )}
                </div>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-700">
                        How we detected this
                      </span>
                      {relatedEventsData.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-700 text-white border-gray-600">
                          {relatedEventsData.length} browser events
                        </Badge>
                      )}
                      {relatedIntegrationEventsData.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-300">
                          {relatedIntegrationEventsData.length} integration events
                        </Badge>
                      )}
                      {applications.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-700 border-gray-200">
                          {applications.length} apps
                        </Badge>
                      )}
                      {integrations.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-700 border-gray-200">
                          {integrations.length} integrations
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
                      <div className="space-y-3">
                        {relatedEventsData.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-700">
                              <Monitor className="h-3 w-3 text-gray-500" />
                              Browser Events ({relatedEventsData.length})
                            </div>
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
                          </div>
                        )}
                        
                        {relatedIntegrationEventsData.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-700">
                              <Plug className="h-3 w-3 text-gray-500" />
                              Integration Events ({relatedIntegrationEventsData.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
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
                                  <div key={type} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border bg-blue-100 text-blue-800 border-blue-300">
                                    <Activity className="h-3 w-3" />
                                    <span className="font-medium">{count}</span>
                                    <span>{typeLabels[type] || type}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Related events timeline */}
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {/* Browser events */}
                        {relatedEventsData.length > 0 && (
                          <div className="space-y-1.5">
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
                          </div>
                        )}
                        
                        {/* Integration events */}
                        {relatedIntegrationEventsData.length > 0 && (
                          <div className="space-y-1.5">
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
                        )}
                        
                        {(relatedEventsData.length > 5 || relatedIntegrationEventsData.length > 5) && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{(relatedEventsData.length - 5) + (relatedIntegrationEventsData.length - 5)} more events
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
                    className="w-full justify-between h-auto py-2.5 px-4 hover:bg-gray-100 hover:text-gray-900 border-gray-200"
                  >
                    <div className="flex items-center gap-2 text-left flex-1">
                      <span className="text-xs font-semibold text-gray-900">{insight.recommendation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                      <span className="font-medium">Request automation</span>
                      <ArrowRight className="h-3.5 w-3.5" />
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
  filterType,
  selectedEmployeeId,
  period = "week"
}: { 
  insights: DailyInsight[]
  filterType: FilterType
  selectedEmployeeId: string | null
  period?: "week" | "month"
}) {
  const insightsByType = new Map<string, DailyInsight[]>()
  
  insights.forEach(insight => {
    if (filterType === "employee_specific" && selectedEmployeeId && insight.userId !== selectedEmployeeId) return
    
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
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [selectedBuId, setSelectedBuId] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"))
  const [selectedMonth, setSelectedMonth] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day")
  const [orgEmployees, setOrgEmployees] = useState<Employee[]>([])
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingBUs, setLoadingBUs] = useState(true)
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
          initiativeId: u.initiative_id || null, // BU ID for filtering
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

  // Load business units
  useEffect(() => {
    const loadBusinessUnits = async () => {
      if (!currentOrg) {
        setLoadingBUs(false)
        return
      }

      setLoadingBUs(true)
      try {
        const bus = await ProjectsAPI.getBusinessUnits(currentOrg.organization.id)
        setBusinessUnits(bus)
      } catch (error) {
        console.error("Error loading business units:", error)
        setBusinessUnits([])
      } finally {
        setLoadingBUs(false)
      }
    }

    loadBusinessUnits()
  }, [currentOrg])

  // Get user IDs for selected BU
  const getBuUserIds = (): string[] => {
    if (filterType === "bu_specific" && selectedBuId) {
      return orgEmployees
        .filter(emp => emp.initiativeId === selectedBuId)
        .map(emp => emp.id)
    }
    return []
  }

  const buUserIds = getBuUserIds()

  const filteredEvents = allEvents.filter(e => {
    // Filter by employee
    if (filterType === "employee_specific" && selectedEmployeeId && e.userId !== selectedEmployeeId) return false
    // Filter by BU
    if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(e.userId)) return false
    // Filter by date
    if (activeTab === "day" && e.date !== selectedDate) return false
    return true
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Helper function to check if insight is related to SAP, Salesforce, or Sapira
  const isRelevantInsight = (insight: DailyInsight): boolean => {
    const titleLower = insight.title.toLowerCase()
    const descLower = insight.description.toLowerCase()
    
    // Exclude insights that mention Linear or other unwanted apps
    const excludedApps = ["linear", "notion", "slack", "gmail", "github", "figma", "confluence"]
    const mentionsExcludedApp = excludedApps.some(app => 
      titleLower.includes(app) || descLower.includes(app)
    )
    if (mentionsExcludedApp) return false
    
    // Check if it's an integration insight (SAP or Salesforce)
    const isIntegrationInsight = insight.type === "integration" || 
                                 insight.dataSources.includes("integration") ||
                                 titleLower.includes("sap") ||
                                 titleLower.includes("salesforce") ||
                                 descLower.includes("sap") ||
                                 descLower.includes("salesforce")
    
    // Check if it's a Sapira insight
    const isSapiraInsight = titleLower.includes("sapira") ||
                           descLower.includes("sapira") ||
                           insight.relatedEvents.some(eventId => {
                             const event = allEvents.find(e => e.id === eventId)
                             return event?.application === "sapira.ai"
                           })
    
    // Check related events - exclude if they're mostly from unwanted apps
    const relatedEventsData = allEvents.filter(e => insight.relatedEvents.includes(e.id))
    if (relatedEventsData.length > 0) {
      const unwantedEventCount = relatedEventsData.filter(e => 
        excludedApps.some(app => e.application.toLowerCase().includes(app))
      ).length
      // If more than 50% of events are from unwanted apps, exclude
      if (unwantedEventCount / relatedEventsData.length > 0.5) return false
    }
    
    return isIntegrationInsight || isSapiraInsight
  }

  const filteredInsights = allInsights.filter(i => {
    // Filter by date
    if (activeTab === "day" && i.date !== selectedDate) return false
    
    // Filter by employee
    if (filterType === "employee_specific" && selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    // Filter by BU
    if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(i.userId)) return false
    
    // Only show insights related to SAP, Salesforce, or Sapira
    return isRelevantInsight(i)
  })

  // Calculate filtered metrics based on current filter
  const getFilteredMetrics = () => {
    const filteredDayEvents = allEvents.filter(e => {
      if (filterType === "employee_specific" && selectedEmployeeId && e.userId !== selectedEmployeeId) return false
      if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(e.userId)) return false
      if (e.date !== selectedDate) return false
      return true
    })
    
    const sessions = calculateSessions(filteredDayEvents)
    const avgSessionDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60000)
      : 0
    const activeTime = Math.round(filteredDayEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / 60000)
    
    return {
      date: selectedDate,
      totalEvents: filteredDayEvents.length,
      clicks: filteredDayEvents.filter(e => e.type === "click").length,
      navigations: filteredDayEvents.filter(e => e.type === "navigation").length,
      errors: filteredDayEvents.filter(e => e.type === "error").length,
      avgSessionDuration,
      activeTime,
    }
  }

  const currentMetrics = getFilteredMetrics()
  
  // Get previous day metrics with same filter
  const getPreviousFilteredMetrics = () => {
    const currentIdx = availableDates.indexOf(selectedDate)
    if (currentIdx <= 0) return undefined
    
    const prevDate = availableDates[currentIdx - 1]
    const filteredDayEvents = allEvents.filter(e => {
      if (filterType === "employee_specific" && selectedEmployeeId && e.userId !== selectedEmployeeId) return false
      if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(e.userId)) return false
      if (e.date !== prevDate) return false
      return true
    })
    
    const sessions = calculateSessions(filteredDayEvents)
    const avgSessionDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60000)
      : 0
    const activeTime = Math.round(filteredDayEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / 60000)
    
    return {
      date: prevDate,
      totalEvents: filteredDayEvents.length,
      clicks: filteredDayEvents.filter(e => e.type === "click").length,
      navigations: filteredDayEvents.filter(e => e.type === "navigation").length,
      errors: filteredDayEvents.filter(e => e.type === "error").length,
      avgSessionDuration,
      activeTime,
    }
  }

  const previousMetrics = getPreviousFilteredMetrics()

  const weeklyInsights = allInsights.filter(i => {
    if (filterType === "employee_specific" && selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(i.userId)) return false
    const insightDate = parseISO(i.date)
    const weekAgo = subDays(new Date(), 7)
    if (insightDate < weekAgo) return false
    
    // Only show insights related to SAP, Salesforce, or Sapira
    return isRelevantInsight(i)
  })

  const monthlyInsights = allInsights.filter(i => {
    if (filterType === "employee_specific" && selectedEmployeeId && i.userId !== selectedEmployeeId) return false
    if (filterType === "bu_specific" && selectedBuId && !buUserIds.includes(i.userId)) return false
    const insightDate = parseISO(i.date)
    const monthAgo = subMonths(new Date(), 1)
    if (insightDate < monthAgo) return false
    
    // Only show insights related to SAP, Salesforce, or Sapira
    return isRelevantInsight(i)
  })

  useEffect(() => {
    if (!loadingEmployees && !loadingBUs) {
      setIsLoading(false)
    }
  }, [loadingEmployees, loadingBUs])

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
                    <FilterSelector
                      filterType={filterType}
                      selectedBuId={selectedBuId}
                      selectedEmployeeId={selectedEmployeeId}
                      businessUnits={businessUnits}
                      employees={orgEmployees}
                      onFilterTypeChange={(type) => {
                        setFilterType(type)
                        if (type !== 'bu_specific') setSelectedBuId(null)
                        if (type !== 'employee_specific') setSelectedEmployeeId(null)
                      }}
                      onBuChange={setSelectedBuId}
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`day-${filterType}-${selectedBuId || 'none'}-${selectedEmployeeId || 'none'}-${selectedDate}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Insights */}
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                      <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Insights</span>
                            {(filterType === "bu_specific" || filterType === "employee_specific") && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-700 border-gray-200">
                                {filterType === "bu_specific" 
                                  ? businessUnits.find(bu => bu.id === selectedBuId)?.name || "BU"
                                  : orgEmployees.find(emp => emp.id === selectedEmployeeId)?.name || "Employee"}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {filteredInsights.length} insights generated
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {filteredInsights.length > 0 && (
                            <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-900">Daily Summary</span>
                                <span className="text-xs text-gray-600">
                                  Generated {filteredInsights.length} insights for {format(parseISO(selectedDate), "MMMM d, yyyy")} analyzing{" "}
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-700 text-white border-gray-600">
                                    {filteredEvents.filter(e => e.date === selectedDate).length} browser events
                                  </Badge>
                                  {" "}and{" "}
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-300">
                                    {allIntegrationEvents.filter(e => e.date === selectedDate).length} integration events
                                  </Badge>
                                  , with an estimated time savings of{" "}
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white text-gray-900 border-gray-200">
                                    {filteredInsights.reduce((acc, i) => acc + (i.timeSaved || 0) * i.frequency, 0).toFixed(0)} minutes
                                  </Badge>
                                  .
                                </span>
                              </div>
                            </div>
                          )}
                          <InsightsList insights={filteredInsights} allEvents={allEvents} allIntegrationEvents={allIntegrationEvents} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`week-${filterType}-${selectedBuId || 'none'}-${selectedEmployeeId || 'none'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WeeklySummary 
                      insights={weeklyInsights}
                      filterType={filterType}
                      selectedEmployeeId={selectedEmployeeId}
                      period="week"
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`month-${filterType}-${selectedBuId || 'none'}-${selectedEmployeeId || 'none'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WeeklySummary 
                      insights={monthlyInsights}
                      filterType={filterType}
                      selectedEmployeeId={selectedEmployeeId}
                      period="month"
                    />
                  </motion.div>
                </AnimatePresence>
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
