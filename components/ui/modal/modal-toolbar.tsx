"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModalToolbarProps {
  children?: React.ReactNode
  className?: string
}

export function ModalToolbar({
  children,
  className
}: ModalToolbarProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-[var(--space-6)] pb-[var(--space-3)] flex-nowrap justify-start",
      className
    )}>
      {children}
    </div>
  )
}

ModalToolbar.displayName = "ModalToolbar"
