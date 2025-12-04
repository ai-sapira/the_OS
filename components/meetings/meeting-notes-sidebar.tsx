"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MeetingNote {
  id: string;
  title: string;
  meeting_date: string | null;
  notes: string;
  attendees: string[];
  created_at: string;
  updated_at: string;
}

interface MeetingNotesSidebarProps {
  notes: MeetingNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: MeetingNote) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  isCreating?: boolean;
}

export function MeetingNotesSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isCreating = false,
}: MeetingNotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.notes?.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  // Extract preview text from notes content
  const getPreviewText = (notesContent: string) => {
    if (!notesContent) return "";
    
    // If it's JSON (from Novel editor), try to extract text
    try {
      const parsed = JSON.parse(notesContent);
      if (parsed.content) {
        const textContent = extractTextFromJSON(parsed);
        return textContent.slice(0, 80);
      }
    } catch {
      return notesContent.slice(0, 80);
    }
    
    return "";
  };

  // Helper to extract text from Novel JSON structure
  const extractTextFromJSON = (node: any): string => {
    if (typeof node === "string") return node;
    if (node.text) return node.text;
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractTextFromJSON).join(" ");
    }
    return "";
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/80 border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreateNote}
            disabled={isCreating}
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
            isSearchFocused ? "text-gray-500" : "text-gray-400"
          }`} />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-8 pl-8 text-sm bg-white border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredNotes.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? "No notes found" : "No notes yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateNote}
                className="mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <button
                    onClick={() => onSelectNote(note)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group relative ${
                      selectedNoteId === note.id
                        ? "bg-white shadow-sm border border-gray-200"
                        : "hover:bg-white/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center gap-2">
                          <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${
                            selectedNoteId === note.id ? "text-gray-700" : "text-gray-400"
                          }`} />
                          <h3 className={`text-sm font-medium truncate ${
                            selectedNoteId === note.id ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {note.title || "Untitled"}
                          </h3>
                        </div>
                        
                        {/* Preview & Time */}
                        <div className="mt-1 ml-5.5 flex items-center gap-2">
                          {getPreviewText(note.notes) && (
                            <p className="text-xs text-gray-400 truncate flex-1">
                              {getPreviewText(note.notes)}
                            </p>
                          )}
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {formatRelativeTime(note.updated_at || note.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* More menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`p-1 rounded transition-all cursor-pointer ${
                              selectedNoteId === note.id 
                                ? "opacity-100 hover:bg-gray-100" 
                                : "opacity-0 group-hover:opacity-100 hover:bg-gray-200/50"
                            }`}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                            }}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 text-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
