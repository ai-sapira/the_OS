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
import { Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectsAPI } from "@/lib/api/projects";

interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
}

interface EditableProjectBUDropdownProps {
  currentBU?: BusinessUnit | null;
  projectId: string;
  onBUChange: (bu: BusinessUnit | null) => void;
  disabled?: boolean;
}

export function EditableProjectBUDropdown({
  currentBU,
  projectId,
  onBUChange,
  disabled = false
}: EditableProjectBUDropdownProps) {
  const [open, setOpen] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);

  // AUROVITAS: Sin datos mock - Organización vacía
  
  useEffect(() => {
    if (open && businessUnits.length === 0) {
      loadBusinessUnits();
    }
  }, [open]);

  const loadBusinessUnits = async () => {
    try {
      setLoading(true);
      const data = await ProjectsAPI.getBusinessUnits();
      setBusinessUnits(data || []);
    } catch (error) {
      console.error('Error loading business units:', error);
      // AUROVITAS: No fallback, mostrar vacío
      setBusinessUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBUSelect = async (bu: BusinessUnit) => {
    try {
      await ProjectsAPI.updateProjectBusinessUnit(projectId, bu.id);
      onBUChange(bu);
      setOpen(false);
    } catch (error) {
      console.error('Error updating project business unit:', error);
      // TODO: Show error toast
    }
  };

  const handleRemoveBU = async () => {
    try {
      await ProjectsAPI.updateProjectBusinessUnit(projectId, null);
      onBUChange(null);
      setOpen(false);
    } catch (error) {
      console.error('Error removing project business unit:', error);
      // TODO: Show error toast
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto p-0 hover:bg-gray-100 rounded-lg transition-colors justify-start max-w-full",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
        >
          {currentBU ? (
            <div className="flex items-center gap-2 max-w-full">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 flex-shrink-0">
                <Target className="h-3 w-3 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {currentBU.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">Unassigned</span>
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
            placeholder="Search business units..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Loading..." : "No business units found."}
            </CommandEmpty>
            
            <CommandGroup>
              {/* Remove assignment option */}
              {currentBU && (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={handleRemoveBU}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <X className="h-2.5 w-2.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px]">
                        Remove assignment
                      </div>
                    </div>
                  </div>
                </CommandItem>
              )}
              
              {/* Available business units */}
              {businessUnits.map((bu) => (
                <CommandItem
                  key={bu.id}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleBUSelect(bu)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* BU Icon */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <Target className="h-2.5 w-2.5" />
                    </div>
                    
                    {/* BU Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {bu.name}
                      </div>
                      {bu.description && (
                        <div className="text-gray-500 text-xs truncate">
                          {bu.description}
                        </div>
                      )}
                    </div>
                    
                    {/* Check mark for current */}
                    {currentBU?.id === bu.id && (
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
