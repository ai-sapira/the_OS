# 🐛 Debug: Teams Proactive Messaging

## 📍 Dónde Ver los Logs

### ❌ NO AQUÍ: Render (sapira-teams-bot)
- Render **SOLO** muestra logs cuando el bot **RECIBE** mensajes
- Los mensajes proactivos NO pasan por el bot de Render
- Es normal no ver nada aquí

### ✅ SÍ AQUÍ: Servidor Next.js Local
Tu terminal donde corre `npm run dev` mostrará:

```bash
# Cuando aceptas un issue:
✅ Teams notification sent for issue: xxx
# O si falla:
⚠️ Failed to send Teams notification: [error]
```

### ✅ SÍ AQUÍ: Consola del Navegador
Abre DevTools (`Cmd+Option+I`) → Console + Network

Deberías ver:
```
POST /api/teams/send-message
Status: 200 OK
Response: { "success": true, "message": "Message sent to Teams successfully" }
```

## 🔍 Pasos para Debuggear

### 1. Verificar que el Issue Tiene Teams Context

Abre la consola del navegador y ejecuta:

```javascript
// Reemplaza con el ID de tu issue
const issueId = 'TU-ISSUE-ID-AQUÍ'

fetch(`/api/teams/send-message?issue_id=${issueId}`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Respuesta esperada:**
```json
{
  "issue_id": "xxx",
  "has_teams_context": true,
  "can_send_messages": true
}
```

**Si `has_teams_context: false`:**
→ El issue NO fue creado desde Teams o no se guardó el `conversation_reference`

### 2. Probar Envío Manual

En la consola del navegador:

```javascript
fetch('/api/teams/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    issue_id: 'TU-ISSUE-ID-AQUÍ',
    message: '🧪 Mensaje de prueba desde debug',
    message_type: 'info'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Respuestas posibles:**

✅ **Éxito:**
```json
{ "success": true, "message": "Message sent to Teams successfully" }
```

❌ **Sin Teams Context:**
```json
{ 
  "error": "Failed to send Teams message",
  "details": "No Teams context found for this issue or API error occurred"
}
```

❌ **Error de Token:**
```json
{
  "error": "Internal server error",
  "message": "Failed to get access token"
}
```

### 3. Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:

```bash
MICROSOFT_APP_ID=tu-app-id
MICROSOFT_APP_PASSWORD=tu-app-password
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 4. Ver Logs del Backend

En tu terminal donde corre Next.js, añade logs temporales:

```bash
# En lib/api/teams-messenger.ts, línea 51:
console.log('🔍 Teams context found:', teamsContext)

# En hooks/use-supabase-data.ts, línea 123:
console.log('📤 Sending Teams notification:', { issueId, message })

# En hooks/use-supabase-data.ts, línea 133:
console.log('✅ Teams notification response:', await response.json())
```

## 🧪 Flujo Completo de Debug

1. **Selecciona un issue en Triage**
   - ¿Es de origen Teams? Busca el icono 💬

2. **Abre DevTools** (`Cmd+Option+I`)
   - Ve a **Console** y **Network**

3. **Haz clic en "Accept"**
   - Rellena el formulario
   - **IMPORTANTE**: Añade un comentario (sin comentario no se envía)

4. **Observa los logs:**
   
   **En el Navegador (Console):**
   ```
   📤 Sending Teams notification: {...}
   ✅ Teams notification response: {...}
   ```

   **En el Navegador (Network):**
   ```
   POST /api/teams/send-message
   Status: 200 | 404 | 500
   ```

   **En el Terminal (Next.js):**
   ```
   🔍 Teams context found: {...}
   ✅ Message sent successfully
   ```

   **En Teams (Usuario):**
   ```
   [Bot] Sapira
   ✅ Tu issue ha sido aceptado y está ahora en el backlog.
   
   Comentario del equipo:
   [tu comentario]
   ```

## ⚠️ Problemas Comunes

### Issue sin Teams Context
**Síntoma:** `has_teams_context: false`

**Causa:** 
- Issue creado manualmente (no desde Teams)
- Bot no guardó el `conversation_reference`

**Solución:** 
- Crea un issue nuevo desde Teams
- Verifica que el bot tenga la migración aplicada

### Error 401 Unauthorized
**Síntoma:** `Failed to get access token`

**Causa:** 
- `MICROSOFT_APP_ID` o `MICROSOFT_APP_PASSWORD` incorrectos

**Solución:**
- Verifica las credenciales en `.env.local`
- Confirma que coinciden con el bot registrado en Azure

### No se envía nada
**Síntoma:** No hay llamadas a `/api/teams/send-message`

**Causa:**
- No hay comentario en el modal
- El código no se ejecuta

**Solución:**
- SIEMPRE añade un comentario al aceptar
- Verifica en Console si hay errores JS

### Mensaje no llega a Teams
**Síntoma:** Status 200 pero no aparece en Teams

**Causa:**
- Usuario bloqueó al bot
- Conversación expiró
- Token inválido

**Solución:**
- Verifica que el usuario pueda ver al bot en Teams
- Crea una conversación nueva

## 📊 Consulta SQL para Debug

```sql
-- Ver issues con Teams context
SELECT 
  i.id,
  i.key,
  i.title,
  i.origin,
  il.external_id,
  il.teams_context IS NOT NULL as has_teams_context
FROM issues i
LEFT JOIN issue_links il ON i.id = il.issue_id AND il.provider = 'teams'
WHERE i.origin = 'teams'
ORDER BY i.created_at DESC
LIMIT 10;

-- Ver el teams_context completo de un issue específico
SELECT 
  i.key,
  il.teams_context
FROM issues i
JOIN issue_links il ON i.id = il.issue_id
WHERE i.id = 'TU-ISSUE-ID'
  AND il.provider = 'teams';
```

## 🎯 Checklist Final

- [ ] Issue fue creado desde Teams (origen = 'teams')
- [ ] Issue tiene `teams_context` en `issue_links`
- [ ] Variables de entorno configuradas
- [ ] Comentario añadido al aceptar/rechazar
- [ ] Consola del navegador abierta
- [ ] Terminal del servidor Next.js visible
- [ ] No esperar logs en Render (no es el lugar correcto)
