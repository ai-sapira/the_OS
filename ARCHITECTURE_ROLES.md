# 🏗️ Arquitectura de Roles y Permisos - Sapira Pharo

## 📊 Visión General

El sistema tiene **dos aplicaciones principales** y **dos tipos de identidad**:

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA SAPIRA PHARO                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │   ADMIN APP      │          │   OS PRINCIPAL    │        │
│  │  (Backoffice)    │          │  (Cliente App)    │        │
│  │                  │          │                   │        │
│  │ admin.sapira.ai  │          │ app.sapira.ai    │        │
│  └────────┬─────────┘          └────────┬──────────┘        │
│           │                              │                   │
│           │ Solo Staff                   │ Todos            │
│           │ (@sapira.ai)                 │ (multi-tenant)    │
│           │                              │                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                    ┌──────▼──────┐
                    │  SUPABASE   │
                    │  (Database) │
                    └─────────────┘
```

---

## 🔐 Dos Tipos de Identidad

### **1. Staff de Sapira** (Acceso al Admin App)

**Identificación:**
- Email termina en `@sapira.ai`
- Verificado en `admin-app/lib/supabase/server.ts` → `isStaffFromToken()`
- Puede acceder al **Admin App** (backoffice)

**Características:**
- ✅ Puede gestionar organizaciones desde Admin App
- ✅ Puede crear usuarios en cualquier organización
- ✅ Puede asignar roles (incluyendo SAP)
- ❌ NO necesariamente tiene rol SAP en todas las organizaciones

**Ejemplo:**
```
Usuario: pablo@sapira.ai
├─ Admin App: ✅ Acceso completo
├─ Gonvarri OS: Rol = SAP (puede usar RoleSwitcher)
└─ Aurovitas OS: Rol = CEO (NO puede usar RoleSwitcher)
```

### **2. Rol SAP** (Rol dentro de una organización)

**Identificación:**
- `user_organizations.role = 'SAP'` para una organización específica
- Verificado en `lib/context/auth-context.tsx` → `isSAPUser = currentOrg?.role === 'SAP'`

**Características:**
- ✅ Puede usar **RoleSwitcher** en el OS Principal
- ✅ Ve todos los datos de la organización (RLS)
- ✅ Puede simular otros roles (demo mode)
- ✅ Acceso completo a configuración

**Relación con Staff:**
- Un **Staff de Sapira** puede tener rol SAP en múltiples organizaciones
- **IMPORTANTE**: Solo usuarios con email `@sapira.ai` pueden tener rol SAP (validado en Admin App)
- Un usuario **NO-Staff** NO puede tener rol SAP (bloqueado por validación)

---

## 🎭 Sistema de Roles en el OS Principal

### **Roles Disponibles**

| Rol | Descripción | Permisos | RoleSwitcher | Tipos Sapira |
|-----|-------------|----------|--------------|--------------|
| **SAP** | Super-admin (Sapira) | Acceso total | ✅ Sí (puede cambiar) | FDE, Advisory Lead, Account Manager |
| **CEO** | Director ejecutivo | Vista estratégica completa | ❌ No | - |
| **BU** | Manager de Business Unit | Gestiona su departamento | ❌ No | - |
| **EMP** | Employee | Solo sus tareas | ❌ No | - |

### **Tipos de Roles Sapira**

Cuando un usuario tiene rol **SAP**, puede tener un tipo específico:

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **FDE** | Forward Deploy Engineer | Ingeniero dedicado con relación directa con BUs |
| **ADVISORY_LEAD** | Advisory Lead | Define estrategia y roadmap global |
| **ACCOUNT_MANAGER** | Account Manager | Gestión de cuenta y relación con cliente |

**Características:**
- Se almacena en `user_organizations.sapira_role_type`
- Solo aplicable cuando `role = 'SAP'`
- Se muestra en el OS Principal (ej: "Sapira - FDE")
- Permite asignar usuarios Sapira a Projects e Initiatives
- Visible en selectores de asignación junto con usuarios de la organización

### **RoleSwitcher: Solo para Rol SAP**

**¿Por qué solo SAP?**
- **Seguridad**: Los roles reales controlan RLS (Row Level Security)
- **Integridad**: Permitir cambios de rol comprometería la seguridad
- **Propósito**: Es una herramienta de **demo/testing** para mostrar la aplicación desde diferentes perspectivas

**Funcionamiento:**
```typescript
// En components/header.tsx
{isSAPUser && <RoleSwitcher />}

// En hooks/use-roles.ts
const switchRole = (role: Role) => {
  if (!isSAPUser) {
    console.warn('Role switching is only available for SAP users')
    return
  }
  // Cambia solo la UI y datos visibles (demo mode)
  // NO cambia el rol real en la BD
}

// En components/role-switcher.tsx
// Muestra el tipo Sapira si existe:
const displayLabel = sapiraTypeLabel 
  ? `${getRoleLabel(activeRole)} - ${sapiraTypeLabel}`
  : getRoleLabel(activeRole)
// Ejemplo: "Sapira - FDE" o "Sapira - Advisory Lead"
```

---

## 🏢 Flujo de Usuarios SAP

### **Escenario 1: Staff de Sapira con Rol SAP**

```
1. Usuario: pablo@sapira.ai
2. Se loguea en Admin App → ✅ Acceso (es @sapira.ai)
3. Crea organización "Gonvarri"
4. Se asigna rol SAP en Gonvarri
5. Se loguea en OS Principal → Gonvarri
6. Ve RoleSwitcher → ✅ Puede cambiar roles (demo)
```

### **Escenario 2: Staff de Sapira con Rol CEO**

```
1. Usuario: pablo@sapira.ai
2. Se loguea en Admin App → ✅ Acceso (es @sapira.ai)
3. Crea organización "Aurovitas"
4. Se asigna rol CEO en Aurovitas (no SAP)
5. Se loguea en OS Principal → Aurovitas
6. NO ve RoleSwitcher → ❌ Solo ve su rol real (CEO)
```

### **Escenario 3: Usuario Cliente con Rol SAP** ❌ BLOQUEADO

```
Este escenario YA NO ES POSIBLE:
- Solo usuarios con email @sapira.ai pueden tener rol SAP
- Si intentas asignar SAP a un usuario NO-Staff, la API retorna error 400
```

---

## 🔒 Seguridad y Permisos

### **Admin App (Backoffice)**

**Acceso:**
- Solo usuarios con email `@sapira.ai`
- Verificado en cada API route: `isStaffFromToken(token)`

**Permisos:**
- ✅ Crear/editar organizaciones
- ✅ Crear/editar usuarios en cualquier organización
- ✅ Asignar cualquier rol (incluyendo SAP)
- ✅ Gestionar dominios de email
- ✅ Subir logos y configuración

### **OS Principal (Cliente App)**

**Acceso:**
- Todos los usuarios (multi-tenant)
- Verificado por dominio de email → organización

**Permisos por Rol:**

| Acción | SAP | CEO | BU | EMP |
|--------|-----|-----|----|----|
| Ver todos los issues | ✅ | ✅ | ❌ | ❌ |
| Ver issues de su BU | ✅ | ✅ | ✅ | ❌ |
| Ver solo sus issues | ✅ | ✅ | ✅ | ✅ |
| Crear proyectos | ✅ | ✅ | ✅ | ❌ |
| Gestionar Business Units | ✅ | ✅ | ✅ | ❌ |
| Acceso a configuración | ✅ | ❌ | ❌ | ❌ |
| Usar RoleSwitcher | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Registro de Usuarios

### **Auto-Registro (OS Principal)**

**Roles Disponibles:**
- ✅ **EMP**: Siempre disponible (por defecto)
- ✅ **BU**: Solo si hay Business Units en la organización
- ✅ **CEO**: Siempre disponible
- ❌ **SAP**: NUNCA disponible (solo desde Admin App)

**Validaciones:**
1. Email debe ser del dominio permitido
2. BU requiere seleccionar Business Unit
3. Business Unit debe existir y pertenecer a la organización
4. SAP bloqueado completamente

### **Creación desde Admin App**

**Roles Disponibles:**
- ✅ Todos los roles (EMP, BU, CEO, SAP)
- ✅ Puede asignar Business Unit para rol BU
- ✅ Puede crear usuarios con contraseña o invitar por email

---

## 🎨 RoleSwitcher: Funcionamiento Técnico

### **Cuándo Aparece**

```typescript
// components/header.tsx
const { isSAPUser } = useAuth()
// isSAPUser = currentOrg?.role === 'SAP'

{isSAPUser && <RoleSwitcher />}
```

### **Qué Hace**

1. **Cambia la UI**: Sidebar, permisos visuales
2. **Cambia datos visibles**: Usa demo mode con usuarios mock
3. **NO cambia el rol real**: `user_organizations.role` permanece igual
4. **NO afecta RLS**: La seguridad sigue basándose en el rol real

### **Demo Mode**

```typescript
// hooks/use-supabase-data.ts
if (DEMO_MODE && isSAPUser && activeRole !== 'SAP') {
  // Usa usuarios mock para simular el rol seleccionado
  const mockUserId = MOCK_USERS_BY_ORG[orgId]?.[activeRole]
  // Filtra datos como si fuera ese usuario
}
```

---

## 🚀 Recomendaciones de Arquitectura

### **1. Separación Clara de Responsabilidades**

- **Admin App**: Solo para Staff de Sapira (`@sapira.ai`)
- **OS Principal**: Para todos los usuarios (multi-tenant)
- **Rol SAP**: Permiso especial dentro de una organización

### **2. Seguridad en Capas**

1. **Nivel 1**: Email domain (`@sapira.ai`) → Acceso Admin App
2. **Nivel 2**: Rol en organización → Permisos en OS Principal
3. **Nivel 3**: RLS policies → Datos visibles por rol

### **3. RoleSwitcher Solo para SAP**

- ✅ Mantiene la seguridad (no compromete RLS)
- ✅ Útil para demos y testing
- ✅ No confunde a usuarios normales

### **4. Registro con Validaciones Estrictas**

- ✅ Solo roles apropiados (EMP, BU, CEO)
- ✅ BU requiere Business Unit válida
- ✅ SAP nunca disponible en auto-registro

---

## 📚 Referencias Técnicas

### **Archivos Clave**

1. **Admin App:**
   - `admin-app/lib/supabase/server.ts` → `isStaffFromToken()`
   - `admin-app/app/api/admin/**/*.ts` → Rutas protegidas
   - `admin-app/components/CreateUserModal.tsx` → Gestión de tipos Sapira

2. **OS Principal:**
   - `lib/context/auth-context.tsx` → `isSAPUser`, `sapira_role_type`
   - `components/header.tsx` → Renderizado de RoleSwitcher
   - `components/role-switcher.tsx` → Muestra tipo Sapira
   - `hooks/use-roles.ts` → Lógica de roles y permisos

3. **Base de Datos:**
   - `user_organizations.role` → Rol real del usuario
   - `user_organizations.sapira_role_type` → Tipo de rol Sapira (FDE, ADVISORY_LEAD, ACCOUNT_MANAGER)
   - `user_invitations.sapira_role_type` → Tipo de rol Sapira en invitaciones
   - `users.email` → Identificación de Staff (`@sapira.ai`)

4. **Migraciones:**
   - `supabase/migrations/20250104_sapira_role_types.sql` → Añade `sapira_role_type`

---

## ❓ Preguntas Frecuentes

### **¿Un Staff de Sapira siempre tiene rol SAP?**

No. Un Staff de Sapira puede tener cualquier rol en cualquier organización. El rol SAP se asigna explícitamente.

### **¿Puedo tener rol SAP sin ser Staff?**

**NO**. Solo usuarios con email `@sapira.ai` pueden tener rol SAP. Esta validación está implementada en todas las rutas de Admin App.

### **¿Qué son los tipos de roles Sapira?**

Son subtipos que permiten diferenciar entre diferentes tipos de trabajadores de Sapira:
- **FDE**: Forward Deploy Engineer (ingeniero dedicado)
- **Advisory Lead**: Define estrategia y roadmap
- **Account Manager**: Gestión de cuenta

Se muestran en el OS Principal (ej: "Sapira - FDE") y permiten asignar usuarios Sapira a Projects e Initiatives.

### **¿Por qué no puedo cambiar mi rol?**

Por seguridad. Solo usuarios con rol SAP pueden usar el RoleSwitcher para demos. Los roles reales controlan la seguridad del sistema.

### **¿Cómo se relacionan Admin App y OS Principal?**

- **Admin App**: Herramienta para Staff de Sapira gestionar el sistema
- **OS Principal**: Aplicación que usan los clientes
- **Ambos** comparten la misma base de datos (Supabase)

---

## 🔄 Próximos Pasos

1. ✅ **Implementado**: Separación Staff/Rol SAP
2. ✅ **Implementado**: RoleSwitcher solo para SAP
3. ✅ **Implementado**: Validaciones en registro
4. 🔄 **Pendiente**: Mejorar diseño del formulario de registro
5. 🔄 **Pendiente**: Documentar flujos completos de creación de usuarios

