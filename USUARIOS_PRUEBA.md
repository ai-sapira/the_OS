# 👥 Usuarios para Pruebas

## 🚀 Opción 1: Verificar Usuarios Existentes

Ejecuta esto en **Supabase SQL Editor** para ver qué usuarios tienes configurados:

```sql
-- Ver todos los usuarios de autenticación
SELECT 
  u.id as auth_user_id,
  u.email,
  u.created_at
FROM auth.users u
ORDER BY u.created_at DESC;

-- Ver usuarios vinculados a organizaciones
SELECT 
  u.email,
  o.name as organization_name,
  o.slug as organization_slug,
  uo.role,
  uo.active
FROM auth.users u
JOIN user_organizations uo ON u.id = uo.auth_user_id
JOIN organizations o ON uo.organization_id = o.id
ORDER BY o.name, u.email;
```

## 🎯 Opción 2: Crear Usuarios desde el Admin App (RECOMENDADO)

### Paso 1: Crear Usuario desde el Admin

1. Ve a: **Admin App** → **Organizaciones** → Selecciona una organización → **Usuarios**
2. Click en **"Crear usuario"** (botón principal)
3. Completa el formulario:
   - **Email**: `test@gonvarri.com`
   - **Contraseña**: `test123` (mínimo 6 caracteres)
   - **Confirmar contraseña**: `test123`
   - **Rol**: Selecciona (CEO, BU, EMP, o SAP)
   - **Nombre/Apellidos**: (opcional)
4. Click en **"Crear usuario"**
5. **Guarda las credenciales** que se muestran (la contraseña no se mostrará de nuevo)

**Ventajas**:
- ✅ No necesitas ir a Supabase
- ✅ El usuario queda automáticamente vinculado a la organización
- ✅ Puede iniciar sesión inmediatamente
- ✅ Se crea el registro en `users` y `user_organizations` automáticamente

### Paso 2: Alternativa - Invitar por Email

Si prefieres enviar un email de invitación:
1. Click en **"Invitar por email"** (botón secundario)
2. Introduce el email y rol
3. El usuario recibirá un email para configurar su contraseña

### Paso 3: Verificar Organizaciones Disponibles

```sql
-- Ver organizaciones y sus dominios
SELECT 
  o.id,
  o.name,
  o.slug,
  o.allow_self_registration,
  array_agg(DISTINCT od.domain) as domains
FROM organizations o
LEFT JOIN control_plane.organization_domains od ON o.id = od.organization_id
GROUP BY o.id, o.name, o.slug, o.allow_self_registration
ORDER BY o.name;
```

### Paso 4: (Solo si creaste manualmente en Supabase) Vincular Usuario a Organización

**Nota**: Si usaste el Admin App para crear el usuario, este paso NO es necesario. Solo si creaste el usuario manualmente en Supabase:

```sql
-- 1. Obtener el UUID del usuario que acabas de crear
SELECT id, email FROM auth.users WHERE email = 'test@gonvarri.com';

-- 2. Obtener el ID de la organización (ej: Gonvarri)
SELECT id, name, slug FROM organizations WHERE slug = 'gonvarri';

-- 3. Vincular usuario a organización (REEMPLAZA los UUIDs)
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES 
  (
    'UUID_DEL_USUARIO_AQUI',  -- Reemplaza con el UUID del paso 1
    'UUID_DE_LA_ORG_AQUI',    -- Reemplaza con el ID de la org del paso 2
    'CEO',                    -- Rol: CEO, BU, EMP, o SAP
    true
  )
ON CONFLICT (auth_user_id, organization_id) DO UPDATE
SET role = EXCLUDED.role, active = true;
```

## 🧪 Opción 3: Probar Auto-Registro

Si tienes una organización con `allow_self_registration = true` y dominios configurados:

1. Ve a `http://localhost:3001/` (o tu dominio)
2. Introduce un email con dominio válido (ej: `nuevo@gonvarri.com`)
3. El sistema debería:
   - Detectar la organización por dominio
   - Redirigirte a `/[slug]` (ej: `/gonvarri`)
   - Permitirte registrarte si `allow_self_registration = true`

## 📋 Organizaciones Comunes para Pruebas

Basándome en los archivos del proyecto, estas son las organizaciones que suelen estar configuradas:

| Organización | Slug | Dominios Típicos |
|--------------|------|------------------|
| **Gonvarri** | `gonvarri` | `@gonvarri.com` |
| **AEQ** | `AEQ` o `aeq` | `@aeq.com` |
| **Cosermo** | `cosermo` | `@cosermo.com` |
| **Aurovitas** | `aurovitas` | `@aurovitas.com` |

## 🔍 Verificar Estado Actual

Ejecuta este script completo para ver todo lo configurado:

```sql
-- Script completo de verificación
WITH org_domains AS (
  SELECT 
    od.organization_id,
    array_agg(od.domain) as domains
  FROM control_plane.organization_domains od
  GROUP BY od.organization_id
)
SELECT 
  o.id,
  o.name,
  o.slug,
  o.allow_self_registration,
  COALESCE(od.domains, ARRAY[]::text[]) as allowed_domains,
  COUNT(DISTINCT uo.auth_user_id) as user_count
FROM organizations o
LEFT JOIN org_domains od ON o.id = od.organization_id
LEFT JOIN user_organizations uo ON o.id = uo.organization_id AND uo.active = true
GROUP BY o.id, o.name, o.slug, o.allow_self_registration, od.domains
ORDER BY o.name;
```

## ✅ Checklist Rápido

- [ ] ¿Tienes organizaciones creadas?
  - Ve a: Admin App → Organizaciones
  - Si no hay, créalas desde el Admin App

- [ ] ¿Tienes usuarios creados?
  - Ve a: Admin App → Organizaciones → [Tu Org] → Usuarios
  - Si no hay usuarios, créalos usando **"Crear usuario"** (Opción 2)

- [ ] ¿Los usuarios están vinculados a organizaciones?
  - Si los creaste desde el Admin App, ya están vinculados automáticamente
  - Si los creaste manualmente, verifica con el script de verificación

- [ ] ¿Los dominios están configurados?
  - Ve a: Admin App → Organizaciones → [Tu Org] → Dominios
  - Añade los dominios permitidos (ej: `gonvarri.com`)

## 🎮 Probar el Sistema

Una vez tengas usuarios configurados:

1. **Inicia el servidor**: `pnpm dev`
2. **Ve a**: `http://localhost:3001/`
3. **Prueba login**:
   - Email: `test@gonvarri.com`
   - Password: `test123`
4. **Verifica**:
   - ✅ Te redirige a `/issues`
   - ✅ Ves el logo/nombre de la organización en el sidebar
   - ✅ Solo ves datos de tu organización
   - ✅ El botón "Cerrar sesión" funciona

## 🆘 Si No Funciona

1. **Verifica variables de entorno**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Revisa logs del servidor**:
   - Busca errores en la consola
   - Revisa los logs de Supabase

3. **Verifica la sesión**:
   - Abre DevTools → Application → Cookies
   - Deberías ver cookies de Supabase (`sb-*`)

4. **Prueba logout y login de nuevo**:
   - Usa el botón "Cerrar sesión" del sidebar
   - Intenta login de nuevo

