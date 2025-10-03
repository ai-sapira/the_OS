"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Search, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitiativesAPI } from "@/lib/api/initiatives";

interface Manager {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: "SAP" | "CEO" | "BU" | "EMP";
  organization_id: string;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface EditableManagerDropdownProps {
  currentManager?: Manager | null;
  onManagerChange: (manager: Manager | null) => void;
  initiativeId: string;
  disabled?: boolean;
}

export function EditableManagerDropdown({
  currentManager,
  onManagerChange,
  initiativeId,
  disabled = false
}: EditableManagerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock managers data - En producción esto vendría de la API
  // AUROVITAS: Organización vacía, sin managers por defecto
  const mockManagers: Manager[] = [];

  useEffect(() => {
    const loadManagers = async () => {
      try {
        setLoading(true);
        const availableManagers = await InitiativesAPI.getAvailableManagers();
        const validManagers = (availableManagers || []).filter((m): m is NonNullable<typeof m> => m !== null && m !== undefined);
        setManagers(validManagers as Manager[]);
      } catch (error) {
        console.error('Error loading managers:', error);
        // Fallback to mock data if API fails
        setManagers(mockManagers);
      } finally {
        setLoading(false);
      }
    };

    loadManagers();
  }, []);

  const handleManagerSelect = async (manager: Manager) => {
    try {
      await InitiativesAPI.updateInitiativeManager(initiativeId, manager.id);
      onManagerChange(manager);
      setOpen(false);
    } catch (error) {
      console.error('Error updating manager:', error);
      // TODO: Show error toast
    }
  };

  const handleUnassign = async () => {
    try {
      await InitiativesAPI.updateInitiativeManager(initiativeId, null);
      onManagerChange(null);
      setOpen(false);
    } catch (error) {
      console.error('Error unassigning manager:', error);
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
          {currentManager ? (
            <ManagerButton
              name={currentManager.name}
              initials={currentManager.name.split(" ").map(n => n[0]).join("")}
              imageUrl={currentManager.avatar_url}
              onClick={() => {}}
            />
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              <UserPlus className="h-4 w-4" />
              <span>Unassigned</span>
            </div>
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
            placeholder="Search..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              No people found.
            </CommandEmpty>
            
            <CommandGroup>
              {/* Unassign option al principio */}
              <CommandItem
                className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0 mb-1"
                onSelect={handleUnassign}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                    <X className="h-2.5 w-2.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-normal text-[14px]">No manager</div>
                  </div>
                  {!currentManager && (
                    <div className="w-4 h-4 flex items-center justify-center text-black flex-shrink-0 font-bold">
                      ✓
                    </div>
                  )}
                </div>
              </CommandItem>
              
              {/* Separator */}
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              
              {/* Available managers - todos los managers disponibles */}
              {managers.map((manager) => (
                <CommandItem
                  key={manager.id}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleManagerSelect(manager)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Avatar */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-[11px] font-medium text-black flex-shrink-0">
                      {manager.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {manager.name}
                      </div>
                    </div>
                    
                    {/* Check mark for current */}
                    {currentManager?.id === manager.id && (
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
