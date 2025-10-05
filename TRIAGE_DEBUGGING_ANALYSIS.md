# Análisis Detallado: Problemas con Página de Triage

## 🔴 Problemas Reportados

1. **Desde Teams**: Se intentó crear un ticket y no llegó a triage
2. **Al aceptar**: Un ticket en triage no se pudo aceptar
3. **Al eliminar**: No se pudo eliminar de triage
4. **Visible en iniciativas**: El ticket SÍ aparece en la vista de iniciativas

## 🔍 Análisis del Flujo de Triage

### 1. Creación de Issues desde Teams

#### Flujo Normal:
```
Teams Bot → POST /api/teams/create-issue → TeamsIntegration.createIssueFromTeamsConversation() 
→ IssuesAPI.createIssue() → Inserta en DB con state='triage'
```

#### Posibles Problemas:

**A) El issue se crea pero NO aparece en triage:**
- **Causa**: El query en `IssuesAPI.getTriageIssues()` filtra por:
  - `state = 'triage'`
  - Y (`snooze_until IS NULL` O `snooze_until < now()`)
  
```typescript:lib/api/issues.ts
static async getTriageIssues(organizationId: string): Promise<IssueWithRelations[]> {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
      labels:issue_labels(label_id, labels(*))
    `)
    .eq('organization_id', organizationId)
    .eq('state', 'triage')
    .or('snooze_until.is.null,snooze_until.lt.now()')
    .order('created_at', { ascending: false })
```

🚨 **PROBLEMA DETECTADO**: El query NO incluye las relaciones `initiative`, `project`, `assignee` que sí se incluyen en otros queries. Esto puede causar que el panel derecho no muestre bien los datos cuando se selecciona un issue.

**B) El issue se crea con state diferente a 'triage':**
- Revisar si `TeamsIntegration.createIssueFromTeamsConversation()` está asignando un estado incorrecto
- El código muestra que debería crear con `state: 'triage'`:

```typescript:lib/api/issues.ts
const { data: issue, error } = await supabase
  .from('issues')
  .insert({
    ...issueFields,
    key,
    organization_id: organizationId,
    state: 'triage'  // ✅ Correcto
  })
```

**C) Permisos de roles:**
- La vista de triage filtra por rol:

```typescript:hooks/use-supabase-data.ts
const loadTriageIssues = useCallback(async () => {
  if (!['SAP', 'CEO', 'BU'].includes(activeRole)) {  // ⚠️ Solo estos roles ven triage
    setTriageIssues([])
    return
  }
```

### 2. Aceptar Issues desde Triage

#### Flujo Normal:
```
User clicks "Accept" → Modal opens → Selecciona BU, Project, Assignee, Priority 
→ handleAcceptIssue() → acceptIssue() en useSupabaseData 
→ IssuesAPI.triageIssue(action: 'accept') → Cambia state a 'todo'
```

#### Código de Aceptación:

```typescript:lib/api/issues.ts
case 'accept':
  if (!action.accept_data?.initiative_id) {
    throw new Error('initiative_id is required when accepting an issue')  // ⚠️ VALIDACIÓN
  }
  updateData = {
    ...updateData,
    state: 'todo',                              // Cambia de 'triage' a 'todo'
    initiative_id: action.accept_data.initiative_id,
    project_id: action.accept_data.project_id,
    assignee_id: action.accept_data.assignee_id,
    priority: action.accept_data.priority,
    due_at: action.accept_data.due_at
  }
```

#### Posibles Problemas:

**A) Modal no valida correctamente:**
```typescript:components/ui/modal/accept-issue-modal.tsx
const isDisabled = action === 'accept' ? !selectedInitiativeId : (action === 'decline' ? !comment.trim() : false)
```
✅ Esto parece correcto - el botón se deshabilita si no hay BU seleccionada.

**B) Mapeo de datos incorrecto:**
```typescript:app/triage-new/page.tsx
const handleAcceptIssue = async (data: any) => {
  const acceptData = {
    initiative_id: data.initiative,    // ⚠️ Viene como 'initiative' del modal
    project_id: data.project || null,
    assignee_id: data.assignee || null,
    priority: data.priority || triageIssue.priority || null
  }
  
  const success = await acceptIssue(triageIssue.id, acceptData, data.comment)
```

**C) Error en actualización de UI:**
Después de aceptar, se hace:
```typescript:hooks/use-supabase-data.ts
await Promise.all([loadTriageIssues(), loadRoleIssues()])
```

Si el reload falla, el issue desaparece de triage pero la UI no se actualiza correctamente.

### 3. Eliminar Issues de Triage (Decline)

#### Flujo Normal:
```
User clicks "Decline" → Modal → handleDeclineIssue() 
→ IssuesAPI.triageIssue(action: 'decline') → Cambia state a 'canceled'
```

```typescript:lib/api/issues.ts
case 'decline':
  updateData.state = 'canceled'  // Cambia a 'canceled', ya no aparece en triage
  break
```

🚨 **PROBLEMA POTENCIAL**: No hay función explícita para "eliminar" issues. Solo se cambia el estado a 'canceled'. Si el usuario espera que desaparezca completamente, puede parecer que no funcionó.

### 4. Por qué aparece en Iniciativas

El issue aparece en iniciativas porque:

```typescript:lib/api/issues.ts
static async getIssues(organizationId: string): Promise<IssueWithRelations[]> {
  const { data, error} = await supabase
    .from('issues')
    .select(`...`)
    .eq('organization_id', organizationId)
    .neq('state', 'triage')  // ⚠️ Excluye SOLO los de triage
    .order('updated_at', { ascending: false })
```

Esto significa:
- Si el issue se aceptó → state = 'todo' → APARECE en iniciativas ✅
- Si se rechazó → state = 'canceled' → APARECE en iniciativas ❌ (probablemente no debería)
- Si se pausó → state = 'triage' pero snooze_until futuro → NO aparece en ningún lado ⚠️

## 🐛 Bugs Confirmados

### Bug #1: Query incompleto en getTriageIssues
**Archivo**: `lib/api/issues.ts:78-93`

El query de triage NO incluye las relaciones necesarias:
```typescript
// ❌ ACTUAL (falta initiative, project, assignee)
.select(`
  *,
  reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
  labels:issue_labels(label_id, labels(*))
`)

// ✅ DEBERÍA SER (como en getIssuesByRole)
.select(`
  *,
  initiative:initiatives(*),
  project:projects(*),
  assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
  reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
  labels:issue_labels(label_id, labels(*))
`)
```

**Impacto**: El panel derecho de triage puede no mostrar correctamente la información del issue.

### Bug #2: Issues cancelados aparecen en vistas generales
**Archivo**: `lib/api/issues.ts:96-113`

```typescript
.neq('state', 'triage')  // ⚠️ Esto incluye 'canceled'
```

**Solución**: Deberían excluirse también los cancelados:
```typescript
.neq('state', 'triage')
.neq('state', 'canceled')
```

### Bug #3: Falta manejo de errores en UI
**Archivo**: `app/triage-new/page.tsx:1020-1048`

```typescript
const handleAcceptIssue = async (data: any) => {
  try {
    const success = await acceptIssue(triageIssue.id, acceptData, data.comment)
    
    if (success) {
      // ✅ Cierra modal y limpia
    }
    // ❌ NO hay else - si falla silenciosamente, el usuario no lo sabe
  } catch (error) {
    console.error('Error accepting issue:', error)  // ⚠️ Solo console, no UI feedback
  }
}
```

## 🔧 Soluciones Recomendadas

### Fix #1: Completar query de triage (CRÍTICO)
```typescript
static async getTriageIssues(organizationId: string): Promise<IssueWithRelations[]> {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      initiative:initiatives(*),
      project:projects(*),
      assignee:users!issues_assignee_id_fkey(id, name, email, avatar_url),
      reporter:users!issues_reporter_id_fkey(id, name, email, avatar_url),
      labels:issue_labels(label_id, labels(*))
    `)
    .eq('organization_id', organizationId)
    .eq('state', 'triage')
    .or('snooze_until.is.null,snooze_until.lt.now()')
    .order('created_at', { ascending: false })

  if (error) throw error
  return this.transformIssuesWithLabels(data || [])
}
```

### Fix #2: Excluir cancelados de vistas
```typescript
static async getIssues(organizationId: string): Promise<IssueWithRelations[]> {
  const { data, error} = await supabase
    .from('issues')
    .select(`...`)
    .eq('organization_id', organizationId)
    .neq('state', 'triage')
    .neq('state', 'canceled')  // ✅ Nueva línea
    .order('updated_at', { ascending: false })
```

### Fix #3: Agregar feedback de errores en UI
```typescript
const handleAcceptIssue = async (data: any) => {
  try {
    const success = await acceptIssue(triageIssue.id, acceptData, data.comment)
    
    if (success) {
      setTriageAction(null)
      setTriageIssue(null)
      if (selectedIssue?.id === triageIssue.id) {
        setSelectedIssue(null)
      }
    } else {
      // ✅ Nuevo: Mostrar error al usuario
      alert('No se pudo aceptar el issue. Por favor intenta de nuevo.')
    }
  } catch (error) {
    console.error('Error accepting issue:', error)
    // ✅ Nuevo: Mostrar error al usuario
    alert('Error al aceptar el issue: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}
```

### Fix #4: Agregar logs de debug
```typescript
// En IssuesAPI.triageIssue()
static async triageIssue(issueId: string, action: TriageAction, actorUserId: string): Promise<Issue> {
  console.log('[IssuesAPI] triageIssue called:', { issueId, action: action.action, actorUserId })
  
  // ... código existente ...
  
  const { data, error } = await supabase
    .from('issues')
    .update(updateData)
    .eq('id', issueId)
    .select()
    .single()

  if (error) {
    console.error('[IssuesAPI] Error updating issue:', error)
    throw error
  }
  
  console.log('[IssuesAPI] Issue updated successfully:', { 
    id: data.id, 
    key: data.key, 
    new_state: data.state 
  })

  return data
}
```

## 📝 Checklist de Debug

Para diagnosticar el problema actual:

### 1. Verificar si el issue existe en DB
```sql
-- Ver todos los issues recientes
SELECT id, key, title, state, snooze_until, initiative_id, project_id
FROM issues 
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY created_at DESC 
LIMIT 10;

-- Ver el issue específico que no aparece
SELECT * FROM issues WHERE key = 'GON-XXX';  -- Reemplazar XXX con el número
```

### 2. Verificar rol del usuario
```sql
-- Ver rol actual del usuario logueado
SELECT id, name, email, role 
FROM users 
WHERE id = 'USER_ID_ACTUAL';
```

### 3. Verificar logs del navegador
- Abrir DevTools → Console
- Buscar mensajes con `[IssuesAPI]`, `[useSupabaseData]`, `[TriageNewPage]`
- Ver si hay errores de red en la pestaña Network

### 4. Verificar issue_links para Teams
```sql
-- Ver si el issue tiene contexto de Teams
SELECT il.*, i.key, i.title
FROM issue_links il
JOIN issues i ON i.id = il.issue_id
WHERE i.key = 'GON-XXX'  -- Reemplazar XXX
AND il.provider = 'teams';
```

## 🚀 Implementación Recomendada

**Orden de prioridad:**
1. **Fix #1** (query de triage) - CRÍTICO - Sin esto, el panel derecho puede no funcionar
2. **Fix #4** (logs de debug) - Para diagnosticar problemas actuales
3. **Fix #3** (UI feedback) - Para que el usuario sepa si algo falla
4. **Fix #2** (excluir cancelados) - Mejora de UX

## 📊 Métricas de Éxito

Después de los fixes, verificar:
- ✅ Issues creados desde Teams aparecen inmediatamente en triage
- ✅ Al aceptar un issue, desaparece de triage y aparece en iniciativas
- ✅ Al rechazar un issue, desaparece de triage y NO aparece en otras vistas
- ✅ Los datos del issue (BU, Project, Assignee) se muestran correctamente en el panel derecho
- ✅ Si hay un error, el usuario recibe feedback visual

