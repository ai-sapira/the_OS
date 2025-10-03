# 🏢 Multi-Tenant Authentication Setup

Sistema de autenticación multi-tenant implementado con Supabase Auth.

## 📋 Configuración Paso a Paso

### 1. **Aplicar Migraciones de Base de Datos**

Las migraciones ya están creadas en `/supabase/migrations/`:

```bash
# Opción A: Aplicar con Supabase CLI (si lo tienes instalado)
supabase db push

# Opción B: Aplicar manualmente en Supabase Dashboard
# 1. Ve a https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql
# 2. Copia y ejecuta el contenido de:
#    - supabase/migrations/20250102_auth_multi_tenant.sql
#    - supabase/migrations/20250102_seed_auth_data.sql
```

### 2. **Habilitar Email Auth en Supabase**

1. Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/providers
2. En **Email** → Activa "Enable Email provider"
3. Configura:
   - ✅ Enable Email Signup
   - ✅ Confirm Email: **OFF** (para desarrollo, activar en producción)
   - ✅ Secure Email Change: **ON**

### 3. **Crear Usuarios de Prueba**

Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

**Crear estos usuarios:**

| Email | Password | Organización | Rol |
|-------|----------|--------------|-----|
| sapira@sapira.com | sapira123 | Todas | SAP |
| ceo@gonvarri.com | gonvarri123 | Gonvarri | CEO |
| manager@gonvarri.com | gonvarri123 | Gonvarri | BU |
| employee@gonvarri.com | gonvarri123 | Gonvarri | EMP |
| ceo@acme.com | acme123 | Acme Corp | CEO |

**Pasos para crear cada usuario:**
1. Click en "Add User" → "Create new user"
2. Email: `sapira@sapira.com`
3. Password: `sapira123`
4. Auto Confirm User: ✅ (para desarrollo)
5. Click "Create user"
6. **Copiar el UUID del usuario creado**

### 4. **Vincular Usuarios a Organizaciones**

Una vez creados los usuarios, **copia sus UUIDs** y ejecuta esto en Supabase SQL Editor:

```sql
-- Obtener los IDs de los usuarios creados
SELECT id, email FROM auth.users;

-- Obtener los IDs de las organizaciones
SELECT id, name FROM organizations;

-- Obtener los IDs de las initiatives (para BU managers)
SELECT id, name FROM initiatives WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- Vincular usuarios (REEMPLAZA los UUIDs con los reales)
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES
  -- SAP user - acceso a Gonvarri
  ('UUID_SAPIRA', '01234567-8901-2345-6789-012345678901', 'SAP', NULL, true),
  -- SAP user - acceso a Acme (si quieres que tenga acceso a múltiples)
  ('UUID_SAPIRA', '11111111-1111-1111-1111-111111111111', 'SAP', NULL, true),
  
  -- CEO de Gonvarri
  ('UUID_CEO_GONVARRI', '01234567-8901-2345-6789-012345678901', 'CEO', NULL, true),
  
  -- BU Manager de Gonvarri (Technology)
  ('UUID_MANAGER_GONVARRI', '01234567-8901-2345-6789-012345678901', 'BU', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
  
  -- Employee de Gonvarri
  ('UUID_EMPLOYEE_GONVARRI', '01234567-8901-2345-6789-012345678901', 'EMP', NULL, true),
  
  -- CEO de Acme
  ('UUID_CEO_ACME', '11111111-1111-1111-1111-111111111111', 'CEO', NULL, true)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;
```

### 5. **Verificar Variables de Entorno**

Asegúrate de que tienes estas variables en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. **Probar el Sistema**

```bash
# Instalar dependencias (si no lo has hecho)
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

**Flujo de prueba:**

1. Ve a `http://localhost:3000`
2. Te redirigirá a `/login`
3. Ingresa: `ceo@gonvarri.com` / `gonvarri123`
4. Si el usuario tiene 1 organización → entra directo
5. Si tiene múltiples → muestra selector
6. Una vez dentro, verás el nombre de la organización en el header
7. Para cambiar de organización → Click en avatar → "Cerrar sesión"

---

## 🏗️ Arquitectura Implementada

### **Flujo de Autenticación**

```
Usuario → /login
    ↓
Supabase Auth
    ↓
¿Tiene organizaciones?
    ↓ 1 org         ↓ 2+ orgs
    ↓               ↓
Entra directo    /select-org
    ↓               ↓
    └───────┬───────┘
            ↓
    App (scoped a org)
```

### **Componentes Clave**

1. **AuthContext** (`lib/context/auth-context.tsx`)
   - Maneja autenticación de Supabase
   - Carga organizaciones del usuario
   - Mantiene organización activa

2. **Middleware** (`middleware.ts`)
   - Protege rutas privadas
   - Redirige a login si no autenticado
   - Usa Supabase SSR

3. **Páginas de Auth**
   - `/login` - Login con email/password
   - `/select-org` - Selector de organización

4. **Header** (`components/header.tsx`)
   - Muestra organización actual
   - Dropdown con logout

### **Seguridad: Row Level Security (RLS)**

Todas las tablas principales tienen RLS habilitado:

```sql
-- Los usuarios solo ven datos de sus organizaciones
CREATE POLICY "Users see own org issues" ON issues
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE auth_user_id = auth.uid()
    )
  );
```

---

## 🔧 Comandos Útiles

### **Ver usuarios y sus organizaciones**
```sql
SELECT 
  u.email,
  o.name as organization,
  uo.role
FROM auth.users u
JOIN user_organizations uo ON u.id = uo.auth_user_id
JOIN organizations o ON uo.organization_id = o.id
WHERE uo.active = true;
```

### **Verificar RLS funciona**
```sql
-- Autenticarse como un usuario
SET request.jwt.claim.sub = 'UUID_DEL_USUARIO';

-- Intentar ver issues (solo verá de su org)
SELECT * FROM issues;
```

### **Añadir nueva organización**
```sql
INSERT INTO organizations (id, name, slug, settings)
VALUES (
  gen_random_uuid(),
  'Nueva Empresa',
  'nueva-empresa',
  '{"sla_matrix": {"P0": {"hours": 4}, "P1": {"hours": 24}}}'::jsonb
);
```

### **Vincular usuario existente a nueva org**
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role)
VALUES (
  'UUID_USUARIO',
  'UUID_ORGANIZACION',
  'CEO'
);
```

---

## 🎯 Próximos Pasos (Opcional)

Si necesitas más funcionalidades en el futuro:

1. **Backoffice para crear organizaciones** 
   - Página `/admin/organizations`
   - Solo accesible por rol SAP

2. **Sistema de invitaciones**
   - Invitar usuarios por email
   - Auto-crear cuenta al aceptar

3. **Gestión de usuarios por org**
   - CRUD de usuarios
   - Asignar/cambiar roles

4. **Auditoría**
   - Log de accesos
   - Cambios de organización

---

## ❓ Troubleshooting

### **Error: "No organization selected"**
- Verifica que el usuario tenga registros en `user_organizations`
- Revisa que `active = true`

### **Error: "Invalid login credentials"**
- Verifica que el usuario esté en `auth.users`
- Verifica que Email Auth esté habilitado en Supabase

### **RLS impide ver datos**
- Verifica que el usuario tenga la organización vinculada
- Revisa las policies con: `SELECT * FROM pg_policies WHERE tablename = 'issues';`

### **Middleware redirige siempre a login**
- Verifica variables de entorno
- Revisa cookies en DevTools
- Verifica que Supabase Auth esté correctamente configurado

---

## 📚 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

