"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
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
  CheckCheck,
  Clock,
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

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";

interface Message {
  id: string;
  organization_id: string;
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

export default function FDEChatPage() {
  const router = useRouter();
  const { currentOrg, user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

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

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_messages')
          .select('*')
          .eq('organization_id', currentOrg.organization.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('fde_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fde_messages',
          filter: `organization_id=eq.${currentOrg?.organization?.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrg?.organization?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentOrg?.organization?.id || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Message will be added via realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-slate-900">{fdeName}</h1>
                    <p className="text-xs text-slate-500">{fdeRole}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
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
        <div className="-mx-5 -mt-4 flex flex-col h-[calc(100vh-120px)]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-500">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-violet-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Start a conversation</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Send a message to your FDE. They'll receive it in Slack and respond directly.
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
                                    <CheckCheck className="h-3 w-3 text-slate-400" />
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
                    placeholder="Type a message..."
                    className="pr-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    disabled={sending}
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
                  disabled={!newMessage.trim() || sending}
                  className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-slate-800 p-0"
                >
                  {sending ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-slate-400 text-center mt-2">
                Messages are synced with Slack. Your FDE will respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}

