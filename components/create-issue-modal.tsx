"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CreateIssueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIssue: (issue: any) => void
}

export function CreateIssueModal({ open, onOpenChange, onCreateIssue }: CreateIssueModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [project, setProject] = useState("")
  const [priority, setPriority] = useState("medium")
  const [assignee, setAssignee] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")

  const projects = [
    { id: "tech", name: "Tecnología", color: "bg-blue-500" },
    { id: "marketing", name: "Marketing", color: "bg-green-500" },
    { id: "sales", name: "Ventas", color: "bg-purple-500" },
    { id: "hr", name: "Recursos Humanos", color: "bg-orange-500" },
    { id: "finance", name: "Finanzas", color: "bg-red-500" },
  ]

  const assignees = ["Tech Team", "Design Team", "Sales Team", "Marketing Team", "HR Team", "Finance Team"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !project) return

    const selectedProject = projects.find((p) => p.id === project)

    const newIssue = {
      id: `SAI-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      description: description.trim(),
      status: "backlog",
      priority,
      assignee: assignee || "Sin asignar",
      project: selectedProject?.name || "",
      projectColor: selectedProject?.color || "bg-gray-500",
      created: "hace unos segundos",
      updated: "hace unos segundos",
      reporter: "Usuario actual",
      labels,
    }

    onCreateIssue(newIssue)

    // Reset form
    setTitle("")
    setDescription("")
    setProject("")
    setPriority("medium")
    setAssignee("")
    setLabels([])
    setNewLabel("")

    onOpenChange(false)
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel("")
    }
  }

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label !== labelToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLabel.trim()) {
      e.preventDefault()
      addLabel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear nuevo ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Describe brevemente el problema o solicitud..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Proporciona más detalles sobre el ticket..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Departamento *</Label>
              <Select value={project} onValueChange={setProject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${proj.color}`} />
                        {proj.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
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

          <div className="space-y-2">
            <Label htmlFor="assignee">Asignar a</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar responsable" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <Badge key={label} variant="secondary" className="gap-1">
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Añadir etiqueta..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={addLabel}>
                Añadir
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || !project}>
              Crear ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
