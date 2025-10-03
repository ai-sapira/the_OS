-- =====================================================
-- Setup SAP Access for Demo Mode
-- =====================================================
-- This script grants SAP (Sapira) user access to organizations
-- for demo purposes. Run this in Supabase SQL Editor.
--
-- Prerequisites:
-- 1. Create auth user in Supabase Dashboard:
--    - Email: pablo@sapira.com (or your email)
--    - Password: [secure password]
--    - Auto Confirm User: YES
-- 
-- 2. Copy the UUID of the created user
-- 3. Replace USER_EMAIL below with the actual email
-- =====================================================

-- =====================================================
-- STEP 1: Verify auth user exists
-- =====================================================
-- Copy the UUID from the results
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'pablo@sapira.com';  -- ⚠️ CHANGE THIS to your email

-- Expected: One row with your user ID

-- =====================================================
-- STEP 2: Get organization IDs
-- =====================================================
SELECT 
  id,
  name,
  slug
FROM organizations
ORDER BY name;

-- Note the IDs for:
-- - Gonvarri: '01234567-8901-2345-6789-012345678901'
-- - Aurovitas: '22222222-2222-2222-2222-222222222222'

-- =====================================================
-- STEP 3: Grant SAP access to Gonvarri
-- =====================================================
-- ⚠️ REPLACE with your actual auth user UUID from STEP 1

INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
SELECT 
  u.id,
  '01234567-8901-2345-6789-012345678901',  -- Gonvarri organization ID
  'SAP',
  true
FROM auth.users u
WHERE u.email = 'pablo@sapira.com'  -- ⚠️ CHANGE THIS to your email
ON CONFLICT (auth_user_id, organization_id) 
DO UPDATE SET 
  role = 'SAP',
  active = true,
  updated_at = now();

-- =====================================================
-- STEP 4: (Optional) Grant SAP access to Aurovitas
-- =====================================================
-- Uncomment if you also want access to Aurovitas

-- INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
-- SELECT 
--   u.id,
--   '22222222-2222-2222-2222-222222222222',  -- Aurovitas organization ID
--   'SAP',
--   true
-- FROM auth.users u
-- WHERE u.email = 'pablo@sapira.com'
-- ON CONFLICT (auth_user_id, organization_id) 
-- DO UPDATE SET 
--   role = 'SAP',
--   active = true,
--   updated_at = now();

-- =====================================================
-- STEP 5: Verify access was granted
-- =====================================================
SELECT 
  u.email,
  o.name as organization,
  uo.role,
  uo.active,
  uo.created_at
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE u.email = 'pablo@sapira.com'  -- ⚠️ CHANGE THIS to your email
ORDER BY o.name;

-- Expected: 
-- pablo@sapira.com | Gonvarri | SAP | true | [timestamp]

-- =====================================================
-- STEP 6: (Optional) Create a SAP user in users table
-- =====================================================
-- This creates a corresponding record in the users table
-- linked to the auth user. This is optional but recommended.

INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  auth_user_id,
  active
)
SELECT 
  gen_random_uuid(),
  '01234567-8901-2345-6789-012345678901',  -- Gonvarri
  'Pablo Senabre (Sapira)',
  u.email,
  'SAP',
  u.id,
  true
FROM auth.users u
WHERE u.email = 'pablo@sapira.com'  -- ⚠️ CHANGE THIS
AND NOT EXISTS (
  SELECT 1 FROM users 
  WHERE auth_user_id = u.id 
  AND organization_id = '01234567-8901-2345-6789-012345678901'
);

-- =====================================================
-- VERIFICATION CHECKLIST
-- =====================================================
-- After running this script, verify:
-- 
-- ✅ Auth user exists in auth.users
-- ✅ User has record in user_organizations with role='SAP'
-- ✅ Can login at app.sapira.com with email/password
-- ✅ After login, can select "Gonvarri" organization
-- ✅ RoleSwitcher appears in header (only for SAP users)
-- ✅ Can switch between CEO, BU, EMP roles
-- ✅ Data changes when switching roles
-- =====================================================

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- If you need to remove SAP access:

-- DELETE FROM user_organizations
-- WHERE auth_user_id IN (
--   SELECT id FROM auth.users WHERE email = 'pablo@sapira.com'
-- )
-- AND organization_id = '01234567-8901-2345-6789-012345678901';
-- =====================================================

