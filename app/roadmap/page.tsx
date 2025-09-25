"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  MoreHorizontal,
} from "lucide-react"

interface Initiative {
  id: string
  title: string
  description: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  progress: number
  startDate: string
  endDate: string
  owner: string
  projects: string[]
  totalIssues: number
  completedIssues: number
  priority: "high" | "medium" | "low"
  budget?: string
  roi?: string
}

export default function RoadmapPage() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1 2025")

  const initiatives: Initiative[] = [
    {
      id: "INIT-001",
      title: "Transformación Digital Completa",
      description:
        "Modernización de todos los sistemas internos y procesos digitales para mejorar la eficiencia operacional",
      status: "in-progress",
      progress: 65,
      startDate: "Ene 2025",
      endDate: "Jun 2025",
      owner: "CTO",
      projects: ["Tecnología", "Marketing", "Ventas"],
      totalIssues: 45,
      completedIssues: 29,
      priority: "high",
      budget: "€150K",
      roi: "+25%",
    },
    {
      id: "INIT-002",
      title: "Expansión de Mercado Internacional",
      description: "Estrategia de entrada a nuevos mercados europeos con adaptación de productos y servicios",
      status: "planning",
      progress: 15,
      startDate: "Mar 2025",
      endDate: "Dic 2025",
      owner: "CEO",
      projects: ["Marketing", "Ventas", "Recursos Humanos"],
      totalIssues: 32,
      completedIssues: 5,
      priority: "high",
      budget: "€200K",
      roi: "+40%",
    },
    {
      id: "INIT-003",
      title: "Optimización de Procesos Internos",
      description: "Automatización y mejora de workflows internos para reducir tiempos y costos operacionales",
      status: "in-progress",
      progress: 80,
      startDate: "Nov 2024",
      endDate: "Feb 2025",
      owner: "COO",
      projects: ["Recursos Humanos", "Finanzas", "Tecnología"],
      totalIssues: 28,
      completedIssues: 22,
      priority: "medium",
      budget: "€75K",
      roi: "+15%",
    },
    {
      id: "INIT-004",
      title: "Plataforma de Customer Success",
      description: "Desarrollo de herramientas y procesos para mejorar la experiencia y retención de clientes",
      status: "completed",
      progress: 100,
      startDate: "Sep 2024",
      endDate: "Dic 2024",
      owner: "VP Customer Success",
      projects: ["Tecnología", "Marketing"],
      totalIssues: 18,
      completedIssues: 18,
      priority: "medium",
      budget: "€90K",
      roi: "+30%",
    },
  ]

  const getStatusColor = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "planning":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "on-hold":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusLabel = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En progreso"
      case "planning":
        return "Planificación"
      case "on-hold":
        return "En pausa"
      default:
        return status
    }
  }

  const getStatusIcon = (status: Initiative["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "planning":
        return <Target className="h-4 w-4 text-orange-500" />
      case "on-hold":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: Initiative["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const quarters = ["Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Roadmap"
          subtitle="Iniciativas estratégicas y proyectos transversales"
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                {quarters.map((quarter) => (
                  <Button
                    key={quarter}
                    variant={selectedQuarter === quarter ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => setSelectedQuarter(quarter)}
                  >
                    {quarter}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva iniciativa
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
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Iniciativas Activas</p>
                  <p className="text-2xl font-semibold">
                    {initiatives.filter((i) => i.status === "in-progress").length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-semibold">{initiatives.filter((i) => i.status === "completed").length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI Promedio</p>
                  <p className="text-2xl font-semibold">+27%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamentos</p>
                  <p className="text-2xl font-semibold">5</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Initiatives List */}
          <div className="space-y-4">
            {initiatives.map((initiative) => (
              <Card key={initiative.id} className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(initiative.status)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{initiative.title}</h3>
                          <Badge className={`${getStatusColor(initiative.status)} border`}>
                            {getStatusLabel(initiative.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(initiative.priority)}>
                            {initiative.priority === "high"
                              ? "Alta"
                              : initiative.priority === "medium"
                                ? "Media"
                                : "Baja"}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-3 text-pretty">{initiative.description}</p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {initiative.startDate} - {initiative.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{initiative.owner}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>
                              {initiative.completedIssues}/{initiative.totalIssues} tickets
                            </span>
                          </div>
                          {initiative.budget && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {initiative.budget} • ROI {initiative.roi}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{initiative.progress}%</span>
                    </div>
                    <Progress value={initiative.progress} className="h-2" />
                  </div>

                  {/* Projects */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Departamentos:</span>
                    <div className="flex items-center gap-2">
                      {initiative.projects.map((project, index) => (
                        <Badge key={project} variant="secondary" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
