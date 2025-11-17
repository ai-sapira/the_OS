# 🏗️ Estructura Completa del Proyecto Sapira

## 📦 Arquitectura General

```
the_OS/
├── 📱 OS Principal (Next.js App)          → Usuarios finales
├── 🔧 Admin App (Next.js App)             → Staff de Sapira
├── 🤖 Teams Bot (Node.js)                 → Bot de Microsoft Teams
└── 🗄️ Supabase (Backend/Database)         → Base de datos + Auth + Storage
```

---

## 1️⃣ OS Principal (`/` - raíz del proyecto)

### **¿Qué es?**
La aplicación principal que usan los usuarios finales de las organizaciones (Gonvarri, Aurovitas, etc.)

### **Tecnología:**
- **Framework:** Next.js 14 (App Router)
- **Runtime:** Node.js (Vercel Edge/Serverless)
- **UI:** React 19, Tailwind CSS, Radix UI
- **Auth:** Supabase Auth (Magic Link + Password)

### **Estructura:**
```
the_OS/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas públicas de autenticación
│   │   ├── login/         # Login con email/password
│   │   └── select-org/    # Selector de organización
│   ├── [org-slug]/        # Rutas dinámicas por organización
│   │   └── signup/        # ✨ NUEVO: Auto-registro público
│   ├── api/               # API Routes (Backend)
│   │   ├── auth/          # Auth endpoints
│   │   │   ├── auto-register/    # ✨ NUEVO: Registro automático
│   │   │   └── check-org-signup/  # ✨ NUEVO: Verificar org
│   │   ├── org/           # Endpoints de organización
│   │   └── user/          # Endpoints de usuario
│   ├── issues/            # Gestión de issues
│   ├── projects/          # Gestión de proyectos
│   └── initiatives/       # Gestión de iniciativas
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y helpers
│   ├── supabase/          # Clientes Supabase (client/server)
│   └── api/               # Clientes API
└── middleware.ts          # Middleware de Next.js (auth, routing)
```

### **Backend (API Routes):**
- **Ubicación:** `app/api/`
- **Tipo:** Serverless Functions (Next.js API Routes)
- **Ejemplos:**
  - `/api/auth/auto-register` - Registro automático
  - `/api/org/users/invite` - Invitar usuarios
  - `/api/user/organizations` - Obtener orgs del usuario

### **Dominio Actual:**
- **Vercel:** `v0-internal-os-build.vercel.app` (temporal)
- **Recomendado:** `app.sapira.ai` o `project.sapira.ai`

### **Deploy:**
- **Plataforma:** Vercel
- **Auto-deploy:** Sí (push a `main`)
- **Build:** `next build`
- **Variables de entorno necesarias:**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Solo para API routes
  ```

---

## 2️⃣ Admin App (`/admin-app`)

### **¿Qué es?**
Panel de administración para el staff de Sapira (`@sapira.ai`) para gestionar organizaciones, dominios y usuarios.

### **Tecnología:**
- **Framework:** Next.js 14 (App Router)
- **Runtime:** Node.js (Vercel Edge/Serverless)
- **UI:** React 18, Tailwind CSS, misma estética que OS

### **Estructura:**
```
admin-app/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login staff-only (@sapira.ai)
│   ├── api/admin/          # API Routes protegidas
│   │   ├── organizations/  # CRUD organizaciones
│   │   ├── uploads/        # Subida de logos/avatars
│   │   └── me/             # Info del staff actual
│   ├── organizations/      # Gestión de organizaciones
│   │   ├── [id]/
│   │   │   ├── page.tsx    # Detalle org
│   │   │   ├── domains/    # Gestión dominios
│   │   │   └── users/      # Gestión usuarios
│   │   └── new/            # Crear nueva org
│   └── page.tsx            # Dashboard admin
├── components/
│   ├── InviteUserModal.tsx # Modal invitar usuario
│   ├── EditUserModal.tsx   # Modal editar usuario
│   └── layout/             # Layout components
└── lib/
    └── supabase/           # Clientes Supabase
```

### **Backend (API Routes):**
- **Ubicación:** `admin-app/app/api/admin/`
- **Tipo:** Serverless Functions
- **Autenticación:** Staff-only (valida `@sapira.ai` email)
- **Ejemplos:**
  - `/api/admin/organizations` - Listar/crear orgs
  - `/api/admin/organizations/[id]/users/invite` - Invitar usuario
  - `/api/admin/uploads/logo` - Subir logo de org

### **Dominio:**
- **Actual:** ❌ No tiene deploy aún
- **Recomendado:** `admin.sapira.ai`

### **Deploy:**
- **Estado:** ⚠️ **NO DESPLEGADO AÚN**
- **Plataforma:** Vercel (separado del OS principal)
- **Configuración necesaria:**
  - Crear nuevo proyecto en Vercel apuntando a `/admin-app`
  - Configurar variables de entorno (mismas que OS principal)
  - Configurar dominio `admin.sapira.ai`

---

## 3️⃣ Teams Bot (`/sapira-teams-bot`)

### **¿Qué es?**
Bot de Microsoft Teams que permite crear issues desde conversaciones.

### **Tecnología:**
- **Runtime:** Node.js (Express)
- **Plataforma:** Render (servicio siempre activo)
- **Integración:** Microsoft Bot Framework

### **Estructura:**
```
sapira-teams-bot/
├── bot-server.js          # Servidor Express principal
├── lib/
│   ├── gemini-service.js  # Integración con Gemini AI
│   └── conversation-manager.js
└── teams-manifest/        # Manifest para Teams
```

### **Backend:**
- **Tipo:** Servidor Node.js siempre activo
- **Puerto:** 3000 (Render lo gestiona)
- **Endpoints:** Webhooks de Microsoft Teams

### **Deploy:**
- **Plataforma:** Render
- **Auto-deploy:** Sí (push a `main`)
- **Variables de entorno:**
  ```bash
  MICROSOFT_APP_ID=xxx
  MICROSOFT_APP_PASSWORD=xxx
  SAPIRA_API_URL=https://app.sapira.ai  # Apunta al OS principal
  GEMINI_API_KEY=xxx
  ```

---

## 4️⃣ Supabase (Backend/Database)

### **¿Qué es?**
Backend completo: Base de datos PostgreSQL + Auth + Storage + Realtime

### **Servicios:**
1. **Database (PostgreSQL)**
   - Tablas: `users`, `organizations`, `user_organizations`, `issues`, `projects`, etc.
   - RLS (Row Level Security) para multi-tenancy
   - Migraciones en `supabase/migrations/`

2. **Authentication**
   - Magic Link
   - Password auth
   - Invitations (`inviteUserByEmail`)
   - JWT tokens

3. **Storage**
   - Bucket `org-logos` (logos de organizaciones)
   - Bucket `user-avatars` (fotos de perfil)
   - Signed URLs para acceso privado

4. **Realtime** (opcional, no usado aún)

### **URL:**
- **Proyecto:** `iaazpsvjiltlkhyeakmx.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  Usuario Final  │
│  (Gonvarri,     │
│   Aurovitas)    │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   OS Principal  │
│  (Vercel)       │
│  app.sapira.ai  │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│    Supabase     │
│  (Database +    │
│   Auth +        │
│   Storage)      │
└─────────────────┘

┌─────────────────┐
│  Staff Sapira   │
│  (@sapira.ai)   │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   Admin App     │
│  (Vercel)       │
│ admin.sapira.ai │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│    Supabase     │
└─────────────────┘

┌─────────────────┐
│  Microsoft      │
│  Teams          │
└────────┬────────┘
         │
         │ Webhooks
         ▼
┌─────────────────┐
│   Teams Bot     │
│  (Render)       │
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│   OS Principal  │
│  /api/teams/    │
│  create-issue   │
└────────┬────────┘
         │
         │ Write
         ▼
┌─────────────────┐
│    Supabase     │
└─────────────────┘
```

---

## 🌐 Dominios Recomendados

### **OS Principal:**
- **Producción:** `app.sapira.ai` o `project.sapira.ai`
- **Actual:** `v0-internal-os-build.vercel.app` (temporal)

### **Admin App:**
- **Producción:** `admin.sapira.ai`
- **Actual:** ❌ No desplegado

### **Configuración en Vercel:**

1. **OS Principal:**
   - Ve a: https://vercel.com/dashboard
   - Proyecto: `v0-internal-os-build` (o el nombre que tengas)
   - Settings → Domains
   - Añade: `app.sapira.ai` o `project.sapira.ai`
   - Configura DNS en tu proveedor de dominio

2. **Admin App:**
   - Crea nuevo proyecto en Vercel
   - Root Directory: `admin-app`
   - Build Command: `cd admin-app && npm run build`
   - Output Directory: `admin-app/.next`
   - Añade dominio: `admin.sapira.ai`

---

## 🧪 Cómo Probar el Auto-Registro

### **Prerequisitos:**
1. Tener una organización creada en Supabase
2. Tener un dominio permitido configurado
3. Habilitar `allow_self_registration = true`

### **Pasos:**

1. **Preparar la organización:**
   ```sql
   -- En Supabase SQL Editor
   UPDATE organizations 
   SET allow_self_registration = true 
   WHERE slug = 'tu-org-slug';
   
   -- Añadir dominio permitido
   INSERT INTO control_plane.organization_domains (organization_id, domain)
   SELECT id, 'empresa.com' 
   FROM organizations 
   WHERE slug = 'tu-org-slug';
   ```

2. **Acceder a la página de registro:**
   ```
   http://localhost:3000/[org-slug]/signup
   ```
   O en producción:
   ```
   https://app.sapira.ai/[org-slug]/signup
   ```

3. **Completar el formulario:**
   - Nombre: Juan
   - Apellidos: Pérez
   - Email: `juan@empresa.com` (debe ser del dominio permitido)
   - Contraseña: `password123`

4. **Resultado esperado:**
   - ✅ Usuario creado en Supabase Auth
   - ✅ Entrada en tabla `users`
   - ✅ Entrada en `user_organizations` con rol `EMP`
   - ✅ Auto-login y redirección al dashboard

### **Errores comunes:**

- **"El dominio no está permitido"**
  → Verificar que el dominio está en `control_plane.organization_domains`

- **"El registro automático no está habilitado"**
  → Verificar `allow_self_registration = true` en la organización

- **"Este email ya está registrado"**
  → El usuario ya existe en Supabase Auth

---

## 📝 Resumen de Deploys

| Componente | Plataforma | Dominio | Estado |
|------------|-----------|---------|--------|
| OS Principal | Vercel | `app.sapira.ai` | ✅ Desplegado |
| Admin App | Vercel | `admin.sapira.ai` | ❌ No desplegado |
| Teams Bot | Render | N/A | ✅ Desplegado |
| Supabase | Supabase | `*.supabase.co` | ✅ Activo |

---

## 🚀 Próximos Pasos

1. **Configurar dominio para OS Principal:**
   - Cambiar de `v0-internal-os-build.vercel.app` a `app.sapira.ai` o `project.sapira.ai`

2. **Desplegar Admin App:**
   - Crear proyecto en Vercel
   - Configurar dominio `admin.sapira.ai`
   - Configurar variables de entorno

3. **Probar flujo completo:**
   - Crear organización desde admin
   - Añadir dominio permitido
   - Probar auto-registro desde OS principal


