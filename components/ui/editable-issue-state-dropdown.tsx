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
import { Circle, CheckCircle2, ArrowRight, XCircle, HelpCircle, Ban, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssuesAPI } from "@/lib/api/issues";
import { IssueState } from "@/lib/database/types";

interface StateOption {
  value: IssueState;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface EditableIssueStateDropdownProps {
  currentState: IssueState;
  issueId: string;
  onStateChange: (state: IssueState) => void;
  disabled?: boolean;
}

export function EditableIssueStateDropdown({
  currentState,
  issueId,
  onStateChange,
  disabled = false
}: EditableIssueStateDropdownProps) {
  const [open, setOpen] = useState(false);

  // State options for issues
  const stateOptions: StateOption[] = [
    {
      value: "triage",
      label: "Triage",
      description: "Waiting for triage",
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    },
    {
      value: "todo",
      label: "Todo",
      description: "Task is not started",
      icon: <Circle className="h-3.5 w-3.5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    },
    {
      value: "in_progress",
      label: "In Progress",
      description: "Task is being worked on",
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    },
    {
      value: "done",
      label: "Done",
      description: "Task is completed",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    },
    {
      value: "blocked",
      label: "Blocked",
      description: "Task is blocked",
      icon: <XCircle className="h-3.5 w-3.5" />,
      color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    },
    {
      value: "waiting_info",
      label: "Waiting Info",
      description: "Waiting for information",
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      color: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
    },
    {
      value: "canceled",
      label: "Canceled",
      description: "Task is canceled",
      icon: <Ban className="h-3.5 w-3.5" />,
      color: "bg-gray-100 text-gray-600 border-gray-200"
    },
    {
      value: "duplicate",
      label: "Duplicate",
      description: "Task is duplicate",
      icon: <Copy className="h-3.5 w-3.5" />,
      color: "bg-gray-100 text-gray-600 border-gray-200"
    }
  ];

  const getCurrentStateConfig = () => {
    return stateOptions.find(option => option.value === currentState) || stateOptions[0];
  };

  const handleStateSelect = async (state: IssueState) => {
    try {
      await IssuesAPI.updateIssue(issueId, { state });
      onStateChange(state);
      setOpen(false);
    } catch (error) {
      console.error('Error updating issue state:', error);
      // TODO: Show error toast
    }
  };

  const currentConfig = getCurrentStateConfig();

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
            placeholder="Search state..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              No state found.
            </CommandEmpty>
            
            <CommandGroup>
              {stateOptions.map((state) => (
                <CommandItem
                  key={state.value}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleStateSelect(state.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* State Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      {state.icon}
                    </div>
                    
                    {/* State Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {state.label}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {currentState === state.value && (
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

