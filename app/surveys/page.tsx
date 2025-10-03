"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoles } from "@/hooks/use-roles"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import { NewSurveyModal } from "@/components/new-survey-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
  Eye
} from "lucide-react"

export default function SurveysPage() {
  const router = useRouter()
  const { can, activeRole } = useRoles()
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
    try {
      setLoading(true)
      const allSurveys = await SurveysAPI.getSurveys()
      setSurveys(allSurveys)
    } catch (error) {
      console.error("Error loading surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSurveys()
  }, [])

  // Filter surveys based on active tab
  const filteredSurveys = surveys.filter(survey => {
    // TODO: Get actual user ID from auth context
    const currentUserId = '11111111-aaaa-2222-2222-222222222222' // María García (SAP - Aurovitas)
    
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
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Closed</Badge>
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
                    className="h-8 bg-blue-500 hover:bg-blue-600 text-white gap-2"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredSurveys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurveys.map((survey) => (
                <Card
                  key={survey.id}
                  className="group relative bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => {
                    // Navigate based on context
                    if (activeTab === "my-surveys" && canViewResults) {
                      // Go to results page for own surveys
                      router.push(`/surveys/${survey.id}/results`)
                    } else if (survey.status === "active" && survey.my_response_status === "pending") {
                      // Go to answer page for active surveys
                      router.push(`/surveys/${survey.id}/answer`)
                    } else if (survey.my_response_status === "completed") {
                      // View your response
                      router.push(`/surveys/${survey.id}/response`)
                    } else {
                      // Default: view details
                      router.push(`/surveys/${survey.id}`)
                    }
                  }}
                >
                  {/* Header con status badge */}
                  <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                          {survey.title}
                        </h3>
                        {survey.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {survey.description}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(survey.status)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4 space-y-3">
                    {/* Creator & BU */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {survey.creator && (
                        <div className="h-6 px-2.5 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-medium text-gray-700">
                              {survey.creator.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-700 truncate max-w-[120px]">{survey.creator.name}</span>
                        </div>
                      )}
                      {survey.target_bu && (
                        <div className="h-6 px-2.5 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center gap-1.5">
                          <Target className="h-3 w-3 text-gray-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate max-w-[120px]">{survey.target_bu.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{survey.response_count || 0}</span>
                      </div>
                      {survey.questions && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <ClipboardList className="h-3.5 w-3.5" />
                          <span>{survey.questions.length} questions</span>
                        </div>
                      )}
                    </div>

                    {/* Response Status */}
                    {survey.my_response_status === "completed" && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium pt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptySurveysState
              icon={getEmptyIcon(activeTab)}
              title={getEmptyTitle(activeTab)}
              description={getEmptyDescription(activeTab)}
              action={
                activeTab === "my-surveys" && canCreateSurvey ? (
                  <Button 
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white gap-2"
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
