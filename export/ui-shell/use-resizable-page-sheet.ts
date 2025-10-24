"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseResizablePageSheetOptions {
  initialSheetPosition?: number
  minSidebarWidth?: number
  maxSidebarWidth?: number
  sidebarCollapseThreshold?: number
  collapsedSidebarWidth?: number
  onSheetPositionChange?: (position: number) => void
  onSidebarCollapseChange?: (collapsed: boolean) => void
}

export function useResizablePageSheet({
  initialSheetPosition = 256,
  minSidebarWidth = 200,
  maxSidebarWidth = 400,
  sidebarCollapseThreshold = 120,
  collapsedSidebarWidth = 64,
  onSheetPositionChange,
  onSidebarCollapseChange,
}: UseResizablePageSheetOptions = {}) {
  const [sheetPosition, setSheetPosition] = useState(initialSheetPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const dragRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPosition = useRef<number>(0)

  const effectiveSidebarWidth = isSidebarCollapsed
    ? collapsedSidebarWidth
    : sheetPosition

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      dragStartPosition.current = effectiveSidebarWidth
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [effectiveSidebarWidth]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const newSidebarWidth = e.clientX
      const TOLERANCE_ZONE = 40
      const startPosition = dragStartPosition.current

      if (newSidebarWidth < sidebarCollapseThreshold) {
        if (!isSidebarCollapsed) {
          setIsSidebarCollapsed(true)
          onSidebarCollapseChange?.(true)
        }
        const constrainedWidth = Math.max(collapsedSidebarWidth, newSidebarWidth)
        setSheetPosition(constrainedWidth)
        onSheetPositionChange?.(constrainedWidth)
      } else {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false)
          onSidebarCollapseChange?.(false)
        }

        if (newSidebarWidth < startPosition) {
          const sidebarReduction = startPosition - newSidebarWidth
          if (sidebarReduction <= TOLERANCE_ZONE) {
            setSheetPosition(startPosition)
            onSheetPositionChange?.(startPosition)
          } else {
            const constrainedWidth = Math.max(minSidebarWidth, newSidebarWidth)
            setSheetPosition(constrainedWidth)
            onSheetPositionChange?.(constrainedWidth)
          }
        } else {
          const constrainedWidth = Math.max(
            minSidebarWidth,
            Math.min(maxSidebarWidth, newSidebarWidth)
          )
          setSheetPosition(constrainedWidth)
          onSheetPositionChange?.(constrainedWidth)
        }
      }
    },
    [
      isDragging,
      sidebarCollapseThreshold,
      isSidebarCollapsed,
      minSidebarWidth,
      maxSidebarWidth,
      collapsedSidebarWidth,
      onSheetPositionChange,
      onSidebarCollapseChange,
    ]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [])

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const toggleSidebarCollapse = useCallback(() => {
    const newCollapsed = !isSidebarCollapsed
    setIsSidebarCollapsed(newCollapsed)
    onSidebarCollapseChange?.(newCollapsed)
    setSheetPosition(newCollapsed ? collapsedSidebarWidth : minSidebarWidth)
  }, [isSidebarCollapsed, collapsedSidebarWidth, minSidebarWidth, onSidebarCollapseChange])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("sheet-position", sheetPosition.toString())
    localStorage.setItem("sidebar-collapsed", isSidebarCollapsed.toString())
  }, [sheetPosition, isSidebarCollapsed])

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedPosition = localStorage.getItem("sheet-position")
    const savedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (savedPosition) {
      const position = parseInt(savedPosition, 10)
      if (position >= 0) setSheetPosition(position)
    }
    if (savedCollapsed) setIsSidebarCollapsed(savedCollapsed === "true")
  }, [])

  return {
    sheetPosition,
    effectiveSidebarWidth,
    isSidebarCollapsed,
    isDragging,
    dragRef,
    containerRef,
    handleMouseDown,
    toggleSidebarCollapse,
    sidebarWidth: effectiveSidebarWidth,
    sheetWidth: `calc(100vw - ${effectiveSidebarWidth}px)`,
    constants: {
      minSidebarWidth,
      maxSidebarWidth,
      sidebarCollapseThreshold,
      collapsedSidebarWidth,
    },
  }
}



