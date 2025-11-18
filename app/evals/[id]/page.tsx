"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Download,
  MoreVertical,
  Calendar,
  Play,
  RefreshCw,
  AlertCircle,
  Target,
  Activity,
  Eye,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/context/auth-context"
import { format, parseISO } from "date-fns"
import { useRouter, useParams } from "next/navigation"

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
  input?: string
  output?: string
  expected?: string
  metadata?: Record<string, any>
}

// Mock data generator
const generateMockEvaluation = (id: string): Evaluation => {
  const totalRuns = Math.floor(Math.random() * 100) + 10
  const passedRuns = Math.floor(totalRuns * (0.6 + Math.random() * 0.3))
  
  return {
    id,
    name: `Evaluation ${id}`,
    description: "Test evaluation for accuracy metrics with comprehensive test cases",
    status: "passed" as EvalStatus,
    type: "accuracy" as EvalType,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalRuns,
    passedRuns,
    failedRuns: totalRuns - passedRuns,
    passRate: (passedRuns / totalRuns) * 100,
    avgLatency: Math.random() * 500 + 100,
    avgCost: Math.random() * 0.1 + 0.01,
    createdBy: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
    },
    tags: ["production", "critical"],
  }
}

const generateMockRuns = (evalId: string, count: number): EvalRun[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `run-${i + 1}`,
    evalId,
    status: Math.random() > 0.3 ? "passed" : "failed" as EvalStatus,
    score: Math.random() * 100,
    latency: Math.random() * 500 + 100,
    cost: Math.random() * 0.1 + 0.01,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    input: `Test input ${i + 1}`,
    output: `Test output ${i + 1}`,
    expected: `Expected output ${i + 1}`,
    metadata: {
      model: "gpt-4",
      temperature: 0.7,
    },
  }))
}

export default function EvalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const evalId = params.id as string
  const { currentOrg } = useAuth()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [runs, setRuns] = useState<EvalRun[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockEval = generateMockEvaluation(evalId)
      const mockRuns = generateMockRuns(evalId, mockEval.totalRuns)
      setEvaluation(mockEval)
      setRuns(mockRuns)
      setLoading(false)
    }

    if (evalId) {
      loadData()
    }
  }, [evalId])

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

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center h-full">
            <Spinner className="h-8 w-8" />
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  if (!evaluation) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <PageHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Evaluation Not Found</h1>
              </div>
            </div>
          </PageHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Evaluation not found</p>
              <Button onClick={() => router.push("/evals")} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Evaluations
              </Button>
            </div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    )
  }

  const passedRuns = runs.filter(r => r.status === "passed")
  const failedRuns = runs.filter(r => r.status === "failed")
  const avgScore = runs.reduce((sum, r) => sum + (r.score || 0), 0) / runs.length || 0
  const avgLatency = runs.reduce((sum, r) => sum + (r.latency || 0), 0) / runs.length || 0
  const avgCost = runs.reduce((sum, r) => sum + (r.cost || 0), 0) / runs.length || 0

  return (
    <ResizableAppShell>
      <ResizablePageSheet>
        <PageHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/evals")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-semibold text-foreground">{evaluation.name}</h1>
                  {getStatusBadge(evaluation.status)}
                </div>
                {evaluation.description && (
                  <p className="text-sm text-muted-foreground">{evaluation.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PageHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium">Total Runs</CardDescription>
                <CardTitle className="text-2xl font-bold">{evaluation.totalRuns}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  <span>{passedRuns.length} passed, {failedRuns.length} failed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium">Pass Rate</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {evaluation.passRate.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{evaluation.passedRuns} / {evaluation.totalRuns} runs</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium">Avg Score</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {avgScore.toFixed(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Average across runs</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium">Avg Latency</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {avgLatency.toFixed(0)}ms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Response time</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Runs ({runs.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                      <Badge variant="outline">{evaluation.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">{format(evaluation.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                      <p className="text-sm">{format(evaluation.updatedAt, "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                    {evaluation.createdBy && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Created By</p>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            {evaluation.createdBy.avatar_url && (
                              <AvatarImage src={evaluation.createdBy.avatar_url} />
                            )}
                            <AvatarFallback>
                              {evaluation.createdBy.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{evaluation.createdBy.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {evaluation.tags && evaluation.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="runs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Runs</CardTitle>
                      <CardDescription>
                        {runs.length} total runs
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {runs.slice(0, 20).map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(run.status)}
                            {run.score !== undefined && (
                              <span className="text-sm font-medium">Score: {run.score.toFixed(1)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {run.latency && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{run.latency.toFixed(0)}ms</span>
                              </div>
                            )}
                            {run.cost && (
                              <div className="flex items-center gap-1">
                                <span>${run.cost.toFixed(4)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(run.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics charts coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

