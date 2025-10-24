"use client"

import { createContext, useContext, ReactNode } from "react"

interface ResizableContextValue {
  handleMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
  dragRef: React.RefObject<HTMLDivElement>
}

const ResizableContext = createContext<ResizableContextValue | null>(null)

export function ResizableProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ResizableContextValue
}) {
  return (
    <ResizableContext.Provider value={value}>{children}</ResizableContext.Provider>
  )
}

export function useResizableContext(): ResizableContextValue {
  const ctx = useContext(ResizableContext)
  if (!ctx) {
    throw new Error("useResizableContext must be used within a ResizableProvider")
  }
  return ctx
}



