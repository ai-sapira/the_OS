"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void
  onOpenCreateIssue: () => void
}

export function KeyboardShortcuts({ onOpenCommandPalette, onOpenCreateIssue }: KeyboardShortcutsProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenCommandPalette()
        return
      }

      // Create new issue (N)
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
          return
        }
        e.preventDefault()
        onOpenCreateIssue()
        return
      }

      // Navigation shortcuts (G + letter)
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
          return
        }

        // Set up listener for the next key
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          secondEvent.preventDefault()

          switch (secondEvent.key.toLowerCase()) {
            case "i":
              router.push("/")
              break
            case "b":
              router.push("/backlog")
              break
            case "a":
              router.push("/active")
              break
            case "r":
              router.push("/roadmap")
              break
            case "p":
              router.push("/projects")
              break
            case "m":
              router.push("/metrics")
              break
          }

          // Remove the listener after handling
          document.removeEventListener("keydown", handleSecondKey)
        }

        // Add temporary listener for the second key
        document.addEventListener("keydown", handleSecondKey)

        // Remove the listener after 2 seconds if no second key is pressed
        setTimeout(() => {
          document.removeEventListener("keydown", handleSecondKey)
        }, 2000)

        return
      }

      // Escape key to close modals/overlays
      if (e.key === "Escape") {
        // This will be handled by individual components
        return
      }

      // Settings (Cmd+, or Ctrl+,)
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault()
        console.log("Open settings")
        return
      }

      // Help (?)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
          return
        }
        e.preventDefault()
        console.log("Show keyboard shortcuts help")
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [router, onOpenCommandPalette, onOpenCreateIssue])

  return null
}
