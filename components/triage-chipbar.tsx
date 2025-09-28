"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TriageWrapper } from "@/components/triage-wrapper"
import { Calendar, User, Folder, Tag, AlertCircle } from "lucide-react"

interface TriageChipbarProps {
  issue: any
  onTriageAction: (action: string) => void
  className?: string
}

export function TriageChipbar({ issue, onTriageAction, className }: TriageChipbarProps) {
  if (!issue) return null

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      case "high": return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
      case "medium": return <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
      case "low": return <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
      default: return <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-red-200 text-red-700 bg-red-50"
      case "high": return "border-orange-200 text-orange-700 bg-orange-50"
      case "medium": return "border-yellow-200 text-yellow-700 bg-yellow-50"
      case "low": return "border-gray-200 text-gray-600 bg-gray-50"
      default: return "border-gray-200 text-gray-600 bg-gray-50"
    }
  }

  return (
    <div 
      className={`flex items-center justify-between px-6 py-2 bg-white sticky z-20 ${className}`}
      style={{ 
        height: 'var(--chipbar-h)',
        top: 'var(--header-h)',
        borderBottom: '1px solid var(--stroke)'
      }}
    >
      {/* Chips de propiedades */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Status - pill compacta */}
        <div className="h-5 px-2 rounded-full text-[11px] bg-[rgba(99,102,241,.08)] text-[#4F46E5] flex items-center">
          {issue.status || 'Triage'}
        </div>

        {/* Priority */}
        <button 
          className="h-8 px-3 rounded-full text-[13px] flex items-center gap-2 bg-white transition-colors duration-150"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          {getPriorityIcon(issue.priority)}
          <span className="capitalize">{issue.priority || 'Medium'}</span>
        </button>

        {/* Assignee */}
        <button 
          className="h-8 px-3 rounded-full text-[13px] flex items-center gap-2 bg-white transition-colors duration-150"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          {issue.assignee_id ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[10px]">
                  {issue.assignee?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{issue.assignee?.name || 'Assigned'}</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" style={{ color: 'var(--text-3)' }} />
              <span style={{ color: 'var(--text-2)' }}>Unassigned</span>
            </>
          )}
        </button>

        {/* Project */}
        <button 
          className="h-8 px-3 rounded-full text-[13px] flex items-center gap-2 bg-white transition-colors duration-150"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <div className={`w-2 h-2 rounded-full ${issue.project?.color || 'bg-gray-400'}`} />
          <span>{issue.project?.name || 'No Project'}</span>
        </button>

        {/* Due Date */}
        {issue.due_date && (
          <button 
            className="h-8 px-3 rounded-full text-[13px] flex items-center gap-2 bg-white transition-colors duration-150"
            style={{
              border: '1px solid var(--stroke)',
              color: 'var(--text-1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Calendar className="h-4 w-4" style={{ color: 'var(--text-3)' }} />
            <span>{new Date(issue.due_date).toLocaleDateString()}</span>
          </button>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex items-center gap-1">
            {issue.labels.slice(0, 3).map((label: any) => (
              <div 
                key={label.id || label.name} 
                className="h-5 px-2 rounded-full text-[11px] bg-[rgba(99,102,241,.08)] text-[#4F46E5] flex items-center"
              >
                {label.name || label}
              </div>
            ))}
            {issue.labels.length > 3 && (
              <div className="h-5 px-2 rounded-full text-[11px] bg-[rgba(99,102,241,.08)] text-[#4F46E5] flex items-center">
                +{issue.labels.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones de Triage */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button 
          className="h-9 px-3 inline-flex items-center gap-2 rounded-md bg-white transition-colors duration-160"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onClick={() => onTriageAction('accept')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Accept
          <div 
            className="h-5 px-1.5 rounded-md text-[11px] flex items-center"
            style={{
              border: '1px solid var(--stroke)',
              backgroundColor: '#F7F7FA'
            }}
          >
            A
          </div>
        </button>
        <button 
          className="h-9 px-3 inline-flex items-center gap-2 rounded-md bg-white transition-colors duration-160"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onClick={() => onTriageAction('decline')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Decline
          <div 
            className="h-5 px-1.5 rounded-md text-[11px] flex items-center"
            style={{
              border: '1px solid var(--stroke)',
              backgroundColor: '#F7F7FA'
            }}
          >
            D
          </div>
        </button>
        <button 
          className="h-9 px-3 inline-flex items-center gap-2 rounded-md bg-white transition-colors duration-160"
          style={{
            border: '1px solid var(--stroke)',
            color: 'var(--text-1)'
          }}
          onClick={() => onTriageAction('snooze')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17,20,24,.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Snooze
          <div 
            className="h-5 px-1.5 rounded-md text-[11px] flex items-center"
            style={{
              border: '1px solid var(--stroke)',
              backgroundColor: '#F7F7FA'
            }}
          >
            S
          </div>
        </button>
      </div>
    </div>
  )
}
