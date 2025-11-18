"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Download,
  Plus,
  MoreVertical,
  Calendar,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Copy,
  Zap,
  DollarSign,
  TrendingDown,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/context/auth-context"
import { format, subDays, parseISO, startOfDay } from "date-fns"
import { useRouter } from "next/navigation"
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
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Types
type EvalStatus = "passed" | "failed" | "running" | "pending"
type EvalType = "accuracy" | "latency" | "cost" | "custom"

interface Evaluation {
  id: string
  name: string
  description?: string
  status: EvalStatus
  type: EvalType
  createdAt: Date
  updatedAt: Date
  totalRuns: number
  passedRuns: number
  failedRuns: number
  passRate: number
  avgLatency?: number
  avgCost?: number
  createdBy?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  tags?: string[]
}

interface EvalRun {
  id: string
  evalId: string
  status: EvalStatus
  score?: number
  latency?: number
  cost?: number
  createdAt: Date
  metadata?: Record<string, any>
}

// Mock data - will be replaced with real API calls
const generateMockEvaluations = (): Evaluation[] => {
  // Only passed or failed status
  const statuses: EvalStatus[] = ["passed", "failed"]
  const names = [
    "Customer Support Response Quality",
    "Code Generation Accuracy",
    "Translation Quality Check",
    "Sentiment Analysis Evaluation",
    "Question Answering Accuracy",
    "Code Review Suggestions",
    "Document Summarization",
    "Email Classification",
    "Intent Recognition",
    "Entity Extraction",
    "Response Time Benchmark",
    "Cost Optimization Test",
  ]
  
  // Create non-uniform distribution for types: 4 latency, 3 accuracy, 3 custom, 2 cost
  const typeDistribution: EvalType[] = [
    "latency", "latency", "latency", "latency", // 4 latency
    "accuracy", "accuracy", "accuracy", // 3 accuracy
    "custom", "custom", "custom", // 3 custom
    "cost", "cost", // 2 cost
  ]
  
  return Array.from({ length: 12 }, (_, i) => {
    const totalRuns = Math.floor(Math.random() * 200) + 50
    const passedRuns = Math.floor(totalRuns * (0.65 + Math.random() * 0.25))
    const failedRuns = totalRuns - passedRuns
    // Determine status based on pass rate: >70% = passed, <=70% = failed
    const passRate = (passedRuns / totalRuns) * 100
    const status: EvalStatus = passRate > 70 ? "passed" : "failed"
    
    return {
      id: `eval-${i + 1}`,
      name: names[i] || `Evaluation ${i + 1}`,
      description: `Comprehensive evaluation for ${typeDistribution[i]} metrics with ${totalRuns} test cases`,
      status,
      type: typeDistribution[i],
      createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
      updatedAt: subDays(new Date(), Math.floor(Math.random() * 7)),
      totalRuns,
      passedRuns,
      failedRuns,
      passRate: (passedRuns / totalRuns) * 100,
      avgLatency: Math.random() * 400 + 150,
      avgCost: Math.random() * 0.08 + 0.02,
      createdBy: {
        id: `user-${i % 3}`,
        name: [`John Doe`, `Jane Smith`, `Mike Johnson`][i % 3],
        email: [`john@example.com`, `jane@example.com`, `mike@example.com`][i % 3],
      },
      tags: [
        ["production", "critical"][i % 2],
        ["staging", "test", "experimental"][i % 3],
      ].filter(Boolean),
    }
  })
}

// Generate time series data for charts
const generateTimeSeriesData = (days: number = 30) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1)
    return {
      date: format(date, "MMM d"),
      fullDate: format(date, "yyyy-MM-dd"),
      runs: Math.floor(Math.random() * 50) + 20,
      passed: Math.floor(Math.random() * 40) + 15,
      failed: Math.floor(Math.random() * 10) + 2,
      avgLatency: Math.floor(Math.random() * 200) + 200,
      cost: Number((Math.random() * 0.05 + 0.01).toFixed(4)),
    }
  })
}

// Generate distribution data
const generateDistributionData = (evaluations: Evaluation[]) => {
  const byType = evaluations.reduce((acc, evaluation) => {
    acc[evaluation.type] = (acc[evaluation.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Colors that match the platform style - more muted, professional
  const colorMap: Record<string, string> = {
    accuracy: "#6366F1", // Indigo - matches platform accent
    latency: "#3B82F6", // Blue
    cost: "#10B981", // Green
    custom: "#6B7280", // Gray
  }

  return Object.entries(byType)
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: colorMap[type] || "#6B7280",
    }))
}

export default function EvalsPage() {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("7d")
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [distributionData, setDistributionData] = useState<any[]>([])

  // Load evaluations
  useEffect(() => {
    const loadEvaluations = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = generateMockEvaluations()
      setEvaluations(mockData)
      setTimeSeriesData(generateTimeSeriesData(30))
      setDistributionData(generateDistributionData(mockData))
      setLoading(false)
    }

    loadEvaluations()
  }, [currentOrg?.organization?.id])

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         evaluation.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter
    const matchesType = typeFilter === "all" || evaluation.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    const total = evaluations.length
    const passed = evaluations.filter(e => e.status === "passed").length
    const failed = evaluations.filter(e => e.status === "failed").length
    const running = evaluations.filter(e => e.status === "running").length
    const totalRuns = evaluations.reduce((sum, e) => sum + e.totalRuns, 0)
    const totalPassedRuns = evaluations.reduce((sum, e) => sum + e.passedRuns, 0)
    const totalFailedRuns = evaluations.reduce((sum, e) => sum + e.failedRuns, 0)
    const avgPassRate = totalRuns > 0 ? (totalPassedRuns / totalRuns) * 100 : 0
    const avgLatency = evaluations.reduce((sum, e) => sum + (e.avgLatency || 0), 0) / evaluations.length || 0
    const totalCost = evaluations.reduce((sum, e) => sum + ((e.avgCost || 0) * e.totalRuns), 0)
    const avgCost = evaluations.length > 0 ? totalCost / evaluations.length : 0
    const recentRuns = timeSeriesData.slice(-7).reduce((sum, d) => sum + d.runs, 0)
    const recentPassRate = timeSeriesData.slice(-7).reduce((sum, d) => {
      const total = d.passed + d.failed
      return total > 0 ? sum + (d.passed / total) * 100 : sum
    }, 0) / 7

    return {
      total,
      passed,
      failed,
      running,
      totalRuns,
      totalPassedRuns,
      totalFailedRuns,
      avgPassRate,
      avgLatency,
      totalCost,
      avgCost,
      recentRuns,
      recentPassRate,
    }
  }, [evaluations, timeSeriesData])

  const getStatusBadge = (status: EvalStatus) => {
    const variants = {
      passed: { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
      failed: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      running: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 border-blue-200", icon: RefreshCw },
      pending: { variant: "outline" as const, className: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock },
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: EvalType) => {
    // Always gray for type badges
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
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
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Deploy</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Evals</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 bg-gray-700 hover:bg-gray-800 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Evaluation
                </Button>
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div 
              className="flex items-center justify-between h-full gap-4" 
              style={{ 
                paddingLeft: '28px', 
                paddingRight: '20px', 
                paddingTop: 'var(--header-padding-y)', 
                paddingBottom: 'var(--header-padding-y)' 
              }}
            >
              {/* Filters */}
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search evaluations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-gray-300"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-sm bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-sm bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px] h-8 text-sm bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        }
      >
        <div style={{ paddingLeft: '28px', paddingRight: '20px' }}>
          <div className="space-y-6 py-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Total Evaluations</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">{summaryMetrics.total}</div>
                <Activity className="h-5 w-5 opacity-40 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">{summaryMetrics.running} running</div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Pass Rate</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  {summaryMetrics.avgPassRate.toFixed(1)}%
                </div>
                <TrendingUp className="h-5 w-5 opacity-40 text-green-600" />
              </div>
              <div className="text-xs text-gray-500 mt-1">{summaryMetrics.totalPassedRuns} / {summaryMetrics.totalRuns} runs</div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Total Runs</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">{summaryMetrics.totalRuns}</div>
                <BarChart3 className="h-5 w-5 opacity-40 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">{summaryMetrics.recentRuns} in last 7 days</div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Avg Latency</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  {summaryMetrics.avgLatency.toFixed(0)}ms
                </div>
                <Clock className="h-5 w-5 opacity-40 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Average response time</div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Total Cost</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  ${summaryMetrics.totalCost.toFixed(2)}
                </div>
                <DollarSign className="h-5 w-5 opacity-40 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Avg ${summaryMetrics.avgCost.toFixed(4)} per run</div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-500">Failed Runs</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-red-600">
                  {summaryMetrics.totalFailedRuns}
                </div>
                <XCircle className="h-5 w-5 opacity-40 text-red-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {summaryMetrics.totalRuns > 0 ? ((summaryMetrics.totalFailedRuns / summaryMetrics.totalRuns) * 100).toFixed(1) : 0}% failure rate
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Runs Over Time */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Runs Over Time</span>
                  </div>
                  <div className="text-xs text-gray-500">Last 30 days</div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E8EC" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E8EC',
                          borderRadius: '6px',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#111418', fontWeight: 600 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="passed" 
                        stackId="1"
                        stroke="#22c55e" 
                        fill="url(#colorPassed)" 
                        name="Passed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="failed" 
                        stackId="1"
                        stroke="#ef4444" 
                        fill="url(#colorFailed)" 
                        name="Failed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Evaluation Types Distribution */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Evaluation Types</span>
                  </div>
                  <div className="text-xs text-gray-500">Distribution</div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E8EC',
                          borderRadius: '6px',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#111418', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pass Rate Trend */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Pass Rate Trend</span>
                  </div>
                  <div className="text-xs text-gray-500">7-day average</div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData.slice(-14).map(d => ({
                      ...d,
                      passRate: d.passed + d.failed > 0 ? (d.passed / (d.passed + d.failed)) * 100 : 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E8EC" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                        domain={[0, 100]}
                        label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 11 } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E8EC',
                          borderRadius: '6px',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#111418', fontWeight: 600 }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pass Rate']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="passRate" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#10B981" }}
                        activeDot={{ r: 6 }}
                        name="Pass Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Latency & Cost */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Latency & Cost</span>
                  </div>
                  <div className="text-xs text-gray-500">Average metrics</div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeSeriesData.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E8EC" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                        label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 11 } }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#E7E8EC"
                        label={{ value: '$', angle: 90, position: 'insideRight', style: { fill: '#6B7280', fontSize: 11 } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E8EC',
                          borderRadius: '6px',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#111418', fontWeight: 600 }}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgLatency" 
                        fill="#6B7280" 
                        name="Latency (ms)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="cost" 
                        fill="#10B981" 
                        name="Cost ($)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Evaluations List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-900">Evaluations</span>
                <span className="text-xs text-gray-500">({filteredEvaluations.length})</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No evaluations found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first evaluation to get started"}
                  </p>
                  {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                    <Button className="h-8 bg-gray-700 hover:bg-gray-800 text-white gap-2">
                      <Plus className="h-4 w-4" />
                      New Evaluation
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-right py-2 px-4 font-semibold text-gray-700">Runs</th>
                      <th className="text-right py-2 px-4 font-semibold text-gray-700">Pass Rate</th>
                      <th className="text-right py-2 px-4 font-semibold text-gray-700">Latency</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvaluations.map((evaluation) => (
                      <tr
                        key={evaluation.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer"
                        onClick={() => router.push(`/evals/${evaluation.id}`)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <button
                              className="font-medium text-sm text-gray-900 hover:text-gray-700 hover:underline transition-colors text-left"
                            >
                              {evaluation.name}
                            </button>
                            {evaluation.description && (
                              <span className="text-xs text-gray-500 line-clamp-1">{evaluation.description}</span>
                            )}
                            {evaluation.tags && evaluation.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {evaluation.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-700 border-gray-200">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(evaluation.status)}
                        </td>
                        <td className="py-3 px-4">
                          {getTypeBadge(evaluation.type)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">{evaluation.totalRuns}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-sm text-gray-700">{evaluation.passRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {evaluation.avgLatency ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">{evaluation.avgLatency.toFixed(0)}ms</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{format(evaluation.updatedAt, "MMM d, yyyy")}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

