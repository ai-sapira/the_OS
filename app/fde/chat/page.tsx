"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Paperclip,
  MoreVertical,
  CheckCircle2,
  Clock,
  Circle,
  Archive,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Phone,
  Video,
  Info
} from "lucide-react";
import { ResizableAppShell } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { ConversationList, Conversation } from "@/components/fde-chat/conversation-list";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  organization_id: string;
  conversation_id: string | null;
  slack_channel_id: string | null;
  slack_thread_ts: string | null;
  slack_message_ts: string | null;
  sender_type: 'user' | 'fde' | 'system';
  sender_user_id: string | null;
  sender_name: string;
  sender_avatar_url: string | null;
  content: string;
  attachments: any[];
  is_read: boolean;
  created_at: string;
}

// Status config
const statusConfig = {
  active: { color: 'bg-emerald-500', label: 'Activa', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pending: { color: 'bg-amber-500', label: 'Esperando respuesta', bg: 'bg-amber-50', text: 'text-amber-700' },
  resolved: { color: 'bg-slate-400', label: 'Resuelta', bg: 'bg-slate-50', text: 'text-slate-600' },
  archived: { color: 'bg-slate-300', label: 'Archivada', bg: 'bg-slate-50', text: 'text-slate-500' },
};

export default function FDEChatPage() {
  const router = useRouter();
  const { currentOrg, user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // FDE Contact info
  const organizationSettings = (currentOrg?.organization?.settings as Record<string, any> | undefined) ?? {};
  const sapiraContact = organizationSettings.sapira_contact as {
    name?: string;
    email?: string;
    role?: string;
    avatar_url?: string;
  } | undefined;

  const fdeName = sapiraContact?.name || 'Sapira Team';
  const fdeRole = sapiraContact?.role || 'Forward Deploy Engineer';
  const fdeAvatarUrl = sapiraContact?.avatar_url || null;
  const fdeInitials = fdeName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase()).join('') || 'ST';

  // Current user info
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Tú';
  const currentUserEmail = user?.email || '';
  const currentUserInitials = currentUserName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (authLoading || !currentOrg?.organization?.id || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_conversations')
          .select('*')
          .eq('organization_id', currentOrg.organization.id)
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) throw error;
        setConversations(data || []);

        // Auto-select first conversation
        if (data && data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (error) {
        console.error('[FDE Chat] Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentOrg?.organization?.id, authLoading, user?.id]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation || selectedConversation.id.startsWith('temp-')) {
        setMessages([]);
        return;
      }

      setMessagesLoading(true);

      try {
        const { data, error } = await supabase
          .from('fde_messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark as read
        if (selectedConversation.unread_count > 0) {
          await supabase.rpc('mark_conversation_as_read', { 
            p_conversation_id: selectedConversation.id 
          });
          
          setConversations(prev => prev.map(c => 
            c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c
          ));
          setSelectedConversation(prev => prev ? { ...prev, unread_count: 0 } : null);
        }
      } catch (error) {
        console.error('[FDE Chat] Error loading messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation?.id]);

  // Realtime subscriptions
  useEffect(() => {
    if (!currentOrg?.organization?.id) return;

    // Messages subscription
    const messagesChannel = supabase
      .channel('fde_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fde_messages',
          filter: `organization_id=eq.${currentOrg.organization.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          if (newMsg.conversation_id === selectedConversation?.id) {
            setMessages(prev => {
              // Check if already exists
              const exists = prev.some(m => 
                m.id === newMsg.id || 
                (m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_type === newMsg.sender_type)
              );
              if (exists) {
                return prev.map(m => 
                  (m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_type === newMsg.sender_type)
                    ? newMsg : m
                );
              }
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    // Conversations subscription
    const conversationsChannel = supabase
      .channel('fde_conversations_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fde_conversations',
          filter: `organization_id=eq.${currentOrg.organization.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as Conversation;
            setConversations(prev => {
              // Don't add if we already have it (from API response)
              if (prev.some(c => c.id === newConv.id)) return prev;
              // Remove any temp conversation and add the real one
              const filtered = prev.filter(c => !c.id.startsWith('temp-'));
              return [newConv, ...filtered];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Conversation;
            setConversations(prev => {
              const filtered = prev.filter(c => c.id !== updated.id);
              return [updated, ...filtered];
            });
            if (selectedConversation?.id === updated.id) {
              setSelectedConversation(updated);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setConversations(prev => prev.filter(c => c.id !== deletedId));
            if (selectedConversation?.id === deletedId) {
              setSelectedConversation(null);
              setMessages([]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [currentOrg?.organization?.id, selectedConversation?.id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation
  const handleNewConversation = useCallback(() => {
    if (!currentOrg?.organization?.id) return;

    // Check if there's already a temp conversation
    const existingTemp = conversations.find(c => c.id.startsWith('temp-'));
    if (existingTemp) {
      setSelectedConversation(existingTemp);
      setMessages([]);
      return;
    }

    const tempConversation: Conversation = {
      id: `temp-${Date.now()}`,
      organization_id: currentOrg.organization.id,
      slack_thread_ts: null,
      slack_channel_id: null,
      title: 'Nueva conversación',
      topic: null,
      status: 'active',
      created_by: user?.id || null,
      participant_ids: [],
      last_message: null,
      last_message_at: null,
      last_message_sender: null,
      unread_count: 0,
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setConversations(prev => [tempConversation, ...prev]);
    setSelectedConversation(tempConversation);
    setMessages([]);
    
    // Focus textarea
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [currentOrg?.organization?.id, user?.id, conversations]);

  // Delete conversation
  const handleDeleteConversation = useCallback(async (id: string) => {
    // If temp, just remove from state
    if (id.startsWith('temp-')) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('fde_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from state
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('[FDE Chat] Error deleting conversation:', error);
    }
  }, [selectedConversation?.id]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !currentOrg?.organization?.id || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const isNewConversation = selectedConversation?.id.startsWith('temp-');
    const conversationId = isNewConversation ? undefined : selectedConversation?.id;

    // Optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      organization_id: currentOrg.organization.id,
      conversation_id: conversationId || null,
      content: messageContent,
      sender_type: 'user',
      sender_user_id: user?.id || null,
      sender_name: currentUserName,
      created_at: new Date().toISOString(),
      slack_thread_ts: null,
      slack_channel_id: null,
      slack_message_ts: null,
      sender_avatar_url: null,
      attachments: [],
      is_read: true,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.organization.id,
          content: messageContent,
          userId: user?.id,
          userName: currentUserName,
          userEmail: currentUserEmail,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();

      // If new conversation, update state with real conversation
      if (isNewConversation && result.conversation) {
        const { data: newConv } = await supabase
          .from('fde_conversations')
          .select('*')
          .eq('id', result.conversation.id)
          .single();

        if (newConv) {
          // Remove temp, add real
          setConversations(prev => {
            const filtered = prev.filter(c => !c.id.startsWith('temp-'));
            return [newConv, ...filtered];
          });
          setSelectedConversation(newConv);
        }
      }

      // Handle optimistic message replacement
      if (result.message) {
        setMessages(prev => {
          const realExists = prev.some(m => m.id === result.message.id);
          if (realExists) {
            return prev.filter(m => m.id !== optimisticMessage.id);
          }
          return prev.map(m => m.id === optimisticMessage.id ? result.message : m);
        });
      }
    } catch (error) {
      console.error('[FDE Chat] Error sending:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  }, [newMessage, currentOrg?.organization?.id, selectedConversation?.id, user?.id, currentUserName, currentUserEmail, sending]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Status change
  const handleStatusChange = async (status: 'active' | 'resolved' | 'archived') => {
    if (!selectedConversation || selectedConversation.id.startsWith('temp-')) return;

    const { error } = await supabase
      .from('fde_conversations')
      .update({ status })
      .eq('id', selectedConversation.id);

    if (!error) {
      setSelectedConversation(prev => prev ? { ...prev, status } : null);
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id ? { ...c, status } : c
      ));
    }
  };

  // Formatters
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = formatDate(msg.created_at);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const currentStatus = selectedConversation ? statusConfig[selectedConversation.status] : null;

  return (
    <ResizableAppShell>
      <div className="flex h-screen w-full bg-[var(--surface-1)]">
        {/* Sidebar - Conversation List */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="flex-shrink-0 border-r border-[var(--stroke)] bg-[var(--surface-sheet)] relative z-20"
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id || null}
                onSelect={setSelectedConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                loading={loading}
                fdeName={fdeName}
                fdeAvatarUrl={fdeAvatarUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-white h-full">
          {/* Chat Header */}
          <header className="h-16 border-b border-[var(--stroke)] flex items-center justify-between px-6 flex-shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
              >
                {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>

              {selectedConversation ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-[var(--stroke)]">
                      {fdeAvatarUrl && <AvatarImage src={fdeAvatarUrl} alt={fdeName} />}
                      <AvatarFallback className="bg-[var(--surface-3)] text-[var(--text-2)] text-xs font-semibold">
                        {fdeInitials}
                      </AvatarFallback>
                    </Avatar>
                    {currentStatus && (
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                        currentStatus.color
                      )} />
                    )}
                  </div>
                  <div>
                    <h1 className="text-[14px] font-semibold text-[var(--text-1)] leading-tight">
                      {selectedConversation.title || 'Nueva conversación'}
                    </h1>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-[var(--text-3)]">{fdeName}</span>
                      {currentStatus && (
                        <>
                          <span className="text-[var(--text-3)]">•</span>
                          <span className={cn("text-[11px] font-medium", currentStatus.text)}>
                            {currentStatus.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <h1 className="text-[16px] font-semibold text-[var(--text-1)]">Mensajes</h1>
              )}
            </div>

            {selectedConversation && !selectedConversation.id.startsWith('temp-') && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                  <Info className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-5 bg-[var(--stroke)] mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                      <Circle className="h-3.5 w-3.5 mr-2 fill-emerald-500 text-emerald-500" />
                      Marcar activa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      Marcar resuelta
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                      <Archive className="h-3.5 w-3.5 mr-2 text-slate-400" />
                      Archivar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 relative">
            {!selectedConversation ? (
              <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                <div className="h-20 w-20 rounded-3xl bg-[var(--surface-2)] flex items-center justify-center mb-6 shadow-sm border border-[var(--stroke)]">
                  <MessageSquare className="h-8 w-8 text-[var(--text-3)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-1)] mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-[14px] text-[var(--text-2)] max-w-md mb-8 leading-relaxed">
                  Elige una conversación de la lista para continuar chateando o inicia un nuevo tema de consulta.
                </p>
                <Button 
                  onClick={handleNewConversation} 
                  size="lg"
                  className="h-11 px-6 bg-[var(--text-1)] hover:bg-[var(--text-1)]/90 rounded-full shadow-lg shadow-gray-200"
                >
                  Nueva conversación
                </Button>
              </div>
            ) : messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-3)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                <div className="h-16 w-16 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
                  <Send className="h-6 w-6 text-[var(--text-3)]" />
                </div>
                <h3 className="text-[16px] font-medium text-[var(--text-1)] mb-1">
                  Comienza a escribir
                </h3>
                <p className="text-[13px] text-[var(--text-3)] max-w-sm">
                  Envía un mensaje para contactar con {fdeName}.
                </p>
              </div>
            ) : (
              <div className="space-y-8 pb-24">
                {groupedMessages.map((group) => (
                  <div key={group.date} className="relative">
                    {/* Sticky Date */}
                    <div className="sticky top-0 flex justify-center z-10 pointer-events-none mb-6">
                      <span className="text-[11px] font-medium text-[var(--text-2)] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-[var(--stroke)]">
                        {group.date}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {group.messages.map((message, i, arr) => {
                          const isUser = message.sender_type === 'user';
                          // Check if previous message was from same sender to group visuals
                          const isSequence = i > 0 && arr[i-1].sender_type === message.sender_type;
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={cn(
                                "flex gap-3 max-w-3xl mx-auto", 
                                isUser ? "justify-end" : "justify-start"
                              )}
                            >
                              {/* FDE Avatar (only show for first message in sequence) */}
                              {!isUser && (
                                <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                  {!isSequence ? (
                                    <Avatar className="h-8 w-8 border border-[var(--stroke)] shadow-sm">
                                      {message.sender_avatar_url || fdeAvatarUrl ? (
                                        <AvatarImage src={message.sender_avatar_url || fdeAvatarUrl || ''} />
                                      ) : null}
                                      <AvatarFallback className="bg-[var(--surface-2)] text-[var(--text-2)] text-[10px] font-bold">
                                        {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : <div className="w-8" />}
                                </div>
                              )}
                              
                              <div className={cn(
                                "flex flex-col max-w-[75%]",
                                isUser ? "items-end" : "items-start"
                              )}>
                                {!isUser && !isSequence && (
                                  <span className="text-[11px] text-[var(--text-3)] ml-1 mb-1 font-medium">
                                    {message.sender_name}
                                  </span>
                                )}
                                
                                <div
                                  className={cn(
                                    "px-5 py-3 text-[14px] leading-relaxed shadow-sm",
                                    isUser
                                      ? "bg-[#111827] text-white rounded-[20px] rounded-br-md"
                                      : "bg-white text-[var(--text-1)] rounded-[20px] rounded-bl-md border border-[var(--stroke)]"
                                  )}
                                >
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                </div>
                                
                                <span className={cn(
                                  "text-[10px] text-[var(--text-3)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                  isUser ? "mr-1" : "ml-1"
                                )}>
                                  {formatTime(message.created_at)}
                                </span>
                              </div>

                              {/* User Avatar (optional, can be hidden for cleaner look) */}
                              {isUser && (
                                <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                  {!isSequence && (
                                    <Avatar className="h-8 w-8 border border-[var(--stroke)] bg-[var(--surface-2)]">
                                      <AvatarFallback className="text-[var(--text-2)] text-[10px] font-bold">
                                        {currentUserInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          {selectedConversation && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:px-8 lg:px-12 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
              <div className="max-w-3xl mx-auto relative">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-200 to-slate-100 rounded-[24px] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative flex items-end gap-2 bg-white rounded-[20px] shadow-xl border border-[var(--stroke)] p-2 pr-3">
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] flex-shrink-0"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    <Textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe un mensaje..."
                      className="min-h-[40px] max-h-32 resize-none text-[14px] border-0 focus-visible:ring-0 bg-transparent px-2 py-2.5 leading-6"
                      disabled={sending || selectedConversation.status === 'archived'}
                      rows={1}
                    />
                    
                    <Button 
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending || selectedConversation.status === 'archived'}
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-all duration-200 flex-shrink-0 shadow-sm",
                        newMessage.trim() 
                          ? "bg-[#111827] hover:bg-black text-white transform hover:scale-105" 
                          : "bg-[var(--surface-2)] text-[var(--text-3)] hover:bg-[var(--surface-3)]"
                      )}
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {selectedConversation.status === 'archived' ? (
                  <p className="text-[11px] text-amber-600 text-center mt-3 font-medium">
                    Conversación archivada. Envía un mensaje para reactivarla.
                  </p>
                ) : (
                  <p className="text-[11px] text-[var(--text-3)] text-center mt-3">
                    Presiona <kbd className="font-sans font-semibold">Enter</kbd> para enviar, <kbd className="font-sans font-semibold">Shift + Enter</kbd> para nueva línea
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResizableAppShell>
  );
}
