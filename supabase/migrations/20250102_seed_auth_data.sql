-- Seed data for multi-tenant testing
-- This creates demo users and links them to organizations

-- Note: In production, you'll create auth users through Supabase Auth UI or API
-- This is just for development/testing

-- 1. Create a second organization for multi-tenant testing
-- DISABLED: Acme Corp organization removed
-- INSERT INTO organizations (id, name, slug, settings)
-- VALUES 
--   ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'acme', '{
--     "sla_matrix": {
--       "P0": {"hours": 2},
--       "P1": {"hours": 24},
--       "P2": {"hours": 72},
--       "P3": {"hours": 168}
--     }
--   }'::jsonb)
-- ON CONFLICT (id) DO NOTHING;

-- 2. Instructions for creating auth users
-- Run these commands in Supabase SQL Editor or use Supabase Auth UI:

/*
-- Create test auth users (example - adjust emails as needed)
-- You can do this in Supabase Dashboard > Authentication > Users > Add User

Example users to create:
1. sapira@sapira.com (password: sapira123) - SAP role, access to all orgs
2. ceo@gonvarri.com (password: gonvarri123) - CEO role for Gonvarri
3. manager@gonvarri.com (password: gonvarri123) - BU role for Gonvarri
4. employee@gonvarri.com (password: gonvarri123) - EMP role for Gonvarri
5. ceo@acme.com (password: acme123) - CEO role for Acme Corp

After creating the auth users, get their UUIDs and run the INSERT below
*/

-- 3. Link auth users to organizations (EXAMPLE - update with real auth UUIDs)
-- Replace the auth_user_id values with actual UUIDs from auth.users table

-- Example structure (uncomment and update with real UUIDs after creating auth users):
/*
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES
  -- SAP user - has access to both Gonvarri and Acme
  ('AUTH_UUID_1', '01234567-8901-2345-6789-012345678901', 'SAP', NULL, true),
  ('AUTH_UUID_1', '11111111-1111-1111-1111-111111111111', 'SAP', NULL, true),
  
  -- Gonvarri CEO
  ('AUTH_UUID_2', '01234567-8901-2345-6789-012345678901', 'CEO', NULL, true),
  
  -- Gonvarri BU Manager (Technology)
  ('AUTH_UUID_3', '01234567-8901-2345-6789-012345678901', 'BU', 'INIT_ID_TECHNOLOGY', true),
  
  -- Gonvarri Employee
  ('AUTH_UUID_4', '01234567-8901-2345-6789-012345678901', 'EMP', NULL, true),
  
  -- Acme CEO
  ('AUTH_UUID_5', '11111111-1111-1111-1111-111111111111', 'CEO', NULL, true)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;
*/

-- 4. Helper query to see current auth users and their IDs
-- Run this to get the auth_user_id values you need:
-- SELECT id, email FROM auth.users;

COMMENT ON TABLE organizations IS 'Multi-tenant: Each client is an organization';

