# ✅ Checklist de Configuración Completa

## 🔍 Problema Actual: 404 en `/gonvarri/signup`

### Verificaciones Necesarias

#### 1. ✅ Estructura de Archivos
- [x] `app/[org-slug]/signup/page.tsx` existe
- [x] Middleware permite acceso a rutas `/signup`
- [ ] Verificar que Next.js está corriendo en puerto correcto

#### 2. 🔧 Configuración del Servidor

**Verificar puerto:**
```bash
# Ver qué proceso está usando el puerto 3001
lsof -i :3001

# O verificar en package.json qué puerto usa
cat package.json | grep -A 5 "scripts"
```

**Iniciar servidor correctamente:**
```bash
cd /Users/pablosenabre/Sapira/the_OS
pnpm dev
# O si usa otro puerto:
PORT=3001 pnpm dev
```

#### 3. 🗄️ Base de Datos - Verificar Organización

```sql
-- Verificar que Gonvarri existe
SELECT id, name, slug, allow_self_registration 
FROM organizations 
WHERE slug = 'gonvarri';

-- Verificar dominios permitidos
SELECT 
  od.id,
  od.domain,
  o.name as org_name
FROM control_plane.organization_domains od
JOIN organizations o ON o.id = od.organization_id
WHERE o.slug = 'gonvarri';
```

#### 4. 🔐 Variables de Entorno

Verificar que existen en `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

#### 5. 🌐 Rutas y Middleware

**Problema potencial:** El middleware puede estar bloqueando la ruta

Verificar en `middleware.ts`:
- ✅ Línea 81-82: Detecta rutas `/signup`
- ✅ Línea 87: Las marca como `isAuthPage`
- ✅ Línea 90: Permite acceso sin sesión

---

## 🚀 Solución Paso a Paso

### Paso 1: Verificar que el servidor está corriendo

```bash
# En terminal 1
cd /Users/pablosenabre/Sapira/the_OS
pnpm dev

# Debería mostrar:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
```

### Paso 2: Verificar la ruta directamente

```bash
# Probar acceso directo
curl http://localhost:3000/gonvarri/signup

# O en navegador:
# http://localhost:3000/gonvarri/signup
```

### Paso 3: Verificar logs del servidor

Cuando accedas a `/gonvarri/signup`, deberías ver en la consola:
```
[Middleware] Request path: /gonvarri/signup
[Middleware] Has session: false
```

### Paso 4: Verificar que la organización existe

```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
  id,
  name,
  slug,
  allow_self_registration,
  created_at
FROM organizations
WHERE slug = 'gonvarri';
```

Si no existe, crearla:
```sql
INSERT INTO organizations (id, name, slug, allow_self_registration)
VALUES (
  gen_random_uuid(),
  'Gonvarri',
  'gonvarri',
  true
)
RETURNING id, name, slug;
```

---

## 🔧 Problemas Comunes y Soluciones

### ❌ Error 404 en `/gonvarri/signup`

**Causas posibles:**
1. Servidor no está corriendo
2. Puerto incorrecto (3001 vs 3000)
3. Next.js no detecta la ruta dinámica
4. Middleware está bloqueando

**Solución:**
```bash
# 1. Detener todos los procesos de Node
pkill -f "next dev"

# 2. Limpiar cache de Next.js
rm -rf .next

# 3. Reinstalar dependencias (si es necesario)
pnpm install

# 4. Iniciar servidor limpio
pnpm dev
```

### ❌ "Organización no encontrada"

**Causa:** La organización no existe o el slug es incorrecto

**Solución:**
```sql
-- Ver todas las organizaciones
SELECT id, name, slug FROM organizations;

-- Crear Gonvarri si no existe
INSERT INTO organizations (name, slug, allow_self_registration)
VALUES ('Gonvarri', 'gonvarri', true)
ON CONFLICT (slug) DO UPDATE SET allow_self_registration = true;
```

### ❌ "El dominio no está permitido"

**Causa:** El dominio no está en `control_plane.organization_domains`

**Solución:**
```sql
-- Añadir dominio para Gonvarri
INSERT INTO control_plane.organization_domains (organization_id, domain)
SELECT id, 'gonvarri.com'
FROM organizations
WHERE slug = 'gonvarri'
ON CONFLICT DO NOTHING;
```

---

## 📋 Checklist Completo Pre-Deploy

### Base de Datos
- [ ] Todas las migraciones aplicadas
- [ ] Organizaciones creadas con slugs correctos
- [ ] Dominios permitidos configurados
- [ ] `allow_self_registration = true` para orgs que lo necesiten
- [ ] Funciones RPC creadas (`add_organization_domain`, `delete_organization_domain`)

### Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (solo para API routes)
- [ ] Variables configuradas en Vercel (producción)

### Rutas y Middleware
- [ ] Middleware permite acceso a `/signup` sin auth
- [ ] Rutas dinámicas `[org-slug]` funcionan
- [ ] API routes `/api/auth/auto-register` funciona
- [ ] API routes `/api/auth/check-org-signup` funciona

### Frontend
- [ ] Página de signup renderiza correctamente
- [ ] Formulario valida correctamente
- [ ] Errores se muestran al usuario
- [ ] Auto-login funciona después del registro

### Admin App
- [ ] Admin app puede crear organizaciones
- [ ] Admin app puede añadir dominios (usando RPC)
- [ ] Admin app puede invitar usuarios
- [ ] Admin app puede editar usuarios

---

## 🧪 Pruebas Locales

### Test 1: Verificar ruta de signup
```bash
# Terminal 1: Iniciar servidor
cd /Users/pablosenabre/Sapira/the_OS
pnpm dev

# Terminal 2: Probar ruta
curl -I http://localhost:3000/gonvarri/signup
# Debería retornar 200 OK
```

### Test 2: Verificar API de check-org
```bash
curl "http://localhost:3000/api/auth/check-org-signup?slug=gonvarri"
# Debería retornar JSON con allowsSignup: true
```

### Test 3: Verificar registro completo
1. Ir a `http://localhost:3000/gonvarri/signup`
2. Completar formulario con email `test@gonvarri.com`
3. Verificar que se crea usuario en Supabase
4. Verificar auto-login funciona

---

## 🚨 Debugging

### Ver logs del servidor
```bash
# Iniciar con logs detallados
DEBUG=* pnpm dev
```

### Ver logs del middleware
Los logs del middleware aparecen en la consola del servidor:
```
[Middleware] Request path: /gonvarri/signup
[Middleware] Has session: false
```

### Ver errores de Next.js
Revisar `.next/` para errores de build:
```bash
cat .next/trace
```

---

## 📝 Notas Importantes

1. **Puerto:** Si usas puerto 3001, asegúrate de que Next.js esté configurado para ese puerto
2. **Cache:** Next.js cachea rutas, puede necesitar limpiar `.next/`
3. **Middleware:** El middleware se ejecuta antes de renderizar, verifica que no esté bloqueando
4. **Variables de entorno:** Deben estar en `.env.local` para desarrollo local

---

## ✅ Estado Actual

- [x] Estructura de archivos correcta
- [x] Middleware configurado para permitir signup
- [x] API routes creadas
- [x] Funciones RPC creadas en Supabase
- [ ] Servidor corriendo y accesible
- [ ] Organización Gonvarri existe y está configurada
- [ ] Dominio `gonvarri.com` añadido
- [ ] Auto-registro habilitado para Gonvarri


