"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type ChipControlKind = 'select' | 'button' | 'status'

export interface ChipControlProps {
  kind?: ChipControlKind
  label: string
  value?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  hotkey?: string
  className?: string
}

export function ChipControl({
  kind = 'button',
  label,
  value,
  icon,
  onClick,
  disabled = false,
  active = false,
  hotkey,
  className
}: ChipControlProps) {
  const displayValue = value || label
  const isClickable = kind !== 'status' && !disabled
  const showChevron = kind === 'select'
  
  const chipContent = (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden inline-flex items-center h-8 px-3 rounded-xl border text-[13px] gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)] focus:ring-offset-1",
        // Base styles
        "border-[color:var(--stroke)] bg-[color:var(--surface-3)]",
        // Interactive states
        isClickable && "hover:bg-[color:var(--surface-1)] cursor-pointer hover:scale-105 hover:shadow-lg",
        // Active state
        active && "bg-[color:var(--surface-1)] border-[color:var(--modal-accent)] scale-105 shadow-md",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        // Status (non-interactive) state
        kind === 'status' && "cursor-default",
        className
      )}
    >
      {/* Background animation effect */}
      {isClickable && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
      
      {icon && (
        <span className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      )}
      
      {displayValue && (
        <span className="relative truncate text-[color:var(--foreground)] transition-all duration-300 group-hover:font-medium">
          {displayValue}
        </span>
      )}
      
      {hotkey && isClickable && (
        <span className="relative ml-1 text-[10px] text-[color:var(--muted-text)] bg-[color:var(--surface-1)] px-1.5 py-0.5 rounded border transition-all duration-300 group-hover:scale-110 group-hover:bg-[color:var(--modal-accent)] group-hover:text-white">
          {hotkey.toUpperCase()}
        </span>
      )}
      
      {showChevron && (
        <ChevronDown className="relative w-3 h-3 text-[color:var(--muted-text)] flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
      )}
    </button>
  )

  if (hotkey && isClickable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {chipContent}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{label} ({hotkey.toUpperCase()})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return chipContent
}

ChipControl.displayName = "ChipControl"
