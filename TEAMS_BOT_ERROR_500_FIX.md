# 🔴 Fix Error 500: Teams Bot → API Create Issue

## 🐛 Problema Detectado

```
🎫 Creating ticket via API: https://v0-internal-os-build.vercel.app/api/teams/create-issue
❌ Error creating ticket: Error: API error: 500 - Unknown error
⚠️ Falling back to mock ticket creation
```

El bot de Teams está llamando al endpoint pero recibe un error 500 del servidor.

## 🔍 Diagnóstico

### Posibles Causas del Error 500:

1. **Variables de entorno faltantes en Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Estas son críticas para que `TeamsIntegration.createIssueFromTeamsConversation()` funcione

2. **Error en el código al procesar los datos**
   - El endpoint recibe datos del bot pero algo falla al procesarlos
   - Necesitamos ver los logs exactos de Vercel

3. **Error en Supabase al crear el issue**
   - Permisos RLS
   - Foreign keys inválidas
   - Datos faltantes requeridos

## 🔧 Soluciones

### Fix #1: Agregar Logs Detallados al Endpoint (CRÍTICO)

Necesitamos ver **qué está fallando exactamente**. Vamos a mejorar el endpoint para tener logs más detallados:

```typescript:app/api/teams/create-issue/route.ts
export async function POST(request: NextRequest) {
  try {
    console.log('[API] /api/teams/create-issue called')
    
    const body = await request.json()
    console.log('[API] Request body:', JSON.stringify(body, null, 2))
    
    // Validate request body
    if (!body.conversation_id || !body.ai_analysis) {
      console.error('[API] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: conversation_id, ai_analysis' },
        { status: 400 }
      )
    }

    console.log('[API] Building conversation reference...')
    let conversationReference: TeamsConversationReference | undefined
    if (body.conversation_reference) {
      conversationReference = {
        service_url: body.conversation_reference.serviceUrl || body.conversation_reference.service_url,
        tenant_id: body.conversation_reference.conversation?.tenantId,
        channel_id: body.conversation_reference.channelId || body.conversation_reference.channel_id,
        conversation: {
          id: body.conversation_reference.conversation?.id || body.conversation_id,
          isGroup: body.conversation_reference.conversation?.isGroup,
          conversationType: body.conversation_reference.conversation?.conversationType,
          tenantId: body.conversation_reference.conversation?.tenantId
        },
        bot: {
          id: body.conversation_reference.bot?.id || '',
          name: body.conversation_reference.bot?.name || 'Sapira'
        },
        user: {
          id: body.conversation_reference.user?.id || '',
          name: body.conversation_reference.user?.name || body.user_name || 'Usuario',
          aadObjectId: body.conversation_reference.user?.aadObjectId
        }
      }
      console.log('[API] Conversation reference built successfully')
    }

    console.log('[API] Building conversation data...')
    const conversationData: TeamsConversationData = {
      conversation_id: body.conversation_id,
      conversation_url: body.conversation_url || `https://teams.microsoft.com/l/chat/0/0?users=${body.user_id}`,
      participants: body.participants || [body.user_name, 'Sapira AI'],
      messages: body.messages || [],
      ai_analysis: {
        summary: body.ai_analysis.summary,
        short_description: body.ai_analysis.short_description,
        impact: body.ai_analysis.impact,
        core_technology: body.ai_analysis.core_technology,
        difficulty: body.ai_analysis.difficulty,
        impact_score: body.ai_analysis.impact_score,
        priority: body.ai_analysis.priority,
        business_unit: body.ai_analysis.business_unit,
        project: body.ai_analysis.project,
        suggested_labels: body.ai_analysis.suggested_labels || [],
        key_points: body.ai_analysis.key_points || [],
        suggested_assignee: body.ai_analysis.suggested_assignee
      },
      conversation_reference: conversationReference
    }
    
    console.log('[API] Conversation data built:', {
      conversation_id: conversationData.conversation_id,
      messages_count: conversationData.messages.length,
      has_ai_analysis: !!conversationData.ai_analysis,
      summary: conversationData.ai_analysis.summary,
      business_unit: conversationData.ai_analysis.business_unit,
      project: conversationData.ai_analysis.project
    })

    console.log('[API] Calling TeamsIntegration.createIssueFromTeamsConversation...')
    const result = await TeamsIntegration.createIssueFromTeamsConversation(conversationData)
    
    console.log('[API] Issue created successfully:', result)

    return NextResponse.json({
      success: true,
      issue_id: result.issue_id,
      issue_key: result.issue_key,
      issue_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/triage-new?issue=${result.issue_id}`
    })

  } catch (error) {
    console.error('[API] ERROR creating issue from Teams:', error)
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[API] Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Failed to create issue',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}
```

### Fix #2: Verificar Variables de Entorno en Vercel

**Variables necesarias en Vercel:**

```bash
# Supabase (CRÍTICAS)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# App URL (para generar links)
NEXT_PUBLIC_BASE_URL=https://v0-internal-os-build.vercel.app

# Bot Server (para mensajes proactivos)
BOT_SERVER_URL=https://sapira-teams-bot.onrender.com
```

**Cómo verificar en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Verifica que estas variables existan
4. Si faltan, agrégalas y redeploy

### Fix #3: Verificar RLS Policies en Supabase

El error 500 puede ser causado por políticas RLS que bloquean la inserción:

```sql
-- Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('issues', 'issue_links', 'issue_activity')
ORDER BY tablename, policyname;

-- Si no hay política para service_role, crear una:
-- Esto permite inserciones desde el backend (autenticado con service_role key)
CREATE POLICY "Service role can insert issues"
ON issues FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can insert issue_links"
ON issue_links FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can insert issue_activity"
ON issue_activity FOR INSERT
TO service_role
WITH CHECK (true);
```

### Fix #4: Alternativa - Usar Service Role Key

Si el problema es con RLS, podemos usar el `service_role` key en lugar del anon key para el bot:

```typescript:lib/api/teams-integration.ts
// En lugar de usar el cliente normal de Supabase
// podemos crear uno con service_role para operaciones del bot

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Nueva variable

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Usar supabaseAdmin en lugar de supabase para operaciones del bot
```

## 📋 Checklist de Debug

### Paso 1: Ver Logs de Vercel
```bash
# Instalar Vercel CLI si no la tienes
npm i -g vercel

# Login
vercel login

# Ver logs en tiempo real
vercel logs --follow

# O ver en el dashboard:
# https://vercel.com/your-org/your-project/logs
```

### Paso 2: Probar el Endpoint Directamente

```bash
# Probar con curl
curl -X POST https://v0-internal-os-build.vercel.app/api/teams/create-issue \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "user_name": "Test User",
    "ai_analysis": {
      "summary": "Test ticket",
      "priority": "P2",
      "short_description": "Testing endpoint",
      "impact": "Test impact",
      "core_technology": "Test Tech",
      "suggested_labels": [],
      "key_points": ["test"]
    }
  }'
```

Deberías ver:
- ✅ 200 con `{ success: true, issue_id: "...", issue_key: "GON-XXX" }`
- ❌ 500 con un mensaje de error específico

### Paso 3: Verificar en Supabase Dashboard

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta:
   ```sql
   SELECT * FROM issues 
   WHERE origin = 'teams' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
3. Verifica si se están creando issues o no

### Paso 4: Si el Problema Persiste

Necesitamos ver los **logs exactos** de Vercel. Dos opciones:

**Opción A: Compartir logs de Vercel**
1. Ve a Vercel Dashboard → Tu proyecto → Logs
2. Intenta crear un ticket desde Teams
3. Copia el error completo del log
4. Compártelo conmigo

**Opción B: Agregar logging temporal**
Agregar `console.log()` masivos en:
- `app/api/teams/create-issue/route.ts`
- `lib/api/teams-integration.ts`
- `lib/api/issues.ts`

## 🚀 Implementación Rápida

### Opción 1: Actualizar con Logs (Recomendado)

Voy a actualizar el endpoint con logs detallados para que podamos ver exactamente qué está fallando.

### Opción 2: Usar MCP Supabase para Verificar

Puedo usar las herramientas MCP de Supabase para:
- Ver policies de RLS
- Verificar que las tablas permitan inserts
- Ejecutar queries de debug

### Opción 3: Probar Localmente

```bash
# En tu proyecto
npm run dev

# En otra terminal, actualizar variable de entorno en el bot
# Render.com → Tu bot → Environment → SAPIRA_API_URL
# Cambiar temporalmente a: https://tu-ngrok-url
```

## 📊 Próximos Pasos

1. **Aplicar Fix #1** (logs detallados) - Lo haré ahora
2. **Ver logs de Vercel** cuando crees el próximo ticket
3. **Compartir el error exacto** que aparece en los logs
4. **Aplicar la solución específica** según el error que encontremos

---

**¿Quieres que aplique el Fix #1 ahora?** Agregaré los logs detallados al endpoint para que veamos exactamente qué está fallando.

