# 🔍 Análisis Completo de Flujos de Acceso

## 📊 Estado Actual del Sistema

### **1. Sistema de Invitaciones (Actual)**

**Cómo funciona actualmente:**
- ✅ Usa `admin.auth.admin.inviteUserByEmail()` de Supabase
- ✅ Envía un **magic link** por email automáticamente
- ✅ El usuario hace click en el link → va a `/auth/callback?code=...`
- ✅ El callback crea la cuenta y vincula a la organización

**Flujo actual:**
```
Admin invita usuario
  ↓
POST /api/org/users/invite
  ↓
admin.auth.admin.inviteUserByEmail(email, { redirectTo, data })
  ↓
Supabase envía email con magic link
  ↓
Usuario hace click → /auth/callback?code=...&organization_id=...
  ↓
exchangeCodeForSession(code)
  ↓
Crea usuario en users + user_organizations
```

**✅ Ventajas:**
- Ya está implementado y funcionando
- Magic link es seguro (sin contraseña inicial)
- Supabase maneja el envío de emails automáticamente

**⚠️ Limitaciones actuales:**
- El usuario NO puede establecer su contraseña en el primer acceso
- Depende completamente del magic link
- No hay opción de password tradicional para invitados

---

### **2. Sistema de Registro (Actual)**

**Cómo funciona actualmente:**
- ❌ Usa **password tradicional** (`signInWithPassword`)
- ❌ Usuario debe crear contraseña en el signup
- ❌ Auto-login después del registro

**Flujo actual:**
```
Usuario va a /gonvarri/signup
  ↓
Completa formulario (email, password, nombre, rol)
  ↓
POST /api/auth/auto-register
  ↓
admin.auth.admin.createUser({ email, password })
  ↓
Crea en users + user_organizations
  ↓
Auto-login con signInWithPassword()
  ↓
Redirige a /issues
```

**❌ Problemas:**
- Requiere contraseña desde el inicio
- No usa magic link/OTP
- Menos seguro que magic link
- Inconsistente con el sistema de invitaciones

---

### **3. Sistema de Login (Actual)**

**OS Principal:**
- ✅ Usa `signInWithPassword()` (password tradicional)
- ✅ Funciona para usuarios existentes

**Admin App:**
- ✅ Usa `signInWithOtp()` (magic link)
- ✅ Más seguro para acceso administrativo

**❌ Inconsistencia:**
- OS Principal usa password
- Admin App usa magic link
- Registro usa password
- Invitaciones usan magic link

---

## 🎯 Propuesta: Sistema Unificado y Organizado

### **Principios de Diseño**

1. **Magic Link como método principal** (más seguro, sin contraseñas)
2. **Password como opción alternativa** (para usuarios que lo prefieran)
3. **Consistencia** entre todos los flujos
4. **Flexibilidad** para diferentes casos de uso

---

## 📋 Flujos Propuestos

### **FLUJO 1: Invitación de Usuario (MANTENER - Ya funciona bien)**

**Estado:** ✅ Ya implementado correctamente

**Cómo funciona:**
- Admin invita usuario → `inviteUserByEmail()` → Magic link por email
- Usuario hace click → Establece contraseña en primer acceso → Accede

**Mejora propuesta:**
- ✅ Mantener magic link
- ✅ Añadir página de "Establecer contraseña" después del primer acceso
- ✅ Permitir que el usuario establezca su contraseña después del magic link

---

### **FLUJO 2: Registro Público (CAMBIAR a Magic Link)**

**Estado actual:** ❌ Usa password tradicional

**Propuesta:**
```
Usuario va a /gonvarri/signup
  ↓
Completa formulario (email, nombre, apellidos, rol)
  ↓
POST /api/auth/register-with-magic-link
  ↓
Verifica dominio permitido
  ↓
admin.auth.admin.createUser({ email }) SIN password
  ↓
admin.auth.admin.generateLink({ type: 'signup', email })
  ↓
Envía magic link por email
  ↓
Usuario hace click → /auth/callback?code=...&type=signup
  ↓
Página de "Establecer contraseña"
  ↓
Usuario establece contraseña
  ↓
Crea en users + user_organizations
  ↓
Auto-login → Redirige a /issues
```

**Ventajas:**
- ✅ Consistente con invitaciones
- ✅ Más seguro (sin contraseña inicial)
- ✅ Usuario establece contraseña después de verificar email

---

### **FLUJO 3: Login (AÑADIR opción Magic Link)**

**Estado actual:** ✅ Password funciona, pero falta opción magic link

**Propuesta:**
```
Página de login con 2 opciones:
  1. Magic Link (por defecto)
  2. Password (alternativa)

Opción 1 - Magic Link:
  ↓
Usuario introduce email
  ↓
signInWithOtp({ email })
  ↓
Recibe magic link por email
  ↓
Hace click → /auth/callback → Login automático

Opción 2 - Password:
  ↓
Usuario introduce email + password
  ↓
signInWithPassword({ email, password })
  ↓
Login directo
```

**Ventajas:**
- ✅ Flexibilidad para el usuario
- ✅ Magic link más seguro
- ✅ Password más rápido para usuarios frecuentes

---

### **FLUJO 4: Recuperación de Contraseña**

**Estado actual:** ❓ No está claro si está implementado

**Propuesta:**
```
Usuario en login → "¿Olvidaste tu contraseña?"
  ↓
Introduce email
  ↓
resetPasswordForEmail({ email })
  ↓
Recibe magic link para reset
  ↓
Hace click → Página de "Nueva contraseña"
  ↓
Establece nueva contraseña
```

---

## 🔧 Implementación Propuesta

### **Fase 1: Mejorar Invitaciones (Ya funciona, solo mejorar UX)**

1. ✅ Mantener `inviteUserByEmail()` (ya funciona)
2. ✅ Añadir página de "Establecer contraseña" después del primer magic link
3. ✅ Mejorar mensajes de email

### **Fase 2: Cambiar Registro a Magic Link**

1. ❌ Eliminar password del formulario de signup
2. ✅ Cambiar `auto-register` para usar magic link
3. ✅ Crear página de "Establecer contraseña" después del signup
4. ✅ Actualizar flujo de callback

### **Fase 3: Añadir Magic Link al Login**

1. ✅ Añadir opción "Enviar magic link" en login
2. ✅ Mantener opción de password
3. ✅ Mejorar UX con tabs o toggle

### **Fase 4: Implementar Recuperación de Contraseña**

1. ✅ Añadir botón "¿Olvidaste tu contraseña?"
2. ✅ Implementar `resetPasswordForEmail()`
3. ✅ Crear página de reset de contraseña

---

## 📝 Archivos a Modificar/Crear

### **Modificar:**
1. `app/[org-slug]/signup/page.tsx` - Cambiar a magic link
2. `app/api/auth/auto-register/route.ts` - Cambiar a magic link
3. `app/(auth)/login/page.tsx` - Añadir opción magic link
4. `app/auth/callback/route.ts` - Manejar establecimiento de contraseña

### **Crear:**
1. `app/(auth)/set-password/page.tsx` - Página para establecer contraseña
2. `app/(auth)/reset-password/page.tsx` - Página para reset de contraseña
3. `app/api/auth/register-with-magic-link/route.ts` - Nuevo endpoint

---

## 🎨 Estructura Propuesta de Páginas

```
/auth/
  ├── login/              → Login con Magic Link + Password
  ├── set-password/       → Establecer contraseña (después de magic link)
  ├── reset-password/     → Reset de contraseña
  └── callback/           → Maneja todos los callbacks (invite, signup, login)

/[org-slug]/
  └── signup/             → Registro con Magic Link (sin password)
```

---

## ✅ Checklist de Implementación

### **Paso 1: Invitaciones (Mejorar)**
- [ ] Crear página `/auth/set-password` para establecer contraseña después de invite
- [ ] Modificar callback para redirigir a set-password si es primer acceso
- [ ] Mejorar mensajes de email de invitación

### **Paso 2: Registro (Cambiar)**
- [ ] Modificar `signup/page.tsx` para eliminar campo password
- [ ] Crear endpoint `/api/auth/register-with-magic-link`
- [ ] Modificar callback para manejar signup con magic link
- [ ] Redirigir a `/auth/set-password` después del signup

### **Paso 3: Login (Añadir)**
- [ ] Añadir opción "Enviar magic link" en login
- [ ] Mantener opción de password
- [ ] Mejorar UX con tabs o toggle

### **Paso 4: Recuperación**
- [ ] Añadir botón "¿Olvidaste tu contraseña?" en login
- [ ] Crear página `/auth/reset-password`
- [ ] Implementar `resetPasswordForEmail()`

---

## 🔐 Seguridad y Mejores Prácticas

### **Magic Link (Recomendado)**
- ✅ Más seguro (sin contraseñas en tránsito)
- ✅ Verificación de email automática
- ✅ Menos fricción para usuarios
- ✅ Menos problemas de contraseñas olvidadas

### **Password (Alternativa)**
- ✅ Más rápido para usuarios frecuentes
- ✅ Útil cuando no hay acceso a email
- ⚠️ Menos seguro que magic link
- ⚠️ Requiere gestión de contraseñas

### **Recomendación:**
- **Invitaciones:** Magic Link (ya implementado) ✅
- **Registro:** Magic Link (cambiar) 🔄
- **Login:** Magic Link por defecto, Password opcional ✅
- **Recuperación:** Magic Link (implementar) 📝

---

## 📚 Referencias de Supabase

### **Métodos Disponibles:**

1. **`inviteUserByEmail()`** - Para invitaciones (ya usado)
   - Envía magic link automáticamente
   - Usuario establece contraseña después

2. **`signInWithOtp()`** - Para login con magic link
   - Envía magic link
   - Login automático después del click

3. **`signInWithPassword()`** - Para login con password
   - Login directo con email + password

4. **`resetPasswordForEmail()`** - Para recuperación
   - Envía magic link para reset
   - Usuario establece nueva contraseña

5. **`updateUser()`** - Para establecer contraseña
   - Después de magic link, usuario puede establecer password

---

## 🎯 Conclusión

**Estado actual:**
- ✅ Invitaciones: Magic Link (funciona bien)
- ❌ Registro: Password tradicional (inconsistente)
- ⚠️ Login: Solo password (falta magic link)
- ❌ Recuperación: No implementado

**Propuesta:**
1. **Mantener** invitaciones con magic link (ya funciona)
2. **Cambiar** registro a magic link (consistencia)
3. **Añadir** opción magic link al login (flexibilidad)
4. **Implementar** recuperación de contraseña (completitud)

**Beneficios:**
- ✅ Sistema más seguro
- ✅ Consistencia entre flujos
- ✅ Mejor UX (menos fricción)
- ✅ Menos problemas de contraseñas olvidadas



