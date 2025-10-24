-- ============================================
-- CONVERTIR ORGANIZACIÓN EXISTENTE A AEQ
-- ============================================
-- Este script convierte una organización existente (por ejemplo Cosermo)
-- en AEQ Energy y crea los usuarios necesarios
--
-- ⚠️ ANTES DE EJECUTAR:
-- 1. Ejecuta check-current-orgs.sql para ver las organizaciones actuales
-- 2. Decide qué organización quieres convertir (probablemente Cosermo)
-- 3. Ajusta el ID de la organización en la línea 24 si es necesario

-- ============================================
-- PASO 1: VER ORGANIZACIONES ACTUALES
-- ============================================
SELECT id, name, slug, created_at 
FROM organizations
ORDER BY created_at;

-- Copia el ID de la organización que quieres convertir (probablemente Cosermo)

-- ============================================
-- PASO 2: CONVERTIR ORGANIZACIÓN A AEQ
-- ============================================

-- Cambiar nombre y slug de la organización
-- ⚠️ Ajusta el WHERE si quieres convertir una organización diferente
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
WHERE slug = 'cosermo';  -- ⬅️ CAMBIA ESTO si quieres convertir otra organización

-- Verificar que se actualizó
SELECT id, name, slug, settings->'logo' as logo
FROM organizations
WHERE slug = 'aeq';

-- ============================================
-- PASO 3: CREAR USUARIOS EN LA TABLA users
-- ============================================
-- Estos usuarios NO son para login, solo para asignar initiatives/issues

-- Primero, obtener el ID de la organización AEQ
DO $$
DECLARE
  aeq_org_id UUID;
BEGIN
  -- Obtener ID de AEQ
  SELECT id INTO aeq_org_id FROM organizations WHERE slug = 'aeq';
  
  IF aeq_org_id IS NULL THEN
    RAISE EXCEPTION 'Organización AEQ no encontrada. Ejecuta primero el PASO 2.';
  END IF;
  
  -- Crear usuario Pablo
  INSERT INTO users (id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
  VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',  -- ID fijo para Pablo
    'Pablo Senabre',
    'pablo@sapira.ai',
    NULL,
    'SAP',  -- Role como Sapira advisor
    aeq_org_id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = 'Pablo Senabre',
    email = 'pablo@sapira.ai',
    organization_id = aeq_org_id,
    updated_at = NOW();
  
  -- Crear usuario Adolfo
  INSERT INTO users (id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
  VALUES (
    'aaaaaaaa-0000-0000-0000-000000000002',  -- ID fijo para Adolfo
    'Adolfo García',
    'adolfo@sapira.ai',
    NULL,
    'SAP',  -- Role como Sapira advisor
    aeq_org_id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = 'Adolfo García',
    email = 'adolfo@sapira.ai',
    organization_id = aeq_org_id,
    updated_at = NOW();
  
  RAISE NOTICE 'Usuarios creados exitosamente para organización AEQ (%)!', aeq_org_id;
END $$;

-- ============================================
-- PASO 4: VERIFICAR USUARIOS CREADOS
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

-- Deberías ver:
-- id                                   | name           | email            | role | organization
-- -------------------------------------|----------------|------------------|------|-------------
-- aaaaaaaa-0000-0000-0000-000000000002 | Adolfo García  | adolfo@sapira.ai | SAP  | AEQ Energy
-- aaaaaaaa-0000-0000-0000-000000000001 | Pablo Senabre  | pablo@sapira.ai  | SAP  | AEQ Energy

-- ============================================
-- PASO 5: ACTUALIZAR USER_ORGANIZATIONS (OPCIONAL)
-- ============================================
-- Si ya tienes usuarios de auth vinculados a esta organización,
-- puede que quieras actualizarlos. Esto es OPCIONAL.

-- Ver usuarios de auth vinculados actualmente
SELECT 
  au.email as auth_email,
  o.name as organization,
  uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE o.slug = 'aeq' AND uo.active = true;

-- Si quieres cambiar el rol de algún usuario de auth, descomenta:
/*
UPDATE user_organizations
SET role = 'CEO'  -- o 'BU', 'EMP', etc.
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'aeq')
  AND auth_user_id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
*/

-- ============================================
-- RESUMEN FINAL
-- ============================================
SELECT 
  '✅ Organización AEQ configurada' as status,
  o.name,
  o.slug,
  COUNT(u.id) as total_users
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.active = true
WHERE o.slug = 'aeq'
GROUP BY o.id, o.name, o.slug;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. Logo ya copiado a: /public/logos/aeq.png
   
2. Usuarios creados:
   - pablo@sapira.ai (para asignar issues/initiatives)
   - adolfo@sapira.ai (para asignar issues/initiatives)
   
3. Estos usuarios NO son para login, son para:
   - Asignar como reporter en issues
   - Asignar como assignee en issues
   - Aparecer en dropdowns de usuarios
   
4. Si necesitas login para AEQ, debes:
   - Crear usuario en Supabase Auth Dashboard
   - Vincularlo con user_organizations
   - Ver: scripts/create-new-org-with-login.md
   
5. Para importar datos CSV:
   - Usa: scripts/import-csv-to-db.ts
   - Ejemplo: npx tsx scripts/import-csv-to-db.ts data.csv aeq
*/

