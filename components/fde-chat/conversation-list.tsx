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
  Archive
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
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        onClick={onClick}
        className={cn(
          "group relative px-4 py-3.5 cursor-pointer transition-all duration-200 mx-2 rounded-xl",
          "hover:bg-white/60",
          selected && "bg-white shadow-sm ring-1 ring-black/5"
        )}
      >
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
              {fdeAvatarUrl && <AvatarImage src={fdeAvatarUrl} />}
              <AvatarFallback className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {hasUnread && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn(
                "text-[14px] truncate leading-tight",
                hasUnread || selected ? "font-semibold text-gray-900" : "font-medium text-gray-700"
              )}>
                {conversation.title || 'Nueva conversación'}
              </span>
              <span className="text-[11px] text-gray-400 flex-shrink-0 tabular-nums">
                {formatRelativeTime(conversation.last_message_at || conversation.created_at)}
              </span>
            </div>

            <p className={cn(
              "text-[13px] truncate leading-normal",
              hasUnread ? "text-gray-700 font-medium" : "text-gray-500"
            )}>
              {conversation.last_message || 'Sin mensajes'}
            </p>
            
            {/* Status badges */}
            <div className="flex gap-2 mt-2">
              {conversation.status === 'pending' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100/50">
                  <Clock className="w-3 h-3 mr-1" />
                  Pendiente
                </span>
              )}
              {conversation.status === 'resolved' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100/50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resuelta
                </span>
              )}
              {conversation.status === 'archived' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100/50">
                  <Archive className="w-3 h-3 mr-1" />
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
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
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
      // Exclude temp conversations from filter if needed, or keep them
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--stroke)] flex-shrink-0 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Conversaciones</h2>
            {totalUnread > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-sm shadow-blue-200">
                {totalUnread}
              </span>
            )}
          </div>
          <Button 
            onClick={onNewConversation}
            className="h-8 px-3 text-[12px] font-medium bg-gray-900 hover:bg-black text-white rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nueva
          </Button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <Input
            placeholder="Buscar mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-[13px] bg-gray-50/50 border-gray-200 focus:bg-white focus:border-gray-300 transition-all rounded-lg"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {[
            { key: null, label: 'Todas' },
            { key: 'active', label: 'Activas' },
            { key: 'pending', label: 'Pendientes' },
            { key: 'resolved', label: 'Resueltas' },
          ].map(({ key, label }) => (
            <button
              key={key ?? 'all'}
              onClick={() => setStatusFilter(key as any)}
              className={cn(
                "flex-shrink-0 text-[12px] px-3 py-1.5 rounded-full transition-all font-medium border",
                statusFilter === key 
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[13px] text-gray-400">Cargando conversaciones...</span>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
              <MessageSquare className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-[14px] text-gray-900 font-semibold mb-1">
              {searchQuery ? 'Sin resultados' : 'Bandeja vacía'}
            </p>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[200px]">
              {searchQuery 
                ? 'Prueba con otros términos de búsqueda' 
                : 'No tienes conversaciones activas en este momento'
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
