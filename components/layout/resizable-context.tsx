"use client"

import { createContext, useContext, ReactNode } from "react"

interface ResizableContextType {
  handleMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
  dragRef: React.RefObject<HTMLDivElement>
}

const ResizableContext = createContext<ResizableContextType | null>(null)

export function ResizableProvider({ 
  children, 
  value 
}: { 
  children: ReactNode
  value: ResizableContextType 
}) {
  return (
    <ResizableContext.Provider value={value}>
      {children}
    </ResizableContext.Provider>
  )
}

export function useResizableContext() {
  const context = useContext(ResizableContext)
  if (!context) {
    throw new Error('useResizableContext must be used within a ResizableProvider')
  }
  return context
}
