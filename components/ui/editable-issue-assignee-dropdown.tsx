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
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssuesAPI } from "@/lib/api/issues";

interface Assignee {
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

interface EditableIssueAssigneeDropdownProps {
  currentAssignee?: Assignee | null;
  issueId: string;
  onAssigneeChange: (assignee: Assignee | null) => void;
  disabled?: boolean;
}

export function EditableIssueAssigneeDropdown({
  currentAssignee,
  issueId,
  onAssigneeChange,
  disabled = false
}: EditableIssueAssigneeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && assignees.length === 0) {
      loadAssignees();
    }
  }, [open]);

  const loadAssignees = async () => {
    try {
      setLoading(true);
      const data = await IssuesAPI.getAvailableUsers();
      setAssignees(data);
    } catch (error) {
      console.error('Error loading assignees:', error);
      setAssignees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeSelect = async (assignee: Assignee) => {
    try {
      await IssuesAPI.updateIssueAssignee(issueId, assignee.id);
      onAssigneeChange(assignee);
      setOpen(false);
    } catch (error) {
      console.error('Error updating issue assignee:', error);
      // TODO: Show error toast
    }
  };

  const handleRemoveAssignee = async () => {
    try {
      await IssuesAPI.updateIssueAssignee(issueId, null);
      onAssigneeChange(null);
      setOpen(false);
    } catch (error) {
      console.error('Error removing issue assignee:', error);
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
          {currentAssignee ? (
            <ManagerButton 
              name={currentAssignee.name}
              initials={currentAssignee.name.split(" ").map(n => n[0]).join("")}
              imageUrl={currentAssignee.avatar_url}
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
              {currentAssignee && (
                <CommandItem
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0 mb-1"
                  onSelect={handleRemoveAssignee}
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
              {currentAssignee && (
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
              )}
              
              {/* Available assignees */}
              {assignees.map((assignee) => (
                <CommandItem
                  key={assignee.id}
                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black flex items-center px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 mx-0"
                  onSelect={() => handleAssigneeSelect(assignee)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Assignee Avatar */}
                    <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center text-black font-medium text-[11px] flex-shrink-0">
                      {assignee.avatar_url ? (
                        <img 
                          src={assignee.avatar_url} 
                          alt={assignee.name}
                          className="h-4 w-4 rounded object-cover"
                        />
                      ) : (
                        assignee.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                    
                    {/* Assignee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-normal text-[14px] truncate">
                        {assignee.name}
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                      {assignee.role}
                    </div>
                    
                    {/* Check mark for current */}
                    {currentAssignee?.id === assignee.id && (
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

