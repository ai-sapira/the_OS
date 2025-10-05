-- Migration: Add RICE scoring fields to issues table
-- Description: Adds difficulty, impact_score, and rice_score columns for prioritization

-- Add difficulty column (1-3: low to high technical complexity)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS difficulty SMALLINT CHECK (difficulty >= 1 AND difficulty <= 3);

-- Add impact_score column (1-3: low to high business impact)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS impact_score SMALLINT CHECK (impact_score >= 1 AND impact_score <= 3);

-- Add rice_score column (calculated score 60-100)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS rice_score INTEGER CHECK (rice_score >= 60 AND rice_score <= 100);

-- Add comments for documentation
COMMENT ON COLUMN issues.difficulty IS 'Technical difficulty/complexity (1=low, 2=medium, 3=high)';
COMMENT ON COLUMN issues.impact_score IS 'Business impact score (1=low, 2=medium, 3=high)';
COMMENT ON COLUMN issues.rice_score IS 'Calculated RICE prioritization score (60-100)';

