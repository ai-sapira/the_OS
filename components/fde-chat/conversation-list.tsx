"use client";

import * as React from "react";
import { 
  MessageSquare, 
  Plus, 
  Circle, 
  Clock, 
  CheckCircle2, 
  Archive,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  organization_id: string;
  slack_thread_ts: string | null;
  slack_channel_id: string | null;
  title: string;
  topic?: string | null;
  status: 'active' | 'pending' | 'resolved' | 'archived';
  created_by: string | null;
  participant_ids: string[];
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender: string | null;
  unread_count: number;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  loading?: boolean;
  fdeName?: string;
  fdeAvatarUrl?: string | null;
}

// Status indicators configuration
const statusConfig = {
  active: { 
    color: 'bg-emerald-500', 
    icon: Circle, 
    label: 'Activa',
    ringColor: 'ring-emerald-500/30'
  },
  pending: { 
    color: 'bg-amber-500', 
    icon: Clock, 
    label: 'Esperando respuesta',
    ringColor: 'ring-amber-500/30'
  },
  resolved: { 
    color: 'bg-slate-400', 
    icon: CheckCircle2, 
    label: 'Resuelta',
    ringColor: 'ring-slate-400/30'
  },
  archived: { 
    color: 'bg-slate-300', 
    icon: Archive, 
    label: 'Archivada',
    ringColor: 'ring-slate-300/30'
  },
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function ConversationItem({ 
  conversation, 
  selected, 
  onClick,
  fdeName,
  fdeAvatarUrl,
}: { 
  conversation: Conversation; 
  selected: boolean; 
  onClick: () => void;
  fdeName?: string;
  fdeAvatarUrl?: string | null;
}) {
  const status = statusConfig[conversation.status];
  const StatusIcon = status.icon;
  const hasUnread = conversation.unread_count > 0;

  // Get initials for avatar
  const initials = (conversation.last_message_sender || fdeName || 'ST')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl transition-all duration-200",
        "border border-transparent",
        "hover:bg-slate-50 hover:border-slate-200",
        selected && "bg-slate-100 border-slate-200 shadow-sm",
        hasUnread && !selected && "bg-blue-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            {fdeAvatarUrl ? (
              <AvatarImage src={fdeAvatarUrl} />
            ) : null}
            <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
              status.color
            )}
            title={status.label}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className={cn(
              "text-sm truncate",
              hasUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"
            )}>
              {conversation.title}
            </h4>
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          </div>

          <p className={cn(
            "text-xs truncate",
            hasUnread ? "text-slate-700" : "text-slate-500"
          )}>
            {conversation.last_message_sender && (
              <span className="font-medium">{conversation.last_message_sender}: </span>
            )}
            {conversation.last_message || 'Sin mensajes'}
          </p>

          {/* Footer with status and unread count */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <StatusIcon className={cn(
                "h-3 w-3",
                conversation.status === 'active' && "text-emerald-600",
                conversation.status === 'pending' && "text-amber-600",
                conversation.status === 'resolved' && "text-slate-400",
                conversation.status === 'archived' && "text-slate-300",
              )} />
              <span className="text-[10px] text-slate-400">
                {status.label}
              </span>
            </div>

            {hasUnread && (
              <Badge 
                variant="default" 
                className="h-5 min-w-[20px] px-1.5 text-[10px] bg-blue-600 hover:bg-blue-600"
              >
                {conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  loading = false,
  fdeName = 'Sapira Team',
  fdeAvatarUrl,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  // Filter conversations
  const filteredConversations = React.useMemo(() => {
    return conversations.filter(conv => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = conv.title.toLowerCase().includes(query);
        const matchesMessage = conv.last_message?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      // Status filter
      if (statusFilter && conv.status !== statusFilter) return false;

      return true;
    });
  }, [conversations, searchQuery, statusFilter]);

  // Sort: unread first, then by last message time
  const sortedConversations = React.useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      // Unread first
      if (a.unread_count > 0 && b.unread_count === 0) return -1;
      if (a.unread_count === 0 && b.unread_count > 0) return 1;

      // Then by last message time
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredConversations]);

  // Count unreads
  const totalUnread = React.useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unread_count, 0);
  }, [conversations]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-900">Conversaciones</h2>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="h-5 text-[10px] bg-blue-100 text-blue-700">
                {totalUnread} nuevos
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={onNewConversation}
            className="h-8 bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-1 mt-3">
          <Button
            variant={statusFilter === null ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setStatusFilter(null)}
          >
            Todas
          </Button>
          <Button
            variant={statusFilter === 'active' ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setStatusFilter('active')}
          >
            <Circle className="h-2.5 w-2.5 mr-1 fill-emerald-500 text-emerald-500" />
            Activas
          </Button>
          <Button
            variant={statusFilter === 'pending' ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setStatusFilter('pending')}
          >
            <Clock className="h-3 w-3 mr-1 text-amber-500" />
            Pendientes
          </Button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-500">Cargando conversaciones...</div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">
              {searchQuery ? 'Sin resultados' : 'No hay conversaciones'}
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Inicia una nueva conversación con tu equipo de soporte'
              }
            </p>
            {!searchQuery && (
              <Button 
                size="sm" 
                onClick={onNewConversation}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva conversación
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {sortedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  selected={selectedId === conversation.id}
                  onClick={() => onSelect(conversation)}
                  fdeName={fdeName}
                  fdeAvatarUrl={fdeAvatarUrl}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

