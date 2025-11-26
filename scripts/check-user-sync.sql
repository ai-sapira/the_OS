-- Script to check synchronization status between auth.users and users table
-- Run this to identify sync issues

-- 1. Users in auth.users but NOT in users table (missing sync)
SELECT 
  'Missing in users table' as issue_type,
  au.id as auth_user_id,
  au.email,
  au.created_at as auth_created_at,
  au.raw_user_meta_data->>'first_name' as first_name,
  au.raw_user_meta_data->>'last_name' as last_name
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Users in users table but NOT in auth.users (orphaned records)
SELECT 
  'Orphaned record (auth user deleted)' as issue_type,
  u.id,
  u.email,
  u.auth_user_id,
  u.created_at,
  u.name,
  u.first_name,
  u.last_name
FROM users u
WHERE u.auth_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = u.auth_user_id
  )
ORDER BY u.created_at DESC;

-- 3. Users with inconsistent id/auth_user_id
SELECT 
  'Inconsistent id/auth_user_id' as issue_type,
  u.id,
  u.email,
  u.auth_user_id,
  CASE 
    WHEN u.id != u.auth_user_id THEN 'IDs do not match'
    WHEN u.auth_user_id IS NULL THEN 'auth_user_id is NULL'
    ELSE 'OK'
  END as issue
FROM users u
WHERE u.auth_user_id IS NOT NULL
  AND (u.id != u.auth_user_id OR u.auth_user_id IS NULL)
ORDER BY u.created_at DESC;

-- 4. Summary counts
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM users WHERE auth_user_id IS NOT NULL) as total_users_with_auth,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN users u ON u.auth_user_id = au.id WHERE u.id IS NULL) as missing_in_users,
  (SELECT COUNT(*) FROM users u WHERE u.auth_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u.auth_user_id)) as orphaned_users,
  (SELECT COUNT(*) FROM users u WHERE u.auth_user_id IS NOT NULL AND u.id != u.auth_user_id) as inconsistent_ids;

-- 5. Check specific user (replace email)
-- SELECT 
--   'pablo.senabre@sapira.ai' as email,
--   (SELECT id FROM auth.users WHERE email = 'pablo.senabre@sapira.ai') as auth_user_id,
--   (SELECT id FROM users WHERE email = 'pablo.senabre@sapira.ai') as user_id,
--   (SELECT auth_user_id FROM users WHERE email = 'pablo.senabre@sapira.ai') as user_auth_user_id,
--   CASE 
--     WHEN (SELECT id FROM auth.users WHERE email = 'pablo.senabre@sapira.ai') IS NULL 
--       THEN 'User does NOT exist in auth.users'
--     WHEN (SELECT id FROM users WHERE email = 'pablo.senabre@sapira.ai') IS NULL 
--       THEN 'User does NOT exist in users table'
--     WHEN (SELECT auth_user_id FROM users WHERE email = 'pablo.senabre@sapira.ai') != (SELECT id FROM auth.users WHERE email = 'pablo.senabre@sapira.ai')
--       THEN 'IDs do not match'
--     ELSE 'User is properly synced'
--   END as sync_status;



