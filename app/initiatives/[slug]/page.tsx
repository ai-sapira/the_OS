"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Target,
  Hexagon,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
  Users,
  ChevronDown,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// API and Types
import { InitiativesAPI, InitiativeWithManager } from "@/lib/api/initiatives";
import { ProjectsAPI, ProjectWithRelations } from "@/lib/api/projects";
import { EditableProjectStatusDropdown } from "@/components/ui/editable-project-status-dropdown";
import { EditableProjectOwnerDropdown } from "@/components/ui/editable-project-owner-dropdown";

// Status Chip Component - Editable
function StatusChip({ 
  currentStatus,
  onStatusChange
}: { 
  currentStatus: boolean,
  onStatusChange?: (newStatus: boolean) => void
}) {
  const [open, setOpen] = useState(false);

  const options = [
    { name: "Active", value: true, dotColor: "bg-green-500" },
    { name: "Inactive", value: false, dotColor: "bg-gray-400" },
  ];

  const current = options.find(o => o.value === currentStatus);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          <div className={`h-2 w-2 rounded-full ${current?.dotColor}`} />
          <span className="text-gray-700">{current?.name}</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[160px] p-1 rounded-2xl border-gray-200 shadow-lg"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  key={option.name}
                  value={option.name}
                  onSelect={() => {
                    onStatusChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`h-2 w-2 rounded-full ${option.dotColor}`} />
                    <span className="text-black font-normal text-[14px]">{option.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Manager Chip Component - Editable
function ManagerChip({ 
  currentManager,
  onManagerChange
}: { 
  currentManager?: InitiativeWithManager['manager'],
  onManagerChange?: (newManager: any) => void
}) {
  const [open, setOpen] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadManagers();
    }
  }, [open]);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const managers = await InitiativesAPI.getAvailableManagers();
      setAvailableManagers(managers);
    } catch (error) {
      console.error('Error loading managers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          {currentManager ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                  {currentManager.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">{currentManager.name}</span>
            </>
          ) : (
            <span className="text-gray-500">No manager</span>
          )}
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-1 rounded-2xl border-gray-200 shadow-lg"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <Command>
          <CommandInput placeholder="Buscar..." className="h-7 border-0 focus:ring-0 text-[14px]" />
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Cargando..." : "No se encontraron managers."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                value="no-manager"
                onSelect={() => {
                  onManagerChange?.(null);
                  setOpen(false);
                }}
              >
                <span className="text-gray-400 font-normal text-[14px]">No manager</span>
              </CommandItem>
              {availableManagers.map((manager) => (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  key={manager.id}
                  value={manager.name}
                  onSelect={() => {
                    onManagerChange?.(manager);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 font-medium">
                        {manager.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-black font-normal text-[14px]">{manager.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Auto-save Description Component
function AutoSaveDescription({ 
  initialValue, 
  initiativeId,
  onSave
}: { 
  initialValue: string,
  initiativeId: string,
  onSave?: () => void
}) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (newValue !== initialValue) {
        setIsSaving(true);
        try {
          await InitiativesAPI.updateInitiative(initiativeId, { description: newValue });
          onSave?.();
        } catch (error) {
          console.error('Error saving description:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // Auto-save after 1 second of inactivity
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add a description for this business unit..."
        className="min-h-[80px] resize-none text-sm text-gray-600 border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent shadow-none"
        style={{ boxShadow: 'none' }}
      />
      {isSaving && (
        <div className="absolute bottom-0 right-0 text-xs text-gray-400">
          Saving...
        </div>
      )}
    </div>
  );
}

// Metrics Section Component - Simplified
function MetricsSection({ initiative }: { initiative: InitiativeWithManager }) {
  // Calculate metrics based on initiative data
  const totalIssues = initiative._count?.issues || 0;
  const completedIssues = initiative._count?.completed_issues || 0;
  const activeIssues = initiative._count?.active_issues || 0;
  
  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  const velocity = 8.5; // Issues per week - this would come from real data
  const avgTimeToClose = 4.2; // Days - this would come from real data

  const metrics = [
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      change: "+12%",
      isPositive: true,
      description: "Issues completed vs total"
    },
    {
      label: "Active Issues",
      value: activeIssues.toString(),
      change: "+3",
      isPositive: true,
      description: "Currently in progress"
    },
    {
      label: "Avg. Time to Close",
      value: `${avgTimeToClose}d`,
      change: "-1.2d",
      isPositive: true,
      description: "Average resolution time"
    },
    {
      label: "Weekly Velocity",
      value: velocity.toString(),
      change: "+0.8",
      isPositive: true,
      description: "Issues closed per week"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-semibold text-gray-900">
              {metric.value}
            </div>
            <div className={`text-xs font-medium ${
              metric.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </div>
          </div>
          <div className="text-xs font-medium text-gray-600 mb-0.5">
            {metric.label}
          </div>
          <div className="text-xs text-gray-500">
            {metric.description}
          </div>
        </div>
      ))}
    </div>
  );
}

// Projects List Component (similar to projects page)
function InitiativeProjectsList({ 
  initiativeId 
}: { 
  initiativeId: string 
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        
        // Get all projects and filter those belonging to this initiative
        const allProjects = await ProjectsAPI.getProjects();
        
        // Filter projects that belong to this initiative
        const filteredProjects = allProjects.filter(project => {
          return project.initiative?.id === initiativeId;
        });
        
        setProjects(filteredProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [initiativeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground text-sm">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Hexagon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No projects yet</p>
        <p className="text-xs mt-1">Projects will appear here when issues are assigned</p>
      </div>
    );
  }

  return (
    <div>
      {/* Column Headers */}
      <div className="py-2 border-b border-gray-200 bg-gray-50/30 px-6">
        <div className="grid grid-cols-[1fr_120px_180px_140px] gap-4">
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Project</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Status</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Owner</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Progress</div>
        </div>
      </div>

      {/* Project Rows */}
      <div>
        {projects.map((project) => (
          <div
            key={project.id}
            className="py-3 px-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => router.push(`/projects/${project.slug}`)}
          >
            <div className="grid grid-cols-[1fr_120px_180px_140px] gap-4 items-center">
              {/* Project Column */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Hexagon className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-xs text-gray-500 truncate">{project.description}</div>
                  )}
                </div>
              </div>

              {/* Status Column */}
              <div className="flex justify-start">
                <EditableProjectStatusDropdown
                  currentStatus={project.status || "planned"}
                  projectId={project.id}
                  onStatusChange={(newStatus) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, status: newStatus } : p
                    );
                    setProjects(updatedProjects);
                  }}
                />
              </div>

              {/* Owner Column */}
              <div className="flex justify-start">
                <EditableProjectOwnerDropdown
                  currentOwner={project.owner}
                  projectId={project.id}
                  onOwnerChange={(newOwner) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, owner: newOwner as any } : p
                    );
                    setProjects(updatedProjects);
                  }}
                />
              </div>

              {/* Progress & Issues Column */}
              <div className="text-sm min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-20 bg-gray-200 rounded-full h-1 flex-shrink-0">
                    <div
                      className="bg-gray-900 h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 flex-shrink-0">
                    {project.progress || 0}%
                  </span>
                </div>
                {project._count && project._count.issues > 0 ? (
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <span>{project._count.issues} issues</span>
                    <span>•</span>
                    <span>{project._count.active_issues} active</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">No issues</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InitiativeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [initiative, setInitiative] = useState<InitiativeWithManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitiative = async () => {
      try {
        setLoading(true);
        const initiatives = await InitiativesAPI.getInitiatives();
        const found = initiatives.find(i => i.slug === slug);
        
        if (found) {
          setInitiative(found);
        }
      } catch (error) {
        console.error('Error loading initiative:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitiative();
  }, [slug]);

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground text-sm">Cargando...</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    );
  }

  if (!initiative) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground text-sm">Initiative no encontrada</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    );
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-500">Workspace</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] text-gray-500">Business Units</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">{initiative.name}</span>
            </div>
          </div>
        }
      >
        {/* Container que va a los bordes - compensa el padding del sheet */}
        <div className="-mx-5 -mt-4">
          {/* Hero Section - Compact con chips editables */}
          <div className="border-b border-gray-200 pb-4 mb-6 px-5 pt-4">
            <div className="flex items-center justify-between">
              {/* Left side - Icon + Título */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-gray-600" />
                </div>
                
                <h1 className="text-xl font-semibold text-gray-900">
                  {initiative.name}
                </h1>
              </div>
              
              {/* Right side - Properties chips editables */}
              <div className="flex items-center gap-2">
              <StatusChip 
                currentStatus={initiative.active ?? true}
                onStatusChange={async (newStatus) => {
                  try {
                    await InitiativesAPI.updateInitiativeStatus(initiative.id, newStatus);
                    setInitiative({ ...initiative, active: newStatus });
                  } catch (error) {
                    console.error('Error updating status:', error);
                  }
                }}
              />
                
                <ManagerChip 
                  currentManager={initiative.manager}
                  onManagerChange={async (newManager) => {
                    try {
                      await InitiativesAPI.updateInitiativeManager(
                        initiative.id, 
                        newManager?.id || null
                      );
                      setInitiative({ ...initiative, manager: newManager });
                    } catch (error) {
                      console.error('Error updating manager:', error);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="px-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Description</h2>
            <div className="pb-0 mb-6 border-b border-gray-200 -mx-5 px-5">
            <AutoSaveDescription 
              initialValue={initiative.description || ""}
              initiativeId={initiative.id}
            />
            </div>
          </div>

          {/* Metrics Section */}
          <div className="px-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="pb-6 mb-6 border-b border-gray-200 -mx-5 px-5">
              <MetricsSection initiative={initiative} />
            </div>
          </div>

          {/* Projects Section */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Projects
              </h2>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                + New Project
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg bg-white">
              <InitiativeProjectsList initiativeId={initiative.id} />
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}
