"use client"

import { useEffect } from "react"

interface HotkeyConfig {
  key: string
  handler: () => void
  disabled?: boolean
  modifier?: 'cmd' | 'ctrl' | 'shift' | 'alt'
}

export function useHotkeys(configs: HotkeyConfig[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return
      }

      const config = configs.find(config => {
        if (config.disabled) return false
        
        const keyMatch = event.key.toLowerCase() === config.key.toLowerCase()
        
        if (!config.modifier) {
          return keyMatch && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
        }
        
        switch (config.modifier) {
          case 'cmd':
            return keyMatch && (event.metaKey || event.ctrlKey)
          case 'ctrl':
            return keyMatch && event.ctrlKey
          case 'shift':
            return keyMatch && event.shiftKey
          case 'alt':
            return keyMatch && event.altKey
          default:
            return false
        }
      })

      if (config) {
        event.preventDefault()
        config.handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [configs, enabled])
}
