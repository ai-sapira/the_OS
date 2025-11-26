"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  Download,
  Plus,
  AlertCircle,
  ChevronRight,
  LayoutGrid,
  List,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/context/auth-context"
import { format, subDays } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Types
type EvalStatus = "ok" | "warning" | "critical"

interface EvalInitiative {
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
  lastEvalRun: Date
  samplesHITL: number
  totalRuns: number
  passRate: number
}

interface Project {
  id: string
  name: string
  businessUnit: string
  initiatives: EvalInitiative[]
}

// Mock data
const generateMockData = (): { projects: Project[], initiatives: EvalInitiative[] } => {
  const modelProviders = ["OpenAI", "Anthropic", "Google", "Azure", "Mistral"]
  const modelNames = ["gpt-4o", "claude-3.5-sonnet", "gemini-pro", "gpt-4-turbo", "mistral-large"]
  
  const projects: Project[] = [
    { id: "proj-1", name: "Customer Support AI", businessUnit: "Operations", initiatives: [] },
    { id: "proj-2", name: "Sales Assistant", businessUnit: "Sales", initiatives: [] },
    { id: "proj-3", name: "Marketing Content Generator", businessUnit: "Marketing", initiatives: [] },
    { id: "proj-4", name: "Financial Analysis Bot", businessUnit: "Finance", initiatives: [] },
    { id: "proj-5", name: "HR Onboarding Assistant", businessUnit: "HR", initiatives: [] },
  ]

  const initiativeTemplates = [
    { name: "Chat Completions", desc: "Main conversational interface" },
    { name: "Document Summarization", desc: "Extract key information from docs" },
    { name: "Classification Engine", desc: "Categorize incoming requests" },
    { name: "RAG Pipeline", desc: "Retrieval-augmented generation" },
    { name: "Translation Service", desc: "Multi-language translation" },
    { name: "Sentiment Analysis", desc: "Analyze customer feedback sentiment" },
    { name: "Code Review Bot", desc: "Automated code review suggestions" },
    { name: "Email Drafting", desc: "Automated email response generation" },
  ]

  const initiatives: EvalInitiative[] = []

  projects.forEach((project, pIdx) => {
    const numInitiatives = Math.floor(Math.random() * 3) + 2
    
    for (let i = 0; i < numInitiatives; i++) {
      const template = initiativeTemplates[(pIdx * 2 + i) % initiativeTemplates.length]
      const scoreGlobal = Math.floor(Math.random() * 30) + 70
      const status: EvalStatus = scoreGlobal >= 90 ? "ok" : scoreGlobal >= 75 ? "warning" : "critical"
      
      const initiative: EvalInitiative = {
        id: `init-${pIdx}-${i}`,
        projectId: project.id,
        projectName: project.name,
        businessUnit: project.businessUnit,
        name: template.name,
        description: template.desc,
        model: {
          provider: modelProviders[Math.floor(Math.random() * modelProviders.length)],
          name: modelNames[Math.floor(Math.random() * modelNames.length)],
          version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
        },
        scoreGlobal,
        status,
        lastEvalRun: subDays(new Date(), Math.floor(Math.random() * 7)),
        samplesHITL: Math.floor(Math.random() * 50) + 5,
        totalRuns: Math.floor(Math.random() * 500) + 100,
        passRate: scoreGlobal + Math.random() * 5 - 2.5,
      }
      
      initiatives.push(initiative)
      project.initiatives.push(initiative)
    }
  })

  return { projects, initiatives }
}

export default function EvalsPage() {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [data, setData] = useState<{ projects: Project[], initiatives: EvalInitiative[] }>({ projects: [], initiatives: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("7d")
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setData(generateMockData())
      setLoading(false)
    }
    loadData()
  }, [currentOrg?.organization?.id])

  const filteredInitiatives = data.initiatives.filter(initiative => {
    const matchesSearch = 
      initiative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.model.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBU = businessUnitFilter === "all" || initiative.businessUnit === businessUnitFilter
    const matchesProject = projectFilter === "all" || initiative.projectId === projectFilter
    const matchesModel = modelFilter === "all" || initiative.model.name === modelFilter
    
    return matchesSearch && matchesBU && matchesProject && matchesModel
  })

  const groupedByProject = filteredInitiatives.reduce((acc, initiative) => {
    if (!acc[initiative.projectId]) {
      acc[initiative.projectId] = {
        projectId: initiative.projectId,
        projectName: initiative.projectName,
        businessUnit: initiative.businessUnit,
        initiatives: []
      }
    }
    acc[initiative.projectId].initiatives.push(initiative)
    return acc
  }, {} as Record<string, { projectId: string, projectName: string, businessUnit: string, initiatives: EvalInitiative[] }>)

  const businessUnits = [...new Set(data.initiatives.map(i => i.businessUnit))]
  const models = [...new Set(data.initiatives.map(i => i.model.name))]

  const getStatusBadge = (status: EvalStatus) => {
    const config = {
      ok: { label: "OK", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      warning: { label: "Warning", className: "bg-amber-50 text-amber-700 border-amber-200" },
      critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" },
    }
    const { label, className } = config[status]
    return (
      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 font-medium", className)}>
        {label}
      </Badge>
    )
  }

  const getScorePill = (score: number) => {
    const color = score >= 90 
      ? "bg-emerald-100 text-emerald-800"
      : score >= 75 
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800"
    
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold", color)}>
        {score.toFixed(1)}
      </span>
    )
  }

  return (
    <ResizableAppShell onOpenCommandPalette={() => setCommandPaletteOpen(true)}>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Pharo</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-900">Evals</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-8 bg-gray-900 hover:bg-gray-800 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  New Eval
                </Button>
              </div>
            </div>
          </PageHeader>
        }
        toolbar={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search initiatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 w-[220px] bg-gray-50 border-gray-200 border-dashed rounded-lg focus:bg-white text-sm"
                />
              </div>
              
              <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                <SelectTrigger className="w-[130px] h-8 bg-gray-50 border-gray-200 border-dashed text-sm">
                  <SelectValue placeholder="Business Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All BUs</SelectItem>
                  {businessUnits.map(bu => (
                    <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[150px] h-8 bg-gray-50 border-gray-200 border-dashed text-sm">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {data.projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[130px] h-8 bg-gray-50 border-gray-200 border-dashed text-sm">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[120px] h-8 bg-gray-50 border-gray-200 border-dashed text-sm">
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

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 px-3 rounded-md text-xs", viewMode === "grouped" && "bg-white shadow-sm")}
                onClick={() => setViewMode("grouped")}
              >
                <LayoutGrid className="h-4 w-4 mr-1.5" />
                Grouped
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 px-3 rounded-md text-xs", viewMode === "flat" && "bg-white shadow-sm")}
                onClick={() => setViewMode("flat")}
              >
                <List className="h-4 w-4 mr-1.5" />
                Flat
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredInitiatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No initiatives found</h3>
              <p className="text-xs text-gray-500">
                {searchQuery || businessUnitFilter !== "all" || projectFilter !== "all" || modelFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first initiative to get started"}
              </p>
            </div>
          ) : viewMode === "grouped" ? (
            <div className="space-y-4">
              {Object.values(groupedByProject).map(group => (
                <section key={group.projectId} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  {/* Project Header */}
                  <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{group.businessUnit}</p>
                        <h2 className="text-sm font-semibold text-gray-900">{group.projectName}</h2>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200">
                        {group.initiatives.length} initiative{group.initiatives.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Initiatives List */}
                  <div className="divide-y divide-gray-50">
                    {group.initiatives.map(initiative => (
                      <div
                        key={initiative.id}
                        className="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/evals/${initiative.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 truncate">
                                {initiative.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {initiative.model.provider} / {initiative.model.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center">
                              <p className="text-[10px] text-gray-400 uppercase">Score</p>
                              {getScorePill(initiative.scoreGlobal)}
                            </div>
                            <div className="text-center w-16">
                              <p className="text-[10px] text-gray-400 uppercase">Status</p>
                              {getStatusBadge(initiative.status)}
                            </div>
                            <div className="text-center w-24">
                              <p className="text-[10px] text-gray-400 uppercase">Last Eval</p>
                              <p className="text-xs text-gray-600">{format(initiative.lastEvalRun, "MMM d, HH:mm")}</p>
                            </div>
                            <div className="text-center w-12">
                              <p className="text-[10px] text-gray-400 uppercase">HITL</p>
                              <p className="text-xs text-gray-600">{initiative.samplesHITL}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Flat View */
            <section className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">All</p>
                    <h2 className="text-sm font-semibold text-gray-900">Initiatives</h2>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 border-gray-200">
                    {filteredInitiatives.length} total
                  </Badge>
                </div>
              </div>
              
              <div className="divide-y divide-gray-50">
                {filteredInitiatives.map(initiative => (
                  <div
                    key={initiative.id}
                    className="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/evals/${initiative.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border-gray-200 shrink-0">
                              {initiative.businessUnit}
                            </Badge>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 truncate">
                              {initiative.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {initiative.projectName} · {initiative.model.provider} / {initiative.model.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Score</p>
                          {getScorePill(initiative.scoreGlobal)}
                        </div>
                        <div className="text-center w-16">
                          <p className="text-[10px] text-gray-400 uppercase">Status</p>
                          {getStatusBadge(initiative.status)}
                        </div>
                        <div className="text-center w-24">
                          <p className="text-[10px] text-gray-400 uppercase">Last Eval</p>
                          <p className="text-xs text-gray-600">{format(initiative.lastEvalRun, "MMM d, HH:mm")}</p>
                        </div>
                        <div className="text-center w-12">
                          <p className="text-[10px] text-gray-400 uppercase">HITL</p>
                          <p className="text-xs text-gray-600">{initiative.samplesHITL}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
