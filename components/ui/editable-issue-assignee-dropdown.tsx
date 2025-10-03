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
  
  // Debug: Log current assignee
  React.useEffect(() => {
    console.log('[AssigneeDropdown] Current assignee for issue', issueId, ':', currentAssignee);
  }, [currentAssignee, issueId]);

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
      console.log('[AssigneeDropdown] Updating assignee to:', assignee.name, 'for issue:', issueId);
      const updatedIssue = await IssuesAPI.updateIssueAssignee(issueId, assignee.id);
      console.log('[AssigneeDropdown] Assignee updated successfully, returned data:', {
        assignee_id: updatedIssue.assignee_id,
        assignee: updatedIssue.assignee,
        assignee_name: updatedIssue.assignee?.name
      });
      onAssigneeChange(updatedIssue.assignee || null);
      setOpen(false);
    } catch (error) {
      console.error('[AssigneeDropdown] Error updating issue assignee:', error);
      // TODO: Show error toast
    }
  };

  const handleRemoveAssignee = async () => {
    try {
      console.log('[AssigneeDropdown] Removing assignee for issue:', issueId);
      const updatedIssue = await IssuesAPI.updateIssueAssignee(issueId, null);
      console.log('[AssigneeDropdown] Assignee removed successfully');
      onAssigneeChange(updatedIssue.assignee || null);
      setOpen(false);
    } catch (error) {
      console.error('[AssigneeDropdown] Error removing issue assignee:', error);
      // TODO: Show error toast
    }
  };

  // Generate avatar URL
  const avatarUrl = currentAssignee?.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-full py-0 ps-0 h-8 bg-white hover:bg-gray-50 border border-gray-200 inline-flex items-center transition-colors",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
          type="button"
        >
          {currentAssignee ? (
            <>
              <div className="me-0.5 flex aspect-square h-full p-1">
                <img
                  className="h-auto w-full rounded-full object-cover"
                  src={avatarUrl}
                  alt={`${currentAssignee.name} profile image`}
                  width={24}
                  height={24}
                  aria-hidden="true"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1494790108755-2616c0763c81?w=40&h=40&fit=crop&crop=face&auto=format&q=80`;
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 pr-3">{currentAssignee.name}</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm px-3">Unassigned</span>
          )}
        </button>
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

