# 🚀 Quick Start - Auth Multi-Tenant

## Script SQL Completo para Setup Inicial

Copia y pega esto en **Supabase SQL Editor** (https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql):

```sql
-- ============================================
-- PASO 1: Verificar organizaciones existentes
-- ============================================
SELECT id, name, slug FROM organizations;

-- ============================================
-- PASO 2: Crear usuarios de prueba
-- ============================================
-- IMPORTANTE: Esto lo haces desde Supabase Dashboard > Auth > Users
-- NO desde SQL, porque necesitas que Supabase Auth maneje la autenticación

/*
Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

Crear estos usuarios (Click "Add user" → "Create new user"):

1. Email: sapira@sapira.com
   Password: sapira123
   Auto Confirm: ✅
   
2. Email: ceo@gonvarri.com
   Password: gonvarri123
   Auto Confirm: ✅
   
3. Email: manager@gonvarri.com
   Password: gonvarri123
   Auto Confirm: ✅
   
4. Email: employee@gonvarri.com
   Password: gonvarri123
   Auto Confirm: ✅

Después de crear, COPIA los UUIDs de cada usuario
*/

-- ============================================
-- PASO 3: Ver los UUIDs de usuarios creados
-- ============================================
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- ============================================
-- PASO 4: Obtener IDs de initiatives (para BU)
-- ============================================
SELECT id, name, slug 
FROM initiatives 
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY name;

-- ============================================
-- PASO 5: Vincular usuarios a organizaciones
-- ============================================
-- REEMPLAZA los UUIDs con los que copiaste arriba

-- Ejemplo (modifica con tus UUIDs):
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES
  -- Usuario SAP (reemplaza 'UUID_SAPIRA_AQUI')
  ('UUID_SAPIRA_AQUI', '01234567-8901-2345-6789-012345678901', 'SAP', NULL, true),
  
  -- CEO Gonvarri (reemplaza 'UUID_CEO_AQUI')
  ('UUID_CEO_AQUI', '01234567-8901-2345-6789-012345678901', 'CEO', NULL, true),
  
  -- BU Manager Gonvarri - Technology (reemplaza UUIDs)
  ('UUID_MANAGER_AQUI', '01234567-8901-2345-6789-012345678901', 'BU', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
  
  -- Employee Gonvarri (reemplaza 'UUID_EMPLOYEE_AQUI')
  ('UUID_EMPLOYEE_AQUI', '01234567-8901-2345-6789-012345678901', 'EMP', NULL, true)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;

-- ============================================
-- PASO 6: Verificar que todo está correcto
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
WHERE uo.active = true
ORDER BY o.name, uo.role;

-- Deberías ver algo como:
-- email                  | organization | role | business_unit
-- ----------------------|--------------|------|---------------
-- ceo@gonvarri.com      | Gonvarri     | CEO  | NULL
-- employee@gonvarri.com | Gonvarri     | EMP  | NULL
-- manager@gonvarri.com  | Gonvarri     | BU   | Tecnología
-- sapira@sapira.com     | Gonvarri     | SAP  | NULL
```

## ✅ Checklist de Configuración

### Supabase Dashboard

- [ ] **Auth Settings** (https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/providers)
  - [ ] Email provider habilitado
  - [ ] Email signup habilitado
  - [ ] Confirm email: OFF (para desarrollo)

- [ ] **Usuarios Creados** (https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users)
  - [ ] sapira@sapira.com (SAP)
  - [ ] ceo@gonvarri.com (CEO)
  - [ ] manager@gonvarri.com (BU)
  - [ ] employee@gonvarri.com (EMP)

- [ ] **SQL Ejecutado**
  - [ ] Migración de multi-tenant aplicada
  - [ ] Usuarios vinculados a organizaciones
  - [ ] Verificación muestra datos correctos

### Local

- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Servidor corriendo (`pnpm dev`)

## 🧪 Probar el Sistema

1. **Abrir navegador**: http://localhost:3000
2. **Login con**: ceo@gonvarri.com / gonvarri123
3. **Verificar**: 
   - Se muestra "Gonvarri" en el header
   - Se pueden ver issues de esa org
   - Logout funciona
4. **Probar con otro usuario**: employee@gonvarri.com / gonvarri123

## 🎯 Usuarios de Prueba Recomendados

| Usuario | Email | Password | Org | Rol | Propósito |
|---------|-------|----------|-----|-----|-----------|
| Admin Sapira | sapira@sapira.com | sapira123 | Gonvarri | SAP | Testing admin total |
| CEO | ceo@gonvarri.com | gonvarri123 | Gonvarri | CEO | Testing vista ejecutiva |
| Manager | manager@gonvarri.com | gonvarri123 | Gonvarri | BU | Testing vista departamental |
| Empleado | employee@gonvarri.com | gonvarri123 | Gonvarri | EMP | Testing vista limitada |

## 📝 Notas Importantes

1. **RLS está activo**: Cada usuario solo verá datos de su organización
2. **Cambiar de org**: Solo mediante logout
3. **Múltiples orgs**: Si un usuario tiene 2+ orgs, verá selector al entrar
4. **Producción**: Habilitar "Confirm email" en Supabase Auth Settings

