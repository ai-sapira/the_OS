"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  PlayCircle,
  MessageSquare,
  Tag,
  UserPlus,
  GitBranch,
  Circle,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IssuesAPI } from "@/lib/api/issues";

// Activity icon mapping
const getActivityIcon = (action: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    created: <Circle className="h-4 w-4" />,
    accepted: <CheckCircle2 className="h-4 w-4" />,
    declined: <XCircle className="h-4 w-4" />,
    duplicated: <Copy className="h-4 w-4" />,
    snoozed: <Clock className="h-4 w-4" />,
    unsnoozed: <PlayCircle className="h-4 w-4" />,
    updated: <Activity className="h-4 w-4" />,
    commented: <MessageSquare className="h-4 w-4" />,
    labeled: <Tag className="h-4 w-4" />,
    assigned: <UserPlus className="h-4 w-4" />,
    state_changed: <GitBranch className="h-4 w-4" />,
  };
  return iconMap[action] || <Activity className="h-4 w-4" />;
};

// Format origin label
const getOriginLabel = (origin: string) => {
  const originMap: Record<string, { label: string; color: string }> = {
    teams: { label: "Microsoft Teams", color: "text-blue-600" },
    email: { label: "Email", color: "text-purple-600" },
    slack: { label: "Slack", color: "text-pink-600" },
    api: { label: "API", color: "text-green-600" },
    url: { label: "Web", color: "text-orange-600" },
  };
  return originMap[origin] || { label: origin, color: "text-gray-600" };
};

// Activity message formatting
const formatActivityMessage = (activity: any) => {
  const { action, payload } = activity;
  const actorName = activity.actor?.name || "System";

  switch (action) {
    case "created":
      return {
        primary: `Issue creado`,
        secondary: null,
        details: {
          reporter: payload?.reporter_name || actorName,
          origin: payload?.origin,
        },
      };
    case "accepted":
      return {
        primary: `Issue aceptado`,
        secondary: payload?.initiative_name
          ? `en ${payload.initiative_name}`
          : null,
        details: null,
      };
    case "declined":
      return {
        primary: `Issue rechazado`,
        secondary: payload?.reason || null,
        details: null,
      };
    case "duplicated":
      return {
        primary: `Marcado como duplicado`,
        secondary: payload?.duplicate_of ? `de ${payload.duplicate_of}` : null,
        details: null,
      };
    case "snoozed":
      return {
        primary: `Issue pospuesto`,
        secondary: payload?.snooze_until
          ? `hasta ${new Date(payload.snooze_until).toLocaleDateString("es-ES")}`
          : null,
        details: null,
      };
    case "unsnoozed":
      return {
        primary: `Issue reactivado`,
        secondary: null,
        details: null,
      };
    case "state_changed":
      return {
        primary: `Estado cambiado`,
        secondary:
          payload?.old_state && payload?.new_state
            ? `de ${payload.old_state} a ${payload.new_state}`
            : null,
        details: null,
      };
    case "assigned":
      return {
        primary: `Asignado`,
        secondary: payload?.assignee_name
          ? `a ${payload.assignee_name}`
          : null,
        details: null,
      };
    case "labeled":
      return {
        primary: `Etiqueta añadida`,
        secondary: payload?.label_name ? `"${payload.label_name}"` : null,
        details: null,
      };
    case "commented":
      const messagePreview =
        payload?.message_sent?.substring(0, 60) ||
        payload?.comment?.substring(0, 60);
      return {
        primary: `Comentario añadido`,
        secondary: messagePreview
          ? `"${messagePreview}${messagePreview.length >= 60 ? "..." : ""}"`
          : null,
        details: null,
      };
    case "updated":
      return {
        primary: `Issue actualizado`,
        secondary: payload?.fields_changed
          ? `(${payload.fields_changed.join(", ")})`
          : null,
        details: null,
      };
    default:
      return {
        primary: `Actividad: ${action}`,
        secondary: null,
        details: null,
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

  if (diffMins < 1) return "justo ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

interface IssueActivityTimelineProps {
  issueId: string;
}

export function IssueActivityTimeline({ issueId }: IssueActivityTimelineProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await IssuesAPI.getIssueActivities(issueId);
        // Reverse to show most recent first
        setActivities(data.reverse());
      } catch (err) {
        console.error("Error loading issue activities:", err);
        setError("No se pudieron cargar las actividades");
      } finally {
        setLoading(false);
      }
    };

    if (issueId) {
      loadActivities();
    }
  }, [issueId]);

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
        const { primary, secondary, details } = formatActivityMessage(activity);
        const isLast = index === activities.length - 1;
        const originInfo = details?.origin ? getOriginLabel(details.origin) : null;

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
                  
                  {/* Special detailed view for "created" action */}
                  {details && (
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {details.reporter && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-600">Reportado por</span>
                          <span className="font-medium text-gray-900">{details.reporter}</span>
                        </div>
                      )}
                      {originInfo && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-gray-300" />
                          <span className="text-gray-600">desde</span>
                          <span className={`font-medium ${originInfo.color}`}>
                            {originInfo.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 flex-shrink-0">
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

