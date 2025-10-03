"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MOCK_ORG_DATA, ROLE_DESCRIPTIONS } from "@/lib/mock/organization-data"
import { OrganizationChart } from "@/components/organization-chart"
import { OrganizationList } from "@/components/organization-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

export default function OrganizationPage() {
  const [selectedView, setSelectedView] = useState<"chart" | "list">("chart")
  const [selectedLayer, setSelectedLayer] = useState<"strategy" | "execution" | "all">("all")

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
              <h1 className="text-2xl font-semibold text-gray-900">Organigrama</h1>
              <p className="text-gray-600 text-sm mt-1">
                Estructura organizacional del proyecto
              </p>
            </div>
            
            {/* Tabs for views */}
            <div className="flex gap-4">
              <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
                <TabsList>
                  <TabsTrigger value="chart">Org Chart</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {selectedView === "chart" && (
                <Tabs value={selectedLayer} onValueChange={(v) => setSelectedLayer(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">Completa</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="execution">Execution</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>

          {/* Role Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm border-t pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Roles:</span>
            </div>
            {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${role.color}`} />
                <span className="text-muted-foreground">{role.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Chart or List */}
        <div className="flex-1 overflow-hidden">
          {selectedView === "chart" ? (
            <OrganizationChart data={MOCK_ORG_DATA} view={selectedLayer} />
          ) : (
            <OrganizationList data={MOCK_ORG_DATA} />
          )}
        </div>
      </div>
    </div>
  )
}

