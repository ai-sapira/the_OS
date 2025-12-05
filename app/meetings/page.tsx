"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FileText, ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader
} from "@/components/layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PopupModal } from "react-calendly";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { MeetingNotesSidebar, type MeetingNote } from "@/components/meetings/meeting-notes-sidebar";
import { MeetingNotesEditor } from "@/components/meetings/meeting-notes-editor";

export default function MeetingsPage() {
  const router = useRouter();
  const { currentOrg } = useAuth();
  
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  // Set root element after mount for Calendly modal
  useEffect(() => {
    setRootElement(document.body);
  }, []);

  // Get FDE calendly URL from organization settings
  const fdeCalendlyUrl = useMemo(() => {
    const organizationSettings = (currentOrg?.organization?.settings as Record<string, any> | undefined) ?? {};
    const sapiraContact = organizationSettings.sapira_contact as {
      calendly_url?: string;
      name?: string;
    } | undefined;
    return sapiraContact?.calendly_url || null;
  }, [currentOrg?.organization?.settings]);

  const fdeName = useMemo(() => {
    const organizationSettings = (currentOrg?.organization?.settings as Record<string, any> | undefined) ?? {};
    const sapiraContact = organizationSettings.sapira_contact as {
      name?: string;
    } | undefined;
    return sapiraContact?.name || 'tu FDE';
  }, [currentOrg?.organization?.settings]);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('fde_meetings')
          .select('id, title, meeting_date, notes, attendees, created_at, updated_at')
          .eq('organization_id', currentOrg.organization.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        const formattedNotes: MeetingNote[] = (data || []).map((item) => ({
          id: item.id,
          title: item.title || "Untitled",
          meeting_date: item.meeting_date,
          notes: item.notes || "",
          attendees: item.attendees || [],
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        
        setNotes(formattedNotes);
        
        // Auto-select first note if available
        if (formattedNotes.length > 0 && !selectedNote) {
          setSelectedNote(formattedNotes[0]);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [currentOrg?.organization?.id]);

  // Create new note
  const handleCreateNote = async () => {
    if (!currentOrg?.organization?.id || isCreating) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('fde_meetings')
        .insert({
          organization_id: currentOrg.organization.id,
          title: "",
          notes: "",
          attendees: [],
          meeting_type: 'ad_hoc',
          with_fde: false,
        })
        .select('id, title, meeting_date, notes, attendees, created_at, updated_at')
        .single();

      if (error) throw error;
      
      if (data) {
        const newNote: MeetingNote = {
          id: data.id,
          title: data.title || "",
          meeting_date: data.meeting_date,
          notes: data.notes || "",
          attendees: data.attendees || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Save note updates
  const handleSaveNote = useCallback(async (updates: Partial<MeetingNote>) => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('fde_meetings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      // Update local state
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNote.id
            ? { ...note, ...updates, updated_at: new Date().toISOString() }
            : note
        )
      );
      
      setSelectedNote((prev) =>
        prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
      );
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [selectedNote]);

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const { error } = await supabase
        .from('fde_meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Update local state
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      
      // If deleted note was selected, select another one
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNotes[0] || null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Select note
  const handleSelectNote = (note: MeetingNote) => {
    setSelectedNote(note);
  };

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-[14px] text-gray-500">Quick Access</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Meeting Notes</span>
              </div>
              
              {/* Book meeting with FDE button */}
              <Button
                onClick={() => {
                  if (fdeCalendlyUrl) {
                    setIsCalendlyOpen(true)
                  } else {
                    // Open Google Calendar Appointment Scheduling
                    window.open('https://calendar.app.google/s3Ao3Dx3KmTqdWfe6', '_blank')
                  }
                }}
                size="sm"
                className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book meeting with your FDE
              </Button>
            </div>
          </PageHeader>
        }
      >
        {/* Main content */}
        <div className="-mx-5 -mt-4 h-full">
            {loading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Loading notes...</p>
              </motion.div>
            </div>
            ) : (
                  <motion.div 
              className="flex h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sidebar - narrower */}
              <div className="w-64 flex-shrink-0 h-full">
                <MeetingNotesSidebar
                  notes={notes}
                  selectedNoteId={selectedNote?.id || null}
                  onSelectNote={handleSelectNote}
                  onCreateNote={handleCreateNote}
                  onDeleteNote={handleDeleteNote}
                  isCreating={isCreating}
                />
                            </div>

              {/* Editor - full width */}
              <div className="flex-1 h-full relative bg-white">
                <MeetingNotesEditor
                  key={selectedNote?.id}
                  note={selectedNote}
                  onSave={handleSaveNote}
                />
              </div>
            </motion.div>
            )}
        </div>
        
        {/* Calendly Modal */}
        {rootElement && fdeCalendlyUrl && (
          <PopupModal
            url={fdeCalendlyUrl}
            onModalClose={() => setIsCalendlyOpen(false)}
            open={isCalendlyOpen}
            rootElement={rootElement}
          />
        )}
      </ResizablePageSheet>
    </ResizableAppShell>
  );
}
