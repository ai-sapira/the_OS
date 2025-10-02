"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SettingsIcon,
  Target,
  Hexagon,
  ListFilter,
  User,
  CheckCircle,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ManagerButton } from "@/components/ui/manager-button";
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
import { ProjectsAPI, ProjectWithRelations } from "@/lib/api/projects";
import { cn } from "@/lib/utils";

// Editable Components
import { EditableProjectStatusDropdown } from "@/components/ui/editable-project-status-dropdown";
import { EditableProjectBUDropdown } from "@/components/ui/editable-project-bu-dropdown";
import { EditableProjectOwnerDropdown } from "@/components/ui/editable-project-owner-dropdown";
import { NewProjectModal } from "@/components/new-project-modal";

// Projects Filters Bar Component
function ProjectsFiltersBar({
  onFiltersChange
}: {
  onFiltersChange?: (filters: any[], globalFilter: string) => void
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<any[]>([]);
  const [availableOwners, setAvailableOwners] = useState<any[]>([]);
  const [availableBusinessUnits, setAvailableBusinessUnits] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Notify parent when filters change
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters, globalFilter);
    }
  }, [filters, globalFilter, onFiltersChange]);


  // Handle global filter changes
  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
  };

  // Load data from database when dropdown opens
  React.useEffect(() => {
    if (open && (availableOwners.length === 0 || availableBusinessUnits.length === 0)) {
      loadFilterData();
    }
  }, [open]);

  // Refresh filter data when component mounts (to get fresh data)
  React.useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoadingData(true);
      const [ownersData, businessUnitsData] = await Promise.all([
        ProjectsAPI.getAvailableUsers(),
        ProjectsAPI.getBusinessUnits()
      ]);
      setAvailableOwners(ownersData);
      setAvailableBusinessUnits(businessUnitsData);
    } catch (error) {
      console.error('Error loading filter data:', error);
      // Fallback to empty arrays if API fails
      setAvailableOwners([]);
      setAvailableBusinessUnits([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Generate filter options dynamically from database data
  const getFilterOptions = () => {
    const statusOptions = [
      { name: "Active", icon: <CheckCircle className="w-2.5 h-2.5 text-green-600" /> },
      { name: "Planned", icon: <CheckCircle className="w-2.5 h-2.5 text-blue-600" /> },
      { name: "Paused", icon: <CheckCircle className="w-2.5 h-2.5 text-yellow-600" /> },
      { name: "Done", icon: <CheckCircle className="w-2.5 h-2.5 text-gray-600" /> },
    ];

    const businessUnitOptions = [
      ...availableBusinessUnits.map(bu => ({
        name: bu.name,
        icon: <Target className="w-2.5 h-2.5 text-gray-600" />
      })),
      { name: "Unassigned", icon: <Target className="w-2.5 h-2.5 text-gray-400" /> },
    ];

    const ownerOptions = [
      ...availableOwners.map(owner => ({
        name: owner.name,
        icon: <User className="w-2.5 h-2.5 text-gray-600" />
      })),
      { name: "Unassigned", icon: <User className="w-2.5 h-2.5 text-gray-400" /> },
    ];

    return [
      {
        name: "Status",
        icon: <CheckCircle className="w-2.5 h-2.5 text-gray-600" />,
        options: statusOptions
      },
      {
        name: "Business Unit",
        icon: <Target className="w-2.5 h-2.5 text-gray-600" />,
        options: businessUnitOptions
      },
      {
        name: "Owner",
        icon: <User className="w-2.5 h-2.5 text-gray-600" />,
        options: ownerOptions
      }
    ];
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
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
              const filterType = filterOptions.find(opt => opt.name === filter.type);
              const filterValue = filter.value[0];
              const matchingOption = filterType?.options.find(option => option.name === filterValue);

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
                      setFilters((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="hover:bg-gray-100 h-full w-8 text-gray-500 hover:text-gray-700 transition-colors shrink-0 border-l border-gray-200"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              );
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
            Clear
          </Button>
        )}

        {/* Filter Dropdown */}
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              setTimeout(() => {
                setSelectedView(null);
                setCommandInput("");
              }, 200);
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
              <span className="text-xs">Filter</span>
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
                placeholder={selectedView ? selectedView : "Search..."}
                className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
                  {loadingData ? "Loading..." : "No filters found."}
                </CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterOptions.find(opt => opt.name === selectedView)?.options.map((option) => (
                      <CommandItem
                        className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          setFilters(prev => [...prev, { type: selectedView, value: [option.name] }]);
                          setTimeout(() => {
                            setSelectedView(null);
                            setCommandInput("");
                          }, 200);
                          setOpen(false);
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
                          setSelectedView(option.name);
                          setCommandInput("");
                          commandInputRef.current?.focus();
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
  );
}

// No more sample data - all data comes from the database via ProjectsAPI

// Projects Card List Component  
function ProjectsCardList({ 
  filters, 
  globalFilter,
  onDataChange
}: { 
  filters?: any[], 
  globalFilter?: string,
  onDataChange?: () => void
}) {
  const router = useRouter();
  const [data, setData] = useState<ProjectWithRelations[]>([]);
  const [filteredData, setFilteredData] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects data
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projects = await ProjectsAPI.getProjects();
        setData(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Show empty state on error instead of mock data
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Apply filters when data, filters, or globalFilter changes
  useEffect(() => {
    let filtered = [...data];

    // Apply global filter (search)
    if (globalFilter) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        project.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        project.owner?.name.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Apply specific filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.value && filter.value.length > 0) {
          const filterValue = filter.value[0];
          
          switch (filter.type) {
            case "Status":
              filtered = filtered.filter(project => {
                return project.status === filterValue.toLowerCase();
              });
              break;
            case "Business Unit":
              filtered = filtered.filter(project => {
                if (filterValue === "Unassigned") {
                  return !project.initiative;
                } else {
                  return project.initiative?.name === filterValue;
                }
              });
              break;
            case "Owner":
              filtered = filtered.filter(project => {
                if (filterValue === "Unassigned") {
                  return !project.owner;
                } else {
                  return project.owner?.name === filterValue;
                }
              });
              break;
          }
        }
      });
    }

    setFilteredData(filtered);
  }, [data, filters, globalFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      {filteredData.length > 0 ? (
        filteredData.map((project, index) => (
          <div
            key={project.id}
            className="py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/projects/${project.slug}`)}
          >
            <div className="grid grid-cols-[1fr_120px_160px_180px_140px] gap-4 items-center">
              {/* Project Column */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Hexagon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
                </div>
              </div>

              {/* Status Column */}
              <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                <EditableProjectStatusDropdown
                  currentStatus={project.status || "planned"}
                  projectId={project.id}
                  onStatusChange={(newStatus) => {
                    // Update local state immediately for optimistic UI
                    const updatedData = data.map(item => 
                      item.id === project.id 
                        ? { ...item, status: newStatus }
                        : item
                    );
                    setData(updatedData);
                    
                    // Call parent refresh if needed
                    onDataChange?.();
                  }}
                />
              </div>

              {/* Business Unit Column */}
              <div className="flex justify-start min-w-0" onClick={(e) => e.stopPropagation()}>
                <EditableProjectBUDropdown
                  currentBU={project.initiative ? {
                    id: project.initiative.id,
                    name: project.initiative.name,
                    description: project.initiative.description || undefined
                  } : null}
                  projectId={project.id}
                  onBUChange={(newBU) => {
                    // Update local state immediately for optimistic UI
                    const updatedData = data.map(item => 
                      item.id === project.id 
                        ? { ...item, initiative: newBU as any }
                        : item
                    );
                    setData(updatedData);
                    
                    // Call parent refresh if needed
                    onDataChange?.();
                  }}
                />
              </div>

              {/* Owner Column */}
              <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                <EditableProjectOwnerDropdown
                  currentOwner={project.owner}
                  projectId={project.id}
                  onOwnerChange={(newOwner) => {
                    // Update local state immediately for optimistic UI
                    const updatedData = data.map(item => 
                      item.id === project.id 
                        ? { ...item, owner: newOwner as any }
                        : item
                    );
                    setData(updatedData);
                    
                    // Call parent refresh if needed
                    onDataChange?.();
                  }}
                />
              </div>

              {/* Progress & Issues Column */}
              <div className="text-sm min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-18 bg-gray-200 rounded-full h-1 flex-shrink-0">
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
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-medium text-gray-900">{project._count.issues}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium text-gray-600">{project._count.active_issues} active</span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs">No issues</span>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-center text-gray-500">
          <Hexagon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p>No projects found</p>
          <p className="text-sm">Get started by creating your first project</p>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dataVersion, setDataVersion] = useState(0)

  const handleFiltersChange = (newFilters: any[], newGlobalFilter: string) => {
    setFilters(newFilters)
    setGlobalFilter(newGlobalFilter)
  }

  const handleProjectCreated = () => {
    setDataVersion(v => v + 1) // Force refresh
  }

  return (
    <ResizableAppShell
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
    >
      <ResizablePageSheet
        header={
          <div>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Workspace</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Projects</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div className="flex items-center justify-between h-full" style={{ paddingLeft: '18px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              <ProjectsFiltersBar onFiltersChange={handleFiltersChange} />
            </div>
          </div>
        }
      >
        {/* Container that goes to edges - compensate sheet padding exactly */}
        <div className="-mx-5 -mt-4">
          {/* Level 1: Column Names - border goes edge to edge */}
          <div className="py-2 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-[1fr_120px_160px_180px_140px] gap-4">
              <div className="text-[13px] font-medium text-gray-500">Project</div>
              <div className="text-[13px] font-medium text-gray-500">Status</div>
              <div className="text-[13px] font-medium text-gray-500">Business Unit</div>
              <div className="text-[13px] font-medium text-gray-500">Owner</div>
              <div className="text-[13px] font-medium text-gray-500">Progress</div>
            </div>
          </div>

          {/* Content: Projects List */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <ProjectsCardList 
              filters={filters} 
              globalFilter={globalFilter}
              onDataChange={() => {
                // Refresh data if needed
                console.log('Project data updated, could refresh here');
              }}
            />
          </div>
        </div>
      </ResizablePageSheet>

      {/* Create Project Modal */}
      <NewProjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onCreateProject={handleProjectCreated}
      />
    </ResizableAppShell>
  );
}