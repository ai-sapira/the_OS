"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format, subMonths } from "date-fns"
import { motion } from "framer-motion"
import {
  CreditCard,
  Download,
  Settings2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Cloud,
  X,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import { IssuesAPI, IssueWithRelations } from "@/lib/api/issues"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Types
type CostTrend = "up" | "down" | "stable"
type ChartGroupBy = "business_unit" | "project"

interface BillingInitiative {
  id: string
  businessUnit: string
  project: string
  projectSlug: string
  initiative: string  // The issue title
  initiativeId: string
  owner: string
  currentMonthCost: number
  avgCost3Months: number
  variation: number
  trend: CostTrend
  provider: string
}

interface MonthlyData {
  month: string
  total: number
  [key: string]: number | string
}

// Cloud providers
const PROVIDERS = ["AWS", "Azure", "Google Cloud", "OpenAI", "Anthropic", "Vercel"]

// Seeded random for consistent costs per issue
const seededRandom = (seed: string, min: number, max: number) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const normalized = Math.abs(hash % 1000) / 1000
  return Math.floor(min + normalized * (max - min))
}

// Transform issues to billing data
const issuesToBilling = (issues: IssueWithRelations[]): BillingInitiative[] => {
  return issues.map((issue, index) => {
    const currentMonthCost = seededRandom(issue.id + 'current', 2000, 18000)
    const avgCost3Months = seededRandom(issue.id + 'avg', 1500, 15000)
    const variation = ((currentMonthCost - avgCost3Months) / avgCost3Months) * 100
    
    let trend: CostTrend = "stable"
    if (variation > 5) trend = "up"
    else if (variation < -5) trend = "down"
    
    return {
      id: issue.id,
      businessUnit: issue.initiative?.name || "Sin asignar",
      project: issue.project?.name || "Sin asignar",
      projectSlug: issue.project?.slug || "",
      initiative: issue.title,
      initiativeId: issue.id,
      owner: issue.assignee?.name || issue.reporter?.name || "Sin asignar",
      currentMonthCost,
      avgCost3Months,
      variation,
      trend,
      provider: PROVIDERS[index % PROVIDERS.length],
    }
  })
}

// Generate chart data
const generateChartData = (billingData: BillingInitiative[], groupBy: ChartGroupBy): MonthlyData[] => {
  const groups = groupBy === "business_unit" 
    ? [...new Set(billingData.map(b => b.businessUnit))]
    : [...new Set(billingData.map(b => b.project))]
  
  return Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const data: MonthlyData = {
      month: format(date, "MMM"),
      total: 0,
    }
    
    groups.forEach(group => {
      const groupItems = billingData.filter(b => 
        groupBy === "business_unit" ? b.businessUnit === group : b.project === group
      )
      const cost = groupItems.reduce((sum, b) => {
        const baseCost = b.avgCost3Months * (0.85 + Math.random() * 0.3)
        return sum + baseCost * (1 + i * 0.03)
      }, 0)
      data[group] = Math.round(cost)
      data.total += Math.round(cost)
    })
    
    return data
  })
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Trend indicator
const TrendIndicator = ({ trend, variation }: { trend: CostTrend; variation: number }) => {
  const config = {
    up: { icon: ArrowUpRight, className: "text-red-600 bg-red-50 border-red-100" },
    down: { icon: ArrowDownRight, className: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    stable: { icon: Minus, className: "text-gray-600 bg-gray-50 border-gray-100" },
  }
  const { icon: Icon, className } = config[trend]
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border",
      className
    )}>
      <Icon className="h-3 w-3" />
      {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
    </span>
  )
}

// Provider styles
const getProviderStyles = (provider: string) => {
  const colors: Record<string, string> = {
    "OpenAI": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Anthropic": "bg-orange-50 text-orange-700 border-orange-100",
    "AWS": "bg-amber-50 text-amber-700 border-amber-100",
    "Azure": "bg-blue-50 text-blue-700 border-blue-100",
    "Google Cloud": "bg-red-50 text-red-700 border-red-100",
    "Vercel": "bg-gray-50 text-gray-700 border-gray-100",
  }
  return colors[provider] || "bg-gray-50 text-gray-700 border-gray-100"
}

// KPI Card
const KPICard = ({ title, value, subtitle, trend }: { 
  title: string
  value: string
  subtitle?: string
  trend?: { direction: CostTrend; value: number }
}) => (
  <div className="border border-gray-200 rounded-lg bg-white p-4">
    <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
    <div className="flex items-end gap-3">
      <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
      {trend && <TrendIndicator trend={trend.direction} variation={trend.value} />}
    </div>
    {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
  </div>
)

// Chart colors
const CHART_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F97316", "#EAB308", "#22C55E"]

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="text-xs font-medium text-gray-900">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty state
const EmptyState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
      <CreditCard className="h-6 w-6 text-gray-400" />
    </div>
    <h3 className="text-sm font-medium text-gray-900 mb-1">No hay initiatives</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
      No hay initiatives activas con los filtros actuales.
    </p>
    <Button variant="outline" size="sm" onClick={onClearFilters} className="h-7 text-xs">
      Limpiar filtros
    </Button>
  </div>
)

// Filter chip
const FilterChip = ({ label, value, onClear }: { label: string; value: string; onClear: () => void }) => (
  <div className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-gray-100 border border-gray-200 rounded-md text-xs">
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium text-gray-700">{value}</span>
    <button onClick={onClear} className="ml-0.5 p-0.5 hover:bg-gray-200 rounded transition-colors">
      <X className="h-3 w-3 text-gray-400" />
    </button>
  </div>
)

export default function BillingPage() {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [billingData, setBillingData] = useState<BillingInitiative[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  
  // Chart
  const [chartGroupBy, setChartGroupBy] = useState<ChartGroupBy>("business_unit")

  // Load issues from current organization
  useEffect(() => {
    const loadIssues = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        setBillingData([])
        return
      }

      try {
        setLoading(true)
        const issues = await IssuesAPI.getIssues(currentOrg.organization.id)
        const billing = issuesToBilling(issues)
        setBillingData(billing)
      } catch (error) {
        console.error('Error loading billing data:', error)
        setBillingData([])
      } finally {
        setLoading(false)
      }
    }

    loadIssues()
  }, [currentOrg?.organization?.id])

  // Filter options from real data
  const filterOptions = useMemo(() => ({
    businessUnits: [...new Set(billingData.map(b => b.businessUnit))].filter(Boolean),
    projects: [...new Set(billingData.map(b => b.project))].filter(Boolean),
    providers: [...new Set(billingData.map(b => b.provider))],
  }), [billingData])

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = [...billingData]
    if (businessUnitFilter !== "all") filtered = filtered.filter(b => b.businessUnit === businessUnitFilter)
    if (projectFilter !== "all") filtered = filtered.filter(b => b.project === projectFilter)
    if (providerFilter !== "all") filtered = filtered.filter(b => b.provider === providerFilter)
    return filtered
  }, [billingData, businessUnitFilter, projectFilter, providerFilter])

  // Calculate totals
  const totals = useMemo(() => {
    const totalCurrentMonth = filteredData.reduce((sum, b) => sum + b.currentMonthCost, 0)
    const totalPrevMonth = filteredData.reduce((sum, b) => sum + b.avgCost3Months, 0)
    const variation = totalPrevMonth > 0 ? ((totalCurrentMonth - totalPrevMonth) / totalPrevMonth) * 100 : 0
    
    return { 
      totalCurrentMonth, 
      variation,
      initiativeCount: filteredData.length,
      trend: (variation > 5 ? "up" : variation < -5 ? "down" : "stable") as CostTrend
    }
  }, [filteredData])

  // Chart data
  const chartData = useMemo(() => generateChartData(filteredData, chartGroupBy), [filteredData, chartGroupBy])
  const chartGroups = useMemo(() => {
    return chartGroupBy === "business_unit"
      ? [...new Set(filteredData.map(b => b.businessUnit))]
      : [...new Set(filteredData.map(b => b.project))]
  }, [filteredData, chartGroupBy])

  const clearFilters = useCallback(() => {
    setBusinessUnitFilter("all")
    setProjectFilter("all")
    setProviderFilter("all")
  }, [])

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string; clear: () => void }[] = []
    if (businessUnitFilter !== "all") filters.push({ key: "bu", label: "BU", value: businessUnitFilter, clear: () => setBusinessUnitFilter("all") })
    if (projectFilter !== "all") filters.push({ key: "project", label: "Proyecto", value: projectFilter, clear: () => setProjectFilter("all") })
    if (providerFilter !== "all") filters.push({ key: "provider", label: "Proveedor", value: providerFilter, clear: () => setProviderFilter("all") })
    return filters
  }, [businessUnitFilter, projectFilter, providerFilter])

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-500">Workspace</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">Billing</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200">
                <Settings2 className="h-3.5 w-3.5" />
                Configurar presupuestos
              </Button>
              <Button size="sm" className="h-7 bg-gray-900 hover:bg-gray-800 text-white gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Exportar
              </Button>
            </div>
          </div>
        }
      >
        <motion.div className="-mx-5 -mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* KPI Cards */}
          <div className="py-5 bg-gray-50/50" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                title="Coste total mes actual"
                value={formatCurrency(totals.totalCurrentMonth)}
                trend={{ direction: totals.trend, value: totals.variation }}
              />
              <KPICard
                title="Variación vs mes anterior"
                value={`${totals.variation > 0 ? "+" : ""}${totals.variation.toFixed(1)}%`}
                subtitle="Comparado con media 3 meses"
              />
              <KPICard
                title="Initiatives en seguimiento"
                value={totals.initiativeCount.toString()}
                subtitle="Con costes activos"
              />
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border-y border-gray-200" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="py-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Evolución de costes</h3>
              <Tabs value={chartGroupBy} onValueChange={(v) => setChartGroupBy(v as ChartGroupBy)}>
                <TabsList className="h-8 p-0.5 bg-gray-100 border border-gray-200">
                  <TabsTrigger value="business_unit" className="h-7 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Por Business Unit
                  </TabsTrigger>
                  <TabsTrigger value="project" className="h-7 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Por Project
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="pb-5">
              {loading ? (
                <div className="flex items-center justify-center h-[280px]"><Spinner size="md" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} dx={-8} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-600 ml-1">{value}</span>} wrapperStyle={{ paddingTop: '16px' }} />
                    {chartGroups.map((group, index) => (
                      <Line key={group} type="monotone" dataKey={group} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2}
                        dot={{ r: 3, fill: '#fff', stroke: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: CHART_COLORS[index % CHART_COLORS.length], stroke: '#fff', strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="py-3 bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                <SelectTrigger className="w-auto min-w-[140px] h-7 text-xs bg-white border-gray-200 gap-2">
                  <span className={businessUnitFilter === "all" ? "text-gray-500" : "text-gray-900"}>
                    {businessUnitFilter === "all" ? "Business Unit" : businessUnitFilter}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las BU</SelectItem>
                  {filterOptions.businessUnits.map(bu => <SelectItem key={bu} value={bu}>{bu}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-auto min-w-[140px] h-7 text-xs bg-white border-gray-200 gap-2">
                  <span className={projectFilter === "all" ? "text-gray-500" : "text-gray-900"}>
                    {projectFilter === "all" ? "Proyecto" : projectFilter}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {filterOptions.projects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-auto min-w-[120px] h-7 text-xs bg-white border-gray-200 gap-2">
                  <span className={providerFilter === "all" ? "text-gray-500" : "text-gray-900"}>
                    {providerFilter === "all" ? "Proveedor" : providerFilter}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filterOptions.providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>

              {activeFilters.length > 0 && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  {activeFilters.map(f => <FilterChip key={f.key} label={f.label} value={f.value} onClear={f.clear} />)}
                  <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 ml-1">Limpiar todo</button>
                </>
              )}
            </div>
          </div>

          {/* Column Names */}
          <div className="py-2.5 border-y border-gray-200 bg-gray-50" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-[100px_120px_1fr_100px_100px_90px_100px_40px] gap-3">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Business Unit</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Project</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Initiative</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Coste mes</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Media 3m</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Variación</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Proveedor</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider"></div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Spinner size="md" /></div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group py-3.5 hover:bg-gray-50/70 transition-all cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => router.push(`/billing/${item.id}`)}
                  whileHover={{ x: 2 }}
                >
                  <div className="grid grid-cols-[100px_120px_1fr_100px_100px_90px_100px_40px] gap-3 items-center">
                    <div className="text-sm text-gray-600 truncate">{item.businessUnit}</div>
                    <div className="text-sm text-gray-600 truncate">{item.project}</div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors truncate">{item.initiative}</div>
                    <div className="text-sm font-semibold text-gray-900 text-right tabular-nums">{formatCurrency(item.currentMonthCost)}</div>
                    <div className="text-sm text-gray-600 text-right tabular-nums">{formatCurrency(item.avgCost3Months)}</div>
                    <div className="flex justify-center"><TrendIndicator trend={item.trend} variation={item.variation} /></div>
                    <div className="flex items-center">
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border", getProviderStyles(item.provider))}>
                        <Cloud className="h-2.5 w-2.5" />
                        {item.provider}
                      </span>
                    </div>
                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/billing/${item.id}`)} className="h-6 w-6 p-0 hover:bg-gray-200 rounded-md">
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState onClearFilters={clearFilters} />
            )}
          </div>
        </motion.div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
