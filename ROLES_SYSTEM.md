# 🎭 Sistema de Roles - Documentación Completa

## 📋 Resumen Ejecutivo

El sistema de roles de Sapira Pharo tiene **dos niveles**:
1. **Rol Real** (Base de Datos): Define permisos y seguridad
2. **Role Switcher** (Demo/Testing): Solo para usuarios SAP, permite simular otros roles

---

## 🔐 Por Qué No Puedes Cambiar de Rol

### **Razón Principal: Seguridad**

El `RoleSwitcher` **solo funciona para usuarios SAP** porque:

1. **Seguridad**: Los roles reales controlan qué datos puede ver cada usuario mediante **Row Level Security (RLS)**
2. **Permisos**: Cada rol tiene permisos específicos (CEO ve todo, BU ve su departamento, EMP ve solo sus tareas)
3. **Integridad**: Permitir que cualquier usuario cambie su rol comprometería la seguridad del sistema

### **¿Debería Cambiar Esto?**

**NO recomendamos** permitir que usuarios normales cambien su rol real porque:
- ❌ Comprometería la seguridad (un EMP podría hacerse CEO)
- ❌ Violaría las políticas de la organización
- ❌ Los datos visibles cambiarían (RLS se basa en el rol real)

**El RoleSwitcher es una herramienta de demo/testing** para que usuarios SAP puedan mostrar cómo se ve la aplicación desde diferentes perspectivas.

---

## 📝 Selección de Rol en Registro

### **Roles Disponibles en Auto-Registro**

| Rol | Disponible | Requisitos | Descripción |
|-----|-----------|------------|-------------|
| **EMP** | ✅ Siempre | Ninguno | Por defecto. Acceso básico a tareas asignadas |
| **BU** | ✅ Condicional | Business Unit existente | Solo si hay Business Units en la organización. Requiere seleccionar una BU |
| **CEO** | ✅ Siempre | Ninguno | Vista ejecutiva completa de la organización |
| **SAP** | ❌ Nunca | Solo Admin App | Super-admin. Solo se puede asignar desde Admin App |

### **Validaciones Implementadas**

1. **SAP nunca disponible**: Bloqueado en auto-registro
2. **BU requiere Business Unit**: Si seleccionas BU, debes elegir una Business Unit existente
3. **Validación de Business Unit**: Se verifica que la BU pertenezca a la organización
4. **Por defecto EMP**: Si no se especifica rol, se asigna EMP

---

## 🎨 Flujo de Registro con Rol

### **Paso 1: Usuario llega a `/gonvarri/signup`**

El sistema carga:
- ✅ Información de la organización
- ✅ Lista de Business Units disponibles (si existen)

### **Paso 2: Usuario completa el formulario**

```
┌─────────────────────────────────────┐
│ Nombre: [Juan]                      │
│ Apellidos: [Pérez]                   │
│ Email: [juan@gonvarri.com]          │
│ Contraseña: [••••••••]              │
│ Rol: [EMP ▼]                        │ ← Selector de rol
│                                     │
│ Si selecciona BU:                   │
│ Business Unit: [Finance ▼]          │ ← Selector de BU
└─────────────────────────────────────┘
```

### **Paso 3: Validación**

- ✅ Email debe ser del dominio permitido
- ✅ Si rol = BU → debe seleccionar Business Unit
- ✅ Business Unit debe existir y pertenecer a la organización
- ✅ Rol SAP bloqueado

### **Paso 4: Creación de Usuario**

Se crea en:
1. `auth.users` (Supabase Auth)
2. `users` table (con `role`)
3. `user_organizations` table (con `role` y `initiative_id` si es BU)

---

## 🔄 Cambio de Rol Después del Registro

### **Para Usuarios Normales**

**NO pueden cambiar su rol real**. El rol se define en:
- `user_organizations.role` (rol en la organización)
- `users.role` (rol por defecto)

**Para cambiar el rol**, un administrador debe:
1. Ir al Admin App
2. Editar el usuario
3. Cambiar el rol manualmente

### **Para Usuarios SAP**

Los usuarios SAP pueden usar el `RoleSwitcher` para **simular** otros roles:
- ✅ Cambia la UI (sidebar, permisos visuales)
- ✅ Cambia los datos visibles (usando demo mode)
- ❌ NO cambia el rol real en la base de datos
- ❌ NO afecta RLS (sigue siendo SAP en la BD)

---

## 🛡️ Seguridad y Permisos

### **Row Level Security (RLS)**

Los roles reales controlan qué datos puede ver cada usuario:

```sql
-- Ejemplo: Un BU Manager solo ve issues de su Business Unit
CREATE POLICY "BU sees only their initiative issues"
ON issues FOR SELECT
USING (
  initiative_id IN (
    SELECT initiative_id 
    FROM user_organizations 
    WHERE auth_user_id = auth.uid()
  )
);
```

### **Permisos por Rol**

| Permiso | SAP | CEO | BU | EMP |
|---------|-----|-----|----|----|
| Ver todos los issues | ✅ | ✅ | ❌ | ❌ |
| Ver issues de su BU | ✅ | ✅ | ✅ | ❌ |
| Ver solo sus issues | ✅ | ✅ | ✅ | ✅ |
| Crear proyectos | ✅ | ✅ | ✅ | ❌ |
| Gestionar Business Units | ✅ | ✅ | ✅ | ❌ |
| Acceso a configuración | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Casos de Uso

### **Caso 1: Nuevo Empleado se Registra**

```
1. Usuario llega a /gonvarri/signup
2. Completa formulario con rol EMP (por defecto)
3. Se crea usuario con rol EMP
4. Solo ve sus tareas asignadas
```

### **Caso 2: Manager de Business Unit se Registra**

```
1. Usuario llega a /gonvarri/signup
2. Completa formulario
3. Selecciona rol BU
4. Selecciona Business Unit "Finance"
5. Se crea usuario con rol BU e initiative_id = Finance
6. Ve todos los issues de Finance
```

### **Caso 3: CEO se Registra**

```
1. Usuario llega a /gonvarri/signup
2. Completa formulario
3. Selecciona rol CEO
4. Se crea usuario con rol CEO
5. Ve toda la información de la organización
```

### **Caso 4: Usuario SAP Hace Demo**

```
1. Usuario SAP se loguea
2. Ve RoleSwitcher en el header
3. Cambia a rol "BU" (demo mode)
4. UI cambia a vista de BU Manager
5. Ve datos filtrados como si fuera BU
6. Pero sigue siendo SAP en la BD (seguridad intacta)
```

---

## 🔧 Configuración Técnica

### **Archivos Modificados**

1. **`app/[org-slug]/signup/page.tsx`**
   - Añadido selector de rol
   - Añadido selector de Business Unit (condicional)
   - Validación cliente-side

2. **`app/api/auth/auto-register/route.ts`**
   - Acepta `role` y `initiative_id`
   - Valida rol (SAP bloqueado, BU requiere initiative)
   - Crea usuario con rol seleccionado

3. **`app/api/auth/check-org-signup/route.ts`**
   - Retorna lista de Business Units disponibles

### **Estructura de Datos**

```typescript
// user_organizations table
{
  auth_user_id: string,
  organization_id: string,
  role: "EMP" | "BU" | "CEO" | "SAP",
  initiative_id: string | null, // Solo si role = BU
  active: boolean
}
```

---

## ❓ Preguntas Frecuentes

### **¿Puedo cambiar mi rol después de registrarme?**

No, los usuarios normales no pueden cambiar su rol. Solo un administrador puede hacerlo desde el Admin App.

### **¿Por qué el RoleSwitcher solo funciona para SAP?**

Por seguridad. El RoleSwitcher es una herramienta de demo/testing. Permitir que usuarios normales cambien su rol comprometería la seguridad del sistema.

### **¿Qué pasa si selecciono BU pero no hay Business Units?**

El selector de BU no aparecerá si no hay Business Units disponibles. Debes seleccionar otro rol (EMP o CEO).

### **¿Puedo tener múltiples roles en diferentes organizaciones?**

Sí, un usuario puede tener diferentes roles en diferentes organizaciones. Cada entrada en `user_organizations` define el rol para esa organización específica.

---

## 🚀 Próximos Pasos

1. ✅ **Implementado**: Selección de rol en registro
2. ✅ **Implementado**: Validación de Business Unit para rol BU
3. ✅ **Implementado**: Bloqueo de rol SAP en auto-registro
4. 🔄 **Pendiente**: Permitir que administradores cambien roles desde el OS principal
5. 🔄 **Pendiente**: Notificaciones cuando se cambia el rol de un usuario

---

## 📚 Referencias

- `hooks/use-roles.ts`: Lógica de roles y permisos
- `components/role-switcher.tsx`: Componente de cambio de rol (solo SAP)
- `app/api/auth/auto-register/route.ts`: Endpoint de registro con rol
- `lib/database/MODEL.md`: Modelo de base de datos

