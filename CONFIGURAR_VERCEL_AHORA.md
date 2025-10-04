# 🚨 CONFIGURAR VERCEL AHORA

## ❌ El problema actual

El build de Vercel está fallando con este error:
```
Error: supabaseUrl is required.
```

**Causa:** Falta la variable de entorno `SUPABASE_SERVICE_ROLE_KEY` en Vercel.

---

## ✅ Solución (5 minutos)

### Paso 1: Ve a Vercel
👉 https://vercel.com/pablosenabres-projects/the-os/settings/environment-variables

### Paso 2: Agrega la variable

Click en **"Add New"** y completa:

```
Name: SUPABASE_SERVICE_ROLE_KEY

Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3OTUxMCwiZXhwIjoyMDc0NDU1NTEwfQ.dVoL2iWo1BVOSt7BRMjpwOzGGnxg0eG7lJhh8qfUBQM

Environments:
  ✅ Production
  ✅ Preview  
  ✅ Development
```

### Paso 3: Guarda

Click en **"Save"**

### Paso 4: Trigger Redeploy

El git push que acabo de hacer (`de3308e`) va a triggerar un nuevo deploy automáticamente.

Si no, ve a:
👉 https://vercel.com/pablosenabres-projects/the-os/deployments

Y click en **"Redeploy"** en el último deployment.

---

## 🎯 Resultado esperado

Después de configurar la variable:
- ✅ Build exitoso en Vercel
- ✅ Deploy a producción
- ✅ Login funcionando en app.sapira.com
- ✅ Modo demo SAP funcionando

---

## 📊 Verificar

Una vez que el deploy termine:

1. Ve a https://app.sapira.com/login
2. Inicia sesión con `pablo@sapira.ai`
3. Deberías ver el dashboard de Gonvarri
4. Deberías ver el **RoleSwitcher** (CEO / BU / EMP)

---

## ⚠️ Nota de seguridad

El `SUPABASE_SERVICE_ROLE_KEY`:
- ✅ Solo se usa en API routes del servidor
- ✅ Nunca se expone al cliente
- ✅ Permite bypass de RLS para operaciones admin
- ⚠️ Mantener secreto (nunca commitear al repo)

