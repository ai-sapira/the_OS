"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  CheckCircle2,
  Clock,
  Circle,
  Archive,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader
} from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

// Status config for conversation header
const statusConfig = {
  active: { color: 'bg-emerald-500', label: 'Activa', icon: Circle },
  pending: { color: 'bg-amber-500', label: 'Esperando respuesta', icon: Clock },
  resolved: { color: 'bg-slate-400', label: 'Resuelta', icon: CheckCircle2 },
  archived: { color: 'bg-slate-300', label: 'Archivada', icon: Archive },
};

export default function FDEChatPage() {
  const router = useRouter();
  const { currentOrg, user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // FDE Contact info from org settings
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

  // Get current user info
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
  const currentUserEmail = user?.email || '';

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

        // Auto-select first conversation if none selected
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
      if (!selectedConversation) {
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

        // Mark conversation as read
        if (selectedConversation.unread_count > 0) {
          await supabase.rpc('mark_conversation_as_read', { 
            p_conversation_id: selectedConversation.id 
          });
          
          // Update local state
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

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentOrg?.organization?.id) return;

    // Subscribe to new messages
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
          
          // If message is in current conversation, add to list
          if (newMsg.conversation_id === selectedConversation?.id) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
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
            setConversations(prev => [payload.new as Conversation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Conversation;
            setConversations(prev => {
              // Move updated conversation to top if it has new messages
              const filtered = prev.filter(c => c.id !== updated.id);
              return [updated, ...filtered];
            });
            // Update selected conversation if it's the one being updated
            if (selectedConversation?.id === updated.id) {
              setSelectedConversation(updated);
            }
          } else if (payload.eventType === 'DELETE') {
            setConversations(prev => prev.filter(c => c.id !== (payload.old as any).id));
            if (selectedConversation?.id === (payload.old as any).id) {
              setSelectedConversation(null);
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

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new conversation
  const handleNewConversation = async () => {
    if (!currentOrg?.organization?.id) return;

    // Create a new conversation optimistically
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
  };

  // Handle send message
  const handleSend = async () => {
    if (!newMessage.trim() || !currentOrg?.organization?.id || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Determine if this is a new conversation (temp ID)
    const isNewConversation = selectedConversation?.id.startsWith('temp-');
    const conversationId = isNewConversation ? undefined : selectedConversation?.id;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      organization_id: currentOrg.organization.id,
      conversation_id: conversationId || null,
      content: messageContent,
      sender_type: 'user',
      sender_user_id: user?.id || null,
      sender_name: currentUserName || 'You',
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
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();

      // If this was a new conversation, update the conversation list with the real ID
      if (isNewConversation && result.conversation) {
        // Fetch the new conversation from the server
        const { data: newConv } = await supabase
          .from('fde_conversations')
          .select('*')
          .eq('id', result.conversation.id)
          .single();

        if (newConv) {
          setConversations(prev => {
            const filtered = prev.filter(c => !c.id.startsWith('temp-'));
            return [newConv, ...filtered];
          });
          setSelectedConversation(newConv);
        }
      }

      // Replace optimistic message with real one
      if (result.message) {
        setMessages(prev => 
          prev.map(m => m.id === optimisticMessage.id ? result.message : m)
        );
      }
    } catch (error) {
      console.error('[FDE Chat] Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle conversation status change
  const handleStatusChange = async (status: 'active' | 'resolved' | 'archived') => {
    if (!selectedConversation) return;

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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
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

  // Current conversation status
  const currentStatus = selectedConversation ? statusConfig[selectedConversation.status] : null;

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/my-sapira')}
                  className="h-8 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {/* Toggle sidebar button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>

                {selectedConversation && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        {fdeAvatarUrl ? (
                          <AvatarImage src={fdeAvatarUrl} alt={fdeName} />
                        ) : null}
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-medium">
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
                      <h1 className="text-sm font-semibold text-slate-900">{selectedConversation.title}</h1>
                      <p className="text-xs text-slate-500">{currentStatus?.label}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {selectedConversation && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                        <Circle className="h-3 w-3 mr-2 fill-emerald-500 text-emerald-500" />
                        Marcar como activa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                        <CheckCircle2 className="h-3 w-3 mr-2 text-slate-500" />
                        Marcar como resuelta
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                        <Archive className="h-3 w-3 mr-2 text-slate-400" />
                        Archivar conversación
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4 flex h-[calc(100vh-120px)]">
          {/* Conversation sidebar */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={setSelectedConversation}
                  onNewConversation={handleNewConversation}
                  loading={loading}
                  fdeName={fdeName}
                  fdeAvatarUrl={fdeAvatarUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50">
              {!selectedConversation ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Selecciona una conversación</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Elige una conversación de la lista o inicia una nueva.
                  </p>
                  <Button 
                    onClick={handleNewConversation}
                    className="mt-4 bg-slate-900 hover:bg-slate-800"
                  >
                    Nueva conversación
                  </Button>
                </div>
              ) : messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-500">Cargando mensajes...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Inicia la conversación</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Envía un mensaje para comenzar. Tu equipo de soporte lo recibirá en Slack.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500 shadow-sm">
                          {group.date}
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <div className="space-y-3">
                        <AnimatePresence>
                          {group.messages.map((message) => {
                            const isUser = message.sender_type === 'user';
                            
                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isUser && (
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    {message.sender_avatar_url ? (
                                      <AvatarImage src={message.sender_avatar_url} />
                                    ) : fdeAvatarUrl ? (
                                      <AvatarImage src={fdeAvatarUrl} />
                                    ) : null}
                                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">
                                      {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`max-w-[70%] ${isUser ? 'order-1' : ''}`}>
                                  {!isUser && (
                                    <div className="text-xs text-slate-500 mb-1 ml-1">
                                      {message.sender_name}
                                    </div>
                                  )}
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 ${
                                      isUser
                                        ? 'bg-slate-900 text-white rounded-br-md'
                                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md shadow-sm'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'} px-1`}>
                                    <span className="text-[10px] text-slate-400">
                                      {formatTime(message.created_at)}
                                    </span>
                                    {isUser && (
                                      <CheckCircle2 className="h-3 w-3 text-slate-400" />
                                    )}
                                  </div>
                                </div>

                                {isUser && (
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-medium">
                                      {currentUserName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
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

            {/* Input area */}
            {selectedConversation && (
              <div className="border-t border-slate-200 bg-white px-6 py-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-end gap-3">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-slate-600">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="pr-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                        disabled={sending || selectedConversation.status === 'archived'}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending || selectedConversation.status === 'archived'}
                      className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-slate-800 p-0"
                    >
                      {sending ? (
                        <Clock className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  {selectedConversation.status === 'archived' ? (
                    <p className="text-xs text-amber-600 text-center mt-2">
                      Esta conversación está archivada. Reactívala para enviar mensajes.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 text-center mt-2">
                      Los mensajes se sincronizan con Slack. Tu equipo responderá lo antes posible.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}
