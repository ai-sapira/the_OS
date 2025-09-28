"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { 
  CheckCircle, 
  Copy, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  Gauge,
  Box,
  Link,
  Calendar,
  MoreHorizontal,
  Zap,
  Loader
} from "lucide-react"
import { Modal } from "./modal"
import { ModalToolbar } from "./modal-toolbar"
import { ModalBody } from "./modal-body"
import { ModalFooter } from "./modal-footer"
import { ChipRow } from "./chip-row"
import { ChipControl } from "./chip-control"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover-shadcn"
import { useHotkeys } from "@/hooks/use-hotkeys"

interface Issue {
  id: string
  key: string
  title: string
  description: string
  status: string
  priority?: string
  assignee?: string
  project?: string
  projectColor?: string
  created: string
  updated: string
  reporter?: string
  labels?: string[]
}

interface AcceptIssueModalProps {
  issue: Issue | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (data: AcceptData) => void
  onDecline: (data: DeclineData) => void
  onSnooze: (data: SnoozeData) => void
}

interface AcceptData {
  comment: string
  project: string
  assignee: string
  priority?: string
  subscribeToUpdates: boolean
}


interface DeclineData {
  comment: string
  reason: string
}

interface SnoozeData {
  comment: string
  until: Date
}

type ModalAction = 'accept' | 'decline' | 'snooze' | null

export function AcceptIssueModal({
  issue,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onSnooze
}: AcceptIssueModalProps) {
  const [action, setAction] = useState<ModalAction>('accept')
  const [comment, setComment] = useState("")
  const [project, setProject] = useState("")
  const [assignee, setAssignee] = useState("pablosenabre")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("To Do")
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true)
  const [duplicateOf, setDuplicateOf] = useState("")
  
  // Selector states
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [showPrioritySelector, setShowPrioritySelector] = useState(false)
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false)
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const modalBodyRef = useRef<HTMLDivElement>(null)

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setAction('accept')
      setComment("")
      setProject("")
      setAssignee("pablosenabre")
      setPriority("")
      setStatus("To Do")
      setSubscribeToUpdates(true)
      setDuplicateOf("")
      
      // Close all selectors
      setShowStatusSelector(false)
      setShowPrioritySelector(false)
      setShowAssigneeSelector(false)
      setShowProjectSelector(false)
      
      // Focus on textarea instead of close button
      setTimeout(() => {
        commentRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('States updated:', {
      showStatusSelector,
      showPrioritySelector,
      showAssigneeSelector,
      showProjectSelector
    })
  }, [showStatusSelector, showPrioritySelector, showAssigneeSelector, showProjectSelector])

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (modalBodyRef.current && !modalBodyRef.current.contains(target)) {
        console.log('Clicking outside, closing dropdowns')
        setShowStatusSelector(false)
        setShowPrioritySelector(false)
        setShowAssigneeSelector(false)
        setShowProjectSelector(false)
      }
    }

    if (showStatusSelector || showPrioritySelector || showAssigneeSelector || showProjectSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStatusSelector, showPrioritySelector, showAssigneeSelector, showProjectSelector])

  // Hotkeys for modal actions
  useHotkeys([
    { key: 'enter', modifier: 'cmd', handler: handlePrimaryAction },
  ], open)

  function handlePrimaryAction() {
    if (!issue) return
    
    switch (action) {
      case 'accept':
        if (!project) return
        onAccept({
          comment,
          project,
          assignee,
          priority,
          subscribeToUpdates
        })
        break
      case 'decline':
        if (!comment.trim()) return
        onDecline({
          comment: comment.trim(),
          reason: comment.trim()
        })
        break
      case 'snooze':
        // For simplicity, snooze for 1 day
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        onSnooze({
          comment,
          until: tomorrow
        })
        break
    }
    
    onOpenChange(false)
  }

  if (!issue) return null

  const getActionIcon = () => {
    switch (action) {
      case "accept":
        return <CheckCircle className="h-4 w-4 text-[color:var(--modal-success)]" />
      case "decline":
        return <XCircle className="h-4 w-4 text-[color:var(--modal-danger)]" />
      case "snooze":
        return <Clock className="h-4 w-4 text-[color:var(--modal-accent)]" />
      default:
        return null
    }
  }

  const getActionTitle = () => {
    switch (action) {
      case "accept":
        return `Accept: ${issue.key} ${issue.title}`
      case "decline":
        return `Decline: ${issue.key} ${issue.title}`
      case "snooze":
        return `Snooze: ${issue.key} ${issue.title}`
      default:
        return ""
    }
  }

  const getPrimaryLabel = () => {
    switch (action) {
      case "accept": return "Accept"
      case "decline": return "Decline"
      case "snooze": return "Snooze"
      default: return ""
    }
  }

  const isPrimaryDisabled = () => {
    switch (action) {
      case "accept": return !project
      case "decline": return !comment.trim()
      case "snooze": return false
      default: return true
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={getActionTitle()}
      icon={getActionIcon()}
    >

      <ModalBody>
        <div ref={modalBodyRef}>
        {/* Comment textarea */}
        <div className="relative p-1">
          <Textarea
            ref={commentRef}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-[120px] max-h-[200px] bg-[color:var(--surface-3)] border border-[color:var(--stroke)] rounded-lg px-3 py-3 text-[13px] placeholder:text-[color:var(--muted-text)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--modal-accent)] focus-visible:ring-offset-0 focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)] focus:ring-offset-0"
          />
        </div>

        {/* Action-specific content */}
        {action === 'duplicate' && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Reference to canonical issue</label>
            <input
              type="text"
              placeholder="SAI-123"
              value={duplicateOf}
              onChange={(e) => setDuplicateOf(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-[color:var(--stroke)] rounded-lg bg-[color:var(--surface-3)] focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)]"
            />
          </div>
        )}

        {/* Chip row for accept action */}
        {action === 'accept' && (
          <ChipRow className="mt-3">
            <ChipControl 
              kind="status" 
              label="SAI" 
              icon={<Zap className="w-4 h-4" />} 
              value="Workspace"
            />
            
            {/* Status Selector */}
            <div className="relative">
              <ChipControl 
                kind="select" 
                label="Status" 
                value={status}
                icon={<Loader className="w-4 h-4" />}
                onClick={() => {
                  console.log('Status clicked, current state:', showStatusSelector)
                  setShowStatusSelector(!showStatusSelector)
                }}
              />
              {showStatusSelector && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100]"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--stroke)',
                    zIndex: 100,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {["To Do", "In Progress", "Done", "Canceled"].map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(statusOption)
                          setShowStatusSelector(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Priority Selector */}
            <div className="relative">
              <ChipControl 
                kind="select" 
                label="Priority" 
                value={priority || "Set priority"} 
                icon={<Gauge className="w-4 h-4" />} 
                onClick={() => {
                  console.log('Priority clicked, current state:', showPrioritySelector)
                  setShowPrioritySelector(!showPrioritySelector)
                }}
                hotkey="P"
              />
              {showPrioritySelector && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100]"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--stroke)',
                    zIndex: 100,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {["High", "Mid", "Low"].map((priorityOption) => (
                      <button
                        key={priorityOption}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPriority(priorityOption)
                          setShowPrioritySelector(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {priorityOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Assignee Selector */}
            <div className="relative">
              <ChipControl 
                kind="select" 
                label={assignee} 
                icon={<User className="w-4 h-4" />} 
                onClick={() => {
                  console.log('Assignee clicked, current state:', showAssigneeSelector)
                  setShowAssigneeSelector(!showAssigneeSelector)
                }}
                hotkey="A"
              />
              {showAssigneeSelector && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100]"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--stroke)',
                    zIndex: 100,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {["pablosenabre", "maría.garcía", "juan.pérez"].map((assigneeOption) => (
                      <button
                        key={assigneeOption}
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssignee(assigneeOption)
                          setShowAssigneeSelector(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {assigneeOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Project Selector */}
            <div className="relative">
              <ChipControl 
                kind="select" 
                label={project || "Select project"} 
                icon={<Box className="w-4 h-4" />} 
                onClick={() => {
                  console.log('Project clicked, current state:', showProjectSelector)
                  setShowProjectSelector(!showProjectSelector)
                }}
              />
              {showProjectSelector && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100]"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--stroke)',
                    zIndex: 100,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {["Tecnología", "Marketing", "Ventas", "Recursos Humanos"].map((projectOption) => (
                      <button
                        key={projectOption}
                        onClick={(e) => {
                          e.stopPropagation()
                          setProject(projectOption)
                          setShowProjectSelector(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {projectOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ChipRow>
        )}
        </div>
      </ModalBody>

      <ModalFooter
        leftContent={
          <div className="flex items-center space-x-2">
            <Switch 
              id="subscribe" 
              checked={subscribeToUpdates}
              onCheckedChange={setSubscribeToUpdates}
            />
            <label 
              htmlFor="subscribe" 
              className="text-sm text-[color:var(--muted-text)] cursor-pointer"
            >
              Subscribe to updates
            </label>
          </div>
        }
        secondaryLabel="Cancel"
        onSecondary={() => onOpenChange(false)}
        primaryLabel={getPrimaryLabel()}
        primaryDisabled={isPrimaryDisabled()}
        onPrimary={handlePrimaryAction}
      />
    </Modal>
  )
}

AcceptIssueModal.displayName = "AcceptIssueModal"
