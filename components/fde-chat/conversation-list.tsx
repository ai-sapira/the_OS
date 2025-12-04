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
  Trash2,
  MoreHorizontal,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  onDeleteConversation: (id: string) => void;
  loading?: boolean;
  fdeName?: string;
  fdeAvatarUrl?: string | null;
}

// Status config
const statusConfig = {
  active: { 
    color: 'bg-emerald-500', 
    label: 'Activa',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  pending: { 
    color: 'bg-amber-500', 
    label: 'Pendiente',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  resolved: { 
    color: 'bg-slate-400', 
    label: 'Resuelta',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-50'
  },
  archived: { 
    color: 'bg-slate-300', 
    label: 'Archivada',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-50'
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
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function ConversationItem({ 
  conversation, 
  selected, 
  onClick,
  onDelete,
  fdeName,
  fdeAvatarUrl,
}: { 
  conversation: Conversation; 
  selected: boolean; 
  onClick: () => void;
  onDelete: () => void;
  fdeName?: string;
  fdeAvatarUrl?: string | null;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const status = statusConfig[conversation.status];
  const hasUnread = conversation.unread_count > 0;

  const initials = (fdeName || 'ST')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        onClick={onClick}
        className={cn(
          "group relative px-3 py-3 cursor-pointer transition-all duration-150",
          "border-b border-[var(--stroke)]",
          "hover:bg-[var(--surface-2)]",
          selected && "bg-[var(--surface-2)]",
          hasUnread && !selected && "bg-blue-50/30"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border border-[var(--stroke)]">
              {fdeAvatarUrl && <AvatarImage src={fdeAvatarUrl} />}
              <AvatarFallback className="bg-[var(--surface-3)] text-[var(--text-2)] text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div 
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                status.color
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={cn(
                "text-[13px] truncate",
                hasUnread ? "font-semibold text-[var(--text-1)]" : "font-medium text-[var(--text-1)]"
              )}>
                {conversation.title || 'Nueva conversación'}
              </span>
              <span className="text-[11px] text-[var(--text-3)] flex-shrink-0 tabular-nums">
                {formatRelativeTime(conversation.last_message_at || conversation.created_at)}
              </span>
            </div>

            <p className={cn(
              "text-[12px] truncate mb-1.5",
              hasUnread ? "text-[var(--text-2)]" : "text-[var(--text-3)]"
            )}>
              {conversation.last_message || 'Sin mensajes'}
            </p>

            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                status.bgColor,
                status.textColor
              )}>
                {status.label}
              </span>
              {hasUnread && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                  {conversation.unread_count}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4 text-[var(--text-3)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  onDeleteConversation,
  loading = false,
  fdeName = 'Sapira Team',
  fdeAvatarUrl,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  // Filter conversations
  const filteredConversations = React.useMemo(() => {
    return conversations.filter(conv => {
      // Exclude temp conversations
      if (conv.id.startsWith('temp-')) return true;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = conv.title?.toLowerCase().includes(query);
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
      // Temp conversations first
      if (a.id.startsWith('temp-')) return -1;
      if (b.id.startsWith('temp-')) return 1;
      
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
    <div className="flex flex-col h-full bg-[var(--surface-sheet)] border-r border-[var(--stroke)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--stroke)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[var(--text-1)]">Mensajes</h2>
            {totalUnread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                {totalUnread}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={onNewConversation}
            className="h-8 px-3 text-[12px] bg-[var(--text-1)] hover:bg-[var(--text-1)]/90"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nueva
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-[13px] bg-[var(--surface-2)] border-[var(--stroke)] placeholder:text-[var(--text-3)]"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 mt-3">
          {[
            { key: null, label: 'Todas' },
            { key: 'active', label: 'Activas', color: 'emerald' },
            { key: 'pending', label: 'Pendientes', color: 'amber' },
          ].map(({ key, label, color }) => (
            <button
              key={key ?? 'all'}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "text-[11px] px-2 py-1 rounded-md transition-colors",
                statusFilter === key 
                  ? "bg-[var(--text-1)] text-white" 
                  : "text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              )}
            >
              {color && (
                <span className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
                  color === 'emerald' && "bg-emerald-500",
                  color === 'amber' && "bg-amber-500"
                )} />
              )}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[13px] text-[var(--text-3)]">Cargando...</span>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-[var(--text-3)]" />
            </div>
            <p className="text-[13px] text-[var(--text-2)] font-medium mb-1">
              {searchQuery ? 'Sin resultados' : 'Sin conversaciones'}
            </p>
            <p className="text-[12px] text-[var(--text-3)]">
              {searchQuery 
                ? 'Intenta con otros términos' 
                : 'Inicia una conversación con tu FDE'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                selected={selectedId === conversation.id}
                onClick={() => onSelect(conversation)}
                onDelete={() => onDeleteConversation(conversation.id)}
                fdeName={fdeName}
                fdeAvatarUrl={fdeAvatarUrl}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
