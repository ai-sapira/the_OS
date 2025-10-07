-- ============================================
-- TEST BU FILTERING - Verificar filtrado por Business Unit
-- ============================================
-- Este script prueba que el filtrado por BU Manager funcione correctamente

-- 1. Ver la organización Gonvarri
SELECT id, name, slug FROM organizations WHERE slug = 'gonvarri';
-- Resultado esperado: id = '01234567-8901-2345-6789-012345678901'

-- ============================================
-- 2. Ver todas las Business Units (initiatives)
-- ============================================
SELECT 
  i.id,
  i.name,
  i.slug,
  i.active,
  u.name as manager_name,
  u.role as manager_role,
  u.id as manager_id
FROM initiatives i
LEFT JOIN users u ON u.id = i.manager_user_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.active = true
ORDER BY i.name;

-- ============================================
-- 3. Ver usuarios BU Managers con sus BUs asignadas
-- ============================================
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email,
  u.role,
  i.id as initiative_id,
  i.name as bu_name,
  i.slug as bu_slug
FROM users u
LEFT JOIN initiatives i ON i.manager_user_id = u.id
WHERE u.organization_id = '01234567-8901-2345-6789-012345678901'
  AND u.role = 'BU'
  AND u.active = true
ORDER BY u.name;

-- ============================================
-- 4. CASO ESPECÍFICO: BU Manager de Finance
-- ============================================
-- Buscar el BU Manager asignado a Finance
SELECT 
  i.id as initiative_id,
  i.name as bu_name,
  i.slug as bu_slug,
  u.id as manager_id,
  u.name as manager_name,
  u.email as manager_email
FROM initiatives i
LEFT JOIN users u ON u.id = i.manager_user_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.slug = 'finance'
  AND i.active = true;

-- ============================================
-- 5. Ver Issues de Finance
-- ============================================
-- Contar issues por BU para ver distribución
SELECT 
  i.name as bu_name,
  COUNT(iss.id) as total_issues,
  COUNT(CASE WHEN iss.state = 'triage' THEN 1 END) as triage_count,
  COUNT(CASE WHEN iss.state != 'triage' THEN 1 END) as accepted_count
FROM initiatives i
LEFT JOIN issues iss ON iss.initiative_id = i.id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
GROUP BY i.id, i.name
ORDER BY total_issues DESC;

-- Issues específicos de Finance
SELECT 
  iss.id,
  iss.key,
  iss.title,
  iss.state,
  iss.priority,
  i.name as bu_name,
  p.name as project_name
FROM issues iss
LEFT JOIN initiatives i ON i.id = iss.initiative_id
LEFT JOIN projects p ON p.id = iss.project_id
WHERE iss.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.slug = 'finance'
ORDER BY iss.created_at DESC
LIMIT 20;

-- ============================================
-- 6. Ver Proyectos de Finance
-- ============================================
SELECT 
  p.id,
  p.name,
  p.slug,
  p.status,
  i.name as bu_name,
  COUNT(iss.id) as issue_count
FROM projects p
LEFT JOIN initiatives i ON i.id = p.initiative_id
LEFT JOIN issues iss ON iss.project_id = p.id AND iss.state != 'triage'
WHERE p.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.slug = 'finance'
GROUP BY p.id, p.name, p.slug, p.status, i.name
ORDER BY p.name;

-- ============================================
-- 7. TEST: Simular vista de BU Manager de Finance
-- ============================================
-- Asumiendo que Miguel López es el BU Manager de Finance
-- ID del Manager: (obtendremos del query 4)

-- Para simular la vista de un BU Manager específico, 
-- reemplaza MANAGER_ID_HERE con el ID real del query 4

/*
-- Obtener initiative_id del manager
SELECT i.id as initiative_id
FROM initiatives i
WHERE i.manager_user_id = 'MANAGER_ID_HERE';

-- Ver solo issues de su BU
SELECT 
  iss.id,
  iss.key,
  iss.title,
  iss.state,
  iss.priority
FROM issues iss
WHERE iss.initiative_id = (
  SELECT i.id 
  FROM initiatives i 
  WHERE i.manager_user_id = 'MANAGER_ID_HERE'
)
AND iss.state != 'triage';

-- Ver solo proyectos de su BU
SELECT 
  p.id,
  p.name,
  p.slug,
  p.status
FROM projects p
WHERE p.initiative_id = (
  SELECT i.id 
  FROM initiatives i 
  WHERE i.manager_user_id = 'MANAGER_ID_HERE'
);
*/

-- ============================================
-- 8. VERIFICAR MOCK USERS en use-supabase-data.ts
-- ============================================
-- Los IDs deben coincidir con:
/*
GONVARRI_MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',  // Pablo Senabre
  'CEO': '22222222-2222-2222-2222-222222222222',  // CEO Director
  'BU':  'ID_FINANCE_MANAGER_AQUI',               // Miguel López (Finance)
  'EMP': '33333333-3333-3333-3333-333333333333'   // Carlos Rodríguez
}

GONVARRI_BU_INITIATIVES = {
  'ID_FINANCE_MANAGER_AQUI': 'ID_FINANCE_INITIATIVE_AQUI'
}
*/

-- Ejecutar query 4 para obtener estos IDs reales

-- ============================================
-- 9. VERIFICAR que exista contenido en Finance
-- ============================================
-- Si Finance no tiene issues, no habrá nada que mostrar al BU Manager

SELECT 
  'Total Issues' as metric,
  COUNT(*) as value
FROM issues
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
UNION ALL
SELECT 
  'Finance Issues' as metric,
  COUNT(*) as value
FROM issues iss
JOIN initiatives i ON i.id = iss.initiative_id
WHERE iss.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.slug = 'finance'
UNION ALL
SELECT 
  'Finance Projects' as metric,
  COUNT(*) as value
FROM projects p
JOIN initiatives i ON i.id = p.initiative_id
WHERE p.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.slug = 'finance';


