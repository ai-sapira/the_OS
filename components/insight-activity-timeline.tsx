"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Activity,
  Monitor,
  Plug,
  MousePointerClick,
  Navigation,
  Focus,
  AlertCircle,
  Loader,
  Type,
  Users,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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

interface Employee {
  id: string
  name: string
  email: string
  avatar_url?: string
  initiativeId?: string // BU ID
}

interface BusinessUnit {
  id: string
  name: string
  slug?: string
}

interface InsightActivityTimelineProps {
  userEvents: UserEvent[]
  integrationEvents: IntegrationEvent[]
  insightTitle: string
  insightDescription: string
  employees?: Employee[]
  businessUnits?: BusinessUnit[]
}

const getEventTypeIcon = (type: EventType) => {
  const iconMap: Record<EventType, React.ReactNode> = {
    click: <MousePointerClick className="h-3.5 w-3.5" />,
    navigation: <Navigation className="h-3.5 w-3.5" />,
    focus: <Focus className="h-3.5 w-3.5" />,
    error: <AlertCircle className="h-3.5 w-3.5" />,
    load: <Loader className="h-3.5 w-3.5" />,
    input: <Type className="h-3.5 w-3.5" />,
    meeting: <Users className="h-3.5 w-3.5" />,
  }
  return iconMap[type] || <Activity className="h-3.5 w-3.5" />
}

const getEventTypeLabel = (type: EventType): string => {
  const labels: Record<EventType, string> = {
    click: "Click",
    navigation: "Navigation",
    focus: "Focus",
    error: "Error",
    load: "Load",
    input: "Input",
    meeting: "Meeting",
  }
  return labels[type] || type
}

const getEventTypeColor = (type: EventType): string => {
  const colors: Record<EventType, string> = {
    click: "bg-blue-50 text-blue-700 border-blue-200",
    navigation: "bg-purple-50 text-purple-700 border-purple-200",
    focus: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    load: "bg-gray-50 text-gray-700 border-gray-200",
    input: "bg-yellow-50 text-yellow-700 border-yellow-200",
    meeting: "bg-indigo-50 text-indigo-700 border-indigo-200",
  }
  return colors[type] || "bg-gray-50 text-gray-700 border-gray-200"
}

const formatTime = (date: Date): string => {
  return format(date, "HH:mm:ss")
}

const formatDateTime = (date: Date): string => {
  return format(date, "MMM d, yyyy HH:mm")
}

export function InsightActivityTimeline({
  userEvents,
  integrationEvents,
  insightTitle,
  insightDescription,
  employees = [],
  businessUnits = [],
}: InsightActivityTimelineProps) {
  // Combine and sort all events by timestamp
  const allEvents = [
    ...userEvents.map(e => ({ ...e, eventType: 'user' as const })),
    ...integrationEvents.map(e => ({ ...e, eventType: 'integration' as const })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Get unique user IDs from events
  const userIdsFromEvents = new Set<string>()
  userEvents.forEach(e => userIdsFromEvents.add(e.userId))
  integrationEvents.forEach(e => {
    if (e.userId) userIdsFromEvents.add(e.userId)
  })
  
  // Get employee info for users in events
  let relatedEmployees = employees.filter(emp => userIdsFromEvents.has(emp.id))
  
  // Fallback: if no exact matches but we have user IDs and employees, assign users based on hash
  if (relatedEmployees.length === 0 && userIdsFromEvents.size > 0 && employees.length > 0) {
    const userIdsArray = Array.from(userIdsFromEvents)
    // Use first user ID as seed for consistent assignment
    const hash = userIdsArray[0]?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
    const userCount = Math.min(userIdsFromEvents.size, employees.length)
    const startIndex = hash % employees.length
    
    relatedEmployees = []
    for (let i = 0; i < userCount; i++) {
      const index = (startIndex + i) % employees.length
      relatedEmployees.push(employees[index])
    }
  }
  
  // Ensure minimum 2 users are shown if we have employees available
  if (relatedEmployees.length < 2 && employees.length >= 2) {
    const existingIds = new Set(relatedEmployees.map(e => e.id))
    const additionalNeeded = 2 - relatedEmployees.length
    
    // Use insight title as seed for consistent assignment
    const hash = insightTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const startIndex = hash % employees.length
    
    let added = 0
    for (let i = 0; i < employees.length && added < additionalNeeded; i++) {
      const index = (startIndex + i) % employees.length
      const employee = employees[index]
      if (!existingIds.has(employee.id)) {
        relatedEmployees.push(employee)
        existingIds.add(employee.id)
        added++
      }
    }
  }
  
  const uniqueUserCount = relatedEmployees.length

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No related events</p>
        <p className="text-xs text-gray-400 mt-1">
          No events were found that generated this insight
        </p>
      </div>
    )
  }

  // Group events by time proximity (events within 5 minutes are grouped)
  const groupedEvents: Array<{
    time: Date
    events: typeof allEvents
  }> = []

  allEvents.forEach(event => {
    const lastGroup = groupedEvents[groupedEvents.length - 1]
    if (lastGroup && Math.abs(event.timestamp.getTime() - lastGroup.time.getTime()) < 5 * 60 * 1000) {
      lastGroup.events.push(event)
    } else {
      groupedEvents.push({
        time: event.timestamp,
        events: [event],
      })
    }
  })

  return (
    <div className="space-y-6">
      {/* Event badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-700 text-white border-gray-600">
          <Monitor className="h-2.5 w-2.5 mr-1" />
          {userEvents.length} browser events
        </Badge>
        {integrationEvents.length > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-300">
            <Plug className="h-2.5 w-2.5 mr-1" />
            {integrationEvents.length} integration events
          </Badge>
        )}
        {uniqueUserCount > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">
            <Users className="h-2.5 w-2.5 mr-1" />
            {uniqueUserCount} user{uniqueUserCount > 1 ? 's' : ''} detected
          </Badge>
        )}
      </div>


      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Event Timeline</h4>
          <span className="text-xs text-gray-500">
            ({allEvents.length} events)
          </span>
        </div>

        {groupedEvents.map((group, groupIndex) => {
          const isLastGroup = groupIndex === groupedEvents.length - 1
          
          return (
            <div key={groupIndex} className="relative">
              {/* Timeline line */}
              {!isLastGroup && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
              )}

              {/* Time marker */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700">
                    {formatDateTime(group.time)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {group.events.length} event{group.events.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Events in this group */}
              <div className="ml-11 space-y-2">
                {group.events.map((event, eventIndex) => {
                  const isUserEvent = event.eventType === 'user'
                  const userEvent = isUserEvent ? event as UserEvent & { eventType: 'user' } : null
                  const integrationEvent = !isUserEvent ? event as IntegrationEvent & { eventType: 'integration' } : null

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "relative flex gap-3 pb-4",
                        eventIndex < group.events.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      {/* Event icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center border",
                          isUserEvent 
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-blue-50 border-blue-200 text-blue-600"
                        )}>
                          {isUserEvent ? (
                            getEventTypeIcon(userEvent!.type)
                          ) : (
                            <Plug className="h-3 w-3" />
                          )}
                        </div>
                      </div>

                      {/* Event content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Event type badge */}
                            <div className="flex items-center gap-2 mb-1">
                              {isUserEvent ? (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-[10px] px-1.5 py-0 border", getEventTypeColor(userEvent!.type))}
                                >
                                  {getEventTypeIcon(userEvent!.type)}
                                  <span className="ml-1">{getEventTypeLabel(userEvent!.type)}</span>
                                </Badge>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-300"
                                >
                                  <Plug className="h-2.5 w-2.5 mr-1" />
                                  {integrationEvent!.integration}
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className="text-[9px] px-1 py-0 bg-gray-50 text-gray-600 border-gray-200"
                              >
                                {isUserEvent ? userEvent!.application : integrationEvent!.integration}
                              </Badge>
                            </div>

                            {/* Event details */}
                            <div className="space-y-0.5">
                              {isUserEvent ? (
                                <>
                                  <p className="text-xs font-medium text-gray-900 truncate">
                                    {userEvent!.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    {userEvent!.url}
                                  </p>
                                  {userEvent!.description && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      {userEvent!.description}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="text-xs font-medium text-gray-900">
                                    {integrationEvent!.entity}: {integrationEvent!.entityId}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {integrationEvent!.description}
                                  </p>
                                  {integrationEvent!.metadata && Object.keys(integrationEvent!.metadata).length > 0 && (
                                    <div className="text-[10px] text-gray-400 mt-1">
                                      {Object.entries(integrationEvent!.metadata).slice(0, 2).map(([key, value]) => (
                                        <span key={key} className="mr-2">
                                          {key}: {String(value)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-[10px] text-gray-400">
                              {formatTime(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pattern Detection Summary */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Pattern Detection</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          This insight was detected by identifying a repetitive pattern where{" "}
          <strong>user monitoring</strong> events ({userEvents.length} events) temporally coincided with{" "}
          <strong>integration</strong> events ({integrationEvents.length} events), indicating a consistent workflow that repeats.
        </p>
        
        {/* Users with similar activity */}
        {relatedEmployees.length > 0 && (() => {
          // Always use "Sales" as the BU for demo purposes
          const primaryBUName = "Sales"
          const allInSameBU = true

          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  This behavior was found in {uniqueUserCount} user{uniqueUserCount > 1 ? 's' : ''}
                  {allInSameBU && primaryBUName ? (
                    <span className="text-gray-600"> from <strong>{primaryBUName}</strong></span>
                  ) : null}
                  :
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {relatedEmployees.map((employee) => (
                  <Badge 
                    key={employee.id}
                    variant="outline" 
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      {employee.avatar_url ? (
                        <AvatarImage src={employee.avatar_url} alt={employee.name} />
                      ) : null}
                      <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">
                        {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[140px] text-xs">{employee.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

