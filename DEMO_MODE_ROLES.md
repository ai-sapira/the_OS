# 🎭 MODO DEMO - Sistema de Roles Completo

## ✅ **CAMBIOS REALIZADOS**

Se ha modificado el sistema para que el **Role Switcher cambie REALMENTE** tanto la UI como los datos visibles.

---

## 🎬 **CÓMO FUNCIONA AHORA**

### **Antes (Solo Visual)** ❌
```
Usuario cambia rol CEO → BU
├─ UI: Cambia ✅
└─ Datos: NO cambian ❌ (seguía viendo todo)
```

### **Ahora (Modo Demo Completo)** ✅
```
Usuario cambia rol CEO → BU
├─ UI: Cambia ✅
└─ Datos: Cambian ✅ (ve solo su Business Unit)
```

---

## 👥 **ROLES CONFIGURADOS PARA GONVARRI**

### **Usuarios Mock Asignados:**

| Rol | Usuario Simulado | Business Unit | Ve |
|-----|-----------------|---------------|-----|
| **SAP** | Pablo Senabre | - | TODO de Gonvarri (super admin) |
| **CEO** | CEO Director | - | TODO de Gonvarri (vista ejecutiva) |
| **BU** | Miguel López | **Finance** | Solo Business Unit "Finance" (10+ issues) |
| **EMP** | Juan Pérez | - | Solo sus issues asignados |

### **Mapeo en el Código:**
```typescript
// hooks/use-supabase-data.ts
const MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',  // Pablo Senabre
  'CEO': '22222222-2222-2222-2222-222222222222',  // CEO Director
  'BU': '55555555-5555-5555-5555-555555555555',   // Miguel López (Finance)
  'EMP': '77777777-7777-7777-7777-777777777777'   // Juan Pérez
}

const MOCK_BU_INITIATIVES = {
  '55555555-5555-5555-5555-555555555555': '10000000-0000-0000-0000-000000000001', // Finance
}
```

---

## 🎯 **DEMO PARA GONVARRI**

### **Escenario 1: CEO ve TODO**
```
1. Login: cualquier usuario
2. RoleSwitcher → Seleccionar "CEO"
3. Resultado:
   ✅ Sidebar completo (Triage, Business Units, Roadmap, etc.)
   ✅ Ve TODOS los proyectos de Gonvarri
   ✅ Ve TODOS los issues de Gonvarri
   ✅ Métricas globales
```

### **Escenario 2: BU Manager ve solo su BU (Finance)**
```
1. Login: cualquier usuario
2. RoleSwitcher → Seleccionar "BU"
3. Resultado:
   ✅ Sidebar de BU Manager
   ✅ Ve solo proyectos de "Finance"
   ✅ Ve solo issues de "Finance" (10+ issues financieros)
   ✅ Métricas solo de Finance
   ✅ Issues como: FinConsolidate AI, CloudBill Exchange, QueryAssist AI, etc.
```

### **Escenario 3: Employee ve solo sus issues**
```
1. Login: cualquier usuario
2. RoleSwitcher → Seleccionar "EMP"
3. Resultado:
   ✅ Sidebar simplificado
   ✅ Ve solo issues asignados a "Juan Pérez"
   ✅ Ve solo issues reportados por "Juan Pérez"
   ✅ Vista limitada
```

---

## 🔧 **DETALLES TÉCNICOS**

### **Flujo de Datos**

```typescript
// 1. Usuario cambia rol en el switcher
<RoleSwitcher onChange={switchRole} />

// 2. Se actualiza activeRole en localStorage
localStorage.setItem("os.activeRole", "BU")

// 3. useRoles detecta el cambio
const { activeRole } = useRoles() // "BU"

// 4. useSupabaseData usa el nuevo rol
const { userId, initiativeId } = getCurrentUser()
// userId: '55555555...' (Miguel López)
// initiativeId: '10000000-0000-0000-0000-000000000001' (Finance)

// 5. Las queries filtran por ese usuario/BU
const issues = await IssuesAPI.getIssuesByRole(
  'BU',                    // rol
  '55555555-5555-5555...',  // userId de Miguel
  '10000000-0000-0000...'   // initiativeId de Finance
)

// 6. UI muestra solo esos datos
```

### **Filtrado de Datos por Rol**

```typescript
// IssuesAPI.getIssuesByRole()

switch (role) {
  case 'SAP':
  case 'CEO':
    // Ve TODO
    return getAllIssues()
  
  case 'BU':
    // Solo su Business Unit
    return getIssues({
      initiative_id: initiativeId  // Filtro por BU
    })
  
  case 'EMP':
    // Solo sus issues
    return getIssues({
      OR: [
        { assignee_id: userId },
        { reporter_id: userId }
      ]
    })
}
```

---

## 📊 **COMPARATIVA: ANTES vs AHORA**

### **Antes (Solo Visual)**
```
Login como: usuario demo
Cambiar a: BU Manager

UI:
- Sidebar: BU Manager ✅
- Vista: BU Manager ✅

Datos:
- Issues: TODOS (CEO) ❌
- Projects: TODOS (CEO) ❌
- Métricas: Globales (CEO) ❌

Problema: Los datos NO coinciden con la UI
```

### **Ahora (Demo Completo)**
```
Login como: usuario demo
Cambiar a: BU Manager

UI:
- Sidebar: BU Manager ✅
- Vista: BU Manager ✅

Datos:
- Issues: Solo de "Finance" (Miguel López) ✅
- Projects: Solo de "Finance" ✅
- Métricas: Solo de Finance ✅
- Contenido: FinConsolidate AI, CloudBill Exchange, etc. ✅

Resultado: UI y datos están sincronizados
```

---

## 🎪 **GUIÓN DE DEMO**

### **Para presentar a Gonvarri:**

**1. Empezar como CEO:**
```
"Aquí vemos la vista del CEO de Gonvarri"
→ Mostrar Roadmap completo
→ Mostrar todos los proyectos
→ Mostrar métricas globales
```

**2. Cambiar a BU Manager:**
```
"Ahora vemos cómo lo ve un Manager de Business Unit"
→ Click en RoleSwitcher → BU
→ Notar cómo cambia el sidebar
→ Mostrar solo proyectos de "All Departments"
→ Explicar que solo ve su área
```

**3. Cambiar a Employee:**
```
"Y así lo ve un empleado normal"
→ Click en RoleSwitcher → EMP
→ Mostrar vista simplificada
→ Solo sus issues asignados
→ Sin acceso a roadmap ni métricas globales
```

**4. Volver a CEO:**
```
"Volvemos a la vista completa"
→ Click en RoleSwitcher → CEO
→ Todo aparece de nuevo
```

---

## ⚙️ **CONFIGURACIÓN PARA PRODUCCIÓN**

### **Opción 1: Desactivar Role Switcher**
```tsx
// components/header.tsx (línea 58)
{/* COMENTAR PARA PRODUCCIÓN */}
{/* <RoleSwitcher /> */}
```
**Resultado:** Los usuarios solo ven su rol real de la BD

### **Opción 2: Solo para Demos (SAP)**
```tsx
// components/header.tsx
const { currentOrg } = useAuth()

{/* Solo mostrar en modo demo o para rol SAP */}
{(currentOrg?.role === 'SAP' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') && (
  <RoleSwitcher />
)}
```

### **Opción 3: Sincronizar con Rol Real**
```tsx
// hooks/use-roles.ts
const { currentOrg } = useAuth()

// Usar el rol real del contexto
const [activeRole] = useState<Role>(
  currentOrg?.role || "EMP"
)

// Bloquear el cambio
const switchRole = (role: Role) => {
  // No hacer nada en producción
  console.log("Role switching disabled in production")
}
```

---

## 🔒 **SEGURIDAD**

### **Importante: RLS está desactivado en modo demo**

Para que el Role Switcher funcione, el sistema NO usa RLS (Row Level Security).

**En MODO DEMO:**
- ✅ Usuario puede "simular" cualquier rol
- ✅ Los datos se filtran en el frontend
- ⚠️ NO hay seguridad real a nivel de BD

**Para PRODUCCIÓN:**
- ✅ Activar RLS
- ✅ Desactivar Role Switcher
- ✅ Usar solo rol real de `user_organizations`

---

## 📝 **NOTAS IMPORTANTES**

### **Usuarios Mock (Gonvarri)**

Los IDs de usuarios son reales de la BD:
- `11111111-1111-1111-1111-111111111111` = Pablo Senabre (SAP)
- `22222222-2222-2222-2222-222222222222` = CEO Director
- `44444444-4444-4444-4444-444444444444` = Ana Martínez (BU)
- `77777777-7777-7777-7777-777777777777` = Juan Pérez (EMP)

### **Business Units (Gonvarri)**

Las BU son reales:
- `10000000-0000-0000-0000-000000000006` = All Departments (Ana)
- `10000000-0000-0000-0000-000000000004` = HR (Laura)
- `10000000-0000-0000-0000-000000000001` = Finance
- `10000000-0000-0000-0000-000000000002` = Sales

---

## ✅ **CHECKLIST DE DEMO**

Antes de presentar a Gonvarri:

- [ ] Verificar que Role Switcher está visible
- [ ] Probar cambio CEO → BU (datos cambian)
- [ ] Probar cambio BU → EMP (datos cambian)
- [ ] Probar volver a CEO (todo aparece)
- [ ] Preparar guión (ver sección arriba)

---

## 🎯 **RESUMEN**

**MODO DEMO ACTIVO:**
- ✅ Role Switcher cambia UI **Y** datos
- ✅ Puedes mostrar los 4 roles diferentes
- ✅ Cada rol ve datos específicos
- ✅ Perfecto para demos comerciales

**PARA PRODUCCIÓN:**
- Desactivar Role Switcher
- Activar RLS
- Usar solo roles reales de BD

---

## 📚 **Archivos Modificados**

| Archivo | Cambio |
|---------|--------|
| `hooks/use-supabase-data.ts` | Actualizado mapeo de usuarios a Gonvarri |
| `hooks/use-roles.ts` | Comentarios actualizados para modo demo |
| `DEMO_MODE_ROLES.md` | Este documento (nuevo) |

