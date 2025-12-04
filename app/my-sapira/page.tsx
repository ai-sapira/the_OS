"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Mail,
  ArrowRight,
  FileText,
  Users,
  Zap,
  Phone,
  MapPin,
  ChevronDown,
  Sparkles,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet
} from "@/components/layout";
import { PopupModal } from "react-calendly";
import { motion, AnimatePresence } from "framer-motion";

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

// MeetingList component - similar to Home page style
function MeetingList({ meetings, isPast = false }: { meetings: Meeting[], isPast?: boolean }) {
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set())

  const toggleMeeting = (meetingId: string) => {
    const newExpanded = new Set(expandedMeetings)
    if (newExpanded.has(meetingId)) {
      newExpanded.delete(meetingId)
    } else {
      newExpanded.add(meetingId)
    }
    setExpandedMeetings(newExpanded)
  }

  const formatMeetingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 0) return `${Math.abs(Math.floor(diffDays / 7))} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => {
        const isExpanded = expandedMeetings.has(meeting.id)
        const hasDetails = (meeting.attendees && meeting.attendees.length > 0) || meeting.notes

        return (
          <div key={meeting.id} className={`${isPast ? 'opacity-60' : ''}`}>
            <div 
              className={`flex items-center gap-3 p-2 hover:bg-gray-50/80 rounded-lg transition-colors group ${hasDetails ? 'cursor-pointer' : ''}`}
              onClick={() => hasDetails && toggleMeeting(meeting.id)}
            >
              <Badge 
                variant="outline" 
                className={`text-[10px] font-medium shrink-0 ${
                  meeting.with_fde 
                    ? isPast
                      ? "bg-purple-50 border-purple-200 text-purple-500"
                      : "bg-purple-50 border-purple-200 text-purple-700"
                    : isPast
                      ? "bg-gray-50 border-gray-200 text-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {formatMeetingDate(meeting.meeting_date)}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium truncate ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>
                    {meeting.title}
                  </h3>
                  {meeting.with_fde && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 bg-purple-50 border-purple-200 ${isPast ? 'text-purple-500' : 'text-purple-600'}`}>
                      FDE
                    </Badge>
                  )}
                </div>
                <div className={`flex items-center gap-2 text-xs mt-0.5 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{getRelativeDate(meeting.meeting_date)}</span>
                  <span className="text-gray-300">·</span>
                  <span>{meeting.duration_minutes} min</span>
                </div>
              </div>
              {hasDetails && (
                <ChevronDown 
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            
            <AnimatePresence>
              {isExpanded && hasDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 ml-11 space-y-2 pb-2"
                >
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Users className="h-3 w-3 text-gray-500" />
                        Attendees ({meeting.attendees.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.attendees.map((attendee, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-700 border-gray-200"
                          >
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {meeting.notes && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <FileText className="h-3 w-3 text-gray-500" />
                        Notes
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2 line-clamp-3">
                        {meeting.notes}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
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
  
  // State for message count
  const [messageCount, setMessageCount] = useState(0);

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
  const contactBio = sapiraContact?.bio || 'Your dedicated FDE, here to help you get the most out of Sapira.'
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
          .slice(0, 4);

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
          .limit(5);

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

  // Load message count from Supabase
  useEffect(() => {
    const loadMessageCount = async () => {
      if (!currentOrg?.organization?.id) return;

      try {
        const { count, error } = await supabase
          .from('fde_messages')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrg.organization.id);

        if (error) throw error;
        setMessageCount(count || 0);
      } catch (error) {
        console.error('Error loading message count:', error);
      }
    };

    loadMessageCount();
  }, [currentOrg?.organization?.id]);

  // Separate meetings into upcoming and past
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.meeting_date) >= now);
  const pastMeetings = meetings.filter(m => new Date(m.meeting_date) < now);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
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
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header - Compact CV Style */}
          <motion.div 
            className="flex items-center gap-5"
            variants={itemVariants}
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {contactAvatarUrl ? (
                    <img src={contactAvatarUrl} alt={contactName} className="h-16 w-16 object-cover" />
                  ) : (
                  <span className="text-gray-600 text-xl font-semibold">
                      {contactInitials}
                    </span>
                  )}
                </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full" />
              </div>
                  </div>
                  
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {contactName}
                </h1>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                  Available
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-1.5">
                      {contactRole}
                    </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {contactLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {contactEmail}
                </span>
                  </div>
                </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              {contactCalendlyUrl && (
                    <Button 
                  onClick={() => setIsCalendlyOpen(true)}
                      size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-3"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Book call
                    </Button>
                  )}
                  <Button 
                variant="outline"
                    size="sm" 
                onClick={() => router.push('/fde/chat')}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs h-8 px-3"
                  >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Chat
                  </Button>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {/* Stats Card - spans 1 col */}
            <motion.div 
              className="border border-gray-200 rounded-xl bg-white p-4 space-y-4"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Stats</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">{openIssuesCount}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Open</div>
            </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">{resolvedIssuesCount}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Resolved</div>
          </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">{meetings.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Meetings</div>
                      </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">{messageCount}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Messages</div>
                      </div>
                    </div>
            </motion.div>

            {/* Meetings Card - spans 2 cols */}
            <motion.div 
              className="col-span-2 border border-gray-200 rounded-xl bg-white p-4 space-y-3"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Calendar</p>
                    <h2 className="text-sm font-medium text-gray-900">Meetings</h2>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/meetings')}
                  className="text-xs gap-1 border border-gray-200 bg-white hover:bg-gray-50 h-7 px-2"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
                  </div>

              {loadingMeetings ? (
                <div className="text-center py-6 text-gray-500 text-sm">Loading meetings...</div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500">No meetings scheduled</p>
                      </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.length > 0 && (
                    <MeetingList meetings={upcomingMeetings} />
                  )}
                  
                  {pastMeetings.length > 0 && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Past meetings</p>
                        <MeetingList meetings={pastMeetings.slice(0, 2)} isPast={true} />
                      </div>
                    </>
                  )}
                    </div>
              )}
            </motion.div>

            {/* Chat Card - Simple CTA */}
            <motion.div 
              className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Chat</h2>
              </div>
              
              <p className="text-xs text-gray-500 mb-4 flex-1">
                Connect directly with your FDE via Slack-integrated messaging.
              </p>
              
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs h-8"
                onClick={() => router.push('/fde/chat')}
              >
                Open chat
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </motion.div>

            {/* Contact Card */}
            <motion.div 
              className="border border-gray-200 rounded-xl bg-white p-4 space-y-3"
              variants={itemVariants}
            >
                    <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                <h2 className="text-sm font-medium text-gray-900">Contact</h2>
                  </div>

              <div className="space-y-2">
                <a 
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {contactEmail}
                </a>
                {contactPhone && (
                  <a 
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {contactPhone}
                  </a>
                )}
                  </div>

              {contactCalendlyUrl && (
                      <Button
                  variant="outline"
                        size="sm"
                  onClick={() => setIsCalendlyOpen(true)}
                  className="w-full text-xs h-8 border-gray-200"
                      >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Schedule meeting
                      </Button>
              )}
            </motion.div>

            {/* Skills Card */}
            <motion.div 
              className="border border-gray-200 rounded-xl bg-white p-4 space-y-3"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Expertise</h2>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {contactSkills.map((skill, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                  >
                    {skill}
                  </Badge>
                ))}
          </div>

              {contactBio && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {contactBio}
                </p>
              )}
            </motion.div>

            {/* Recent Activity Card - spans full width */}
            <motion.div 
              className="col-span-3 border border-gray-200 rounded-xl bg-white p-4 space-y-3"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <h2 className="text-sm font-medium text-gray-900">Recent Activity</h2>
                </div>
              <Button 
                  variant="ghost" 
                size="sm" 
                onClick={() => router.push('/initiatives')}
                  className="text-xs gap-1 border border-gray-200 bg-white hover:bg-gray-50 h-7 px-2"
              >
                View all
                  <ArrowRight className="h-3 w-3" />
              </Button>
              </div>

                {loadingIssues ? (
                <div className="text-center py-6 text-gray-500 text-sm">Loading activity...</div>
                ) : recentIssues.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500">No recent activity</p>
                  </div>
                ) : (
                <div className="space-y-2">
                  {recentIssues.map((issue) => {
                    const getStatusBadge = (state: string) => {
                      const statusMap: Record<string, { label: string; colors: string }> = {
                        'done': { label: 'Done', colors: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        'in_progress': { label: 'In Progress', colors: 'bg-blue-50 text-blue-700 border-blue-200' },
                        'todo': { label: 'To Do', colors: 'bg-gray-100 text-gray-700 border-gray-200' },
                        'blocked': { label: 'Blocked', colors: 'bg-red-50 text-red-700 border-red-200' },
                        'waiting_info': { label: 'Waiting', colors: 'bg-amber-50 text-amber-700 border-amber-200' },
                        'triage': { label: 'Triage', colors: 'bg-gray-50 text-gray-600 border-gray-200' },
                      };
                      return statusMap[state] || { label: state, colors: 'bg-gray-100 text-gray-700 border-gray-200' };
                    };

                    const status = getStatusBadge(issue.state || 'todo');
                    
                    return (
                      <div
                        key={issue.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => router.push(`/initiatives/${issue.id}`)}
                      >
                        <span className="text-xs font-mono text-gray-400 shrink-0 w-16">{issue.key}</span>
                        <span className="text-sm text-gray-900 flex-1 truncate group-hover:text-gray-700">{issue.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-2 py-0.5 shrink-0 ${status.colors}`}
                        >
                            {status.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>

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
