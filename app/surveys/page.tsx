"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoles } from "@/hooks/use-roles"
import { useAuth } from "@/lib/context/auth-context"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import { NewSurveyModal } from "@/components/new-survey-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SurveysAPI, type SurveyWithRelations } from "@/lib/api/surveys"
import { 
  Plus, 
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  Archive,
  Target,
  MoreVertical,
  Play,
  Lock,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function SurveysPage() {
  const router = useRouter()
  const { can, activeRole } = useRoles()
  const { currentOrg } = useAuth()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [createSurveyOpen, setCreateSurveyOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("active")
  const [surveys, setSurveys] = useState<SurveyWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  // Check permissions
  const canCreateSurvey = can("action.create-survey")
  const canViewResults = can("action.view-survey-results")

  // Load surveys
  const loadSurveys = async () => {
    if (!currentOrg?.organization?.id) {
      setLoading(false)
      setSurveys([])
      return
    }

    try {
      setLoading(true)
      const allSurveys = await SurveysAPI.getSurveys(currentOrg.organization.id)
      setSurveys(allSurveys)
    } catch (error) {
      console.error("Error loading surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSurveys()
  }, [currentOrg?.organization?.id])

  // Filter surveys based on active tab
  const filteredSurveys = surveys.filter(survey => {
    // TODO: Get actual user ID from auth context
    const currentUserId = 'b8023796-e4c8-4752-9f5c-5b140c990f06' // Guillermo (guillermo@sapira.ai)
    
    if (activeTab === "active") {
      return survey.status === "active"
    } else if (activeTab === "my-surveys") {
      // Show surveys created by current user
      return survey.creator_user_id === currentUserId
    } else if (activeTab === "completed") {
      return survey.my_response_status === "completed"
    } else if (activeTab === "archived") {
      return survey.status === "archived" || survey.status === "closed"
    }
    return false
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Draft</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Closed</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Archived</Badge>
      default:
        return null
    }
  }

  return (
    <ResizableAppShell onOpenCommandPalette={() => setCommandPaletteOpen(true)}>
      <ResizablePageSheet
        header={
          <div>
            <div 
              className="flex items-center justify-between w-full h-full" 
              style={{ 
                paddingLeft: '28px', 
                paddingRight: '20px', 
                paddingTop: 'var(--header-padding-y)', 
                paddingBottom: 'var(--header-padding-y)' 
              }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Quick Access</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Surveys</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canCreateSurvey && (
                  <Button 
                    size="sm" 
                    className="h-8 bg-gray-700 hover:bg-gray-800 text-white gap-2"
                    onClick={() => setCreateSurveyOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Survey
                  </Button>
                )}
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div 
              className="flex items-center justify-between h-full" 
              style={{ 
                paddingLeft: '28px', 
                paddingRight: '20px', 
                paddingTop: 'var(--header-padding-y)', 
                paddingBottom: 'var(--header-padding-y)' 
              }}
            >
              {/* Custom Tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "active"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Active
                </button>
                {canCreateSurvey && (
                  <button
                    onClick={() => setActiveTab("my-surveys")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "my-surveys"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    My Surveys
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "completed"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "archived"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            </div>
          ) : filteredSurveys.length > 0 ? (
            <SurveysTable 
              surveys={filteredSurveys}
              activeTab={activeTab}
              canViewResults={canViewResults}
              router={router}
              getStatusBadge={getStatusBadge}
            />
          ) : (
            <EmptySurveysState
              icon={getEmptyIcon(activeTab)}
              title={getEmptyTitle(activeTab)}
              description={getEmptyDescription(activeTab)}
              action={
                activeTab === "my-surveys" && canCreateSurvey ? (
                  <Button 
                    className="mt-4 bg-gray-700 hover:bg-gray-800 text-white gap-2"
                    onClick={() => setCreateSurveyOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Survey
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>

        {/* Create Survey Modal */}
        <NewSurveyModal 
          open={createSurveyOpen} 
          onOpenChange={setCreateSurveyOpen}
          onCreateSurvey={() => {
            loadSurveys()
          }}
        />
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

// Surveys Table Component
interface SurveysTableProps {
  surveys: SurveyWithRelations[]
  activeTab: string
  canViewResults: boolean
  router: ReturnType<typeof useRouter>
  getStatusBadge: (status: string) => React.ReactNode | null
}

function SurveysTable({ surveys, activeTab, canViewResults, router, getStatusBadge }: SurveysTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [displayingSurveys, setDisplayingSurveys] = useState(surveys.slice(0, 10))

  useEffect(() => {
    if (expanded) {
      setDisplayingSurveys(surveys)
    } else {
      const timer = setTimeout(() => {
        setDisplayingSurveys(surveys.slice(0, 10))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, surveys])

  const handleSurveyClick = (survey: SurveyWithRelations) => {
    if (activeTab === "my-surveys" && canViewResults) {
      router.push(`/surveys/${survey.id}/results`)
    } else if (survey.status === "active" && survey.my_response_status === "pending") {
      router.push(`/surveys/${survey.id}/answer`)
    } else if (survey.my_response_status === "completed") {
      router.push(`/surveys/${survey.id}/response`)
    } else {
      router.push(`/surveys/${survey.id}`)
    }
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-"
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Surveys</span>
          <span className="text-xs text-gray-500">({surveys.length})</span>
        </div>
        {surveys.length > 10 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                Minimizar <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver todas <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Title</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Creator</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Business Unit</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Responses</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Questions</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {displayingSurveys.map((survey, idx) => {
              const isNewRow = expanded && idx >= 10 && idx < surveys.length
              const isRemovedRow = !expanded && idx >= 10
              const animationDelay = idx >= 10 ? (idx - 10) * 30 : 0
              
              return (
                <tr
                  key={`${survey.id}-${expanded ? 'expanded' : 'collapsed'}`}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out cursor-pointer"
                  style={{
                    animation: isNewRow 
                      ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                      : isRemovedRow
                      ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                      : undefined,
                  }}
                  onClick={() => handleSurveyClick(survey)}
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <button
                        className="font-medium text-sm text-gray-900 hover:text-gray-700 hover:underline transition-colors text-left"
                      >
                        {survey.title}
                      </button>
                      {survey.description && (
                        <span className="text-xs text-gray-500 line-clamp-1">{survey.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(survey.status)}
                    {survey.my_response_status === "completed" && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Completed</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {survey.creator ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-medium text-gray-700">
                            {survey.creator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{survey.creator.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {survey.target_bu ? (
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-sm text-gray-700">{survey.target_bu.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">All</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{survey.response_count || 0}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{survey.questions?.length || 0}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{formatDate(survey.created_at)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Helper functions for empty states
function getEmptyIcon(tab: string) {
  switch (tab) {
    case "active":
      return <Play className="h-12 w-12 text-gray-300" />
    case "my-surveys":
      return <ClipboardList className="h-12 w-12 text-gray-300" />
    case "completed":
      return <CheckCircle2 className="h-12 w-12 text-gray-300" />
    case "archived":
      return <Archive className="h-12 w-12 text-gray-300" />
    default:
      return <ClipboardList className="h-12 w-12 text-gray-300" />
  }
}

function getEmptyTitle(tab: string) {
  switch (tab) {
    case "active":
      return "No active surveys"
    case "my-surveys":
      return "No surveys created yet"
    case "completed":
      return "No completed surveys"
    case "archived":
      return "No archived surveys"
    default:
      return "No surveys"
  }
}

function getEmptyDescription(tab: string) {
  switch (tab) {
    case "active":
      return "There are no surveys available for you to respond to at the moment."
    case "my-surveys":
      return "Create your first survey to gather feedback from your team."
    case "completed":
      return "Surveys you've responded to will appear here."
    case "archived":
      return "Closed surveys will be moved to the archive."
    default:
      return "No surveys found."
  }
}

// Empty state component
interface EmptySurveysStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

function EmptySurveysState({ icon, title, description, action }: EmptySurveysStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md">{description}</p>
      {action}
    </div>
  )
}
