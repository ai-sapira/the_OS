"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssuesAPI } from "@/lib/api/initiatives";
import { ProjectsAPI } from "@/lib/api/projects";
import type { ProjectWithRelations } from "@/lib/api/projects";

interface EditableIssueProjectDropdownProps {
  currentProject?: ProjectWithRelations | null;
  issueId: string;
  onProjectChange: (project: ProjectWithRelations | null) => void;
  disabled?: boolean;
}

export function EditableIssueProjectDropdown({
  currentProject,
  issueId,
  onProjectChange,
  disabled = false
}: EditableIssueProjectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && projects.length === 0) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectsAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (project: ProjectWithRelations) => {
    try {
      await IssuesAPI.updateIssue(issueId, { project_id: project.id });
      onProjectChange(project);
      setOpen(false);
    } catch (error) {
      console.error('Error updating issue project:', error);
      // TODO: Show error toast
    }
  };

  const handleRemoveProject = async () => {
    try {
      await IssuesAPI.updateIssue(issueId, { project_id: null });
      onProjectChange(null);
      setOpen(false);
    } catch (error) {
      console.error('Error removing issue project:', error);
      // TODO: Show error toast
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto p-0 hover:bg-gray-100 rounded-lg transition-colors justify-start",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
        >
          {currentProject ? (
            <div className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-white border border-gray-200 min-w-0 max-w-[160px]">
              <Building2 className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-900 truncate">{currentProject.name}</span>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No project</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[280px] p-1 rounded-2xl border-gray-200 shadow-lg"
        align="start"
        side="right"
        sideOffset={8}
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]]:py-1.5 [&_[cmdk-input-wrapper]_svg]:!text-black [&_[cmdk-input-wrapper]_svg]:!opacity-100 [&_[cmdk-input-wrapper]_svg]:!w-4 [&_[cmdk-input-wrapper]_svg]:!h-4 [&_[cmdk-input-wrapper]_svg]:!mr-2 [&_[cmdk-input-wrapper]]:!flex [&_[cmdk-input-wrapper]]:!items-center [&_[cmdk-input-wrapper]_svg]:!stroke-2">
          <CommandInput
            placeholder="Search projects..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Loading..." : "No projects found."}
            </CommandEmpty>
            
            <CommandGroup>
              {/* Remove assignment option */}
              {currentProject && (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0 mb-1"
                  onSelect={handleRemoveProject}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <X className="h-2.5 w-2.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px]">
                        Remove project
                      </div>
                    </div>
                  </div>
                </CommandItem>
              )}
              
              {/* Separator */}
              {currentProject && (
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
              )}
              
              {/* Available projects */}
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleProjectSelect(project)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Project Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    
                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {project.name}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {currentProject?.id === project.id && (
                      <div className="w-4 h-4 flex items-center justify-center text-black flex-shrink-0 font-bold">
                        ✓
                      </div>
                    )}
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

