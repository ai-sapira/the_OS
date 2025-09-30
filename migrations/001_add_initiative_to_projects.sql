-- Migration: Add initiative_id to projects table
-- Date: 2025-09-30
-- Description: Establishes direct relationship between projects and initiatives (business units)

-- 1. Add the column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_initiative_id ON projects(initiative_id);

-- 3. Migrate existing data: Set initiative_id based on the most common initiative in project issues
DO $$
DECLARE
  project_record RECORD;
  primary_initiative_id UUID;
BEGIN
  FOR project_record IN SELECT id FROM projects LOOP
    -- Find the initiative with the most issues in this project
    SELECT initiative_id INTO primary_initiative_id
    FROM issues
    WHERE project_id = project_record.id 
      AND initiative_id IS NOT NULL
      AND state != 'triage'
    GROUP BY initiative_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Update project with the primary initiative
    IF primary_initiative_id IS NOT NULL THEN
      UPDATE projects 
      SET initiative_id = primary_initiative_id,
          updated_at = NOW()
      WHERE id = project_record.id;
    END IF;
  END LOOP;
END $$;

-- 4. Add comment to column for documentation
COMMENT ON COLUMN projects.initiative_id IS 'Primary business unit (initiative) that owns this project. All project issues should belong to this initiative.';

-- 5. Print migration summary
DO $$
DECLARE
  total_projects INTEGER;
  projects_with_initiative INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_projects FROM projects;
  SELECT COUNT(*) INTO projects_with_initiative FROM projects WHERE initiative_id IS NOT NULL;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total projects: %', total_projects;
  RAISE NOTICE 'Projects with initiative: %', projects_with_initiative;
  RAISE NOTICE 'Projects without initiative: %', total_projects - projects_with_initiative;
END $$;
