"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import {
  Inbox,
  Archive,
  Activity,
  Map,
  BarChart3,
  Users,
  Plus,
  Settings,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Building,
  Target,
  Hash,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Mock data for search results
  const issues = [
    {
      id: "SAI-307",
      title: "Licencia DGSFP & contratos",
      status: "in-progress",
      project: "Tecnología",
      assignee: "Tech Team",
    },
    {
      id: "SAI-306",
      title: "Comparador - Resumen final modal sheet 75% en mobile",
      status: "review",
      project: "Marketing",
      assignee: "Design Team",
    },
    {
      id: "SAI-305",
      title: "Contacto de planes con precio por grupo",
      status: "done",
      project: "Ventas",
      assignee: "Sales Team",
    },
    {
      id: "SAI-304",
      title: "Sort: Recomendados by Solucionó (default) + Price Low→High / High→Low",
      status: "backlog",
      project: "Tecnología",
      assignee: "Tech Team",
    },
  ]

  const projects = [
    { id: "tech", name: "Tecnología", color: "bg-blue-500" },
    { id: "marketing", name: "Marketing", color: "bg-green-500" },
    { id: "sales", name: "Ventas", color: "bg-purple-500" },
    { id: "hr", name: "Recursos Humanos", color: "bg-orange-500" },
    { id: "finance", name: "Finanzas", color: "bg-red-500" },
  ]

  const users = [
    { name: "Carlos Rodríguez", role: "Tech Manager", department: "Tecnología" },
    { name: "Ana Martínez", role: "Marketing Manager", department: "Marketing" },
    { name: "Miguel López", role: "Sales Manager", department: "Ventas" },
    { name: "Laura García", role: "HR Manager", department: "Recursos Humanos" },
    { name: "Roberto Sánchez", role: "Finance Manager", department: "Finanzas" },
  ]

  const initiatives = [
    { id: "INIT-001", title: "Transformación Digital Completa", status: "in-progress" },
    { id: "INIT-002", title: "Expansión de Mercado Internacional", status: "planning" },
    { id: "INIT-003", title: "Optimización de Procesos Internos", status: "in-progress" },
    { id: "INIT-004", title: "Plataforma de Customer Success", status: "completed" },
  ]

  const navigationItems = [
    { label: "Inbox", icon: Inbox, href: "/", shortcut: "G I" },
    { label: "Backlog", icon: Archive, href: "/backlog", shortcut: "G B" },
    { label: "Active", icon: Activity, href: "/active", shortcut: "G A" },
    { label: "Roadmap", icon: Map, href: "/roadmap", shortcut: "G R" },
    { label: "Departamentos", icon: Users, href: "/projects", shortcut: "G P" },
    { label: "Metrics", icon: BarChart3, href: "/metrics", shortcut: "G M" },
  ]

  const actions = [
    { label: "Crear nuevo ticket", icon: Plus, action: "create-issue", shortcut: "N" },
    { label: "Crear nueva iniciativa", icon: Target, action: "create-initiative", shortcut: "Shift N" },
    { label: "Configuración", icon: Settings, action: "settings", shortcut: "," },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "planning":
        return <Target className="h-4 w-4 text-orange-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      done: "bg-green-500/10 text-green-500 border-green-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      review: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      planning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      backlog: "bg-muted text-muted-foreground border-border",
    }

    const labels = {
      done: "Completado",
      completed: "Completado",
      "in-progress": "En progreso",
      review: "En revisión",
      planning: "Planificación",
      backlog: "Backlog",
    }

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border text-xs`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const handleSelect = useCallback(
    (value: string) => {
      onOpenChange(false)
      setSearch("")

      // Handle navigation
      if (value.startsWith("nav:")) {
        const href = value.replace("nav:", "")
        router.push(href)
        return
      }

      // Handle actions
      if (value.startsWith("action:")) {
        const action = value.replace("action:", "")
        switch (action) {
          case "create-issue":
            // Trigger create issue modal
            console.log("Create issue")
            break
          case "create-initiative":
            // Trigger create initiative modal
            console.log("Create initiative")
            break
          case "settings":
            console.log("Open settings")
            break
        }
        return
      }

      // Handle issues
      if (value.startsWith("issue:")) {
        const issueId = value.replace("issue:", "")
        console.log("Open issue:", issueId)
        return
      }

      // Handle projects
      if (value.startsWith("project:")) {
        const projectId = value.replace("project:", "")
        router.push(`/projects/${projectId}`)
        return
      }

      // Handle initiatives
      if (value.startsWith("initiative:")) {
        const initiativeId = value.replace("initiative:", "")
        console.log("Open initiative:", initiativeId)
        return
      }

      // Handle users
      if (value.startsWith("user:")) {
        const userName = value.replace("user:", "")
        console.log("Open user profile:", userName)
        return
      }
    },
    [onOpenChange, router],
  )

  // Filter results based on search
  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.id.toLowerCase().includes(search.toLowerCase()) ||
      issue.project.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase()))

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredInitiatives = initiatives.filter(
    (initiative) =>
      initiative.title.toLowerCase().includes(search.toLowerCase()) ||
      initiative.id.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredNavigation = navigationItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))

  const filteredActions = actions.filter((action) => action.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar tickets, proyectos, usuarios..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

        {/* Quick Actions */}
        {(!search || filteredActions.length > 0) && (
          <CommandGroup heading="Acciones rápidas">
            {filteredActions.map((action) => (
              <CommandItem
                key={action.action}
                value={`action:${action.action}`}
                onSelect={handleSelect}
                className="flex items-center gap-3"
              >
                <action.icon className="h-4 w-4" />
                <span className="flex-1">{action.label}</span>
                <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">{action.shortcut}</kbd>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        {(!search || filteredNavigation.length > 0) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navegación">
              {filteredNavigation.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`nav:${item.href}`}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Issues */}
        {filteredIssues.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tickets">
              {filteredIssues.slice(0, 5).map((issue) => (
                <CommandItem
                  key={issue.id}
                  value={`issue:${issue.id}`}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">{issue.id}</span>
                      {getStatusBadge(issue.status)}
                    </div>
                    <p className="text-sm truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.project} • {issue.assignee}
                    </p>
                  </div>
                  {getStatusIcon(issue.status)}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Projects */}
        {filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Departamentos">
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project:${project.id}`}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div className={`h-2 w-2 rounded-full ${project.color}`} />
                  <span className="flex-1">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Initiatives */}
        {filteredInitiatives.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Iniciativas">
              {filteredInitiatives.map((initiative) => (
                <CommandItem
                  key={initiative.id}
                  value={`initiative:${initiative.id}`}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">{initiative.id}</span>
                      {getStatusBadge(initiative.status)}
                    </div>
                    <p className="text-sm truncate">{initiative.title}</p>
                  </div>
                  {getStatusIcon(initiative.status)}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Users */}
        {filteredUsers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Usuarios">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.name}
                  value={`user:${user.name}`}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role} • {user.department}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
