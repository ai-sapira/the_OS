# ✅ Activity Timeline para Issues - Implementado

## 🎯 Descripción

Se ha implementado un **Activity Timeline** (historial de actividad) para issues que muestra un registro cronológico de todos los cambios y eventos importantes de cada ticket.

## 📦 Componentes Implementados

### 1. **Componente Visual** ✅
Se creó `IssueActivityTimeline` con:
- Timeline vertical con íconos personalizados por tipo de acción
- Formato de mensajes humanizados en español
- Timestamps relativos ("hace 2h", "hace 3d")
- Diseño consistente con el resto de la aplicación
- Muestra información contextual según el tipo de actividad

**Ubicación**: `/components/issue-activity-timeline.tsx`

### 2. **API Mejorada** ✅
Se mejoró el método existente `getIssueActivities`:
- Ahora incluye datos del usuario (actor) que realizó la acción
- Trae avatar, nombre, email y rol del usuario
- Ordenado cronológicamente

**Ubicación**: `/lib/api/issues.ts`

### 3. **Integración en la UI** ✅
El timeline se integró en la página de detalle de issues:
- **Ubicación**: Después del calendario/timeline y antes de "Notas internas"
- **Título**: "Activity Timeline" con ícono
- **Card**: Con border, padding y scroll si es necesario

**Ubicación**: `/app/issues/[id]/page.tsx`

## 🔄 Tipos de Actividades Soportadas

La tabla `issue_activity` ya existía y soporta estos tipos:

1. **`created`** - Issue creado
2. **`accepted`** - Issue aceptado (desde triage)
3. **`declined`** - Issue rechazado
4. **`duplicated`** - Marcado como duplicado
5. **`snoozed`** - Issue pospuesto
6. **`unsnoozed`** - Issue reactivado
7. **`state_changed`** - Estado cambió (triage → todo → in_progress, etc.)
8. **`assigned`** - Asignado a un usuario
9. **`labeled`** - Etiqueta añadida
10. **`commented`** - Comentario añadido
11. **`updated`** - Cambio genérico (título, descripción, etc.)

## 📊 Estructura de Datos

### Tabla `issue_activity` (ya existente)
```sql
id                 UUID PRIMARY KEY
organization_id    UUID NOT NULL (FK → organizations)
issue_id           UUID NOT NULL (FK → issues)
actor_user_id      UUID (FK → users, null para sistema)
action             activity_action NOT NULL
payload            JSONB (contexto adicional)
created_at         TIMESTAMP WITH TIME ZONE
```

### Ejemplos de payload:
```json
// State changed
{
  "old_state": "triage",
  "new_state": "todo"
}

// Snoozed
{
  "snooze_until": "2026-03-15T00:00:00Z"
}

// Commented
{
  "message_sent": "Se envió respuesta al usuario via Teams",
  "source": "teams_proactive_message"
}

// Assigned
{
  "assignee_name": "Pablo Senabre"
}
```

## 🎨 Diseño Visual

### Características:
- **Íconos contextuales**: Cada tipo de acción tiene su propio ícono
  - ✓ CheckCircle2 para "accepted"
  - ✗ XCircle para "declined"
  - ⏰ Clock para "snoozed"
  - ▶ PlayCircle para "unsnoozed"
  - 💬 MessageSquare para "commented"
  - 🏷 Tag para "labeled"
  - 👤 UserPlus para "assigned"
  - 🔀 GitBranch para "state_changed"
- **Línea temporal**: Conecta todos los eventos visualmente
- **Colores suaves**: Gray-scale para consistencia
- **Responsive**: Se adapta al ancho del contenedor

### Formato de mensajes:
- **Principal**: Qué ocurrió ("Estado cambiado", "Issue aceptado")
- **Secundario**: Detalles adicionales ("de triage a todo", "en RRHH")
- **Timestamp**: Relativo y localizado ("hace 2 horas")

## 📝 Uso

### Ver el timeline:
1. Navegar a cualquier issue (e.g., `/issues/GON-10`)
2. Scroll hacia abajo después del calendario
3. Ver la sección "Activity Timeline"
4. Ver el historial completo de cambios

### Se registra automáticamente cuando:
- Se crea un nuevo issue
- Se acepta o rechaza desde triage
- Cambia el estado
- Se asigna a alguien
- Se añade una etiqueta
- Se envía un mensaje a Teams
- Cualquier actualización del issue

## 🔍 Casos de Uso

### 1. **Seguimiento de Issues de Teams**
Cuando un issue viene de Teams y se envían mensajes proactivos:
```json
{
  "action": "commented",
  "payload": {
    "source": "teams_proactive_message",
    "message_sent": "Hemos recibido tu solicitud...",
    "sent_at": "2026-01-15T10:30:00Z"
  }
}
```

### 2. **Triage Workflow**
Ver el journey completo de un issue:
- Created (desde Teams)
- Accepted (en RRHH)
- State changed (triage → todo)
- Assigned (a Pablo Senabre)
- State changed (todo → in_progress)
- Commented (actualización al usuario)
- State changed (in_progress → done)

### 3. **Auditoría**
- Ver quién cambió qué y cuándo
- Rastrear decisiones de triage
- Ver comunicaciones con usuarios

## 🚀 Próximas Mejoras

### Sugerencias para el futuro:
1. **Filtros**: Por tipo de acción, rango de fechas
2. **Búsqueda**: Buscar en el historial
3. **Exportar**: Descargar historial como CSV/PDF
4. **Detalles expandibles**: Click para ver payload completo
5. **Avatares reales**: Mostrar avatares de usuarios
6. **Notificaciones**: Alertas cuando ocurren ciertos eventos
7. **Menciones**: @menciones en comentarios
8. **Reacciones**: Añadir emojis a actividades

## 📚 Archivos Modificados/Creados

### Creados:
- `/components/issue-activity-timeline.tsx`
- `ISSUE_ACTIVITY_TIMELINE.md` (este archivo)

### Modificados:
- `/lib/api/issues.ts` (mejorado método getIssueActivities)
- `/app/issues/[id]/page.tsx` (integrado el timeline)

## ✨ Resultado Final

Ahora cada issue muestra un **historial completo y visual** de todo lo que ha ocurrido, incluyendo:
- 📝 Qué cambió
- 🕐 Cuándo cambió
- 🔄 De qué valor a qué valor
- 💬 Mensajes enviados a usuarios
- 👤 Asignaciones y cambios de estado

Esto proporciona **trazabilidad completa** y **transparencia** sobre la evolución de cada issue en el sistema, especialmente útil para:
- **Issues de Teams**: Ver toda la conversación y acciones
- **Triage**: Ver el proceso de aceptación/rechazo
- **Auditoría**: Rastrear cambios y decisiones

---

**Estado**: ✅ Completado e implementado
**Fecha**: 5 de octubre, 2025
**Integrado con**: Teams bot, Triage workflow, Issue management

