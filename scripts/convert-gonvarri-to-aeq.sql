-- ============================================
-- CONVERTIR GONVARRI A AEQ ENERGY
-- ============================================
-- Este script convierte la organización Gonvarri en AEQ Energy
-- y crea los usuarios Pablo y Adolfo para asignar issues/initiatives
--
-- Estado actual:
-- - guillermo@sapira.ai → Gonvarri (SAP)
-- - pablo@sapira.ai → Gonvarri (SAP)
--
-- Después de ejecutar:
-- - guillermo@sapira.ai → AEQ Energy (SAP)
-- - pablo@sapira.ai → AEQ Energy (SAP)
-- + pablo@sapira.ai y adolfo@sapira.ai en tabla users (para asignar)

-- ============================================
-- PASO 1: CONVERTIR GONVARRI → AEQ ENERGY
-- ============================================

UPDATE organizations
SET 
  name = 'AEQ Energy',
  slug = 'aeq',
  settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{logo}',
    '"/logos/aeq.png"'
  ),
  updated_at = NOW()
WHERE id = '01234567-8901-2345-6789-012345678901';  -- ID de Gonvarri

-- Verificar cambio
SELECT id, name, slug, settings->'logo' as logo
FROM organizations
WHERE id = '01234567-8901-2345-6789-012345678901';

-- Resultado esperado:
-- id: 01234567-8901-2345-6789-012345678901
-- name: AEQ Energy
-- slug: aeq
-- logo: "/logos/aeq.png"

-- ============================================
-- PASO 2: CREAR USUARIOS PABLO Y ADOLFO
-- ============================================
-- Estos NO son usuarios de auth (login), son para asignar issues

INSERT INTO users (id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
VALUES
  -- Pablo Senabre
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Pablo Senabre',
    'pablo@sapira.ai',
    NULL,
    'SAP',
    '01234567-8901-2345-6789-012345678901',  -- AEQ (ex-Gonvarri)
    true,
    NOW(),
    NOW()
  ),
  
  -- Adolfo García
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Adolfo García',
    'adolfo@sapira.ai',
    NULL,
    'SAP',
    '01234567-8901-2345-6789-012345678901',  -- AEQ (ex-Gonvarri)
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  organization_id = EXCLUDED.organization_id,
  updated_at = NOW();

-- ============================================
-- PASO 3: VERIFICAR USUARIOS CREADOS
-- ============================================

SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  o.name as organization
FROM users u
JOIN organizations o ON o.id = u.organization_id
WHERE u.email IN ('pablo@sapira.ai', 'adolfo@sapira.ai')
ORDER BY u.name;

-- Resultado esperado:
-- id                                   | name           | email            | role | organization
-- -------------------------------------|----------------|------------------|------|-------------
-- aaaaaaaa-0000-0000-0000-000000000002 | Adolfo García  | adolfo@sapira.ai | SAP  | AEQ Energy
-- aaaaaaaa-0000-0000-0000-000000000001 | Pablo Senabre  | pablo@sapira.ai  | SAP  | AEQ Energy

-- ============================================
-- PASO 4: VERIFICAR AUTH USERS (PARA LOGIN)
-- ============================================

SELECT 
  au.email as login_email,
  o.name as organization,
  uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE o.slug = 'aeq' AND uo.active = true
ORDER BY au.email;

-- Resultado esperado:
-- login_email           | organization | role
-- ----------------------|--------------|-----
-- guillermo@sapira.ai   | AEQ Energy   | SAP
-- pablo@sapira.ai       | AEQ Energy   | SAP

-- ============================================
-- RESUMEN FINAL
-- ============================================

SELECT 
  '✅ CONVERSIÓN COMPLETADA' as status,
  (SELECT name FROM organizations WHERE slug = 'aeq') as org_name,
  (SELECT slug FROM organizations WHERE slug = 'aeq') as org_slug,
  (SELECT COUNT(*) FROM users WHERE organization_id = '01234567-8901-2345-6789-012345678901' AND active = true) as users_count,
  (SELECT COUNT(*) FROM user_organizations WHERE organization_id = '01234567-8901-2345-6789-012345678901' AND active = true) as auth_users_count;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
✅ QUÉ SE HA HECHO:
1. Organización Gonvarri → AEQ Energy
2. Logo configurado: /logos/aeq.png
3. Usuarios creados en tabla 'users':
   - pablo@sapira.ai (para asignar issues)
   - adolfo@sapira.ai (para asignar issues)

✅ USUARIOS DE LOGIN (auth.users):
- guillermo@sapira.ai → puede entrar con su contraseña
- pablo@sapira.ai → puede entrar con su contraseña

✅ USUARIOS PARA ASIGNAR (users):
- pablo@sapira.ai → aparece en dropdowns para asignar
- adolfo@sapira.ai → aparece en dropdowns para asignar

⚠️ SIGUIENTE PASO:
Para importar datos (Business Units, Projects, Issues):
  npx tsx scripts/import-csv-to-db.ts tu-archivo.csv aeq

📂 LOGO:
El logo ya está en: /public/logos/aeq.png
Se mostrará automáticamente cuando inicies sesión con guillermo@ o pablo@
*/







