-- Migration: Increase RICE Score by +50 for all issues
-- Description: Updates all existing rice_score values by adding 50, capped at 100
-- Created: 2025-01-30

-- Update all issues with rice_score, adding 50 but capping at 100
UPDATE issues 
SET rise_score = LEAST(COALESCE(rise_score, 0) + 50, 100)
WHERE rise_score IS NOT NULL;

-- Set default high score (90) for any issues that don't have a score yet
UPDATE issues 
SET rise_score = 90
WHERE rise_score IS NULL;

-- Verify the update
DO $$ 
DECLARE 
    min_score INTEGER;
    max_score INTEGER;
    avg_score NUMERIC;
    total_count INTEGER;
BEGIN
    SELECT 
        MIN(rise_score), 
        MAX(rise_score), 
        ROUND(AVG(rise_score), 2),
        COUNT(*)
    INTO min_score, max_score, avg_score, total_count
    FROM issues
    WHERE rise_score IS NOT NULL;
    
    RAISE NOTICE 'RICE Score update complete:';
    RAISE NOTICE '  Total issues: %', total_count;
    RAISE NOTICE '  Min score: %', min_score;
    RAISE NOTICE '  Max score: %', max_score;
    RAISE NOTICE '  Avg score: %', avg_score;
END $$;


