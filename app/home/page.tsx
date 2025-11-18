"use client"

import * as React from "react"
import {
  ResizableAppShell,
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  Activity,
  Inbox,
  Target,
  Users,
  Map,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Plug,
  Shield,
  RefreshCw,
} from "lucide-react"

const OVERVIEW_METRICS = [
  { label: "Issues activos", value: 24, delta: "+4 hoy", icon: Inbox },
  { label: "Iniciativas activas", value: 8, delta: "3 con bloqueos", icon: Target },
  { label: "Insights nuevos", value: 12, delta: "+30% semana", icon: Sparkles },
  { label: "Automatizaciones en deploy", value: 5, delta: "2 pendientes QA", icon: BarChart3 },
]

const TRIAGE_ITEMS = [
  { id: "SAI-244", title: "Desfase de precios en catálogo EMEA", priority: "Alta", owner: "Pricing", status: "En revisión", eta: "Hoy" },
  { id: "SAI-237", title: "Automatizar reporte financiero semanal", priority: "Media", owner: "Finance", status: "En progreso", eta: "Mañana" },
  { id: "SAI-229", title: "Onboarding de brokers LATAM", priority: "Baja", owner: "Ops", status: "Backlog", eta: "Pendiente" },
]

const WORKSPACE_SUMMARY = [
  { label: "Business Units", value: 6, sub: "3 con OKR al día", icon: Map },
  { label: "Proyectos IA activos", value: 11, sub: "5 con impacto medido", icon: Activity },
  { label: "Stakeholders", value: 42, sub: "12 nuevos esta semana", icon: Users },
]

const DISCOVERY_INSIGHTS = [
  {
    id: "ins-01",
    title: "Workflow SAP ↔️ Salesforce",
    description: "Identificado tiempo muerto de 12h/semana sincronizando órdenes.",
    impact: "alto",
    action: "Prototipo de conector Figma",
  },
  {
    id: "ins-02",
    title: "Patrón de tickets Zendesk",
    description: "Retraso de 32% en Tier-2 por falta de contexto financiero.",
    impact: "medio",
    action: "Brief para playbook CS",
  },
]

const DEPLOY_STATUS = [
  { label: "Evaluaciones (Evals)", status: "3 corriendo", detail: "Latency vs. baseline", icon: Shield },
  { label: "DevOps checks", status: "Infra estable", detail: "0 alertas críticas", icon: Plug },
  { label: "Metrics", status: "+18% throughput", detail: "Últimas 24h", icon: BarChart3 },
]

export default function HomePage() {
  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: "28px", paddingRight: "20px" }}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Home</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          <div
            className="border-b border-stroke bg-gray-50/30"
            style={{ paddingLeft: "28px", paddingRight: "20px", paddingTop: "var(--header-padding-y)", paddingBottom: "var(--header-padding-y)" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OVERVIEW_METRICS.map((metric, idx) => {
                const Icon = metric.icon
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{metric.label}</span>
                      <Icon className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                      <span className="text-[11px] text-gray-500">{metric.delta}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ paddingLeft: "28px", paddingRight: "20px", paddingTop: "24px", paddingBottom: "24px" }} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-4">
                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Triage</p>
                      <h2 className="text-sm font-semibold text-gray-900">Próximos focos</h2>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                      Abrir triage
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {TRIAGE_ITEMS.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="outline" className="text-[11px]">
                              {item.id}
                            </Badge>
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          </div>
                          <span className="text-[11px] text-gray-500">{item.eta}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.priority}</span>
                          <span>{item.owner}</span>
                          <span className="text-gray-300">·</span>
                          <span>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Workspace</p>
                      <h2 className="text-sm font-semibold text-gray-900">Situación general</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                      Ver detalle
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {WORKSPACE_SUMMARY.map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div key={idx} className="border border-gray-100 rounded-lg p-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{item.label}</span>
                          </div>
                          <div className="text-xl font-semibold text-gray-900">{item.value}</div>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Discovery</p>
                      <h2 className="text-sm font-semibold text-gray-900">Insights recientes</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                      Abrir insights
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {DISCOVERY_INSIGHTS.map((insight) => (
                      <div key={insight.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] capitalize">
                            {insight.impact}
                          </Badge>
                          <h3 className="text-xs font-semibold text-gray-900 truncate">{insight.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{insight.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <Sparkles className="h-3 w-3 text-gray-400" />
                          <span>{insight.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Deploy</p>
                      <h2 className="text-sm font-semibold text-gray-900">Estado de despliegues</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                      Ver deploy
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {DEPLOY_STATUS.map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">{item.label}</p>
                              <p className="text-[11px] text-gray-500">{item.detail}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-400">{item.status}</span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

