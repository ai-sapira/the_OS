"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Download,
  Play,
  AlertTriangle,
  Activity,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Send,
  GitBranch,
  Rocket,
  Zap,
  ExternalLink,
  Filter,
  Search,
  CircleDot,
  ArrowRight,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/context/auth-context"
import { format, subDays, subHours } from "date-fns"
import { useRouter, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

// Types
type EvalStatus = "ok" | "warning" | "critical"
type FeedbackType = "ok" | "ko" | "partial" | null
type SuiteResultType = "pass" | "fail" | "running"

interface Initiative {
  id: string
  projectId: string
  projectName: string
  businessUnit: string
  name: string
  description?: string
  model: {
    provider: string
    name: string
    version: string
  }
  scoreGlobal: number
  status: EvalStatus
  environment: string
  lastEvalRun: Date
  metrics: Metric[]
}

interface Metric {
    id: string
    name: string
  value: number
  target: number
  unit: string
  trend: number
  history: { date: string; value: number }[]
}

interface EvalSuite {
  id: string
  name: string
  type: "regression" | "robustness" | "accuracy" | "latency" | "custom"
  samples: number
  result: SuiteResultType
  score?: number
  lastRun: Date
}

interface HITLSample {
  id: string
  input: string
  output: string
  context?: string
  feedback: FeedbackType
  labels: string[]
  comment?: string
  date: Date
  status: "pending" | "reviewed"
}

interface ModelVersion {
  id: string
  version: string
  date: Date
  description: string
  metrics: {
    accuracy: number
    latency: number
    cost: number
  }
  status: "deployed" | "testing" | "archived"
}

// Model providers and names for evals
const MODEL_PROVIDERS = ["OpenAI", "Anthropic", "Google", "Azure", "Mistral"]
const MODEL_NAMES = ["gpt-4o", "claude-3.5-sonnet", "gemini-pro", "gpt-4-turbo", "mistral-large"]

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

// Generate initiative from real issue data
const generateInitiativeFromIssue = (issue: any): Initiative => {
  const seed = issue.id
  const scoreGlobal = seededRandom(seed + 'score', 75, 99)
  const status: EvalStatus = scoreGlobal >= 90 ? "ok" : scoreGlobal >= 80 ? "warning" : "critical"
  
  // Get model based on issue for consistency
  const providerIndex = seededRandom(seed + 'provider', 0, MODEL_PROVIDERS.length)
  const modelIndex = seededRandom(seed + 'model', 0, MODEL_NAMES.length)
  
  const metricTemplates = [
    { name: "Accuracy", unit: "%", target: 95 },
    { name: "Task Success Rate", unit: "%", target: 90 },
    { name: "Response Quality", unit: "/10", target: 8.5 },
    { name: "Latency P95", unit: "ms", target: 500 },
  ]

  const metrics: Metric[] = metricTemplates.map((template, idx) => {
    const variance = template.unit === "%" ? 15 : template.unit === "ms" ? 200 : 2
    const metricSeed = seed + template.name
    const baseValue = template.target + (seededRandom(metricSeed, 0, 100) / 100 - 0.3) * variance
    const value = template.name === "Latency P95"
      ? Math.max(0, baseValue)
      : Math.min(template.target * 1.1, Math.max(0, baseValue))

    return {
      id: `metric-${idx}`,
      name: template.name,
      value: Number(value.toFixed(2)),
      target: template.target,
      unit: template.unit,
      trend: seededRandom(metricSeed + 'trend', 0, 100) / 10 - 3,
      history: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), "MMM d"),
        value: value + (seededRandom(metricSeed + i, 0, 100) / 100 - 0.5) * variance * 0.3,
      })),
    }
  })
  
  return {
    id: issue.id,
    projectId: issue.project?.id || 'unassigned',
    projectName: issue.project?.name || 'Sin asignar',
    businessUnit: issue.initiative?.name || 'Sin asignar',
    name: issue.title,
    description: issue.description || undefined,
    model: { 
      provider: MODEL_PROVIDERS[providerIndex], 
      name: MODEL_NAMES[modelIndex], 
      version: `v${seededRandom(seed + 'major', 1, 4)}.${seededRandom(seed + 'minor', 0, 10)}` 
    },
    scoreGlobal,
    status,
    environment: "PROD",
    lastEvalRun: subHours(new Date(), seededRandom(seed + 'hours', 0, 24)),
    metrics,
  }
}

const generateMockSuites = (): EvalSuite[] => {
  const suiteTemplates = [
    { name: "Core Functionality", type: "regression" as const },
    { name: "Edge Cases", type: "robustness" as const },
    { name: "Response Quality", type: "accuracy" as const },
    { name: "Performance Benchmark", type: "latency" as const },
    { name: "Safety & Compliance", type: "custom" as const },
    { name: "Multi-language Support", type: "accuracy" as const },
  ]

  return suiteTemplates.map((template, idx) => ({
    id: `suite-${idx}`,
    name: template.name,
    type: template.type,
    samples: Math.floor(Math.random() * 200) + 50,
    result: Math.random() > 0.2 ? "pass" : "fail",
    score: Math.floor(Math.random() * 20) + 80,
    lastRun: subHours(new Date(), Math.floor(Math.random() * 48)),
  }))
}

const generateMockHITLSamples = (): HITLSample[] => {
  const inputs = [
    "How do I reset my password?",
    "I want to cancel my subscription",
    "What are your business hours?",
    "I need help with my order #12345",
    "Can you explain the pricing tiers?",
    "The app is not loading properly",
    "How do I upgrade my plan?",
    "I need a refund for my last purchase",
  ]

  const outputs = [
    "To reset your password, please go to Settings > Account > Security and click 'Reset Password'.",
    "I understand you'd like to cancel. Before I process that, may I ask what prompted this decision?",
    "Our business hours are Monday to Friday, 9 AM to 6 PM EST.",
    "I found your order #12345. It was shipped and is expected to arrive by tomorrow.",
    "We offer three pricing tiers: Basic ($9/mo), Pro ($29/mo), and Enterprise (custom).",
    "Let's troubleshoot: 1) Clear cache, 2) Update to latest version, 3) Restart the app.",
    "To upgrade, go to Settings > Subscription > Change Plan.",
    "I can help with your refund. According to our policy, refunds are processed within 5-7 business days.",
  ]

  const labels = ["hallucination", "tone-issue", "incomplete", "off-topic", "excellent", "needs-context"]

  return inputs.map((input, idx) => ({
    id: `sample-${idx}`,
    input,
    output: outputs[idx],
    context: idx % 2 === 0 ? "Customer has been with us for 2 years. Premium tier." : undefined,
    feedback: idx < 3 ? null : idx % 3 === 0 ? "ok" : idx % 3 === 1 ? "ko" : "partial",
    labels: idx < 3 ? [] : [labels[idx % labels.length]],
    comment: idx >= 3 && idx % 2 === 0 ? "Response was accurate but could be more empathetic" : undefined,
    date: subHours(new Date(), idx * 3),
    status: idx < 3 ? "pending" : "reviewed",
  }))
}

const generateMockVersions = (): ModelVersion[] => {
  return [
    { id: "v-1", version: "v2.1", date: subDays(new Date(), 2), description: "Improved context handling, reduced hallucinations", metrics: { accuracy: 94.2, latency: 320, cost: 0.023 }, status: "deployed" },
    { id: "v-2", version: "v2.0", date: subDays(new Date(), 14), description: "Major update with new fine-tuning", metrics: { accuracy: 91.8, latency: 340, cost: 0.021 }, status: "archived" },
    { id: "v-3", version: "v1.5", date: subDays(new Date(), 45), description: "Performance optimizations", metrics: { accuracy: 89.5, latency: 290, cost: 0.019 }, status: "archived" },
    { id: "v-4", version: "v1.0", date: subDays(new Date(), 90), description: "Initial production deployment", metrics: { accuracy: 85.2, latency: 450, cost: 0.025 }, status: "archived" },
  ]
}

export default function EvalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const evalId = params.id as string
  const { currentOrg } = useAuth()
  
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [suites, setSuites] = useState<EvalSuite[]>([])
  const [samples, setSamples] = useState<HITLSample[]>([])
  const [versions, setVersions] = useState<ModelVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("metrics")
  
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null)
  const [sampleFilter, setSampleFilter] = useState<"all" | "pending" | "reviewed">("pending")
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackType>(null)
  const [currentLabels, setCurrentLabels] = useState<string[]>([])
  const [currentComment, setCurrentComment] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (!evalId || !currentOrg?.organization?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Load real issue data from database
        const { data: issue, error } = await supabase
          .from('issues')
          .select(`
            *,
            initiative:initiatives(*),
            project:projects(*),
            assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
            reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url)
          `)
          .eq('id', evalId)
          .eq('organization_id', currentOrg.organization.id)
          .single()

        if (error || !issue) {
          console.error('Error loading issue:', error)
          setLoading(false)
          return
        }

        // Generate initiative data from real issue
        setInitiative(generateInitiativeFromIssue(issue))
        setSuites(generateMockSuites())
        setSamples(generateMockHITLSamples())
        setVersions(generateMockVersions())
      } catch (error) {
        console.error('Error loading eval data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [evalId, currentOrg?.organization?.id])

  useEffect(() => {
    const filtered = samples.filter(s => sampleFilter === "all" ? true : s.status === sampleFilter)
    if (filtered.length > 0 && !selectedSampleId) setSelectedSampleId(filtered[0].id)
  }, [samples, sampleFilter, selectedSampleId])

  const selectedSample = samples.find(s => s.id === selectedSampleId)

  useEffect(() => {
    if (selectedSample) {
      setCurrentFeedback(selectedSample.feedback)
      setCurrentLabels(selectedSample.labels)
      setCurrentComment(selectedSample.comment || "")
    }
  }, [selectedSample])

  const getStatusBadge = (status: EvalStatus) => {
    const config = {
      ok: { label: "OK", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      warning: { label: "Warning", className: "bg-amber-50 text-amber-700 border-amber-200" },
      critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" },
    }
    const { label, className } = config[status]
    return <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 font-medium", className)}>{label}</Badge>
  }

  const getScorePill = (score: number) => {
    const color = score >= 90 ? "bg-emerald-100 text-emerald-800" : score >= 75 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
    return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold", color)}>{score.toFixed(1)}</span>
  }

  const getMetricStatus = (value: number, target: number, name: string) => {
    const lowerIsBetter = name.includes("Latency") || name.includes("Hallucination")
    const isGood = lowerIsBetter ? value <= target : value >= target
    const isMarginal = lowerIsBetter ? value <= target * 1.2 : value >= target * 0.9
    if (isGood) return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    if (isMarginal) return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  }

  const handleSaveFeedback = () => {
    if (!selectedSampleId) return
    setSamples(prev => prev.map(s => s.id === selectedSampleId ? { ...s, feedback: currentFeedback, labels: currentLabels, comment: currentComment, status: "reviewed" as const } : s))
    const nextPending = samples.find(s => s.status === "pending" && s.id !== selectedSampleId)
    if (nextPending) setSelectedSampleId(nextPending.id)
  }

  const availableLabels = ["hallucination", "tone-issue", "incomplete", "off-topic", "factual-error", "excellent", "needs-context"]

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full"><Spinner className="h-8 w-8" /></div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  if (!initiative) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-gray-500 mb-4">Initiative not found</p>
            <Button variant="outline" onClick={() => router.push("/evals")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Evals
              </Button>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  const filteredSamples = samples.filter(s => sampleFilter === "all" ? true : s.status === sampleFilter)
  const pendingCount = samples.filter(s => s.status === "pending").length

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
        <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={() => router.push("/evals")}>
                  <ArrowLeft className="h-4 w-4" />
              </Button>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-400">{initiative.businessUnit}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-400">{initiative.projectName}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-900">{initiative.name}</span>
                <span className="text-xs text-gray-400 ml-2">({initiative.model.provider} / {initiative.model.name})</span>
              </div>
              <div className="flex items-center gap-3">
                {getScorePill(initiative.scoreGlobal)}
                {getStatusBadge(initiative.status)}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border-gray-200">{initiative.environment}</Badge>
                <span className="text-gray-200">|</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100"><Download className="h-4 w-4" /></Button>
                <Button size="sm" className="h-8 bg-gray-900 hover:bg-gray-800 text-white gap-2">
                  <Play className="h-4 w-4" />Run Eval
              </Button>
            </div>
          </div>
        </PageHeader>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4 bg-gray-100/80 p-0.5 rounded-lg h-8">
            <TabsTrigger value="metrics" className="text-xs h-7 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Métricas</TabsTrigger>
            <TabsTrigger value="suites" className="text-xs h-7 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Eval Suites</TabsTrigger>
            <TabsTrigger value="hitl" className="text-xs h-7 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              HITL{pendingCount > 0 && <Badge className="ml-2 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700 border-0">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs h-7 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Versiones</TabsTrigger>
          </TabsList>

          {/* TAB: Métricas */}
          <TabsContent value="metrics" className="space-y-5 mt-0">
            {/* KPI Cards - Refined */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {initiative.metrics.map(metric => {
                const status = getMetricStatus(metric.value, metric.target, metric.name)
                return (
                  <div key={metric.id} className={cn("rounded-lg border p-4", status.bg, status.border)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-gray-500">{metric.name}</span>
                      <span className={cn("text-[10px] font-medium flex items-center gap-0.5", metric.trend >= 0 ? "text-emerald-600" : "text-red-500")}>
                        <TrendingUp className={cn("h-3 w-3", metric.trend < 0 && "rotate-180")} />
                        {Math.abs(metric.trend).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-2xl font-semibold tracking-tight", status.color)}>
                        {metric.value.toFixed(metric.unit === "%" || metric.unit === "ms" ? 1 : 2)}
                      </span>
                      <span className="text-xs text-gray-400">{metric.unit}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Target: {metric.target}{metric.unit}</p>
                  </div>
                )
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Trend</p>
                  <h3 className="text-sm font-medium text-gray-900">Accuracy over time</h3>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={initiative.metrics[0]?.history || []}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Breakdown</p>
                  <h3 className="text-sm font-medium text-gray-900">Metrics by segment</h3>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[{ segment: "EN", accuracy: 95.2 }, { segment: "ES", accuracy: 92.8 }, { segment: "FR", accuracy: 91.5 }, { segment: "DE", accuracy: 90.1 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="segment" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[80, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="accuracy" name="Accuracy %" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
          </div>

            {/* Details table */}
            <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Details</p>
                <h3 className="text-sm font-medium text-gray-900">All metrics</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {initiative.metrics.map(metric => {
                  const status = getMetricStatus(metric.value, metric.target, metric.name)
                  const lowerIsBetter = metric.name.includes("Latency") || metric.name.includes("Hallucination")
                  const isGood = lowerIsBetter ? metric.value <= metric.target : metric.value >= metric.target
                  return (
                    <div key={metric.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                      <span className="text-sm font-medium text-gray-800">{metric.name}</span>
                      <div className="flex items-center gap-5">
                        <span className={cn("text-sm font-semibold tabular-nums", status.color)}>
                          {metric.value.toFixed(metric.unit === "%" || metric.unit === "ms" ? 1 : 2)}{metric.unit}
                        </span>
                        <span className="text-xs text-gray-400 w-24 text-right">Target: {metric.target}{metric.unit}</span>
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0.5 w-20 justify-center font-medium",
                          isGood ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {isGood ? "On Target" : "Below"}
                        </Badge>
                        <span className={cn("text-xs font-medium w-14 text-right tabular-nums", metric.trend >= 0 ? "text-emerald-600" : "text-red-500")}>
                          {metric.trend >= 0 ? "+" : ""}{metric.trend.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </TabsContent>

          {/* TAB: Eval Suites */}
          <TabsContent value="suites" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{suites.length} eval suites</span>
              <Button size="sm" className="h-8 bg-gray-900 hover:bg-gray-800 text-white gap-2">
                <Play className="h-3.5 w-3.5" />Run All
              </Button>
            </div>
            <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="divide-y divide-gray-50">
                {suites.map(suite => (
                  <div key={suite.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">{suite.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 border-gray-200 capitalize">{suite.type}</Badge>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-xs text-gray-400 w-20 text-right">{suite.samples} samples</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-2 py-0.5 w-20 justify-center font-medium",
                        suite.result === "pass" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                      )}>
                        {suite.score}% {suite.result === "pass" ? "Pass" : "Fail"}
                      </Badge>
                      <span className="text-xs text-gray-400 w-24 text-right">{format(suite.lastRun, "MMM d, HH:mm")}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"><Play className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"><ExternalLink className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* TAB: HITL */}
          <TabsContent value="hitl" className="mt-0 h-[calc(100%-56px)]">
            {filteredSamples.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-200 mb-4" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">All caught up!</h3>
                <p className="text-xs text-gray-500 mb-4">No hay muestras pendientes de revisión</p>
                <Button variant="outline" size="sm" onClick={() => setSampleFilter("all")} className="gap-2">
                  <Filter className="h-4 w-4" />Ver todas
                </Button>
              </div>
            ) : (
              <div className="flex h-full gap-4">
                {/* Left panel */}
                <div className="w-80 flex-shrink-0 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search samples..." className="pl-9 h-8 text-sm bg-white" />
                    </div>
                    <div className="flex gap-1">
                      {(["pending", "reviewed", "all"] as const).map(filter => (
                        <Button key={filter} variant="ghost" size="sm" className={cn("h-7 px-3 text-xs capitalize", sampleFilter === filter && "bg-gray-200")} onClick={() => setSampleFilter(filter)}>
                          {filter}{filter === "pending" && pendingCount > 0 && <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-amber-100 text-amber-700 border-0">{pendingCount}</Badge>}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {filteredSamples.map(sample => (
                      <div key={sample.id} className={cn("p-3 cursor-pointer transition-colors", selectedSampleId === sample.id ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50")} onClick={() => setSelectedSampleId(sample.id)}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-gray-800 line-clamp-2 flex-1">{sample.input}</p>
                          {sample.status === "pending" ? <CircleDot className="h-4 w-4 text-amber-500 shrink-0" /> : sample.feedback === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : sample.feedback === "ko" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> : <Minus className="h-4 w-4 text-amber-500 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-gray-400">{format(sample.date, "MMM d, HH:mm")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel */}
                <div className="flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
                  {selectedSample ? (
                    <>
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {selectedSample.context && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Context</p>
                            <p className="text-sm text-gray-700">{selectedSample.context}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Input (User Message)</p>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-800">{selectedSample.input}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Output (Model Response)</p>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedSample.output}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">Feedback</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className={cn("flex-1 h-8 gap-2", currentFeedback === "ok" && "bg-emerald-50 border-emerald-300 text-emerald-700")} onClick={() => setCurrentFeedback("ok")}><ThumbsUp className="h-4 w-4" />OK</Button>
                            <Button variant="outline" size="sm" className={cn("flex-1 h-8 gap-2", currentFeedback === "ko" && "bg-red-50 border-red-300 text-red-700")} onClick={() => setCurrentFeedback("ko")}><ThumbsDown className="h-4 w-4" />KO</Button>
                            <Button variant="outline" size="sm" className={cn("flex-1 h-8 gap-2", currentFeedback === "partial" && "bg-amber-50 border-amber-300 text-amber-700")} onClick={() => setCurrentFeedback("partial")}><Minus className="h-4 w-4" />Partial</Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableLabels.map(label => (
                              <Badge key={label} variant="outline" className={cn("text-[10px] px-2 py-1 cursor-pointer capitalize", currentLabels.includes(label) ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-100")} onClick={() => setCurrentLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])}>{label.replace("-", " ")}</Badge>
                            ))}
                          </div>
                        </div>
                        <Textarea value={currentComment} onChange={(e) => setCurrentComment(e.target.value)} placeholder="Add comment (optional)..." className="h-16 text-sm resize-none" />
                        <Button className="w-full h-8 bg-gray-900 hover:bg-gray-800 text-white gap-2" onClick={handleSaveFeedback} disabled={!currentFeedback}><Send className="h-4 w-4" />Save Feedback</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">Select a sample to review</div>
                  )}
                </div>
              </div>
            )}
            </TabsContent>

          {/* TAB: Versiones */}
          <TabsContent value="versions" className="space-y-5 mt-0">
            {/* Timeline */}
            <section className="border border-gray-200 rounded-lg bg-white p-5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">History</p>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Version timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200" />
                <div className="space-y-5">
                  {versions.map(version => (
                    <div key={version.id} className="flex gap-4">
                      <div className={cn("relative z-10 h-8 w-8 rounded-full flex items-center justify-center", version.status === "deployed" ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50" : version.status === "testing" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500")}>
                        {version.status === "deployed" ? <Rocket className="h-4 w-4" /> : version.status === "testing" ? <Zap className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{version.version}</span>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 capitalize", version.status === "deployed" && "bg-emerald-50 text-emerald-700 border-emerald-200", version.status === "archived" && "bg-gray-50 text-gray-600 border-gray-200")}>{version.status}</Badge>
                          <span className="text-xs text-gray-400">{format(version.date, "MMM d, yyyy")}</span>
                        </div>
                        <p className="text-xs text-gray-600">{version.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Comparison */}
            <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Comparison</p>
                <h3 className="text-sm font-medium text-gray-900">Version metrics</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {versions.map((version) => (
                  <div key={version.id} className={cn("flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors", version.status === "deployed" && "bg-emerald-50/30")}>
                    <span className="text-sm font-semibold text-gray-900 w-16">{version.version}</span>
                    <span className={cn("text-sm font-medium w-20 tabular-nums", version.metrics.accuracy >= 92 ? "text-emerald-600" : "text-gray-700")}>{version.metrics.accuracy}%</span>
                    <span className="text-sm text-gray-500 w-20 tabular-nums">{version.metrics.latency}ms</span>
                    <span className="text-sm text-gray-500 w-20 tabular-nums">${version.metrics.cost.toFixed(3)}</span>
                    <span className="text-xs text-gray-400 w-24">{format(version.date, "MMM d, yyyy")}</span>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 w-20 justify-center capitalize", version.status === "deployed" && "bg-emerald-50 text-emerald-700 border-emerald-200", version.status === "archived" && "bg-gray-50 text-gray-600 border-gray-200")}>{version.status}</Badge>
                  </div>
                ))}
              </div>
            </section>
            </TabsContent>
          </Tabs>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
