# 🧪 Cómo Probar el Auto-Registro

## 📋 Prerequisitos

1. ✅ Tener una organización creada en Supabase
2. ✅ Tener un dominio permitido configurado para esa organización
3. ✅ Habilitar `allow_self_registration = true` en la organización

---

## 🔧 Paso 1: Preparar la Organización

### Opción A: Desde Admin App (cuando esté desplegado)

1. Accede a `admin.sapira.ai`
2. Ve a "Organizaciones" → Selecciona tu organización
3. Activa "Self-registration"
4. Ve a "Gestionar dominios" → Añade el dominio (ej: `empresa.com`)

### Opción B: Desde Supabase SQL Editor (ahora mismo)

```sql
-- 1. Ver organizaciones existentes
SELECT id, name, slug, allow_self_registration 
FROM organizations;

-- 2. Habilitar auto-registro para una organización
UPDATE organizations 
SET allow_self_registration = true 
WHERE slug = 'gonvarri';  -- Cambia por tu slug

-- 3. Añadir dominio permitido
INSERT INTO control_plane.organization_domains (organization_id, domain)
SELECT id, 'gonvarri.com'  -- Cambia por el dominio que quieras
FROM organizations 
WHERE slug = 'gonvarri';

-- 4. Verificar
SELECT 
  o.name,
  o.allow_self_registration,
  d.domain
FROM organizations o
LEFT JOIN control_plane.organization_domains d ON d.organization_id = o.id
WHERE o.slug = 'gonvarri';
```

---

## 🌐 Paso 2: Acceder a la Página de Registro

### En desarrollo local:
```
http://localhost:3000/[org-slug]/signup
```

**Ejemplo:**
```
http://localhost:3000/gonvarri/signup
```

### En producción (cuando cambies el dominio):
```
https://app.sapira.ai/[org-slug]/signup
```

**Ejemplo:**
```
https://app.sapira.ai/gonvarri/signup
```

---

## 📝 Paso 3: Completar el Formulario

1. **Nombre:** Juan
2. **Apellidos:** Pérez
3. **Email:** `juan@gonvarri.com` (debe ser del dominio permitido)
4. **Contraseña:** `password123` (mínimo 6 caracteres)

---

## ✅ Paso 4: Verificar Resultado

### Lo que debería pasar:

1. ✅ La página verifica que la organización permite registro
2. ✅ Al enviar, valida que el dominio del email está permitido
3. ✅ Crea usuario en Supabase Auth
4. ✅ Crea entrada en tabla `users` con nombre y apellidos
5. ✅ Crea entrada en `user_organizations` con:
   - `role: 'EMP'`
   - `status: 'registered'`
   - `active: true`
6. ✅ Intenta auto-login
7. ✅ Redirige al dashboard o a login

### Verificar en Supabase:

```sql
-- Ver usuario creado
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.organization_id,
  o.name as org_name
FROM users u
JOIN organizations o ON o.id = u.organization_id
WHERE u.email = 'juan@gonvarri.com';

-- Ver user_organizations
SELECT 
  uo.id,
  uo.role,
  uo.status,
  uo.active,
  u.email,
  o.name as org_name
FROM user_organizations uo
JOIN users u ON u.auth_user_id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE u.email = 'juan@gonvarri.com';
```

---

## 🐛 Errores Comunes y Soluciones

### ❌ "El dominio no está permitido"

**Causa:** El dominio del email no está en `control_plane.organization_domains`

**Solución:**
```sql
-- Ver dominios permitidos
SELECT * FROM control_plane.organization_domains 
WHERE organization_id = (
  SELECT id FROM organizations WHERE slug = 'gonvarri'
);

-- Añadir dominio
INSERT INTO control_plane.organization_domains (organization_id, domain)
SELECT id, 'gonvarri.com'
FROM organizations 
WHERE slug = 'gonvarri';
```

---

### ❌ "El registro automático no está habilitado"

**Causa:** `allow_self_registration = false` en la organización

**Solución:**
```sql
UPDATE organizations 
SET allow_self_registration = true 
WHERE slug = 'gonvarri';
```

---

### ❌ "Este email ya está registrado"

**Causa:** El usuario ya existe en Supabase Auth

**Solución:**
- Usa otro email para probar
- O elimina el usuario desde Supabase Dashboard:
  - Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users
  - Busca el usuario y elimínalo

---

### ❌ "Organización no encontrada"

**Causa:** El slug en la URL no existe

**Solución:**
- Verifica el slug correcto:
  ```sql
  SELECT slug, name FROM organizations;
  ```
- Usa el slug correcto en la URL

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Registro exitoso
- **Email:** `nuevo@gonvarri.com`
- **Dominio:** `gonvarri.com` está permitido
- **Resultado esperado:** Usuario creado, auto-login, redirige a dashboard

### ❌ Caso 2: Dominio no permitido
- **Email:** `nuevo@otraempresa.com`
- **Dominio:** `otraempresa.com` NO está permitido
- **Resultado esperado:** Error "El dominio no está permitido"

### ❌ Caso 3: Auto-registro deshabilitado
- **Email:** `nuevo@gonvarri.com`
- **Organización:** `allow_self_registration = false`
- **Resultado esperado:** Error "El registro automático no está habilitado"

### ❌ Caso 4: Email ya existe
- **Email:** `existente@gonvarri.com` (ya registrado)
- **Resultado esperado:** Error "Este email ya está registrado"

---

## 📊 Verificar en la UI

Después del registro exitoso:

1. **Login:** Deberías poder hacer login con el email y contraseña
2. **Dashboard:** Deberías ver el dashboard de la organización
3. **Admin App:** El usuario debería aparecer en la lista de usuarios de la organización

---

## 🔍 Debugging

### Ver logs en consola del navegador:
- Abre DevTools (F12)
- Ve a la pestaña "Console"
- Busca errores o mensajes de debug

### Ver logs en Vercel:
- Ve a: https://vercel.com/dashboard
- Selecciona tu proyecto
- Ve a "Deployments" → Último deployment → "Functions"
- Revisa los logs de `/api/auth/auto-register`

### Ver logs en Supabase:
- Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/logs
- Filtra por "API" o "Auth"

---

## ✅ Checklist de Prueba

- [ ] Organización creada con `allow_self_registration = true`
- [ ] Dominio permitido añadido en `control_plane.organization_domains`
- [ ] Página de signup accesible en `/[org-slug]/signup`
- [ ] Formulario muestra nombre de la organización
- [ ] Validación de dominio funciona correctamente
- [ ] Usuario se crea en Supabase Auth
- [ ] Entrada en `users` con datos correctos
- [ ] Entrada en `user_organizations` con rol `EMP`
- [ ] Auto-login funciona (o redirige a login)
- [ ] Usuario puede hacer login después del registro


