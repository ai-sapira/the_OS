"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Hexagon,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
  ChevronDown,
  AlertCircle,
  Target,
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
import { Badge } from "@/components/ui/badge";

// API and Types
import { ProjectsAPI, ProjectWithRelations } from "@/lib/api/projects";
import { ProjectStatus } from "@/lib/database/types";

// Status Chip Component - Editable
function StatusChip({ 
  currentStatus,
  onStatusChange
}: { 
  currentStatus: ProjectStatus,
  onStatusChange?: (newStatus: ProjectStatus) => void
}) {
  const [open, setOpen] = useState(false);

  const options: Array<{
    name: string;
    value: ProjectStatus;
    dotColor: string;
  }> = [
    { name: "Planned", value: "planned", dotColor: "bg-blue-500" },
    { name: "Active", value: "active", dotColor: "bg-green-500" },
    { name: "Paused", value: "paused", dotColor: "bg-yellow-500" },
    { name: "Done", value: "done", dotColor: "bg-gray-400" },
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
                  key={option.value}
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

// Owner Chip Component - Editable
function OwnerChip({ 
  currentOwner,
  onOwnerChange
}: { 
  currentOwner?: ProjectWithRelations['owner'],
  onOwnerChange?: (newOwner: any) => void
}) {
  const [open, setOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await ProjectsAPI.getAvailableUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
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
          {currentOwner ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                  {currentOwner.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">{currentOwner.name}</span>
            </>
          ) : (
            <span className="text-gray-500">No owner</span>
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
              {loading ? "Cargando..." : "No se encontraron usuarios."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                value="no-owner"
                onSelect={() => {
                  onOwnerChange?.(null);
                  setOpen(false);
                }}
              >
                <span className="text-gray-400 font-normal text-[14px]">No owner</span>
              </CommandItem>
              {availableUsers.map((user) => (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  key={user.id}
                  value={user.name}
                  onSelect={() => {
                    onOwnerChange?.(user);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 font-medium">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-black font-normal text-[14px]">{user.name}</span>
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

// Business Unit Chip Component - Editable
function BusinessUnitChip({ 
  currentBU,
  onBUChange
}: { 
  currentBU?: ProjectWithRelations['initiative'],
  onBUChange?: (newBU: any) => void
}) {
  const [open, setOpen] = useState(false);
  const [availableBusinessUnits, setAvailableBusinessUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && availableBusinessUnits.length === 0) {
      loadBusinessUnits();
    }
  }, [open]);

  const loadBusinessUnits = async () => {
    try {
      setLoading(true);
      const businessUnits = await ProjectsAPI.getBusinessUnits();
      setAvailableBusinessUnits(businessUnits);
    } catch (error) {
      console.error('Error loading business units:', error);
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
          {currentBU ? (
            <>
              <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Target className="h-2.5 w-2.5 text-gray-600" />
              </div>
              <span className="text-gray-700">{currentBU.name}</span>
            </>
          ) : (
            <span className="text-gray-500">No business unit</span>
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
              {loading ? "Cargando..." : "No se encontraron business units."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                value="no-business-unit"
                onSelect={() => {
                  onBUChange?.(null);
                  setOpen(false);
                }}
              >
                <span className="text-gray-400 font-normal text-[14px]">No business unit</span>
              </CommandItem>
              {availableBusinessUnits.map((bu) => (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  key={bu.id}
                  value={bu.name}
                  onSelect={() => {
                    onBUChange?.(bu);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Target className="h-3 w-3 text-gray-600" />
                    </div>
                    <span className="text-black font-normal text-[14px]">{bu.name}</span>
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
  projectId,
  onSave
}: { 
  initialValue: string,
  projectId: string,
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
          await ProjectsAPI.updateProject(projectId, { description: newValue });
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
        placeholder="Add a description for this project..."
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

// Metrics Section Component
function MetricsSection({ project }: { project: ProjectWithRelations }) {
  // Calculate metrics based on project data
  const totalIssues = project._count?.issues || 0;
  const completedIssues = project._count?.completed_issues || 0;
  const activeIssues = project._count?.active_issues || 0;
  
  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  const manualProgress = project.progress || 0;
  const calculatedProgress = project._progress?.calculated || 0;
  const velocity = 6.2; // Issues per week - this would come from real data
  const avgTimeToClose = 5.8; // Days - this would come from real data

  const metrics = [
    {
      label: "Manual Progress",
      value: `${manualProgress}%`,
      change: "+8%",
      isPositive: true,
      description: "Owner-set progress"
    },
    {
      label: "Calculated Progress",
      value: `${calculatedProgress}%`,
      change: `${completionRate - calculatedProgress >= 0 ? '+' : ''}${completionRate - calculatedProgress}%`,
      isPositive: completionRate - calculatedProgress >= 0,
      description: "Based on completed issues"
    },
    {
      label: "Active Issues",
      value: activeIssues.toString(),
      change: "+2",
      isPositive: true,
      description: "Currently in progress"
    },
    {
      label: "Avg. Time to Close",
      value: `${avgTimeToClose}d`,
      change: "-0.8d",
      isPositive: true,
      description: "Average resolution time"
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

// Issues List Component
function ProjectIssuesList({ 
  projectId 
}: { 
  projectId: string 
}) {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        // Import IssuesAPI when needed
        const { IssuesAPI } = await import('@/lib/api/issues');
        const allIssues = await IssuesAPI.getIssues();
        
        // Filter issues that belong to this project
        const filteredIssues = allIssues.filter(issue => {
          return issue.project_id === projectId;
        });
        
        setIssues(filteredIssues);
      } catch (error) {
        console.error('Error loading issues:', error);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground text-sm">Loading issues...</div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No issues yet</p>
        <p className="text-xs mt-1">Issues will appear here when assigned to this project</p>
      </div>
    );
  }

  // Status badge helper
  const getStatusBadge = (state: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      triage: { label: "Triage", variant: "outline" },
      todo: { label: "To Do", variant: "secondary" },
      in_progress: { label: "In Progress", variant: "default" },
      blocked: { label: "Blocked", variant: "destructive" },
      waiting_info: { label: "Waiting", variant: "outline" },
      done: { label: "Done", variant: "secondary" },
      canceled: { label: "Canceled", variant: "outline" },
      duplicate: { label: "Duplicate", variant: "outline" },
    };

    const config = statusConfig[state] || { label: state, variant: "outline" };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  // Priority badge helper
  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const priorityConfig: Record<string, { color: string }> = {
      P0: { color: "text-red-600 bg-red-50" },
      P1: { color: "text-orange-600 bg-orange-50" },
      P2: { color: "text-yellow-600 bg-yellow-50" },
      P3: { color: "text-blue-600 bg-blue-50" },
    };

    const config = priorityConfig[priority] || { color: "text-gray-600 bg-gray-50" };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.color}`}>
        {priority}
      </span>
    );
  };

  return (
    <div>
      {/* Column Headers */}
      <div className="py-2 border-b border-gray-200 bg-gray-50/30 px-6">
        <div className="grid grid-cols-[40px_1fr_120px_100px_140px] gap-4">
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Key</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Title</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Status</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Priority</div>
          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Assignee</div>
        </div>
      </div>

      {/* Issue Rows */}
      <div>
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="py-3 px-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <div className="grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 items-center">
              {/* Key Column */}
              <div className="text-xs font-mono text-gray-500">
                {issue.key}
              </div>

              {/* Title Column */}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{issue.title}</div>
                {issue.description && (
                  <div className="text-xs text-gray-500 truncate">{issue.description}</div>
                )}
              </div>

              {/* Status Column */}
              <div className="flex justify-start">
                {getStatusBadge(issue.state || 'triage')}
              </div>

              {/* Priority Column */}
              <div className="flex justify-start">
                {getPriorityBadge(issue.priority)}
              </div>

              {/* Assignee Column */}
              <div className="flex items-center gap-2">
                {issue.assignee ? (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                        {issue.assignee.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-700 truncate">{issue.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projects = await ProjectsAPI.getProjects();
        const found = projects.find(p => p.slug === slug);
        
        if (found) {
          setProject(found);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
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

  if (!project) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground text-sm">Proyecto no encontrado</div>
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
              <span className="text-[14px] text-gray-500">Projects</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">{project.name}</span>
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
                  <Hexagon className="h-4 w-4 text-gray-600" />
                </div>
                
                <h1 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h1>
              </div>
              
              {/* Right side - Properties chips editables */}
              <div className="flex items-center gap-2">
                <BusinessUnitChip 
                  currentBU={project.initiative}
                  onBUChange={async (newBU) => {
                    try {
                      await ProjectsAPI.updateProjectBusinessUnit(
                        project.id,
                        newBU?.id || null
                      );
                      setProject({ ...project, initiative: newBU });
                    } catch (error) {
                      console.error('Error updating business unit:', error);
                    }
                  }}
                />
                
                <StatusChip 
                  currentStatus={project.status || "planned"}
                  onStatusChange={async (newStatus) => {
                    try {
                      await ProjectsAPI.updateProjectStatus(project.id, newStatus);
                      setProject({ ...project, status: newStatus });
                    } catch (error) {
                      console.error('Error updating status:', error);
                    }
                  }}
                />
                
                <OwnerChip 
                  currentOwner={project.owner}
                  onOwnerChange={async (newOwner) => {
                    try {
                      await ProjectsAPI.updateProjectOwner(
                        project.id, 
                        newOwner?.id || null
                      );
                      setProject({ ...project, owner: newOwner });
                    } catch (error) {
                      console.error('Error updating owner:', error);
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
                initialValue={project.description || ""}
                projectId={project.id}
              />
            </div>
          </div>

          {/* Metrics Section */}
          <div className="px-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="pb-6 mb-6 border-b border-gray-200 -mx-5 px-5">
              <MetricsSection project={project} />
            </div>
          </div>

          {/* Issues Section */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Issues
              </h2>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                + New Issue
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg bg-white">
              <ProjectIssuesList projectId={project.id} />
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}
