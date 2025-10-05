-- Migration: Create initiative_activity table
-- Date: 2025-10-05
-- Description: Tracks all changes and activities for initiatives (business units)

-- Create enum for activity actions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'initiative_activity_action') THEN
        CREATE TYPE initiative_activity_action AS ENUM (
            'created',           -- Initiative was created
            'updated',           -- Generic update
            'status_changed',    -- Active/Inactive status changed
            'manager_assigned',  -- Manager was assigned
            'manager_changed',   -- Manager was changed
            'manager_removed',   -- Manager was removed
            'description_updated', -- Description was updated
            'project_added',     -- A project was added to this initiative
            'project_removed',   -- A project was removed from this initiative
            'issue_accepted',    -- An issue was accepted into this initiative (from triage)
            'archived',          -- Initiative was archived
            'restored'           -- Initiative was restored
        );
    END IF;
END $$;

-- Create initiative_activity table
CREATE TABLE IF NOT EXISTS initiative_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action initiative_activity_action NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_initiative_activity_org ON initiative_activity(organization_id);
CREATE INDEX IF NOT EXISTS idx_initiative_activity_initiative ON initiative_activity(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_activity_actor ON initiative_activity(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_initiative_activity_created_at ON initiative_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_initiative_activity_action ON initiative_activity(action);

-- Add RLS (Row Level Security) policies
ALTER TABLE initiative_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activities for initiatives in their organization
CREATE POLICY "Users can view initiative activities in their organization"
ON initiative_activity
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Policy: Authenticated users can insert initiative activities
CREATE POLICY "Users can create initiative activities"
ON initiative_activity
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Comments for documentation
COMMENT ON TABLE initiative_activity IS 'Tracks all activities and changes for initiatives (business units)';
COMMENT ON COLUMN initiative_activity.action IS 'Type of activity or change that occurred';
COMMENT ON COLUMN initiative_activity.payload IS 'JSON payload with additional context about the activity (e.g., old/new values)';
COMMENT ON COLUMN initiative_activity.actor_user_id IS 'User who performed the action (null for system actions)';

-- Create a trigger function to automatically log initiative creation
CREATE OR REPLACE FUNCTION log_initiative_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO initiative_activity (
        organization_id,
        initiative_id,
        actor_user_id,
        action,
        payload
    ) VALUES (
        NEW.organization_id,
        NEW.id,
        NULL, -- Will be set by application code if available
        'created',
        jsonb_build_object(
            'name', NEW.name,
            'slug', NEW.slug,
            'active', NEW.active
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to initiatives table
DROP TRIGGER IF EXISTS trigger_log_initiative_creation ON initiatives;
CREATE TRIGGER trigger_log_initiative_creation
    AFTER INSERT ON initiatives
    FOR EACH ROW
    EXECUTE FUNCTION log_initiative_creation();

-- Create a trigger function to automatically log initiative updates
CREATE OR REPLACE FUNCTION log_initiative_update()
RETURNS TRIGGER AS $$
DECLARE
    activity_action initiative_activity_action;
    payload_data JSONB;
BEGIN
    -- Determine the type of change
    IF OLD.active != NEW.active THEN
        activity_action := 'status_changed';
        payload_data := jsonb_build_object(
            'old_status', CASE WHEN OLD.active THEN 'active' ELSE 'inactive' END,
            'new_status', CASE WHEN NEW.active THEN 'active' ELSE 'inactive' END
        );
    ELSIF OLD.manager_user_id IS NULL AND NEW.manager_user_id IS NOT NULL THEN
        activity_action := 'manager_assigned';
        payload_data := jsonb_build_object('manager_user_id', NEW.manager_user_id);
    ELSIF OLD.manager_user_id IS NOT NULL AND NEW.manager_user_id IS NOT NULL AND OLD.manager_user_id != NEW.manager_user_id THEN
        activity_action := 'manager_changed';
        payload_data := jsonb_build_object(
            'old_manager_user_id', OLD.manager_user_id,
            'new_manager_user_id', NEW.manager_user_id
        );
    ELSIF OLD.manager_user_id IS NOT NULL AND NEW.manager_user_id IS NULL THEN
        activity_action := 'manager_removed';
        payload_data := jsonb_build_object('old_manager_user_id', OLD.manager_user_id);
    ELSIF OLD.description != NEW.description THEN
        activity_action := 'description_updated';
        payload_data := jsonb_build_object('description_length', LENGTH(COALESCE(NEW.description, '')));
    ELSE
        activity_action := 'updated';
        payload_data := jsonb_build_object(
            'name', NEW.name,
            'slug', NEW.slug
        );
    END IF;

    -- Insert the activity log
    INSERT INTO initiative_activity (
        organization_id,
        initiative_id,
        actor_user_id,
        action,
        payload
    ) VALUES (
        NEW.organization_id,
        NEW.id,
        NULL, -- Will be set by application code if available
        activity_action,
        payload_data
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to initiatives table
DROP TRIGGER IF EXISTS trigger_log_initiative_update ON initiatives;
CREATE TRIGGER trigger_log_initiative_update
    AFTER UPDATE ON initiatives
    FOR EACH ROW
    WHEN (
        OLD.active IS DISTINCT FROM NEW.active OR
        OLD.manager_user_id IS DISTINCT FROM NEW.manager_user_id OR
        OLD.description IS DISTINCT FROM NEW.description OR
        OLD.name IS DISTINCT FROM NEW.name
    )
    EXECUTE FUNCTION log_initiative_update();

-- Grant necessary permissions
GRANT SELECT, INSERT ON initiative_activity TO authenticated;
GRANT USAGE ON TYPE initiative_activity_action TO authenticated;

-- Print summary
DO $$
BEGIN
    RAISE NOTICE 'Initiative activity tracking has been set up successfully!';
    RAISE NOTICE 'Table: initiative_activity';
    RAISE NOTICE 'Triggers: log_initiative_creation, log_initiative_update';
END $$;

