"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Target, CheckCircle2, Plus, Filter, MoreHorizontal, Activity } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  color: string
  manager: string
  team: string[]
  activeIssues: number
  completedIssues: number
  totalIssues: number
  progress: number
  throughput: number
  cycleTime: string
  slaCompliance: number
  initiatives: string[]
  status: "active" | "planning" | "on-hold"
}

export default function ProjectsPage() {
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")

  const projects: Project[] = [
    {
      id: "tech",
      name: "Tecnología",
      description: "Desarrollo de productos, infraestructura y sistemas internos",
      color: "bg-blue-500",
      manager: "Carlos Rodríguez",
      team: ["Frontend Team", "Backend Team", "DevOps Team", "QA Team"],
      activeIssues: 15,
      completedIssues: 89,
      totalIssues: 104,
      progress: 85,
      throughput: 12,
      cycleTime: "3.2 días",
      slaCompliance: 94,
      initiatives: ["Transformación Digital", "Optimización Procesos"],
      status: "active",
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Estrategia de marca, contenido y adquisición de clientes",
      color: "bg-green-500",
      manager: "Ana Martínez",
      team: ["Content Team", "Design Team", "Growth Team"],
      activeIssues: 8,
      completedIssues: 45,
      totalIssues: 53,
      progress: 85,
      throughput: 8,
      cycleTime: "2.1 días",
      slaCompliance: 98,
      initiatives: ["Expansión Internacional", "Customer Success"],
      status: "active",
    },
    {
      id: "sales",
      name: "Ventas",
      description: "Gestión comercial, relaciones con clientes y revenue",
      color: "bg-purple-500",
      manager: "Miguel López",
      team: ["Sales Team", "Account Management", "Business Development"],
      activeIssues: 12,
      completedIssues: 67,
      totalIssues: 79,
      progress: 85,
      throughput: 10,
      cycleTime: "1.8 días",
      slaCompliance: 92,
      initiatives: ["Expansión Internacional"],
      status: "active",
    },
    {
      id: "hr",
      name: "Recursos Humanos",
      description: "Gestión de talento, cultura organizacional y desarrollo",
      color: "bg-orange-500",
      manager: "Laura García",
      team: ["Talent Acquisition", "People Operations", "Learning & Development"],
      activeIssues: 6,
      completedIssues: 34,
      totalIssues: 40,
      progress: 85,
      throughput: 5,
      cycleTime: "4.1 días",
      slaCompliance: 89,
      initiatives: ["Expansión Internacional", "Optimización Procesos"],
      status: "active",
    },
    {
      id: "finance",
      name: "Finanzas",
      description: "Control financiero, presupuestos y análisis económico",
      color: "bg-red-500",
      manager: "Roberto Sánchez",
      team: ["Finance Team", "Accounting", "Financial Planning"],
      activeIssues: 4,
      completedIssues: 28,
      totalIssues: 32,
      progress: 88,
      throughput: 4,
      cycleTime: "2.5 días",
      slaCompliance: 96,
      initiatives: ["Optimización Procesos"],
      status: "active",
    },
  ]

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "planning":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "on-hold":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusLabel = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "Activo"
      case "planning":
        return "Planificación"
      case "on-hold":
        return "En pausa"
      default:
        return status
    }
  }

  const getSLAColor = (sla: number) => {
    if (sla >= 95) return "text-green-500"
    if (sla >= 90) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Departamentos"
          subtitle="Vista de Business Units y equipos de trabajo"
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={selectedView === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setSelectedView("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={selectedView === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setSelectedView("list")}
                >
                  Lista
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo departamento
              </Button>
            </div>
          }
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamentos Activos</p>
                  <p className="text-2xl font-semibold">{projects.filter((p) => p.status === "active").length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Activos</p>
                  <p className="text-2xl font-semibold">{projects.reduce((sum, p) => sum + p.activeIssues, 0)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Throughput Promedio</p>
                  <p className="text-2xl font-semibold">
                    {Math.round(projects.reduce((sum, p) => sum + p.throughput, 0) / projects.length)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SLA Promedio</p>
                  <p className="text-2xl font-semibold">
                    {Math.round(projects.reduce((sum, p) => sum + p.slaCompliance, 0) / projects.length)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Projects Grid/List */}
          {selectedView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${project.color}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">{project.name}</h3>
                          <Badge className={`${getStatusColor(project.status)} border mt-1`}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground text-pretty">{project.description}</p>

                    {/* Manager */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {project.manager
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{project.manager}</span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tickets activos</p>
                        <p className="font-semibold">{project.activeIssues}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Throughput</p>
                        <p className="font-semibold">{project.throughput}/semana</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cycle time</p>
                        <p className="font-semibold">{project.cycleTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SLA</p>
                        <p className={`font-semibold ${getSLAColor(project.slaCompliance)}`}>
                          {project.slaCompliance}%
                        </p>
                      </div>
                    </div>

                    {/* Initiatives */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Iniciativas</p>
                      <div className="flex flex-wrap gap-1">
                        {project.initiatives.map((initiative) => (
                          <Badge key={initiative} variant="outline" className="text-xs">
                            {initiative}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Card key={project.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-3 w-3 rounded-full ${project.color}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{project.name}</h3>
                          <Badge className={`${getStatusColor(project.status)} border`}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Manager: {project.manager}</span>
                          <span>•</span>
                          <span>{project.activeIssues} tickets activos</span>
                          <span>•</span>
                          <span>Throughput: {project.throughput}/semana</span>
                          <span>•</span>
                          <span className={getSLAColor(project.slaCompliance)}>SLA: {project.slaCompliance}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{project.progress}%</p>
                        <Progress value={project.progress} className="h-1 w-20" />
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
