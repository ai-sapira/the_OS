"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  CheckCircle2,
  Play,
  Activity,
  Target,
  DollarSign,
  AlertTriangle,
  Check,
  RefreshCw,
  ChevronRight,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Shield,
  Settings,
  GitBranch,
  Loader2,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OnboardingDeployProps {
  onNext: () => void
  onSkip: () => void
}

type PreviewTab = "automations" | "metrics" | "evals" | "costs"

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, delay: number = 0, active: boolean = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  
  useEffect(() => {
    if (!active) return
    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay, active])
  
  useEffect(() => {
    if (!started || !active) return
    
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, started, active])
  
  return count
}

// Pipeline Steps Component - The interactive CI/CD visualization
function PipelineSteps({ deployProgress }: { deployProgress: number }) {
  const PIPELINE_STEPS = ["Build", "Test", "Stage", "Deploy"]
  
  const getStepStatus = (stepIndex: number) => {
    const threshold = (stepIndex + 1) * 25
    if (deployProgress >= threshold) return "complete"
    if (deployProgress >= stepIndex * 25) return "current"
    return "pending"
  }
  
  return (
    <div className="relative mb-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        
        {/* Progress line */}
        <motion.div
          className="absolute left-0 top-1/2 h-1 bg-gray-900 -translate-y-1/2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${deployProgress}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Steps */}
        {PIPELINE_STEPS.map((step, i) => {
          const status = getStepStatus(i)
          
          return (
            <motion.div
              key={step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  status === "complete" 
                    ? "bg-gray-900 text-white shadow-sm" 
                    : status === "current"
                    ? "bg-white border-2 border-gray-900 text-gray-900"
                    : "bg-white border-2 border-gray-200 text-gray-400"
                }`}
                animate={status === "current" ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {status === "complete" ? (
                  <Check className="w-4 h-4" />
                ) : status === "current" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </motion.div>
              <span className={`mt-1.5 text-[10px] font-medium ${
                status === "complete" ? "text-gray-900" : 
                status === "current" ? "text-gray-700" : "text-gray-400"
              }`}>
                {step}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Simulated automations data
const AUTOMATIONS = [
  { id: 1, name: "Invoice Processing", status: "live" as const, performance: 98, hoursSaved: 127, runs: 1243 },
  { id: 2, name: "Report Generator", status: "deploying" as const, performance: null, hoursSaved: 0, runs: 0 },
  { id: 3, name: "Data Sync Bot", status: "testing" as const, performance: 94, hoursSaved: 45, runs: 89 },
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
  { name: "Invoice Extraction", model: "GPT-4o", score: 97, samples: 1250, status: "ok" as const },
  { name: "Email Classification", model: "Claude 3.5", score: 94, samples: 890, status: "ok" as const },
  { name: "Data Validation", model: "GPT-4", score: 78, samples: 450, status: "warning" as const },
  { name: "Report Summarizer", model: "Gemini Pro", score: 91, samples: 320, status: "ok" as const },
]

// Cost data
const COSTS_DATA = [
  { bu: "Finance", current: 4250, prev: 3800, trend: "up" as const, provider: "OpenAI" },
  { bu: "Operations", current: 2890, prev: 3100, trend: "down" as const, provider: "AWS" },
  { bu: "Technology", current: 5670, prev: 5450, trend: "up" as const, provider: "Azure" },
  { bu: "HR", current: 1200, prev: 1200, trend: "stable" as const, provider: "Anthropic" },
]

// Deploy Platform Preview with Pipeline
function DeployPreview({ activeTab, onChangeTab }: { 
  activeTab: PreviewTab
  onChangeTab: (tab: PreviewTab) => void 
}) {
  const [automations, setAutomations] = useState(AUTOMATIONS)
  const [deployProgress, setDeployProgress] = useState(0)
  const [selectedAutomation, setSelectedAutomation] = useState<number | null>(null)
  
  // Simulate deployment progress
  useEffect(() => {
    if (activeTab === "automations") {
      const interval = setInterval(() => {
        setDeployProgress(prev => {
          if (prev >= 100) {
            setAutomations(current => 
              current.map(a => 
                a.id === 2 ? { ...a, status: "live" as const, performance: 96 } : a
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Simulated Sidebar + Content */}
      <div className="flex h-[400px]">
        {/* Mini Sidebar */}
        <div className="w-12 bg-gray-50 border-r border-gray-100 py-3 flex flex-col items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <div className="w-full h-px bg-gray-200 my-1" />
          {[
            { id: "automations", icon: Zap },
            { id: "metrics", icon: BarChart3 },
            { id: "evals", icon: Gauge },
            { id: "costs", icon: DollarSign },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onChangeTab(tab.id as PreviewTab)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeTab === tab.id ? "bg-white shadow-sm border border-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-gray-900" : "text-gray-400"}`} />
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Automations Tab with Pipeline */}
            {activeTab === "automations" && (
              <motion.div
                key="automations"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Automations Pipeline</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {automations.filter(a => a.status === "live").length} Live
                  </Badge>
                </div>
                
                <div className="p-4">
                  {/* Interactive Pipeline */}
                  <PipelineSteps deployProgress={deployProgress} />
                  
                  {/* Automations List */}
                  <div className="space-y-2 mt-2">
                    {automations.map((automation, i) => (
                      <motion.div
                        key={automation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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
                              automation.status === "live" ? "bg-gray-900" :
                              automation.status === "deploying" ? "bg-gray-400 animate-pulse" :
                              "bg-gray-400"
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{automation.name}</p>
                              <p className="text-[10px] text-gray-500">
                                {automation.status === "deploying" ? "Deploying..." : 
                                 automation.status === "live" ? `${automation.runs} runs` : "Testing"}
                              </p>
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
                              automation.status === "live" ? "bg-gray-100 text-gray-700 border-gray-200" :
                              "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                              {automation.status === "deploying" ? `${deployProgress}%` : automation.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        <AnimatePresence>
                          {selectedAutomation === automation.id && automation.status === "live" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                                <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                                  <p className="text-base font-bold text-gray-900">{automation.hoursSaved}h</p>
                                  <p className="text-[9px] text-gray-500">Saved</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                                  <p className="text-base font-bold text-gray-900">{automation.runs}</p>
                                  <p className="text-[9px] text-gray-500">Runs</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-white border border-gray-100">
                                  <p className="text-base font-bold text-gray-900">
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
                </div>
              </motion.div>
            )}

            {/* Metrics Tab with Animated Counters */}
            {activeTab === "metrics" && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Business Impact</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">This month</Badge>
                </div>
                <MetricsContent />
              </motion.div>
            )}

            {/* Evals Tab with Score Panel */}
            {activeTab === "evals" && (
              <motion.div
                key="evals"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full overflow-auto"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Quality Lab</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">4 models</Badge>
                </div>
                <EvalsContent />
              </motion.div>
            )}

            {/* Costs Tab */}
            {activeTab === "costs" && (
              <motion.div
                key="costs"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full overflow-auto"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Cost Intelligence</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">4 BUs</Badge>
                </div>
                <CostsContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Metrics Content with animated counters
function MetricsContent() {
  const hoursSaved = useAnimatedCounter(1247, 1500, 200, true)
  const roi = useAnimatedCounter(127, 1500, 300, true)
  const costReduction = useAnimatedCounter(34500, 2000, 400, true)
  const automations = useAnimatedCounter(12, 1000, 100, true)
  
  return (
    <div className="p-4">
      {/* Animated Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Hours Saved", value: hoursSaved, suffix: "h", change: "+23%", icon: Clock },
          { label: "ROI", value: roi, suffix: "%", change: "+15%", icon: TrendingUp },
          { label: "Cost Reduction", value: costReduction, prefix: "$", change: "+12%", icon: DollarSign },
          { label: "Automations", value: automations, suffix: "", change: "+3", icon: Zap },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-1 text-gray-600">
                <ArrowUpRight className="w-3 h-3" />
                <span className="text-[10px] font-medium">{metric.change}</span>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {metric.prefix}{metric.value.toLocaleString()}{metric.suffix}
            </p>
            <p className="text-[10px] text-gray-500">{metric.label}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Weekly Chart */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-700">Weekly Performance</p>
          <Badge variant="outline" className="text-[9px]">+38%</Badge>
        </div>
        <div className="flex items-end justify-between h-16">
          {[45, 52, 48, 61, 55, 67, 72].map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
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
    </div>
  )
}

// Evals Content with overall score
function EvalsContent() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-5 gap-3">
        {/* Evals List */}
        <div className="col-span-3 space-y-2">
          {EVALS_DATA.map((eval_, i) => (
            <motion.div
              key={eval_.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-xl border transition-all ${
                eval_.status === "warning" ? "border-gray-300" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    eval_.status === "ok" ? "bg-gray-900" : "bg-gray-400"
                  }`} />
                  <p className="font-medium text-gray-900 text-xs">{eval_.name}</p>
                </div>
                <Badge variant="outline" className="text-[8px] bg-gray-50">
                  {eval_.model}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{eval_.score}%</span>
                <span className="text-[10px] text-gray-500">{eval_.samples} samples</span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${eval_.score}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`h-full rounded-full ${
                    eval_.status === "ok" ? "bg-gray-900" : "bg-gray-400"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Overall Score Panel */}
        <div className="col-span-2 space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gray-900 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300 text-[10px] font-medium">Overall</span>
            </div>
            <div className="text-3xl font-bold">92.4%</div>
            <p className="text-gray-400 text-[10px]">Across all evals</p>
          </motion.div>
          
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-medium text-gray-700 mb-2">Quality Gates</p>
            <div className="space-y-2">
              {[
                { label: "Accuracy", value: "94.2%", ok: true },
                { label: "Latency", value: "245ms", ok: true },
                { label: "Consistency", value: "89.1%", ok: false },
              ].map((gate, i) => (
                <div key={gate.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">{gate.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-gray-900">{gate.value}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${gate.ok ? "bg-gray-900" : "bg-gray-400"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Costs Content with stacked bar
function CostsContent() {
  const total = COSTS_DATA.reduce((sum, c) => sum + c.current, 0)
  
  return (
    <div className="p-4">
      {/* Total cost card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gray-900 text-white mb-4"
      >
        <p className="text-[10px] text-gray-400 mb-1">Total Monthly Cost</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold">${total.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-gray-300">
            <ArrowDownRight className="w-3 h-3" />
            <span className="text-xs">-8% vs last</span>
          </div>
        </div>
      </motion.div>
      
      {/* Stacked bar visualization */}
      <div className="mb-4">
        <div className="h-4 rounded-full overflow-hidden flex">
          {COSTS_DATA.map((cost, i) => {
            const width = (cost.current / total) * 100
            const shades = ["bg-gray-900", "bg-gray-700", "bg-gray-500", "bg-gray-300"]
            return (
              <motion.div
                key={cost.bu}
                className={`h-full ${shades[i]}`}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              />
            )
          })}
        </div>
      </div>
      
      {/* BU breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {COSTS_DATA.map((cost, i) => {
          const shades = ["bg-gray-900", "bg-gray-700", "bg-gray-500", "bg-gray-300"]
          return (
            <motion.div
              key={cost.bu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-3 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${shades[i]}`} />
                <span className="text-xs font-medium text-gray-900">{cost.bu}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">${cost.current.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500">{cost.provider}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Tab explanation cards
function TabExplanation({ activeTab }: { activeTab: PreviewTab }) {
  const content = {
    automations: {
      title: "Automations Pipeline",
      description: "Deploy your automations with a single click. Monitor their status, track performance, and roll back instantly if needed.",
      features: [
        { icon: Play, text: "One-click deployment" },
        { icon: RefreshCw, text: "Version control & rollback" },
        { icon: Activity, text: "Real-time monitoring" },
      ]
    },
    metrics: {
      title: "Business Impact",
      description: "Track the real business impact of your automations. See hours saved, ROI, and cost reductions.",
      features: [
        { icon: Clock, text: "Hours saved tracking" },
        { icon: TrendingUp, text: "ROI per automation" },
        { icon: DollarSign, text: "Cost analysis" },
      ]
    },
    evals: {
      title: "Quality Assurance",
      description: "Continuously evaluate AI model performance. Track accuracy scores and get alerts when quality drops.",
      features: [
        { icon: Brain, text: "Multi-model tracking" },
        { icon: Shield, text: "Quality gates" },
        { icon: AlertTriangle, text: "Auto alerts" },
      ]
    },
    costs: {
      title: "Cost Management",
      description: "Full visibility into automation costs. Track spending by BU, project, or provider.",
      features: [
        { icon: Target, text: "Cost by BU" },
        { icon: TrendingUp, text: "Trend analysis" },
        { icon: Settings, text: "Budget controls" },
      ]
    }
  }

  const c = content[activeTab]

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
    >
      <h4 className="font-semibold text-gray-900 mb-1">{c.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{c.description}</p>
      <div className="flex flex-wrap gap-3">
        {c.features.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
            <f.icon className="w-3.5 h-3.5" />
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Entity tabs
function DeployTabs({ active, onChange }: { active: PreviewTab, onChange: (v: PreviewTab) => void }) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      {[
        { id: "automations", label: "Automations", icon: Zap },
        { id: "metrics", label: "Metrics", icon: BarChart3 },
        { id: "evals", label: "Evals", icon: Gauge },
        { id: "costs", label: "Costs", icon: DollarSign },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as PreviewTab)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
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
        className="pt-6 pb-3 px-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gray-100">
            <Rocket className="w-4 h-4 text-gray-600" />
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
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Tabs */}
          <DeployTabs active={activeTab} onChange={setActiveTab} />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left - Platform Preview */}
            <DeployPreview activeTab={activeTab} onChangeTab={setActiveTab} />
            
            {/* Right - Description + Features */}
            <div className="space-y-4">
              <TabExplanation activeTab={activeTab} />
              
              {/* Additional features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100">
                      <GitBranch className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Version Control</p>
                  </div>
                  <p className="text-xs text-gray-500">Track all automation versions and rollback instantly</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Quality Gates</p>
                  </div>
                  <p className="text-xs text-gray-500">Ensure quality before deploying to production</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Deploy Summary</h4>
                  <Badge variant="outline" className="text-[10px]">Live</Badge>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Automations deployed", value: "12" },
                    { label: "Avg. accuracy", value: "94.2%" },
                    { label: "Total hours saved", value: "1,247h" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                    >
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
