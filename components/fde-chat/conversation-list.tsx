"use client";

import * as React from "react";
import { 
  MessageSquare, 
  Plus, 
  Search,
  Trash2,
  MoreHorizontal,
  X,
  Clock,
  CheckCircle2,
  Archive,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <div
        onClick={onClick}
        className={cn(
          "group relative px-4 py-3 cursor-pointer transition-colors border-b border-gray-100",
          "hover:bg-gray-50",
          selected && "bg-gray-50"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-9 w-9 border border-gray-200 rounded-full">
              {fdeAvatarUrl && <AvatarImage src={fdeAvatarUrl} className="rounded-full" />}
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {initials}
              </AvatarFallback>
            </Avatar>
            {hasUnread && (
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={cn(
                "text-[13px] truncate",
                hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-900"
              )}>
                {conversation.title || 'Nueva conversación'}
              </span>
              <span className="text-[11px] text-gray-400 flex-shrink-0 tabular-nums">
                {formatRelativeTime(conversation.last_message_at || conversation.created_at)}
              </span>
            </div>

            <p className={cn(
              "text-[12px] truncate leading-normal",
              hasUnread ? "text-gray-700" : "text-gray-500"
            )}>
              {conversation.last_message || 'Sin mensajes'}
            </p>
            
            {/* Status indicators (minimalist) */}
            <div className="flex items-center gap-2 mt-1.5">
              {conversation.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  Pendiente
                </span>
              )}
              {conversation.status === 'resolved' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Resuelta
                </span>
              )}
              {conversation.status === 'archived' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                  <Archive className="w-3 h-3" />
                  Archivada
                </span>
              )}
            </div>
          </div>

          {/* Actions menu - visible on hover or selected */}
          <div className={cn(
            "absolute right-2 top-3 transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-200 rounded-md">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

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
      if (conv.id.startsWith('temp-')) return true;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = conv.title?.toLowerCase().includes(query);
        const matchesMessage = conv.last_message?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      if (statusFilter && conv.status !== statusFilter) return false;

      return true;
    });
  }, [conversations, searchQuery, statusFilter]);

  // Sort: unread first, then by last message time
  const sortedConversations = React.useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (a.id.startsWith('temp-')) return -1;
      if (b.id.startsWith('temp-')) return 1;
      
      if (a.unread_count > 0 && b.unread_count === 0) return -1;
      if (a.unread_count === 0 && b.unread_count > 0) return 1;

      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredConversations]);

  const totalUnread = React.useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unread_count, 0);
  }, [conversations]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - 27px aligned with sidebar */}
      <div className="h-[44px] min-h-[27px] px-4 border-b border-gray-200 flex-shrink-0 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-medium text-gray-900">Conversations</h2>
          {totalUnread > 0 && (
            <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold leading-none">
              {totalUnread}
            </span>
          )}
        </div>
        <Button 
          onClick={onNewConversation}
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-gray-100"
        >
          <Plus className="h-3.5 w-3.5 text-gray-600" />
        </Button>
      </div>

      {/* Search & Filters - with top padding for spacing */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0 bg-white">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-[13px] bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-md placeholder:text-gray-400"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {[
            { key: null, label: 'Todas' },
            { key: 'active', label: 'Activas' },
            { key: 'pending', label: 'Pendientes' },
          ].map(({ key, label }) => (
            <button
              key={key ?? 'all'}
              onClick={() => setStatusFilter(key as any)}
              className={cn(
                "flex-shrink-0 text-[11px] px-2.5 py-1 rounded-md transition-all font-medium border",
                statusFilter === key 
                  ? "bg-gray-900 text-white border-gray-900" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[13px] text-gray-400">Cargando...</span>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-900 font-medium mb-1">
              Sin conversaciones
            </p>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              {searchQuery 
                ? 'No hay resultados' 
                : 'Inicia una nueva conversación'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
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
          </div>
        )}
      </div>
    </div>
  );
}
