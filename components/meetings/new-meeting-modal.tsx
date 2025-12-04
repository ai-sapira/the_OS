"use client";

import * as React from "react";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  X,
  Plus,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase/client";

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

interface NewMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onMeetingCreated: (meeting: Meeting) => void;
}

export function NewMeetingModal({ 
  open, 
  onOpenChange, 
  organizationId,
  onMeetingCreated 
}: NewMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [meetingType, setMeetingType] = useState<Meeting['meeting_type']>('weekly');
  const [withFde, setWithFde] = useState(true);
  const [newAttendee, setNewAttendee] = useState('');

  const resetForm = () => {
    setTitle('');
    setMeetingDate('');
    setDurationMinutes(60);
    setAttendees([]);
    setNotes('');
    setMeetingType('weekly');
    setWithFde(true);
    setNewAttendee('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
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

  const handleSubmit = async () => {
    if (!title.trim() || !organizationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fde_meetings')
        .insert({
          organization_id: organizationId,
          title: title.trim(),
          meeting_date: meetingDate || null,
          duration_minutes: durationMinutes,
          attendees,
          notes: notes.trim(),
          meeting_type: meetingType,
          with_fde: withFde,
          attachments: [],
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        onMeetingCreated(data);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="New Meeting"
      subtitle="Create a new meeting record"
      icon={<Calendar className="h-5 w-5" />}
    >
      <ModalBody className="px-6 py-6 space-y-6">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Meeting Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Sync, Quarterly Review..."
            className="h-10"
          />
        </div>

        {/* Date and Duration row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Date & Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Duration
            </label>
            <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
              <SelectTrigger className="h-10">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Type and FDE row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Meeting Type
            </label>
            <Select value={meetingType} onValueChange={(v) => setMeetingType(v as Meeting['meeting_type'])}>
              <SelectTrigger className="h-10">
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
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              With FDE
            </label>
            <button
              onClick={() => setWithFde(!withFde)}
              className={`w-full h-10 flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
                withFde 
                  ? 'bg-violet-100 text-violet-700 border-violet-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {withFde && <Check className="h-4 w-4" />}
              {withFde ? 'Yes, with FDE' : 'No FDE'}
            </button>
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Attendees
          </label>
          {attendees.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attendees.map((attendee, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-sm text-slate-700"
                >
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
          )}
          <div className="flex items-center gap-2">
            <Input
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
              placeholder="Add attendee name..."
              className="h-10"
            />
            <Button 
              variant="outline" 
              onClick={addAttendee}
              disabled={!newAttendee.trim()}
              className="h-10 px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Notes (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any initial notes or agenda items..."
            rows={4}
          />
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!title.trim() || loading}
          className="bg-slate-900 hover:bg-slate-800"
        >
          {loading ? 'Creating...' : 'Create Meeting'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

