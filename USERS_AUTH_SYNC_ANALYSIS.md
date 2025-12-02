# Análisis: Sincronización entre auth.users y users

## 📋 Arquitectura Actual

### 1. **auth.users** (Supabase Auth)
- **Propósito**: Tabla gestionada por Supabase Auth para autenticación
- **Contenido**: Email, password hash, metadata básica
- **Gestión**: Controlada por Supabase, no directamente editable
- **Acceso**: Solo mediante `admin.auth.admin.*` API

### 2. **users** (Nuestra tabla)
- **Propósito**: Información extendida del usuario (perfil, organización por defecto, etc.)
- **Contenido**: `id`, `auth_user_id`, `email`, `name`, `first_name`, `last_name`, `organization_id`, `role`, `active`, etc.
- **Relación**: `auth_user_id` referencia `auth.users(id)`
- **Gestión**: Controlada por nuestra aplicación

### 3. **user_organizations** (Tabla de relación)
- **Propósito**: Relación many-to-many entre usuarios y organizaciones con roles
- **Contenido**: `auth_user_id`, `organization_id`, `role`, `sapira_role_type`, `active`
- **Relación**: `auth_user_id` referencia `auth.users(id)` con `ON DELETE CASCADE`

## 🔍 Problemas Identificados

### Problema 1: Falta de sincronización automática
**Situación actual:**
- Cuando se crea un usuario en `auth.users`, NO se crea automáticamente en `users`
- Cada endpoint debe crear manualmente en ambas tablas
- Si falla la creación en `users`, queda un usuario huérfano en `auth.users`

**Ejemplo del problema:**
```typescript
// En admin-app/app/api/admin/sapira-team/route.ts
const { data: authData } = await admin.auth.admin.createUser({...})
// Si esto falla después, el usuario queda en auth.users pero no en users
const { error: userError } = await admin.from("users").insert({...})
```

### Problema 2: Eliminación incompleta
**Situación actual:**
- No hay un proceso claro para eliminar usuarios completamente
- Si se elimina de `auth.users`, las referencias en `user_organizations` se eliminan por CASCADE
- PERO el registro en `users` NO se elimina automáticamente (no hay CASCADE configurado)

**Migración actual:**
```sql
-- En 20250102_auth_multi_tenant.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ⚠️ Esto NO elimina users cuando se elimina auth.users
-- Solo elimina user_organizations por el CASCADE en esa tabla
```

### Problema 3: Estados inconsistentes posibles
**Casos problemáticos:**
1. Usuario existe en `auth.users` pero NO en `users` → No aparece en listados
2. Usuario existe en `users` pero NO en `auth.users` → No puede hacer login
3. Usuario eliminado de `auth.users` pero sigue en `users` → Registro huérfano

### Problema 4: Caso específico de pablo.senabre@sapira.ai
**Escenario probable:**
- Usuario fue eliminado de `auth.users` (manualmente o por error)
- Registro sigue existiendo en `users` con `auth_user_id` apuntando a un UUID que ya no existe
- Al intentar crear nuevamente, detecta que existe en `users` pero no puede sincronizar porque el `auth_user_id` es inválido

## 🔧 Soluciones Propuestas

### Solución 1: Trigger para sincronización automática
Crear un trigger que sincronice automáticamente cuando se crea un usuario en `auth.users`:

```sql
-- Trigger para crear usuario en users cuando se crea en auth.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    name,
    active
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.email
    ),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_from_auth();
```

### Solución 2: Función para limpiar usuarios huérfanos
Crear una función que limpie usuarios en `users` cuando no existe en `auth.users`:

```sql
-- Función para limpiar usuarios huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_users()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  deleted INTEGER;
BEGIN
  DELETE FROM public.users
  WHERE auth_user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = users.auth_user_id
    );
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Solución 3: Mejorar el proceso de eliminación
Crear un endpoint que elimine completamente un usuario:

```typescript
// DELETE /api/admin/users/[userId]
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const admin = createAdminServerClient()
  
  // 1. Obtener auth_user_id
  const { data: user } = await admin
    .from("users")
    .select("auth_user_id")
    .eq("id", params.userId)
    .single()
  
  if (!user?.auth_user_id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  
  // 2. Eliminar de user_organizations (se hace automáticamente por CASCADE si eliminamos auth.users)
  // 3. Eliminar de users
  await admin.from("users").delete().eq("id", params.userId)
  
  // 4. Eliminar de auth.users (esto eliminará user_organizations por CASCADE)
  await admin.auth.admin.deleteUser(user.auth_user_id)
  
  return NextResponse.json({ success: true })
}
```

### Solución 4: Mejorar la sincronización en creación
Mejorar el código de sincronización para manejar mejor los errores:

```typescript
// En admin-app/app/api/admin/sapira-team/route.ts
if (existingAuthUser && !existingUser) {
  // Verificar si el auth_user_id es válido
  try {
    const { data: verifyAuth } = await admin.auth.admin.getUserById(existingAuthUser.id)
    if (!verifyAuth.user) {
      // El usuario fue eliminado de auth.users, limpiar registro huérfano
      await admin.from("users").delete().eq("auth_user_id", existingAuthUser.id).catch(() => null)
      // Continuar con creación normal
    } else {
      // Intentar sincronizar
      // ... código de sincronización existente
    }
  } catch {
    // Usuario no existe en auth, limpiar y continuar
    await admin.from("users").delete().eq("auth_user_id", existingAuthUser.id).catch(() => null)
  }
}
```

## 📊 Flujo Recomendado

### Creación de Usuario
```
1. Crear en auth.users
2. Trigger automático crea en users (Solución 1)
3. Crear en user_organizations
```

### Eliminación de Usuario
```
1. Eliminar de user_organizations (opcional, se hace por CASCADE)
2. Eliminar de users
3. Eliminar de auth.users (esto elimina user_organizations por CASCADE)
```

### Sincronización Manual
```
1. Verificar existencia en auth.users
2. Si existe en auth pero no en users → Crear en users
3. Si existe en users pero no en auth → Limpiar registro huérfano
```

## 🎯 Acciones Inmediatas

1. **Crear migración SQL** con trigger de sincronización automática
2. **Crear función de limpieza** para usuarios huérfanos
3. **Mejorar código de sincronización** en endpoints existentes
4. **Crear endpoint de eliminación completa** de usuarios
5. **Ejecutar limpieza** para pablo.senabre@sapira.ai y otros casos similares

## 🔍 Verificación del Estado Actual

Para verificar el estado de sincronización:

```sql
-- Usuarios en auth.users pero no en users
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE u.id IS NULL;

-- Usuarios en users pero no en auth.users (huérfanos)
SELECT u.id, u.email, u.auth_user_id
FROM users u
WHERE u.auth_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = u.auth_user_id
  );

-- Usuarios con auth_user_id inconsistente
SELECT u.id, u.email, u.auth_user_id, au.id as auth_id
FROM users u
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE u.auth_user_id IS NOT NULL
  AND (u.id != u.auth_user_id OR au.id IS NULL);
```






