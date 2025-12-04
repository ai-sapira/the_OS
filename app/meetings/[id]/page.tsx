"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  ArrowLeft,
  Save,
  Trash2,
  Edit2,
  Plus,
  X,
  Paperclip,
  Video,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader
} from "@/components/layout";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";

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

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentOrg } = useAuth();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [meetingType, setMeetingType] = useState<Meeting['meeting_type']>('weekly');
  const [withFde, setWithFde] = useState(true);
  const [newAttendee, setNewAttendee] = useState('');

  // Load meeting
  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) return;

      try {
        const { data, error } = await supabase
          .from('fde_meetings')
          .select('*')
          .eq('id', meetingId)
          .single();

        if (error) throw error;
        
        if (data) {
          setMeeting(data);
          setTitle(data.title);
          setMeetingDate(data.meeting_date ? new Date(data.meeting_date).toISOString().slice(0, 16) : '');
          setDurationMinutes(data.duration_minutes || 60);
          setAttendees(data.attendees || []);
          setNotes(data.notes || '');
          setMeetingType(data.meeting_type || 'weekly');
          setWithFde(data.with_fde ?? true);
        }
      } catch (error) {
        console.error('Error loading meeting:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [meetingId]);

  // Track changes
  useEffect(() => {
    if (!meeting) return;
    
    const changed = 
      title !== meeting.title ||
      notes !== (meeting.notes || '') ||
      meetingType !== meeting.meeting_type ||
      withFde !== meeting.with_fde ||
      durationMinutes !== meeting.duration_minutes ||
      JSON.stringify(attendees) !== JSON.stringify(meeting.attendees || []);
    
    setHasChanges(changed);
  }, [title, notes, meetingType, withFde, durationMinutes, attendees, meeting]);

  const handleSave = async () => {
    if (!meeting) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('fde_meetings')
        .update({
          title,
          meeting_date: meetingDate || null,
          duration_minutes: durationMinutes,
          attendees,
          notes,
          meeting_type: meetingType,
          with_fde: withFde,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meetingId);

      if (error) throw error;
      
      setMeeting({
        ...meeting,
        title,
        meeting_date: meetingDate,
        duration_minutes: durationMinutes,
        attendees,
        notes,
        meeting_type: meetingType,
        with_fde: withFde,
      });
      setHasChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving meeting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      const { error } = await supabase
        .from('fde_meetings')
        .delete()
        .eq('id', meetingId);
      
      if (error) throw error;
      router.push('/meetings');
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const addAttendee = () => {
    if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee('');
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet
          header={
            <PageHeader>
              <div className="flex items-center gap-2" style={{ paddingLeft: '28px' }}>
                <span className="text-[14px] text-gray-500">Loading...</span>
              </div>
            </PageHeader>
          }
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading meeting...</div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    );
  }

  if (!meeting) {
    return (
      <ResizableAppShell>
        <ResizablePageSheet
          header={
            <PageHeader>
              <div className="flex items-center gap-2" style={{ paddingLeft: '28px' }}>
                <span className="text-[14px] text-gray-500">Meeting not found</span>
              </div>
            </PageHeader>
          }
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-slate-500 mb-4">Meeting not found</p>
              <Button onClick={() => router.push('/meetings')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to meetings
              </Button>
            </div>
          </div>
        </ResizablePageSheet>
      </ResizableAppShell>
    );
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/meetings')}
                  className="h-8 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-[14px] text-gray-500">Meetings</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium truncate max-w-[200px]">{meeting.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Unsaved changes
                  </Badge>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="h-8 bg-slate-900 hover:bg-slate-800"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <motion.div 
          className="-mx-5 -mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header with title and meta */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-200 bg-white">
            <div className="max-w-3xl">
              {/* Title */}
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting title"
                className="text-2xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
              />
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <Input
                    type="datetime-local"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="h-8 w-auto border-slate-200"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
                    <SelectTrigger className="h-8 w-[120px] border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={meetingType} onValueChange={(v) => setMeetingType(v as Meeting['meeting_type'])}>
                  <SelectTrigger className="h-8 w-[130px] border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="ad_hoc">Ad hoc</SelectItem>
                    <SelectItem value="kickoff">Kickoff</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  onClick={() => setWithFde(!withFde)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    withFde 
                      ? 'bg-violet-100 text-violet-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {withFde && <Check className="h-3.5 w-3.5" />}
                  With FDE
                </button>
              </div>
            </div>
          </div>

          {/* Main content - Notion style */}
          <div className="px-8 py-8">
            <div className="max-w-3xl space-y-8">
              
              {/* Attendees Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {attendees.map((attendee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-700"
                    >
                      <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-600">
                        {attendee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {attendee}
                      <button
                        onClick={() => removeAttendee(idx)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    placeholder="Add attendee name..."
                    className="h-9 max-w-xs"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addAttendee}
                    disabled={!newAttendee.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notes Section - Notion style editor */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your meeting notes here...

You can include:
• Key discussion points
• Decisions made
• Action items
• Follow-ups needed"
                    className="min-h-[400px] border-none shadow-none resize-none focus-visible:ring-0 p-4 text-slate-700 leading-relaxed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Tip: Use bullet points (•) to organize your notes
                </p>
              </div>

              {/* Attachments placeholder */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </h3>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                  <Paperclip className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Drag and drop files here, or click to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, Word, Images up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}

