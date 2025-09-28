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
import { User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectsAPI } from "@/lib/api/projects";

interface Owner {
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

interface EditableProjectOwnerDropdownProps {
  currentOwner?: Owner | null;
  projectId: string;
  onOwnerChange: (owner: Owner | null) => void;
  disabled?: boolean;
}

export function EditableProjectOwnerDropdown({
  currentOwner,
  projectId,
  onOwnerChange,
  disabled = false
}: EditableProjectOwnerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample owners - in real app, this would come from API
  const sampleOwners: Owner[] = [
    {
      id: "user-001",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      avatar_url: null,
      role: "SAP",
      organization_id: "org-001",
      active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "user-002",
      name: "Michael Chen",
      email: "michael@company.com",
      avatar_url: null,
      role: "CEO",
      organization_id: "org-001",
      active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "user-003",
      name: "Emma Rodriguez",
      email: "emma@company.com",
      avatar_url: null,
      role: "BU",
      organization_id: "org-001",
      active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "user-004",
      name: "Carlos Rodríguez",
      email: "carlos@company.com",
      avatar_url: null,
      role: "BU",
      organization_id: "org-001",
      active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "user-005",
      name: "Miguel López",
      email: "miguel@company.com",
      avatar_url: null,
      role: "BU",
      organization_id: "org-001",
      active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  useEffect(() => {
    if (open && owners.length === 0) {
      loadOwners();
    }
  }, [open]);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const data = await ProjectsAPI.getAvailableUsers();
      setOwners(data);
    } catch (error) {
      console.error('Error loading owners:', error);
      // Use sample data as fallback
      setOwners(sampleOwners);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSelect = async (owner: Owner) => {
    try {
      await ProjectsAPI.updateProjectOwner(projectId, owner.id);
      onOwnerChange(owner);
      setOpen(false);
    } catch (error) {
      console.error('Error updating project owner:', error);
      // TODO: Show error toast
    }
  };

  const handleRemoveOwner = async () => {
    try {
      await ProjectsAPI.updateProjectOwner(projectId, null);
      onOwnerChange(null);
      setOpen(false);
    } catch (error) {
      console.error('Error removing project owner:', error);
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
          {currentOwner ? (
            <ManagerButton 
              name={currentOwner.name}
              initials={currentOwner.name.split(" ").map(n => n[0]).join("")}
              imageUrl={currentOwner.avatar_url}
              onClick={() => {}} // Handled by popover trigger
            />
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
            placeholder="Search people..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
          />
          
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Loading..." : "No people found."}
            </CommandEmpty>
            
            <CommandGroup>
              {/* Remove assignment option */}
              {currentOwner && (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0 mb-1"
                  onSelect={handleRemoveOwner}
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
              
              {/* Separator */}
              {currentOwner && (
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
              )}
              
              {/* Available owners */}
              {owners.map((owner) => (
                <CommandItem
                  key={owner.id}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleOwnerSelect(owner)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Owner Avatar */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black font-medium text-[11px] flex-shrink-0">
                      {owner.avatar_url ? (
                        <img 
                          src={owner.avatar_url} 
                          alt={owner.name}
                          className="h-4 w-4 rounded object-cover"
                        />
                      ) : (
                        owner.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                    
                    {/* Owner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {owner.name}
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                      {owner.role}
                    </div>
                    
                    {/* Check mark for current */}
                    {currentOwner?.id === owner.id && (
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
