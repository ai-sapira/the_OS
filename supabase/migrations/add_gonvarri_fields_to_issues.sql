-- Migration: Add Gonvarri-specific fields to issues table
-- Adds: short_description, impact, core_technology
-- Created: 2025-01-30

-- Add new columns to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS impact TEXT,
ADD COLUMN IF NOT EXISTS core_technology TEXT;

-- Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_issues_core_technology ON issues(core_technology);

-- Add comments for documentation
COMMENT ON COLUMN issues.short_description IS 'Brief summary of the initiative/issue (for Gonvarri demo)';
COMMENT ON COLUMN issues.impact IS 'Business impact description (e.g., "Reduced repetitive tasks", "Increased productivity")';
COMMENT ON COLUMN issues.core_technology IS 'Core technology used (e.g., "Predictive AI", "GenAI + Analytics", "RPA + IDP")';
