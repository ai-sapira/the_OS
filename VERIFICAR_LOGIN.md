# ✅ Verificación del Login - Checklist

## 🔧 Cambios Realizados

### 1. **AuthGuard Activado** ✅
- Archivo: `app/client-layout.tsx`
- El sistema ahora valida correctamente las organizaciones del usuario

### 2. **Cliente Supabase Corregido** ✅
- Archivo: `lib/supabase/client.ts`
- Usa variables de entorno con fallback para desarrollo

### 3. **Middleware Limpio** ✅
- Archivo: `middleware.ts`
- Autenticación activa sin comentarios confusos

---

## 🚀 Pasos para Probar el Login

### **1. Detener el Servidor Actual**
Si tienes el servidor corriendo, detenlo con `Ctrl+C`

### **2. Limpiar la Caché de Next.js**
```bash
cd /Users/pablosenabre/Sapira/the_OS
rm -rf .next
```

### **3. Iniciar el Servidor**
```bash
npm run dev
```

Deberías ver algo como:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### **4. Limpiar Datos del Navegador**

**Opción A - Modo Incógnito (Recomendado):**
- Chrome/Edge: `Ctrl+Shift+N` (Windows) o `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)

**Opción B - Limpiar Storage:**
1. Abre DevTools (`F12`)
2. Ve a la pestaña **Application**
3. En el panel izquierdo, busca **Storage**
4. Click derecho → **Clear site data**

### **5. Probar el Login**

#### **Escenario 1: Usuario con 1 Organización (Aurovitas)**
```
URL: http://localhost:3000
Credenciales:
  Email:    gerardo@aurovitas.com
  Password: aurovitas123

Flujo esperado:
  1. Redirige automáticamente a /login
  2. Ingresas credenciales
  3. Click en "Iniciar sesión"
  4. ✅ Redirige directamente a /
  5. ✅ Ves el header con "Aurovitas"
  6. ✅ Dashboard vacío (sin datos)
```

#### **Escenario 2: Usuario con Múltiples Organizaciones**
Si un usuario tiene acceso a múltiples organizaciones:
```
Flujo esperado:
  1. Login exitoso
  2. ✅ Redirige a /select-org
  3. ✅ Muestra lista de organizaciones
  4. Seleccionas una organización
  5. ✅ Redirige a /
```

---

## 🐛 Errores Comunes y Soluciones

### **Error: "Failed to load resource: net::ERR_FILE_NOT_FOUND"**
**Causa:** Extensiones del navegador (uBlock, LastPass, etc.)
**Solución:** ✅ IGNORAR - No afecta la funcionalidad
**Archivos mencionados:** `utils.js`, `extensionState.js`, `heuristicsRedefinitions.js`

### **Error: "Missing Supabase environment variables"**
**Causa:** Variables de entorno no cargadas
**Solución:**
```bash
# Verificar que .env.local existe
cat .env.local

# Debe mostrar:
# NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Si no existe, créalo:
echo 'NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Nzk1MTAsImV4cCI6MjA3NDQ1NTUxMH0.kVn7eIZEzNjImOe5yNgqPJOzN-IGUjN2AkzOALflZms' > .env.local
```

### **Error: Loop infinito de redirecciones**
**Causa:** Cookies o localStorage corruptos
**Solución:**
1. Abre DevTools (`F12`)
2. Application → Storage → Clear site data
3. Cierra el navegador completamente
4. Abre de nuevo y prueba en modo incógnito

### **Error: "Invalid login credentials"**
**Causa:** Credenciales incorrectas o usuario no existe
**Solución:**
```sql
-- Verificar en Supabase Dashboard que el usuario existe
SELECT 
  au.email,
  au.email_confirmed_at,
  o.name,
  uo.role
FROM auth.users au
JOIN user_organizations uo ON uo.auth_user_id = au.id
JOIN organizations o ON o.id = uo.organization_id
WHERE au.email = 'gerardo@aurovitas.com';
```

---

## 🔍 Debugging Avanzado

### **Verificar Sesión en Consola del Navegador**
```javascript
// Ver localStorage
console.log('Current Org:', localStorage.getItem('sapira.currentOrg'))

// Ver cookies de Supabase
console.log('Cookies:', document.cookie)

// Forzar logout
localStorage.clear()
location.reload()
```

### **Verificar en el Servidor (Terminal)**
Busca estos logs en la terminal donde corre `npm run dev`:
```
✓ Compiled /login in XXXms
✓ Compiled / in XXXms
```

Si ves errores relacionados con Supabase, compártelos.

### **Verificar Base de Datos**
```sql
-- Verificar organizaciones
SELECT id, name, slug, active FROM organizations;

-- Verificar usuario de Aurovitas
SELECT 
  auth.users.email,
  organizations.name as org_name,
  user_organizations.role
FROM user_organizations
JOIN auth.users ON auth.users.id = user_organizations.auth_user_id
JOIN organizations ON organizations.id = user_organizations.organization_id
WHERE auth.users.email = 'gerardo@aurovitas.com';
```

---

## 📊 Estado Esperado Después del Login

### **En el Frontend:**
- ✅ Header muestra "Aurovitas"
- ✅ Sidebar visible con navegación
- ✅ Dashboard principal (vacío inicialmente)
- ✅ Puedes navegar a: Issues, Projects, Initiatives, Roadmap, etc.

### **En localStorage:**
```javascript
localStorage.getItem('sapira.currentOrg')
// Debe retornar: "22222222-2222-2222-2222-222222222222"
```

### **En Cookies:**
Deberías ver cookies con nombres como:
- `sb-iaazpsvjiltlkhyeakmx-auth-token`
- `sb-iaazpsvjiltlkhyeakmx-auth-token.0`
- etc.

---

## ✅ Checklist Final

- [ ] Servidor corriendo en puerto 3000
- [ ] Variables de entorno en `.env.local`
- [ ] Navegador en modo incógnito o storage limpio
- [ ] Login exitoso con `gerardo@aurovitas.com`
- [ ] Redirige a página principal
- [ ] Header muestra "Aurovitas"
- [ ] No hay errores en consola (excepto los de extensiones)

---

## 🆘 Si Nada Funciona

1. **Captura de pantalla** de la consola del navegador (todos los errores en rojo)
2. **Captura de pantalla** de la terminal donde corre `npm run dev`
3. **URL actual** en la barra de direcciones
4. **Verifica** que estés usando el puerto correcto (3000 o 3002)

Comparte esta información para diagnosticar el problema específico.

