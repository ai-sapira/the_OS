'use client';
import useClickOutside from '@/hooks/use-click-outside';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CheckCircle, Copy, XCircle, Clock, User, FolderOpen, Calendar } from 'lucide-react';
import { useRef, useState, useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const TRANSITION = {
  type: 'spring',
  bounce: 0.05,
  duration: 0.3,
};

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  project: string;
  projectColor: string;
  created: string;
  updated: string;
  reporter?: string;
  labels?: string[];
}

interface TriageActionPopoverProps {
  action: "accept" | "duplicate" | "decline" | "snooze";
  issue: Issue;
  onAction: (action: string, data: any) => void;
  children: React.ReactNode;
}

function TriageActionPopover({ action, issue, onAction, children }: TriageActionPopoverProps) {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [project, setProject] = useState('');
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);
  const [setPriorityBeforeAccept, setSetPriorityBeforeAccept] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState('');
  const [snoozeDate, setSnoozeDate] = useState('');
  const [snoozeTime, setSnoozeTime] = useState('');

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    // Reset form
    setComment('');
    setPriority('');
    setAssignee('');
    setProject('');
    setSubscribeToUpdates(true);
    setSetPriorityBeforeAccept(false);
    setDuplicateIssue('');
    setSnoozeDate('');
    setSnoozeTime('');
  };

  useClickOutside(formContainerRef, () => {
    closeMenu();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getActionIcon = () => {
    switch (action) {
      case "accept":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "duplicate":
        return <Copy className="h-4 w-4 text-orange-500" />
      case "decline":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "snooze":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case "accept":
        return `Accept: ${issue.id} ${issue.title}`
      case "duplicate":
        return `Mark as duplicate: ${issue.id} ${issue.title}`
      case "decline":
        return `Decline: ${issue.id} ${issue.title}`
      case "snooze":
        return `Snooze: ${issue.id} ${issue.title}`
      default:
        return ""
    }
  };

  const getActionButtonText = () => {
    switch (action) {
      case "accept":
        return "Accept"
      case "duplicate":
        return "Mark as duplicate"
      case "decline":
        return "Decline"
      case "snooze":
        return "Snooze"
      default:
        return ""
    }
  };

  const handleAction = () => {
    const data = {
      comment,
      priority: setPriorityBeforeAccept ? priority : undefined,
      assignee,
      project,
      subscribeToUpdates,
      duplicateIssue,
      snoozeDate,
      snoozeTime,
    };
    onAction(action, data);
    closeMenu();
  };

  const isFormValid = () => {
    if (action === "decline" && !comment.trim()) return false;
    if (action === "duplicate" && !duplicateIssue.trim()) return false;
    if (action === "snooze" && (!snoozeDate || !snoozeTime)) return false;
    return true;
  };

  return (
    <MotionConfig transition={TRANSITION}>
      <div className='relative flex items-center justify-center'>
        <div onClick={openMenu}>
          {children}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={formContainerRef}
              layoutId={`popover-${uniqueId}`}
              className='absolute top-full left-0 mt-2 w-[380px] overflow-hidden border border-border bg-background shadow-lg z-50'
              style={{
                borderRadius: 12,
              }}
            >
              <form
                className='flex flex-col'
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAction();
                }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    {getActionIcon()}
                    <span className="text-[14px] font-medium text-foreground flex-1">
                      {getActionTitle()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Comment field */}
                  <div>
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px] resize-none border-border bg-background text-[13px] focus-visible:ring-1 focus-visible:ring-ring/20 rounded-md"
                    />
                  </div>

                  {/* Accept-specific fields */}
                  {action === "accept" && (
                    <>
                      {/* Quick assignment bar */}
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border/40 text-[12px]">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] h-5 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {issue.id}
                        </Badge>
                        
                        <Select value={project} onValueChange={setProject}>
                          <SelectTrigger className="h-6 text-[11px] border-none bg-transparent p-0 focus:ring-0">
                            <SelectValue placeholder="Backlog" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="tech">Tecnología</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Ventas</SelectItem>
                          </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">•••</span>
                        <span className="text-muted-foreground">Priority</span>

                        <Select value={assignee} onValueChange={setAssignee}>
                          <SelectTrigger className="h-6 text-[11px] border-none bg-transparent p-0 focus:ring-0">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <SelectValue placeholder="pablosenabre" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pablosenabre">pablosenabre</SelectItem>
                            <SelectItem value="tech-team">Tech Team</SelectItem>
                            <SelectItem value="design-team">Design Team</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                          <FolderOpen className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                          <Calendar className="h-3 w-3" />
                        </Button>
                        <span className="text-muted-foreground">•••</span>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="subscribe" 
                            checked={subscribeToUpdates} 
                            onCheckedChange={(checked) => setSubscribeToUpdates(checked === true)} 
                          />
                          <label htmlFor="subscribe" className="text-[12px] text-foreground leading-none">
                            Subscribe to updates
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="priority"
                            checked={setPriorityBeforeAccept}
                            onCheckedChange={(checked) => setSetPriorityBeforeAccept(checked === true)}
                          />
                          <label htmlFor="priority" className="text-[12px] text-foreground leading-none">
                            Set a priority before accepting this issue
                          </label>
                        </div>
                      </div>

                      {setPriorityBeforeAccept && (
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">🔴 Urgent</SelectItem>
                            <SelectItem value="high">🟠 High</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="low">🟢 Low</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </>
                  )}

                  {/* Duplicate-specific fields */}
                  {action === "duplicate" && (
                    <div>
                      <label className="text-[12px] font-medium text-foreground mb-2 block">Reference to canonical issue</label>
                      <input
                        type="text"
                        placeholder="SAI-123"
                        value={duplicateIssue}
                        onChange={(e) => setDuplicateIssue(e.target.value)}
                        className="w-full px-3 py-1.5 text-[12px] border border-border rounded bg-background"
                      />
                    </div>
                  )}

                  {/* Snooze-specific fields */}
                  {action === "snooze" && (
                    <div>
                      <label className="text-[12px] font-medium text-foreground mb-2 block">Snooze until</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={snoozeDate}
                          onChange={(e) => setSnoozeDate(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-[12px] border border-border rounded bg-background"
                        />
                        <input
                          type="time"
                          value={snoozeTime}
                          onChange={(e) => setSnoozeTime(e.target.value)}
                          className="px-3 py-1.5 text-[12px] border border-border rounded bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border/20 flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-3 text-[12px]"
                    onClick={closeMenu}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 px-3 text-[12px] bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!isFormValid()}
                  >
                    {getActionButtonText()}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export { TriageActionPopover };
