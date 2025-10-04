# ✅ Simplificación de Autenticación

## 🎯 Problema Original

El cliente de Supabase se quedaba colgado al hacer queries directas desde `auth-context.tsx`:
- Query de `user_organizations` → timeout
- Query de `organizations` → timeout
- Difícil de debugear
- Logs no claros

## 💡 Solución Simple

**En lugar de queries directas desde el cliente, usamos una API route:**

### Antes (Complejo):
```typescript
// auth-context.tsx
const { data } = await supabase
  .from('user_organizations')
  .select('role, initiative_id, organization_id')
  .eq('auth_user_id', userId)
  // + más queries...
```

### Ahora (Simple):
```typescript
// auth-context.tsx
const response = await fetch(`/api/user/organizations?userId=${userId}`)
const { data } = await response.json()
```

## 📁 Archivos Creados

### `/app/api/user/organizations/route.ts`
- API route que usa **Service Role Key** (bypass RLS)
- Query simple y directa
- Logs claros en el servidor
- Fácil de debugear

## 🔧 Configuración Requerida

### 1. Local (✅ Ya configurado)

```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3OTUxMCwiZXhwIjoyMDc0NDU1NTEwfQ.dVoL2iWo1BVOSt7BRMjpwOzGGnxg0eG7lJhh8qfUBQM
```

### 2. Vercel (⚠️ PENDIENTE)

Ve a tu proyecto en Vercel → Settings → Environment Variables → Add:

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3OTUxMCwiZXhwIjoyMDc0NDU1NTEwfQ.dVoL2iWo1BVOSt7BRMjpwOzGGnxg0eG7lJhh8qfUBQM
Environment: Production, Preview, Development
```

**⚠️ Importante:** Después de agregar la variable:
1. Ve a Deployments
2. Click en el último deployment
3. Click "Redeploy"

## ✅ Ventajas

1. **Más simple**: 1 fetch vs 2 queries complicadas
2. **Más debugeable**: Logs claros en el servidor
3. **Más seguro**: Service Role Key nunca expuesto al cliente
4. **Más rápido**: Query optimizada en el servidor
5. **Mejor para escalar**: API route puede cachear, rate limit, etc.

## 🧪 Probar

### Local:
```bash
npm run dev
# Login con pablo@sapira.ai
```

### Producción:
```
https://app.sapira.com
# Login con pablo@sapira.ai
```

## 📊 Ver Logs de la API

En desarrollo local, verás en la terminal:
```
[API /user/organizations] Getting orgs for user: xxx
[API /user/organizations] Success: [...]
```

En Vercel:
- Ve a tu proyecto → Logs
- Filtra por `/api/user/organizations`

