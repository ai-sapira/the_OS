"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChipRowProps {
  children?: React.ReactNode
  className?: string
}

export function ChipRow({
  children,
  className
}: ChipRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 overflow-x-auto",
      className
    )}>
      {children}
    </div>
  )
}

ChipRow.displayName = "ChipRow"
