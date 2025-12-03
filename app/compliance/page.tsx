"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format, subDays } from "date-fns"
import { motion } from "framer-motion"
import {
  Shield,
  SearchIcon,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar,
  User,
  Building2,
  Target,
  ListFilter,
  SettingsIcon,
  X,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/context/auth-context"
import { IssuesAPI, IssueWithRelations } from "@/lib/api/initiatives"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GenerateReportModal } from "@/components/generate-report-modal"

// Types
type RiskStatus = "ok" | "warning" | "critical"

interface ComplianceInitiative {
  id: string
  businessUnit: string
  project: string
  initiative: string
  slug: string
  globalScore: number
  status: RiskStatus
  openRisks: number
  maxRiskLevel: RiskStatus
  lastReview: Date
  owner: {
    id: string
    name: string
    initials: string
    avatar_url?: string
  }
}

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

// Transform issues to compliance data
const issuesToCompliance = (issues: IssueWithRelations[]): ComplianceInitiative[] => {
  return issues.map((issue) => {
    // Use issue ID as seed for consistent random values
    const seed = issue.id
    const score = seededRandom(seed + 'score', 30, 100)
    
    let status: RiskStatus = "ok"
    if (score < 50) status = "critical"
    else if (score < 75) status = "warning"
    
    const openRisks = status === "critical" ? seededRandom(seed + 'risks', 3, 8) : 
                      status === "warning" ? seededRandom(seed + 'risks', 1, 4) : 
                      seededRandom(seed + 'risks', 0, 2)
    
    // Get owner info from assignee or reporter
    const ownerUser = issue.assignee || issue.reporter
    const ownerName = ownerUser?.name || "Sin asignar"
    const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    
    return {
      id: issue.id,
      businessUnit: issue.initiative?.name || "Sin asignar",
      project: issue.project?.name || "Sin asignar",
      initiative: issue.title,
      slug: issue.id, // Use ID as slug for navigation
      globalScore: score,
      status,
      openRisks,
      maxRiskLevel: status,
      lastReview: subDays(new Date(), seededRandom(seed + 'review', 1, 30)),
      owner: {
        id: ownerUser?.id || 'unknown',
        name: ownerName,
        initials,
        avatar_url: ownerUser?.avatar_url || undefined,
      },
    }
  })
}

// Compliance Filters Bar Component
function ComplianceFiltersBar({
  initiatives,
  onFiltersChange,
}: {
  initiatives: ComplianceInitiative[]
  onFiltersChange: (filters: any[], globalFilter: string) => void
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<string | null>(null)
  const [commandInput, setCommandInput] = useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState<any[]>([])

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const businessUnits = [...new Set(initiatives.map(i => i.businessUnit))]
    const projects = [...new Set(initiatives.map(i => i.project))]
    const owners = [...new Set(initiatives.map(i => i.owner.name))]
    
    return [
      {
        name: "Business Unit",
        icon: <Building2 className="w-2.5 h-2.5 text-gray-600" />,
        options: businessUnits.map(bu => ({
          name: bu,
          icon: <Building2 className="w-2.5 h-2.5 text-gray-600" />
        }))
      },
      {
        name: "Project",
        icon: <Target className="w-2.5 h-2.5 text-gray-600" />,
        options: projects.map(p => ({
          name: p,
          icon: <Target className="w-2.5 h-2.5 text-gray-600" />
        }))
      },
      {
        name: "Estado",
        icon: <Shield className="w-2.5 h-2.5 text-gray-600" />,
        options: [
          { name: "OK", icon: <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> },
          { name: "Warning", icon: <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> },
          { name: "Critical", icon: <XCircle className="w-2.5 h-2.5 text-red-600" /> },
        ]
      },
      {
        name: "Owner",
        icon: <User className="w-2.5 h-2.5 text-gray-600" />,
        options: owners.map(o => ({
          name: o,
          icon: <User className="w-2.5 h-2.5 text-gray-600" />
        }))
      }
    ]
  }, [initiatives])

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters, globalFilter)
  }, [filters, globalFilter, onFiltersChange])

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(event.target.value)
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar initiatives..."
            value={globalFilter ?? ""}
            onChange={handleGlobalFilterChange}
            className="pl-9 h-7 max-w-sm bg-gray-50 border-gray-200 rounded-lg border-dashed focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:outline-none text-gray-900 placeholder-gray-500 shadow-none hover:bg-gray-100 transition-colors text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
        </div>

        {/* Active Filters */}
        <div className="flex gap-2">
          {filters
            .filter((filter) => filter.value?.length > 0)
            .map((filter, index) => {
              const filterType = filterOptions.find(opt => opt.name === filter.type)
              const filterValue = filter.value[0]
              const matchingOption = filterType?.options.find(option => option.name === filterValue)

              return (
                <div key={index} className="flex items-center text-xs h-7 rounded-lg overflow-hidden border-dashed border border-gray-200 bg-gray-50">
                  <div className="flex gap-1.5 shrink-0 hover:bg-gray-100 px-3 h-full items-center transition-colors">
                    {filterType?.icon}
                    <span className="text-gray-600 font-medium text-xs">{filter.type}</span>
                  </div>
                  <div className="hover:bg-gray-100 px-2 h-full flex items-center text-gray-600 transition-colors shrink-0 text-xs border-l border-gray-200">
                    is
                  </div>
                  <div className="hover:bg-gray-100 px-3 h-full flex items-center text-gray-600 transition-colors shrink-0 border-l border-gray-200">
                    <div className="flex gap-1.5 items-center">
                      {matchingOption?.icon}
                      <span className="text-gray-600 text-xs">{filterValue}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFilters((prev) => prev.filter((_, i) => i !== index))
                    }}
                    className="hover:bg-gray-100 h-full w-8 text-gray-500 hover:text-gray-700 transition-colors shrink-0 border-l border-gray-200"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              )
            })}
        </div>

        {/* Clear Filters Button */}
        {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition flex gap-1.5 items-center rounded-lg px-3 text-xs"
            onClick={() => setFilters([])}
          >
            Limpiar
          </Button>
        )}

        {/* Filter Dropdown */}
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open)
            if (!open) {
              setTimeout(() => {
                setSelectedView(null)
                setCommandInput("")
              }, 200)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              size="sm"
              className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
            >
              <ListFilter className="h-3 w-3 shrink-0 transition-all text-gray-500" />
              <span className="text-xs">Filtrar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-1 rounded-2xl border-gray-200 shadow-lg"
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgb(229 229 229)',
              backgroundColor: '#ffffff',
            }}
          >
            <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]]:py-1.5 [&_[cmdk-input-wrapper]_svg]:!text-black [&_[cmdk-input-wrapper]_svg]:!opacity-100 [&_[cmdk-input-wrapper]_svg]:!w-4 [&_[cmdk-input-wrapper]_svg]:!h-4 [&_[cmdk-input-wrapper]_svg]:!mr-2 [&_[cmdk-input-wrapper]]:!flex [&_[cmdk-input-wrapper]]:!items-center [&_[cmdk-input-wrapper]_svg]:!stroke-2">
              <CommandInput
                placeholder={selectedView ? selectedView : "Buscar..."}
                className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value)
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
                  No se encontraron filtros.
                </CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterOptions.find(opt => opt.name === selectedView)?.options.map((option) => (
                      <CommandItem
                        className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          setFilters(prev => [...prev, { type: selectedView, value: [option.name] }])
                          setTimeout(() => {
                            setSelectedView(null)
                            setCommandInput("")
                          }, 200)
                          setOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                            {option.icon}
                          </div>
                          <span className="text-black font-normal text-[14px] flex-1">
                            {option.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandGroup>
                    {filterOptions.map((option) => (
                      <CommandItem
                        className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          setSelectedView(option.name)
                          setCommandInput("")
                          commandInputRef.current?.focus()
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                            {option.icon}
                          </div>
                          <span className="text-black font-normal text-[14px] flex-1">
                            {option.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Display Settings */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-7 bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 border-dashed px-3 text-xs rounded-lg">
          <SettingsIcon className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
          Display
        </Button>
      </div>
    </div>
  )
}

// Score bar component - More refined
const ScoreBar = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 75) return "bg-gradient-to-r from-emerald-400 to-emerald-500"
    if (score >= 50) return "bg-gradient-to-r from-amber-400 to-amber-500"
    return "bg-gradient-to-r from-red-400 to-red-500"
  }
  
  const getTextColor = () => {
    if (score >= 75) return "text-emerald-700"
    if (score >= 50) return "text-amber-700"
    return "text-red-700"
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          className={cn("h-1.5 rounded-full", getColor())} 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-semibold w-8", getTextColor())}>{score}%</span>
    </div>
  )
}

// Status badge component - More refined styling
const StatusBadge = ({ status }: { status: RiskStatus }) => {
  const config = {
    ok: { 
      label: "OK", 
      className: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
      dotClass: "bg-emerald-500"
    },
    warning: { 
      label: "Warning", 
      className: "bg-amber-50/80 text-amber-700 border-amber-200/60",
      dotClass: "bg-amber-500"
    },
    critical: { 
      label: "Critical", 
      className: "bg-red-50/80 text-red-700 border-red-200/60",
      dotClass: "bg-red-500"
    },
  }
  
  const { label, className, dotClass } = config[status]
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors",
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  )
}

// KPI Card component - More refined
const KPICard = ({ 
  title, 
  count, 
  status, 
  icon: Icon 
}: { 
  title: string
  count: number
  status: RiskStatus
  icon: React.ComponentType<any>
}) => {
  const config = {
    ok: { 
      pillClass: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50", 
      iconClass: "text-emerald-500",
      dotClass: "bg-emerald-500",
      bgGradient: "from-emerald-50/50"
    },
    warning: { 
      pillClass: "bg-amber-100/80 text-amber-700 border border-amber-200/50", 
      iconClass: "text-amber-500",
      dotClass: "bg-amber-500",
      bgGradient: "from-amber-50/50"
    },
    critical: { 
      pillClass: "bg-red-100/80 text-red-700 border border-red-200/50", 
      iconClass: "text-red-500",
      dotClass: "bg-red-500",
      bgGradient: "from-red-50/50"
    },
  }
  
  const { pillClass, iconClass, dotClass, bgGradient } = config[status]
  
  return (
    <motion.div 
      className={cn(
        "border border-gray-200 rounded-lg bg-gradient-to-br to-white p-4 hover:shadow-sm transition-all",
        bgGradient
      )}
      whileHover={{ y: -1 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500">{title}</div>
        <Icon className={cn("h-4 w-4 opacity-50", iconClass)} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900">{count}</span>
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full", pillClass)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
          {status === "ok" ? "OK" : status === "warning" ? "Warning" : "Critical"}
        </span>
      </div>
    </motion.div>
  )
}

// Empty state component - More refined
const EmptyState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
      <Shield className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-sm font-medium text-gray-900 mb-1">No hay initiatives</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
      No hay initiatives en producción con los filtros actuales. Ajusta los filtros para ver otras initiatives.
    </p>
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClearFilters}
      className="h-8 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition rounded-lg px-4 text-xs gap-2"
    >
      <X className="h-3.5 w-3.5" />
      Limpiar filtros
    </Button>
  </div>
)

// Compliance List Component
function ComplianceList({
  initiatives,
  loading,
  onClearFilters,
}: {
  initiatives: ComplianceInitiative[]
  loading: boolean
  onClearFilters: () => void
}) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div>
      {initiatives.length > 0 ? (
        initiatives.map((initiative, index) => (
          <motion.div
            key={initiative.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="group py-3.5 hover:bg-gray-50/70 transition-all cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => router.push(`/compliance/${initiative.slug}`)}
            whileHover={{ x: 2 }}
          >
            <div className="grid grid-cols-[120px_140px_1fr_100px_90px_70px_90px_120px_60px] gap-4 items-center">
              {/* Business Unit Column */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200/70 transition-colors">
                  <Building2 className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700 truncate">{initiative.businessUnit}</span>
              </div>

              {/* Project Column */}
              <div className="min-w-0">
                <span className="text-sm text-gray-600 truncate block">{initiative.project}</span>
              </div>

              {/* Initiative Column */}
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors truncate block">
                  {initiative.initiative}
                </span>
              </div>

              {/* Score Column */}
              <div className="flex justify-start">
                <ScoreBar score={initiative.globalScore} />
              </div>

              {/* Status Column */}
              <div className="flex justify-start">
                <StatusBadge status={initiative.status} />
              </div>

              {/* Open Risks Column */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">{initiative.openRisks}</span>
                {initiative.openRisks > 0 && (
                  <span className={cn(
                    "w-2 h-2 rounded-full ring-2 ring-white",
                    initiative.maxRiskLevel === "critical" ? "bg-red-500" :
                    initiative.maxRiskLevel === "warning" ? "bg-amber-500" :
                    "bg-emerald-500"
                  )} />
                )}
              </div>

              {/* Last Review Column */}
              <div className="text-sm text-gray-600">
                {format(initiative.lastReview, "dd MMM")}
              </div>

              {/* Owner Column */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 flex-shrink-0 ring-1 ring-gray-200/50">
                  {initiative.owner.initials}
                </div>
                <span className="text-sm text-gray-600 truncate">{initiative.owner.name.split(' ')[0]}</span>
              </div>

              {/* Actions Column */}
              <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/compliance/${initiative.slug}`)}
                  className="h-7 w-7 p-0 hover:bg-gray-200 rounded-md"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <EmptyState onClearFilters={onClearFilters} />
      )}
    </div>
  )
}

export default function CompliancePage() {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [initiatives, setInitiatives] = useState<ComplianceInitiative[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [generateReportOpen, setGenerateReportOpen] = useState(false)

  // Load data from real issues
  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false)
        setInitiatives([])
        return
      }

      try {
        setLoading(true)
        const issues = await IssuesAPI.getIssues(currentOrg.organization.id)
        const complianceData = issuesToCompliance(issues)
        setInitiatives(complianceData)
      } catch (error) {
        console.error('Error loading compliance data:', error)
        setInitiatives([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentOrg?.organization?.id])

  // Filter handler
  const handleFiltersChange = useCallback((newFilters: any[], newGlobalFilter: string) => {
    setFilters(newFilters)
    setGlobalFilter(newGlobalFilter)
  }, [])

  // Filter initiatives
  const filteredInitiatives = useMemo(() => {
    let filtered = [...initiatives]

    // Apply global filter (search)
    if (globalFilter) {
      filtered = filtered.filter(initiative => 
        initiative.initiative.toLowerCase().includes(globalFilter.toLowerCase()) ||
        initiative.project.toLowerCase().includes(globalFilter.toLowerCase()) ||
        initiative.businessUnit.toLowerCase().includes(globalFilter.toLowerCase()) ||
        initiative.owner.name.toLowerCase().includes(globalFilter.toLowerCase())
      )
    }

    // Apply specific filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.value && filter.value.length > 0) {
          const filterValue = filter.value[0]
          
          switch (filter.type) {
            case "Business Unit":
              filtered = filtered.filter(i => i.businessUnit === filterValue)
              break
            case "Project":
              filtered = filtered.filter(i => i.project === filterValue)
              break
            case "Estado":
              filtered = filtered.filter(i => {
                const statusMap: Record<string, RiskStatus> = {
                  "OK": "ok",
                  "Warning": "warning", 
                  "Critical": "critical"
                }
                return i.status === statusMap[filterValue]
              })
              break
            case "Owner":
              filtered = filtered.filter(i => i.owner.name === filterValue)
              break
          }
        }
      })
    }

    return filtered
  }, [initiatives, filters, globalFilter])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const ok = filteredInitiatives.filter(i => i.status === "ok").length
    const warning = filteredInitiatives.filter(i => i.status === "warning").length
    const critical = filteredInitiatives.filter(i => i.status === "critical").length
    return { ok, warning, critical }
  }, [filteredInitiatives])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([])
    setGlobalFilter("")
  }, [])

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
                <span className="text-[14px] text-gray-500">Pharo</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Compliance</span>
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
                  className="h-8 bg-gray-800 hover:bg-gray-900 text-white gap-2 text-xs"
                  onClick={() => setGenerateReportOpen(true)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Generar reporte
                </Button>
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div 
              className="flex items-center justify-between h-full" 
              style={{ 
                paddingLeft: '18px', 
                paddingRight: '20px', 
                paddingTop: 'var(--header-padding-y)', 
                paddingBottom: 'var(--header-padding-y)' 
              }}
            >
              <ComplianceFiltersBar 
                initiatives={initiatives}
                onFiltersChange={handleFiltersChange} 
              />
            </div>
          </div>
        }
      >
        {/* Container that goes to edges */}
        <div className="-mx-5 -mt-4">
          {/* KPI Cards Section */}
          <div className="py-4 px-5 border-b border-stroke bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ paddingLeft: '8px', paddingRight: '0px' }}>
              <KPICard
                title="Initiatives OK"
                count={kpis.ok}
                status="ok"
                icon={CheckCircle}
              />
              <KPICard
                title="Initiatives en Warning"
                count={kpis.warning}
                status="warning"
                icon={AlertTriangle}
              />
              <KPICard
                title="Initiatives en Critical"
                count={kpis.critical}
                status="critical"
                icon={XCircle}
              />
            </div>
          </div>

          {/* Column Names */}
          <div className="py-2.5 border-b border-stroke bg-gray-50/50" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-[120px_140px_1fr_100px_90px_70px_90px_120px_60px] gap-4">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Business Unit</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Project</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Initiative</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Score</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Riesgos</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Revisión</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Owner</div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Acción</div>
            </div>
          </div>

          {/* Content: Compliance List */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <ComplianceList 
              initiatives={filteredInitiatives}
              loading={loading}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
        
        {/* Generate Aggregate Report Modal */}
        <GenerateReportModal 
          open={generateReportOpen} 
          onOpenChange={setGenerateReportOpen}
          initiativeName="Resumen de Compliance"
          initiativeData={{
            initiative: {
              name: "Resumen de Compliance",
              businessUnit: "Todas las unidades",
              project: "Todos los proyectos",
              score: Math.round(filteredInitiatives.reduce((acc, i) => acc + i.globalScore, 0) / Math.max(filteredInitiatives.length, 1)),
              status: kpis.critical > 0 ? "critical" : kpis.warning > 0 ? "warning" : "ok",
            },
            controls: {
              total: filteredInitiatives.length * 6,
              compliant: Math.round(filteredInitiatives.length * 3.5),
              partial: Math.round(filteredInitiatives.length * 1.5),
              nonCompliant: Math.round(filteredInitiatives.length * 1),
            },
            risks: {
              total: filteredInitiatives.reduce((acc, i) => acc + i.openRisks, 0),
              open: filteredInitiatives.reduce((acc, i) => acc + i.openRisks, 0),
              critical: kpis.critical,
            },
            actions: {
              total: filteredInitiatives.length * 4,
              pending: Math.round(filteredInitiatives.length * 1.5),
              inProgress: Math.round(filteredInitiatives.length * 1),
              completed: Math.round(filteredInitiatives.length * 1.5),
            },
            evidence: {
              total: filteredInitiatives.length * 5,
              files: Math.round(filteredInitiatives.length * 3),
              links: Math.round(filteredInitiatives.length * 2),
            },
          }}
        />
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
