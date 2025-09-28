"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ModalFooterProps {
  primaryLabel?: string
  primaryDisabled?: boolean
  onPrimary?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  leftContent?: React.ReactNode
  variant?: 'default' | 'danger'
  className?: string
  children?: React.ReactNode
}

export function ModalFooter({
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  secondaryLabel = "Cancel",
  onSecondary,
  leftContent,
  variant = 'default',
  className,
  children
}: ModalFooterProps) {
  if (children) {
    return (
      <div className={cn(
        "flex items-center justify-between min-h-[56px] px-4 py-3 border-t border-[color:var(--stroke)]",
        className
      )}>
        {children}
      </div>
    )
  }

  const isDanger = variant === 'danger'

  return (
    <div className={cn(
      "flex items-center justify-between min-h-[56px] px-4 py-3 border-t border-[color:var(--stroke)]",
      className
    )}>
      <div className="flex items-center">
        {leftContent}
      </div>
      
      <div className="flex items-center gap-3">
        {onSecondary && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSecondary}
            className="h-9 px-3 rounded-lg border border-[color:var(--stroke)] hover:bg-[color:var(--surface-3)]"
          >
            {secondaryLabel}
          </Button>
        )}
        
        {onPrimary && primaryLabel && (
          <Button
            onClick={onPrimary}
            disabled={primaryDisabled}
            size="sm"
            className={cn(
              "h-9 px-4 rounded-lg text-white hover:opacity-90 disabled:opacity-50",
              isDanger 
                ? "bg-[color:var(--modal-danger)] hover:bg-[color:var(--modal-danger)]" 
                : "bg-[color:var(--modal-accent)] hover:bg-[color:var(--modal-accent)]"
            )}
          >
            {primaryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

ModalFooter.displayName = "ModalFooter"
