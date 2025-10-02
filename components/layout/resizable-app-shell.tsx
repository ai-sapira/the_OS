"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { useResizablePageSheet } from "@/hooks/use-resizable-sidebar"
import { ResizableProvider } from "./resizable-context"

interface ResizableAppShellProps {
  children: ReactNode
  onOpenCommandPalette?: () => void
  debugInfo?: boolean
}

export function ResizableAppShell({ 
  children, 
  onOpenCommandPalette,
  debugInfo = false
}: ResizableAppShellProps) {
  const {
    sheetPosition,
    effectiveSidebarWidth,
    isSidebarCollapsed,
    isDragging,
    dragRef,
    containerRef,
    handleMouseDown,
    toggleSidebarCollapse
  } = useResizablePageSheet()

  return (
    <ResizableProvider value={{ handleMouseDown, isDragging, dragRef }}>
      {/* SINGLE BACKGROUND LAYER - Sidebar + Empty Area */}
      <div 
        className="h-screen overflow-hidden relative"
        style={{ 
          background: 'var(--bg-app)' // UNIFIED BACKGROUND for everything
        }}
      >
        {/* Sidebar positioned absolutely */}
        <div 
          className="absolute left-0 top-0 h-full z-20"
          style={{ 
            width: `${effectiveSidebarWidth}px`,
            background: 'transparent', // transparent to show unified background
            transition: isDragging ? 'none' : 'width 200ms ease-out'
          }}
        >
          <Sidebar 
            onOpenCommandPalette={onOpenCommandPalette}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* FLOATING SHEET positioned absolutely above everything */}
        <div
          ref={containerRef}
          className="absolute top-0 h-full z-30"
          style={{ 
            left: `${effectiveSidebarWidth}px`, // Start where sidebar ends
            width: `calc(100vw - ${effectiveSidebarWidth}px)`, // Fill rest of screen
            transition: isDragging ? 'none' : 'left 200ms ease-out, width 200ms ease-out'
          }}
        >
          {children}
        </div>
        
        {/* Debug overlay - only shown when debugInfo is true */}
        {debugInfo && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
            <div>Sheet Position: {sheetPosition}px | Sidebar: {effectiveSidebarWidth}px</div>
            <div>Collapsed: {isSidebarCollapsed ? 'Yes' : 'No'} | Dragging: {isDragging ? 'Yes' : 'No'}</div>
          </div>
        )}

        {/* Overlay during drag for smooth experience */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize" />
        )}
      </div>
    </ResizableProvider>
  )
}
