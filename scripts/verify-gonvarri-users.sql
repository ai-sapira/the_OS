-- Script to verify Gonvarri users for demo mode
-- Execute this in Supabase SQL Editor to get the correct user IDs

-- =====================================================
-- 1. Get Gonvarri organization ID
-- =====================================================
SELECT 
  id,
  name,
  slug,
  created_at
FROM organizations
WHERE slug = 'gonvarri';

-- Expected: id = '01234567-8901-2345-6789-012345678901'

-- =====================================================
-- 2. Get all users from Gonvarri organization
-- =====================================================
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.active,
  i.name as initiative_name,
  i.id as initiative_id
FROM users u
LEFT JOIN initiatives i ON i.manager_user_id = u.id
WHERE u.organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY 
  CASE u.role
    WHEN 'SAP' THEN 1
    WHEN 'CEO' THEN 2
    WHEN 'BU' THEN 3
    WHEN 'EMP' THEN 4
  END,
  u.name;

-- =====================================================
-- 3. Get initiatives (Business Units) of Gonvarri
-- =====================================================
SELECT 
  i.id,
  i.name,
  i.slug,
  u.name as manager_name,
  u.id as manager_id,
  u.role as manager_role
FROM initiatives i
LEFT JOIN users u ON u.id = i.manager_user_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY i.name;

-- =====================================================
-- 4. Suggested mock users for demo
-- =====================================================
-- Based on typical setup, we need:
-- - 1 CEO user (to simulate CEO view)
-- - 1 BU Manager user (to simulate BU Manager view, preferably with issues)
-- - 1 Employee user (to simulate Employee view with assigned issues)

-- Find CEO user
SELECT 
  id,
  name,
  email,
  role
FROM users
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
  AND role = 'CEO'
LIMIT 1;

-- Find BU Manager with most issues (best for demo)
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  i.name as bu_name,
  i.id as bu_id,
  COUNT(iss.id) as issue_count
FROM users u
LEFT JOIN initiatives i ON i.manager_user_id = u.id
LEFT JOIN issues iss ON iss.initiative_id = i.id
WHERE u.organization_id = '01234567-8901-2345-6789-012345678901'
  AND u.role = 'BU'
  AND u.active = true
GROUP BY u.id, u.name, u.email, u.role, i.name, i.id
ORDER BY issue_count DESC
LIMIT 1;

-- Find Employee with assigned issues
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  COUNT(iss.id) as assigned_issues
FROM users u
LEFT JOIN issues iss ON iss.assignee_id = u.id OR iss.reporter_id = u.id
WHERE u.organization_id = '01234567-8901-2345-6789-012345678901'
  AND u.role = 'EMP'
  AND u.active = true
GROUP BY u.id, u.name, u.email, u.role
HAVING COUNT(iss.id) > 0
ORDER BY assigned_issues DESC
LIMIT 1;

-- =====================================================
-- 5. Copy the IDs from the results above and update:
--    hooks/use-supabase-data.ts - GONVARRI_MOCK_USERS
-- =====================================================

