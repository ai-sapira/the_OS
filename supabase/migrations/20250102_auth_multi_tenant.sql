-- Migration: Add multi-tenant authentication support
-- Description: Links Supabase Auth users with organizations and roles

-- 1. Add auth_user_id to users table (link with Supabase Auth)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create user_organizations table (many-to-many with roles)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('SAP', 'CEO', 'BU', 'EMP')),
  initiative_id UUID REFERENCES initiatives(id), -- Only for BU role
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_user_id, organization_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_orgs_auth_user ON user_organizations(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user ON users(auth_user_id);

-- 4. Enable Row Level Security (RLS) on main tables
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Users can only see data from their organizations

-- Issues: User can see issues from their organizations
DROP POLICY IF EXISTS "Users see own org issues" ON issues;
CREATE POLICY "Users see own org issues" ON issues
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- Projects: User can see projects from their organizations  
DROP POLICY IF EXISTS "Users see own org projects" ON projects;
CREATE POLICY "Users see own org projects" ON projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- Initiatives: User can see initiatives from their organizations
DROP POLICY IF EXISTS "Users see own org initiatives" ON initiatives;
CREATE POLICY "Users see own org initiatives" ON initiatives
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- Users: User can see users from their organizations
DROP POLICY IF EXISTS "Users see own org users" ON users;
CREATE POLICY "Users see own org users" ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- User Organizations: User can see their own organization memberships
DROP POLICY IF EXISTS "Users see own organizations" ON user_organizations;
CREATE POLICY "Users see own organizations" ON user_organizations
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- 6. Insert policies (users can insert into their orgs)
DROP POLICY IF EXISTS "Users insert into own org issues" ON issues;
CREATE POLICY "Users insert into own org issues" ON issues
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- 7. Update policies (users can update in their orgs)
DROP POLICY IF EXISTS "Users update own org issues" ON issues;
CREATE POLICY "Users update own org issues" ON issues
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid() AND active = true
    )
  );

-- 8. Function to get user's role in an organization
CREATE OR REPLACE FUNCTION get_user_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role 
  FROM user_organizations 
  WHERE auth_user_id = auth.uid() 
    AND organization_id = org_id 
    AND active = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 9. Function to get user's current initiative (for BU role)
CREATE OR REPLACE FUNCTION get_user_initiative(org_id UUID)
RETURNS UUID AS $$
  SELECT initiative_id 
  FROM user_organizations 
  WHERE auth_user_id = auth.uid() 
    AND organization_id = org_id 
    AND active = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON TABLE user_organizations IS 'Links auth users to organizations with specific roles';
COMMENT ON COLUMN user_organizations.auth_user_id IS 'References Supabase Auth user';
COMMENT ON COLUMN user_organizations.role IS 'User role in this organization: SAP, CEO, BU, or EMP';
COMMENT ON COLUMN user_organizations.initiative_id IS 'For BU role only - which business unit they manage';

