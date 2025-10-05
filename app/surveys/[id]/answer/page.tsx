"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ResizableAppShell, ResizablePageSheet } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { SurveysAPI, type SurveyWithRelations } from "@/lib/api/surveys"
import type { SurveyQuestion } from "@/lib/database/types"
import { 
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"

export default function SurveyAnswerPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [responses, setResponses] = useState<Record<string, string>>({})
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
        
        // Initialize responses with empty values
        const initialResponses: Record<string, string> = {}
        data.questions?.forEach(q => {
          initialResponses[q.id] = ""
        })
        setResponses(initialResponses)
      } catch (err) {
        console.error("Error loading survey:", err)
        setError("Failed to load survey")
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [surveyId])

  // Handle response change
  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!survey) return

    // Validate required questions
    const unansweredRequired = survey.questions?.filter(q => 
      q.is_required && !responses[q.id]?.trim()
    )

    if (unansweredRequired && unansweredRequired.length > 0) {
      alert(`Please answer all required questions (${unansweredRequired.length} remaining)`)
      return
    }

    setSubmitting(true)
    try {
      // TODO: Get actual user ID from auth context
      const currentUserId = 'b8023796-e4c8-4752-9f5c-5b140c990f06' // Guillermo (guillermo@sapira.ai)

      // Submit all responses
      const responsePromises = Object.entries(responses)
        .filter(([_, value]) => value.trim())
        .map(([questionId, value]) => 
          SurveysAPI.submitResponse(surveyId, {
            question_id: questionId,
            response_value: value,
            responder_user_id: survey.allow_anonymous ? null : currentUserId
          })
        )

      await Promise.all(responsePromises)
      setSubmitted(true)
    } catch (err) {
      console.error("Error submitting response:", err)
      alert("Failed to submit response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Render question input based on type
  const renderQuestionInput = (question: SurveyQuestion) => {
    const value = responses[question.id] || ""

    switch (question.question_type) {
      case "text":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Your answer..."
            className="min-h-[100px]"
          />
        )

      case "multiple_choice":
        return (
          <RadioGroup value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                  <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "yes_no":
        return (
          <RadioGroup value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">No</Label>
              </div>
            </div>
          </RadioGroup>
        )

      case "rating":
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating.toString())}
                className="transition-colors"
              >
                <Star
                  className={`h-8 w-8 ${
                    parseInt(value) >= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Your answer..."
          />
        )
    }
  }

  if (submitted) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center min-h-screen p-6">
            <Card className="max-w-md w-full p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
                <p className="text-gray-600">
                  Your response has been submitted successfully.
                </p>
              </div>
              <Button
                onClick={() => router.push("/surveys")}
                className="w-full"
              >
                Back to Surveys
              </Button>
            </Card>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
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
            </div>
          </div>
        }
      >
        <div className="p-6 max-w-3xl mx-auto">
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
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
                {survey.description && (
                  <p className="text-gray-600">{survey.description}</p>
                )}
                {survey.allow_anonymous && (
                  <p className="text-sm text-gray-500 italic">
                    This survey is anonymous. Your responses will not be linked to your identity.
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {survey.questions?.map((question, index) => (
                  <Card key={question.id} className="p-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900">
                            {question.question_text}
                            {question.is_required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="pl-6">
                      {renderQuestionInput(question)}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/surveys")}
                  disabled={submitting}
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

