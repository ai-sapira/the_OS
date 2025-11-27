-- Ver todas las organizaciones actuales
SELECT id, name, slug, created_at 
FROM organizations
ORDER BY created_at;

-- Ver usuarios y sus organizaciones
SELECT 
  au.email,
  o.name as organization,
  o.slug,
  uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.active = true
ORDER BY o.name, uo.role, au.email;







