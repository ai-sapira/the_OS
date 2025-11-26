# 🔐 Arquitectura: auth.users vs users - Explicación Completa

## 🤔 ¿Por qué hay DOS tablas de usuarios?

### **auth.users** (Supabase Auth)
- **¿Qué es?**: Tabla gestionada por Supabase para autenticación
- **¿Qué contiene?**: 
  - Email, password hash (encriptado)
  - Metadata básica (`user_metadata`)
  - Tokens de sesión
  - Estados de verificación de email
- **¿Quién la gestiona?**: Supabase Auth (no podemos editarla directamente)
- **¿Cómo accedemos?**: Solo mediante `admin.auth.admin.*` API
- **Propósito**: Autenticación pura (login, logout, password reset)

### **users** (Nuestra tabla de base de datos)
- **¿Qué es?**: Tabla nuestra para información extendida del usuario
- **¿Qué contiene?**:
  - `id` (mismo UUID que `auth.users.id`)
  - `auth_user_id` (referencia a `auth.users.id`)
  - `email`, `name`, `first_name`, `last_name`
  - `organization_id` (organización por defecto)
  - `role` (rol por defecto)
  - `active`, `avatar_url`, `phone`, etc.
- **¿Quién la gestiona?**: Nuestra aplicación
- **Propósito**: Información de perfil y negocio

### **user_organizations** (Tabla de relación)
- **¿Qué es?**: Relación many-to-many entre usuarios y organizaciones
- **¿Qué contiene?**:
  - `auth_user_id` (referencia a `auth.users.id`)
  - `organization_id` (referencia a `organizations.id`)
  - `role` (rol en esa organización específica)
  - `sapira_role_type` (para usuarios SAP: FDE, Advisory Lead, etc.)
- **Propósito**: Un usuario puede estar en múltiples organizaciones con diferentes roles

## 🔄 Flujo Completo de Login/Signup

### **FLUJO 1: Landing Page → Resolver Organización**

```
Usuario entra a: /
         ↓
Introduce email: pablo.senabre@sapira.ai
         ↓
POST /api/auth/resolve-org
         ↓
Busca dominio en control_org_domains_v
         ↓
Para @sapira.ai: No hay organización única
         ↓
Verifica si existe en users table
         ↓
¿Existe?
  ├─ SÍ → Redirige a /login?email=pablo.senabre@sapira.ai
  └─ NO → Redirige a /login?email=...&message=contacta soporte
```

**Código:** `app/page.tsx` → `app/api/auth/resolve-org/route.ts`

### **FLUJO 2: Login (Usuarios Existentes)**

#### **Para usuarios NO-Sapira:**
```
/login?org=gonvarri&email=test@gonvarri.com
         ↓
Usuario introduce password
         ↓
supabase.auth.signInWithPassword()
         ↓
✅ Autenticación exitosa en auth.users
         ↓
AuthProvider carga organizaciones desde /api/user/organizations
         ↓
Redirige a /issues
```

#### **Para usuarios Sapira (@sapira.ai):**
```
/login?email=pablo.senabre@sapira.ai
         ↓
Usuario introduce password
         ↓
supabase.auth.signInWithPassword()
         ↓
✅ Autenticación exitosa en auth.users
         ↓
Detecta dominio @sapira.ai
         ↓
Redirige a /select-org (selector de organizaciones)
         ↓
Usuario selecciona organización
         ↓
Redirige a /issues
```

**Código:** `app/(auth)/login/page.tsx`

### **FLUJO 3: Signup (Usuarios Nuevos)**

#### **Para usuarios NO-Sapira:**
```
/gonvarri?email=test@gonvarri.com
         ↓
Usuario completa formulario (password, nombre, etc.)
         ↓
POST /api/auth/auto-register
         ↓
1. Crea en auth.users (admin.auth.admin.createUser)
         ↓
2. Crea en users table (INSERT con mismo id)
         ↓
3. Crea en user_organizations (INSERT)
         ↓
✅ Auto-login y redirige a /issues
```

**Código:** `app/[org-slug]/signup/page.tsx` → `app/api/auth/auto-register/route.ts`

#### **Para usuarios Sapira:**
```
NO hay signup público para @sapira.ai
Solo se crean desde Admin App → Sapira Team
```

**Código:** `admin-app/app/sapira-team/page.tsx` → `admin-app/app/api/admin/sapira-team/route.ts`

### **FLUJO 4: Callback (OAuth/Invitations)**

```
/auth/callback?code=...&organization_id=...
         ↓
Exchange code for session (Supabase Auth)
         ↓
Obtiene authUserId de la sesión
         ↓
Verifica si existe en users table
         ↓
¿Existe?
  ├─ NO → Crea en users table
  └─ SÍ → Continúa
         ↓
Crea/actualiza en user_organizations
         ↓
Redirige a la app
```

**Código:** `app/auth/callback/route.ts`

## 🔗 Relación entre las Tablas

```
auth.users (Supabase Auth)
    │
    │ id (UUID)
    │
    ├─→ users.auth_user_id (FK)
    │      │
    │      └─→ users.id (mismo UUID)
    │
    └─→ user_organizations.auth_user_id (FK)
           │
           └─→ organizations.id (FK)
```

**Regla importante:**
- `users.id` = `users.auth_user_id` = `auth.users.id` (mismo UUID)
- `user_organizations.auth_user_id` = `auth.users.id` (referencia directa)

## ⚠️ Problemas Actuales y Soluciones

### **Problema 1: Creación Inconsistente**

**Situación:**
- Algunos endpoints crean en `auth.users` pero fallan al crear en `users`
- Resultado: Usuario puede hacer login pero no aparece en listados

**Solución implementada:**
- Trigger automático (`sync_user_from_auth`) que crea en `users` cuando se crea en `auth.users`
- Migración: `supabase/migrations/20250105_sync_auth_users.sql`

### **Problema 2: Verificación Duplicada**

**Situación:**
- Cada endpoint verifica existencia en ambas tablas manualmente
- Lógica duplicada y propensa a errores

**Solución implementada:**
- Función `sync_missing_users()` para sincronizar usuarios existentes
- Función `cleanup_orphaned_users()` para limpiar registros huérfanos

### **Problema 3: Usuarios Sapira sin organization_id**

**Situación:**
- La tabla `users` requiere `organization_id` (NOT NULL)
- Usuarios Sapira pueden estar en múltiples organizaciones
- No tiene sentido un `organization_id` único

**Solución implementada:**
- Usar organización placeholder (`22222222-2222-2222-2222-222222222222`)
- La relación real está en `user_organizations`
- Código actualizado para asignar `organization_id` automáticamente

## 📊 Flujo de Datos Completo

### **Creación de Usuario (NO-Sapira)**
```
1. Usuario completa signup form
2. POST /api/auth/auto-register
3. admin.auth.admin.createUser() → auth.users ✅
4. Trigger automático → users ✅ (si está activo)
5. INSERT users (si no existe) → users ✅
6. INSERT user_organizations → user_organizations ✅
```

### **Creación de Usuario Sapira**
```
1. Admin crea desde Sapira Team
2. POST /api/admin/sapira-team
3. admin.auth.admin.createUser() → auth.users ✅
4. Trigger automático → users ✅ (si está activo)
5. INSERT users (con organization_id placeholder) → users ✅
6. NO crea user_organizations (se hace después al añadir a org)
```

### **Login**
```
1. Usuario introduce email/password
2. supabase.auth.signInWithPassword() → Verifica auth.users ✅
3. AuthProvider carga organizaciones:
   - GET /api/user/organizations
   - Busca en user_organizations usando auth_user_id
   - Si no encuentra en users, intenta obtener de auth.users
4. Redirige según tipo de usuario
```

## 🎯 Mejoras Recomendadas

### **1. Aplicar Migración de Sincronización**
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: supabase/migrations/20250105_sync_auth_users.sql
```

### **2. Ejecutar Limpieza Inicial**
```sql
-- Limpiar usuarios huérfanos
SELECT * FROM cleanup_orphaned_users();

-- Sincronizar usuarios faltantes
SELECT * FROM sync_missing_users();
```

### **3. Verificar Estado Actual**
```sql
-- Ver usuarios desincronizados
-- Archivo: scripts/check-user-sync.sql
```

## 🔍 Caso Específico: pablo.senabre@sapira.ai

### **Lo que pasó:**
1. Usuario fue creado en `auth.users` (probablemente desde landing/login)
2. NO se creó en `users` (falló la sincronización)
3. Al intentar crear desde Admin App, detectó que existe en `auth.users`
4. Intentó sincronizar pero falló por falta de `organization_id`
5. Resultado: Usuario existía pero no aparecía en listados

### **Solución aplicada:**
1. ✅ Creado manualmente en `users` con `organization_id` placeholder
2. ✅ Código mejorado para manejar sincronización correctamente
3. ✅ Usuario ahora aparece en la lista

## 📝 Resumen Ejecutivo

**¿Por qué dos tablas?**
- `auth.users`: Autenticación (Supabase gestiona)
- `users`: Información de negocio (nosotros gestionamos)

**¿Cómo se relacionan?**
- `users.auth_user_id` → `auth.users.id` (mismo UUID)
- `users.id` = `users.auth_user_id` (mismo valor)

**¿Qué problemas hay?**
- Falta de sincronización automática
- Eliminación incompleta
- Estados inconsistentes posibles

**¿Qué hemos hecho?**
- ✅ Trigger automático de sincronización
- ✅ Funciones de limpieza y sincronización
- ✅ Código mejorado en endpoints
- ✅ Usuario pablo.senabre@sapira.ai sincronizado

**¿Qué falta?**
- ⏳ Aplicar migración SQL (trigger automático)
- ⏳ Ejecutar limpieza inicial
- ⏳ Documentar mejor el flujo para desarrolladores



