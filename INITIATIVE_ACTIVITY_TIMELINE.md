# ✅ Activity Timeline para Iniciativas - Implementado

## 🎯 Descripción

Se ha implementado un sistema completo de **Activity Timeline** (historial de actividad) para iniciativas (Business Units), que muestra un registro cronológico de todos los cambios y eventos importantes.

## 📦 Componentes Implementados

### 1. **Base de Datos** ✅
- **Tabla**: `initiative_activity`
- **Enum**: `initiative_activity_action` con 12 tipos de acciones
- **Migración**: `create_initiative_activity.sql`
- **Triggers automáticos** que registran:
  - Creación de iniciativas
  - Cambios de estado (active/inactive)
  - Asignación/cambio/remoción de managers
  - Actualización de descripción
  - Cambios de nombre
  
**Ubicación**: `/supabase/migrations/create_initiative_activity.sql`

### 2. **API** ✅
Se agregaron dos métodos nuevos a `InitiativesAPI`:

```typescript
// Obtener todas las actividades de una iniciativa
static async getInitiativeActivities(initiativeId: string)

// Crear una actividad manual (para eventos especiales)
static async createActivity(initiativeId, action, actorUserId, payload)
```

**Ubicación**: `/lib/api/initiatives.ts`

### 3. **Componente Visual** ✅
Se creó `InitiativeActivityTimeline` con:
- Timeline vertical con íconos personalizados por tipo de acción
- Formato de mensajes humanizados en español
- Timestamps relativos ("hace 2h", "hace 3d")
- Avatares de usuarios que realizaron las acciones
- Estados de carga y vacío
- Diseño consistente con el resto de la aplicación

**Ubicación**: `/components/initiative-activity-timeline.tsx`

### 4. **Integración en la UI** ✅
El timeline se integró en la página de detalle de iniciativas:
- **Ubicación**: Entre "Performance Metrics" y "Notas internas"
- **Título**: "Activity Timeline" con ícono
- **Estilo**: Card con border, padding y scroll si es necesario

**Ubicación**: `/app/initiatives/[slug]/page.tsx`

## 🔄 Tipos de Actividades Registradas

### Automáticas (via triggers):
1. **`created`** - Iniciativa creada
2. **`status_changed`** - Estado cambió (active ↔ inactive)
3. **`manager_assigned`** - Se asignó un manager
4. **`manager_changed`** - Se cambió el manager
5. **`manager_removed`** - Se removió el manager
6. **`description_updated`** - Se actualizó la descripción
7. **`updated`** - Cambio genérico (nombre, slug)

### Manuales (para uso futuro):
8. **`project_added`** - Se añadió un proyecto
9. **`project_removed`** - Se removió un proyecto
10. **`issue_accepted`** - Se aceptó un issue en esta iniciativa
11. **`archived`** - Iniciativa archivada
12. **`restored`** - Iniciativa restaurada

## 📊 Estructura de Datos

### Tabla `initiative_activity`
```sql
id                 UUID PRIMARY KEY
organization_id    UUID NOT NULL (FK → organizations)
initiative_id      UUID NOT NULL (FK → initiatives)
actor_user_id      UUID (FK → users, null para sistema)
action             initiative_activity_action NOT NULL
payload            JSONB (contexto adicional)
created_at         TIMESTAMP WITH TIME ZONE
```

### Ejemplo de payload:
```json
{
  "old_status": "active",
  "new_status": "inactive"
}
```

## 🎨 Diseño Visual

### Características:
- **Íconos contextuales**: Cada tipo de acción tiene su propio ícono
- **Línea temporal**: Conecta todos los eventos visualmente
- **Colores suaves**: Gray-scale para consistencia
- **Responsive**: Se adapta al ancho del contenedor
- **Hover states**: Feedback visual en elementos interactivos

### Formato de mensajes:
- **Principal**: Quién hizo qué ("Pablo Senabre cambió el estado")
- **Secundario**: Detalles adicionales ("de active a inactive")
- **Timestamp**: Relativo y localizado ("hace 2 horas")
- **Avatar**: Iniciales del usuario

## 🔐 Seguridad (RLS)

Se implementaron políticas de Row Level Security:

```sql
-- Los usuarios pueden ver actividades de su organización
CREATE POLICY "Users can view initiative activities in their organization"
ON initiative_activity FOR SELECT TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
));

-- Los usuarios pueden crear actividades en su organización
CREATE POLICY "Users can create initiative activities"
ON initiative_activity FOR INSERT TO authenticated
WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
));
```

## 📝 Uso

### Ver el timeline:
1. Navegar a cualquier iniciativa (e.g., `/initiatives/rrhh`)
2. Scroll hasta la sección "Activity Timeline"
3. Ver el historial completo de cambios

### Se registra automáticamente cuando:
- Se crea una nueva iniciativa
- Se cambia el estado (active/inactive)
- Se asigna, cambia o remueve un manager
- Se actualiza la descripción
- Se cambia el nombre

### Registrar actividad manual (para eventos especiales):
```typescript
await InitiativesAPI.createActivity(
  initiativeId,
  'issue_accepted',
  userId,
  { issue_key: 'SAP-123' }
)
```

## 🚀 Próximas Mejoras

### Sugerencias para el futuro:
1. **Filtros**: Por tipo de acción, rango de fechas, actor
2. **Búsqueda**: Buscar en el historial
3. **Exportar**: Descargar historial como CSV/PDF
4. **Notificaciones**: Alertas cuando ocurren ciertos eventos
5. **Comentarios**: Permitir comentarios en actividades específicas
6. **Undo/Redo**: Revertir cambios desde el timeline
7. **Detalles expandibles**: Click para ver más información
8. **Comparación**: Ver "diff" entre valores antiguos y nuevos

## 🧪 Testing

### Casos de prueba sugeridos:
1. ✅ Crear iniciativa → verificar registro "created"
2. ✅ Cambiar estado → verificar registro "status_changed"
3. ✅ Asignar manager → verificar registro "manager_assigned"
4. ✅ Timeline vacío muestra mensaje apropiado
5. ✅ Timeline con muchos items tiene scroll
6. ✅ Timestamps son relativos y en español
7. ✅ RLS previene acceso a otras organizaciones

## 📚 Archivos Modificados/Creados

### Creados:
- `/supabase/migrations/create_initiative_activity.sql`
- `/components/initiative-activity-timeline.tsx`
- `INITIATIVE_ACTIVITY_TIMELINE.md` (este archivo)

### Modificados:
- `/lib/api/initiatives.ts` (agregados métodos de activity)
- `/lib/database/types.ts` (actualizado con nuevos tipos)
- `/app/initiatives/[slug]/page.tsx` (integrado el timeline)

## ✨ Resultado Final

El sistema ahora muestra un **historial completo y visual** de todo lo que ha ocurrido en cada iniciativa, incluyendo:
- 👤 Quién hizo el cambio
- 🕐 Cuándo se hizo
- 📝 Qué cambió exactamente
- 🔄 De qué valor a qué valor

Esto proporciona **trazabilidad completa** y **transparencia** sobre la evolución de cada Business Unit en el sistema.

---

**Estado**: ✅ Completado e implementado
**Fecha**: 5 de octubre, 2025
**Autor**: Implementado via MCP Supabase

