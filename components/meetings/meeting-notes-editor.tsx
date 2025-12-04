"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Users,
  X,
  Check,
  Clock,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  CheckSquare,
  Quote,
  Code,
  Hash,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  EditorBubble,
  EditorBubbleItem,
  type JSONContent,
  // Extensions
  StarterKit,
  TiptapLink,
  TiptapUnderline,
  TaskList,
  TaskItem,
  TextStyle,
  Color,
  Placeholder,
} from "novel";
import { type MeetingNote } from "./meeting-notes-sidebar";

interface MeetingNotesEditorProps {
  note: MeetingNote | null;
  onSave: (updates: Partial<MeetingNote>) => Promise<void>;
  isSaving?: boolean;
}

// Slash command suggestions
const suggestionItems = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: <List className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Track tasks with checkboxes",
    icon: <CheckSquare className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: <Quote className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet",
    icon: <Code className="h-4 w-4" />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];

export function MeetingNotesEditor({
  note,
  onSave,
  isSaving = false,
}: MeetingNotesEditorProps) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState<string>("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [showDateInput, setShowDateInput] = useState(false);
  const [showAttendeesInput, setShowAttendeesInput] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setMeetingDate(note.meeting_date || "");
      setAttendees(note.attendees || []);
    }
  }, [note?.id]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto";
      titleInputRef.current.style.height = titleInputRef.current.scrollHeight + "px";
    }
  }, [title]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(
    (updates: Partial<MeetingNote>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("idle");
      
      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        await onSave(updates);
        setSaveStatus("saved");
        
        // Reset to idle after showing "saved"
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 1000);
    },
    [onSave]
  );

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerAutoSave({ title: newTitle });
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setMeetingDate(newDate);
    triggerAutoSave({ meeting_date: newDate || null });
  };

  // Handle attendees change
  const handleAttendeesChange = (newAttendees: string[]) => {
    setAttendees(newAttendees);
    triggerAutoSave({ attendees: newAttendees });
  };

  // Handle editor content change
  const handleEditorUpdate = (content: JSONContent) => {
    triggerAutoSave({ notes: JSON.stringify(content) });
  };

  // Add attendee
  const addAttendee = () => {
    if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
      const updated = [...attendees, newAttendee.trim()];
      handleAttendeesChange(updated);
      setNewAttendee("");
    }
  };

  // Remove attendee
  const removeAttendee = (index: number) => {
    const updated = attendees.filter((_, i) => i !== index);
    handleAttendeesChange(updated);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Parse initial content
  const getInitialContent = (): JSONContent | undefined => {
    if (!note?.notes) return undefined;
    try {
      return JSON.parse(note.notes);
    } catch {
      // If it's plain text, convert to paragraph
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: note.notes }],
          },
        ],
      };
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-200/50">
            <Hash className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-2">
            Select a note to view
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Choose a note from the sidebar or create a new one to start writing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Save status indicator - floating */}
      <AnimatePresence>
        {saveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 z-20"
          >
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border ${
                saveStatus === "saving"
                  ? "bg-white text-gray-600 border-gray-200"
                  : "bg-gray-900 text-white border-gray-900"
              }`}
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  Saved
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-16">
          {/* Title - Notion style large input */}
          <textarea
            ref={titleInputRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            rows={1}
            className="w-full text-[42px] font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent resize-none overflow-hidden leading-tight"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
          />

          {/* Properties section - Notion style */}
          <div className="mt-4 mb-8 space-y-1">
            {/* Date property */}
            <div className="group flex items-center gap-3 py-1.5 -mx-2 px-2 rounded-md hover:bg-gray-50 transition-colors">
              <div className="w-24 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </div>
              {showDateInput || meetingDate ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={meetingDate ? meetingDate.split("T")[0] : ""}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onBlur={() => !meetingDate && setShowDateInput(false)}
                    className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                    autoFocus={showDateInput && !meetingDate}
                  />
                  {meetingDate && (
                    <button
                      onClick={() => {
                        handleDateChange("");
                        setShowDateInput(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowDateInput(true)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Empty
                </button>
              )}
            </div>

            {/* Attendees property */}
            <div className="group flex items-start gap-3 py-1.5 -mx-2 px-2 rounded-md hover:bg-gray-50 transition-colors">
              <div className="w-24 flex items-center gap-2 text-sm text-gray-400 pt-0.5">
                <Users className="h-4 w-4" />
                <span>Attendees</span>
              </div>
              <div className="flex-1">
                {attendees.length > 0 || showAttendeesInput ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {attendees.map((attendee, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-sm text-gray-700 group/chip"
                      >
                        {attendee}
                        <button
                          onClick={() => removeAttendee(idx)}
                          className="opacity-0 group-hover/chip:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAttendee();
                        }
                        if (e.key === "Backspace" && !newAttendee && attendees.length > 0) {
                          removeAttendee(attendees.length - 1);
                        }
                      }}
                      onBlur={() => {
                        if (newAttendee.trim()) addAttendee();
                        if (attendees.length === 0 && !newAttendee.trim()) setShowAttendeesInput(false);
                      }}
                      placeholder={attendees.length > 0 ? "Add more..." : "Add attendee..."}
                      className="flex-1 min-w-[100px] text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                      autoFocus={showAttendeesInput && attendees.length === 0}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAttendeesInput(true)}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Empty
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-8" />

          {/* Novel Editor - Document body */}
          <EditorRoot>
            <EditorContent
              key={note.id}
              initialContent={getInitialContent()}
              extensions={[
                StarterKit.configure({
                  heading: {
                    levels: [1, 2, 3],
                  },
                }),
                Placeholder.configure({
                  placeholder: ({ node }) => {
                    if (node.type.name === "heading") {
                      return `Heading ${node.attrs.level}`;
                    }
                    return "Press '/' for commands, or start writing...";
                  },
                  emptyEditorClass: "is-editor-empty",
                }),
                TiptapLink.configure({
                  HTMLAttributes: {
                    class: "text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer",
                  },
                }),
                TiptapUnderline,
                TaskList,
                TaskItem.configure({
                  nested: true,
                }),
                TextStyle,
                Color,
              ]}
              className="novel-editor min-h-[400px]"
              editorProps={{
                attributes: {
                  class: "focus:outline-none",
                },
              }}
              onUpdate={({ editor }) => {
                handleEditorUpdate(editor.getJSON());
              }}
            >
              {/* Bubble Menu for text formatting */}
              <EditorBubble
                tippyOptions={{
                  placement: "top",
                }}
                className="flex items-center gap-0.5 p-1 rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                <EditorBubbleItem
                  onSelect={(editor) => editor.chain().focus().toggleBold().run()}
                >
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <Bold className="h-4 w-4 text-gray-600" />
                  </button>
                </EditorBubbleItem>
                <EditorBubbleItem
                  onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
                >
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <Italic className="h-4 w-4 text-gray-600" />
                  </button>
                </EditorBubbleItem>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <EditorBubbleItem
                  onSelect={(editor) => editor.chain().focus().toggleBulletList().run()}
                >
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <List className="h-4 w-4 text-gray-600" />
                  </button>
                </EditorBubbleItem>
                <EditorBubbleItem
                  onSelect={(editor) => editor.chain().focus().toggleTaskList().run()}
                >
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <CheckSquare className="h-4 w-4 text-gray-600" />
                  </button>
                </EditorBubbleItem>
              </EditorBubble>

              {/* Slash Command Menu */}
              <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-xl border border-gray-200 bg-white px-1 py-2 shadow-xl transition-all">
                <EditorCommandEmpty className="px-3 py-2 text-sm text-gray-500">
                  No results
                </EditorCommandEmpty>
                <EditorCommandList>
                  {suggestionItems.map((item) => (
                    <EditorCommandItem
                      key={item.title}
                      value={item.title}
                      onCommand={item.command}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </EditorCommandItem>
                  ))}
                </EditorCommandList>
              </EditorCommand>
            </EditorContent>
          </EditorRoot>
        </div>
      </div>

      {/* Editor styles */}
      <style jsx global>{`
        .novel-editor .ProseMirror {
          font-size: 16px;
          line-height: 1.75;
          color: #374151;
        }
        
        .novel-editor .ProseMirror p {
          margin: 0;
          margin-bottom: 0.5em;
        }
        
        .novel-editor .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        
        .novel-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        
        .novel-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.4;
        }
        
        .novel-editor .ProseMirror ul,
        .novel-editor .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .novel-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .novel-editor .ProseMirror ul[data-type="taskList"] {
          padding-left: 0;
          list-style: none;
        }
        
        .novel-editor .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        
        .novel-editor .ProseMirror ul[data-type="taskList"] li > label {
          margin-top: 0.25em;
        }
        
        .novel-editor .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 1em;
          height: 1em;
          cursor: pointer;
        }
        
        .novel-editor .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }
        
        .novel-editor .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        
        .novel-editor .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .novel-editor .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        
        .novel-editor .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .novel-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
