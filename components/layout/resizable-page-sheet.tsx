"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useResizableContext } from "./resizable-context"

interface ResizablePageSheetProps {
  children: ReactNode
  header?: ReactNode
  toolbar?: ReactNode
}

export function ResizablePageSheet({ 
  children, 
  header, 
  toolbar
}: ResizablePageSheetProps) {
  const { handleMouseDown, isDragging } = useResizableContext()
  const HANDLE_WIDTH = 4 // Width of the drag handle

  return (
    <div 
      className="overflow-hidden isolate relative z-30" // z-30 to be above sidebar
      style={{
        margin: 'var(--sheet-halo-y) var(--sheet-halo-x)',
        marginLeft: '0', // No left margin - this is where it connects to sidebar
        height: `calc(100vh - var(--sheet-halo-y) * 2)`, // Respect top and bottom halo
        background: 'var(--surface-sheet)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-sheet)',
        boxShadow: 'var(--shadow-sheet)'
      }}
    >
      {/* Resize Handle - positioned at the left edge of the PageSheet */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full z-40 group cursor-col-resize",
          "hover:bg-blue-500/20 transition-colors"
        )}
        style={{ 
          width: `${HANDLE_WIDTH}px`,
          marginLeft: `-${HANDLE_WIDTH / 2}px`
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-transparent group-hover:bg-blue-500/60 transition-colors" />
        
        {/* Invisible wider hit area for easier grabbing */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      {/* Header sticky */}
      {header && (
        <div 
          className="sticky top-0 z-30"
          style={{
            height: 'var(--header-h)',
            borderBottom: '1px solid var(--stroke-layout)',
            marginLeft: 'calc(-1 * 1px)',
            marginRight: 'calc(-1 * 1px)',
            width: 'calc(100% + 2px)'
          }}
        >
          {header}
        </div>
      )}

      {/* Toolbar sticky */}
      {toolbar && (
        <div 
          className="sticky z-30"
          style={{
            top: header ? 'var(--header-h)' : '0',
            height: 'var(--toolbar-h)',
            borderBottom: '1px solid var(--stroke-layout)',
            marginLeft: 'calc(-1 * 1px)',
            marginRight: 'calc(-1 * 1px)',
            width: 'calc(100% + 2px)'
          }}
        >
          {toolbar}
        </div>
      )}

      {/* Body - scroll container with proper height calculation */}
      <div 
        className="overflow-auto px-5 py-4"
        style={{
          height: `calc(100% - ${header ? 'var(--header-h)' : '0px'} - ${toolbar ? 'var(--toolbar-h)' : '0px'})`
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Keep the original components unchanged
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-5 h-full">
      {children}
    </div>
  )
}

export function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-5 h-full">
      {children}
    </div>
  )
}
