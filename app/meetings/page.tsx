"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  FileText,
  ChevronRight,
  MoreHorizontal,
  CalendarDays,
  Video,
  Trash2,
  Edit2,
  ArrowRight,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader
} from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { NewMeetingModal } from "@/components/meetings/new-meeting-modal";

// Types
interface Meeting {
  id: string;
  organization_id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  attendees: string[];
  notes: string;
  attachments: { name: string; url: string; type: string }[];
  meeting_type: 'weekly' | 'quarterly' | 'ad_hoc' | 'kickoff' | 'review';
  with_fde: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type FilterType = 'all' | 'upcoming' | 'past' | 'with_fde';

export default function MeetingsPage() {
  const router = useRouter();
  const { currentOrg } = useAuth();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);

  // Load meetings
  useEffect(() => {
    const loadMeetings = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_meetings')
          .select('*')
          .eq('organization_id', currentOrg.organization.id)
          .order('meeting_date', { ascending: false });

        if (error) throw error;
        setMeetings(data || []);
      } catch (error) {
        console.error('Error loading meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [currentOrg?.organization?.id]);

  // Filter and search meetings
  const filteredMeetings = React.useMemo(() => {
    let result = meetings;
    const now = new Date();

    // Apply filter
    if (filter === 'upcoming') {
      result = result.filter(m => new Date(m.meeting_date) >= now);
    } else if (filter === 'past') {
      result = result.filter(m => new Date(m.meeting_date) < now);
    } else if (filter === 'with_fde') {
      result = result.filter(m => m.with_fde);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.notes?.toLowerCase().includes(query) ||
        m.attendees?.some(a => a.toLowerCase().includes(query))
      );
    }

    return result;
  }, [meetings, filter, searchQuery]);

  // Group meetings by month
  const groupedMeetings = React.useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    
    filteredMeetings.forEach(meeting => {
      const date = new Date(meeting.meeting_date);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(meeting);
    });

    return groups;
  }, [filteredMeetings]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMeetingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      weekly: 'bg-blue-50 text-blue-700 border-blue-200',
      quarterly: 'bg-violet-50 text-violet-700 border-violet-200',
      ad_hoc: 'bg-slate-50 text-slate-700 border-slate-200',
      kickoff: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      review: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[type] || colors.ad_hoc;
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      const { error } = await supabase
        .from('fde_meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setMeetings(meetings.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleMeetingCreated = (newMeeting: Meeting) => {
    setMeetings([newMeeting, ...meetings]);
    setIsNewMeetingOpen(false);
  };

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Quick Access</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Meetings</span>
              </div>
              <Button 
                onClick={() => setIsNewMeetingOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-3 text-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Meeting
              </Button>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          {/* Header Section */}
          <div className="px-8 pt-6 pb-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Meetings</h1>
                <p className="text-sm text-slate-500">Notes and records from your FDE meetings</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {(['all', 'upcoming', 'past', 'with_fde'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : 
                     f === 'upcoming' ? 'Upcoming' : 
                     f === 'past' ? 'Past' : 'With FDE'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meetings List */}
          <div className="px-8 py-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading meetings...</div>
            ) : filteredMeetings.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No meetings found</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first meeting to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsNewMeetingOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    New Meeting
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedMeetings).map(([month, monthMeetings]) => (
                  <motion.div 
                    key={month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      {month}
                    </h2>
                    <div className="space-y-3">
                      {monthMeetings.map((meeting) => (
                        <motion.div
                          key={meeting.id}
                          className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                          whileHover={{ y: -2 }}
                          onClick={() => router.push(`/meetings/${meeting.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Date column - Notion style */}
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-2xl font-bold text-slate-900">
                                {new Date(meeting.meeting_date).getDate()}
                              </div>
                              <div className="text-xs text-slate-500 uppercase">
                                {new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-slate-900 group-hover:text-violet-600 transition-colors">
                                    {meeting.title}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {new Date(meeting.meeting_date).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                      {meeting.duration_minutes && ` · ${meeting.duration_minutes}min`}
                                    </span>
                                    {meeting.attendees?.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {meeting.attendees.length} attendees
                                      </span>
                                    )}
                                    {meeting.notes && (
                                      <span className="flex items-center gap-1">
                                        <FileText className="h-3.5 w-3.5" />
                                        Has notes
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getMeetingTypeColor(meeting.meeting_type)}`}
                                  >
                                    {meeting.meeting_type?.replace('_', ' ') || 'Meeting'}
                                  </Badge>
                                  {meeting.with_fde && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs bg-violet-50 text-violet-700 border-violet-200"
                                    >
                                      FDE
                                    </Badge>
                                  )}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/meetings/${meeting.id}`);
                                      }}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMeeting(meeting.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {/* Notes preview */}
                              {meeting.notes && (
                                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                                  {meeting.notes}
                                </p>
                              )}

                              {/* Attendees preview */}
                              {meeting.attendees?.length > 0 && (
                                <div className="flex items-center gap-1 mt-3">
                                  {meeting.attendees.slice(0, 4).map((attendee, idx) => (
                                    <div
                                      key={idx}
                                      className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 -ml-1 first:ml-0 ring-2 ring-white"
                                      title={attendee}
                                    >
                                      {attendee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  ))}
                                  {meeting.attendees.length > 4 && (
                                    <span className="text-xs text-slate-500 ml-1">
                                      +{meeting.attendees.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Arrow indicator */}
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResizablePageSheet>

      <NewMeetingModal 
        open={isNewMeetingOpen}
        onOpenChange={setIsNewMeetingOpen}
        organizationId={currentOrg?.organization?.id || ''}
        onMeetingCreated={handleMeetingCreated}
      />
    </ResizableAppShell>
  );
}

