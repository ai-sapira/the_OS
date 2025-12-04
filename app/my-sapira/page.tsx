"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  ArrowRight,
  FileText,
  Users,
  Sparkles,
  ExternalLink,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout";
import { PopupModal } from "react-calendly";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// API
import { IssuesAPI } from "@/lib/api/initiatives";
import type { Issue } from "@/lib/database/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";

// Types for meetings
interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  attendees: string[];
  notes: string;
  meeting_type: 'weekly' | 'quarterly' | 'ad_hoc' | 'kickoff' | 'review';
  with_fde: boolean;
}

// Types for messages
interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'fde' | 'system';
  sender_name: string;
  created_at: string;
}

export default function MySapiraPage() {
  const router = useRouter();
  
  // State for Calendly modal
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  
  // State for issues
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  
  // State for meetings
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Set root element after mount
  useEffect(() => {
    setRootElement(document.body);
  }, []);

  const { currentOrg } = useAuth();

  const organizationSettings = (currentOrg?.organization?.settings as Record<string, any> | undefined) ?? {}
  const sapiraContact = organizationSettings.sapira_contact as {
    name?: string
    email?: string
    role?: string
    calendly_url?: string
    avatar_url?: string
    user_id?: string
    bio?: string
    location?: string
    phone?: string
    skills?: string[]
  } | undefined

  const contactName = sapiraContact?.name || 'Sapira Team'
  const contactEmail = sapiraContact?.email || 'support@sapira.ai'
  const contactRole = sapiraContact?.role || 'Forward Deploy Engineer'
  const contactCalendlyUrl = sapiraContact?.calendly_url || null
  const contactAvatarUrl = sapiraContact?.avatar_url || null
  const contactBio = sapiraContact?.bio || 'Your dedicated FDE, here to help you get the most out of Sapira. I specialize in automation, AI implementations, and making your workflows seamless.'
  const contactLocation = sapiraContact?.location || 'Madrid, Spain'
  const contactPhone = sapiraContact?.phone || null
  const contactSkills = sapiraContact?.skills || ['Automation', 'AI/ML', 'Process Optimization', 'Integration']
  const contactInitials = contactName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'ST'
  const contactUserId = sapiraContact?.user_id || null

  // Stats calculations
  const openIssuesCount = React.useMemo(
    () =>
      recentIssues.filter(
        (issue) => issue.state && !['done', 'canceled', 'duplicate'].includes(issue.state)
      ).length,
    [recentIssues]
  )
  const resolvedIssuesCount = React.useMemo(
    () => recentIssues.filter((issue) => issue.state === 'done').length,
    [recentIssues]
  )

  // Load recent issues
  useEffect(() => {
    const loadIssues = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingIssues(false);
        return;
      }

      try {
        setLoadingIssues(true);
        const organizationId = currentOrg.organization.id;
        const allIssues = await IssuesAPI.getIssues(organizationId);

        let relevantIssues = allIssues;
        if (contactUserId) {
          relevantIssues = allIssues.filter((issue: Issue) =>
            issue.assignee_id === contactUserId || issue.reporter_id === contactUserId
          );
        }
        if (relevantIssues.length === 0) {
          relevantIssues = allIssues;
        }

        const sortedIssues = [...relevantIssues]
          .sort(
            (a: Issue, b: Issue) =>
              new Date(b.updated_at || b.created_at || 0).getTime() -
              new Date(a.updated_at || a.created_at || 0).getTime()
          )
          .slice(0, 5);

        setRecentIssues(sortedIssues);
      } catch (error) {
        console.error('Error loading issues:', error);
      } finally {
        setLoadingIssues(false);
      }
    };

    if (currentOrg?.organization?.id) {
      loadIssues();
    }
  }, [currentOrg?.organization?.id, contactUserId]);

  // Load meetings from Supabase
  useEffect(() => {
    const loadMeetings = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingMeetings(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_meetings')
          .select('*')
          .eq('organization_id', currentOrg.organization.id)
          .order('meeting_date', { ascending: false })
          .limit(3);

        if (error) throw error;
        setMeetings(data || []);
      } catch (error) {
        console.error('Error loading meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };

    loadMeetings();
  }, [currentOrg?.organization?.id]);

  // Load messages from Supabase
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingMessages(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_messages')
          .select('*')
          .eq('organization_id', currentOrg.organization.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentOrg?.organization?.id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const formatMeetingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-500">Quick Access</span>
              <span className="text-[14px] text-gray-400">›</span>
              <span className="text-[14px] font-medium">My Sapira</span>
            </div>
          </div>
        }
      >
        <motion.div 
          className="-mx-5 -mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section - CV Style */}
          <motion.div 
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden"
            variants={itemVariants}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }} />
            </div>
            
            <div className="relative px-8 py-10">
              <div className="flex items-start gap-8">
                {/* Avatar - Large and prominent */}
                <motion.div 
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                    {contactAvatarUrl ? (
                      <img src={contactAvatarUrl} alt={contactName} className="h-32 w-32 object-cover" />
                    ) : (
                      <span className="text-white text-4xl font-bold tracking-tight">
                        {contactInitials}
                      </span>
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight mb-1">
                        {contactName}
                      </h1>
                      <p className="text-lg text-slate-300 font-medium mb-3">
                        {contactRole}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {contactLocation}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          {contactEmail}
                        </span>
                        {contactPhone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {contactPhone}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {contactCalendlyUrl && (
                        <Button 
                          onClick={() => setIsCalendlyOpen(true)}
                          className="bg-white text-slate-900 hover:bg-slate-100 font-medium h-10 px-5"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book a call
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/fde/chat')}
                        className="border-white/20 text-white hover:bg-white/10 font-medium h-10 px-5"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <p className="text-slate-300 mt-4 max-w-2xl leading-relaxed">
                    {contactBio}
                  </p>
                  
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {contactSkills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="px-8 py-6 bg-slate-50 border-b border-slate-200"
            variants={itemVariants}
          >
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{openIssuesCount}</div>
                <div className="text-sm text-slate-500 mt-1">Open Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{resolvedIssuesCount}</div>
                <div className="text-sm text-slate-500 mt-1">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{meetings.length}</div>
                <div className="text-sm text-slate-500 mt-1">Meetings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{messages.length}</div>
                <div className="text-sm text-slate-500 mt-1">Messages</div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Meetings Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Meetings</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/meetings')}
                    className="text-slate-600 hover:text-slate-900 gap-1"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {loadingMeetings ? (
                    <div className="text-center py-8 text-slate-500">Loading meetings...</div>
                  ) : meetings.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No meetings scheduled</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => router.push('/meetings')}
                      >
                        Schedule one
                      </Button>
                    </div>
                  ) : (
                    meetings.map((meeting) => (
                      <motion.div
                        key={meeting.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                        whileHover={{ y: -2 }}
                        onClick={() => router.push(`/meetings/${meeting.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate">{meeting.title}</h3>
                            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatMeetingDate(meeting.meeting_date)}
                              </span>
                              {meeting.attendees?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {meeting.attendees.length} attendees
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              meeting.with_fde 
                                ? 'bg-violet-50 text-violet-700 border-violet-200' 
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {meeting.meeting_type || 'Meeting'}
                          </Badge>
                        </div>
                        {meeting.notes && (
                          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{meeting.notes}</p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Chat Preview Section */}
              <motion.div variants={itemVariants}>
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
                  {loadingMessages ? (
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
                        {messages.map((message) => (
                          <div key={message.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender_type === 'fde' 
                                  ? 'bg-violet-100 text-violet-700' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                <span className="text-xs font-semibold">
                                  {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
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
                          </div>
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
              </motion.div>

              {/* Recent Activity / Issues */}
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/initiatives')}
                    className="text-slate-600 hover:text-slate-900 gap-1"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {loadingIssues ? (
                    <div className="text-center py-8 text-slate-500">Loading activity...</div>
                  ) : recentIssues.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No recent activity</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentIssues.map((issue) => {
                          const getStatusBadge = (state: string) => {
                            const statusMap: Record<string, { label: string; colors: string }> = {
                              'done': { label: 'Done', colors: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                              'in_progress': { label: 'In Progress', colors: 'bg-blue-50 text-blue-700 border-blue-200' },
                              'todo': { label: 'To Do', colors: 'bg-slate-100 text-slate-700 border-slate-200' },
                              'blocked': { label: 'Blocked', colors: 'bg-red-50 text-red-700 border-red-200' },
                              'waiting_info': { label: 'Waiting', colors: 'bg-amber-50 text-amber-700 border-amber-200' },
                              'triage': { label: 'Triage', colors: 'bg-slate-50 text-slate-600 border-slate-200' },
                            };
                            return statusMap[state] || { label: state, colors: 'bg-slate-100 text-slate-700 border-slate-200' };
                          };

                          const status = getStatusBadge(issue.state || 'todo');
                          const date = new Date(issue.updated_at || issue.created_at || Date.now());
                          
                          return (
                            <tr 
                              key={issue.id}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => router.push(`/initiatives/${issue.id}`)}
                            >
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono text-slate-500">{issue.key}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-slate-900">{issue.title}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.colors}`}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-slate-500">
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Calendly Modal */}
          {rootElement && contactCalendlyUrl && (
            <PopupModal
              url={contactCalendlyUrl}
              onModalClose={() => setIsCalendlyOpen(false)}
              open={isCalendlyOpen}
              rootElement={rootElement}
            />
          )}
        </motion.div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}
