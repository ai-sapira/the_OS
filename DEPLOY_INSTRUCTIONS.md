# 🚀 Instrucciones de Deploy a Vercel

## 📋 Checklist Pre-Deploy

### 1. Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y añade:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**⚠️ IMPORTANTE**: 
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` deben tener el prefijo `NEXT_PUBLIC_` porque se usan en el cliente
- `SUPABASE_SERVICE_ROLE_KEY` NO debe tener el prefijo porque solo se usa en el servidor

### 2. Configurar Dominio

1. En Vercel → Settings → Domains
2. Añade tu dominio personalizado (ej: `project.sapira.ai`)
3. Configura los DNS según las instrucciones de Vercel

### 3. Build Settings

Vercel detecta automáticamente Next.js, pero verifica:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (o `npm run build` si usas npm)
- **Output Directory**: `.next` (por defecto)
- **Install Command**: `pnpm install` (o `npm install`)

### 4. Verificar Middleware

El middleware está configurado para:
- ✅ Excluir rutas de API (`/api/*`)
- ✅ Excluir assets estáticos
- ✅ Solo verificar sesión en rutas privadas
- ✅ Redirigir usuarios no autenticados a `/`

## 🔧 Comandos de Deploy

### Deploy Manual

```bash
# 1. Asegúrate de estar en la rama correcta
git checkout main

# 2. Haz commit de tus cambios
git add .
git commit -m "feat: improve logout and prepare for deploy"

# 3. Push a GitHub/GitLab
git push origin main

# 4. Vercel detectará el push y desplegará automáticamente
```

### Deploy con Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## 🧪 Probar el Deploy

### 1. Probar Logout

1. Inicia sesión con cualquier usuario
2. Haz clic en tu avatar → "Cerrar sesión"
3. Deberías ser redirigido a `/` (landing page)
4. Intenta acceder a `/issues` → debería redirigirte a `/`

### 2. Probar Auto-registro

1. Ve a `https://tu-dominio.com/`
2. Introduce un email con dominio válido (ej: `usuario@aeq.com`)
3. Debería redirigirte a `/[slug]` (ej: `/AEQ`)
4. Si el usuario no existe, debería permitir registro
5. Si el usuario existe, debería redirigir a `/login?org=AEQ&email=usuario@aeq.com`

### 3. Verificar Rate Limits

- El middleware ahora solo verifica sesión en rutas privadas
- Las rutas públicas no hacen llamadas a Supabase
- Esto debería eliminar los problemas de rate limit

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que tienen el prefijo `NEXT_PUBLIC_` si se usan en el cliente
- Reinicia el deployment después de añadir variables

### Error: Rate Limit en Supabase

- El middleware está optimizado para reducir llamadas
- Si persiste, verifica que no hay loops infinitos en `AuthProvider`
- Revisa los logs de Vercel para ver qué rutas están causando problemas

### Logout no funciona

- Verifica que `/api/auth/logout` está accesible
- Revisa la consola del navegador para errores
- Asegúrate de que las cookies se están limpiando correctamente

## 📝 Notas Importantes

1. **No commits de `.env.local`**: Asegúrate de que `.env.local` está en `.gitignore`
2. **Variables sensibles**: Nunca commitees `SUPABASE_SERVICE_ROLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Demo Mode**: Si quieres usar demo mode en producción, añade `NEXT_PUBLIC_DEMO_MODE=true` en Vercel (no recomendado)

## ✅ Post-Deploy

Después del deploy, verifica:
- [ ] Login funciona
- [ ] Logout funciona y limpia sesión
- [ ] Auto-registro funciona
- [ ] Middleware redirige correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay rate limits en los logs de Vercel

