"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ModalVariant } from "./modal"

export interface ModalHeaderProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  onClose?: () => void
  variant?: ModalVariant
  className?: string
}

export function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
  variant = 'default',
  className
}: ModalHeaderProps) {
  const isDanger = variant === 'danger'
  
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 px-[var(--space-6)] py-[var(--space-6)] pb-[var(--space-3)]",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className={cn(
            "flex-shrink-0",
            isDanger && "text-[color:var(--modal-danger)]"
          )}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className={cn(
            "text-[16px] font-semibold leading-tight",
            isDanger && "text-[color:var(--modal-danger)]"
          )}>
            {title}
          </DialogPrimitive.Title>
          {subtitle && (
            <DialogPrimitive.Description className="text-[13px] font-medium text-[color:var(--muted-text)] mt-1">
              {subtitle}
            </DialogPrimitive.Description>
          )}
        </div>
      </div>
      
      {onClose && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogPrimitive.Close
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--stroke)] bg-[color:var(--surface-3)] text-[color:var(--muted-text)] hover:bg-[color:var(--surface-1)] hover:text-[color:var(--foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)] focus:ring-offset-2"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Close (Esc)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

ModalHeader.displayName = "ModalHeader"
