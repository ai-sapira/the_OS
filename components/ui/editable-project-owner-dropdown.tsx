"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ManagerButton, ManagerDisplay } from "@/components/ui/manager-button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectsAPI } from "@/lib/api/projects";
import { InitiativesAPI } from "@/lib/api/initiatives";
import { useAuth } from "@/lib/context/auth-context";

const ownerCache = new Map<string, any[]>();

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
  sapira_role_type?: string | null;
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
  const { currentOrg } = useAuth();
  const organizationId = currentOrg?.organization?.id;
  const [owners, setOwners] = useState<Owner[]>(() => {
    if (organizationId) {
      return ownerCache.get(organizationId) || []
    }
    return []
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const loadingRef = React.useRef(false);

  const loadOwners = useCallback(async (forceReload = false) => {
    if (!organizationId) {
      setOwners([]);
      return;
    }

    // Check cache first unless forcing reload
    if (!forceReload) {
      const cached = ownerCache.get(organizationId);
      if (cached && cached.length > 0) {
        setOwners(cached as Owner[]);
        return;
      }
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      const data = await InitiativesAPI.getAvailableManagers(organizationId);
      
      // Filter out null/undefined values and ensure valid owners
      const validOwners = (data || []).filter((m): m is NonNullable<typeof m> => m !== null && m !== undefined);
      
      setOwners(validOwners as Owner[]);
      // Always update cache, even if empty (to avoid repeated failed requests)
      ownerCache.set(organizationId, validOwners);
    } catch (error) {
      console.error('[EditableProjectOwnerDropdown] Error loading owners:', error);
      setOwners([]);
      // Don't cache errors
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setOwners([]);
      return;
    }

    // Always load owners when organization changes
    loadOwners();
  }, [organizationId, loadOwners]);

  // Load owners when dropdown opens
  useEffect(() => {
    if (open && organizationId && !loadingRef.current) {
      // Always try to load when dropdown opens, in case cache is stale
      loadOwners(true);
    }
  }, [open, organizationId, loadOwners]);

  const handleOwnerChange = async (value: string) => {
    if (value === "unassigned") {
      try {
        await ProjectsAPI.updateProjectOwner(projectId, null, organizationId || undefined);
        onOwnerChange(null);
      } catch (error) {
        console.error('Error removing project owner:', error);
        // TODO: Show error toast
      }
    } else {
      const owner = owners.find(o => o.id === value);
      if (owner) {
        try {
          await ProjectsAPI.updateProjectOwner(projectId, owner.id, organizationId || undefined);
          onOwnerChange(owner);
        } catch (error) {
          console.error('Error updating project owner:', error);
          // TODO: Show error toast
        }
      }
    }
  };

  return (
    <Select
      value={currentOwner?.id ?? "unassigned"}
      onValueChange={handleOwnerChange}
      onOpenChange={setOpen}
      disabled={disabled || loading}
    >
      <SelectTrigger 
        className={cn(
          "h-auto w-auto min-w-0 border-none bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent [&>svg]:hidden [&>span]:hidden",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <SelectValue className="sr-only">
          {currentOwner?.name || "Unassigned"}
        </SelectValue>
        {currentOwner ? (
          <ManagerDisplay
            name={currentOwner.name}
            initials={currentOwner.name.split(" ").map(n => n[0]).join("")}
            imageUrl={currentOwner.avatar_url}
          />
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserPlus className="h-4 w-4" />
            <span>Unassigned</span>
          </div>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {owners.length === 0 && !loading ? (
          <SelectItem value="__no_owners" disabled>
            No owners available
          </SelectItem>
        ) : (
          owners.map((owner) => (
            <SelectItem key={owner.id} value={owner.id}>
              <span className="flex flex-col">
                <span className="font-medium">{owner.name}</span>
                {owner.email && (
                  <span className="text-xs text-muted-foreground">{owner.email}</span>
                )}
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
