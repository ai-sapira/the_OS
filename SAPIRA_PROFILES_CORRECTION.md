# 🎭 Corrección de Perfiles Sapira

## 📋 Cambios Realizados

### **1. Eliminado localStorage del Perfil**

**Antes:**
- El perfil activo se guardaba en `localStorage`
- Se podía cambiar el perfil desde el RoleSwitcher
- Se persistía entre sesiones

**Ahora:**
- El perfil viene directamente de `user_organizations.sapira_role_type`
- NO se guarda en localStorage
- NO se puede cambiar desde el RoleSwitcher (solo muestra el asignado)

### **2. RoleSwitcher Simplificado**

**Antes:**
```typescript
// Tenía selector para cambiar perfiles
<Select value={currentProfile} onValueChange={switchProfile}>
  {SAPIRA_PROFILES.map(...)}
</Select>
```

**Ahora:**
```typescript
// Solo muestra badge con perfil asignado
<Badge>
  <Shield />
  {displayLabel} // Ej: "FDE" o "Advisory Lead"
</Badge>
```

### **3. Visibilidad en Selectores**

**Propósito:** Mostrar el perfil Sapira para que los usuarios de la organización sepan qué hace cada usuario Sapira.

**Ejemplo:**
```
Selector de asignación:
- Juan Pérez (CEO)
- María García (BU Manager)
- Pablo Senabre (FDE)          ← Muestra perfil Sapira
- Ana López (Account Manager)  ← Muestra perfil Sapira
```

**Implementado en:**
- ✅ `components/new-project-modal.tsx` - Selector de Owner
- ✅ `components/new-issue-modal.tsx` - Selector de Assignee
- ✅ `components/ui/modal/accept-issue-modal.tsx` - Selector de Assignee
- ✅ `components/ui/editable-issue-assignee-dropdown.tsx` - Dropdown de Assignee

---

## 🔄 Flujo Correcto

### **1. Asignar Perfil desde Admin App**

```
1. Admin App → Sapira Team → Seleccionar usuario
2. "Añadir a org" → Seleccionar organización
3. Seleccionar perfil: FDE / Advisory Lead / Account Manager
4. Guardado en user_organizations.sapira_role_type
```

### **2. Visualización en OS Principal**

```
1. Usuario Sapira se loguea
2. RoleSwitcher muestra: "FDE" (o su perfil asignado)
3. En selectores de asignación aparece: "Pablo Senabre (FDE)"
4. Los usuarios de la organización ven claramente qué hace cada Sapira
```

---

## 📝 Archivos Modificados

### **OS Principal**
- ✅ `hooks/use-roles.ts` - Eliminado localStorage, perfil viene de BD
- ✅ `components/role-switcher.tsx` - Solo muestra badge (sin selector)
- ✅ `components/new-project-modal.tsx` - Muestra perfil en selector
- ✅ `components/new-issue-modal.tsx` - Muestra perfil en selector
- ✅ `components/ui/modal/accept-issue-modal.tsx` - Muestra perfil en selector
- ✅ `components/ui/editable-issue-assignee-dropdown.tsx` - Muestra perfil en dropdown
- ✅ `lib/api/issues.ts` - Incluye `sapira_role_type` en respuesta

---

## ✅ Resultado Final

- **Perfil asignado**: Viene de `user_organizations.sapira_role_type` (BD)
- **RoleSwitcher**: Solo muestra el perfil asignado (no se puede cambiar)
- **Selectores**: Muestran "Nombre (Perfil)" para usuarios Sapira
- **Visibilidad**: Los usuarios de la organización ven claramente qué hace cada Sapira

---

## 📚 Referencias

- `ARCHITECTURE_ROLES.md`: Arquitectura completa
- `SAPIRA_PROFILES_IMPLEMENTATION.md`: Implementación inicial (ahora corregida)
- `components/role-switcher.tsx`: Componente actualizado

