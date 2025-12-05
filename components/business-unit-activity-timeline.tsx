"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Activity,
  UserPlus,
  UserMinus,
  UserCheck,
  FileEdit,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BusinessUnitsAPI } from "@/lib/api/business-units";

// Activity icon mapping
const getActivityIcon = (action: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    created: <PlusCircle className="h-4 w-4" />,
    updated: <FileEdit className="h-4 w-4" />,
    status_changed: <ToggleLeft className="h-4 w-4" />,
    manager_assigned: <UserPlus className="h-4 w-4" />,
    manager_changed: <UserCheck className="h-4 w-4" />,
    manager_removed: <UserMinus className="h-4 w-4" />,
    description_updated: <FileEdit className="h-4 w-4" />,
    project_added: <PlusCircle className="h-4 w-4" />,
    project_removed: <MinusCircle className="h-4 w-4" />,
    archived: <Archive className="h-4 w-4" />,
    restored: <RefreshCw className="h-4 w-4" />,
  };
  return iconMap[action] || <Activity className="h-4 w-4" />;
};

// Activity message formatting
const formatActivityMessage = (activity: any) => {
  const { action, payload, actor } = activity;
  const actorName = actor?.name || "System";

  switch (action) {
    case "created":
      return {
        primary: `${actorName} creó esta business unit`,
        secondary: payload?.name ? `"${payload.name}"` : null,
      };
    case "status_changed":
      return {
        primary: `${actorName} cambió el estado`,
        secondary: payload?.old_status !== undefined 
          ? `de ${payload.old_status ? "activo" : "inactivo"} a ${payload.new_status ? "activo" : "inactivo"}`
          : null,
      };
    case "manager_assigned":
      return {
        primary: `${actorName} asignó un manager`,
        secondary: null,
      };
    case "manager_changed":
      return {
        primary: `${actorName} cambió el manager`,
        secondary: null,
      };
    case "manager_removed":
      return {
        primary: `${actorName} removió el manager`,
        secondary: null,
      };
    case "description_updated":
      return {
        primary: `${actorName} actualizó la descripción`,
        secondary: null,
      };
    case "project_added":
      return {
        primary: `${actorName} añadió un proyecto`,
        secondary: payload?.project_name ? `"${payload.project_name}"` : null,
      };
    case "project_removed":
      return {
        primary: `${actorName} removió un proyecto`,
        secondary: payload?.project_name ? `"${payload.project_name}"` : null,
      };
    case "archived":
      return {
        primary: `${actorName} archivó esta business unit`,
        secondary: null,
      };
    case "restored":
      return {
        primary: `${actorName} restauró esta business unit`,
        secondary: null,
      };
    case "updated":
      return {
        primary: `${actorName} actualizó la business unit`,
        secondary: null,
      };
    default:
      return {
        primary: `${actorName} realizó una acción`,
        secondary: action,
      };
  }
};

// Format date/time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // If less than 1 hour, show minutes
  if (diffMins < 60) {
    return diffMins === 0 ? "justo ahora" : `hace ${diffMins}m`;
  }
  // If less than 24 hours, show hours
  if (diffHours < 24) {
    return `hace ${diffHours}h`;
  }
  // If less than 7 days, show days
  if (diffDays < 7) {
    return `hace ${diffDays}d`;
  }
  // Otherwise show formatted date
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

interface BusinessUnitActivityTimelineProps {
  businessUnitId: string;
}

export function BusinessUnitActivityTimeline({ businessUnitId }: BusinessUnitActivityTimelineProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BusinessUnitsAPI.getBusinessUnitActivities(businessUnitId);
        setActivities(data);
      } catch (err) {
        console.error("Error loading business unit activities:", err);
        setError("No se pudieron cargar las actividades");
      } finally {
        setLoading(false);
      }
    };

    if (businessUnitId) {
      loadActivities();
    }
  }, [businessUnitId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Cargando actividad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No hay actividad registrada</p>
        <p className="text-xs text-gray-400 mt-1">
          Las actividades aparecerán aquí cuando se realicen cambios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const { primary, secondary } = formatActivityMessage(activity);
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-3 pb-6">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {getActivityIcon(activity.action)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{primary}</p>
                  {secondary && (
                    <p className="text-sm text-gray-600 mt-0.5">{secondary}</p>
                  )}
                </div>

                {/* Actor avatar and time */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {activity.actor && (
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                        {activity.actor.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDateTime(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


