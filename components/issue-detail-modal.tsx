"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Tag,
  MoreHorizontal,
} from "lucide-react"

interface Issue {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  project: string
  projectColor: string
  created: string
  updated: string
  reporter: string
  labels?: string[]
  comments?: Array<{
    id: string
    author: string
    content: string
    timestamp: string
  }>
}

interface IssueDetailModalProps {
  issue: Issue | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IssueDetailModal({ issue, open, onOpenChange }: IssueDetailModalProps) {
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState(issue?.status || "backlog")
  const [priority, setPriority] = useState(issue?.priority || "medium")

  if (!issue) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case "low":
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const comments = issue.comments || [
    {
      id: "1",
      author: "Juan Pérez",
      content:
        "He revisado los requisitos y creo que necesitamos más información sobre la integración con el sistema actual.",
      timestamp: "hace 2 horas",
    },
    {
      id: "2",
      author: "María García",
      content: "Adjunto el documento con las especificaciones técnicas. Por favor, revisar antes de proceder.",
      timestamp: "hace 1 día",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(issue.status)}
              <div>
                <DialogTitle className="text-xl font-semibold">{issue.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-muted-foreground">{issue.id}</span>
                  <div className={`h-2 w-2 rounded-full ${issue.projectColor}`} />
                  <span className="text-sm text-muted-foreground">{issue.project}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios ({comments.length})
                </h3>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4 flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Añadir comentario..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Adjuntar
                      </Button>
                      <Button size="sm" disabled={!comment.trim()}>
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="in-progress">En progreso</SelectItem>
                      <SelectItem value="review">En revisión</SelectItem>
                      <SelectItem value="done">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Prioridad</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Assignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Asignado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">TT</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{issue.assignee}</span>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Creado {issue.created}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Actualizado {issue.updated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Reportado por {issue.reporter || "Sistema"}</span>
                </div>
              </div>

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Etiquetas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
