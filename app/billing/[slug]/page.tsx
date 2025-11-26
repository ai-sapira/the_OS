"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { format, subMonths } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ChevronRight,
  Cloud,
  Server,
  Database,
  Cpu,
  Globe,
  Zap,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import { IssuesAPI, IssueWithRelations } from "@/lib/api/issues"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"

// Types
type CostTrend = "up" | "down" | "stable"
type CostView = "total" | "per_user" | "per_event"
type ForecastScenario = "base" | "high" | "low"

interface CostBreakdown {
  id: string
  category: string
  icon: React.ComponentType<any>
  currentMonth: number
  avg3Months: number
  percentage: number
  trend: CostTrend
}

interface MonthlyCost {
  month: string
  total: number
  perUser: number
  perEvent: number
}

interface BillingDetail {
  id: string
  slug: string
  name: string
  businessUnit: string
  project: string
  provider: string
  environment: string
  currentMonthCost: number
  avgCost3Months: number
  variation: number
  trend: CostTrend
  budget?: number
  isOverBudget: boolean
  breakdown: CostBreakdown[]
  historicalCosts: MonthlyCost[]
  activeUsers: number
  eventsPerUser: number
}

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

// Cloud providers
const PROVIDERS = ["AWS", "Azure", "Google Cloud", "OpenAI", "Anthropic", "Vercel"]

// Generate billing detail from issue data
const generateBillingDetailFromIssue = (issue: IssueWithRelations): BillingDetail => {
  // Use issue ID as seed for consistent random values
  const seed = issue.id
  
  // Generate consistent costs based on issue ID
  const computeCost = seededRandom(seed + 'compute', 2000, 6000)
  const storageCost = seededRandom(seed + 'storage', 1000, 3000)
  const networkCost = seededRandom(seed + 'network', 800, 2500)
  const modelCost = seededRandom(seed + 'model', 2000, 5000)
  const otherCost = seededRandom(seed + 'other', 300, 1000)
  
  const currentMonth = computeCost + storageCost + networkCost + modelCost + otherCost
  const totalBase = currentMonth
  
  const breakdown: CostBreakdown[] = [
    { id: "compute", category: "Compute", icon: Cpu, currentMonth: computeCost, avg3Months: Math.round(computeCost * 0.95), percentage: Math.round((computeCost / totalBase) * 100), trend: seededRandom(seed + 'ct', 0, 3) === 0 ? "down" : seededRandom(seed + 'ct', 0, 3) === 1 ? "stable" : "up" },
    { id: "storage", category: "Storage", icon: Database, currentMonth: storageCost, avg3Months: Math.round(storageCost * 0.92), percentage: Math.round((storageCost / totalBase) * 100), trend: seededRandom(seed + 'st', 0, 3) === 0 ? "down" : seededRandom(seed + 'st', 0, 3) === 1 ? "stable" : "up" },
    { id: "network", category: "Network", icon: Globe, currentMonth: networkCost, avg3Months: Math.round(networkCost * 0.98), percentage: Math.round((networkCost / totalBase) * 100), trend: "stable" },
    { id: "model", category: "Model/API", icon: Zap, currentMonth: modelCost, avg3Months: Math.round(modelCost * 0.9), percentage: Math.round((modelCost / totalBase) * 100), trend: "up" },
    { id: "other", category: "Otros", icon: Server, currentMonth: otherCost, avg3Months: Math.round(otherCost * 1.05), percentage: Math.round((otherCost / totalBase) * 100), trend: "down" },
  ]

  const historicalCosts: MonthlyCost[] = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i)
    const variation = seededRandom(seed + `month${i}`, -15, 15) / 100
    const baseCost = currentMonth * (0.7 + (i * 0.025)) * (1 + variation)
    const users = seededRandom(seed + 'users', 100, 300) + Math.floor(i * 8)
    const events = seededRandom(seed + 'events', 30000, 80000) + Math.floor(i * 4000)
    return {
      month: format(date, "MMM yy"),
      total: Math.round(baseCost),
      perUser: Math.round((baseCost) / users * 100) / 100,
      perEvent: Math.round((baseCost) / events * 1000) / 1000,
    }
  })

  const avg3Months = breakdown.reduce((sum, b) => sum + b.avg3Months, 0)
  const variation = ((currentMonth - avg3Months) / avg3Months) * 100
  const budget = seededRandom(seed + 'budget', 10000, 20000)
  const providerIndex = seededRandom(seed + 'provider', 0, PROVIDERS.length)

  return {
    id: issue.id,
    slug: issue.id,
    name: issue.title,
    businessUnit: issue.initiative?.name || "Sin asignar",
    project: issue.project?.name || "Sin asignar",
    provider: PROVIDERS[providerIndex],
    environment: seededRandom(seed + 'env', 0, 2) === 0 ? "PROD" : "DEV",
    currentMonthCost: currentMonth,
    avgCost3Months: avg3Months,
    variation,
    trend: variation > 5 ? "up" : variation < -5 ? "down" : "stable",
    budget,
    isOverBudget: currentMonth > budget,
    breakdown,
    historicalCosts,
    activeUsers: seededRandom(seed + 'activeUsers', 100, 400),
    eventsPerUser: seededRandom(seed + 'eventsPerUser', 100, 300),
  }
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
const TrendIndicator = ({ trend, variation, size = "md" }: { trend: CostTrend; variation: number; size?: "sm" | "md" }) => {
  const config = {
    up: { icon: ArrowUpRight, className: "text-red-600 bg-red-50 border-red-100" },
    down: { icon: ArrowDownRight, className: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    stable: { icon: Minus, className: "text-gray-600 bg-gray-50 border-gray-100" },
  }
  const { icon: Icon, className } = config[trend]
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
  
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold rounded-md border", sizeClass, className)}>
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
    </span>
  )
}

// Micro Trend Arrow (for breakdown table)
const MicroTrend = ({ trend }: { trend: CostTrend }) => {
  const config = {
    up: { icon: ArrowUpRight, className: "text-red-500" },
    down: { icon: ArrowDownRight, className: "text-emerald-500" },
    stable: { icon: Minus, className: "text-gray-400" },
  }
  const { icon: Icon, className } = config[trend]
  return <Icon className={cn("h-3 w-3", className)} />
}

// KPI Card - Clean styling
const KPICard = ({ 
  title, 
  value, 
  subtitle,
  trend,
  highlight,
}: { 
  title: string
  value: string
  subtitle?: string
  trend?: { direction: CostTrend; value: number }
  highlight?: "success" | "warning" | "danger"
}) => {
  const highlightClasses = {
    success: "from-emerald-50/50 border-emerald-200/60",
    warning: "from-amber-50/50 border-amber-200/60",
    danger: "from-red-50/50 border-red-200/60",
  }
  
  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  }
  
  return (
    <motion.div 
      className={cn(
        "border rounded-lg bg-gradient-to-br to-white p-4 transition-all relative overflow-hidden",
        highlight ? highlightClasses[highlight] : "from-gray-50/50 border-gray-200"
      )}
      whileHover={{ y: -1 }}
    >
      {/* Accent dot */}
      {highlight && (
        <div className={cn(
          "absolute top-3 right-3 w-1.5 h-1.5 rounded-full",
          dotColors[highlight]
        )} />
      )}
      
      <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        {trend && <TrendIndicator trend={trend.direction} variation={trend.value} size="sm" />}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
    </motion.div>
  )
}

// Provider Badge
const ProviderBadge = ({ provider }: { provider: string }) => {
  const colors: Record<string, string> = {
    "OpenAI": "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
    "Anthropic": "bg-orange-50/80 text-orange-700 border-orange-200/60",
    "AWS": "bg-amber-50/80 text-amber-700 border-amber-200/60",
    "Azure": "bg-blue-50/80 text-blue-700 border-blue-200/60",
    "Google Cloud": "bg-red-50/80 text-red-700 border-red-200/60",
    "Vercel": "bg-gray-50/80 text-gray-700 border-gray-200/60",
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
      colors[provider] || colors["Vercel"]
    )}>
      <Cloud className="h-3 w-3" />
      {provider}
    </span>
  )
}

// Budget Status Badge
const BudgetBadge = ({ isOverBudget }: { isOverBudget: boolean }) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
    isOverBudget 
      ? "bg-red-50/80 text-red-700 border-red-200/60" 
      : "bg-emerald-50/80 text-emerald-700 border-emerald-200/60"
  )}>
    <span className={cn(
      "w-1.5 h-1.5 rounded-full",
      isOverBudget ? "bg-red-500" : "bg-emerald-500"
    )} />
    {isOverBudget ? "Over budget" : "On track"}
  </span>
)

// Forecast Panel - Enhanced
function ForecastPanel({ billing }: { billing: BillingDetail }) {
  const [users, setUsers] = useState(billing.activeUsers)
  const [eventsPerUser, setEventsPerUser] = useState(billing.eventsPerUser)
  const [horizon, setHorizon] = useState<"3" | "6" | "12">("12")
  const [scenario, setScenario] = useState<ForecastScenario>("base")

  const scenarioMultipliers = {
    base: 1,
    high: 1.3,
    low: 0.7,
  }

  const scenarioConfig = {
    low: { label: "Bajo", icon: TrendingDown, color: "data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200" },
    base: { label: "Base", icon: Minus, color: "data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:border-gray-900" },
    high: { label: "Alto", icon: TrendingUp, color: "data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200" },
  }

  const forecastData = useMemo(() => {
    const multiplier = scenarioMultipliers[scenario]
    const baseCostPerEvent = billing.currentMonthCost / (billing.activeUsers * billing.eventsPerUser)
    const monthlyEvents = users * eventsPerUser
    
    return Array.from({ length: parseInt(horizon) }, (_, i) => {
      const growthFactor = 1 + (i * 0.02 * multiplier)
      const cost = Math.round(baseCostPerEvent * monthlyEvents * growthFactor * multiplier)
      return {
        month: format(subMonths(new Date(), -i - 1), "MMM"),
        cost,
      }
    })
  }, [users, eventsPerUser, horizon, scenario, billing])

  const totalForecast = forecastData.reduce((sum, d) => sum + d.cost, 0)
  const avgMonthly = totalForecast / parseInt(horizon)

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden sticky top-4">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Forecast & simulación</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Proyección de costes futuros</p>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Usuarios/mes
            </Label>
            <Input
              type="number"
              value={users}
              onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-gray-50/50 border-gray-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Eventos/usuario
            </Label>
            <Input
              type="number"
              value={eventsPerUser}
              onChange={(e) => setEventsPerUser(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-gray-50/50 border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-600 font-medium">Horizonte temporal</Label>
          <Select value={horizon} onValueChange={(v) => setHorizon(v as "3" | "6" | "12")}>
            <SelectTrigger className="h-8 text-sm bg-gray-50/50 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scenario Selector - Enhanced */}
        <div className="space-y-2">
          <Label className="text-[11px] text-gray-600 font-medium">Escenario de uso</Label>
          <div className="flex gap-1.5 p-1 bg-gray-100/50 rounded-lg">
            {(["low", "base", "high"] as ForecastScenario[]).map((s) => {
              const config = scenarioConfig[s]
              const Icon = config.icon
              return (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  data-state={scenario === s ? "active" : "inactive"}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-transparent transition-all",
                    scenario === s
                      ? config.color
                      : "bg-transparent text-gray-500 hover:bg-white/50 hover:text-gray-700"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Proyección</span>
            <span className="text-[10px] text-gray-400">{horizon} meses</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 9, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '6px 10px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Coste']}
              />
              <Area 
                type="monotone" 
                dataKey="cost" 
                stroke="#6366F1" 
                strokeWidth={2}
                fill="url(#colorForecast)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Card */}
        <motion.div 
          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          key={`${users}-${eventsPerUser}-${horizon}-${scenario}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600 font-medium">Coste estimado</span>
            <span className="text-[10px] text-gray-600 font-medium bg-gray-200/80 px-2 py-0.5 rounded">
              {horizon} meses
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalForecast)}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Media mensual: <strong className="text-gray-700">{formatCurrency(avgMonthly)}</strong></span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// PoC Section - Enhanced with better gauge
function PoCSection({ billing }: { billing: BillingDetail }) {
  const [pocUsers, setPocUsers] = useState(1000)
  const [pocCalls, setPocCalls] = useState(50)
  
  const baseCostPerEvent = billing.currentMonthCost / (billing.activeUsers * billing.eventsPerUser)
  const monthlyEvents = pocUsers * pocCalls * 30
  const estimatedCost = Math.round(baseCostPerEvent * monthlyEvents)
  
  const maxCost = 50000
  const percentage = Math.min((estimatedCost / maxCost) * 100, 100)
  
  const costLevel = estimatedCost < 10000 ? "low" : estimatedCost < 25000 ? "medium" : "high"
  const levelConfig = {
    low: { 
      color: "#10B981", 
      label: "Bajo", 
      bgClass: "from-emerald-50/80",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-200/60"
    },
    medium: { 
      color: "#F59E0B", 
      label: "Medio", 
      bgClass: "from-amber-50/80",
      textClass: "text-amber-600",
      borderClass: "border-amber-200/60"
    },
    high: { 
      color: "#EF4444", 
      label: "Alto", 
      bgClass: "from-red-50/80",
      textClass: "text-red-600",
      borderClass: "border-red-200/60"
    },
  }
  const config = levelConfig[costLevel]

  // Calculate arc
  const radius = 45
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage / 100)

  return (
<motion.div 
          className="border border-gray-200 rounded-lg bg-white overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
      <div className="px-4 py-3 border-b border-gray-100/60">
        <h3 className="text-sm font-semibold text-gray-900">Estimación coste PoC en producción</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Simula el coste de escalar esta initiative</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Usuarios previstos
            </Label>
            <Input
              type="number"
              value={pocUsers}
              onChange={(e) => setPocUsers(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-white/80 border-gray-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Llamadas a modelo/día
            </Label>
            <Input
              type="number"
              value={pocCalls}
              onChange={(e) => setPocCalls(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-white/80 border-gray-200"
            />
          </div>
        </div>

        <motion.div 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          key={`${pocUsers}-${pocCalls}`}
          initial={{ opacity: 0.8, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1 font-medium">Coste mensual estimado</div>
            <div className="text-3xl font-bold tracking-tight text-gray-900">
              {formatCurrency(estimatedCost)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                costLevel === "low" && "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                costLevel === "medium" && "bg-amber-50 text-amber-700 border-amber-200/60",
                costLevel === "high" && "bg-red-50 text-red-700 border-red-200/60"
              )}>
                Nivel: {config.label}
              </span>
              <span className="text-[10px] text-gray-400">
                {monthlyEvents.toLocaleString()} eventos/mes
              </span>
            </div>
          </div>
          
          {/* Enhanced Gauge */}
          <div className="relative w-28 h-16">
            <svg className="w-28 h-16" viewBox="0 0 100 55">
              {/* Background arc */}
              <path
                d="M 5 50 A 45 45 0 0 1 95 50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Value arc */}
              <motion.path
                d="M 5 50 A 45 45 0 0 1 95 50"
                fill="none"
                stroke={config.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((tick, i) => {
                const angle = Math.PI - (tick / 100) * Math.PI
                const x1 = 50 + 40 * Math.cos(angle)
                const y1 = 50 - 40 * Math.sin(angle)
                const x2 = 50 + 48 * Math.cos(angle)
                const y2 = 50 - 48 * Math.sin(angle)
                return (
                  <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D1D5DB" strokeWidth="1" />
                )
              })}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <span className="text-lg font-bold text-gray-700">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Breakdown Row Component
function BreakdownRow({ item, index }: { item: CostBreakdown; index: number }) {
  const variation = ((item.currentMonth - item.avg3Months) / item.avg3Months) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="grid grid-cols-[1fr_110px_110px_80px_30px] gap-4 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200/70 transition-colors">
          <item.icon className="h-4 w-4 text-gray-500" />
        </div>
        <span className="text-sm font-medium text-gray-900">{item.category}</span>
      </div>
      <div className="text-sm font-semibold text-gray-900 text-right tabular-nums">
        {formatCurrency(item.currentMonth)}
      </div>
      <div className="text-sm text-gray-600 text-right tabular-nums">
        {formatCurrency(item.avg3Months)}
      </div>
      <div className="text-right">
        <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200/60">
          {item.percentage}%
        </span>
      </div>
      <div className="flex items-center justify-center">
        <MicroTrend trend={item.trend} />
      </div>
    </motion.div>
  )
}

export default function BillingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { currentOrg } = useAuth()
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [billing, setBilling] = useState<BillingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [costView, setCostView] = useState<CostView>("total")

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
          setBilling(generateBillingDetailFromIssue(issue))
        } else {
          // If issue not found, redirect back to billing
          router.push('/billing')
        }
      } catch (error) {
        console.error('Error loading issue:', error)
        router.push('/billing')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, currentOrg?.organization?.id, router])

  if (loading || !billing) {
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

  const chartData = billing.historicalCosts.map(c => ({
    month: c.month,
    value: costView === "total" ? c.total : costView === "per_user" ? c.perUser : c.perEvent,
  }))

  const chartLabel = costView === "total" ? "Coste total" : costView === "per_user" ? "€/usuario" : "€/evento"

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
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/billing")}
                  className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-500" />
                </Button>
                <div className="flex items-center gap-1.5 text-[14px]">
                  <span className="text-gray-400">{billing.businessUnit}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  <span className="text-gray-400">{billing.project}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  <span className="font-medium text-gray-900">{billing.name}</span>
                </div>
              </div>

              <Button 
                size="sm" 
                className="h-8 bg-gray-800 hover:bg-gray-900 text-white gap-2 text-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                Exportar informe
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
          {/* Header with Title and Chips */}
          <div className="py-5 border-b border-stroke bg-gradient-to-b from-gray-50/50 to-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">{billing.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <ProviderBadge provider={billing.provider} />
              <div className="w-px h-5 bg-gray-200" />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100/80 text-gray-600 border border-gray-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Entorno: {billing.environment}
              </span>
              {billing.budget && (
                <>
                  <div className="w-px h-5 bg-gray-200" />
                  <BudgetBadge isOverBudget={billing.isOverBudget} />
                </>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="py-4 border-b border-stroke bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPICard
                title="Coste mes actual"
                value={formatCurrency(billing.currentMonthCost)}
                trend={{ direction: billing.trend, value: billing.variation }}
                highlight={billing.isOverBudget ? "danger" : undefined}
              />
              <KPICard
                title="Media últimos 3 meses"
                value={formatCurrency(billing.avgCost3Months)}
              />
              <KPICard
                title="Variación vs anterior"
                value={`${billing.variation > 0 ? "+" : ""}${billing.variation.toFixed(1)}%`}
                highlight={billing.variation > 20 ? "warning" : billing.variation < -10 ? "success" : undefined}
              />
              {billing.budget && (
                <KPICard
                  title="Presupuesto objetivo"
                  value={formatCurrency(billing.budget)}
                  subtitle={`${Math.round((billing.currentMonthCost / billing.budget) * 100)}% utilizado`}
                />
              )}
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '20px', paddingBottom: '24px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts & Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                {/* Historical Chart */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Histórico de costes</h3>
                    <Tabs value={costView} onValueChange={(v) => setCostView(v as CostView)}>
                      <TabsList className="h-7 p-0.5 bg-gray-100">
                        <TabsTrigger value="total" className="h-6 px-2.5 text-[10px] data-[state=active]:bg-white">
                          Total €
                        </TabsTrigger>
                        <TabsTrigger value="per_user" className="h-6 px-2.5 text-[10px] data-[state=active]:bg-white">
                          €/usuario
                        </TabsTrigger>
                        <TabsTrigger value="per_event" className="h-6 px-2.5 text-[10px] data-[state=active]:bg-white">
                          €/evento
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E8EC" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => costView === "total" ? `${(value/1000).toFixed(0)}k` : value.toFixed(2)}
                        />
                        {billing.budget && costView === "total" && (
                          <ReferenceLine 
                            y={billing.budget} 
                            stroke="#EF4444" 
                            strokeDasharray="5 5" 
                            strokeWidth={1.5}
                            label={{
                              value: "Budget",
                              fill: "#EF4444",
                              fontSize: 10,
                              fontWeight: 500,
                            }}
                          />
                        )}
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '12px',
                            padding: '8px 12px',
                          }}
                          formatter={(value: number) => [
                            costView === "total" ? formatCurrency(value) : `${value.toFixed(3)} €`,
                            chartLabel
                          ]}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="url(#barGradient)" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-gray-900">Desglose por partida</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_110px_110px_80px_30px] gap-4 px-4 py-2.5 bg-gray-50/30">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Partida</div>
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Coste mes</div>
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Media 3m</div>
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">%</div>
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">△</div>
                    </div>
                    
                    {billing.breakdown.map((item, index) => (
                      <BreakdownRow key={item.id} item={item} index={index} />
                    ))}
                    
                    {/* Total */}
                    <div className="grid grid-cols-[1fr_110px_110px_80px_30px] gap-4 px-4 py-3.5 bg-gray-50">
                      <div className="text-sm font-semibold text-gray-900">Total</div>
                      <div className="text-sm font-bold text-gray-900 text-right tabular-nums">
                        {formatCurrency(billing.currentMonthCost)}
                      </div>
                      <div className="text-sm font-semibold text-gray-600 text-right tabular-nums">
                        {formatCurrency(billing.avgCost3Months)}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                          100%
                        </span>
                      </div>
                      <div />
                    </div>
                  </div>
                </div>

                {/* PoC Section */}
                <PoCSection billing={billing} />
              </div>

              {/* Right Column - Forecast Panel */}
              <div className="lg:col-span-1">
                <ForecastPanel billing={billing} />
              </div>
            </div>
          </div>
        </motion.div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
