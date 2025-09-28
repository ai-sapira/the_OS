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
import { Search, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitiativesAPI } from "@/lib/api/initiatives";

interface StatusOption {
  value: boolean;
  label: string;
  description: string;
}

interface EditableStatusDropdownProps {
  currentStatus: boolean | null;
  initiativeId: string;
  onStatusChange: (status: boolean) => void;
  disabled?: boolean;
}

export function EditableStatusDropdown({
  currentStatus,
  initiativeId,
  onStatusChange,
  disabled = false
}: EditableStatusDropdownProps) {
  const [open, setOpen] = useState(false);

  // Status options
  const statusOptions: StatusOption[] = [
    {
      value: true,
      label: "Active",
      description: "Initiative is currently active"
    },
    {
      value: false,
      label: "Inactive", 
      description: "Initiative is not active"
    }
  ];

  const handleStatusSelect = async (status: boolean) => {
    try {
      await InitiativesAPI.updateInitiativeStatus(initiativeId, status);
      onStatusChange(status);
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
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
          <Badge 
            className={currentStatus === true 
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" 
              : "bg-gray-100 text-gray-600 border-gray-200"
            }
          >
            {currentStatus === true ? "Active" : "Inactive"}
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
            placeholder="Search..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              No status found.
            </CommandEmpty>
            
            <CommandGroup>
              {/* Available status options */}
              {statusOptions.map((status) => (
                <CommandItem
                  key={status.value.toString()}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleStatusSelect(status.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Status Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      {status.value ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : (
                        <Circle className="h-2.5 w-2.5" />
                      )}
                    </div>
                    
                    {/* Status Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {status.label}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {(currentStatus === null ? false : currentStatus) === status.value && (
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
