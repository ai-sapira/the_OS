"use client"

import { ReactNode } from "react"
import { ResizableProvider } from "./resizable-context"
import { useResizablePageSheet } from "./use-resizable-page-sheet"

interface ResizableAppShellProps {
  children: ReactNode
  sidebar: ReactNode
  debugInfo?: boolean
}

export function ResizableAppShell({ children, sidebar, debugInfo = false }: ResizableAppShellProps) {
  const {
    sheetPosition,
    effectiveSidebarWidth,
    isSidebarCollapsed,
    isDragging,
    dragRef,
    containerRef,
    handleMouseDown,
  } = useResizablePageSheet()

  return (
    <ResizableProvider value={{ handleMouseDown, isDragging, dragRef }}>
      <div className="h-screen overflow-hidden relative" style={{ background: "var(--bg-app)" }}>
        <div
          className="absolute left-0 top-0 h-full z-20"
          style={{
            width: `${effectiveSidebarWidth}px`,
            background: "transparent",
            transition: isDragging ? "none" : "width 200ms ease-out",
          }}
        >
          {sidebar}
        </div>

        <div
          ref={containerRef}
          className="absolute top-0 h-full z-30"
          style={{
            left: `${effectiveSidebarWidth}px`,
            width: `calc(100vw - ${effectiveSidebarWidth}px)`,
            transition: isDragging ? "none" : "left 200ms ease-out, width 200ms ease-out",
          }}
        >
          {children}
        </div>

        {debugInfo && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
            <div>Sheet: {sheetPosition}px | Sidebar: {effectiveSidebarWidth}px</div>
            <div>Dragging: {isDragging ? "Yes" : "No"}</div>
          </div>
        )}

        {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}
      </div>
    </ResizableProvider>
  )
}



