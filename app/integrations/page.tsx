"use client"

import * as React from "react"
import {
  ResizableAppShell,
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plug,
  ShieldCheck,
  Settings,
  RefreshCw,
  Database,
  Building2,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Activity,
  Zap,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type IntegrationCategory = "ERP" | "CRM" | "Productivity"
type IntegrationStatus = "connected" | "available" | "coming-soon"

interface Integration {
  id: string
  name: string
  provider: string
  description: string
  category: IntegrationCategory
  status: IntegrationStatus
  dataSync: string
  lastSync?: string
  features: string[]
  requires?: string[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: "sap",
    name: "SAP S/4HANA",
    provider: "SAP",
    description: "Sincroniza órdenes de compra, inventario y estados financieros desde SAP.",
    category: "ERP",
    status: "connected",
    dataSync: "Cada 30 min",
    lastSync: "Hace 12 min",
    features: ["Órdenes", "Inventario", "Centros de coste"],
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    provider: "Oracle",
    description: "Conecta NetSuite para traer pipelines de ventas y contabilidad.",
    category: "ERP",
    status: "available",
    dataSync: "Manual",
    features: ["Ventas", "Contabilidad", "Cobros"],
    requires: ["Cuenta admin", "Token SuiteAnalytics"],
  },
  {
    id: "microsoft-dynamics",
    name: "Microsoft Dynamics 365",
    provider: "Microsoft",
    description: "Sincroniza Dynamics 365 para visibilidad de ventas, service y finanzas.",
    category: "ERP",
    status: "coming-soon",
    dataSync: "Programado Q1 2026",
    features: ["Sales", "Finance", "Field Service"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    provider: "Salesforce",
    description: "Importa cuentas, oportunidades y health de clientes desde Salesforce.",
    category: "CRM",
    status: "connected",
    dataSync: "Streaming",
    lastSync: "Tiempo real",
    features: ["Accounts", "Opportunities", "CSAT"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    provider: "HubSpot",
    description: "Conecta HubSpot para captar marketing qualified leads y tickets.",
    category: "CRM",
    status: "available",
    dataSync: "Cada hora",
    features: ["Leads", "Tickets", "Playbooks"],
    requires: ["Scope CRM + Tickets"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    provider: "Zendesk",
    description: "Sincroniza tickets y SLAs para detectar cuellos de botella operativos.",
    category: "Productivity",
    status: "connected",
    dataSync: "Cada 10 min",
    lastSync: "Hace 4 min",
    features: ["Tickets", "SLA", "Macros"],
  },
]

const METRICS = [
  { label: "Integraciones activas", value: 3, icon: Plug, sub: "+1 en la última semana" },
  { label: "Conectores disponibles", value: 6, icon: Link2, sub: "ERP, CRM y soporte" },
  { label: "Automatizaciones activas", value: 42, icon: Zap, sub: "sourcing · reporting" },
]

const categoryLabels: Record<IntegrationCategory, string> = {
  ERP: "ERPs",
  CRM: "CRMs",
  Productivity: "Soporte & Ops",
}

const statusStyles: Record<IntegrationStatus, { label: string; className: string }> = {
  connected: { label: "Conectado", className: "bg-green-50 text-green-700 border-green-200" },
  available: { label: "Disponible", className: "bg-blue-50 text-blue-700 border-blue-200" },
  "coming-soon": { label: "Próximamente", className: "bg-gray-50 text-gray-600 border-gray-200" },
}

const iconMap: Record<IntegrationCategory, React.ReactNode> = {
  ERP: <Building2 className="h-4 w-4 text-gray-500" />,
  CRM: <Plug className="h-4 w-4 text-gray-500" />,
  Productivity: <Database className="h-4 w-4 text-gray-500" />,
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = React.useState<"all" | "connected" | "available" | "coming-soon">("all")

  const filteredIntegrations = INTEGRATIONS.filter((integration) =>
    activeTab === "all" ? true : integration.status === activeTab,
  )

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Discovery</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Integrations</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plug className="h-4 w-4" />
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
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {METRICS.map((metric, idx) => {
                  const Icon = metric.icon
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg bg-white p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs text-gray-500">{metric.label}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900">
                          {metric.value}
                        </div>
                        <Icon className="h-5 w-5 opacity-40 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{metric.sub}</div>
                    </div>
                  )
                })}
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <ScrollArea>
                  <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
                    {["all", "connected", "available", "coming-soon"].map((value) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary text-xs px-3"
                      >
                        {value === "all" && "Todas"}
                        {value === "connected" && "Conectadas"}
                        {value === "available" && "Disponibles"}
                        {value === "coming-soon" && "Próximamente"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
            </div>
          </div>

          <div style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            {filteredIntegrations.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Plug className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No hay integraciones disponibles</p>
                <p className="text-xs text-gray-400 mt-1">Filtra por otra categoría o estado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(["ERP", "CRM", "Productivity"] as IntegrationCategory[]).map((category) => {
                  const categoryIntegrations = filteredIntegrations.filter((integration) => integration.category === category)
                  if (categoryIntegrations.length === 0) return null

                  return (
                    <section key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                            {iconMap[category]}
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold text-gray-900">{categoryLabels[category]}</h2>
                            <p className="text-xs text-gray-500">{categoryIntegrations.length} conectores disponibles</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          Ver documentación
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {categoryIntegrations.map((integration) => (
                        <div key={integration.id} className="border border-gray-200 rounded-lg bg-white p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold shrink-0">
                                {integration.provider.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{integration.name}</h3>
                                <p className="text-xs text-gray-500 truncate">{integration.provider}</p>
                              </div>
                            </div>
                            <div className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border shrink-0",
                              statusStyles[integration.status].className
                            )}>
                              {statusStyles[integration.status].label}
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 leading-relaxed">{integration.description}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {integration.features.map((feature) => (
                              <span key={feature} className="px-1.5 py-0.5 rounded text-xs text-gray-600 border border-dashed border-gray-300 bg-gray-50">
                                {feature}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                              <span>{integration.dataSync}</span>
                            </div>
                            {integration.lastSync && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{integration.lastSync}</span>
                              </div>
                            )}
                          </div>

                          {integration.requires && integration.requires.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-gray-500 pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-medium text-gray-600">Requisitos:</span>{" "}
                                <span className="text-gray-500">{integration.requires.join(" · ")}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Settings className="h-3.5 w-3.5 text-gray-400" />
                              <span>Configurable</span>
                            </div>
                            {integration.status === "connected" ? (
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                Gestionar
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            ) : integration.status === "available" ? (
                              <Button size="sm" className="h-7 text-xs gap-1">
                                Conectar
                                <Plug className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-gray-500" disabled>
                                En roadmap
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
              </div>
            )}
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

