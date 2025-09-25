"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Inbox,
  Archive,
  Activity,
  Map,
  BarChart3,
  Plus,
  Search,
  Settings,
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react"

interface SidebarProps {
  className?: string
  onOpenCommandPalette?: () => void
  onOpenCreateIssue?: () => void
}

export function Sidebar({ className, onOpenCommandPalette, onOpenCreateIssue }: SidebarProps) {
  const pathname = usePathname()

  const mainSections = [
    { id: "triage", label: "Triage", icon: Inbox, count: 12, href: "/" },
    { id: "backlog", label: "Backlog", icon: Archive, count: 45, href: "/backlog" },
    { id: "active", label: "Active", icon: Activity, count: 8, href: "/active" },
    { id: "roadmap", label: "Roadmap", icon: Map, href: "/roadmap" },
    { id: "projects", label: "Departamentos", icon: Users, href: "/projects" },
    { id: "metrics", label: "Metrics", icon: BarChart3, href: "/metrics" },
  ]

  const projects = [
    { id: "tech", name: "Tecnología", color: "bg-blue-500", issues: 15 },
    { id: "marketing", name: "Marketing", color: "bg-green-500", issues: 8 },
    { id: "sales", name: "Ventas", color: "bg-purple-500", issues: 12 },
    { id: "hr", name: "Recursos Humanos", color: "bg-orange-500", issues: 6 },
    { id: "finance", name: "Finanzas", color: "bg-red-500", issues: 4 },
  ]

  const recentIssues = [
    { id: "SAI-307", title: "Licencia DGSFP & contratos", status: "in-progress" },
    { id: "SAI-306", title: "Comparador - Resumen final", status: "review" },
    { id: "SAI-305", title: "Contacto de planes con precio", status: "done" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case "in-progress":
        return <Clock className="h-3 w-3 text-blue-500" />
      case "review":
        return <AlertCircle className="h-3 w-3 text-orange-500" />
      default:
        return <Circle className="h-3 w-3 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">Sistema</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground bg-sidebar-accent border-sidebar-border hover:bg-sidebar-accent/80"
          onClick={onOpenCommandPalette}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar...
          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Main Navigation */}
        <div className="px-4 pb-4">
          <div className="space-y-1">
            {mainSections.map((section) => (
              <Link key={section.id} href={section.href}>
                <Button
                  variant={pathname === section.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-8 px-2",
                    pathname === section.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <section.icon className="h-4 w-4 mr-2" />
                  {section.label}
                  {section.count && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {section.count}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departamentos</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className={cn("h-2 w-2 rounded-full mr-2", project.color)} />
                {project.name}
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {project.issues}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recientes</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent cursor-pointer group"
              >
                {getStatusIcon(issue.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                  </div>
                  <p className="text-xs text-sidebar-foreground truncate">{issue.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-2 text-sidebar-foreground"
          onClick={onOpenCreateIssue}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo ticket
          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">N</kbd>
        </Button>
      </div>
    </div>
  )
}
