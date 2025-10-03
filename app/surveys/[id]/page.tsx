"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SurveysAPI, type SurveyWithRelations } from "@/lib/api/surveys"
import { 
  ArrowLeft,
  Calendar,
  Users,
  MessageSquare,
  Target,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react"

export default function SurveyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load survey
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true)
        const data = await SurveysAPI.getSurveyById(surveyId)
        if (!data) {
          setError("Survey not found")
          return
        }
        setSurvey(data)
      } catch (err) {
        console.error("Error loading survey:", err)
        setError("Failed to load survey")
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [surveyId])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Draft</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Closed</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
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
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/surveys")}
                  className="flex items-center gap-2 text-[14px] text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Surveys
                </button>
              </div>

              {/* Actions */}
              {survey && survey.status === "active" && survey.my_response_status === "pending" && (
                <Button
                  onClick={() => router.push(`/surveys/${surveyId}/answer`)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Answer Survey
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="p-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error || !survey ? (
            <Card className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Survey Not Found</h2>
                <p className="text-gray-600">
                  {error || "The survey you're looking for doesn't exist or has been removed."}
                </p>
              </div>
              <Button onClick={() => router.push("/surveys")}>
                Back to Surveys
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Survey Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
                    {survey.description && (
                      <p className="text-lg text-gray-600">{survey.description}</p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(survey.status)}
                  </div>
                </div>

                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  {/* Creator */}
                  {survey.creator && (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {survey.creator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>Created by {survey.creator.name}</span>
                    </div>
                  )}

                  {/* Questions count */}
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{survey.questions?.length || 0} questions</span>
                  </div>

                  {/* Responses count */}
                  {typeof survey.response_count === 'number' && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{survey.response_count} responses</span>
                    </div>
                  )}

                  {/* Target audience */}
                  {survey.target_audience !== "all" && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>
                        {survey.target_audience === "bu_specific" && survey.target_bu
                          ? survey.target_bu.name
                          : "Specific audience"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions Preview */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions</h2>
                <div className="space-y-4">
                  {survey.questions?.map((question, index) => (
                    <div key={question.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {question.question_type === "text" && "Short answer"}
                          {question.question_type === "multiple_choice" && "Multiple choice"}
                          {question.question_type === "rating" && "Rating scale"}
                          {question.question_type === "yes_no" && "Yes/No"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Status-specific messages */}
              {survey.my_response_status === "completed" && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">You've already responded</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Thank you for completing this survey.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {survey.status === "closed" && (
                <Card className="p-6 bg-gray-50 border-gray-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Survey Closed</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        This survey is no longer accepting responses.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.push("/surveys")}
                >
                  Back to Surveys
                </Button>
                
                {survey.status === "active" && survey.my_response_status === "pending" && (
                  <Button
                    onClick={() => router.push(`/surveys/${surveyId}/answer`)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Answer Survey
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

