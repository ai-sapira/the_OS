-- Migration: Add new properties to issues table
-- Date: 2025-10-01
-- Description: Adds SLA, estimation, and blocker fields to issues

-- Add new columns to issues table
ALTER TABLE issues
  ADD COLUMN IF NOT EXISTS sla_due_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
  ADD COLUMN IF NOT EXISTS blocker_reason TEXT,
  ADD COLUMN IF NOT EXISTS blocked_by_issue_id UUID REFERENCES issues(id) ON DELETE SET NULL;

-- Add index for blocked_by_issue_id for better query performance
CREATE INDEX IF NOT EXISTS idx_issues_blocked_by_issue_id 
  ON issues(blocked_by_issue_id) 
  WHERE blocked_by_issue_id IS NOT NULL;

-- Add index for sla_due_date for SLA tracking queries
CREATE INDEX IF NOT EXISTS idx_issues_sla_due_date 
  ON issues(sla_due_date) 
  WHERE sla_due_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN issues.sla_due_date IS 'Target date for issue resolution based on SLA';
COMMENT ON COLUMN issues.estimated_hours IS 'Estimated hours to complete the issue';
COMMENT ON COLUMN issues.blocker_reason IS 'Explanation of why the issue is blocked';
COMMENT ON COLUMN issues.blocked_by_issue_id IS 'Reference to the issue that is blocking this one';


