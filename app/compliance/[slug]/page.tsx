"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { format, subDays, subHours } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Link2,
  Download,
  MoreHorizontal,
  Plus,
  ExternalLink,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Paperclip,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Circle,
  Target,
  Activity,
  History,
  FileCheck,
  Folder,
  ChevronRight,
  Upload,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import { IssuesAPI, IssueWithRelations } from "@/lib/api/issues"
import { AddEvidenceModal } from "@/components/add-evidence-modal"
import { GenerateReportModal } from "@/components/generate-report-modal"

// Types
type RiskStatus = "ok" | "warning" | "critical"
type ControlStatus = "compliant" | "partial" | "non_compliant" | "pending"
type RiskLevel = "low" | "medium" | "high" | "critical"
type ActionStatus = "open" | "in_progress" | "closed"

interface Control {
  id: string
  name: string
  description: string
  status: ControlStatus
  lastReview: Date
  comments: string
  evidenceCount: number
}

interface Evidence {
  id: string
  type: "file" | "link"
  title: string
  tags: string[]
  uploadDate: Date
  user: {
    name: string
    initials: string
  }
  url?: string
  fileName?: string
}

interface Risk {
  id: string
  title: string
  description: string
  impact: RiskLevel
  probability: RiskLevel
  status: ActionStatus
  dueDate: Date
  owner: {
    name: string
    initials: string
  }
}

interface Action {
  id: string
  title: string
  description: string
  status: ActionStatus
  dueDate: Date
  assignee: {
    name: string
    initials: string
  }
  relatedRiskId?: string
}

interface HistoryEvent {
  id: string
  type: "status_change" | "risk_created" | "action_closed" | "evidence_added" | "control_updated"
  description: string
  date: Date
  user: {
    name: string
    initials: string
  }
  metadata?: {
    from?: string
    to?: string
  }
}

interface InitiativeDetail {
  id: string
  slug: string
  name: string
  businessUnit: string
  project: string
  globalScore: number
  status: RiskStatus
  environment: string
  controls: Control[]
  evidences: Evidence[]
  risks: Risk[]
  actions: Action[]
  history: HistoryEvent[]
}

// Seeded random for consistent values per issue
const seededRandom = (seed: string, min: number, max: number) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const normalized = Math.abs(hash % 1000) / 1000
  return Math.floor(min + normalized * (max - min))
}

// Generate initiative detail from issue data
const generateInitiativeDetailFromIssue = (issue: IssueWithRelations): InitiativeDetail => {
  const seed = issue.id
  
  // Generate control statuses based on seed
  const controlStatuses: ControlStatus[] = ['compliant', 'compliant', 'partial', 'non_compliant', 'compliant', 'pending']
  const shuffledStatuses = controlStatuses.sort(() => seededRandom(seed + 'shuffle', 0, 100) - 50)
  
  const controls: Control[] = [
    { id: "c1", name: "Control de acceso", description: "Verificación de permisos de acceso", status: shuffledStatuses[0], lastReview: subDays(new Date(), seededRandom(seed + 'c1', 1, 15)), comments: "Todos los accesos verificados correctamente", evidenceCount: seededRandom(seed + 'c1e', 1, 5) },
    { id: "c2", name: "Cifrado de datos", description: "Datos en reposo y tránsito cifrados", status: shuffledStatuses[1], lastReview: subDays(new Date(), seededRandom(seed + 'c2', 5, 20)), comments: "Cifrado AES-256 implementado", evidenceCount: seededRandom(seed + 'c2e', 0, 4) },
    { id: "c3", name: "Backup y recuperación", description: "Procedimientos de backup verificados", status: shuffledStatuses[2], lastReview: subDays(new Date(), seededRandom(seed + 'c3', 1, 10)), comments: "Falta documentar procedimiento de recuperación", evidenceCount: seededRandom(seed + 'c3e', 0, 3) },
    { id: "c4", name: "Gestión de vulnerabilidades", description: "Escaneo y remediación de vulnerabilidades", status: shuffledStatuses[3], lastReview: subDays(new Date(), seededRandom(seed + 'c4', 3, 15)), comments: "Vulnerabilidades pendientes de revisión", evidenceCount: seededRandom(seed + 'c4e', 0, 2) },
    { id: "c5", name: "Logs y auditoría", description: "Registro de eventos de seguridad", status: shuffledStatuses[4], lastReview: subDays(new Date(), seededRandom(seed + 'c5', 1, 8)), comments: "Logs centralizados en SIEM", evidenceCount: seededRandom(seed + 'c5e', 2, 6) },
    { id: "c6", name: "Gestión de incidentes", description: "Procedimiento de respuesta a incidentes", status: shuffledStatuses[5], lastReview: subDays(new Date(), seededRandom(seed + 'c6', 10, 30)), comments: "Pendiente revisión trimestral", evidenceCount: seededRandom(seed + 'c6e', 0, 3) },
  ]

  // Get user info for mock data
  const assigneeName = issue.assignee?.name || "Usuario"
  const assigneeInitials = assigneeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const reporterName = issue.reporter?.name || "Reportador"
  const reporterInitials = reporterName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const evidences: Evidence[] = [
    { id: "e1", type: "file", title: `Informe de auditoría - ${issue.title}`, tags: ["SOC 2", "Auditoría"], uploadDate: subDays(new Date(), seededRandom(seed + 'e1', 5, 20)), user: { name: assigneeName, initials: assigneeInitials }, fileName: "auditoria_q3_2024.pdf" },
    { id: "e2", type: "link", title: "Dashboard de monitoreo", tags: ["DORA", "Monitoreo"], uploadDate: subDays(new Date(), seededRandom(seed + 'e2', 1, 10)), user: { name: reporterName, initials: reporterInitials }, url: "https://monitor.example.com" },
    { id: "e3", type: "file", title: "Política de seguridad v2.1", tags: ["ISO27001", "Políticas"], uploadDate: subDays(new Date(), seededRandom(seed + 'e3', 20, 40)), user: { name: assigneeName, initials: assigneeInitials }, fileName: "politica_seguridad_v2.1.docx" },
    { id: "e4", type: "file", title: "Reporte de vulnerabilidades", tags: ["DORA", "Seguridad"], uploadDate: subDays(new Date(), seededRandom(seed + 'e4', 5, 15)), user: { name: reporterName, initials: reporterInitials }, fileName: "vulnerabilidades_oct_2024.xlsx" },
    { id: "e5", type: "link", title: "Documentación de arquitectura", tags: ["Legal", "Arquitectura"], uploadDate: subDays(new Date(), seededRandom(seed + 'e5', 30, 60)), user: { name: assigneeName, initials: assigneeInitials }, url: "https://docs.example.com/arch" },
  ]

  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical']
  const actionStatuses: ActionStatus[] = ['open', 'in_progress', 'closed']

  const risks: Risk[] = [
    { id: "r1", title: "Vulnerabilidades sin parchear", description: "CVEs pendientes de remediación", impact: riskLevels[seededRandom(seed + 'r1i', 2, 4)], probability: riskLevels[seededRandom(seed + 'r1p', 1, 4)], status: actionStatuses[seededRandom(seed + 'r1s', 0, 2)], dueDate: subDays(new Date(), -seededRandom(seed + 'r1d', 5, 15)), owner: { name: assigneeName, initials: assigneeInitials } },
    { id: "r2", title: "Acceso privilegiado excesivo", description: "Usuarios con permisos de admin innecesarios", impact: riskLevels[seededRandom(seed + 'r2i', 1, 3)], probability: riskLevels[seededRandom(seed + 'r2p', 1, 3)], status: actionStatuses[seededRandom(seed + 'r2s', 0, 3)], dueDate: subDays(new Date(), -seededRandom(seed + 'r2d', 10, 20)), owner: { name: reporterName, initials: reporterInitials } },
    { id: "r3", title: "Falta de backup offsite", description: "No hay réplica de datos fuera del datacenter principal", impact: riskLevels[seededRandom(seed + 'r3i', 2, 4)], probability: riskLevels[seededRandom(seed + 'r3p', 0, 2)], status: actionStatuses[seededRandom(seed + 'r3s', 0, 2)], dueDate: subDays(new Date(), -seededRandom(seed + 'r3d', 20, 40)), owner: { name: assigneeName, initials: assigneeInitials } },
  ]

  const actions: Action[] = [
    { id: "a1", title: "Aplicar parches de seguridad", description: "Instalar parches de seguridad críticos", status: actionStatuses[seededRandom(seed + 'a1s', 0, 2)], dueDate: subDays(new Date(), -seededRandom(seed + 'a1d', 3, 10)), assignee: { name: assigneeName, initials: assigneeInitials }, relatedRiskId: "r1" },
    { id: "a2", title: "Revisar permisos de usuarios", description: "Auditar y reducir permisos de administrador", status: actionStatuses[seededRandom(seed + 'a2s', 0, 2)], dueDate: subDays(new Date(), -seededRandom(seed + 'a2d', 5, 15)), assignee: { name: reporterName, initials: reporterInitials }, relatedRiskId: "r2" },
    { id: "a3", title: "Implementar backup DR", description: "Configurar réplica en datacenter secundario", status: actionStatuses[seededRandom(seed + 'a3s', 0, 2)], dueDate: subDays(new Date(), -seededRandom(seed + 'a3d', 15, 25)), assignee: { name: assigneeName, initials: assigneeInitials }, relatedRiskId: "r3" },
    { id: "a4", title: "Actualizar documentación", description: "Documentar nuevos procedimientos", status: "closed", dueDate: subDays(new Date(), seededRandom(seed + 'a4d', 3, 10)), assignee: { name: reporterName, initials: reporterInitials } },
  ]

  const history: HistoryEvent[] = [
    { id: "h1", type: "status_change", description: "Control 'Cifrado de datos' pasó de Parcial a Compliant", date: subHours(new Date(), seededRandom(seed + 'h1', 1, 12)), user: { name: assigneeName, initials: assigneeInitials }, metadata: { from: "Parcial", to: "Compliant" } },
    { id: "h2", type: "evidence_added", description: `Se añadió evidencia para '${issue.title}'`, date: subDays(new Date(), seededRandom(seed + 'h2', 1, 3)), user: { name: reporterName, initials: reporterInitials } },
    { id: "h3", type: "risk_created", description: "Se identificó nuevo riesgo de seguridad", date: subDays(new Date(), seededRandom(seed + 'h3', 2, 5)), user: { name: assigneeName, initials: assigneeInitials } },
    { id: "h4", type: "action_closed", description: "Se completó acción 'Actualizar documentación'", date: subDays(new Date(), seededRandom(seed + 'h4', 3, 7)), user: { name: reporterName, initials: reporterInitials } },
    { id: "h5", type: "control_updated", description: "Se actualizó control 'Gestión de vulnerabilidades'", date: subDays(new Date(), seededRandom(seed + 'h5', 5, 12)), user: { name: assigneeName, initials: assigneeInitials } },
    { id: "h6", type: "status_change", description: "Score global actualizado", date: subDays(new Date(), seededRandom(seed + 'h6', 8, 15)), user: { name: "Sistema", initials: "SY" }, metadata: { from: "72%", to: "68%" } },
  ]

  const compliantCount = controls.filter(c => c.status === "compliant").length
  const score = Math.round((compliantCount / controls.length) * 100)
  let status: RiskStatus = "ok"
  if (score < 50) status = "critical"
  else if (score < 75) status = "warning"

  return {
    id: issue.id,
    slug: issue.id,
    name: issue.title,
    businessUnit: issue.initiative?.name || "Sin asignar",
    project: issue.project?.name || "Sin asignar",
    globalScore: score,
    status,
    environment: seededRandom(seed + 'env', 0, 2) === 0 ? "PROD" : "DEV",
    controls,
    evidences,
    risks,
    actions,
    history,
  }
}

// Status components - More refined styling
const ControlStatusBadge = ({ status }: { status: ControlStatus }) => {
  const config = {
    compliant: { 
      label: "Compliant", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/50", 
      icon: CheckCircle,
      dotClass: "bg-emerald-500"
    },
    partial: { 
      label: "Parcial", 
      className: "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/50", 
      icon: AlertTriangle,
      dotClass: "bg-amber-500"
    },
    non_compliant: { 
      label: "No Compliant", 
      className: "bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100/50", 
      icon: XCircle,
      dotClass: "bg-red-500"
    },
    pending: { 
      label: "Pendiente", 
      className: "bg-gray-50 text-gray-600 border-gray-200/60 hover:bg-gray-100/50", 
      icon: Clock,
      dotClass: "bg-gray-400"
    },
  }
  const { label, className, icon: Icon, dotClass } = config[status]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors",
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  )
}

const RiskLevelBadge = ({ level, type }: { level: RiskLevel; type: "impact" | "probability" }) => {
  const config = {
    low: { label: "Bajo", className: "bg-emerald-50/80 text-emerald-700 border-emerald-100" },
    medium: { label: "Medio", className: "bg-amber-50/80 text-amber-700 border-amber-100" },
    high: { label: "Alto", className: "bg-orange-50/80 text-orange-700 border-orange-100" },
    critical: { label: "Crítico", className: "bg-red-50/80 text-red-700 border-red-100" },
  }
  const { label, className } = config[level]
  const prefix = type === "impact" ? "I" : "P"
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
      className
    )}>
      <span className="text-[9px] opacity-60">{prefix}:</span>
      {label}
    </span>
  )
}

const ActionStatusBadge = ({ status }: { status: ActionStatus }) => {
  const config = {
    open: { 
      label: "Abierto", 
      className: "bg-blue-50/80 text-blue-700 border-blue-100", 
      icon: Circle,
      dotClass: "bg-blue-500"
    },
    in_progress: { 
      label: "En progreso", 
      className: "bg-amber-50/80 text-amber-700 border-amber-100", 
      icon: Activity,
      dotClass: "bg-amber-500"
    },
    closed: { 
      label: "Cerrado", 
      className: "bg-gray-50/80 text-gray-600 border-gray-200", 
      icon: CheckCircle2,
      dotClass: "bg-gray-400"
    },
  }
  const { label, className, dotClass } = config[status]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border",
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  )
}

const GlobalScorePill = ({ score, status }: { score: number; status: RiskStatus }) => {
  const config = {
    ok: "bg-emerald-100/80 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-100/80 text-amber-700 border-amber-200/60",
    critical: "bg-red-100/80 text-red-700 border-red-200/60",
  }
  return (
    <span className={cn(
      "inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border",
      config[status]
    )}>
      {score}%
    </span>
  )
}

const StatusPill = ({ status }: { status: RiskStatus }) => {
  const config = {
    ok: { 
      label: "OK", 
      className: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60", 
      icon: CheckCircle,
      dotClass: "bg-emerald-500"
    },
    warning: { 
      label: "Warning", 
      className: "bg-amber-50/80 text-amber-700 border-amber-200/60", 
      icon: AlertTriangle,
      dotClass: "bg-amber-500"
    },
    critical: { 
      label: "Critical", 
      className: "bg-red-50/80 text-red-700 border-red-200/60", 
      icon: XCircle,
      dotClass: "bg-red-500"
    },
  }
  const { label, className, icon: Icon, dotClass } = config[status]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  )
}

// Avatar component
const UserAvatar = ({ initials, name, size = "sm" }: { initials: string; name: string; size?: "xs" | "sm" | "md" }) => {
  const sizeClasses = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-medium text-gray-600 ring-1 ring-gray-200/50",
            sizeClasses[size]
          )}>
            {initials}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Note: AddEvidenceModal is now imported from "@/components/add-evidence-modal"

// Timeline Event Component
function TimelineEvent({ event, isLast }: { event: HistoryEvent; isLast: boolean }) {
  const getConfig = () => {
    switch (event.type) {
      case "status_change": return { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" }
      case "risk_created": return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" }
      case "action_closed": return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" }
      case "evidence_added": return { icon: FileCheck, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" }
      case "control_updated": return { icon: Shield, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" }
      default: return { icon: Circle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100" }
    }
  }

  const { icon: Icon, color, bg, border } = getConfig()

  return (
    <motion.div 
      className="flex gap-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", bg, border)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-gray-200 to-transparent mt-2" />}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm text-gray-900 mb-1">{event.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <UserAvatar initials={event.user.initials} name={event.user.name} size="xs" />
          <span className="font-medium text-gray-600">{event.user.name}</span>
          <span className="text-gray-300">•</span>
          <span>{format(event.date, "dd MMM yyyy, HH:mm")}</span>
        </div>
      </div>
    </motion.div>
  )
}

// Risk/Action Card Component
function RiskCard({ risk }: { risk: Risk }) {
  const isOverdue = risk.dueDate < new Date() && risk.status !== "closed"
  
  return (
    <motion.div 
      className={cn(
        "group border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
        isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-white hover:border-gray-300"
      )}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {risk.title}
        </h4>
        <ActionStatusBadge status={risk.status} />
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{risk.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RiskLevelBadge level={risk.impact} type="impact" />
          <RiskLevelBadge level={risk.probability} type="probability" />
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isOverdue ? "text-red-600" : "text-gray-500"
        )}>
          <Calendar className="h-3.5 w-3.5" />
          <span className="font-medium">{format(risk.dueDate, "dd MMM")}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <UserAvatar initials={risk.owner.initials} name={risk.owner.name} size="xs" />
        <span className="text-xs text-gray-600">{risk.owner.name}</span>
      </div>
    </motion.div>
  )
}

function ActionCard({ action }: { action: Action }) {
  const isOverdue = action.dueDate < new Date() && action.status !== "closed"
  
  return (
    <motion.div 
      className={cn(
        "group border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
        action.status === "closed" 
          ? "border-gray-100 bg-gray-50/50" 
          : isOverdue 
            ? "border-red-200 bg-red-50/30" 
            : "border-gray-200 bg-white hover:border-gray-300"
      )}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={cn(
          "text-sm font-medium transition-colors",
          action.status === "closed" ? "text-gray-500" : "text-gray-900 group-hover:text-gray-700"
        )}>
          {action.title}
        </h4>
        <ActionStatusBadge status={action.status} />
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{action.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar initials={action.assignee.initials} name={action.assignee.name} size="xs" />
          <span className="text-xs text-gray-600">{action.assignee.name}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isOverdue && action.status !== "closed" ? "text-red-600" : "text-gray-500"
        )}>
          <Calendar className="h-3.5 w-3.5" />
          <span className="font-medium">{format(action.dueDate, "dd MMM")}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ComplianceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { currentOrg } = useAuth()
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [initiative, setInitiative] = useState<InitiativeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"controles" | "evidencias" | "riesgos" | "historico">("controles")
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false)
  const [generateReportOpen, setGenerateReportOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        // Load the real issue from the database
        const issue = await IssuesAPI.getIssueById(slug)
        
        if (issue) {
          setInitiative(generateInitiativeDetailFromIssue(issue))
        } else {
          // If issue not found, redirect back to compliance
          router.push('/compliance')
        }
      } catch (error) {
        console.error('Error loading issue:', error)
        router.push('/compliance')
      } finally {
      setLoading(false)
      }
    }
    loadData()
  }, [slug, currentOrg?.organization?.id, router])

  const filteredHistory = useMemo(() => {
    if (!initiative) return []
    if (historyFilter === "all") return initiative.history
    return initiative.history.filter(e => e.type === historyFilter)
  }, [initiative, historyFilter])

  if (loading || !initiative) {
    return (
      <ResizableAppShell onOpenCommandPalette={() => setCommandPaletteOpen(true)}>
        <ResizablePageSheet header={<div />}>
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  return (
    <ResizableAppShell onOpenCommandPalette={() => setCommandPaletteOpen(true)}>
      <ResizablePageSheet
        header={
          <div>
            <div 
              className="flex items-center justify-between w-full h-full" 
              style={{ 
                paddingLeft: '28px', 
                paddingRight: '20px', 
                paddingTop: 'var(--header-padding-y)', 
                paddingBottom: 'var(--header-padding-y)' 
              }}
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/compliance")}
                  className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-500" />
                </Button>
                <div className="flex items-center gap-1.5 text-[14px]">
                  <span className="text-gray-400">{initiative.businessUnit}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  <span className="text-gray-400">{initiative.project}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  <span className="font-medium text-gray-900">{initiative.name}</span>
                </div>
              </div>

              {/* Actions */}
              <Button 
                size="sm" 
                className="h-8 bg-gray-800 hover:bg-gray-900 text-white gap-2 text-xs"
                onClick={() => setGenerateReportOpen(true)}
              >
                <FileText className="h-3.5 w-3.5" />
                Generar reporte
              </Button>
            </div>
          </div>
        }
      >
        <motion.div 
          className="-mx-5 -mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Section */}
          <div className="border-b border-gray-100 bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="py-5">
              {/* Title row */}
              <div className="flex items-center gap-3 mb-5">
                <h1 className="text-lg font-semibold text-gray-900">{initiative.name}</h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    initiative.environment === "PROD" ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  {initiative.environment}
                </span>
              </div>

              {/* KPI Cards Row - Minimal style */}
              <div className="grid grid-cols-4 gap-4">
                {/* Global Score */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Score Global</span>
                    <StatusPill status={initiative.status} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-3xl font-semibold tracking-tight",
                      initiative.status === "ok" && "text-emerald-600",
                      initiative.status === "warning" && "text-amber-600",
                      initiative.status === "critical" && "text-red-600"
                    )}>
                      {initiative.globalScore}
                    </span>
                    <span className="text-lg text-gray-300">%</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <span className="text-xs text-gray-500">Controles</span>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-3xl font-semibold tracking-tight text-gray-900">
                      {initiative.controls.filter(c => c.status === "compliant").length}
                    </span>
                    <span className="text-lg text-gray-300">/ {initiative.controls.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">compliant</span>
                </div>

                {/* Risks */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <span className="text-xs text-gray-500">Riesgos abiertos</span>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-3xl font-semibold tracking-tight text-gray-900">
                      {initiative.risks.filter(r => r.status !== "closed").length}
                    </span>
                    <span className="text-lg text-gray-300">/ {initiative.risks.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">total identificados</span>
                </div>

                {/* Actions */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <span className="text-xs text-gray-500">Acciones</span>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-3xl font-semibold tracking-tight text-gray-900">
                      {initiative.actions.filter(a => a.status === "in_progress").length}
                    </span>
                    <span className="text-sm text-gray-400">en progreso</span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">{initiative.actions.filter(a => a.status === "open").length} pendientes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Browser-style */}
          <div className="bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center justify-between h-full gap-4" style={{ height: 'var(--header-h)' }}>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-w-0 h-full flex items-end">
                <div className="flex items-center gap-4 w-full">
                  <TabsList className="relative h-auto w-fit gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                {[
                  { value: "controles", label: "Controles", icon: Shield },
                  { value: "evidencias", label: "Evidencias", icon: Paperclip },
                  { value: "riesgos", label: "Riesgos & Acciones", icon: AlertTriangle },
                  { value: "historico", label: "Histórico", icon: History },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                        className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-8 px-3 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                      >
                        <tab.icon 
                          className="opacity-60 shrink-0" 
                          size={13} 
                          strokeWidth={2} 
                          aria-hidden="true"
                        />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
                </div>
            </Tabs>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '20px', paddingBottom: '24px' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              
              {/* Controles Tab */}
              <TabsContent value="controles" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 max-w-2xl">
                      Lista de controles de seguridad y cumplimiento asociados a esta initiative. Cada control debe ser revisado periódicamente.
                    </p>
                    <Button size="sm" className="h-7 text-xs bg-gray-800 hover:bg-gray-900 gap-1.5 shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                      Añadir control
                    </Button>
                  </div>

                  {/* Controls List */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="py-2.5 border-b border-gray-100 bg-gray-50/50 px-4">
                      <div className="grid grid-cols-[1fr_110px_90px_1fr_80px] gap-4">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Control</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Revisión</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Comentarios</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Evidencias</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {initiative.controls.map((control, index) => (
                        <motion.div
                          key={control.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="py-3.5 px-4 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                        >
                          <div className="grid grid-cols-[1fr_110px_90px_1fr_80px] gap-4 items-center">
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors block truncate">
                                {control.name}
                              </span>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{control.description}</p>
                            </div>
                            <div>
                              <ControlStatusBadge status={control.status} />
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(control.lastReview, "dd MMM")}
                            </div>
                            <div className="text-sm text-gray-500 truncate pr-4">
                              {control.comments}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-gray-500">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span className="text-sm font-medium">{control.evidenceCount}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Evidencias Tab */}
              <TabsContent value="evidencias" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 max-w-2xl">
                      Documentos y enlaces que sirven como evidencia de cumplimiento para los controles.
                    </p>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs bg-gray-800 hover:bg-gray-900 gap-1.5 shrink-0"
                      onClick={() => setAddEvidenceOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Añadir evidencia
                    </Button>
                  </div>

                  {/* Evidences List */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="py-2.5 border-b border-gray-100 bg-gray-50/50 px-4">
                      <div className="grid grid-cols-[40px_1fr_160px_90px_110px_80px] gap-4">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tipo</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Título</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tags</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fecha</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Usuario</div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {initiative.evidences.map((evidence, index) => (
                        <motion.div
                          key={evidence.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="py-3.5 px-4 hover:bg-gray-50/50 transition-colors group"
                        >
                          <div className="grid grid-cols-[40px_1fr_160px_90px_110px_80px] gap-4 items-center">
                            <div className="flex justify-center">
                              <div className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center",
                                evidence.type === "file" ? "bg-gray-100" : "bg-blue-50"
                              )}>
                                {evidence.type === "file" ? (
                                  <FileText className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Link2 className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                              {evidence.title}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {evidence.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200/60">
                                  {tag}
                                </span>
                              ))}
                              {evidence.tags.length > 2 && (
                                <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                  +{evidence.tags.length - 2}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(evidence.uploadDate, "dd MMM")}
                            </div>
                            <div className="flex items-center gap-2">
                              <UserAvatar initials={evidence.user.initials} name={evidence.user.name} size="xs" />
                              <span className="text-sm text-gray-600 truncate">{evidence.user.name.split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md">
                                <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                              {evidence.type === "file" && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md">
                                  <Download className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md">
                                    <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem className="text-xs gap-2">
                                    <Edit className="h-3.5 w-3.5" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-xs gap-2 text-red-600">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Riesgos & Acciones Tab */}
              <TabsContent value="riesgos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 max-w-2xl">
                      Gestión de riesgos identificados y acciones correctivas asociadas.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-dashed">
                        <Plus className="h-3.5 w-3.5" />
                        Nuevo riesgo
                      </Button>
                      <Button size="sm" className="h-7 text-xs bg-gray-800 hover:bg-gray-900 gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Nueva acción
                      </Button>
                    </div>
                  </div>

                  {/* Two columns layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risks Column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Riesgos
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {initiative.risks.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {initiative.risks.map((risk, index) => (
                          <motion.div
                            key={risk.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                          >
                            <RiskCard risk={risk} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                          <Target className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Acciones
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {initiative.actions.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {initiative.actions.map((action, index) => (
                          <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                          >
                            <ActionCard action={action} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Histórico Tab */}
              <TabsContent value="historico" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 max-w-2xl">
                      Historial de cambios y eventos relacionados con esta initiative.
                    </p>
                    <Select value={historyFilter} onValueChange={setHistoryFilter}>
                      <SelectTrigger className="w-[180px] h-7 text-xs bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los eventos</SelectItem>
                        <SelectItem value="status_change">Cambios de estado</SelectItem>
                        <SelectItem value="risk_created">Creación de riesgos</SelectItem>
                        <SelectItem value="action_closed">Cierre de acciones</SelectItem>
                        <SelectItem value="evidence_added">Evidencias añadidas</SelectItem>
                        <SelectItem value="control_updated">Controles actualizados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timeline */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-b from-gray-50/30 to-white">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={historyFilter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-0"
                      >
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((event, index) => (
                            <TimelineEvent 
                              key={event.id} 
                              event={event} 
                              isLast={index === filteredHistory.length - 1} 
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm">No hay eventos con este filtro</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Add Evidence Modal */}
        <AddEvidenceModal open={addEvidenceOpen} onOpenChange={setAddEvidenceOpen} />
        
        {/* Generate Report Modal */}
        <GenerateReportModal 
          open={generateReportOpen} 
          onOpenChange={setGenerateReportOpen}
          initiativeName={initiative.name}
          initiativeData={{
            initiative: {
              name: initiative.name,
              businessUnit: initiative.businessUnit,
              project: initiative.project,
              score: initiative.globalScore,
              status: initiative.status,
            },
            controls: {
              total: initiative.controls.length,
              compliant: initiative.controls.filter(c => c.status === "compliant").length,
              partial: initiative.controls.filter(c => c.status === "partial").length,
              nonCompliant: initiative.controls.filter(c => c.status === "non_compliant").length,
            },
            risks: {
              total: initiative.risks.length,
              open: initiative.risks.filter(r => r.status !== "closed").length,
              critical: initiative.risks.filter(r => r.impact === "critical" || r.impact === "high").length,
            },
            actions: {
              total: initiative.actions.length,
              pending: initiative.actions.filter(a => a.status === "open").length,
              inProgress: initiative.actions.filter(a => a.status === "in_progress").length,
              completed: initiative.actions.filter(a => a.status === "closed").length,
            },
            evidence: {
              total: initiative.evidences.length,
              files: initiative.evidences.filter(e => e.type === "file").length,
              links: initiative.evidences.filter(e => e.type === "link").length,
            },
          }}
        />
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
