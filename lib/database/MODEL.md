# Internal OS - Modelo Canónico de Base de Datos

## 🎯 **Modelo Canónico Definitivo**

### **Mapeo conceptual:**
* **Initiatives = Departamentos / Business Units (BU)**
* **Projects = Proyectos estratégicos (transversales)**
* **Issues = Tickets** (unidad de trabajo; nacen en Triage)

Sin **milestones** ni **cycles**. Cuatro roles: **SAP**, **CEO**, **BU Manager**, **Employee**.
Máxima simplicidad pero completitud y lógica impecable.

---

## 1) **Entidades y contenido**

### A) **Organization** (cliente/empresa)
**Para:** multi-tenant y políticas comunes.

* `id`, `name`, `slug`
* `settings` *(JSON)* → matriz SLA por prioridad, banderas (usar due dates, permitir snooze…)
* `created_at`, `updated_at`

### B) **Users** (personas)
**Para:** atribución y visibilidad.

* `id`, `organization_id`
* `name`, `email`, `avatar_url?`
* `role` → `SAP | CEO | BU | EMP`
* `active` (bool)
* `created_at`, `updated_at`

**Roles definidos:**
- **SAP**: Super-admin (Sapira) - acceso total al sistema
- **CEO**: Director ejecutivo - vista estratégica completa
- **BU**: Manager de Business Unit - gestiona su departamento
- **EMP**: Employee - ve solo sus tareas

### C) **Initiatives** (BU / Departamento)
**Para:** contenedor operativo por área. **Clave** en ruteo y visibilidad.

* `id`, `organization_id`
* `name`, `slug`, `description?`
* `manager_user_id?` *(BU Manager)*
* `active` (bool)
* `created_at`, `updated_at`

**Reglas:**
* Es **obligatorio** para Issues **tras aceptar** (para saber "de qué BU es")
* `slug` único **por organización**

### D) **Projects** (Proyectos estratégicos)
**Para:** iniciativas estratégicas de negocio (transversales a varias BU).

* `id`, `organization_id`
* `name`, `slug`, `description?`
* `status` → `planned | active | paused | done`
* `progress` *(0–100, opcional)* → manual o calculado
* `owner_user_id?` *(sponsor; típico CEO/director área)*
* `planned_start_at?`, `planned_end_at?`
* `created_at`, `updated_at`

### E) **Issues** (Tickets)
**Para:** unidad de trabajo; nacen en Triage y se enrutan a una BU.

**Identidad y texto:**
* `id`, `organization_id`
* `key` *(código humano, ej. "SAP-458")* — **único**
* `title`, `description?`

**Estado y prioridad:**
* `state` → `triage | todo | in_progress | blocked | waiting_info | done | canceled | duplicate`
* `priority?` → `P0 | P1 | P2 | P3`

**Contexto y ruteo:**
* `initiative_id?` — **NULL en Triage**, **OBLIGATORIO** tras "Accept"
* `project_id?` — **opcional** (proyecto estratégico)

**Personas y fechas:**
* `assignee_id?`, `reporter_id?`, `due_at?`

**Origen y control:**
* `origin?` → `teams | email | slack | api | url`
* `snooze_until?`, `duplicate_of_id?`, `parent_issue_id?`

**Trazabilidad:**
* `created_at`, `updated_at`, `triaged_at?`, `triaged_by_user_id?`

### F) **Labels + IssueLabels**
* `labels`: `id`, `organization_id`, `name`, `color?`
* `issue_labels`: `issue_id`, `label_id` (PK compuesta)

### G) **IssueActivity** (histórico/auditoría)
* `id`, `organization_id`, `issue_id`, `actor_user_id?`
* `action` → `created | accepted | declined | duplicated | snoozed | unsnoozed | updated | commented | labeled | assigned | state_changed`
* `payload` *(JSON)*, `created_at`

### H) **IssueLink** (enlaces externos)
* `id`, `issue_id`
* `provider` → `teams | slack | email | url`
* `external_id?`, `url?`, `synced_at?`

---

## 2) **Reglas de Negocio Implementadas**

### **Triage Flow:**
1. **Create** → `state='triage'`, `initiative_id=NULL`
2. **Accept** → `state='todo'`, `initiative_id` OBLIGATORIO, `project_id` opcional
3. **Decline** → `state='canceled'`
4. **Duplicate** → `state='duplicate'`, `duplicate_of_id` required
5. **Snooze** → `snooze_until` set, no aparece en triage hasta fecha

### **Constraints de Integridad:**
- ✅ Issues post-triage DEBEN tener `initiative_id` (excepto duplicate/canceled)
- ✅ Links externos únicos por `(provider, external_id)`
- ✅ Slugs únicos por organización
- ✅ Activity automática en cambios significativos

---

## 3) **Visibilidad por Rol**

### **SAP (Super-admin)**
- ✅ Acceso total: todos los issues, initiatives, projects, métricas globales
- ✅ Puede hacer triage, crear issues, ver todo

### **CEO (Director Ejecutivo)**
- ✅ Vista estratégica: todos los projects, roadmap, métricas globales
- ✅ Puede hacer triage opcional
- ✅ Ve todos los issues pero enfoque en estratégicos

### **BU (Manager de Business Unit)**
- ✅ Ve su BU: issues de su `initiative_id`
- ✅ Projects donde su BU tiene issues
- ✅ Puede hacer triage opcional para su área
- ✅ Métricas de su departamento

### **EMP (Employee)**
- ✅ Ve solo SUS issues: `assignee_id=él` OR `reporter_id=él`
- ✅ Puede crear issues
- ✅ Vista limitada a su trabajo

---

## 4) **Métricas Disponibles**

Todas desde `IssueActivity`:
- **Time to triage**: primera acción - `created_at`
- **Accept/decline/duplicate rates** por período
- **Lead time**: `done` - `accepted`
- **SLA compliance**: `done_at <= due_at`
- **Cortes por**: BU, Project, Origin, Priority

---

## 5) **Estado de Implementación**

### ✅ **Completamente Implementado:**
- Schema completo en Supabase
- Datos de prueba para 4 roles
- APIs TypeScript type-safe
- Sistema de roles frontend integrado
- Triggers automáticos
- Constraints de integridad
- Índices optimizados

### 📊 **Datos de Prueba:**
- **1 Organización**: Sapira
- **8 Usuarios**: 1 SAP, 1 CEO, 4 BU, 2 EMP
- **5 Initiatives**: Tecnología, Marketing, Ventas, RRHH, Finanzas
- **4 Projects**: Transformación Digital, Expansión Internacional, etc.
- **17 Issues**: 7 en triage, 10 en diferentes estados
- **8 Labels**: Bug, Feature, Urgente, Backend, Frontend, etc.

---

## 6) **Uso en Frontend**

```tsx
import { useSupabaseData } from '@/hooks/use-supabase-data'

const { 
  triageIssues,     // Filtrado automático por rol
  roleIssues,       // Issues visibles según rol
  initiatives,      // BUs visibles
  projects,         // Proyectos visibles
  acceptIssue,      // Acciones de triage
  createIssue       // Crear nuevos issues
} = useSupabaseData()
```

**El sistema respeta completamente el role switcher existente y filtra datos automáticamente según el rol activo.**
