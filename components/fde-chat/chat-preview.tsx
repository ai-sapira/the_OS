"use client";

import * as React from "react";
import { MessageSquare, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  sender_type: 'user' | 'fde' | 'system';
  sender_name: string;
  sender_avatar_url?: string | null;
  content: string;
  created_at: string;
}

interface ChatPreviewProps {
  messages: Message[];
  loading: boolean;
  fdeName: string;
  fdeAvatarUrl?: string | null;
}

export function ChatPreview({ messages, loading, fdeName, fdeAvatarUrl }: ChatPreviewProps) {
  const router = useRouter();
  
  const fdeInitials = fdeName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'ST';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Messages</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/fde/chat')}
          className="text-slate-600 hover:text-slate-900 gap-1"
        >
          Open chat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No messages yet</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={() => router.push('/fde/chat')}
            >
              Start a conversation
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {messages.slice(0, 3).map((message) => (
                <motion.div 
                  key={message.id} 
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push('/fde/chat')}
                  whileHover={{ backgroundColor: 'rgb(248, 250, 252)' }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.sender_type === 'fde' ? (
                        fdeAvatarUrl ? (
                          <AvatarImage src={fdeAvatarUrl} />
                        ) : null
                      ) : null}
                      <AvatarFallback className={`text-xs font-semibold ${
                        message.sender_type === 'fde' 
                          ? 'bg-violet-100 text-violet-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{message.sender_name}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => router.push('/fde/chat')}
              >
                <Send className="h-4 w-4 mr-2" />
                Send a message
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


