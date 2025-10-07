-- ============================================
-- SETUP COMPLETO COSERMO
-- ============================================
-- Organización vacía lista para empezar a trabajar
-- Sin datos iniciales, pero con capacidad de asignar usuarios

-- ============================================
-- PASO 1: CREAR ORGANIZACIÓN COSERMO
-- ============================================

INSERT INTO organizations (id, name, slug, settings)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Cosermo',
  'cosermo',
  '{
    "sla_matrix": {
      "P0": {"hours": 4},
      "P1": {"hours": 24},
      "P2": {"hours": 72},
      "P3": {"hours": 168}
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICACIÓN: Ver que se creó correctamente
-- ============================================
SELECT id, name, slug, created_at 
FROM organizations 
WHERE slug = 'cosermo';

-- Resultado esperado:
-- id: 33333333-3333-3333-3333-333333333333
-- name: Cosermo
-- slug: cosermo

-- ============================================
-- PASO 2: CREAR USUARIOS EN SUPABASE AUTH
-- ============================================
/*
IMPORTANTE: NO crear usuarios con SQL, usar Supabase Dashboard:
https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

Ejemplos de usuarios que puedes crear:

1. ceo@cosermo.com / cosermo123 (Auto confirm: ✅)
2. manager@cosermo.com / cosermo123 (Auto confirm: ✅)
3. empleado@cosermo.com / cosermo123 (Auto confirm: ✅)

Después de crear cada usuario, COPIAR su UUID
*/

-- ============================================
-- PASO 3: VER UUIDs DE USUARIOS CREADOS
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%cosermo%'
ORDER BY created_at DESC;

-- ============================================
-- PASO 4: VINCULAR USUARIOS A COSERMO
-- ============================================
-- ⚠️ REEMPLAZAR los UUIDs con los que copiaste arriba
-- Esta es una plantilla - ajusta según los usuarios que hayas creado

/*
-- Ejemplo: CEO de Cosermo
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_CEO_COSERMO',  -- ⬅️ Reemplazar con UUID real
  '33333333-3333-3333-3333-333333333333',
  'CEO',
  NULL,
  true
)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;

-- Ejemplo: Manager de Cosermo (si creas Business Units)
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_MANAGER_COSERMO',  -- ⬅️ Reemplazar con UUID real
  '33333333-3333-3333-3333-333333333333',
  'BU',
  'UUID_DE_BUSINESS_UNIT',  -- ⬅️ Si tienes BUs
  true
)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;

-- Ejemplo: Empleado de Cosermo
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_EMPLEADO_COSERMO',  -- ⬅️ Reemplazar con UUID real
  '33333333-3333-3333-3333-333333333333',
  'EMP',
  NULL,
  true
)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;
*/

-- ============================================
-- PASO 5: VERIFICAR VINCULACIÓN
-- ============================================
SELECT 
  au.email,
  o.name as organization,
  uo.role,
  i.name as business_unit,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE o.slug = 'cosermo' 
  AND uo.active = true
ORDER BY uo.role, au.email;

-- ============================================
-- OPCIONAL: CREAR BUSINESS UNITS PARA COSERMO
-- ============================================
-- Si Cosermo necesita departamentos/BUs desde el inicio:

/*
INSERT INTO initiatives (organization_id, name, slug, description, active)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Producción', 'produccion', 'Departamento de Producción', true),
  ('33333333-3333-3333-3333-333333333333', 'Calidad', 'calidad', 'Control de Calidad', true),
  ('33333333-3333-3333-3333-333333333333', 'Logística', 'logistica', 'Logística y Distribución', true)
RETURNING id, name;
*/

-- ============================================
-- PASO 6: PROBAR LOGIN
-- ============================================
/*
1. pnpm dev
2. http://localhost:3000
3. Login: ceo@cosermo.com / cosermo123 (o el usuario que hayas creado)
4. Verificar: Header muestra "Cosermo"
5. La organización estará VACÍA (sin issues, projects, etc.)
6. Puedes crear nuevo contenido desde cero
*/

-- ============================================
-- VERIFICACIÓN FINAL: VER TODAS LAS ORGANIZACIONES
-- ============================================
SELECT 
  o.name as organization,
  o.slug,
  COUNT(DISTINCT uo.auth_user_id) as total_users,
  COUNT(DISTINCT i.id) as total_business_units,
  COUNT(DISTINCT iss.id) as total_issues
FROM organizations o
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.active = true
LEFT JOIN initiatives i ON i.organization_id = o.id AND i.active = true
LEFT JOIN issues iss ON iss.organization_id = o.id
GROUP BY o.id, o.name, o.slug
ORDER BY o.name;

-- Deberías ver:
-- organization | slug     | total_users | total_business_units | total_issues
-- -------------|----------|-------------|----------------------|-------------
-- Aurovitas    | aurovitas| X           | X                    | X
-- Cosermo      | cosermo  | 0           | 0                    | 0  ⬅️ Vacía!
-- Gonvarri     | gonvarri | X           | X                    | X

-- ============================================
-- QUERIES ÚTILES DE ADMINISTRACIÓN
-- ============================================

-- Ver todos los usuarios de Cosermo
SELECT 
  au.email,
  uo.role,
  i.name as business_unit,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE uo.organization_id = '33333333-3333-3333-3333-333333333333'
ORDER BY uo.role, au.email;

-- Cambiar rol de un usuario en Cosermo
-- UPDATE user_organizations
-- SET role = 'CEO', initiative_id = NULL
-- WHERE auth_user_id = 'UUID_USUARIO'
--   AND organization_id = '33333333-3333-3333-3333-333333333333';

-- Desactivar un usuario de Cosermo
-- UPDATE user_organizations
-- SET active = false
-- WHERE auth_user_id = 'UUID_USUARIO'
--   AND organization_id = '33333333-3333-3333-3333-333333333333';

-- Ver contenido de Cosermo (debería estar vacío inicialmente)
SELECT 
  'Issues' as tipo, 
  COUNT(*) as cantidad 
FROM issues 
WHERE organization_id = '33333333-3333-3333-3333-333333333333'
UNION ALL
SELECT 
  'Projects' as tipo, 
  COUNT(*) as cantidad 
FROM projects 
WHERE organization_id = '33333333-3333-3333-3333-333333333333'
UNION ALL
SELECT 
  'Initiatives' as tipo, 
  COUNT(*) as cantidad 
FROM initiatives 
WHERE organization_id = '33333333-3333-3333-3333-333333333333';

-- ============================================
-- AÑADIR LOGO DE COSERMO (PARA MÁS ADELANTE)
-- ============================================
/*
Cuando tengas el logo de Cosermo:

1. Guárdalo en: /public/logos/cosermo.svg (o .png)

2. Actualiza el componente Header o el selector de organizaciones
   para mostrar el logo de Cosermo

3. Opcional: Actualiza settings de la organización con metadata del logo:

UPDATE organizations
SET settings = settings || '{"logo": "/logos/cosermo.svg"}'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333333';
*/


