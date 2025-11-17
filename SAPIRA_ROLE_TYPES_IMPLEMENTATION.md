# 🎭 Implementación de Tipos de Roles Sapira

## 📋 Resumen

Se ha implementado un sistema completo de **tipos de roles Sapira** que permite diferenciar entre diferentes tipos de trabajadores de Sapira dentro de una organización.

---

## ✅ Cambios Implementados

### **1. Base de Datos**

**Migración:** `supabase/migrations/20250104_sapira_role_types.sql`

- ✅ Añadido campo `sapira_role_type` a `user_organizations`
- ✅ Añadido campo `sapira_role_type` a `user_invitations`
- ✅ Validación: Solo aplicable cuando `role = 'SAP'`
- ✅ Valores permitidos: `FDE`, `ADVISORY_LEAD`, `ACCOUNT_MANAGER`

### **2. Validación de Seguridad**

**Solo usuarios `@sapira.ai` pueden tener rol SAP:**

- ✅ Validación en `admin-app/app/api/admin/organizations/[id]/users/create/route.ts`
- ✅ Validación en `admin-app/app/api/admin/organizations/[id]/users/invite/route.ts`
- ✅ Error 400 si intentas asignar SAP a usuario NO-Staff

### **3. Admin App (Backoffice)**

**Gestión completa de tipos de roles Sapira:**

- ✅ `CreateUserModal`: Selector de tipo cuando `role = SAP`
- ✅ Validación cliente-side: Muestra advertencia si email no es `@sapira.ai`
- ✅ `EditUserModal`: (Pendiente actualizar para permitir editar tipo)
- ✅ Rutas API actualizadas para aceptar `sapira_role_type`

### **4. OS Principal**

**Visualización de tipos Sapira:**

- ✅ `RoleSwitcher`: Muestra tipo Sapira (ej: "Sapira - FDE")
- ✅ `AuthContext`: Incluye `sapira_role_type` en `UserOrganization`
- ✅ API `/api/user/organizations`: Retorna `sapira_role_type`

### **5. Callback de Invitaciones**

- ✅ `app/auth/callback/route.ts`: Obtiene `sapira_role_type` de invitación y lo asigna al usuario

---

## 🎯 Tipos de Roles Sapira

| Tipo | Código | Descripción |
|------|--------|-------------|
| **FDE** | `FDE` | Forward Deploy Engineer - Ingeniero dedicado con relación directa con BUs |
| **Advisory Lead** | `ADVISORY_LEAD` | Define estrategia y roadmap global |
| **Account Manager** | `ACCOUNT_MANAGER` | Gestión de cuenta y relación con cliente |

---

## 🔒 Reglas de Seguridad

### **1. Solo Staff puede tener rol SAP**

```typescript
// Validación en Admin App
if (role === "SAP" && !email.toLowerCase().endsWith("@sapira.ai")) {
  return NextResponse.json({ 
    error: "SAP role can only be assigned to users with @sapira.ai email" 
  }, { status: 400 })
}
```

### **2. Tipo solo aplicable a SAP**

```sql
-- Validación en base de datos
CHECK (
  (role = 'SAP' AND sapira_role_type IN ('FDE', 'ADVISORY_LEAD', 'ACCOUNT_MANAGER'))
  OR (role != 'SAP' AND sapira_role_type IS NULL)
)
```

---

## 📊 Flujo Completo

### **Crear Usuario Sapira desde Admin App**

```
1. Staff de Sapira crea usuario con email @sapira.ai
2. Selecciona rol "Sapira"
3. Selecciona tipo: FDE / Advisory Lead / Account Manager
4. Usuario creado con:
   - user_organizations.role = 'SAP'
   - user_organizations.sapira_role_type = 'FDE' (ejemplo)
```

### **Invitar Usuario Sapira**

```
1. Staff invita usuario con email @sapira.ai
2. Selecciona rol "Sapira" y tipo
3. Invitación almacenada en user_invitations con sapira_role_type
4. Usuario acepta invitación
5. Callback obtiene sapira_role_type de invitación
6. Crea user_organizations con tipo asignado
```

### **Visualización en OS Principal**

```
1. Usuario Sapira se loguea
2. AuthContext carga user_organizations con sapira_role_type
3. RoleSwitcher muestra: "Sapira - FDE" (si tiene tipo)
4. Usuario puede usar RoleSwitcher normalmente
```

---

## 🎨 Visualización en Selectores

Los usuarios Sapira con tipo aparecerán en los selectores de asignación:

```
┌─────────────────────────────────┐
│ Asignar a:                      │
├─────────────────────────────────┤
│ 👤 Juan Pérez (CEO)             │
│ 👤 María García (BU Manager)    │
│ 🛡️ Pablo Senabre (Sapira - FDE) │ ← Con tipo Sapira
│ 🛡️ Ana López (Sapira)          │ ← Sin tipo específico
└─────────────────────────────────┘
```

**Implementación pendiente:** Actualizar selectores de usuarios para mostrar tipo Sapira.

---

## 📝 Archivos Modificados

### **Base de Datos**
- ✅ `supabase/migrations/20250104_sapira_role_types.sql`

### **Admin App**
- ✅ `admin-app/app/api/admin/organizations/[id]/users/create/route.ts`
- ✅ `admin-app/app/api/admin/organizations/[id]/users/invite/route.ts`
- ✅ `admin-app/app/api/admin/organizations/[id]/users/[userId]/route.ts`
- ✅ `admin-app/components/CreateUserModal.tsx`

### **OS Principal**
- ✅ `lib/context/auth-context.tsx`
- ✅ `app/api/user/organizations/route.ts`
- ✅ `components/role-switcher.tsx`
- ✅ `app/auth/callback/route.ts`

### **Documentación**
- ✅ `ARCHITECTURE_ROLES.md`
- ✅ `SAPIRA_ROLE_TYPES_IMPLEMENTATION.md`

---

## 🔄 Próximos Pasos

1. ✅ **Implementado**: Validación solo @sapira.ai para SAP
2. ✅ **Implementado**: Tipos de roles Sapira (FDE, Advisory Lead, Account Manager)
3. ✅ **Implementado**: Visualización en RoleSwitcher
4. 🔄 **Pendiente**: Actualizar selectores de usuarios para mostrar tipo Sapira
5. 🔄 **Pendiente**: Actualizar EditUserModal para editar tipo Sapira
6. 🔄 **Pendiente**: Aplicar migración en Supabase

---

## 🚀 Aplicar Migración

```sql
-- Ejecutar en Supabase SQL Editor:
-- Copiar contenido de supabase/migrations/20250104_sapira_role_types.sql
```

---

## 📚 Referencias

- `ARCHITECTURE_ROLES.md`: Arquitectura completa de roles
- `ROLES_SYSTEM.md`: Documentación del sistema de roles
- `supabase/migrations/20250104_sapira_role_types.sql`: Migración SQL

