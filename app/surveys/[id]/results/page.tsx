"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SurveysAPI } from "@/lib/api/surveys"
import type { SurveyWithRelations, SurveyQuestion, SurveyResponse } from "@/lib/database/types"
import { 
  ArrowLeft,
  Users,
  ClipboardList,
  TrendingUp,
  Download,
  MoreVertical,
  Circle,
  Star,
  CheckSquare
} from "lucide-react"

export default function SurveyResultsPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithRelations | null>(null)
  const [results, setResults] = useState<{
    questions: SurveyQuestion[]
    responses: SurveyResponse[]
    stats: {
      total_responses: number
      completion_rate: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSurveyAndResults()
  }, [surveyId])

  const loadSurveyAndResults = async () => {
    try {
      setLoading(true)
      const [surveyData, resultsData] = await Promise.all([
        SurveysAPI.getSurveyById(surveyId),
        SurveysAPI.getSurveyResults(surveyId)
      ])
      setSurvey(surveyData)
      setResults(resultsData)
    } catch (error) {
      console.error("Error loading survey results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  if (!survey) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Survey not found</h2>
            <Button onClick={() => router.push("/surveys")}>
              Back to Surveys
            </Button>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  // Get response count per question
  const getResponsesForQuestion = (questionId: string) => {
    return results?.responses.filter(r => r.question_id === questionId) || []
  }

  // Calculate multiple choice distribution
  const getMultipleChoiceStats = (question: SurveyQuestion) => {
    const responses = getResponsesForQuestion(question.id)
    const options = question.options || []
    
    const distribution = options.map(option => {
      const count = responses.filter(r => r.response_value === option).length
      const percentage = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0
      return { option, count, percentage }
    })

    return distribution
  }

  // Calculate rating average
  const getRatingStats = (question: SurveyQuestion) => {
    const responses = getResponsesForQuestion(question.id)
    const ratings = responses.map(r => parseInt(r.response_value || "0")).filter(r => !isNaN(r))
    
    if (ratings.length === 0) return { average: 0, total: 0 }
    
    const sum = ratings.reduce((acc, val) => acc + val, 0)
    const average = sum / ratings.length
    
    return { average: parseFloat(average.toFixed(1)), total: ratings.length }
  }

  return (
    <ResizableAppShell>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/surveys")}
                  className="h-8 gap-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Surveys
                </Button>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium truncate max-w-md">{survey.title}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="h-8 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
                {survey.description && (
                  <p className="text-base text-gray-600">{survey.description}</p>
                )}
              </div>
              <Badge className={
                survey.status === "active" 
                  ? "bg-green-100 text-green-700 border-green-200" 
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }>
                {survey.status}
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{results?.stats.total_responses || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{results?.questions.length || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{results?.stats.completion_rate || 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Questions & Responses */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Responses by Question</h2>
            
            {results?.questions.map((question, index) => {
              const responses = getResponsesForQuestion(question.id)
              
              return (
                <Card key={question.id} className="p-6 border border-gray-200">
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-base font-semibold text-gray-900">
                          {index + 1}. {question.question_text}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {responses.length} responses
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {question.question_type === "text" && "Short answer"}
                        {question.question_type === "multiple_choice" && "Multiple choice"}
                        {question.question_type === "rating" && "Rating scale"}
                        {question.question_type === "yes_no" && "Yes/No"}
                      </p>
                    </div>

                    {/* Multiple Choice Results */}
                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-3 pt-2">
                        {getMultipleChoiceStats(question).map((stat, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Circle className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-700">{stat.option}</span>
                              </div>
                              <span className="text-gray-600 font-medium">
                                {stat.count} ({stat.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${stat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rating Results */}
                    {question.question_type === "rating" && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-5 w-5 ${
                                  star <= getRatingStats(question).average 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {getRatingStats(question).average}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({getRatingStats(question).total} ratings)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Text Responses */}
                    {question.question_type === "text" && (
                      <div className="space-y-2 pt-2">
                        {responses.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {responses.map((response, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">{response.response_value || "No response"}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No responses yet</p>
                        )}
                      </div>
                    )}

                    {/* Yes/No Results */}
                    {question.question_type === "yes_no" && (
                      <div className="space-y-3 pt-2">
                        {["Yes", "No"].map((option, idx) => {
                          const count = responses.filter(r => 
                            r.response_value?.toLowerCase() === option.toLowerCase()
                          ).length
                          const percentage = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0
                          
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-700">{option}</span>
                                </div>
                                <span className="text-gray-600 font-medium">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}


