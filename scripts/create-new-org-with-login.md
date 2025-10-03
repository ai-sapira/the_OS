# 🆕 Crear Nueva Organización con Login

Guía paso a paso para crear una organización completamente nueva con acceso por login, sin tocar ni romper nada de Gonvarri.

---

## 📋 Pasos

### **PASO 1: Crear la Organización en Supabase**

Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/editor

Ejecuta este SQL:

```sql
-- Crear nueva organización "Acme Corp"
INSERT INTO organizations (id, name, slug, settings)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Acme Corp',
  'acme',
  '{
    "sla_matrix": {
      "P0": {"hours": 2},
      "P1": {"hours": 24},
      "P2": {"hours": 72},
      "P3": {"hours": 168}
    }
  }'::jsonb
);
```

✅ **Verificar que se creó:**
```sql
SELECT id, name, slug FROM organizations;
```

Deberías ver:
- Gonvarri (01234567-8901-2345-6789-012345678901)
- Acme Corp (11111111-1111-1111-1111-111111111111)

---

### **PASO 2: Habilitar Email Auth en Supabase**

1. Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/providers

2. Configura **Email Provider**:
   - ✅ Enable Email provider: **ON**
   - ✅ Enable Email Signup: **ON**
   - ❌ Confirm email: **OFF** (para desarrollo)
   - ✅ Secure email change: **ON**

---

### **PASO 3: Crear Usuario de Acme en Supabase Auth**

1. Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. Click en **"Add user"** → **"Create new user"**

3. Rellena:
   - **Email:** `ceo@acme.com`
   - **Password:** `acme123`
   - **Auto Confirm User:** ✅ (marcar para desarrollo)

4. Click **"Create user"**

5. **⚠️ IMPORTANTE:** Copia el **UUID del usuario** que aparece en la tabla (algo como `a1b2c3d4-...`)

---

### **PASO 4: Vincular Usuario con Organización**

Vuelve al SQL Editor y ejecuta:

```sql
-- ⚠️ REEMPLAZA 'UUID_AQUI' con el UUID que copiaste en el paso anterior
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_AQUI',  -- ⬅️ Pega aquí el UUID del usuario
  '11111111-1111-1111-1111-111111111111',  -- Acme Corp
  'CEO',  -- Rol
  NULL,   -- No tiene initiative específica
  true    -- Activo
);
```

✅ **Verificar el vínculo:**
```sql
SELECT 
  au.email,
  o.name as organization,
  uo.role,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id;
```

Deberías ver:
```
email           | organization | role | active
----------------|--------------|------|--------
ceo@acme.com    | Acme Corp    | CEO  | true
```

---

### **PASO 5: Probar el Login**

1. **Ejecutar la app:**
   ```bash
   cd /Users/pablosenabre/Sapira/the_OS
   pnpm dev
   ```

2. **Abrir navegador:**
   ```
   http://localhost:3000
   ```

3. **Login:**
   - Email: `ceo@acme.com`
   - Password: `acme123`

4. **Verificar:**
   - ✅ Deberías entrar a la app
   - ✅ En el header debería aparecer "Acme Corp"
   - ✅ NO deberías ver issues, projects ni initiatives (está vacía)
   - ✅ Puedes crear nuevos issues, projects, etc.

---

## 🎯 Crear Datos Iniciales para Acme (Opcional)

Si quieres que Acme tenga Business Units iniciales:

```sql
-- Crear Business Units para Acme
INSERT INTO initiatives (id, organization_id, name, slug, description, manager_user_id, active)
VALUES 
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Engineering',
    'engineering',
    'Engineering and Product Development',
    NULL,
    true
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Sales',
    'sales',
    'Sales and Business Development',
    NULL,
    true
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Operations',
    'operations',
    'Operations and Logistics',
    NULL,
    true
  );
```

---

## 🔄 Crear Más Usuarios para Acme

Si necesitas más usuarios (BU managers, empleados, etc.):

### **Usuario BU Manager:**

1. Crear en Supabase Auth:
   - Email: `manager@acme.com`
   - Password: `acme123`
   - Copiar UUID

2. Vincular con role BU:
```sql
-- Primero obtener el ID de la initiative
SELECT id, name FROM initiatives WHERE organization_id = '11111111-1111-1111-1111-111111111111';

-- Vincular
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_DEL_MANAGER',
  '11111111-1111-1111-1111-111111111111',
  'BU',
  'UUID_DE_LA_INITIATIVE',  -- ej: Engineering
  true
);
```

### **Usuario Empleado:**

1. Crear en Supabase Auth:
   - Email: `employee@acme.com`
   - Password: `acme123`
   - Copiar UUID

2. Vincular con role EMP:
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_DEL_EMPLEADO',
  '11111111-1111-1111-1111-111111111111',
  'EMP',
  NULL,
  true
);
```

---

## 🔒 Seguridad Actual (Sin RLS)

**Estado actual:**
- ✅ Cada usuario ve solo su organización gracias al `AuthContext`
- ✅ El frontend filtra por `currentOrg.organization.id`
- ❌ NO hay RLS activo en la base de datos
- ⚠️ Técnicamente, con queries directas podrían acceder a datos de otras orgs

**Es seguro para desarrollo/demo**, pero si necesitas seguridad real a nivel de BD, tendrías que activar RLS.

---

## 🧹 Limpiar Acme (Si necesitas empezar de cero)

```sql
-- Eliminar todos los datos de Acme
DELETE FROM issues WHERE organization_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM projects WHERE organization_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM initiatives WHERE organization_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM user_organizations WHERE organization_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM users WHERE organization_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM organizations WHERE id = '11111111-1111-1111-1111-111111111111';
```

---

## ✅ Checklist

- [ ] Paso 1: Organización creada en BD
- [ ] Paso 2: Email Auth habilitado
- [ ] Paso 3: Usuario creado en Supabase Auth
- [ ] Paso 4: Usuario vinculado a organización
- [ ] Paso 5: Login probado y funcionando
- [ ] (Opcional) Business Units creadas
- [ ] (Opcional) Más usuarios creados

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Gonvarri funcionando como siempre (sin tocar)
- ✅ Acme Corp nueva y vacía
- ✅ Login funcional para acceder a Acme
- ✅ Cada organización aislada de la otra

**Para cambiar de organización:** Solo haz logout y login con otro usuario.


