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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssuesAPI } from "@/lib/api/initiatives";
import { IssuePriority } from "@/lib/database/types";

interface PriorityOption {
  value: IssuePriority;
  label: string;
  description: string;
  color: string;
}

interface EditableIssuePriorityDropdownProps {
  currentPriority: IssuePriority | null;
  issueId: string;
  onPriorityChange: (priority: IssuePriority | null) => void;
  disabled?: boolean;
}

export function EditableIssuePriorityDropdown({
  currentPriority,
  issueId,
  onPriorityChange,
  disabled = false
}: EditableIssuePriorityDropdownProps) {
  const [open, setOpen] = useState(false);

  // Priority options for issues
  const priorityOptions: PriorityOption[] = [
    {
      value: "P0",
      label: "P0 - Critical",
      description: "Critical priority",
      color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    },
    {
      value: "P1",
      label: "P1 - High",
      description: "High priority",
      color: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
    },
    {
      value: "P2",
      label: "P2 - Medium",
      description: "Medium priority",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    },
    {
      value: "P3",
      label: "P3 - Low",
      description: "Low priority",
      color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    }
  ];

  const getCurrentPriorityConfig = () => {
    return priorityOptions.find(option => option.value === currentPriority);
  };

  const handlePrioritySelect = async (priority: IssuePriority) => {
    try {
      await IssuesAPI.updateIssue(issueId, { priority });
      onPriorityChange(priority);
      setOpen(false);
    } catch (error) {
      console.error('Error updating issue priority:', error);
      // TODO: Show error toast
    }
  };

  const currentConfig = getCurrentPriorityConfig();

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
          {currentConfig ? (
            <Badge className={cn("transition-colors font-medium text-xs h-6 px-2 border", currentConfig.color)}>
              {currentConfig.value}
            </Badge>
          ) : (
            <span className="text-gray-500 text-sm">No priority</span>
          )}
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
            placeholder="Search priority..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              No priority found.
            </CommandEmpty>
            
            <CommandGroup>
              {priorityOptions.map((priority) => (
                <CommandItem
                  key={priority.value}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handlePrioritySelect(priority.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Priority Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                    
                    {/* Priority Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {priority.label}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {currentPriority === priority.value && (
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

