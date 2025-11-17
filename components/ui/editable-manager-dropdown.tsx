"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ManagerButton } from "@/components/ui/manager-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitiativesAPI } from "@/lib/api/initiatives";
import { useAuth } from "@/lib/context/auth-context";
import { getSapiraProfileLabel } from "@/components/role-switcher";

const managerCache = new Map<string, Manager[]>();

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
  sapira_role_type?: string | null;
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
  const { currentOrg } = useAuth();
  const organizationId = currentOrg?.organization?.id;
  const [managers, setManagers] = useState<Manager[]>(() => {
    if (organizationId) {
      return managerCache.get(organizationId) || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const loadManagers = useCallback(async () => {
    if (!organizationId) {
      setManagers([]);
      return;
    }

    if (managerCache.has(organizationId)) {
      setManagers(managerCache.get(organizationId)!);
      return;
    }

    try {
      setLoading(true);
      const availableManagers = await InitiativesAPI.getAvailableManagers(organizationId);
      const validManagers = (availableManagers || []).filter((m): m is NonNullable<typeof m> => m !== null && m !== undefined);
      managerCache.set(organizationId, validManagers as Manager[]);
      setManagers(validManagers as Manager[]);
    } catch (error) {
      console.error('Error loading managers:', error);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setManagers([]);
      return;
    }

    const cached = managerCache.get(organizationId);
    if (cached) {
      setManagers(cached);
      return;
    }

    loadManagers();
  }, [organizationId, loadManagers]);

  const handleManagerChange = async (value: string) => {
    if (value === "unassigned") {
      try {
        await InitiativesAPI.updateInitiativeManager(initiativeId, null);
        onManagerChange(null);
      } catch (error) {
        console.error('Error unassigning manager:', error);
        // TODO: Show error toast
      }
    } else {
      const manager = managers.find(m => m.id === value);
      if (manager) {
        try {
          await InitiativesAPI.updateInitiativeManager(initiativeId, manager.id);
          onManagerChange(manager);
        } catch (error) {
          console.error('Error updating manager:', error);
          // TODO: Show error toast
        }
      }
    }
  };

  return (
    <Select
      value={currentManager?.id ?? "unassigned"}
      onValueChange={handleManagerChange}
      disabled={disabled || loading}
    >
      <SelectTrigger 
        className={cn(
          "h-auto w-auto min-w-0 border-none bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent [&>svg]:hidden [&>span]:hidden",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <SelectValue className="sr-only">
          {currentManager?.name || "Unassigned"}
        </SelectValue>
        {currentManager ? (
          <ManagerButton
            name={currentManager.name}
            initials={currentManager.name.split(" ").map(n => n[0]).join("")}
            imageUrl={currentManager.avatar_url}
            onClick={() => {}}
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
        {managers.length === 0 && !loading ? (
          <SelectItem value="__no_managers" disabled>
            No managers available
          </SelectItem>
        ) : (
          managers.map((manager) => {
            const isSapira = manager.email?.toLowerCase().endsWith("@sapira.ai")
            const profileLabel =
              isSapira && manager.sapira_role_type ? getSapiraProfileLabel(manager.sapira_role_type) : null
            const displayName = profileLabel ? `${manager.name} (${profileLabel})` : manager.name

            return (
              <SelectItem key={manager.id} value={manager.id}>
                <span className="flex flex-col">
                  <span className="font-medium">{displayName}</span>
                  {manager.email && (
                    <span className="text-xs text-muted-foreground">{manager.email}</span>
                  )}
                </span>
              </SelectItem>
            )
          })
        )}
      </SelectContent>
    </Select>
  );
}
