# ✅ Problema de Triage RESUELTO

## 🎯 El Problema Original

```
Error: Key (triaged_by_user_id)=(b8023796-e4c8-4752-9f5c-5b140c990f06) is not present in table "users"
```

Al intentar aceptar un issue desde triage, fallaba con error de **Foreign Key Constraint**.

## 🔍 Causa Raíz

El usuario **Guillermo** (`guillermo@sapira.ai`):
- ✅ **SÍ existía** en `auth.users` (tabla de autenticación de Supabase)
- ❌ **NO existía** en `users` (tabla personalizada de la aplicación)

Esto es un problema de **sincronización** entre las dos tablas.

## 🔧 Solución Aplicada

### Fix #1: Usuario Creado en la Tabla `users`

```sql
INSERT INTO users (id, organization_id, name, email, role, active)
VALUES (
  'b8023796-e4c8-4752-9f5c-5b140c990f06',
  '01234567-8901-2345-6789-012345678901',
  'Guillermo',
  'guillermo@sapira.ai',
  'SAP',
  true
);
```

### Fix #2: Usuario Agregado a `user_organizations`

```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'b8023796-e4c8-4752-9f5c-5b140c990f06',
  '01234567-8901-2345-6789-012345678901',
  'SAP',
  true
);
```

### Fix #3: Logs Detallados Agregados

Agregados logs completos en:
- ✅ `lib/api/issues.ts` - `triageIssue()`
- ✅ `app/triage-new/page.tsx` - handlers de accept/decline/snooze
- ✅ `app/api/teams/create-issue/route.ts` - endpoint de creación desde Teams

## ✅ Estado Actual

**El sistema ahora debería funcionar correctamente:**

1. ✅ Aceptar issues desde triage → Sin error de FK
2. ✅ Rechazar issues desde triage → Funcionará correctamente
3. ✅ Ver logs detallados en consola → Para debug futuro

## 🧪 Cómo Probar

### 1. Refrescar la Página

Haz un **hard refresh** en el navegador:
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### 2. Ir a Triage

Ve a `/triage-new`

### 3. Intentar Aceptar un Issue

1. Selecciona un issue de la lista
2. Click en "Actions" → "Accept"
3. Selecciona una Business Unit
4. Click en "Accept Issue"

**Deberías ver en consola:**
```
[Triage] Accepting issue: GON-XXX with data: {...}
[IssuesAPI] triageIssue called: {...}
[IssuesAPI] Accepting issue with data: {...}
[IssuesAPI] Issue updated successfully: {...}
[Triage] Issue accepted successfully
```

**Y NO debería haber error de Foreign Key.**

## 🚨 Si Aparecen Más Usuarios con el Mismo Problema

Si otro usuario (por ejemplo `pablo@sapira.ai`) tiene el mismo problema:

```sql
-- 1. Ver qué usuarios existen en auth pero no en users
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id OR u.id = au.id
WHERE u.id IS NULL;

-- 2. Insertar el usuario faltante
INSERT INTO users (id, organization_id, name, email, role, active)
VALUES (
  'USER_ID_FROM_AUTH',
  '01234567-8901-2345-6789-012345678901',
  'Nombre del Usuario',
  'email@sapira.ai',
  'SAP',  -- O el rol que corresponda
  true
);

-- 3. Insertar en user_organizations
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'USER_ID_FROM_AUTH',
  '01234567-8901-2345-6789-012345678901',
  'SAP',
  true
);
```

## 📋 Solución a Largo Plazo (Recomendado)

Crear un **trigger o función** que automáticamente cree el usuario en `users` cuando se crea en `auth.users`:

```sql
-- Función que se ejecuta cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insertar en la tabla users cuando se crea en auth.users
  INSERT INTO public.users (id, auth_user_id, email, name, organization_id, role, active)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '01234567-8901-2345-6789-012345678901', -- Default a Gonvarri
    'EMP', -- Default role
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Esto asegura que **nunca más ocurra este problema** con nuevos usuarios.

## 📊 Resumen de Fixes Aplicados

| Fix | Archivo | Estado |
|-----|---------|--------|
| Query completo en getTriageIssues | `lib/api/issues.ts` | ✅ Aplicado |
| Excluir cancelados de vistas | `lib/api/issues.ts` | ✅ Aplicado |
| Logs detallados en triageIssue | `lib/api/issues.ts` | ✅ Aplicado |
| Logs en handlers de triage | `app/triage-new/page.tsx` | ✅ Aplicado |
| Feedback visual de errores | `app/triage-new/page.tsx` | ✅ Aplicado |
| Logs en API Teams | `app/api/teams/create-issue/route.ts` | ✅ Aplicado |
| Usuario Guillermo creado | Supabase DB | ✅ Aplicado |
| Script SQL de debug | `scripts/debug-triage-issues.sql` | ✅ Creado |

## 🎉 Conclusión

El problema estaba en la **falta de sincronización** entre:
- `auth.users` (usuarios autenticados)
- `users` (usuarios de la aplicación)

**Ahora está resuelto** y el sistema debería funcionar correctamente.

---

**Próximo paso**: Prueba aceptar un issue y confirma que funciona! 🚀

