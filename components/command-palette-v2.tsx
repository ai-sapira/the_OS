"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Command as CommandPrimitive } from "cmdk"
import { 
  Search, 
  ArrowRight,
  Hash,
  User,
  Target,
  Building,
  Building2,
  Plus,
  Settings,
  Inbox,
  Map,
  BarChart3,
  Users,
  FileText,
  Clock,
  Sparkles,
  Command,
  CornerDownLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  ClipboardList,
  TrendingUp,
  Plug,
  CreditCard,
  Hexagon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  commandPaletteVariants, 
  modalOverlayVariants, 
  listContainerVariants,
  listItemVariants,
  duration, 
  ease 
} from "@/lib/motion"
import { useAuth } from "@/lib/context/auth-context"

// Types
interface SearchResult {
  id: string
  type: "initiative" | "business_unit" | "user" | "project" | "action" | "navigation"
  title: string
  subtitle?: string
  status?: string
  icon?: React.ReactNode
  href?: string
  action?: () => void
  shortcut?: string
}

interface CommandPaletteV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateInitiative?: () => void
  onCreateBusinessUnit?: () => void
  onCreateProject?: () => void
}

// Icon mapping by status
const statusIcons: Record<string, React.ReactNode> = {
  "done": <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  "completed": <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  "in-progress": <Clock className="h-3.5 w-3.5 text-blue-500" />,
  "in_progress": <Clock className="h-3.5 w-3.5 text-blue-500" />,
  "review": <AlertCircle className="h-3.5 w-3.5 text-orange-500" />,
  "backlog": <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  "triage": <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  "planning": <Target className="h-3.5 w-3.5 text-purple-500" />,
  "planned": <Target className="h-3.5 w-3.5 text-blue-500" />,
  "active": <Clock className="h-3.5 w-3.5 text-green-500" />,
}

// Navigation items - Nomenclatura corregida
const navigationItems: SearchResult[] = [
  { id: "nav-home", type: "navigation", title: "Home", subtitle: "Página principal", icon: <Inbox className="h-4 w-4" />, href: "/home", shortcut: "G H" },
  { id: "nav-triage", type: "navigation", title: "Triage", subtitle: "Iniciativas por revisar", icon: <ClipboardList className="h-4 w-4" />, href: "/triage-new", shortcut: "G T" },
  { id: "nav-business-units", type: "navigation", title: "Business Units", subtitle: "Todas las business units", icon: <Building2 className="h-4 w-4" />, href: "/business-units", shortcut: "G B" },
  { id: "nav-projects", type: "navigation", title: "Projects", subtitle: "Ver todos los proyectos", icon: <Hexagon className="h-4 w-4" />, href: "/projects", shortcut: "G P" },
  { id: "nav-roadmap", type: "navigation", title: "Roadmap", subtitle: "Vista de roadmap", icon: <Map className="h-4 w-4" />, href: "/roadmap", shortcut: "G R" },
  { id: "nav-metrics", type: "navigation", title: "Métricas", subtitle: "Dashboard de métricas", icon: <BarChart3 className="h-4 w-4" />, href: "/metrics", shortcut: "G M" },
  { id: "nav-insights", type: "navigation", title: "Insights", subtitle: "Análisis e insights", icon: <TrendingUp className="h-4 w-4" />, href: "/insights" },
  { id: "nav-surveys", type: "navigation", title: "Surveys", subtitle: "Encuestas", icon: <FileText className="h-4 w-4" />, href: "/surveys", shortcut: "G S" },
  { id: "nav-integrations", type: "navigation", title: "Integraciones", subtitle: "Conectar apps", icon: <Plug className="h-4 w-4" />, href: "/integrations" },
  { id: "nav-billing", type: "navigation", title: "Billing", subtitle: "Facturación", icon: <CreditCard className="h-4 w-4" />, href: "/billing" },
]

// Actions - Nomenclatura corregida
const createActionItems = (
  onCreateInitiative?: () => void, 
  onCreateBusinessUnit?: () => void,
  onCreateProject?: () => void
): SearchResult[] => [
  { 
    id: "action-new-initiative", 
    type: "action", 
    title: "Crear nueva Iniciativa", 
    subtitle: "Añadir una nueva iniciativa", 
    icon: <Plus className="h-4 w-4" />, 
    action: onCreateInitiative,
    shortcut: "N" 
  },
  { 
    id: "action-new-business-unit", 
    type: "action", 
    title: "Crear nuevo Business Unit", 
    subtitle: "Crear una nueva business unit", 
    icon: <Building2 className="h-4 w-4" />, 
    action: onCreateBusinessUnit,
    shortcut: "⇧ N" 
  },
  { 
    id: "action-new-project", 
    type: "action", 
    title: "Crear nuevo Project", 
    subtitle: "Crear un nuevo proyecto", 
    icon: <Hexagon className="h-4 w-4" />, 
    action: onCreateProject,
    shortcut: "⇧ P" 
  },
]

// Search mode detection
type SearchMode = "all" | "commands" | "initiatives" | "users" | "navigation" | "business_units"

function detectSearchMode(query: string): { mode: SearchMode; cleanQuery: string } {
  if (query.startsWith(">")) return { mode: "commands", cleanQuery: query.slice(1).trim() }
  if (query.startsWith("#")) return { mode: "initiatives", cleanQuery: query.slice(1).trim() }
  if (query.startsWith("@")) return { mode: "users", cleanQuery: query.slice(1).trim() }
  if (query.startsWith("/")) return { mode: "navigation", cleanQuery: query.slice(1).trim() }
  if (query.startsWith("!")) return { mode: "business_units", cleanQuery: query.slice(1).trim() }
  return { mode: "all", cleanQuery: query }
}

// Result Item Component
function ResultItem({ 
  result, 
  onSelect 
}: { 
  result: SearchResult
  onSelect: () => void 
}) {
  return (
    <CommandPrimitive.Item
      value={`${result.type}:${result.id}:${result.title}`}
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
        "transition-all duration-100",
        "aria-selected:bg-accent",
        "group"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
        "bg-muted/50 text-muted-foreground",
        "group-aria-selected:bg-primary/10 group-aria-selected:text-primary",
        "transition-colors duration-100"
      )}>
        {result.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {result.title}
          </span>
          {result.status && statusIcons[result.status]}
        </div>
        {result.subtitle && (
          <span className="text-xs text-muted-foreground truncate block">
            {result.subtitle}
          </span>
        )}
      </div>

      {/* Shortcut or action indicator */}
      {result.shortcut && (
        <div className="flex-shrink-0 flex items-center gap-1">
          {result.shortcut.split(" ").map((key, i) => (
            <kbd 
              key={i}
              className={cn(
                "h-5 min-w-5 px-1.5 rounded text-[10px] font-mono font-medium",
                "bg-muted border border-border/50",
                "flex items-center justify-center",
                "group-aria-selected:bg-primary/10 group-aria-selected:border-primary/20"
              )}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
      
      {!result.shortcut && (
        <div className="flex-shrink-0 flex items-center gap-1 text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity">
          <CornerDownLeft className="h-3.5 w-3.5" />
        </div>
      )}
    </CommandPrimitive.Item>
  )
}

// Group Component
function ResultGroup({ 
  title, 
  results,
  onSelect 
}: { 
  title: string
  results: SearchResult[]
  onSelect: (result: SearchResult) => void 
}) {
  if (results.length === 0) return null

  return (
    <CommandPrimitive.Group heading={title}>
      <motion.div
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
        className="space-y-0.5"
      >
        {results.map((result) => (
          <motion.div key={result.id} variants={listItemVariants}>
            <ResultItem
              result={result}
              onSelect={() => onSelect(result)}
            />
          </motion.div>
        ))}
      </motion.div>
    </CommandPrimitive.Group>
  )
}

export function CommandPaletteV2({ 
  open, 
  onOpenChange,
  onCreateInitiative,
  onCreateBusinessUnit,
  onCreateProject,
}: CommandPaletteV2Props) {
  const router = useRouter()
  const { currentOrg } = useAuth()
  const [search, setSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [dbResults, setDbResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse search query
  const { mode, cleanQuery } = useMemo(() => detectSearchMode(search), [search])

  // Action items
  const actionItems = useMemo(
    () => createActionItems(onCreateInitiative, onCreateBusinessUnit, onCreateProject),
    [onCreateInitiative, onCreateBusinessUnit, onCreateProject]
  )

  // Handle keyboard events for ESC
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [open, onOpenChange])

  // Search database
  useEffect(() => {
    if (!cleanQuery || cleanQuery.length < 2) {
      setDbResults([])
      return
    }

    const searchDb = async () => {
      setIsSearching(true)
      try {
        const { supabase } = await import("@/lib/supabase/client")
        const results: SearchResult[] = []

        // Get org_id from current org
        const orgId = currentOrg?.organization?.id

        // Search initiatives (issues table = Iniciativas)
        if (mode === "all" || mode === "initiatives") {
          const { data: issues } = await supabase
            .from("issues")
            .select("id, identifier, title, status, project:projects(name)")
            .or(`title.ilike.%${cleanQuery}%,identifier.ilike.%${cleanQuery}%`)
            .limit(5)

          if (issues) {
            results.push(...issues.map((issue: any) => ({
              id: `initiative-${issue.id}`,
              type: "initiative" as const,
              title: `${issue.identifier || ''} ${issue.title}`.trim(),
              subtitle: issue.project?.name || "Sin proyecto",
              status: issue.status,
              icon: <Hash className="h-4 w-4" />,
              href: `/issues/${issue.id}`,
            })))
          }
        }

        // Search business units (initiatives table = Business Units)
        if (mode === "all" || mode === "business_units") {
          let buQuery = supabase
            .from("initiatives")
            .select("id, name, status, business_unit:business_units(name)")
            .ilike("name", `%${cleanQuery}%`)
            .limit(5)
          
          if (orgId) {
            buQuery = buQuery.eq("org_id", orgId)
          }

          const { data: businessUnits } = await buQuery

          if (businessUnits) {
            results.push(...businessUnits.map((bu: any) => ({
              id: `business-unit-${bu.id}`,
              type: "business_unit" as const,
              title: bu.name,
              subtitle: bu.business_unit?.name || "Sin BU padre",
              status: bu.status,
              icon: <Building2 className="h-4 w-4" />,
              href: `/initiatives/${bu.id}`,
            })))
          }
        }

        // Search users
        if (mode === "all" || mode === "users") {
          let userQuery = supabase
            .from("users")
            .select("id, first_name, last_name, email, department")
            .or(`first_name.ilike.%${cleanQuery}%,last_name.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%`)
            .limit(5)

          if (orgId) {
            userQuery = userQuery.eq("org_id", orgId)
          }

          const { data: users } = await userQuery

          if (users) {
            results.push(...users.map((user: any) => ({
              id: `user-${user.id}`,
              type: "user" as const,
              title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
              subtitle: user.department || user.email,
              icon: <User className="h-4 w-4" />,
            })))
          }
        }

        // Search projects
        if (mode === "all") {
          let projectQuery = supabase
            .from("projects")
            .select("id, name, description, status")
            .ilike("name", `%${cleanQuery}%`)
            .limit(3)

          if (orgId) {
            projectQuery = projectQuery.eq("org_id", orgId)
          }

          const { data: projects } = await projectQuery

          if (projects) {
            results.push(...projects.map((project: any) => ({
              id: `project-${project.id}`,
              type: "project" as const,
              title: project.name,
              subtitle: project.description || "Proyecto",
              status: project.status,
              icon: <Hexagon className="h-4 w-4" />,
              href: `/projects/${project.id}`,
            })))
          }
        }

        setDbResults(results)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchDb, 200)
    return () => clearTimeout(debounce)
  }, [cleanQuery, mode, currentOrg?.organization?.id])

  // Filter navigation
  const filteredNavigation = useMemo(() => {
    if (mode !== "all" && mode !== "navigation") return []
    if (!cleanQuery) return navigationItems.slice(0, 6)
    return navigationItems.filter(item => 
      item.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(cleanQuery.toLowerCase())
    )
  }, [cleanQuery, mode])

  // Filter actions
  const filteredActions = useMemo(() => {
    if (mode !== "all" && mode !== "commands") return []
    if (!cleanQuery) return actionItems
    return actionItems.filter(item =>
      item.title.toLowerCase().includes(cleanQuery.toLowerCase())
    )
  }, [cleanQuery, mode, actionItems])

  // Handle select
  const handleSelect = useCallback((result: SearchResult) => {
    onOpenChange(false)
    setSearch("")

    if (result.action) {
      result.action()
      return
    }

    if (result.href) {
      router.push(result.href)
    }
  }, [onOpenChange, router])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearch("")
      setDbResults([])
    } else {
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Mode indicator - Nomenclatura corregida
  const modeLabel = {
    all: null,
    commands: "Comandos",
    initiatives: "Iniciativas",
    users: "Usuarios",
    navigation: "Navegación",
    business_units: "Business Units",
  }[mode]

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Overlay */}
        <motion.div
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: duration.fast }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />

        {/* Command Palette */}
        <div className="absolute inset-0 flex items-start justify-center pt-[15vh]">
          <motion.div
            variants={commandPaletteVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "w-full max-w-[640px] mx-4",
              "bg-background rounded-2xl shadow-2xl",
              "border border-border/50",
              "overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <CommandPrimitive
              className="flex flex-col"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                
                {/* Mode badge */}
                {modeLabel && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-xs font-medium",
                    "bg-primary/10 text-primary shrink-0"
                  )}>
                    {modeLabel}
                  </span>
                )}
                
                <CommandPrimitive.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Buscar o escribe un comando..."
                  className={cn(
                    "flex-1 bg-transparent border-0 outline-none",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-0"
                  )}
                  autoFocus
                />
                
                {isSearching && (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                )}
                
                <kbd className={cn(
                  "hidden sm:flex items-center gap-1 px-2 py-1 rounded-md",
                  "bg-muted text-muted-foreground text-xs font-mono"
                )}>
                  <Command className="h-3 w-3" />K
                </kbd>
              </div>

              {/* Results */}
              <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
                <CommandPrimitive.Empty className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No se encontraron resultados</p>
                    <p className="text-xs">Prueba con otro término de búsqueda</p>
                  </div>
                </CommandPrimitive.Empty>

                {/* Quick Actions */}
                {filteredActions.length > 0 && (
                  <ResultGroup
                    title="Acciones rápidas"
                    results={filteredActions}
                    onSelect={handleSelect}
                  />
                )}

                {/* DB Results */}
                {dbResults.length > 0 && (
                  <ResultGroup
                    title="Resultados"
                    results={dbResults}
                    onSelect={handleSelect}
                  />
                )}

                {/* Navigation */}
                {filteredNavigation.length > 0 && (
                  <ResultGroup
                    title="Ir a"
                    results={filteredNavigation}
                    onSelect={handleSelect}
                  />
                )}
              </CommandPrimitive.List>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-border/50 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">↑↓</kbd>
                      navegar
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">↵</kbd>
                      seleccionar
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">esc</kbd>
                      cerrar
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="opacity-60">Tip:</span>
                    <code className="text-[10px]">&gt;</code> comandos
                    <code className="text-[10px]">#</code> iniciativas
                    <code className="text-[10px]">@</code> usuarios
                  </div>
                </div>
              </div>
            </CommandPrimitive>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
