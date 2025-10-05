# Implementación del RISE Score

## Resumen

Se ha agregado una nueva métrica llamada **RISE Score** (Risk, Impact, Strategic value, Effort) a todos los issues en el sistema. Este score ayuda a priorizar iniciativas basándose en múltiples factores de negocio.

## Cambios realizados

### 1. Base de datos (Supabase)

**Migración aplicada:** `add_rise_score_to_issues`

- ✅ Se agregó la columna `rise_score` a la tabla `issues`
- ✅ Tipo: `INTEGER` con constraint `CHECK (rise_score >= 0 AND rise_score <= 100)`
- ✅ Se creó un índice para mejorar el rendimiento de queries: `idx_issues_rise_score`
- ✅ Se generaron scores aleatorios (40-95) para todos los 29 issues existentes

**Estadísticas actuales:**
- Total de issues: 29
- Issues con RISE score: 29 (100%)
- Score mínimo: 40
- Score máximo: 95
- Score promedio: 67.00

### 2. Tipos TypeScript

**Archivo modificado:** `lib/database/types.ts`

Se agregó `rise_score: number | null` a las interfaces:
- `Row` - Para lectura de datos
- `Insert` - Para inserción de nuevos registros
- `Update` - Para actualización de registros existentes

### 3. Interfaz de usuario

⚠️ **IMPORTANTE:** El RISE Score SOLO se muestra en dos lugares específicos:

#### 3.1 Vista de Triage (`app/triage-new/page.tsx`)

**Panel derecho (detalle del issue):**
- ✅ Badge completo: "RISE Score: XX"
- ✅ Icono Target (🎯)
- ✅ Color: purple-50 con borde purple-200
- ✅ Posicionado justo debajo del chip de Core Technology
- ❌ **NO se muestra** en la lista de issues (panel izquierdo)

#### 3.2 Vista de Detalle de Issue (`app/issues/[id]/page.tsx`)

- ✅ Badge completo: "RISE Score: XX"
- ✅ Icono Target (🎯)
- ✅ Color: purple-50 con borde purple-200
- ✅ Posicionado justo debajo del chip de Core Technology

#### Ubicaciones donde NO se muestra:

- ❌ Lista de issues en triage (panel izquierdo)
- ❌ Vista de lista de issues (`/issues`)
- ❌ Vista de tarjetas/Kanban en issues

## Diseño visual

El RISE Score se muestra con un diseño consistente en todas las vistas:

```
🎯 RISE Score: 85
```

**Colores utilizados:**
- Background: `bg-purple-50` o `bg-purple-100`
- Border: `border-purple-200` o `border-purple-300`
- Text: `text-purple-700` o `text-purple-800`

## Uso futuro

El campo `rise_score` puede ser actualizado en el futuro con:
- Cálculos automáticos basados en múltiples factores
- Integración con ML/AI para scoring predictivo
- Edición manual por usuarios con permisos apropiados

## Verificación

Para verificar la implementación:

```sql
-- Ver todos los issues con sus RISE scores
SELECT key, title, rise_score 
FROM issues 
ORDER BY rise_score DESC;

-- Estadísticas del RISE score
SELECT 
  COUNT(*) as total,
  MIN(rise_score) as min,
  MAX(rise_score) as max,
  AVG(rise_score) as promedio
FROM issues;
```

## Archivos modificados

1. ✅ `supabase/migrations/add_rise_score_to_issues.sql` (nueva migración)
2. ✅ `lib/database/types.ts` (tipos actualizados)
3. ✅ `app/triage-new/page.tsx` (UI de triage)
4. ✅ `app/issues/page.tsx` (lista y cards de issues)
5. ✅ `app/issues/[id]/page.tsx` (detalle de issue)

---

**Fecha de implementación:** 2025-10-05
**Estado:** ✅ Completado y desplegado

