"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Zap,
  BarChart3,
  CheckCircle2,
  Play,
  Activity,
  Target,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  Gauge,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain,
  Shield,
  Settings,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OnboardingDeployProps {
  onNext: () => void
  onSkip: () => void
}

type PreviewTab = "automations" | "metrics" | "evals" | "costs"

// Simulated automations data
const AUTOMATIONS = [
  { 
    id: 1, 
    name: "Invoice Processing", 
    status: "live" as const,
    performance: 98,
    hoursSaved: 127,
    runs: 1243,
    lastRun: "2 min ago"
  },
  { 
    id: 2, 
    name: "Report Generator", 
    status: "deploying" as const,
    performance: null,
    hoursSaved: 0,
    runs: 0,
    lastRun: "Deploying..."
  },
  { 
    id: 3, 
    name: "Data Sync Bot", 
    status: "testing" as const,
    performance: 94,
    hoursSaved: 45,
    runs: 89,
    lastRun: "15 min ago"
  },
  { 
    id: 4, 
    name: "Email Classifier", 
    status: "pending" as const,
    performance: null,
    hoursSaved: 0,
    runs: 0,
    lastRun: "Not started"
  },
]

// Metrics data
const METRICS_DATA = [
  { label: "Hours Saved", value: 1247, change: 23, unit: "h", icon: Clock },
  { label: "ROI", value: 127, change: 15, unit: "%", icon: TrendingUp },
  { label: "Active Automations", value: 12, change: 3, unit: "", icon: Zap },
  { label: "Cost Reduction", value: 34500, change: 12, unit: "$", icon: DollarSign },
]

// Evals data
const EVALS_DATA = [
  { name: "Invoice Extraction", model: "GPT-4o", score: 97, samples: 1250, passRate: 98.2, status: "ok" as const },
  { name: "Email Classification", model: "Claude 3.5", score: 94, samples: 890, passRate: 95.1, status: "ok" as const },
  { name: "Data Validation", model: "GPT-4", score: 78, samples: 450, passRate: 82.4, status: "warning" as const },
  { name: "Report Summarizer", model: "Gemini Pro", score: 91, samples: 320, passRate: 93.7, status: "ok" as const },
]

// Cost data
const COSTS_DATA = [
  { bu: "Finance", current: 4250, prev: 3800, trend: "up" as const, provider: "OpenAI" },
  { bu: "Operations", current: 2890, prev: 3100, trend: "down" as const, provider: "AWS" },
  { bu: "Technology", current: 5670, prev: 5450, trend: "up" as const, provider: "Azure" },
  { bu: "HR", current: 1200, prev: 1200, trend: "stable" as const, provider: "Anthropic" },
]

// Mini chart component
function MiniChart({ data, color = "gray" }: { data: number[], color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={`w-1.5 rounded-full bg-${color}-400 min-h-[4px]`}
          style={{ 
            backgroundColor: color === "gray" ? "#9ca3af" : undefined,
            minHeight: "4px"
          }}
        />
      ))}
    </div>
  )
}

// Deploy Platform Preview
function DeployPreview({ activeTab, onChangeTab }: { 
  activeTab: PreviewTab
  onChangeTab: (tab: PreviewTab) => void 
}) {
  const [automations, setAutomations] = useState(AUTOMATIONS)
  const [deployProgress, setDeployProgress] = useState(0)
  const [metricsAnimated, setMetricsAnimated] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<number | null>(null)
  
  // Simulate deployment progress
  useEffect(() => {
    if (activeTab === "automations") {
      const interval = setInterval(() => {
        setDeployProgress(prev => {
          if (prev >= 100) {
            // Update automation status when complete
            setAutomations(current => 
              current.map(a => 
                a.id === 2 ? { ...a, status: "live" as const, performance: 96, lastRun: "Just now" } : a
              )
            )
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Animate metrics on tab change
  useEffect(() => {
    if (activeTab === "metrics") {
      setMetricsAnimated(true)
    }
  }, [activeTab])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Platform Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Sapira Deploy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: "automations", label: "Automations", icon: Zap },
          { id: "metrics", label: "Metrics", icon: BarChart3 },
          { id: "evals", label: "Evals", icon: Gauge },
          { id: "costs", label: "Costs", icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id as PreviewTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
              activeTab === tab.id 
                ? "text-gray-900 border-gray-900 bg-white" 
                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="h-[340px] overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Automations Tab */}
          {activeTab === "automations" && (
            <motion.div
              key="automations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 h-full overflow-auto"
            >
              <div className="space-y-2">
                {automations.map((automation, i) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedAutomation(selectedAutomation === automation.id ? null : automation.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedAutomation === automation.id 
                        ? "border-gray-300 bg-gray-50" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          automation.status === "live" ? "bg-green-500" :
                          automation.status === "deploying" ? "bg-blue-500 animate-pulse" :
                          automation.status === "testing" ? "bg-amber-500" : "bg-gray-300"
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{automation.name}</p>
                          <p className="text-[10px] text-gray-500">{automation.lastRun}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {automation.performance && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{automation.performance}%</p>
                            <p className="text-[10px] text-gray-500">accuracy</p>
                          </div>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${
                          automation.status === "live" ? "bg-green-50 text-green-700 border-green-200" :
                          automation.status === "deploying" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          automation.status === "testing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-gray-50 text-gray-600"
                        }`}>
                          {automation.status === "deploying" ? `${deployProgress}%` : automation.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    <AnimatePresence>
                      {selectedAutomation === automation.id && automation.status !== "pending" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
                            <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                              <p className="text-lg font-bold text-gray-900">{automation.hoursSaved}</p>
                              <p className="text-[9px] text-gray-500">Hours Saved</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                              <p className="text-lg font-bold text-gray-900">{automation.runs}</p>
                              <p className="text-[9px] text-gray-500">Total Runs</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                              <p className="text-lg font-bold text-gray-900">
                                ${((automation.hoursSaved || 0) * 45).toLocaleString()}
                              </p>
                              <p className="text-[9px] text-gray-500">Value</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Metrics Tab */}
          {activeTab === "metrics" && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 h-full"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {METRICS_DATA.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-[10px] font-medium">+{metric.change}%</span>
                      </div>
                    </div>
                    <motion.p 
                      className="text-xl font-bold text-gray-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      {metric.unit === "$" && "$"}
                      {metricsAnimated ? metric.value.toLocaleString() : 0}
                      {metric.unit !== "$" && metric.unit}
                    </motion.p>
                    <p className="text-[10px] text-gray-500">{metric.label}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Mini Chart */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-700">Weekly Performance</p>
                  <Badge variant="outline" className="text-[9px]">Last 7 days</Badge>
                </div>
                <div className="flex items-end justify-between h-16">
                  {[45, 52, 48, 61, 55, 67, 72].map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                      className="w-6 bg-gray-300 rounded-t-md"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <span key={i} className="text-[9px] text-gray-400 w-6 text-center">{day}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Evals Tab */}
          {activeTab === "evals" && (
            <motion.div
              key="evals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 h-full overflow-auto"
            >
              <div className="space-y-2">
                {EVALS_DATA.map((eval_, i) => (
                  <motion.div
                    key={eval_.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          eval_.status === "ok" ? "bg-green-500" : "bg-amber-500"
                        }`} />
                        <p className="font-medium text-gray-900 text-sm">{eval_.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-gray-50">
                        {eval_.model}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <motion.p 
                            className="text-lg font-bold text-gray-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                          >
                            {eval_.score}
                          </motion.p>
                          <Gauge className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-[9px] text-gray-500">Score</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{eval_.passRate}%</p>
                        <p className="text-[9px] text-gray-500">Pass Rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{eval_.samples}</p>
                        <p className="text-[9px] text-gray-500">Samples</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${eval_.score}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          eval_.status === "ok" ? "bg-green-500" : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Costs Tab */}
          {activeTab === "costs" && (
            <motion.div
              key="costs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 h-full overflow-auto"
            >
              {/* Total cost */}
              <div className="p-4 rounded-xl bg-gray-900 text-white mb-4">
                <p className="text-[10px] text-gray-400 mb-1">Total Monthly Cost</p>
                <div className="flex items-end justify-between">
                  <motion.p 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ${COSTS_DATA.reduce((sum, c) => sum + c.current, 0).toLocaleString()}
                  </motion.p>
                  <div className="flex items-center gap-1 text-green-400">
                    <ArrowDownRight className="w-3 h-3" />
                    <span className="text-xs">-8% vs last month</span>
                  </div>
                </div>
              </div>
              
              {/* By BU */}
              <div className="space-y-2">
                {COSTS_DATA.map((cost, i) => (
                  <motion.div
                    key={cost.bu}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Target className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cost.bu}</p>
                        <p className="text-[10px] text-gray-500">{cost.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${cost.current.toLocaleString()}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] ${
                        cost.trend === "down" ? "text-green-600" : 
                        cost.trend === "up" ? "text-red-500" : "text-gray-500"
                      }`}>
                        {cost.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                        {cost.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                        {cost.trend === "stable" && <span>—</span>}
                        <span>
                          {cost.trend === "stable" ? "stable" : 
                           `${Math.abs(Math.round((cost.current - cost.prev) / cost.prev * 100))}%`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Feature card
function FeatureCard({ icon: Icon, title, description, delay }: { 
  icon: React.ElementType
  title: string 
  description: string
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-white border border-gray-200">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <p className="font-medium text-gray-900 text-sm">{title}</p>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  )
}

export function OnboardingDeploy({ onNext, onSkip }: OnboardingDeployProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("automations")

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4 px-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-gray-100">
            <Rocket className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <h1 className="text-2xl font-light text-gray-900">
          <span className="font-semibold">Deploy</span> & Measure
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Ship automations with confidence and track real business impact
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left - Platform Preview */}
            <DeployPreview activeTab={activeTab} onChangeTab={setActiveTab} />
            
            {/* Right - Explanation */}
            <div className="space-y-4">
              {/* Active tab explanation */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                {activeTab === "automations" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Automations Pipeline</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Deploy your automations with a single click. Monitor their status, 
                      track performance, and roll back instantly if needed.
                    </p>
                    <div className="space-y-2">
                      {[
                        { icon: Play, text: "One-click deployment to production" },
                        { icon: RefreshCw, text: "Version control & instant rollback" },
                        { icon: Activity, text: "Real-time performance monitoring" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeTab === "metrics" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Business Metrics</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Track the real business impact of your automations. See hours saved, 
                      ROI, and cost reductions in real-time.
                    </p>
                    <div className="space-y-2">
                      {[
                        { icon: Clock, text: "Hours saved automatically calculated" },
                        { icon: TrendingUp, text: "ROI tracking per automation" },
                        { icon: DollarSign, text: "Cost reduction analysis" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeTab === "evals" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Gauge className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Model Evaluations</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Continuously evaluate AI model performance. Track accuracy scores, 
                      pass rates, and get alerts when quality drops.
                    </p>
                    <div className="space-y-2">
                      {[
                        { icon: Brain, text: "Multi-model performance tracking" },
                        { icon: Shield, text: "Quality gates & thresholds" },
                        { icon: AlertTriangle, text: "Automatic alerts on degradation" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeTab === "costs" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Cost Management</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Full visibility into automation costs. Track spending by BU, 
                      project, or provider with trend analysis.
                    </p>
                    <div className="space-y-2">
                      {[
                        { icon: Target, text: "Cost breakdown by business unit" },
                        { icon: TrendingUp, text: "Trend analysis & forecasting" },
                        { icon: Settings, text: "Budget alerts & controls" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
              
              {/* Additional features */}
              <div className="grid grid-cols-2 gap-3">
                <FeatureCard 
                  icon={Calendar}
                  title="Roadmap"
                  description="Gantt timeline of all automations"
                  delay={0.3}
                />
                <FeatureCard 
                  icon={Eye}
                  title="A/B Testing"
                  description="Compare automation variants"
                  delay={0.4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-3 px-8 border-t border-gray-100 bg-white"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onSkip} className="text-gray-500 h-9">
            Skip for now
          </Button>
          <Button
            onClick={onNext}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 gap-2 h-9"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
