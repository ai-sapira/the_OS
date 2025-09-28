"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseResizablePageSheetOptions {
  initialSheetPosition?: number  // Posición inicial de la tarjeta desde la izquierda
  minSidebarWidth?: number      // Ancho mínimo del sidebar
  maxSidebarWidth?: number      // Ancho máximo del sidebar  
  sidebarCollapseThreshold?: number // Punto donde el sidebar se colapsa
  collapsedSidebarWidth?: number    // Ancho del sidebar colapsado
  onSheetPositionChange?: (position: number) => void
  onSidebarCollapseChange?: (collapsed: boolean) => void
}

export function useResizablePageSheet({
  initialSheetPosition = 256,      // Empieza a 256px del borde izquierdo
  minSidebarWidth = 200,
  maxSidebarWidth = 400,
  sidebarCollapseThreshold = 120,  // Si el sidebar se reduce a menos de 120px, se colapsa
  collapsedSidebarWidth = 64,
  onSheetPositionChange,
  onSidebarCollapseChange
}: UseResizablePageSheetOptions = {}) {
  const [sheetPosition, setSheetPosition] = useState(initialSheetPosition) // Posición desde la izquierda
  const [isDragging, setIsDragging] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPosition = useRef<number>(0) // Remember where drag started

  // Calcular el ancho efectivo del sidebar basado en la posición de la tarjeta
  const calculateSidebarWidth = useCallback((position: number) => {
    return Math.max(0, position)
  }, [])

  // Calculate effective sidebar width - moved before usage
  const effectiveSidebarWidth = isSidebarCollapsed ? collapsedSidebarWidth : sheetPosition

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    // Remember starting position
    dragStartPosition.current = effectiveSidebarWidth
    
    // Add cursor style to body
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [effectiveSidebarWidth])

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    // Calculate new sidebar width based on mouse position
    const newSidebarWidth = e.clientX
    
    // Define tolerance zones
    const TOLERANCE_ZONE = 40 // pixels of tolerance before sheet moves
    const startPosition = dragStartPosition.current
    
    // Handle auto-collapse/expand logic based on sidebar width
    if (newSidebarWidth < sidebarCollapseThreshold) {
      if (!isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
        onSidebarCollapseChange?.(true)
      }
      // When collapsed, allow sheet to move freely
      const minWidth = collapsedSidebarWidth
      const constrainedWidth = Math.max(minWidth, newSidebarWidth)
      setSheetPosition(constrainedWidth)
      onSheetPositionChange?.(constrainedWidth)
    } else {
      if (isSidebarCollapsed) {
        setIsSidebarCollapsed(false)
        onSidebarCollapseChange?.(false)
      }
      
      // TOLERANCE LOGIC: When moving towards the left (reducing sidebar)
      if (newSidebarWidth < startPosition) {
        // Moving left - check if we're in tolerance zone
        const sidebarReduction = startPosition - newSidebarWidth
        
        if (sidebarReduction <= TOLERANCE_ZONE) {
          // Within tolerance: keep sheet at start position, don't move it yet
          setSheetPosition(startPosition)
          onSheetPositionChange?.(startPosition)
        } else {
          // Beyond tolerance: now move sheet to follow cursor
          const constrainedWidth = Math.max(minSidebarWidth, newSidebarWidth)
          setSheetPosition(constrainedWidth)
          onSheetPositionChange?.(constrainedWidth)
        }
      } else {
        // Moving right - normal behavior, sheet follows immediately
        const constrainedWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newSidebarWidth))
        setSheetPosition(constrainedWidth)
        onSheetPositionChange?.(constrainedWidth)
      }
    }
  }, [isDragging, sidebarCollapseThreshold, isSidebarCollapsed, 
      minSidebarWidth, maxSidebarWidth, collapsedSidebarWidth,
      onSheetPositionChange, onSidebarCollapseChange])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    
    // Remove cursor style from body
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Effect to add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Toggle sidebar programmatically
  const toggleSidebarCollapse = useCallback(() => {
    const newCollapsed = !isSidebarCollapsed
    setIsSidebarCollapsed(newCollapsed)
    onSidebarCollapseChange?.(newCollapsed)
    
    // Adjust sheet position when toggling
    if (newCollapsed) {
      // When collapsing, move sheet to collapsed position
      setSheetPosition(collapsedSidebarWidth)
    } else {
      // When expanding, move sheet to minimum sidebar width
      setSheetPosition(minSidebarWidth)
    }
  }, [isSidebarCollapsed, collapsedSidebarWidth, minSidebarWidth, onSidebarCollapseChange])

  // Store settings in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sheet-position', sheetPosition.toString())
      localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.toString())
    }
  }, [sheetPosition, isSidebarCollapsed])

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('sheet-position')
      const savedCollapsed = localStorage.getItem('sidebar-collapsed')
      
      if (savedPosition) {
        const position = parseInt(savedPosition, 10)
        if (position >= 0) {
          setSheetPosition(position)
        }
      }
      
      if (savedCollapsed) {
        setIsSidebarCollapsed(savedCollapsed === 'true')
      }
    }
  }, [])

  return {
    sheetPosition,           // Posición de la tarjeta desde la izquierda
    effectiveSidebarWidth,   // Ancho efectivo del sidebar
    isSidebarCollapsed,      // Estado de colapso del sidebar
    isDragging,              // Estado de arrastre
    dragRef,                 // Ref para el handle
    containerRef,            // Ref para el contenedor
    handleMouseDown,         // Handler para el drag handle
    toggleSidebarCollapse,   // Función para toggle del sidebar
    // Calculated values
    sidebarWidth: effectiveSidebarWidth,
    sheetWidth: `calc(100vw - ${effectiveSidebarWidth}px)`,
    // Constants for use in components
    constants: {
      minSidebarWidth,
      maxSidebarWidth,
      sidebarCollapseThreshold,
      collapsedSidebarWidth
    }
  }
}
