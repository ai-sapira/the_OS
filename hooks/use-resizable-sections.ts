"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseResizableSectionsProps {
  initialLeftWidth?: number // in percentage (default 35)
  minLeftWidth?: number     // in percentage (min 20)
  maxLeftWidth?: number     // in percentage (max 80)
}

export function useResizableSections({
  initialLeftWidth = 35,
  minLeftWidth = 20,
  maxLeftWidth = 80
}: UseResizableSectionsProps = {}) {
  const [leftWidthPercent, setLeftWidthPercent] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width
    
    // Calculate new left width as percentage
    const mouseX = e.clientX - containerRect.left
    const newLeftPercent = (mouseX / containerWidth) * 100
    
    // Clamp to min/max values
    const clampedPercent = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftPercent))
    
    setLeftWidthPercent(clampedPercent)
  }, [isDragging, minLeftWidth, maxLeftWidth])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners for mouse move and up
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

  // Calculate the right width
  const rightWidthPercent = 100 - leftWidthPercent

  return {
    leftWidthPercent,
    rightWidthPercent,
    isDragging,
    handleMouseDown,
    containerRef,
    dragRef
  }
}
