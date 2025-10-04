# 🔑 Obtener Service Role Key de Supabase

## ❌ Problema Actual

```
[API /user/organizations] Database error: {
  message: 'Invalid API key',
  hint: 'Double check your Supabase `anon` or `service_role` API key.'
}
```

El Service Role Key en `.env.local` es **inválido**.

---

## ✅ Solución: Obtener el Key Correcto

### Opción 1: Desde Supabase Dashboard (Más Fácil)

1. **Ve a:** https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx

2. **Click en:** Settings → API

3. **Busca:** "Project API keys"

4. **Copia el "service_role" key** (es largo, ~200 caracteres)

5. **Reemplaza en `.env.local`:**
   ```bash
   # Borra la línea actual de SUPABASE_SERVICE_ROLE_KEY
   # Agrega la nueva:
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (el token que copiaste)
   ```

6. **Reinicia el servidor:**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

---

### Opción 2: Usando CLI (Si tienes instalado)

```bash
# Login a Supabase
supabase login

# Get service role key
supabase projects api-keys --project-ref iaazpsvjiltlkhyeakmx
```

---

## 📝 Formato Correcto del .env.local

Tu archivo `.env.local` debería verse así:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Nzk1MTAsImV4cCI6MjA3NDQ1NTUxMH0.kVn7eIZEzNjImOe5yNgqPJOzN-IGUjN2AkzOALflZms

# Service Role Key (obtener desde dashboard)
SUPABASE_SERVICE_ROLE_KEY=<EL_TOKEN_REAL_QUE_COPIES>
```

---

## ⚠️ Importante

El **Service Role Key**:
- ✅ Tiene permisos de administrador
- ✅ Bypasea RLS (Row Level Security)
- ⚠️ **NUNCA** lo expongas al cliente
- ⚠️ **NUNCA** lo commits al repositorio
- ✅ Solo úsalo en API routes del servidor

---

## 🧪 Verificar que Funciona

Después de actualizar el key:

1. **Reinicia el servidor:** `npm run dev`

2. **Ve a:** http://localhost:3000/login

3. **Login con:** `pablo@sapira.ai`

4. **Deberías ver en la terminal:**
   ```
   [API /user/organizations] Request received
   [API /user/organizations] userId: xxx
   [API /user/organizations] Config: { hasUrl: true, hasKey: true, ... }
   [API /user/organizations] Querying database...
   [API /user/organizations] Success - found 1 organizations
   ```

5. **En el navegador:**
   - ✅ Login exitoso
   - ✅ Redirect a dashboard
   - ✅ RoleSwitcher visible

---

## 🚀 Luego: Configurar en Vercel

Una vez que funcione en local, usa el **mismo Service Role Key** en Vercel:

1. Ve a: https://vercel.com/pablosenabres-projects/the-os/settings/environment-variables

2. Add New:
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: <EL_MISMO_TOKEN_QUE_FUNCIONO_EN_LOCAL>
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

3. Save y redeploy

---

## 🔍 Si No Tienes Acceso al Dashboard

Compárteme el resultado de este comando y te ayudo:

```bash
supabase projects list
```

O dime el email con el que creaste el proyecto de Supabase.

