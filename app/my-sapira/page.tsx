"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Mail,
  TrendingUp,
  Handshake,
  Send,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout";
import { PopupModal } from "react-calendly";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

// API
import { IssuesAPI } from "@/lib/api/issues";
import type { Issue } from "@/lib/database/types";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'fdi';
  timestamp: Date;
}

export default function MySapiraPage() {
  const router = useRouter();
  
  // State for Calendly modal
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  
  // State for issues
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  
  // State for chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I saw you created a new ticket. How can I help you today?',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      id: '2',
      text: 'Thanks! I need help with the dashboard performance issue.',
      sender: 'user',
      timestamp: new Date(Date.now() - 169200000)
    },
    {
      id: '3',
      text: 'Sure! I\'ve already started looking into it. I\'ll have an update for you by tomorrow.',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 165600000)
    },
    {
      id: '4',
      text: 'Perfect, thanks for the quick response!',
      sender: 'user',
      timestamp: new Date(Date.now() - 162000000)
    },
    {
      id: '5',
      text: 'Good news! I found the bottleneck. The issue was with the SQL query indexing. I\'ve optimized it and the dashboard should load 3x faster now.',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '6',
      text: 'Wow, that\'s amazing! I just tested it and it\'s so much faster. Can you show me what changes you made?',
      sender: 'user',
      timestamp: new Date(Date.now() - 82800000)
    },
    {
      id: '7',
      text: 'Of course! I\'ll send you a summary document with the changes and best practices for database queries. Also, I\'ve scheduled a quick 15-min call for tomorrow to walk you through it.',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 79200000)
    },
    {
      id: '8',
      text: 'Sounds perfect. Looking forward to it!',
      sender: 'user',
      timestamp: new Date(Date.now() - 75600000)
    },
    {
      id: '9',
      text: 'By the way, I noticed you might benefit from implementing caching for the user analytics section. Want me to work on that next?',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: '10',
      text: 'Yes please! That would be great. What\'s the timeline?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000) // 30 min ago
    },
    {
      id: '11',
      text: 'I can have it ready by end of this week. I\'ll create a ticket and keep you posted on the progress.',
      sender: 'fdi',
      timestamp: new Date(Date.now() - 900000) // 15 min ago
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set root element after mount
  useEffect(() => {
    setRootElement(document.body);
    
    // Prefetch Calendly assets para carga más rápida
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(link);
  }, []);

  // Load recent issues for Pablo Senabre
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoadingIssues(true);
        // Gonvarri organization ID
        const organizationId = '01234567-8901-2345-6789-012345678901';
        const allIssues = await IssuesAPI.getIssues(organizationId);
        
        console.log('[MySapira] All issues:', allIssues.length);
        console.log('[MySapira] Looking for FDI user ID:', fdiUser.id);
        console.log('[MySapira] Sample issue assignees:', allIssues.slice(0, 3).map((i: Issue) => ({ 
          key: i.key, 
          assignee_id: i.assignee_id, 
          reporter_id: i.reporter_id 
        })));
        
        // Filter issues where assignee is Pablo Senabre (FDI user)
        // or where reporter is the current user
        const fdiIssues = allIssues
          .filter((issue: Issue) => 
            issue.assignee_id === fdiUser.id || 
            issue.reporter_id === fdiUser.id
          )
          .sort((a: Issue, b: Issue) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
          .slice(0, 5); // Get last 5 issues
        
        console.log('[MySapira] Filtered issues:', fdiIssues.length);
        
        // If no issues found with the FDI user, show the most recent 5 issues instead
        if (fdiIssues.length === 0) {
          console.log('[MySapira] No issues for FDI user, showing most recent issues');
          const recentIssues = allIssues
            .sort((a: Issue, b: Issue) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
            .slice(0, 5);
          setRecentIssues(recentIssues);
        } else {
          setRecentIssues(fdiIssues);
        }
      } catch (error) {
        console.error('Error loading issues:', error);
      } finally {
        setLoadingIssues(false);
      }
    };

    loadIssues();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mock data - Replace with real data from API
  const fdiUser = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Pablo Senabre",
    email: "pablo@sapira.ai",
    avatar_url: null,
    role: "Forward Deploy Engineer",
    calendly_url: "https://calendly.com/pablo-senabre-sapira/30min",
  };

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-500">Quick Access</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">My Sapira Relationship</span>
            </div>
          </div>
        }
      >
        {/* Container que va a los bordes - compensa el padding del sheet */}
        <div className="-mx-5 -mt-4">
          {/* Header Section */}
          <div className="border-b border-gray-200 px-5 pt-3 pb-2">
            <h1 className="text-sm font-semibold text-gray-900">
              Your Sapira FDE
            </h1>
          </div>

          {/* FDE Info Section */}
          <div className="px-5 pt-4">
            <div className="pb-6 mb-6 border-b border-gray-200 -mx-5 px-5">
              <div className="flex items-start gap-3">
                {/* Avatar cuadrado - altura igual a los 2 botones */}
                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 text-lg font-semibold">
                    {fdiUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Name + Email + Role - alineados con los botones */}
                <div className="flex flex-col justify-between h-16 flex-1">
                  {/* Primera línea - Nombre + Email chip */}
                  <div className="flex items-center gap-2 h-7">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {fdiUser.name}
                    </h3>
                    <a 
                      href={`mailto:${fdiUser.email}`}
                      className="inline-flex items-center h-6 px-2 text-xs text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                      {fdiUser.email}
                    </a>
                  </div>
                  
                  {/* Segunda línea - Cargo */}
                  <div className="flex items-center h-7">
                    <p className="text-base text-gray-700">
                      {fdiUser.role}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - definen la grid */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button 
                    size="sm" 
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={() => setIsCalendlyOpen(true)}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Book a call
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg"
                    onClick={() => window.location.href = `mailto:${fdiUser.email}`}
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Send email
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendly Modal */}
          {rootElement && (
            <PopupModal
              url={fdiUser.calendly_url}
              onModalClose={() => setIsCalendlyOpen(false)}
              open={isCalendlyOpen}
              rootElement={rootElement}
            />
          )}

          {/* Section 2: Interaction History with Chat */}
          <div className="px-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Interaction history</h2>
            <div className="pb-6 mb-6 border-b border-gray-200 -mx-5 px-5">
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                {/* Left: Stats en vertical */}
                <div className="flex flex-col gap-3">
                  {/* Open Tickets */}
                  <div className="border-dashed border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white flex-shrink-0">
                        <Clock className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-semibold text-gray-900">3</p>
                        <p className="text-xs text-gray-600">Open tickets</p>
                      </div>
                    </div>
                  </div>

                  {/* Resolved Tickets */}
                  <div className="border-dashed border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-semibold text-gray-900">12</p>
                        <p className="text-xs text-gray-600">Resolved</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="border-dashed border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-semibold text-gray-900">11</p>
                        <p className="text-xs text-gray-600">Messages</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Chat */}
                <div className="border border-dashed border-gray-200 rounded-lg bg-white flex flex-col h-[400px]">
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Chat with {fdiUser.name}</h3>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'fdi' && (
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-900 text-xs font-semibold">PS</span>
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            message.sender === 'user'
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-50 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">Yo</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 h-9 text-sm border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                      />
                      <Button
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="h-9 px-3 bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Tickets */}
          <div className="px-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Tickets
              </h2>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => router.push('/issues')}
              >
                View all
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Column Headers */}
              <div className="grid grid-cols-[80px_1fr_120px_140px] gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
                <div className="text-xs font-medium text-gray-500 uppercase">Key</div>
                <div className="text-xs font-medium text-gray-500 uppercase">Title</div>
                <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
                <div className="text-xs font-medium text-gray-500 uppercase">Date</div>
              </div>

              <div>
                {loadingIssues ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading tickets...
                  </div>
                ) : recentIssues.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No recent tickets found
                  </div>
                ) : (
                  recentIssues.map((issue, index) => {
                    // Helper function to get status badge
                    const getStatusBadge = (state: string) => {
                      const statusMap: Record<string, { label: string; colors: string }> = {
                        'done': { label: 'Done', colors: 'bg-green-50 text-green-700 border-green-200' },
                        'in_progress': { label: 'In Progress', colors: 'bg-blue-50 text-blue-700 border-blue-200' },
                        'todo': { label: 'To Do', colors: 'bg-gray-100 text-gray-700 border-gray-300' },
                        'blocked': { label: 'Blocked', colors: 'bg-red-50 text-red-700 border-red-200' },
                        'waiting_info': { label: 'Waiting', colors: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        'triage': { label: 'Triage', colors: 'bg-purple-50 text-purple-700 border-purple-200' },
                        'canceled': { label: 'Canceled', colors: 'bg-gray-100 text-gray-500 border-gray-300' },
                        'duplicate': { label: 'Duplicate', colors: 'bg-gray-100 text-gray-500 border-gray-300' },
                      };
                      return statusMap[state] || { label: state, colors: 'bg-gray-100 text-gray-700 border-gray-300' };
                    };

                    const status = getStatusBadge(issue.state || 'todo');
                    const date = new Date(issue.updated_at || issue.created_at || Date.now());
                    
                    return (
                      <div
                        key={issue.id}
                        className={`grid grid-cols-[80px_1fr_120px_140px] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          index < recentIssues.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                        onClick={() => router.push(`/issues/${issue.id}`)}
                      >
                        <div className="text-xs font-mono text-gray-500">
                          {issue.key}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${status.colors}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}

