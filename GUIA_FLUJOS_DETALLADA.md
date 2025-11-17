# 📖 Guía Detallada de Flujos - Cómo Acceder a Cada Uno

## 🎯 FLUJO 1: Landing → Auto-Detección → Login

### ¿Qué es?
Un usuario nuevo llega a la landing principal, introduce su email, y el sistema detecta automáticamente su organización basándose en el dominio del email.

### Cómo acceder
1. **Abre tu navegador** y ve a: `http://localhost:3001/`
   - Esta es la **landing principal** (raíz del sitio)

### Qué verás
- Un formulario simple con un campo de email
- Un botón "Continuar" o similar
- Diseño limpio y minimalista

### Pasos detallados
1. **En el campo de email**, introduce: `test@gonvarri.com`
   - ⚠️ **Importante**: El dominio (`@gonvarri.com`) debe estar configurado en la base de datos
   
2. **Click en "Continuar"** o presiona Enter

3. **El sistema hace**:
   - POST a `/api/auth/resolve-org` con el email
   - Busca en `control_org_domains_v` qué organización tiene ese dominio
   - Verifica si ya existe un usuario con ese email

4. **Resultado esperado**:
   - Si el usuario **NO existe**: Redirige a `/gonvarri?email=test@gonvarri.com`
   - Si el usuario **SÍ existe**: Redirige a `/login?org=gonvarri&email=test@gonvarri.com`

### Ejemplo visual
```
Usuario → http://localhost:3001/
         ↓
    Introduce: test@gonvarri.com
         ↓
    Click "Continuar"
         ↓
    Sistema detecta: dominio = gonvarri.com → org = Gonvarri
         ↓
    ¿Usuario existe?
         ├─ NO → /gonvarri?email=test@gonvarri.com (FLUJO 2)
         └─ SÍ → /login?org=gonvarri&email=test@gonvarri.com (FLUJO 3)
```

### Verificar que funciona
- ✅ Redirige correctamente según si el usuario existe o no
- ✅ El email aparece en la URL como parámetro
- ✅ La organización se detecta correctamente

---

## 📝 FLUJO 2: Auto-Registro desde Landing de Org

### ¿Qué es?
Un usuario nuevo llega directamente a la landing de su organización (ej: Gonvarri) y se registra creando una cuenta nueva.

### Cómo acceder
**Opción A - Desde FLUJO 1:**
1. Completa FLUJO 1 con un email que NO existe
2. Serás redirigido automáticamente a `/gonvarri?email=test@gonvarri.com`

**Opción B - Acceso directo:**
1. Ve directamente a: `http://localhost:3001/gonvarri`
   - Reemplaza `gonvarri` con el slug de tu organización

**Opción C - Con email pre-fill:**
1. Ve a: `http://localhost:3001/gonvarri?email=nuevo@gonvarri.com`

### Qué verás
- Landing de la organización con:
  - Logo de la organización (si está configurado)
  - Nombre de la organización
  - Dos botones: **"Iniciar sesión"** y **"Registrarse"**

### Pasos detallados
1. **En la landing de la org**, click en **"Registrarse"**

2. **Serás redirigido a**: `/gonvarri/signup?email=nuevo@gonvarri.com`
   - El email estará pre-llenado si venías desde FLUJO 1

3. **Completa el formulario**:
   - **Nombre**: `Juan`
   - **Apellidos**: `Pérez`
   - **Email**: `juan@gonvarri.com` (debe ser del dominio permitido)
   - **Contraseña**: `test123` (mínimo 6 caracteres)

4. **Click en "Crear cuenta"**

5. **El sistema hace**:
   - Valida que el dominio está permitido
   - Verifica que `allow_self_registration = true`
   - Crea usuario en Supabase Auth
   - Crea registro en tabla `users`
   - Vincula en `user_organizations`
   - Intenta auto-login

6. **Resultado esperado**:
   - ✅ Usuario creado exitosamente
   - ✅ Auto-login exitoso
   - ✅ Redirige a `/issues`
   - ✅ Ves solo datos de tu organización

### Ejemplo visual
```
Usuario → http://localhost:3001/gonvarri
         ↓
    Ve landing de Gonvarri
         ↓
    Click "Registrarse"
         ↓
    /gonvarri/signup
         ↓
    Completa formulario
         ↓
    Click "Crear cuenta"
         ↓
    POST /api/auth/auto-register
         ↓
    Usuario creado → Auto-login → /issues
```

### Requisitos previos
- ✅ Organización existe con slug `gonvarri`
- ✅ Dominio `gonvarri.com` está en `control_org_domains_v`
- ✅ `allow_self_registration = true` en la organización

---

## 🔑 FLUJO 3: Login desde Landing de Org

### ¿Qué es?
Un usuario existente llega a la landing de su organización y hace login con sus credenciales.

### Cómo acceder
**Opción A - Desde FLUJO 1:**
1. Completa FLUJO 1 con un email que SÍ existe
2. Serás redirigido automáticamente a `/login?org=gonvarri&email=test@gonvarri.com`

**Opción B - Desde FLUJO 2:**
1. En la landing de la org (`/gonvarri`), click en **"Iniciar sesión"**
2. Serás redirigido a `/login?org=gonvarri&email=...`

**Opción C - Acceso directo:**
1. Ve a: `http://localhost:3001/login?org=gonvarri&email=test@gonvarri.com`

**Opción D - Desde landing de org:**
1. Ve a: `http://localhost:3001/gonvarri`
2. Click en botón **"Iniciar sesión"**

### Qué verás
- Página de login con:
  - Campo de email (pre-llenado si venías con parámetro)
  - Campo de contraseña
  - Botón "Iniciar sesión"
  - Opción para ir a registro (si aplica)

### Pasos detallados
1. **Verifica que el email está pre-llenado** (si venías desde FLUJO 1 o landing)

2. **Introduce tu contraseña**: `test123` (o la que configuraste)

3. **Click en "Iniciar sesión"**

4. **El sistema hace**:
   - Autentica con Supabase Auth
   - Carga organizaciones del usuario
   - Selecciona la organización basándose en:
     1. `sapira.pendingOrgSlug` (si existe)
     2. `users.organization_id` (default del usuario)
     3. Primera organización si solo tiene una
   - Persiste la selección en backend

5. **Resultado esperado**:
   - ✅ Login exitoso
   - ✅ Redirige a `/issues`
   - ✅ Ves solo datos de tu organización
   - ✅ Cookie `sapira-org-slug` establecida

### Ejemplo visual
```
Usuario → http://localhost:3001/gonvarri
         ↓
    Click "Iniciar sesión"
         ↓
    /login?org=gonvarri&email=test@gonvarri.com
         ↓
    Email pre-llenado
         ↓
    Introduce contraseña
         ↓
    Click "Iniciar sesión"
         ↓
    Supabase Auth → Login exitoso
         ↓
    Carga organizaciones → Selecciona Gonvarri
         ↓
    POST /api/auth/select-org
         ↓
    Redirige a /issues
```

### Requisitos previos
- ✅ Usuario existe en Supabase Auth
- ✅ Usuario está vinculado a la organización en `user_organizations`
- ✅ Credenciales correctas

---

## 🏠 FLUJO 4: Landing con Email Existente

### ¿Qué es?
Un usuario existente introduce su email en la landing principal, y el sistema detecta que ya tiene cuenta y lo redirige directamente al login.

### Cómo acceder
1. **Abre tu navegador** y ve a: `http://localhost:3001/`
   - Misma landing que FLUJO 1

### Qué verás
- Mismo formulario simple con campo de email

### Pasos detallados
1. **En el campo de email**, introduce: `juan@gonvarri.com`
   - ⚠️ Este usuario **DEBE existir** en Supabase Auth

2. **Click en "Continuar"** o presiona Enter

3. **El sistema hace**:
   - POST a `/api/auth/resolve-org` con el email
   - Busca la organización por dominio
   - **Verifica si el usuario existe** en la tabla `users`
   - Si existe, devuelve `existing_user: true`

4. **Resultado esperado**:
   - ✅ Detecta que el usuario existe
   - ✅ Redirige directamente a `/login?org=gonvarri&email=juan@gonvarri.com`
   - ✅ **NO** va a la landing de la org
   - ✅ Email pre-llenado en login

### Ejemplo visual
```
Usuario → http://localhost:3001/
         ↓
    Introduce: juan@gonvarri.com (usuario existente)
         ↓
    Click "Continuar"
         ↓
    POST /api/auth/resolve-org
         ↓
    Sistema detecta:
      - Dominio: gonvarri.com → org = Gonvarri
      - Usuario existe: SÍ
         ↓
    Redirige directamente a:
    /login?org=gonvarri&email=juan@gonvarri.com
         ↓
    (NO pasa por /gonvarri)
```

### Diferencia con FLUJO 1
- **FLUJO 1**: Usuario nuevo → va a landing de org → puede registrarse
- **FLUJO 4**: Usuario existente → va directo a login → no pasa por landing

---

## 🔄 Comparación de Flujos

### Tabla Comparativa

| Flujo | URL Inicial | Email | Usuario Existe | Destino Final |
|-------|-------------|-------|----------------|---------------|
| **FLUJO 1** | `/` | `nuevo@gonvarri.com` | ❌ NO | `/gonvarri?email=...` |
| **FLUJO 2** | `/gonvarri` | `nuevo@gonvarri.com` | ❌ NO | `/issues` (después de registro) |
| **FLUJO 3** | `/gonvarri` o `/login` | `existente@gonvarri.com` | ✅ SÍ | `/issues` (después de login) |
| **FLUJO 4** | `/` | `existente@gonvarri.com` | ✅ SÍ | `/login?org=gonvarri&email=...` |

---

## 🧪 Testing Rápido - Orden Recomendado

### 1. Preparar datos de prueba
```sql
-- Verificar que Gonvarri existe y tiene dominio
SELECT o.id, o.name, o.slug, o.allow_self_registration 
FROM organizations o
WHERE o.slug = 'gonvarri';

-- Verificar dominio
SELECT * FROM control_org_domains_v 
WHERE domain = 'gonvarri.com';
```

### 2. Probar FLUJO 4 (más simple)
- Ve a: `http://localhost:3001/`
- Introduce: `test@gonvarri.com` (usuario que ya existe)
- Debería redirigir a login

### 3. Probar FLUJO 1 → FLUJO 2
- Ve a: `http://localhost:3001/`
- Introduce: `nuevo@gonvarri.com` (usuario que NO existe)
- Debería redirigir a `/gonvarri`
- Click en "Registrarse"
- Completa formulario
- Debería crear usuario y hacer login

### 4. Probar FLUJO 3
- Ve a: `http://localhost:3001/gonvarri`
- Click en "Iniciar sesión"
- Login con credenciales existentes
- Debería funcionar

---

## 🐛 Troubleshooting por Flujo

### FLUJO 1 no redirige
- Verificar que `/api/auth/resolve-org` funciona
- Verificar que el dominio está en `control_org_domains_v`
- Revisar consola del navegador para errores

### FLUJO 2 falla al registrar
- Verificar `allow_self_registration = true`
- Verificar dominio permitido
- Revisar logs del servidor
- Verificar que no hay usuario duplicado

### FLUJO 3 no hace login
- Verificar credenciales
- Verificar que usuario está en Supabase Auth
- Verificar que está vinculado a la organización
- Revisar cookies en DevTools

### FLUJO 4 no detecta usuario existente
- Verificar que el usuario existe en tabla `users`
- Verificar que el email coincide exactamente (case-insensitive)
- Revisar respuesta de `/api/auth/resolve-org`

---

## 📍 URLs de Referencia Rápida

| Flujo | URL |
|-------|-----|
| Landing Principal | `http://localhost:3001/` |
| Landing de Org | `http://localhost:3001/gonvarri` |
| Signup | `http://localhost:3001/gonvarri/signup` |
| Login | `http://localhost:3001/login` |
| Login con org | `http://localhost:3001/login?org=gonvarri&email=test@gonvarri.com` |

---

## ✅ Checklist de Verificación

Antes de probar, verifica:

- [ ] Servidor corriendo en `http://localhost:3001`
- [ ] Organización `gonvarri` existe
- [ ] Dominio `gonvarri.com` configurado
- [ ] `allow_self_registration = true`
- [ ] Tienes al menos un usuario de prueba creado
- [ ] Variables de entorno configuradas

