"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"

// Types
export interface HotkeyAction {
  id: string
  key: string
  label: string
  description?: string
  category: "navigation" | "actions" | "general"
  modifier?: "cmd" | "shift" | "alt" | "cmd+shift"
  sequence?: string[] // For G → I style sequences
  handler: () => void
  disabled?: boolean
}

interface HotkeyContextValue {
  // State
  activeSequence: string | null
  lastHotkey: HotkeyAction | null
  isHelpOpen: boolean
  
  // Actions
  setHelpOpen: (open: boolean) => void
  registerHotkey: (action: HotkeyAction) => void
  unregisterHotkey: (id: string) => void
  triggerHotkey: (action: HotkeyAction) => void
  
  // Getters
  getHotkeys: () => HotkeyAction[]
  getHotkeysByCategory: (category: HotkeyAction["category"]) => HotkeyAction[]
}

const HotkeyContext = createContext<HotkeyContextValue | null>(null)

// Format hotkey for display
export function formatHotkey(action: HotkeyAction): string {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  
  let parts: string[] = []
  
  if (action.modifier) {
    switch (action.modifier) {
      case "cmd":
        parts.push(isMac ? "⌘" : "Ctrl")
        break
      case "shift":
        parts.push("⇧")
        break
      case "alt":
        parts.push(isMac ? "⌥" : "Alt")
        break
      case "cmd+shift":
        parts.push(isMac ? "⌘" : "Ctrl", "⇧")
        break
    }
  }
  
  if (action.sequence) {
    return action.sequence.map(k => k.toUpperCase()).join(" → ")
  }
  
  parts.push(action.key.toUpperCase())
  return parts.join(" ")
}

interface HotkeyProviderProps {
  children: React.ReactNode
}

export function HotkeyProvider({ children }: HotkeyProviderProps) {
  const [hotkeys, setHotkeys] = useState<Map<string, HotkeyAction>>(new Map())
  const [activeSequence, setActiveSequence] = useState<string | null>(null)
  const [lastHotkey, setLastHotkey] = useState<HotkeyAction | null>(null)
  const [isHelpOpen, setHelpOpen] = useState(false)
  
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastHotkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const registerHotkey = useCallback((action: HotkeyAction) => {
    setHotkeys(prev => {
      const next = new Map(prev)
      next.set(action.id, action)
      return next
    })
  }, [])

  const unregisterHotkey = useCallback((id: string) => {
    setHotkeys(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const triggerHotkey = useCallback((action: HotkeyAction) => {
    setLastHotkey(action)
    action.handler()
    
    // Clear last hotkey after 2s
    if (lastHotkeyTimeoutRef.current) {
      clearTimeout(lastHotkeyTimeoutRef.current)
    }
    lastHotkeyTimeoutRef.current = setTimeout(() => {
      setLastHotkey(null)
    }, 2000)
  }, [])

  const getHotkeys = useCallback(() => {
    return Array.from(hotkeys.values())
  }, [hotkeys])

  const getHotkeysByCategory = useCallback((category: HotkeyAction["category"]) => {
    return Array.from(hotkeys.values()).filter(h => h.category === category)
  }, [hotkeys])

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Allow Escape in inputs
        if (e.key !== "Escape") return
      }

      // Handle ? for help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setHelpOpen(true)
        return
      }

      // Handle Escape
      if (e.key === "Escape") {
        if (activeSequence) {
          setActiveSequence(null)
          if (sequenceTimeoutRef.current) {
            clearTimeout(sequenceTimeoutRef.current)
          }
          return
        }
        if (isHelpOpen) {
          setHelpOpen(false)
          return
        }
      }

      // Handle sequences (like G → I)
      if (activeSequence) {
        const sequenceHotkeys = Array.from(hotkeys.values()).filter(
          h => h.sequence && h.sequence[0].toLowerCase() === activeSequence.toLowerCase()
        )
        
        const matched = sequenceHotkeys.find(
          h => h.sequence && h.sequence[1]?.toLowerCase() === e.key.toLowerCase()
        )
        
        if (matched && !matched.disabled) {
          e.preventDefault()
          setActiveSequence(null)
          if (sequenceTimeoutRef.current) {
            clearTimeout(sequenceTimeoutRef.current)
          }
          triggerHotkey(matched)
          return
        }
        
        // Invalid sequence key, cancel
        setActiveSequence(null)
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current)
        }
        return
      }

      // Check for sequence starters
      const sequenceStarters = Array.from(hotkeys.values()).filter(
        h => h.sequence && h.sequence.length === 2
      )
      const startsSequence = sequenceStarters.find(
        h => h.sequence![0].toLowerCase() === e.key.toLowerCase()
      )
      
      if (startsSequence && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setActiveSequence(e.key.toLowerCase())
        
        // Clear sequence after 2s
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current)
        }
        sequenceTimeoutRef.current = setTimeout(() => {
          setActiveSequence(null)
        }, 2000)
        return
      }

      // Check regular hotkeys
      for (const action of hotkeys.values()) {
        if (action.disabled || action.sequence) continue

        const keyMatch = e.key.toLowerCase() === action.key.toLowerCase()
        if (!keyMatch) continue

        let modifierMatch = false
        
        switch (action.modifier) {
          case "cmd":
            modifierMatch = (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey
            break
          case "shift":
            modifierMatch = e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
            break
          case "alt":
            modifierMatch = e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey
            break
          case "cmd+shift":
            modifierMatch = (e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey
            break
          default:
            modifierMatch = !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
        }

        if (modifierMatch) {
          e.preventDefault()
          triggerHotkey(action)
          return
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [hotkeys, activeSequence, isHelpOpen, triggerHotkey])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
      if (lastHotkeyTimeoutRef.current) clearTimeout(lastHotkeyTimeoutRef.current)
    }
  }, [])

  return (
    <HotkeyContext.Provider
      value={{
        activeSequence,
        lastHotkey,
        isHelpOpen,
        setHelpOpen,
        registerHotkey,
        unregisterHotkey,
        triggerHotkey,
        getHotkeys,
        getHotkeysByCategory,
      }}
    >
      {children}
    </HotkeyContext.Provider>
  )
}

export function useHotkeyContext() {
  const context = useContext(HotkeyContext)
  if (!context) {
    throw new Error("useHotkeyContext must be used within a HotkeyProvider")
  }
  return context
}

// Hook to register a hotkey
export function useRegisterHotkey(action: HotkeyAction) {
  const { registerHotkey, unregisterHotkey } = useHotkeyContext()

  useEffect(() => {
    registerHotkey(action)
    return () => unregisterHotkey(action.id)
  }, [action, registerHotkey, unregisterHotkey])
}


