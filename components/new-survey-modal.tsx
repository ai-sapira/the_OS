"use client"

import { useState, useEffect } from "react"
import { 
  X, 
  Maximize2, 
  ChevronDown, 
  Plus, 
  Trash2, 
  GripVertical,
  CircleDot,
  AlignLeft,
  Star,
  CheckSquare,
  Users as UsersIcon,
  Target,
  Circle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { SurveysAPI, type CreateSurveyInput, type CreateQuestionInput } from "@/lib/api/surveys"
import type { SurveyAudience, QuestionType } from "@/lib/database/types"

interface NewSurveyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSurvey?: () => void
}

// Question type configurations with icons
const QUESTION_TYPES: { 
  value: QuestionType; 
  label: string; 
  icon: React.ReactNode;
  description: string;
}[] = [
  { 
    value: "text", 
    label: "Short answer", 
    icon: <AlignLeft className="w-4 h-4" />,
    description: "Text response"
  },
  { 
    value: "multiple_choice", 
    label: "Multiple choice", 
    icon: <CircleDot className="w-4 h-4" />,
    description: "Choose from options"
  },
  { 
    value: "rating", 
    label: "Rating scale", 
    icon: <Star className="w-4 h-4" />,
    description: "1 to 5 stars"
  },
  { 
    value: "yes_no", 
    label: "Yes/No", 
    icon: <CheckSquare className="w-4 h-4" />,
    description: "Binary choice"
  },
]

// PropertyChip component - simplified
interface PropertyChipProps {
  icon: React.ReactNode
  label: string
  value: string
  options: Array<{ name: string; label: string; icon?: React.ReactNode }>
  onSelect: (value: string) => void
}

function PropertyChip({ icon, label, value, options, onSelect }: PropertyChipProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          {icon}
          <span className="text-gray-700">{value}</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                onSelect(option.name)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors text-left"
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Question Editor Component - Visual and simple like Google Forms
interface QuestionEditorProps {
  question: CreateQuestionInput
  index: number
  onUpdate: (updates: Partial<CreateQuestionInput>) => void
  onRemove: () => void
  canRemove: boolean
}

function QuestionEditor({ question, index, onUpdate, onRemove, canRemove }: QuestionEditorProps) {
  const [localOptions, setLocalOptions] = useState<string[]>(
    question.options || ["Option 1"]
  )

  // Update parent when local options change
  useEffect(() => {
    if (question.question_type === "multiple_choice") {
      onUpdate({ options: localOptions.filter(o => o.trim()) })
    }
  }, [localOptions, question.question_type])

  const addOption = () => {
    setLocalOptions([...localOptions, `Option ${localOptions.length + 1}`])
  }

  const updateOption = (idx: number, value: string) => {
    const newOptions = [...localOptions]
    newOptions[idx] = value
    setLocalOptions(newOptions)
  }

  const removeOption = (idx: number) => {
    if (localOptions.length > 1) {
      setLocalOptions(localOptions.filter((_, i) => i !== idx))
    }
  }

  const questionTypeConfig = QUESTION_TYPES.find(t => t.value === question.question_type)

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      {/* Drag Handle */}
      <div className="absolute left-2 top-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Question Input */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Question ${index + 1}`}
              value={question.question_text}
              onChange={(e) => onUpdate({ question_text: e.target.value })}
              className="w-full text-base font-medium text-gray-900 placeholder:text-gray-400 border-none outline-none focus:outline-none focus:ring-0 p-0 bg-transparent"
            />
          </div>

          {/* Remove Button */}
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question Type Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-sm border-gray-200"
            >
              {questionTypeConfig?.icon}
              <span>{questionTypeConfig?.label}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2" align="start">
            <div className="space-y-1">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onUpdate({ question_type: type.value })}
                  className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                    question.question_type === type.value ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <div className="mt-0.5">{type.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Question Type Specific Content */}
        <div className="pt-2">
          {/* Multiple Choice Options */}
          {question.question_type === "multiple_choice" && (
            <div className="space-y-2">
              {localOptions.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none transition-colors py-1"
                  />
                  {localOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="h-8 text-xs text-gray-600 gap-1"
              >
                <Circle className="h-3 w-3" />
                Add option
              </Button>
            </div>
          )}

          {/* Text Answer Preview */}
          {question.question_type === "text" && (
            <div className="border-b border-gray-200 py-2">
              <span className="text-sm text-gray-400">Short answer text</span>
            </div>
          )}

          {/* Rating Preview */}
          {question.question_type === "rating" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-gray-300" />
              ))}
            </div>
          )}

          {/* Yes/No Preview */}
          {question.question_type === "yes_no" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-600">Yes</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-600">No</span>
              </div>
            </div>
          )}
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-end pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Switch
              checked={question.is_required}
              onCheckedChange={(checked) => onUpdate({ is_required: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
            <span className="text-xs text-gray-600">Required</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NewSurveyModal({ open, onOpenChange, onCreateSurvey }: NewSurveyModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState<SurveyAudience>("all")
  const [targetBuId, setTargetBuId] = useState<string | null>(null)
  const [allowAnonymous, setAllowAnonymous] = useState(false)
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([
    {
      question_text: "",
      question_type: "text",
      is_required: false,
      order_index: 0
    }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { initiatives } = useSupabaseData()

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTargetAudience("all")
    setTargetBuId(null)
    setAllowAnonymous(false)
    setQuestions([{
      question_text: "",
      question_type: "text",
      is_required: false,
      order_index: 0
    }])
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return
    }

    // Filter out empty questions
    const validQuestions = questions.filter(q => q.question_text.trim())
    
    if (validQuestions.length === 0) {
      alert("Please add at least one question")
      return
    }

    setIsSubmitting(true)

    try {
      const surveyData: CreateSurveyInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        target_audience: targetAudience,
        target_bu_id: targetAudience === "bu_specific" ? targetBuId : null,
        allow_anonymous: allowAnonymous,
        questions: validQuestions.map((q, idx) => ({
          ...q,
          order_index: idx
        }))
      }

      // TODO: Get actual user ID from auth context
      const mockCreatorId = '11111111-1111-1111-1111-111111111111' // Pablo Senabre (SAP)
      
      await SurveysAPI.createSurvey(surveyData, mockCreatorId)
      
      onCreateSurvey?.()
      onOpenChange(false)
      setTimeout(resetForm, 300)
    } catch (error) {
      console.error("Error creating survey:", error)
      alert("Failed to create survey. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  // Add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "text",
        is_required: false,
        order_index: questions.length
      }
    ])
  }

  // Remove a question
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  // Update a question
  const updateQuestion = (index: number, updates: Partial<CreateQuestionInput>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
  }

  const selectedBu = targetBuId ? initiatives.find(i => i.id === targetBuId) : null

  const audienceOptions = [
    { name: "all", label: "All employees", icon: <UsersIcon className="w-4 h-4 text-gray-600" /> },
    { name: "bu_specific", label: "Specific Business Unit", icon: <Target className="w-4 h-4 text-gray-600" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 border-0 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <DialogHeader className="px-8 pt-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Untitled survey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-semibold text-gray-900 placeholder:text-gray-400 border-none outline-none focus:outline-none focus:ring-0 p-0 w-full"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <textarea
                placeholder="Survey description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-gray-700 placeholder:text-gray-400 border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none min-h-[60px]"
              />
            </div>

            {/* Settings Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
              
              {/* Audience */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Who can respond?</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <PropertyChip
                    icon={<UsersIcon className="h-3.5 w-3.5" />}
                    label="Audience"
                    value={targetAudience === "all" ? "All employees" : "Specific BU"}
                    options={audienceOptions}
                    onSelect={(value) => setTargetAudience(value as SurveyAudience)}
                  />

                  {targetAudience === "bu_specific" && (
                    <PropertyChip
                      icon={<Target className="h-3.5 w-3.5" />}
                      label="Business Unit"
                      value={selectedBu?.name || "Select BU"}
                      options={initiatives.map(initiative => ({
                        name: initiative.id,
                        label: initiative.name,
                        icon: <Target className="w-4 h-4 text-gray-600" />
                      }))}
                      onSelect={(value) => setTargetBuId(value)}
                    />
                  )}
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">Allow anonymous responses</div>
                  <div className="text-xs text-gray-500">Respondents won't be identified</div>
                </div>
                <Switch
                  checked={allowAnonymous}
                  onCheckedChange={setAllowAnonymous}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  onUpdate={(updates) => updateQuestion(index, updates)}
                  onRemove={() => removeQuestion(index)}
                  canRemove={questions.length > 1}
                />
              ))}

              {/* Add Question Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add question
              </Button>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0 bg-white">
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
          >
            {isSubmitting ? "Creating..." : "Create survey"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
