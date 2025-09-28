"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Target, Circle, CheckCircle2, Clock, Pause, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectsAPI } from "@/lib/api/projects";

interface StatusOption {
  value: "active" | "planned" | "paused" | "done";
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface EditableProjectStatusDropdownProps {
  currentStatus: "active" | "planned" | "paused" | "done";
  projectId: string;
  onStatusChange: (status: "active" | "planned" | "paused" | "done") => void;
  disabled?: boolean;
}

export function EditableProjectStatusDropdown({
  currentStatus,
  projectId,
  onStatusChange,
  disabled = false
}: EditableProjectStatusDropdownProps) {
  const [open, setOpen] = useState(false);

  // Status options for projects
  const statusOptions: StatusOption[] = [
    {
      value: "active",
      label: "Active",
      description: "Project is currently active",
      icon: <Target className="h-3.5 w-3.5" />,
      color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    },
    {
      value: "planned", 
      label: "Planned",
      description: "Project is planned but not started",
      icon: <Clock className="h-3.5 w-3.5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    },
    {
      value: "paused",
      label: "Paused",
      description: "Project is temporarily paused",
      icon: <Pause className="h-3.5 w-3.5" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    },
    {
      value: "done",
      label: "Done",
      description: "Project is completed",
      icon: <CheckSquare className="h-3.5 w-3.5" />,
      color: "bg-gray-100 text-gray-600 border-gray-200"
    }
  ];

  const getCurrentStatusConfig = () => {
    return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  };

  const handleStatusSelect = async (status: "active" | "planned" | "paused" | "done") => {
    try {
      await ProjectsAPI.updateProjectStatus(projectId, status);
      onStatusChange(status);
      setOpen(false);
    } catch (error) {
      console.error('Error updating project status:', error);
      // TODO: Show error toast
    }
  };

  const currentConfig = getCurrentStatusConfig();

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
          <Badge className={cn("transition-colors font-medium text-xs h-6 px-2 border", currentConfig.color)}>
            {currentConfig.label}
          </Badge>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[200px] p-1 rounded-2xl border-gray-200 shadow-lg"
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
            placeholder="Search status..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              No status found.
            </CommandEmpty>
            
            <CommandGroup>
              {statusOptions.map((status) => (
                <CommandItem
                  key={status.value}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleStatusSelect(status.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Status Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      {status.icon}
                    </div>
                    
                    {/* Status Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {status.label}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {currentStatus === status.value && (
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
