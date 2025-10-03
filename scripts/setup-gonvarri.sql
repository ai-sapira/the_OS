-- ============================================
-- SETUP COMPLETO GONVARRI
-- ============================================

-- PASO 1: Ver organizaciones existentes
SELECT id, name, slug FROM organizations;
-- Gonvarri ID: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee

-- PASO 2: Ver Business Units de Gonvarri
SELECT id, name, slug FROM initiatives 
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
ORDER BY name;

/*
Business Units creadas:
- Tecnología e Innovación: 11111111-1111-1111-1111-111111111111
- Producción: 22222222-2222-2222-2222-222222222222
- Logística: 33333333-3333-3333-3333-333333333333
- Recursos Humanos: 44444444-4444-4444-4444-444444444444
- Finanzas: 55555555-5555-5555-5555-555555555555
*/

-- ============================================
-- PASO 3: CREAR USUARIOS EN SUPABASE AUTH
-- ============================================

/*
IMPORTANTE: NO crear usuarios con SQL, usar Supabase Dashboard:
https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

Click "Add user" → "Create new user" para cada uno:

1. ceo@gonvarri.com / gonvarri123 (Auto confirm: ✅)
2. tech@gonvarri.com / gonvarri123 (Auto confirm: ✅)
3. prod@gonvarri.com / gonvarri123 (Auto confirm: ✅)
4. log@gonvarri.com / gonvarri123 (Auto confirm: ✅)
5. hr@gonvarri.com / gonvarri123 (Auto confirm: ✅)
6. finance@gonvarri.com / gonvarri123 (Auto confirm: ✅)
7. empleado@gonvarri.com / gonvarri123 (Auto confirm: ✅)

Después de crear cada usuario, COPIAR su UUID
*/

-- ============================================
-- PASO 4: Ver UUIDs de usuarios creados
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- PASO 5: VINCULAR USUARIOS A GONVARRI
-- ============================================
-- ⚠️ REEMPLAZAR los UUIDs con los que copiaste arriba

INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES
  -- CEO de Gonvarri (REEMPLAZA UUID_CEO_AQUI)
  ('UUID_CEO_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'CEO', NULL, true),
  
  -- BU Manager - Tecnología (REEMPLAZA UUID_TECH_AQUI)
  ('UUID_TECH_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '11111111-1111-1111-1111-111111111111', true),
  
  -- BU Manager - Producción (REEMPLAZA UUID_PROD_AQUI)
  ('UUID_PROD_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '22222222-2222-2222-2222-222222222222', true),
  
  -- BU Manager - Logística (REEMPLAZA UUID_LOG_AQUI)
  ('UUID_LOG_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '33333333-3333-3333-3333-333333333333', true),
  
  -- BU Manager - RRHH (REEMPLAZA UUID_HR_AQUI)
  ('UUID_HR_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '44444444-4444-4444-4444-444444444444', true),
  
  -- BU Manager - Finanzas (REEMPLAZA UUID_FINANCE_AQUI)
  ('UUID_FINANCE_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '55555555-5555-5555-5555-555555555555', true),
  
  -- Empleado (REEMPLAZA UUID_EMP_AQUI)
  ('UUID_EMP_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'EMP', NULL, true)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;

-- ============================================
-- PASO 6: VERIFICAR VINCULACIÓN
-- ============================================
SELECT 
  au.email,
  o.name as organization,
  uo.role,
  i.name as business_unit
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE o.slug = 'gonvarri' 
  AND uo.active = true
ORDER BY uo.role, au.email;

-- Deberías ver:
-- email                  | organization | role | business_unit
-- -----------------------|--------------|------|------------------
-- ceo@gonvarri.com       | Gonvarri     | CEO  | NULL
-- finance@gonvarri.com   | Gonvarri     | BU   | Finanzas
-- hr@gonvarri.com        | Gonvarri     | BU   | Recursos Humanos
-- log@gonvarri.com       | Gonvarri     | BU   | Logística
-- prod@gonvarri.com      | Gonvarri     | BU   | Producción
-- tech@gonvarri.com      | Gonvarri     | BU   | Tecnología e Innovación
-- empleado@gonvarri.com  | Gonvarri     | EMP  | NULL

-- ============================================
-- PASO 7: HABILITAR EMAIL AUTH
-- ============================================
/*
1. Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/providers
2. Email provider → ✅ ON
3. Enable Email Signup → ✅ ON
4. Confirm email → ❌ OFF (para desarrollo)
*/

-- ============================================
-- PASO 8: PROBAR LOGIN
-- ============================================
/*
1. pnpm dev
2. http://localhost:3000
3. Login: ceo@gonvarri.com / gonvarri123
4. Verificar: Header muestra "Gonvarri"
*/

-- ============================================
-- QUERIES ÚTILES
-- ============================================

-- Ver todos los usuarios de Gonvarri
SELECT 
  au.email,
  uo.role,
  i.name as bu,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE uo.organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
ORDER BY uo.role, au.email;

-- Cambiar rol de un usuario
-- UPDATE user_organizations
-- SET role = 'CEO', initiative_id = NULL
-- WHERE auth_user_id = 'UUID_USUARIO'
--   AND organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Desactivar un usuario
-- UPDATE user_organizations
-- SET active = false
-- WHERE auth_user_id = 'UUID_USUARIO'
--   AND organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Ver issues de Gonvarri
SELECT id, key, title, state, priority
FROM issues
WHERE organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
ORDER BY created_at DESC
LIMIT 10;

