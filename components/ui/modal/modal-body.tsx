"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModalBodyProps {
  children?: React.ReactNode
  className?: string
}

export function ModalBody({
  children,
  className
}: ModalBodyProps) {
  return (
    <div className={cn(
      "px-[var(--space-6)] pb-[var(--space-6)]",
      className
    )}>
      {children}
    </div>
  )
}

ModalBody.displayName = "ModalBody"
