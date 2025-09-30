# Database Migrations

## Overview

Este directorio contiene las migraciones de base de datos para actualizar el esquema de Supabase.

## Aplicar Migraciones

### Opción 1: Supabase Dashboard (Recomendado)

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto
3. Ir a **SQL Editor**
4. Copiar y pegar el contenido del archivo de migración
5. Ejecutar el script

### Opción 2: Supabase CLI

```bash
# Desde el directorio del proyecto
supabase db push

# O aplicar un archivo específico
psql $DATABASE_URL -f migrations/001_add_initiative_to_projects.sql
```

## Migraciones Disponibles

### 001_add_initiative_to_projects.sql

**Fecha:** 2025-09-30

**Descripción:** Añade relación directa entre Projects e Initiatives (Business Units)

**Cambios:**
- ✅ Añade columna `initiative_id` a la tabla `projects`
- ✅ Crea índice para optimizar queries
- ✅ Migra datos existentes (asigna la initiative con más issues)
- ✅ Añade documentación a la columna

**Antes:**
```
Projects ← (calculado dinámicamente) → Initiatives
```

**Después:**
```
Projects → initiative_id → Initiatives (relación directa)
```

**Impacto en la aplicación:**
- ✅ Los dropdowns de Business Unit ahora guardan correctamente
- ✅ Filtros de proyectos por BU funcionan más rápido
- ✅ Relación clara y consistente en el modelo de datos

**Rollback:**
```sql
-- Si necesitas revertir la migración
ALTER TABLE projects DROP COLUMN IF EXISTS initiative_id;
DROP INDEX IF EXISTS idx_projects_initiative_id;
```

## Validación Post-Migración

Después de aplicar la migración, verifica que todo funcione:

1. **Verificar estructura:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'initiative_id';
```

2. **Verificar datos migrados:**
```sql
SELECT 
  p.name as project_name,
  i.name as initiative_name
FROM projects p
LEFT JOIN initiatives i ON p.initiative_id = i.id;
```

3. **Verificar índice:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'projects' AND indexname = 'idx_projects_initiative_id';
```

## Testing en Local

Si tienes Supabase local configurado:

```bash
# Aplicar migración
supabase db reset

# O específicamente
supabase migration up
```
