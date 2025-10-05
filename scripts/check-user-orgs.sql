-- Check which organizations a user has access to
-- Replace USER_ID with the actual auth user ID

SELECT 
  au.id as user_id,
  au.email,
  o.name as organization,
  o.slug as org_slug,
  uo.role,
  i.name as business_unit,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE au.id = 'b8023796-e4c8-4752-9f5c-5b140c990f06'
ORDER BY o.name, uo.role;

