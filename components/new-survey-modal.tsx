"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
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
  Circle,
  Mail,
  MessageSquare,
  User,
  ChevronRight,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InitiativesAPI } from "@/lib/api/initiatives"
import { SurveysAPI, type CreateSurveyInput, type CreateQuestionInput } from "@/lib/api/surveys"
import type { SurveyAudience, QuestionType, User as UserType, Initiative } from "@/lib/database/types"

interface NewSurveyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSurvey?: () => void
}

// Question type configurations
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

// PropertyChip component - usando el estilo de la plataforma
interface PropertyChipProps {
  icon: React.ReactNode
  value: string
  options: Array<{ name: string; label: string; icon?: React.ReactNode }>
  onSelect: (value: string) => void
}

function PropertyChip({ icon, value, options, onSelect }: PropertyChipProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          <div className="flex-shrink-0 text-gray-500">
            {icon}
          </div>
          <span className="text-gray-700 whitespace-nowrap">
            {value}
          </span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[240px] p-1 rounded-2xl border-gray-200 shadow-lg"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="space-y-0.5">
          {options.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                onSelect(option.name)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// AudienceSelector - Dropdown jerárquico para selección de audiencia
interface AudienceSelectorProps {
  targetAudience: SurveyAudience
  targetBuId: string | null
  selectedUserIds: string[]
  initiatives: Array<{ id: string; name: string }>
  users: UserType[]
  onAudienceChange: (audience: SurveyAudience) => void
  onBuChange: (buId: string | null) => void
  onUsersChange: (userIds: string[]) => void
}

function AudienceSelector({
  targetAudience,
  targetBuId,
  selectedUserIds,
  initiatives,
  users,
  onAudienceChange,
  onBuChange,
  onUsersChange,
}: AudienceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'main' | 'bu' | 'users'>('main')
  const [searchQuery, setSearchQuery] = useState('')

  // Reset view when closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView('main')
        setSearchQuery('')
      }, 200)
    }
  }, [open])

  // Compute display value
  const getDisplayValue = () => {
    if (targetAudience === 'all') return 'All employees'
    if (targetAudience === 'bu_specific') {
      const bu = initiatives.find(i => i.id === targetBuId)
      return bu ? bu.name : 'Select BU'
    }
    if (targetAudience === 'role_specific') {
      return selectedUserIds.length > 0 
        ? `${selectedUserIds.length} employee${selectedUserIds.length > 1 ? 's' : ''}`
        : 'Select employees'
    }
    return 'All employees'
  }

  const getDisplayIcon = () => {
    if (targetAudience === 'all') return <UsersIcon className="h-3.5 w-3.5 text-gray-500" />
    if (targetAudience === 'bu_specific') return <Target className="h-3.5 w-3.5 text-gray-500" />
    return <User className="h-3.5 w-3.5 text-gray-500" />
  }

  // Filter users by search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleUserSelection = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId]
    onUsersChange(newSelection)
  }

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
        className="w-[280px] p-0 rounded-2xl border-gray-200 shadow-lg overflow-hidden"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Main View */}
          {view === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="p-1"
            >
              <div className="space-y-0.5">
                {/* All employees */}
                <button
                  onClick={() => {
                    onAudienceChange('all')
                    onBuChange(null)
                    onUsersChange([])
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                    targetAudience === 'all' ? 'bg-blue-50' : ''
                  }`}
                >
                  <UsersIcon className="w-4 h-4 text-gray-600" />
                  <span className="flex-1">All employees</span>
                  {targetAudience === 'all' && <Check className="h-4 w-4 text-blue-600" />}
                </button>

                {/* Specific BU - with navigation */}
                <button
                  onClick={() => setView('bu')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                    targetAudience === 'bu_specific' ? 'bg-blue-50' : ''
                  }`}
                >
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="flex-1">Specific Business Unit</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                {/* Specific employees - with navigation */}
                <button
                  onClick={() => setView('users')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                    targetAudience === 'role_specific' ? 'bg-blue-50' : ''
                  }`}
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="flex-1">Specific employees</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* BU Selection View */}
          {view === 'bu' && (
            <motion.div
              key="bu"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="p-1"
            >
              {/* Back button */}
              <button
                onClick={() => setView('main')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Back</span>
              </button>
              
              <div className="border-t border-gray-100 my-1" />
              
              {/* BU List */}
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                {initiatives.map((initiative) => (
                  <button
                    key={initiative.id}
                    onClick={() => {
                      onAudienceChange('bu_specific')
                      onBuChange(initiative.id)
                      onUsersChange([])
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                      targetBuId === initiative.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Target className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="flex-1 truncate">{initiative.name}</span>
                    {targetBuId === initiative.id && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Users Selection View */}
          {view === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
              style={{ maxHeight: '400px' }}
            >
              {/* Header with back button */}
              <div className="p-2 border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setView('main')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back</span>
                </button>
              </div>

              {/* Search */}
              <div className="p-2 border-b border-gray-100 flex-shrink-0">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>

              {/* Users List - Con scroll funcionando */}
              <div className="flex-1 overflow-y-auto min-h-0 p-1">
                <div className="space-y-0.5">
                  {filteredUsers.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-gray-400">
                      No employees found
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                          selectedUserIds.includes(user.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          {user.email && (
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          )}
                        </div>
                        {selectedUserIds.includes(user.id) && (
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Footer with action buttons */}
              {selectedUserIds.length > 0 && (
                <div className="p-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 px-2">
                    {selectedUserIds.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUsersChange([])}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAudienceChange('role_specific')
                        onBuChange(null)
                        setOpen(false)
                      }}
                      className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

// Question Editor Component
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
  const [typeOpen, setTypeOpen] = useState(false)

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
    >
      {/* Drag Handle - Mejorado para no superponerse */}
      <div className="absolute -left-6 top-5 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
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

        {/* Question Type Selector - Estilo de filtros */}
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
            >
              <div className="flex-shrink-0 text-gray-500">
                {questionTypeConfig?.icon}
              </div>
              <span className="text-gray-700">{questionTypeConfig?.label}</span>
              <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${typeOpen ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[280px] p-1 rounded-2xl border-gray-200 shadow-lg" 
            align="start"
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgb(229 229 229)',
              backgroundColor: '#ffffff',
            }}
          >
            <div className="space-y-0.5">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    onUpdate({ question_type: type.value })
                    setTypeOpen(false)
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left ${
                    question.question_type === type.value ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{type.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                  {question.question_type === type.value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
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
              <AnimatePresence>
                {localOptions.map((option, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 group/option"
                  >
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
                        className="opacity-0 group-hover/option:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
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
      </div>
    </motion.div>
  )
}

export function NewSurveyModal({ open, onOpenChange, onCreateSurvey }: NewSurveyModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [channel, setChannel] = useState<"teams" | "email">("teams")
  const [targetAudience, setTargetAudience] = useState<SurveyAudience>("all")
  const [targetBuId, setTargetBuId] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [allowAnonymous, setAllowAnonymous] = useState(false)
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([
    {
      question_text: "",
      question_type: "text",
      is_required: true,
      order_index: 0
    }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Load users and initiatives when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!open) return
      
      setLoadingData(true)
      try {
        const [availableUsers, availableInitiatives] = await Promise.all([
          SurveysAPI.getAvailableUsers(),
          InitiativesAPI.getInitiatives()
        ])
        setUsers(availableUsers)
        setInitiatives(availableInitiatives)
        console.log('[NewSurveyModal] Data loaded - Users:', availableUsers.length, 'Initiatives:', availableInitiatives.length)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    loadData()
  }, [open])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setChannel("teams")
    setTargetAudience("all")
    setTargetBuId(null)
    setSelectedUserIds([])
    setAllowAnonymous(false)
    setQuestions([{
      question_text: "",
      question_type: "text",
      is_required: true,
      order_index: 0
    }])
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return
    }

    const validQuestions = questions.filter(q => q.question_text.trim())
    
    if (validQuestions.length === 0) {
      alert("Please add at least one question")
      return
    }

    // Validate audience selection
    if (targetAudience === 'bu_specific' && !targetBuId) {
      alert("Please select a Business Unit")
      return
    }

    if (targetAudience === 'role_specific' && selectedUserIds.length === 0) {
      alert("Please select at least one employee")
      return
    }

    setIsSubmitting(true)

    try {
      const surveyData: CreateSurveyInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        target_audience: targetAudience,
        target_bu_id: targetAudience === "bu_specific" ? targetBuId : null,
        target_roles: targetAudience === "role_specific" ? selectedUserIds : null, // Store user IDs in target_roles for now
        allow_anonymous: allowAnonymous,
        questions: validQuestions.map((q, idx) => ({
          ...q,
          order_index: idx
        }))
      }

      const mockCreatorId = '11111111-aaaa-2222-2222-222222222222' // María García (SAP - Aurovitas)
      
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

  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "text",
        is_required: true,
        order_index: questions.length
      }
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, updates: Partial<CreateQuestionInput>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
  }

  const channelOptions = [
    { name: "teams", label: "Microsoft Teams", icon: <MessageSquare className="w-2.5 h-2.5 text-gray-600" /> },
    { name: "email", label: "Email", icon: <Mail className="w-2.5 h-2.5 text-gray-600" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Simple con solo close button */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium">Gonvarri</span>
              <span className="text-neutral-400">›</span>
              <span className="font-medium text-neutral-900">New survey</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:bg-gray-100 hover:text-neutral-700"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Hidden for accessibility */}
          <DialogTitle className="sr-only">Create New Survey</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new survey to gather feedback from employees
          </DialogDescription>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {/* Título - Sin encuadre, editable inline */}
            <input
              type="text"
              placeholder="Survey title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-medium text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0"
              autoFocus
            />

            {/* Descripción - Sin encuadre, editable inline con auto-resize */}
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              className="w-full min-h-[32px] text-sm text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none overflow-hidden"
              rows={1}
            />

            {/* Settings - Con chips de bordes punteados - MÁS CERCA */}
            <div className="space-y-3 pt-1">
              {/* Row 1: Canal y Audience - En la misma línea */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Channel</span>
                  <PropertyChip
                    icon={channel === "teams" ? <MessageSquare className="h-3.5 w-3.5 text-gray-500" /> : <Mail className="h-3.5 w-3.5 text-gray-500" />}
                    value={channel === "teams" ? "Microsoft Teams" : "Email"}
                    options={channelOptions}
                    onSelect={(value) => setChannel(value as "teams" | "email")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Send to</span>
                  <AudienceSelector
                    targetAudience={targetAudience}
                    targetBuId={targetBuId}
                    selectedUserIds={selectedUserIds}
                    initiatives={initiatives}
                    users={users}
                    onAudienceChange={setTargetAudience}
                    onBuChange={setTargetBuId}
                    onUsersChange={setSelectedUserIds}
                  />
                </div>
              </div>

              {/* Row 2: Anonymous toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Allow anonymous responses</span>
                <Switch
                  checked={allowAnonymous}
                  onCheckedChange={setAllowAnonymous}
                  className="data-[state=checked]:bg-blue-500 scale-90"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="pt-4 space-y-4">
              <AnimatePresence mode="popLayout">
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
              </AnimatePresence>

              {/* Add Question Button */}
              <motion.button
                type="button"
                onClick={addQuestion}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add question
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 flex-shrink-0 bg-white">
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {isSubmitting ? "Creating..." : "Create survey"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
