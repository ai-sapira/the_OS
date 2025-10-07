-- ============================================
-- VERIFICACIÓN: Setup Cosermo NO rompe nada
-- ============================================

-- 1. Ver TODAS las organizaciones (ninguna debería faltar)
SELECT 
  id, 
  name, 
  slug, 
  created_at
FROM organizations
ORDER BY name;

-- Esperado:
-- - Aurovitas (22222222-2222-2222-2222-222222222222)
-- - Cosermo (33333333-3333-3333-3333-333333333333) ⬅️ Nueva
-- - Gonvarri (aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee)
-- (y cualquier otra que exista)

-- ============================================
-- 2. Verificar datos de Gonvarri (NO deben cambiar)
-- ============================================

-- Issues de Gonvarri
SELECT COUNT(*) as total_issues_gonvarri
FROM issues
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Projects de Gonvarri  
SELECT COUNT(*) as total_projects_gonvarri
FROM projects
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Initiatives (BUs) de Gonvarri
SELECT COUNT(*) as total_initiatives_gonvarri
FROM initiatives
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Usuarios de Gonvarri
SELECT COUNT(*) as total_users_gonvarri
FROM user_organizations
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
  AND active = true;

-- ============================================
-- 3. Verificar datos de Aurovitas (NO deben cambiar)
-- ============================================

-- Issues de Aurovitas
SELECT COUNT(*) as total_issues_aurovitas
FROM issues
WHERE organization_id = '22222222-2222-2222-2222-222222222222';

-- Projects de Aurovitas
SELECT COUNT(*) as total_projects_aurovitas
FROM projects
WHERE organization_id = '22222222-2222-2222-2222-222222222222';

-- Usuarios de Aurovitas
SELECT COUNT(*) as total_users_aurovitas
FROM user_organizations
WHERE organization_id = '22222222-2222-2222-2222-222222222222'
  AND active = true;

-- ============================================
-- 4. Verificar Cosermo VACÍA (estado inicial)
-- ============================================

-- Cosermo debe tener 0 issues
SELECT COUNT(*) as total_issues_cosermo
FROM issues
WHERE organization_id = '33333333-3333-3333-3333-333333333333';
-- Esperado: 0

-- Cosermo debe tener 0 projects
SELECT COUNT(*) as total_projects_cosermo
FROM projects
WHERE organization_id = '33333333-3333-3333-3333-333333333333';
-- Esperado: 0

-- Cosermo debe tener 0 initiatives (BUs)
SELECT COUNT(*) as total_initiatives_cosermo
FROM initiatives
WHERE organization_id = '33333333-3333-3333-3333-333333333333';
-- Esperado: 0

-- Cosermo puede tener usuarios (los que vinculaste)
SELECT COUNT(*) as total_users_cosermo
FROM user_organizations
WHERE organization_id = '33333333-3333-3333-3333-333333333333'
  AND active = true;
-- Esperado: 1+ (según cuántos hayas creado)

-- ============================================
-- 5. RESUMEN COMPARATIVO
-- ============================================

SELECT 
  o.name as organization,
  o.slug,
  COUNT(DISTINCT uo.auth_user_id) as users,
  COUNT(DISTINCT i.id) as business_units,
  COUNT(DISTINCT p.id) as projects,
  COUNT(DISTINCT iss.id) as issues
FROM organizations o
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.active = true
LEFT JOIN initiatives i ON i.organization_id = o.id AND i.active = true
LEFT JOIN projects p ON p.organization_id = o.id
LEFT JOIN issues iss ON iss.organization_id = o.id
GROUP BY o.id, o.name, o.slug
ORDER BY o.name;

-- Resultado esperado:
-- organization | slug      | users | business_units | projects | issues
-- -------------|-----------|-------|----------------|----------|-------
-- Aurovitas    | aurovitas | X     | X              | X        | X
-- Cosermo      | cosermo   | X     | 0              | 0        | 0  ⬅️ Vacía
-- Gonvarri     | gonvarri  | X     | X              | X        | X

-- ============================================
-- 6. Verificar AISLAMIENTO entre organizaciones
-- ============================================

-- Contar issues por organización (cada org debe mantener sus datos)
SELECT 
  o.name,
  COUNT(i.id) as total_issues
FROM organizations o
LEFT JOIN issues i ON i.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- Contar projects por organización
SELECT 
  o.name,
  COUNT(p.id) as total_projects
FROM organizations o
LEFT JOIN projects p ON p.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- ============================================
-- 7. Verificar NO hay DUPLICADOS en UUIDs
-- ============================================

-- Verificar que el UUID de Cosermo es único
SELECT id, COUNT(*) 
FROM organizations 
WHERE id = '33333333-3333-3333-3333-333333333333'
GROUP BY id;
-- Esperado: 1 fila con COUNT = 1

-- Verificar que el slug 'cosermo' es único
SELECT slug, COUNT(*) 
FROM organizations 
WHERE slug = 'cosermo'
GROUP BY slug;
-- Esperado: 1 fila con COUNT = 1

-- ============================================
-- 8. Verificar integridad de constraints
-- ============================================

-- Verificar que NO hay usuarios vinculados a organizaciones inexistentes
SELECT COUNT(*)
FROM user_organizations uo
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.id = uo.organization_id
);
-- Esperado: 0

-- Verificar que NO hay initiatives sin organización
SELECT COUNT(*)
FROM initiatives i
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.id = i.organization_id
);
-- Esperado: 0

-- Verificar que NO hay issues sin organización
SELECT COUNT(*)
FROM issues iss
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.id = iss.organization_id
);
-- Esperado: 0

-- ============================================
-- ✅ RESULTADO ESPERADO
-- ============================================

/*
SI TODO ESTÁ BIEN:

✅ Gonvarri mantiene todos sus datos (issues, projects, BUs, usuarios)
✅ Aurovitas mantiene todos sus datos (issues, projects, usuarios)
✅ Cosermo existe y está vacía (0 issues, 0 projects, 0 BUs)
✅ Cosermo puede tener usuarios asignados
✅ No hay duplicados de UUIDs
✅ No hay violaciones de integridad referencial
✅ Cada organización está completamente aislada de las demás

SI ALGO FALLA:
- Revisar los mensajes de error
- Ejecutar las queries individualmente para identificar el problema
- Consultar SETUP_COSERMO.md para troubleshooting
*/

-- ============================================
-- BONUS: Ver usuarios por organización
-- ============================================

SELECT 
  o.name as organization,
  au.email,
  uo.role,
  CASE WHEN uo.active THEN '✅' ELSE '❌' END as active_status
FROM organizations o
JOIN user_organizations uo ON uo.organization_id = o.id
JOIN auth.users au ON au.id = uo.auth_user_id
ORDER BY o.name, uo.role, au.email;


