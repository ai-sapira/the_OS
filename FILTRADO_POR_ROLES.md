# 🎯 Filtrado por Roles - Guía Completa

## Objetivo

Cada rol ve únicamente el contenido que le corresponde:
- **BU Manager de Finance**: Solo ve proyectos, iniciativas e issues de Finance
- **Employee**: Solo ve sus propios issues (assignee o reporter)
- **CEO/SAP**: Ven todo

## 📋 Cómo Funciona el Filtrado

### 1. **Sistema de Roles**

El sistema usa 4 roles definidos en `hooks/use-roles.ts`:
- **SAP**: Super admin (Sapira) - acceso total
- **CEO**: Director ejecutivo - vista completa
- **BU**: Business Unit Manager - solo su BU
- **EMP**: Empleado - solo sus issues

### 2. **Filtrado en las APIs**

#### `IssuesAPI.getIssuesByRole()` (`lib/api/issues.ts`)
```typescript
switch (role) {
  case 'EMP':
    // Solo issues donde el usuario es assignee o reporter
    query = query.or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)
    break
  case 'BU':
    // Solo issues de su BU (initiative_id)
    if (initiativeId) {
      query = query.eq('initiative_id', initiativeId)
    }
    break
  case 'CEO':
  case 'SAP':
    // Sin filtros - ven todo
    break
}
```

#### Filtrado de Projects (`hooks/use-supabase-data.ts`)
```typescript
if (activeRole === 'BU' && initiativeId) {
  // BU Manager solo ve proyectos de su initiative
  filteredProjects = filteredProjects.filter(p => 
    p.initiative?.id === initiativeId || p.initiative_id === initiativeId
  )
}
```

#### Filtrado de Initiatives
```typescript
if (activeRole === 'BU' && initiativeId) {
  // BU Manager solo ve su propia initiative (BU)
  filteredInitiatives = filteredInitiatives.filter(i => i.id === initiativeId)
}
```

### 3. **Mock Users para Demo Mode**

En `hooks/use-supabase-data.ts` se definen usuarios simulados para cuando un usuario SAP cambia de rol:

```typescript
const GONVARRI_MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',  // Pablo Senabre (Sapira)
  'CEO': '22222222-2222-2222-2222-222222222222',  // CEO Director
  'BU': '55555555-5555-5555-5555-555555555555',   // Miguel López (Finance Manager)
  'EMP': '33333333-3333-3333-3333-333333333333'   // Carlos Rodríguez (Employee)
}
```

El mapeo de BU Managers a sus Business Units:

```typescript
const GONVARRI_BU_INITIATIVES = {
  '55555555-5555-5555-5555-555555555555': '10000000-0000-0000-0000-000000000001', // Miguel → Finance
}
```

## 🔍 Verificación Paso a Paso

### PASO 1: Ejecutar Script de Verificación

Abre Supabase SQL Editor y ejecuta:
```bash
scripts/test-bu-filtering.sql
```

Este script te mostrará:
1. ✅ Todas las Business Units de Gonvarri
2. ✅ Usuarios BU Managers y sus BUs asignadas
3. ✅ **IMPORTANTE**: ID del Finance Manager y ID de la BU Finance
4. ✅ Issues y proyectos de Finance
5. ✅ Distribución de contenido por BU

### PASO 2: Verificar IDs

Del resultado del script, anota:

#### Finance Initiative:
```
- ID: _____________________________________________
- Nombre: Finance
- Slug: finance
```

#### Finance Manager (Ejemplo: Miguel López):
```
- ID Usuario: _____________________________________________
- Nombre: _____________________________________________
- Email: _____________________________________________
```

### PASO 3: Actualizar Mock Users

Si los IDs no coinciden, actualiza en `hooks/use-supabase-data.ts`:

```typescript
const GONVARRI_MOCK_USERS = {
  'BU': 'ID_DEL_FINANCE_MANAGER_AQUI',  // <-- Actualizar
}

const GONVARRI_BU_INITIATIVES = {
  'ID_DEL_FINANCE_MANAGER_AQUI': 'ID_DE_FINANCE_INITIATIVE_AQUI',  // <-- Actualizar
}
```

### PASO 4: Verificar Contenido

**CRÍTICO**: El BU Manager de Finance solo verá contenido si existen:
- ✅ Issues con `initiative_id = [ID de Finance]`
- ✅ Projects con `initiative_id = [ID de Finance]`

Si el script muestra "0 issues" o "0 projects" en Finance, necesitas crear contenido.

## 🧪 Cómo Probar

### 1. Como SAP (Super Admin)
1. Login como `sapira@sapira.com`
2. En el sidebar, verás el selector de roles arriba
3. Selector debe mostrar: **Sapira** (rol actual)
4. Debes ver TODOS los proyectos, iniciativas e issues

### 2. Cambiar a BU Manager de Finance
1. Click en el selector de roles
2. Selecciona **BU Manager**
3. El sidebar debe mostrar: "Filtered to: My BU"
4. Ahora SOLO verás:
   - ✅ Initiative de Finance en `/initiatives`
   - ✅ Projects de Finance en `/projects`
   - ✅ Issues de Finance en `/issues`

### 3. Cambiar a Employee
1. Selector de roles → **Employee**
2. El sidebar debe mostrar: "Filtered to: Me"
3. Solo verás issues donde eres assignee o reporter

### 4. Cambiar a CEO
1. Selector de roles → **CEO**
2. Sin badge de filtro
3. Ves TODO el contenido (como SAP, pero sin triage)

## 📊 Ejemplo Real: BU Manager de Finance

Supongamos que Miguel López es el BU Manager de Finance:

### Lo que VE:
- ✅ Business Unit: **Finance**
- ✅ Proyectos: Invoicing, Pricing, Accounting
- ✅ Issues: GON-36 (Invoice AutoFlow), GON-47 (InvoiceGenius), GON-50 (FraudFinder AI), etc.

### Lo que NO ve:
- ❌ Business Units: Sales, HR, Legal, Procurement, etc.
- ❌ Proyectos de otras BUs
- ❌ Issues de otras BUs

## 🔧 Troubleshooting

### Problema: "BU Manager ve TODO el contenido"

**Causa**: Los IDs de mock users no coinciden con la base de datos.

**Solución**:
1. Ejecuta `scripts/test-bu-filtering.sql`
2. Verifica query #4 para obtener IDs correctos
3. Actualiza `GONVARRI_MOCK_USERS` y `GONVARRI_BU_INITIATIVES`

### Problema: "BU Manager no ve NADA"

**Causa**: No hay contenido en Finance o los issues/projects no tienen `initiative_id` asignado.

**Solución**:
1. Ejecuta query #5 y #6 del script
2. Si hay 0 issues/projects, necesitas:
   - Crear issues en Finance
   - O asignar issues existentes a Finance:
     ```sql
     UPDATE issues 
     SET initiative_id = 'ID_FINANCE_INITIATIVE'
     WHERE key IN ('GON-36', 'GON-47', 'GON-50', ...);
     ```

### Problema: "Employee ve issues de otros"

**Causa**: El filtro de employee no está funcionando correctamente.

**Solución**:
1. Verifica que el usuario mock de EMP tenga issues asignados:
   ```sql
   SELECT id, key, title 
   FROM issues 
   WHERE assignee_id = 'ID_EMPLOYEE' 
      OR reporter_id = 'ID_EMPLOYEE';
   ```
2. Si no hay issues, asigna algunos al empleado

## ✅ Checklist de Verificación

Antes de considerar completo el filtrado por roles:

- [ ] Script SQL ejecutado sin errores
- [ ] IDs de Finance BU y Manager anotados
- [ ] Mock users actualizados en `use-supabase-data.ts`
- [ ] Finance tiene al menos 3-5 issues
- [ ] Finance tiene al menos 1-2 proyectos
- [ ] BU Manager solo ve contenido de Finance
- [ ] Employee solo ve sus propios issues
- [ ] CEO ve todo sin filtros
- [ ] Badge "Filtered to: My BU" aparece para BU
- [ ] Badge "Filtered to: Me" aparece para Employee

## 📝 Próximos Pasos

Una vez verificado el filtrado de Finance:

1. **Extender a otras BUs**: Agregar más managers en `GONVARRI_BU_INITIATIVES`:
   ```typescript
   const GONVARRI_BU_INITIATIVES = {
     'ID_FINANCE_MANAGER': 'ID_FINANCE_BU',
     'ID_SALES_MANAGER': 'ID_SALES_BU',
     'ID_HR_MANAGER': 'ID_HR_BU',
     // etc...
   }
   ```

2. **Verificar todas las páginas**:
   - [ ] `/initiatives` - Solo muestra la BU del manager
   - [ ] `/projects` - Solo proyectos de su BU
   - [ ] `/issues` - Solo issues de su BU
   - [ ] `/roadmap` - Solo proyectos de su BU
   - [ ] `/metrics` - Métricas de su BU

3. **Documentar casos edge**:
   - ¿Qué pasa con issues sin `initiative_id`?
   - ¿Qué pasa con proyectos sin `initiative_id`?

## 🎓 Resumen Técnico

El filtrado por roles se implementa en 3 capas:

1. **Capa de Permisos** (`hooks/use-roles.ts`):
   - Define qué puede ver cada rol
   - Devuelve `filterPreset`: "mine", "my-bu", o null

2. **Capa de Datos** (`hooks/use-supabase-data.ts`):
   - Obtiene el `userId` e `initiativeId` según el rol activo
   - Pasa estos parámetros a las APIs

3. **Capa de API** (`lib/api/*.ts`):
   - Aplica filtros SQL basados en `role`, `userId`, `initiativeId`
   - Devuelve solo los datos permitidos

Este diseño en capas asegura que el filtrado sea:
- ✅ Seguro (no se puede bypassear desde el frontend)
- ✅ Eficiente (filtrado en SQL, no en JavaScript)
- ✅ Mantenible (lógica centralizada)


