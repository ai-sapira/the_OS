"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Activity,
  RefreshCw,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Mock data for charts
  const leadTimeData = [
    { name: "Ene", leadTime: 4.2, cycleTime: 2.1 },
    { name: "Feb", leadTime: 3.8, cycleTime: 1.9 },
    { name: "Mar", leadTime: 4.5, cycleTime: 2.3 },
    { name: "Abr", leadTime: 3.2, cycleTime: 1.7 },
    { name: "May", leadTime: 3.9, cycleTime: 2.0 },
    { name: "Jun", leadTime: 3.1, cycleTime: 1.8 },
  ]

  const throughputData = [
    { name: "Sem 1", completed: 12, created: 15 },
    { name: "Sem 2", completed: 18, created: 14 },
    { name: "Sem 3", completed: 15, created: 16 },
    { name: "Sem 4", completed: 22, created: 18 },
    { name: "Sem 5", completed: 19, created: 20 },
    { name: "Sem 6", completed: 25, created: 22 },
  ]

  const departmentROI = [
    { name: "Tecnología", roi: 28, color: "#2563eb" },
    { name: "Marketing", roi: 35, color: "#2563eb" },
    { name: "Ventas", roi: 42, color: "#2563eb" },
    { name: "RRHH", roi: 18, color: "#2563eb" },
    { name: "Finanzas", roi: 22, color: "#2563eb" },
  ]

  const slaComplianceData = [
    { name: "Ene", sla: 92 },
    { name: "Feb", sla: 94 },
    { name: "Mar", sla: 89 },
    { name: "Abr", sla: 96 },
    { name: "May", sla: 93 },
    { name: "Jun", sla: 95 },
  ]

  const reworkData = [
    { name: "Tecnología", rework: 8.5 },
    { name: "Marketing", rework: 5.2 },
    { name: "Ventas", rework: 6.8 },
    { name: "RRHH", rework: 4.1 },
    { name: "Finanzas", rework: 3.9 },
  ]

  const kpiCards = [
    {
      title: "Lead Time Promedio",
      value: "3.6 días",
      change: -8.2,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Cycle Time Promedio",
      value: "1.9 días",
      change: -12.5,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "ROI Promedio",
      value: "+29%",
      change: 5.3,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "SLA Compliance",
      value: "94.2%",
      change: 2.1,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Throughput Semanal",
      value: "19.8",
      change: 15.7,
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Rework Rate",
      value: "5.7%",
      change: -18.3,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-gray-600" />
    if (change < 0) return <ArrowDown className="h-3 w-3 text-gray-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-gray-600"
    if (change < 0) return "text-gray-600"
    return "text-gray-400"
  }

  const departments = [
    { value: "all", label: "Todos los departamentos" },
    { value: "tech", label: "Tecnología" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Ventas" },
    { value: "hr", label: "Recursos Humanos" },
    { value: "finance", label: "Finanzas" },
  ]

  const timeRanges = [
    { value: "7d", label: "Últimos 7 días" },
    { value: "30d", label: "Últimos 30 días" },
    { value: "90d", label: "Últimos 90 días" },
    { value: "1y", label: "Último año" },
  ]

  return (
    <div className="h-screen w-screen bg-background grid overflow-hidden transition-all duration-200 grid-cols-[256px_1px_1fr]">
      {/* Sidebar */}
      <div className="bg-white border-r border-gray-200 h-full overflow-hidden">
        <Sidebar />
      </div>

      {/* Separator */}
      <div className="bg-gray-200 w-px" />

      {/* Main Content */}
      <div className="bg-white h-full flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="px-6 py-6 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Metrics</h1>
              <p className="text-gray-600 text-sm mt-1">
                Panel consolidado de KPIs y métricas de rendimiento
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map((kpi, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-semibold">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(kpi.change)}
                    <span className={`text-xs ${getChangeColor(kpi.change)}`}>
                      {Math.abs(kpi.change)}% vs mes anterior
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Time & Cycle Time */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Lead Time vs Cycle Time</h3>
                <Badge variant="outline">Días</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={leadTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="leadTime" stroke="#2563eb" strokeWidth={2} name="Lead Time" />
                  <Line type="monotone" dataKey="cycleTime" stroke="#64748b" strokeWidth={2} name="Cycle Time" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Throughput */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Throughput Semanal</h3>
                <Badge variant="outline">Tickets</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="completed" fill="#2563eb" name="Completados" />
                  <Bar dataKey="created" fill="#e5e7eb" name="Creados" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* ROI by Department */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">ROI por Departamento</h3>
                <Badge variant="outline">%</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentROI} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-muted-foreground" />
                  <YAxis dataKey="name" type="category" className="text-muted-foreground" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="roi" fill="#2563eb" name="ROI %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* SLA Compliance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">SLA Compliance</h3>
                <Badge variant="outline">%</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={slaComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis domain={[80, 100]} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="sla" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} name="SLA %" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rework Rate */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rework Rate</h3>
                <Badge variant="outline">%</Badge>
              </div>
              <div className="space-y-4">
                {reworkData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600 rounded-full"
                          style={{ width: `${(item.rework / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{item.rework}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Performers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Marketing</p>
                    <p className="text-sm text-muted-foreground">Mejor SLA compliance</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">98%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Ventas</p>
                    <p className="text-sm text-muted-foreground">Mayor ROI</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">+42%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Finanzas</p>
                    <p className="text-sm text-muted-foreground">Menor rework rate</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">3.9%</Badge>
                </div>
              </div>
            </Card>

            {/* Recent Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Insights Recientes</h3>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-600 bg-blue-50">
                  <p className="text-sm font-medium">Mejora en Lead Time</p>
                  <p className="text-xs text-muted-foreground">Reducción del 15% en los últimos 30 días</p>
                </div>
                <div className="p-3 border-l-4 border-gray-500 bg-gray-50">
                  <p className="text-sm font-medium">SLA en riesgo</p>
                  <p className="text-xs text-muted-foreground">Tecnología por debajo del objetivo (90%)</p>
                </div>
                <div className="p-3 border-l-4 border-blue-600 bg-blue-50">
                  <p className="text-sm font-medium">Throughput estable</p>
                  <p className="text-xs text-muted-foreground">Crecimiento sostenido del 8% mensual</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
