# 🎭 Implementación de Perfiles Sapira - Corrección

## 📋 Cambio Conceptual

### **Antes (Incorrecto)**
- RoleSwitcher cambiaba entre roles: SAP, CEO, BU, EMP
- Los usuarios @sapira.ai podían tener diferentes roles

### **Ahora (Correcto)**
- **Rol**: Todos los usuarios `@sapira.ai` SIEMPRE tienen rol **SAP**
- **Perfil**: Los usuarios SAP pueden tener diferentes perfiles (FDE, Advisory Lead, Account Manager)
- **RoleSwitcher**: Cambia entre **perfiles Sapira**, no entre roles

---

## ✅ Cambios Implementados

### **1. RoleSwitcher Actualizado**

**Antes:**
```typescript
// Cambiaba entre roles: SAP, CEO, BU, EMP
<Select value={activeRole} onValueChange={switchRole}>
  {allRoles.map((role) => ...)}
</Select>
```

**Ahora:**
```typescript
// Cambia entre perfiles Sapira: FDE, Advisory Lead, Account Manager, null
<Select value={currentProfile || 'null'} onValueChange={switchProfile}>
  {SAPIRA_PROFILES.map((profile) => ...)}
</Select>
```

### **2. Hook useRoles Actualizado**

**Cambios:**
- `activeRole` siempre es `'SAP'` para usuarios @sapira.ai
- Nuevo estado: `activeProfile` (FDE, Advisory Lead, Account Manager, null)
- Nueva función: `switchProfile()` para cambiar perfiles
- Eliminado: `switchRole()` para usuarios SAP

### **3. Validación Automática**

**Admin App - Crear Usuario:**
```typescript
// Todos los @sapira.ai automáticamente tienen rol SAP
const isSapiraStaff = email.toLowerCase().endsWith("@sapira.ai")
const finalRole = isSapiraStaff ? "SAP" : (role || "EMP")
```

**Admin App - Invitar Usuario:**
```typescript
// Misma validación automática
const isSapiraStaff = email.toLowerCase().endsWith("@sapira.ai")
const finalRole = isSapiraStaff ? "SAP" : (role || "EMP")
```

### **4. CreateUserModal Actualizado**

- Auto-establece rol SAP cuando email es `@sapira.ai`
- Deshabilita selector de rol para usuarios @sapira.ai
- Muestra mensaje informativo: "Los usuarios @sapira.ai siempre tienen rol SAP"

---

## 🎯 Estructura Final

### **Para Usuarios @sapira.ai:**

```
Usuario: pablo@sapira.ai
├─ Rol: SAP (siempre, automático)
├─ Perfil asignado: FDE (en user_organizations.sapira_role_type)
└─ Perfil activo: Puede cambiar entre FDE, Advisory Lead, Account Manager
```

### **Para Usuarios Cliente:**

```
Usuario: ceo@gonvarri.com
├─ Rol: CEO (asignado manualmente)
└─ Perfil: null (no aplica)
```

---

## 🔄 Flujo de Uso

### **1. Crear Usuario Sapira desde Admin App**

```
1. Staff ingresa email: pablo@sapira.ai
2. Sistema automáticamente establece rol = SAP
3. Selector de rol se deshabilita
4. Staff selecciona perfil: FDE / Advisory Lead / Account Manager
5. Usuario creado con:
   - user_organizations.role = 'SAP'
   - user_organizations.sapira_role_type = 'FDE'
```

### **2. Usuario Sapira en OS Principal**

```
1. Usuario se loguea
2. RoleSwitcher muestra: "Viewing as FDE" (o su perfil asignado)
3. Usuario puede cambiar perfil:
   - FDE
   - Advisory Lead
   - Account Manager
   - Sapira (sin perfil específico)
4. El cambio de perfil afecta la VISIBILIDAD (pendiente implementar)
```

---

## 📝 Archivos Modificados

### **OS Principal**
- ✅ `components/role-switcher.tsx` - Cambia entre perfiles Sapira
- ✅ `hooks/use-roles.ts` - Maneja perfiles en lugar de roles para SAP

### **Admin App**
- ✅ `admin-app/app/api/admin/organizations/[id]/users/create/route.ts` - Auto-asigna SAP
- ✅ `admin-app/app/api/admin/organizations/[id]/users/invite/route.ts` - Auto-asigna SAP
- ✅ `admin-app/components/CreateUserModal.tsx` - Auto-establece SAP y deshabilita selector

---

## 🔄 Próximos Pasos

1. ✅ **Implementado**: RoleSwitcher cambia entre perfiles
2. ✅ **Implementado**: Validación automática de rol SAP para @sapira.ai
3. 🔄 **Pendiente**: Implementar lógica de visibilidad basada en perfil
   - FDE: Ver datos de sus BUs asignadas
   - Advisory Lead: Ver datos estratégicos
   - Account Manager: Ver datos de su cuenta/cliente
4. 🔄 **Pendiente**: Actualizar filtrado de datos para usar `activeProfile` en lugar de `activeRole` para usuarios SAP

---

## 📚 Referencias

- `ARCHITECTURE_ROLES.md`: Arquitectura completa de roles
- `components/role-switcher.tsx`: Componente actualizado
- `hooks/use-roles.ts`: Hook con lógica de perfiles

