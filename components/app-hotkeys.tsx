"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useHotkeyContext, type HotkeyAction } from "@/lib/context/hotkey-context"

interface AppHotkeysProps {
  onOpenCommandPalette: () => void
  onOpenCreateInitiative: () => void  // Crear Iniciativa (tabla issues)
  onOpenCreateBusinessUnit?: () => void  // Crear Business Unit (tabla initiatives)
  onOpenCreateProject?: () => void  // Crear Project (tabla projects)
  onToggleSidebar?: () => void
}

export function AppHotkeys({
  onOpenCommandPalette,
  onOpenCreateInitiative,
  onOpenCreateBusinessUnit,
  onOpenCreateProject,
  onToggleSidebar,
}: AppHotkeysProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { registerHotkey, unregisterHotkey, setHelpOpen } = useHotkeyContext()

  useEffect(() => {
    const hotkeys: HotkeyAction[] = [
      // Actions
      {
        id: "cmd-k",
        key: "k",
        modifier: "cmd",
        label: "Buscar",
        description: "Abrir command palette",
        category: "actions",
        handler: onOpenCommandPalette,
      },
      {
        id: "create-initiative",
        key: "n",
        label: "Nueva Iniciativa",
        description: "Crear una nueva iniciativa",
        category: "actions",
        handler: onOpenCreateInitiative,
      },
      {
        id: "create-business-unit",
        key: "n",
        modifier: "shift",
        label: "Nuevo Business Unit",
        description: "Crear un nuevo business unit",
        category: "actions",
        handler: onOpenCreateBusinessUnit || (() => {}),
        disabled: !onOpenCreateBusinessUnit,
      },
      {
        id: "create-project",
        key: "p",
        modifier: "shift",
        label: "Nuevo Project",
        description: "Crear un nuevo proyecto",
        category: "actions",
        handler: onOpenCreateProject || (() => {}),
        disabled: !onOpenCreateProject,
      },
      
      // Navigation sequences
      {
        id: "go-home",
        key: "g",
        sequence: ["g", "h"],
        label: "Ir a Home",
        description: "Página principal",
        category: "navigation",
        handler: () => router.push("/home"),
      },
      {
        id: "go-triage",
        key: "g",
        sequence: ["g", "t"],
        label: "Ir a Triage",
        description: "Iniciativas por revisar",
        category: "navigation",
        handler: () => router.push("/triage-new"),
      },
      {
        id: "go-business-units",
        key: "g",
        sequence: ["g", "b"],
        label: "Ir a Business Units",
        description: "Todas las business units",
        category: "navigation",
        handler: () => router.push("/business-units"),
      },
      {
        id: "go-projects",
        key: "g",
        sequence: ["g", "p"],
        label: "Ir a Projects",
        description: "Ver proyectos",
        category: "navigation",
        handler: () => router.push("/projects"),
      },
      {
        id: "go-roadmap",
        key: "g",
        sequence: ["g", "r"],
        label: "Ir a Roadmap",
        description: "Vista de roadmap",
        category: "navigation",
        handler: () => router.push("/roadmap"),
      },
      {
        id: "go-metrics",
        key: "g",
        sequence: ["g", "m"],
        label: "Ir a Métricas",
        description: "Dashboard de métricas",
        category: "navigation",
        handler: () => router.push("/metrics"),
      },
      {
        id: "go-surveys",
        key: "g",
        sequence: ["g", "s"],
        label: "Ir a Surveys",
        description: "Encuestas",
        category: "navigation",
        handler: () => router.push("/surveys"),
      },
      {
        id: "go-insights",
        key: "g",
        sequence: ["g", "i"],
        label: "Ir a Insights",
        description: "Análisis e insights",
        category: "navigation",
        handler: () => router.push("/insights"),
      },

      // General
      {
        id: "toggle-sidebar",
        key: ".",
        modifier: "cmd",
        label: "Toggle sidebar",
        description: "Mostrar/ocultar sidebar",
        category: "general",
        handler: onToggleSidebar || (() => {}),
        disabled: !onToggleSidebar,
      },
      {
        id: "show-help",
        key: "/",
        modifier: "cmd",
        label: "Ayuda atajos",
        description: "Ver todos los atajos",
        category: "general",
        handler: () => setHelpOpen(true),
      },
    ]

    // Register all hotkeys
    hotkeys.forEach(hotkey => {
      if (!hotkey.disabled) {
        registerHotkey(hotkey)
      }
    })

    // Cleanup
    return () => {
      hotkeys.forEach(hotkey => unregisterHotkey(hotkey.id))
    }
  }, [
    router,
    pathname,
    registerHotkey,
    unregisterHotkey,
    onOpenCommandPalette,
    onOpenCreateInitiative,
    onOpenCreateBusinessUnit,
    onOpenCreateProject,
    onToggleSidebar,
    setHelpOpen,
  ])

  return null
}
