# 📊 Diagrama Visual: Filtrado por Roles

## 🎯 Flujo de Filtrado Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO LOGIN                            │
│                   (sapira@sapira.com - SAP)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIDEBAR - Selector de Roles                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   SAP    │  │   CEO    │  │    BU    │  │   EMP    │       │
│  │ Sapira   │  │ Director │  │ Manager  │  │ Employee │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ SELECCIONA ROL │
                    └────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌────────┐          ┌─────────┐         ┌──────────┐
   │   CEO  │          │   BU    │         │   EMP    │
   │        │          │ Manager │         │          │
   └────┬───┘          └────┬────┘         └────┬─────┘
        │                   │                   │
        ▼                   ▼                   ▼
```

## 🔍 Qué Ve Cada Rol

### 👑 CEO / SAP
```
┌─────────────────────────────────────────────┐
│  VE TODO - Sin Filtros                      │
├─────────────────────────────────────────────┤
│  ✅ Initiatives                             │
│     • Finance                               │
│     • Sales                                 │
│     • HR                                    │
│     • Legal                                 │
│     • Procurement                           │
│     • [todas las BUs]                       │
│                                             │
│  ✅ Projects (todos)                        │
│     • Invoicing                             │
│     • Pricing                               │
│     • NPS                                   │
│     • Negotiation                           │
│     • [todos los proyectos]                 │
│                                             │
│  ✅ Issues (todos)                          │
│     • GON-1 a GON-N                         │
│     • [todos los issues]                    │
└─────────────────────────────────────────────┘

Filter Preset: null
Badge: (ninguno)
```

### 🏢 BU Manager (Ejemplo: Finance)
```
┌─────────────────────────────────────────────┐
│  FILTRADO A: Finance                        │
├─────────────────────────────────────────────┤
│  ✅ Initiatives                             │
│     • Finance                               │
│                                             │
│  ✅ Projects (solo Finance)                 │
│     • Invoicing                             │
│     • Pricing                               │
│     • Accounting                            │
│                                             │
│  ✅ Issues (solo Finance)                   │
│     • GON-36: Invoice AutoFlow              │
│     • GON-47: InvoiceGenius                 │
│     • GON-50: FraudFinder AI                │
│     • GON-69: Collections Assistant         │
│     • GON-80: FinanceGuardian               │
│     • [solo issues de Finance]              │
│                                             │
│  ❌ NO VE:                                  │
│     • Sales, HR, Legal, etc.                │
│     • Proyectos de otras BUs                │
│     • Issues de otras BUs                   │
└─────────────────────────────────────────────┘

Filter Preset: "my-bu"
Badge: "Filtered to: My BU" 🟦
```

### 👤 Employee
```
┌─────────────────────────────────────────────┐
│  FILTRADO A: Mis Issues                     │
├─────────────────────────────────────────────┤
│  ✅ Initiatives (relacionadas)              │
│     • [BUs donde tiene issues]              │
│                                             │
│  ✅ Projects (relacionados)                 │
│     • [Proyectos donde tiene issues]        │
│                                             │
│  ✅ Issues (solo los suyos)                 │
│     WHERE:                                  │
│       assignee_id = user_id                 │
│       OR reporter_id = user_id              │
│                                             │
│     Ejemplo:                                │
│     • GON-12: Issue asignado a mí           │
│     • GON-45: Issue reportado por mí        │
│     • GON-78: Issue donde colaboro          │
│                                             │
│  ❌ NO VE:                                  │
│     • Issues de otros empleados             │
│     • Initiatives completas                 │
│     • Proyectos sin su participación        │
└─────────────────────────────────────────────┘

Filter Preset: "mine"
Badge: "Filtered to: Me" 🟦
```

## 🔄 Flujo de Datos Técnico

```
1️⃣ USUARIO CAMBIA DE ROL
   │
   ├─ Sidebar.tsx
   │  └─ handleRoleChange(newRole)
   │     └─ useRoles.switchRole(newRole)
   │        └─ localStorage.setItem('os.demoRole', newRole)
   │
   ▼
2️⃣ HOOK DETECTA CAMBIO DE ROL
   │
   ├─ useRoles.activeRole actualizado
   │  └─ getFilterPreset() devuelve:
   │     • null (CEO/SAP)
   │     • "my-bu" (BU Manager)
   │     • "mine" (Employee)
   │
   ▼
3️⃣ HOOK DE DATOS SE ACTUALIZA
   │
   ├─ use-supabase-data.ts
   │  └─ useEffect([activeRole, currentOrg])
   │     │
   │     ├─ getCurrentUser() devuelve:
   │     │  • userId (real o mock)
   │     │  • initiativeId (BU del usuario)
   │     │
   │     └─ Carga datos con filtros:
   │        │
   │        ├─ loadTriageIssues()
   │        │  └─ IssuesAPI.getTriageIssues(orgId)
   │        │
   │        ├─ loadRoleIssues()
   │        │  └─ IssuesAPI.getIssuesByRole(orgId, role, userId, initiativeId)
   │        │     │
   │        │     └─ SQL aplica filtros:
   │        │        • BU: WHERE initiative_id = initiativeId
   │        │        • EMP: WHERE assignee_id = userId OR reporter_id = userId
   │        │        • CEO/SAP: (sin filtros)
   │        │
   │        ├─ loadInitiatives()
   │        │  └─ InitiativesAPI.getInitiatives()
   │        │     └─ Filtrado en JS:
   │        │        • BU: filter(i => i.id === initiativeId)
   │        │        • EMP: []
   │        │        • CEO/SAP: (todas)
   │        │
   │        └─ loadProjects()
   │           └─ ProjectsAPI.getProjects()
   │              └─ Filtrado en JS:
   │                 • BU: filter(p => p.initiative_id === initiativeId)
   │                 • EMP: (proyectos con sus issues)
   │                 • CEO/SAP: (todos)
   │
   ▼
4️⃣ UI SE ACTUALIZA
   │
   ├─ Páginas usan: const { initiatives, projects, roleIssues } = useSupabaseData()
   │  │
   │  ├─ /initiatives → Muestra solo initiatives permitidas
   │  ├─ /projects → Muestra solo projects permitidos
   │  └─ /issues → Muestra solo roleIssues permitidos
   │
   └─ Sidebar muestra:
      • Badge "Filtered to: My BU" (BU Manager)
      • Badge "Filtered to: Me" (Employee)
      • (sin badge para CEO/SAP)
```

## 🎨 Ejemplo Visual en UI

### Sidebar con BU Manager seleccionado:
```
┌─────────────────────────┐
│  ┌─────────────────┐   │
│  │   Gonvarri      │   │
│  └─────────────────┘   │
├─────────────────────────┤
│  [BU Manager ▼]  🔍 ⚙  │ ← Selector de roles
├─────────────────────────┤
│  ┌─────────────────┐   │
│  │ Filtered to:    │   │ ← Badge indicador
│  │    My BU        │   │
│  └─────────────────┘   │
├─────────────────────────┤
│  WORKSPACE              │
│  □ Projects             │ ← Solo 3 proyectos de Finance
│  □ Initiatives          │ ← Solo 1: Finance
│                         │
│  QUICK ACCESS           │
│  □ Surveys              │
│  □ My Sapira Relations  │
└─────────────────────────┘
```

## 📊 Tabla Comparativa

| Característica           | SAP/CEO | BU Manager | Employee |
|-------------------------|---------|------------|----------|
| Ve todas las BUs        | ✅      | ❌         | ❌       |
| Ve su propia BU         | ✅      | ✅         | ⚠️*      |
| Ve todos los proyectos  | ✅      | ❌         | ❌       |
| Ve proyectos de su BU   | ✅      | ✅         | ⚠️*      |
| Ve todos los issues     | ✅      | ❌         | ❌       |
| Ve issues de su BU      | ✅      | ✅         | ⚠️*      |
| Ve sus propios issues   | ✅      | ✅         | ✅       |
| Puede cambiar de rol    | ✅      | ❌         | ❌       |
| Triage visible          | ✅      | ✅ (opc)   | ❌       |
| Badge en sidebar        | ❌      | ✅         | ✅       |

\* Solo si tiene issues en esa BU

## 🔐 Seguridad

El filtrado se implementa en **múltiples capas**:

```
┌─────────────────────────────────────────┐
│  Capa 1: Permisos (use-roles.ts)       │
│  ├─ Define qué puede ver cada rol       │
│  └─ Devuelve filterPreset                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Capa 2: Lógica (use-supabase-data.ts) │
│  ├─ Obtiene userId e initiativeId       │
│  ├─ Llama a APIs con filtros            │
│  └─ Filtra results en frontend          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Capa 3: API/SQL (lib/api/*.ts)        │
│  ├─ Aplica filtros en queries SQL       │
│  ├─ WHERE initiative_id = ?             │
│  └─ WHERE assignee_id = ? OR ...        │
└─────────────────────────────────────────┘
```

✅ **Beneficios**:
- No se puede bypassear desde el navegador
- Filtrado eficiente en base de datos
- Código mantenible y testeable

## 🚀 Demo Script

Para mostrar el sistema en una presentación:

1. **Login** como SAP (pantalla completa)
2. **Mostrar todo** (6 BUs, 15 proyectos, 100 issues)
3. **Click** en selector de roles → "BU Manager"
4. **¡Poof!** 💨 Ahora solo 1 BU, 3 proyectos, 12 issues
5. **Badge aparece**: "Filtered to: My BU"
6. **Navegar**: /initiatives → Solo Finance
7. **Navegar**: /projects → Solo proyectos Finance
8. **Cambiar** a "Employee"
9. **¡Poof!** 💨 Ahora solo 5 issues propios
10. **Badge actualiza**: "Filtered to: Me"
11. **Volver** a CEO/SAP → Todo visible de nuevo

⏱️ **Duración**: 2 minutos  
🎯 **Impacto**: Alto - Muestra poder del sistema de permisos


