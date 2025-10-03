-- ============================================
-- SETUP USUARIOS MOCK PARA AUROVITAS
-- ============================================
-- Este script crea usuarios mock en Aurovitas para que los dropdowns funcionen
-- (managers, assignees, BU owners, etc.)

-- Organización: Aurovitas
-- ID: 22222222-2222-2222-2222-222222222222

-- ============================================
-- PASO 1: Insertar usuarios en la tabla users
-- ============================================

INSERT INTO users (id, name, email, avatar_url, role, organization_id, active, created_at, updated_at)
VALUES
  -- STRATEGY LAYER - AUROVITAS
  -- CEO
  (
    '11111111-aaaa-1111-1111-111111111111',
    'Gerardo Dueso',
    'gerardo@aurovitas.com',
    NULL,
    'CEO',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  
  -- SAPIRA ADVISORS (pueden gestionar todo)
  (
    '11111111-aaaa-2222-2222-222222222222',
    'María García',
    'maria.garcia@sapira.ai',
    NULL,
    'SAP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-3333-3333-333333333333',
    'Carlos Martínez',
    'carlos.martinez@sapira.ai',
    NULL,
    'SAP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  
  -- BU MANAGERS (Finance, HR, Legal, Sales)
  (
    '11111111-aaaa-4444-4444-444444444444',
    'Roberto Jiménez',
    'roberto.jimenez@aurovitas.com',
    NULL,
    'BU',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-5555-5555-555555555555',
    'Patricia Moreno',
    'patricia.moreno@aurovitas.com',
    NULL,
    'BU',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-6666-6666-666666666666',
    'Miguel Ángel Torres',
    'miguel.torres@aurovitas.com',
    NULL,
    'BU',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-7777-7777-777777777777',
    'Ana Fernández',
    'ana.fernandez@aurovitas.com',
    NULL,
    'BU',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  
  -- EMPLOYEES
  (
    '11111111-aaaa-8888-8888-888888888888',
    'Elena Ruiz',
    'elena.ruiz@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-9999-9999-999999999999',
    'Javier Blanco',
    'javier.blanco@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Cristina Vargas',
    'cristina.vargas@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-bbbb-bbbb-bbbbbbbbbbbb',
    'Fernando Castro',
    'fernando.castro@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-cccc-cccc-cccccccccccc',
    'Isabel Morales',
    'isabel.morales@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-dddd-dddd-dddddddddddd',
    'Laura Sánchez',
    'laura.sanchez@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-aaaa-eeee-eeee-eeeeeeeeeeee',
    'David López',
    'david.lopez@aurovitas.com',
    NULL,
    'EMP',
    '22222222-2222-2222-2222-222222222222',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id,
  active = EXCLUDED.active,
  updated_at = NOW();

-- ============================================
-- PASO 2: Verificar usuarios insertados
-- ============================================

SELECT 
  name,
  email,
  role,
  active
FROM users
WHERE organization_id = '22222222-2222-2222-2222-222222222222'
ORDER BY 
  CASE role
    WHEN 'SAP' THEN 1
    WHEN 'CEO' THEN 2
    WHEN 'BU' THEN 3
    WHEN 'EMP' THEN 4
  END,
  name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Deberías ver 13 usuarios:
-- - 2 SAP (María García, Carlos Martínez)
-- - 1 CEO (Gerardo Dueso)
-- - 4 BU Managers (Roberto, Patricia, Miguel Ángel, Ana)
-- - 6 Employees (Elena, Javier, Cristina, Fernando, Isabel, Laura, David)

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Estos usuarios son MOCK, no tienen auth en Supabase Auth
-- 2. Funcionan para asignar issues, projects, initiatives en Aurovitas
-- 3. NO pueden hacer login (a menos que crees sus cuentas en Supabase Auth)
-- 4. Solo el usuario gerardo@aurovitas.com tiene auth real (si lo creaste antes)

