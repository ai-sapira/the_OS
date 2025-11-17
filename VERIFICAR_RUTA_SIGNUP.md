# 🔍 Verificar Ruta de Signup - Solución al 404

## Problema
Al acceder a `http://localhost:3001/gonvarri/signup` aparece un 404.

## ✅ Solución Aplicada

### 1. Corregido `AuthGuard` en `client-layout.tsx`
El `AuthGuard` ahora permite acceso a rutas de signup sin autenticación.

### 2. Verificado Estado de Gonvarri
✅ Organización existe: `gonvarri` (ID: `69a370e8-0b26-4aff-a5a2-39a56f6caeb2`)
✅ Auto-registro habilitado: `allow_self_registration = true`
✅ Dominio permitido: `gonvarri.com`

## 🧪 Pasos para Verificar

### Paso 1: Limpiar y Reiniciar Servidor

```bash
cd /Users/pablosenabre/Sapira/the_OS

# Detener servidor si está corriendo
pkill -f "next dev"

# Limpiar cache de Next.js
rm -rf .next

# Reiniciar servidor
pnpm dev
```

### Paso 2: Verificar que el Servidor Está Corriendo

Deberías ver:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

**Nota:** Si necesitas puerto 3001, usa:
```bash
PORT=3001 pnpm dev
```

### Paso 3: Probar la Ruta

1. **En navegador:** `http://localhost:3000/gonvarri/signup`
2. **O con curl:**
   ```bash
   curl -I http://localhost:3000/gonvarri/signup
   ```
   Debería retornar `200 OK`

### Paso 4: Verificar Logs

En la consola del servidor deberías ver:
```
[Middleware] Request path: /gonvarri/signup
[Middleware] Has session: false
[AuthGuard] On auth page, skipping checks
```

## 🔧 Si Sigue Dando 404

### Verificar Estructura de Archivos

```bash
# Verificar que el archivo existe
ls -la app/\[org-slug\]/signup/page.tsx

# Debería mostrar el archivo
```

### Verificar que Next.js Detecta la Ruta

```bash
# Ver rutas generadas
cat .next/routes-manifest.json | grep signup
```

### Verificar Middleware

El middleware debería permitir acceso. Verifica en `middleware.ts` línea 81-87:
```typescript
const orgSlugMatch = pathname.match(/^\/([^\/]+)\/signup/)
const isSignupPage = orgSlugMatch !== null
const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                   req.nextUrl.pathname.startsWith('/select-org') ||
                   isSignupPage
```

## 📋 Checklist de Verificación

- [ ] Servidor corriendo en puerto correcto (3000 o 3001)
- [ ] Archivo `app/[org-slug]/signup/page.tsx` existe
- [ ] Middleware permite acceso a rutas `/signup`
- [ ] `AuthGuard` permite acceso a rutas `/signup`
- [ ] Organización `gonvarri` existe en Supabase
- [ ] `allow_self_registration = true` para Gonvarri
- [ ] Dominio `gonvarri.com` está permitido
- [ ] Variables de entorno configuradas en `.env.local`

## 🚀 Próximos Pasos

1. **Probar registro completo:**
   - Ir a `http://localhost:3000/gonvarri/signup`
   - Completar formulario con email `test@gonvarri.com`
   - Verificar que se crea usuario
   - Verificar auto-login funciona

2. **Preparar para deploy:**
   - Verificar todas las variables de entorno en Vercel
   - Probar en staging antes de producción
   - Configurar dominio `app.sapira.ai` o `project.sapira.ai`


