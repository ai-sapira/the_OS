-- Migration: Enable SAP users to view all data for demo purposes
-- Description: Updates RLS policies to allow SAP users full visibility within their organizations
-- Created: 2025-01-03

-- =====================================================
-- ISSUES: SAP users see everything, others filtered by role
-- =====================================================

DROP POLICY IF EXISTS "Users see own org issues" ON issues;
DROP POLICY IF EXISTS "Users see issues based on role" ON issues;

CREATE POLICY "Users see issues based on role with SAP override" ON issues
  FOR SELECT
  USING (
    -- Must belong to user's organizations
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
    AND (
      -- SAP users see ALL issues in their organizations
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = issues.organization_id
        AND role = 'SAP'
        AND active = true
      )
      OR
      -- CEO users see ALL issues in their organizations
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = issues.organization_id
        AND role = 'CEO'
        AND active = true
      )
      OR
      -- BU managers see only issues from their business unit
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid()
        AND organization_id = issues.organization_id
        AND role = 'BU'
        AND initiative_id = issues.initiative_id
        AND active = true
      )
      OR
      -- Employees see only their assigned or reported issues
      EXISTS (
        SELECT 1 FROM users
        WHERE auth_user_id = auth.uid()
        AND (
          users.id = issues.assignee_id 
          OR users.id = issues.reporter_id
        )
      )
    )
  );

-- =====================================================
-- PROJECTS: SAP users see everything, others filtered by role
-- =====================================================

DROP POLICY IF EXISTS "Users see own org projects" ON projects;
DROP POLICY IF EXISTS "Users see projects based on role" ON projects;

CREATE POLICY "Users see projects based on role with SAP override" ON projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
    AND (
      -- SAP users see ALL projects
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = projects.organization_id
        AND role = 'SAP'
        AND active = true
      )
      OR
      -- CEO users see ALL projects
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = projects.organization_id
        AND role = 'CEO'
        AND active = true
      )
      OR
      -- BU managers see only projects from their business unit
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid()
        AND organization_id = projects.organization_id
        AND role = 'BU'
        AND initiative_id = projects.initiative_id
        AND active = true
      )
      OR
      -- Employees see projects where they have issues
      EXISTS (
        SELECT 1 FROM issues
        JOIN users ON users.id = issues.assignee_id OR users.id = issues.reporter_id
        WHERE users.auth_user_id = auth.uid()
        AND issues.project_id = projects.id
      )
    )
  );

-- =====================================================
-- INITIATIVES: SAP and CEO see all, BU sees their own
-- =====================================================

DROP POLICY IF EXISTS "Users see own org initiatives" ON initiatives;
DROP POLICY IF EXISTS "Users see initiatives based on role" ON initiatives;

CREATE POLICY "Users see initiatives based on role with SAP override" ON initiatives
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
    AND (
      -- SAP users see ALL initiatives
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = initiatives.organization_id
        AND role = 'SAP'
        AND active = true
      )
      OR
      -- CEO users see ALL initiatives
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid() 
        AND organization_id = initiatives.organization_id
        AND role = 'CEO'
        AND active = true
      )
      OR
      -- BU managers see only their own initiative
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE auth_user_id = auth.uid()
        AND organization_id = initiatives.organization_id
        AND role = 'BU'
        AND initiative_id = initiatives.id
        AND active = true
      )
      OR
      -- Employees see initiatives where they have issues
      EXISTS (
        SELECT 1 FROM issues
        JOIN users ON users.id = issues.assignee_id OR users.id = issues.reporter_id
        WHERE users.auth_user_id = auth.uid()
        AND issues.initiative_id = initiatives.id
      )
    )
  );

-- =====================================================
-- USERS: See users from their organizations
-- =====================================================

DROP POLICY IF EXISTS "Users see own org users" ON users;

CREATE POLICY "Users see users from their organizations" ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- =====================================================
-- USER_ORGANIZATIONS: See their own records
-- =====================================================

DROP POLICY IF EXISTS "Users see own org records" ON user_organizations;

CREATE POLICY "Users see their organization records" ON user_organizations
  FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR
    -- SAP users can see all user_organizations in their orgs
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.auth_user_id = auth.uid()
      AND uo.organization_id = user_organizations.organization_id
      AND uo.role = 'SAP'
      AND uo.active = true
    )
  );

-- =====================================================
-- COMMENTS: Add RLS policy (if table exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'comments') THEN
    DROP POLICY IF EXISTS "Users see comments on accessible issues" ON comments;
    
    CREATE POLICY "Users see comments on accessible issues" ON comments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM issues
          WHERE issues.id = comments.issue_id
          -- Reuse the issues policy logic
          AND (
            -- User has access to this issue (handled by issues RLS)
            true
          )
        )
      );
  END IF;
END $$;

-- =====================================================
-- Index optimization for performance
-- =====================================================

-- Ensure indexes exist for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_orgs_auth_user_role 
  ON user_organizations(auth_user_id, role) 
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_user_orgs_org_role 
  ON user_organizations(organization_id, role) 
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_issues_org_initiative 
  ON issues(organization_id, initiative_id);

CREATE INDEX IF NOT EXISTS idx_projects_org_initiative 
  ON projects(organization_id, initiative_id);

CREATE INDEX IF NOT EXISTS idx_users_auth_user 
  ON users(auth_user_id) 
  WHERE active = true;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON POLICY "Users see issues based on role with SAP override" ON issues IS 
  'SAP users can see all issues in their orgs (for demo purposes). 
   Other users see issues based on their role (CEO=all, BU=their unit, EMP=assigned/reported).';

COMMENT ON POLICY "Users see projects based on role with SAP override" ON projects IS 
  'SAP users can see all projects in their orgs (for demo purposes). 
   Other users see projects based on their role.';

COMMENT ON POLICY "Users see initiatives based on role with SAP override" ON initiatives IS 
  'SAP users can see all initiatives in their orgs (for demo purposes). 
   Other users see initiatives based on their role.';

