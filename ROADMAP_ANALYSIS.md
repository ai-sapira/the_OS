# 🔍 Análisis del Componente Roadmap/Gantt

## 📋 Problemas Identificados

### 1. **Issues No Se Muestran Escalonados en el Timeline** 🚨 CRÍTICO

**Problema:**
- Cuando se expande un proyecto (ej: Invoicing con 6 issues), los issues SÍ aparecen en la lista de la izquierda
- PERO las barras de los issues NO se muestran correctamente escalonadas en el timeline (cronograma)
- Solo se ve una barra para el proyecto, las barras individuales de los issues no son visibles o están sobrepuestas

**Ubicación del problema:**
```tsx
// app/roadmap/page.tsx líneas 530-567
{isExpanded && projectIssues.map((issue) => {
  const issueGanttItem = issueToGanttItem(issue)
  
  return (
    <div className="flex" key={issue.id}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" onClick={() => handleViewProject(issue.id)} className="w-full">
            <GanttInitiativeItem
              onMove={handleMoveItem}
              {...issueGanttItem}
            />
          </button>
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  )
})}
```

**Causa raíz:**
- Los issues usan `created_at` como fecha de inicio en lugar de una fecha planificada
- No hay campo `start_date` en issues, solo `due_at`
- Los issues se están renderizando pero probablemente se solapan o están mal posicionados

---

### 2. **Vista de "Semana" No Funciona Correctamente** 🚨 CRÍTICO

**Problema:**
- Al cambiar a vista "Semana", el timeline sigue mostrando **meses** en lugar de **semanas específicas**
- La granularidad no cambia, sigue mostrando: "Jan, Feb, Mar..." en lugar de "Week 1, Week 2..."

**Ubicación del problema:**
```tsx
// app/roadmap/page.tsx líneas 110-121
const getGanttConfig = (level: ZoomLevel): { range: 'daily' | 'monthly' | 'quarterly', zoom: number } => {
  switch (level) {
    case 'week':
      return { range: 'daily', zoom: 150 }  // ❌ PROBLEMA: dice "daily" pero debería mostrar semanas
    case 'month':
      return { range: 'monthly', zoom: 100 }
    case 'quarter':
      return { range: 'monthly', zoom: 60 }
    case 'year':
      return { range: 'quarterly', zoom: 100 }
  }
}
```

**Causa raíz:**
- El componente `Gantt` solo soporta `range: 'daily' | 'monthly' | 'quarterly'`
- NO existe un rango "weekly" nativo
- La vista "Semana" intenta usar `daily` con zoom 150%, pero sigue mostrando meses

---

### 3. **Vista de "Mes" No Se Diferencia de "Trimestre"** ⚠️ MEDIO

**Problema:**
- La vista "Mes" muestra exactamente lo mismo que otras vistas
- No hay diferencia visual clara entre las vistas
- Todas usan `range: 'monthly'` con diferentes zooms

**Configuración actual:**
```tsx
case 'week':   return { range: 'daily', zoom: 150 }      // Muestra meses
case 'month':  return { range: 'monthly', zoom: 100 }    // Muestra meses
case 'quarter': return { range: 'monthly', zoom: 60 }    // Muestra meses
case 'year':   return { range: 'quarterly', zoom: 100 }  // Muestra trimestres
```

---

### 4. **Issues Muestran Duración en "Meses" No en Fechas** ⚠️ MENOR

**Problema:**
- En la lista de issues expandidos, se muestra: "8 months", "7 months", "6 months"
- Debería mostrar fechas específicas o un rango más claro

**Ubicación:**
```tsx
// app/roadmap/page.tsx líneas 462-469
{isExpanded && projectIssues.map((issue) => (
  <GanttSidebarItem
    key={issue.id}
    initiative={issueToGanttItem(issue)}
    onSelectItem={handleViewProject}
    className="pl-8"
  />
))}
```

**Causa raíz:**
- El componente `GanttSidebarItem` calcula la duración automáticamente
- Usa `formatDistance` de date-fns que devuelve "8 months"

---

### 5. **Problema de Datos: Issues No Tienen Fecha de Inicio** ⚠️ MEDIO

**Problema:**
- Issues solo tienen `due_at` (fecha de vencimiento)
- No tienen fecha de inicio planificada
- El roadmap calcula inicio usando `created_at` que no es correcto para planificación

**Conversión actual:**
```tsx
// app/roadmap/page.tsx líneas 231-246
const issueToGanttItem = (issue: IssueWithRelations): GanttInitiative => {
  const progress = issue.state === 'done' ? 100 : issue.state === 'in_progress' ? 50 : 0
  
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    status: issue.state === 'done' ? 'completed' : issue.state === 'in_progress' ? 'in-progress' : 'planning',
    progress,
    startDate: convertToDate(issue.created_at),  // ❌ Usa created_at como inicio
    endDate: convertToDate(issue.due_at) || new Date(convertToDate(issue.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 
    owner: issue.assignee?.name || 'Sin asignar',
    projects: [],
    priority: issue.priority === 'P0' || issue.priority === 'P1' ? 'high' : issue.priority === 'P2' ? 'medium' : 'low',
  }
}
```

---

## 💡 Soluciones Propuestas

### Solución 1: Añadir `planned_start_at` a Issues

**Cambio en base de datos:**
```sql
-- Añadir campo planned_start_at a issues
ALTER TABLE issues ADD COLUMN planned_start_at TIMESTAMP WITH TIME ZONE;

-- Actualizar issues existentes para calcular fecha de inicio basada en due_at
UPDATE issues 
SET planned_start_at = due_at - INTERVAL '14 days'  -- 2 semanas antes del due_at
WHERE due_at IS NOT NULL AND planned_start_at IS NULL;
```

**Actualizar conversión:**
```tsx
const issueToGanttItem = (issue: IssueWithRelations): GanttInitiative => {
  return {
    // ...
    startDate: convertToDate(issue.planned_start_at) || convertToDate(issue.due_at) || new Date(),
    endDate: convertToDate(issue.due_at) || new Date(),
    // ...
  }
}
```

---

### Solución 2: Mejorar Vistas de Zoom

**Opción A: Simplificar a 2 vistas**
```tsx
// Eliminar "Semana" ya que no funciona bien
// Mantener solo:
- Mes: Muestra días del mes actual + siguiente
- Trimestre: Muestra meses del trimestre
- Año: Muestra trimestres del año
```

**Opción B: Implementar vista semanal custom**
```tsx
// Requiere modificar el componente Gantt base
// Añadir soporte para range: 'weekly'
// Mostrar columnas por semana en lugar de por mes
```

**Recomendación:** Opción A (más simple y funcional)

---

### Solución 3: Mejorar Display de Duración en Sidebar

**Cambio:**
```tsx
// En lugar de mostrar "8 months", mostrar fechas
<GanttSidebarItem
  key={issue.id}
  initiative={{
    ...issueToGanttItem(issue),
    // Añadir display custom de duración
  }}
  renderDuration={(start, end) => {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
  }}
/>
```

---

### Solución 4: Asegurar Issues Se Muestran Escalonados

**Problema técnico:** El CSS/layout de las filas de issues

**Cambio en roadmap/page.tsx:**
```tsx
// Línea 530 - Asegurar que cada issue tiene su propia fila
{isExpanded && projectIssues.map((issue, index) => {
  const issueGanttItem = issueToGanttItem(issue)
  
  return (
    <div 
      key={issue.id}
      className="flex"
      style={{ 
        height: 'var(--gantt-row-height)',  // Forzar altura de fila
        position: 'relative'
      }}
    >
      <GanttInitiativeItem
        onMove={handleMoveItem}
        {...issueGanttItem}
      />
    </div>
  )
})}
```

**Cambio en gantt.tsx:**
```tsx
// Verificar que GanttInitiativeListGroup renderiza children correctamente
// Cada child debe ocupar su propia fila
```

---

## 🎯 Plan de Implementación

### Fase 1: Arreglar Issues Escalonados (CRÍTICO)
1. ✅ Revisar CSS de `GanttInitiativeListGroup` y `GanttInitiativeItem`
2. ✅ Asegurar que cada issue expandido ocupa su propia fila
3. ✅ Verificar que las barras se posicionan correctamente en el timeline

### Fase 2: Mejorar Datos de Issues (ALTO)
1. ✅ Añadir `planned_start_at` a la tabla `issues`
2. ✅ Actualizar TypeScript types
3. ✅ Poblar fechas de inicio basadas en fechas de vencimiento
4. ✅ Actualizar `issueToGanttItem` para usar fechas correctas

### Fase 3: Simplificar Vistas de Zoom (MEDIO)
1. ✅ Eliminar vista "Semana" (no funciona bien)
2. ✅ Ajustar configuración de zoom para vistas restantes
3. ✅ Documentar claramente qué muestra cada vista

### Fase 4: Mejorar UX (BAJO)
1. ✅ Cambiar display de duración de "8 months" a fechas
2. ✅ Añadir tooltips con información detallada
3. ✅ Mejorar colores y contraste de barras

---

## 📊 Comparación Antes/Después

### ANTES:
```
Problemas:
❌ Issues no se ven en el timeline cuando se expanden
❌ Vista "Semana" muestra meses en lugar de semanas
❌ No hay diferencia visual entre vistas
❌ Duraciones muestran "8 months" (confuso)
❌ Issues usan created_at como fecha de inicio
```

### DESPUÉS:
```
Mejoras:
✅ Issues se muestran escalonados correctamente en timeline
✅ Solo vistas funcionales (Mes, Trimestre, Año)
✅ Cada vista tiene granularidad clara y diferenciada
✅ Duraciones muestran "Jan 6 - Jan 24" (claro)
✅ Issues usan planned_start_at como inicio real
```

---

## 🛠️ Código de Ejemplo: Cómo Debería Verse

### Vista Expandida de Invoicing:

```
Proyectos                          Issues
─────────────────────────────────────────────────────────────
Finance
  ▼ Invoicing                      6 issues    ████████████████
    ● FraudFinder AI               Jan 6-24             ████
    ● Invoice AutoFlow             Jan 13-31               ████
    ● InvoiceGenius                Feb 3-28                  ████
    ● Accounts Receivable...       Feb 10 - Mar 14             ██████
    ● FinanceGuardian              Mar 3-28                      ████
    ● DebtTrend AI                 Mar 10-31                       ████
```

**Nota:** Cada issue debe tener su propia fila visible en el timeline, escalonadas según sus fechas.

---

## 📝 Archivos a Modificar

1. **Migración SQL**: `supabase/migrations/add_planned_start_to_issues.sql`
2. **Types**: `lib/database/types.ts`
3. **Roadmap Page**: `app/roadmap/page.tsx`
4. **Gantt Component**: `components/ui/gantt.tsx` (posiblemente)

---

## ✅ Checklist de Implementación

- [ ] Añadir `planned_start_at` a tabla issues
- [ ] Actualizar TypeScript types
- [ ] Poblar planned_start_at con datos reales (14 días antes de due_at)
- [ ] Actualizar issueToGanttItem para usar planned_start_at
- [ ] Verificar CSS de filas de issues expandidos
- [ ] Eliminar vista "Semana" o implementar correctamente
- [ ] Ajustar configuración de zoom
- [ ] Cambiar display de duración a formato de fecha
- [ ] Testing completo con Invoicing expandido
- [ ] Documentar comportamiento esperado

---

**Prioridad:** 🔴 ALTA - Afecta funcionalidad core del roadmap
