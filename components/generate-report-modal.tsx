"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  Shield,
  AlertTriangle,
  Paperclip,
  Target,
  Activity,
  FileDown,
  FileSpreadsheet,
  Printer,
  Mail,
  Copy,
  Clock,
  User,
  Calendar,
  TrendingUp,
  Settings2,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Report sections for configuration
const REPORT_SECTIONS = [
  { id: "summary", label: "Resumen ejecutivo", description: "Overview del estado de cumplimiento", required: true },
  { id: "controls", label: "Estado de controles", description: "Detalle de cada control y su estado" },
  { id: "risks", label: "Análisis de riesgos", description: "Matriz de riesgos e impacto" },
  { id: "actions", label: "Acciones pendientes", description: "Plan de acción y responsables" },
  { id: "evidence", label: "Evidencias", description: "Listado de documentación adjunta" },
  { id: "recommendations", label: "Recomendaciones", description: "Sugerencias de mejora" },
]

interface ReportData {
  initiative: {
    name: string
    businessUnit: string
    project: string
    score: number
    status: "ok" | "warning" | "critical"
  }
  controls: {
    total: number
    compliant: number
    partial: number
    nonCompliant: number
  }
  risks: {
    total: number
    open: number
    critical: number
  }
  actions: {
    total: number
    pending: number
    inProgress: number
    completed: number
  }
  evidence: {
    total: number
    files: number
    links: number
  }
}

interface GenerateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initiativeName?: string
  initiativeData?: ReportData
}

// Streaming text component - types word by word
function StreamingText({ 
  text, 
  speed = 30,
  onComplete,
  className 
}: { 
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const words = text.split(" ")
  const currentWordIndex = useRef(0)

  useEffect(() => {
    setDisplayedText("")
    setIsComplete(false)
    currentWordIndex.current = 0

    const interval = setInterval(() => {
      if (currentWordIndex.current < words.length) {
        setDisplayedText(prev => {
          const newText = prev + (prev ? " " : "") + words[currentWordIndex.current]
          currentWordIndex.current++
          return newText
        })
      } else {
        setIsComplete(true)
        onComplete?.()
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-gray-400 animate-pulse" />
      )}
    </span>
  )
}

// Document section being generated
interface DocumentSection {
  id: string
  title: string
  content: string[]
  icon: typeof Shield
}

export function GenerateReportModal({ 
  open, 
  onOpenChange, 
  initiativeName = "Implementación DORA",
  initiativeData
}: GenerateReportModalProps) {
  const defaultData: ReportData = {
    initiative: {
      name: initiativeName,
      businessUnit: "IT Security",
      project: "Compliance 2024",
      score: 72,
      status: "warning",
    },
    controls: { total: 6, compliant: 3, partial: 2, nonCompliant: 1 },
    risks: { total: 3, open: 2, critical: 1 },
    actions: { total: 4, pending: 2, inProgress: 1, completed: 1 },
    evidence: { total: 5, files: 3, links: 2 },
  }
  
  const data = initiativeData || defaultData

  const [phase, setPhase] = useState<"configure" | "generating" | "complete">("configure")
  const [selectedSections, setSelectedSections] = useState<string[]>(
    REPORT_SECTIONS.map(s => s.id)
  )
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [generationStartTime, setGenerationStartTime] = useState<number>(0)
  const [generationTime, setGenerationTime] = useState<number>(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate document content based on data
  const documentSections: DocumentSection[] = useMemo(() => {
    const statusLabel = data.initiative.status === "ok" ? "OK" : 
                       data.initiative.status === "warning" ? "Warning" : "Critical"
    
    return [
      {
        id: "summary",
        title: "1. Resumen Ejecutivo",
        icon: FileText,
        content: [
          `Este reporte presenta el análisis de cumplimiento de la iniciativa "${data.initiative.name}" perteneciente a la unidad de negocio ${data.initiative.businessUnit}, dentro del proyecto ${data.initiative.project}.`,
          `El score global de cumplimiento actual es del ${data.initiative.score}%, lo cual clasifica el estado general como "${statusLabel}". Este valor se ha calculado en base a la evaluación de ${data.controls.total} controles de seguridad y cumplimiento normativo.`,
          `Durante el período de evaluación, se han identificado ${data.risks.total} riesgos, de los cuales ${data.risks.open} permanecen abiertos y ${data.risks.critical} han sido clasificados como críticos, requiriendo atención prioritaria por parte del equipo responsable.`,
          `Se recomienda revisar las ${data.actions.pending} acciones pendientes y dar seguimiento a las ${data.actions.inProgress} acciones actualmente en progreso para mejorar la postura de cumplimiento.`
        ]
      },
      {
        id: "controls",
        title: "2. Estado de Controles",
        icon: Shield,
        content: [
          `Se han evaluado un total de ${data.controls.total} controles de seguridad y cumplimiento normativo. A continuación se presenta el desglose por estado:`,
          `• Controles Compliant: ${data.controls.compliant} (${Math.round(data.controls.compliant/data.controls.total*100)}%) - Estos controles cumplen completamente con los requisitos establecidos y no requieren acciones adicionales.`,
          `• Controles Parciales: ${data.controls.partial} (${Math.round(data.controls.partial/data.controls.total*100)}%) - Estos controles presentan cumplimiento parcial y requieren mejoras para alcanzar el nivel óptimo.`,
          `• Controles No Compliant: ${data.controls.nonCompliant} (${Math.round(data.controls.nonCompliant/data.controls.total*100)}%) - Estos controles no cumplen con los requisitos y necesitan remediación inmediata.`,
          `El objetivo para el próximo período es alcanzar un nivel de cumplimiento del 85% o superior, lo cual requiere remediar los ${data.controls.nonCompliant + data.controls.partial} controles que actualmente no están en estado compliant.`
        ]
      },
      {
        id: "risks",
        title: "3. Análisis de Riesgos",
        icon: AlertTriangle,
        content: [
          `El análisis de riesgos ha identificado ${data.risks.total} riesgos asociados a esta iniciativa. La distribución actual es la siguiente:`,
          `• Riesgos Abiertos: ${data.risks.open} - Requieren seguimiento activo y plan de mitigación definido.`,
          `• Riesgos Críticos: ${data.risks.critical} - De alta prioridad, requieren atención inmediata del equipo de gestión.`,
          `• Riesgos Cerrados: ${data.risks.total - data.risks.open} - Han sido mitigados o aceptados formalmente.`,
          `Se recomienda realizar una revisión mensual de la matriz de riesgos y actualizar los planes de tratamiento según corresponda. Los riesgos críticos deben escalarse al comité de dirección para su conocimiento y aprobación de recursos adicionales si fuera necesario.`
        ]
      },
      {
        id: "actions",
        title: "4. Acciones Pendientes",
        icon: Activity,
        content: [
          `El seguimiento de acciones correctivas y preventivas muestra el siguiente estado:`,
          `• Total de Acciones: ${data.actions.total} acciones han sido identificadas para mejorar el nivel de cumplimiento.`,
          `• Acciones Pendientes: ${data.actions.pending} - Aún no iniciadas, requieren asignación de recursos y fechas de inicio.`,
          `• Acciones En Progreso: ${data.actions.inProgress} - Actualmente en ejecución, con seguimiento activo.`,
          `• Acciones Completadas: ${data.actions.completed} - Finalizadas y verificadas correctamente.`,
          `Se establece como objetivo completar el ${Math.round((data.actions.completed + data.actions.inProgress + data.actions.pending/2) / data.actions.total * 100)}% de las acciones antes del próximo ciclo de auditoría.`
        ]
      },
      {
        id: "evidence",
        title: "5. Evidencias Documentales",
        icon: Paperclip,
        content: [
          `La documentación de soporte incluye ${data.evidence.total} evidencias que respaldan el estado de cumplimiento reportado:`,
          `• Archivos Adjuntos: ${data.evidence.files} documentos han sido cargados al sistema, incluyendo políticas, procedimientos, informes de auditoría y capturas de pantalla.`,
          `• Enlaces Externos: ${data.evidence.links} referencias a sistemas externos, dashboards de monitoreo y repositorios de documentación.`,
          `Todas las evidencias han sido verificadas y se encuentran actualizadas según los requisitos del marco normativo aplicable. Se recomienda mantener un proceso de revisión trimestral para garantizar la vigencia de la documentación.`
        ]
      },
      {
        id: "recommendations",
        title: "6. Recomendaciones",
        icon: Target,
        content: [
          `Basándose en el análisis realizado, se proponen las siguientes recomendaciones para mejorar la postura de cumplimiento:`,
          `1. Priorizar la remediación de los ${data.controls.nonCompliant} controles no compliant, asignando recursos dedicados y estableciendo fechas límite claras.`,
          `2. Implementar un proceso de monitoreo continuo para los ${data.risks.critical} riesgos críticos identificados, con alertas automáticas y escalamiento definido.`,
          `3. Acelerar la ejecución de las ${data.actions.pending} acciones pendientes, priorizando aquellas con mayor impacto en el score de cumplimiento.`,
          `4. Establecer reuniones quincenales de seguimiento con los responsables de cada área para revisar avances y resolver bloqueos.`,
          `5. Planificar una auditoría interna de seguimiento en 30 días para verificar el progreso de las mejoras implementadas.`
        ]
      }
    ].filter(section => selectedSections.includes(section.id))
  }, [data, selectedSections])

  const currentSection = documentSections[currentSectionIndex]
  const totalParagraphs = documentSections.reduce((acc, s) => acc + s.content.length, 0)
  const completedParagraphs = documentSections
    .slice(0, currentSectionIndex)
    .reduce((acc, s) => acc + s.content.length, 0) + currentParagraphIndex
  const progress = Math.round((completedParagraphs / totalParagraphs) * 100)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPhase("configure")
      setCurrentSectionIndex(0)
      setCurrentParagraphIndex(0)
      setCompletedSections([])
      setGenerationTime(0)
    }
  }, [open])

  // Auto-scroll during generation
  useEffect(() => {
    if (phase === "generating" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentParagraphIndex, currentSectionIndex, phase])

  // Track generation time
  useEffect(() => {
    if (phase === "generating") {
      const interval = setInterval(() => {
        setGenerationTime(Date.now() - generationStartTime)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [phase, generationStartTime])

  const handleParagraphComplete = () => {
    if (currentParagraphIndex < currentSection.content.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1)
    } else {
      // Section complete
      setCompletedSections(prev => [...prev, currentSection.id])
      if (currentSectionIndex < documentSections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1)
        setCurrentParagraphIndex(0)
      } else {
        // All sections complete
        setPhase("complete")
      }
    }
  }

  const startGeneration = () => {
    setPhase("generating")
    setGenerationStartTime(Date.now())
  }

  const toggleSection = (sectionId: string) => {
    const section = REPORT_SECTIONS.find(s => s.id === sectionId)
    if (section?.required) return
    
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleDownload = () => {
    onOpenChange(false)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const tenths = Math.floor((ms % 1000) / 100)
    return `${seconds}.${tenths}s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        <AnimatePresence mode="wait">
          {phase === "configure" && (
            <motion.div
              key="configure"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-900">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Generar reporte de compliance
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Selecciona las secciones a incluir en el documento
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Initiative Info */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Iniciativa
                      </p>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {data.initiative.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {data.initiative.businessUnit} · {data.initiative.project}
                      </p>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold",
                      data.initiative.status === "ok" && "bg-emerald-100 text-emerald-700",
                      data.initiative.status === "warning" && "bg-amber-100 text-amber-700",
                      data.initiative.status === "critical" && "bg-red-100 text-red-700"
                    )}>
                      {data.initiative.score}%
                    </div>
                  </div>
                </div>

                {/* Sections Selection */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings2 className="h-3.5 w-3.5 text-gray-400" />
                    Secciones del reporte
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {REPORT_SECTIONS.map((section) => {
                      const isSelected = selectedSections.includes(section.id)
                      return (
                        <button
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          disabled={section.required}
                          className={cn(
                            "flex items-start gap-2.5 p-3 rounded-lg text-left transition-all",
                            isSelected
                              ? "bg-gray-100 border border-gray-300"
                              : "bg-white border border-gray-200 hover:border-gray-300",
                            section.required && "opacity-75"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            isSelected ? "bg-gray-900" : "bg-gray-100 border border-gray-300"
                          )}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              "text-xs font-medium block",
                              isSelected ? "text-gray-900" : "text-gray-700"
                            )}>
                              {section.label}
                              {section.required && (
                                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                  Requerido
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">
                              {section.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {selectedSections.length} secciones seleccionadas
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 px-4 text-sm">
                    Cancelar
                  </Button>
                  <Button onClick={startGeneration} className="h-9 px-5 text-sm bg-gray-900 hover:bg-gray-800 text-white gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generar con IA
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[80vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="p-2 rounded-lg bg-gray-900">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        Generando reporte
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-gray-400"
                        >
                          ...
                        </motion.span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        {currentSection?.title} · {formatTime(generationTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Preview - Live Generation */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-white"
              >
                {/* PDF-like document */}
                <div className="max-w-3xl mx-auto my-6">
                  {/* Document */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Document Header */}
                    <div className="bg-gray-900 text-white p-6">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                        Reporte de Compliance
                      </p>
                      <h1 className="text-xl font-semibold">{data.initiative.name}</h1>
                      <p className="text-sm text-gray-400 mt-1">
                        {data.initiative.businessUnit} · {data.initiative.project}
                      </p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700">
                        <div>
                          <p className="text-2xl font-bold">{data.initiative.score}%</p>
                          <p className="text-[10px] text-gray-400 uppercase">Score Global</p>
                        </div>
                        <div className="h-8 w-px bg-gray-700" />
                        <div>
                          <p className="text-lg font-semibold">{data.controls.total}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Controles</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{data.risks.total}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Riesgos</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{data.actions.total}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Acciones</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="p-6 space-y-6">
                      {documentSections.map((section, sIndex) => {
                        const isCurrentSection = sIndex === currentSectionIndex
                        const isFutureSection = sIndex > currentSectionIndex
                        const isPastSection = sIndex < currentSectionIndex
                        const Icon = section.icon

                        if (isFutureSection) return null

                        return (
                          <motion.div 
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            {/* Section Title */}
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                              <div className="p-1.5 rounded-md bg-gray-100">
                                <Icon className="h-4 w-4 text-gray-600" />
                              </div>
                              <h2 className="text-sm font-semibold text-gray-900">
                                {section.title}
                              </h2>
                              {isPastSection && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                              )}
                              {isCurrentSection && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  className="ml-auto"
                                >
                                  <Loader2 className="h-4 w-4 text-gray-400" />
                                </motion.div>
                              )}
                            </div>

                            {/* Section Content */}
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed pl-1">
                              {section.content.map((paragraph, pIndex) => {
                                const isPastParagraph = isPastSection || (isCurrentSection && pIndex < currentParagraphIndex)
                                const isCurrentParagraph = isCurrentSection && pIndex === currentParagraphIndex
                                const isFutureParagraph = isCurrentSection && pIndex > currentParagraphIndex

                                if (isFutureParagraph) return null

                                return (
                                  <motion.p 
                                    key={pIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[13px]"
                                  >
                                    {isPastParagraph ? (
                                      paragraph
                                    ) : isCurrentParagraph ? (
                                      <StreamingText 
                                        text={paragraph} 
                                        speed={25}
                                        onComplete={handleParagraphComplete}
                                      />
                                    ) : null}
                                  </motion.p>
                                )
                              })}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Document Footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</span>
                      <span>Página 1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                    />
                    Sección {currentSectionIndex + 1} de {documentSections.length}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col"
            >
              {/* Success Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      ¡Reporte generado!
                    </h2>
                    <p className="text-sm text-gray-500">
                      Documento listo para descargar · {formatTime(generationTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Report Info */}
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="p-2.5 rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      Reporte_{data.initiative.name.replace(/\s+/g, "_")}_{format(new Date(), "yyyyMMdd")}.pdf
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      PDF · {selectedSections.length} secciones · ~{Math.max(selectedSections.length * 3, 10)} páginas
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(), "d MMM yyyy, HH:mm", { locale: es })}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Usuario actual
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generated Sections Summary */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-3">Contenido generado</h4>
                  <div className="space-y-2">
                    {documentSections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-gray-700">{section.title}</span>
                        <span className="text-gray-400 ml-auto">{section.content.length} párrafos</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Opciones de exportación
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                        <FileDown className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">PDF</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Excel</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Printer className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Additional actions */}
                <div className="flex items-center gap-1 text-xs">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    Enviar por email
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                    Copiar enlace
                  </button>
                  <button 
                    onClick={() => {
                      setPhase("configure")
                      setCompletedSections([])
                      setCurrentSectionIndex(0)
                      setCurrentParagraphIndex(0)
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerar
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Generado con IA en {formatTime(generationTime)}
                </p>
                <Button onClick={handleDownload} className="h-9 px-5 text-sm bg-gray-900 hover:bg-gray-800 text-white gap-2">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
