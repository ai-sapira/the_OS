# Sistema de Conversaciones Multi-Thread con Slack

## Resumen Ejecutivo

Este documento describe el diseño para implementar un sistema de conversaciones basado en threads donde:
1. Cada conversación es un thread independiente (vinculado a un `slack_thread_ts`)
2. Los usuarios pueden navegar entre conversaciones fácilmente
3. Los mensajes de Slack llegan en tiempo real a la plataforma

---

## Parte 1: Arquitectura de Threads/Conversaciones

### Estado Actual

```
┌─────────────────────────────────────────────────────────────┐
│                    fde_messages                              │
├─────────────────────────────────────────────────────────────┤
│ - Todos los mensajes de una org en una lista plana          │
│ - slack_thread_ts existe pero no se usa para agrupar        │
│ - Una sola "conversación" por organización                   │
└─────────────────────────────────────────────────────────────┘
```

### Diseño Propuesto

```
┌────────────────────────────────────────────────────────────────────┐
│                        fde_conversations                            │
├────────────────────────────────────────────────────────────────────┤
│ id               │ UUID primary key                                │
│ organization_id  │ FK -> organizations                              │
│ slack_thread_ts  │ Unique per org (timestamp del primer mensaje)   │
│ slack_channel_id │ Canal de Slack asociado                          │
│ title            │ Título auto-generado o manual                    │
│ status           │ 'active' | 'resolved' | 'archived'               │
│ created_by       │ FK -> users (quien inició)                       │
│ created_at       │ timestamp                                        │
│ updated_at       │ timestamp (actualizado en cada mensaje)          │
│ last_message     │ Contenido del último mensaje (preview)           │
│ last_message_at  │ timestamp del último mensaje                     │
│ unread_count     │ Contador de mensajes no leídos                   │
│ participant_ids  │ Array de user IDs participantes                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                        fde_messages (actualizada)                   │
├────────────────────────────────────────────────────────────────────┤
│ id               │ UUID primary key                                │
│ conversation_id  │ FK -> fde_conversations (NUEVO)                  │
│ organization_id  │ FK -> organizations                              │
│ slack_message_ts │ ID único del mensaje en Slack                   │
│ sender_type      │ 'user' | 'fde' | 'system'                        │
│ sender_user_id   │ FK -> users (null si es FDE)                    │
│ sender_name      │ Nombre del remitente                             │
│ sender_avatar_url│ Avatar (de Slack si es FDE)                      │
│ content          │ Contenido del mensaje                            │
│ attachments      │ JSONB de archivos adjuntos                       │
│ is_read          │ Boolean                                          │
│ created_at       │ timestamp                                        │
└────────────────────────────────────────────────────────────────────┘
```

### Flujo de Conversaciones

```
Usuario inicia nueva conversación:
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  1. Usuario escribe primer mensaje                                    │
│                    ↓                                                  │
│  2. Se crea fde_conversation con:                                     │
│     - title = "Nueva consulta" o extraído del mensaje                │
│     - status = 'active'                                               │
│     - slack_thread_ts = null (pendiente)                              │
│                    ↓                                                  │
│  3. Se envía a Slack → Slack devuelve thread_ts                       │
│                    ↓                                                  │
│  4. Se actualiza fde_conversation.slack_thread_ts                     │
│                    ↓                                                  │
│  5. Mensaje se guarda con conversation_id                             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

FDE responde desde Slack:
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  1. Slack envía evento message a /api/slack/webhook                  │
│                    ↓                                                  │
│  2. Buscamos conversation por thread_ts                               │
│                    ↓                                                  │
│  3. Si existe → Agregamos mensaje a esa conversación                 │
│     Si no existe (mensaje fuera de thread) → Creamos nueva           │
│                    ↓                                                  │
│  4. Actualizamos last_message, last_message_at, unread_count         │
│                    ↓                                                  │
│  5. Supabase Realtime notifica al cliente                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Parte 2: Recepción de Mensajes desde Slack (Events API)

### Configuración Actual ✅

Ya tenemos configurado:
1. **Manifest de Slack** (`slack-app-manifest.json`):
   - `message.channels` - Mensajes en canales públicos
   - `message.groups` - Mensajes en canales privados
   - `message.im` - Mensajes directos
   - `message.mpim` - Mensajes en grupos

2. **Webhook endpoint** (`/api/slack/webhook/route.ts`):
   - Verificación de URL ✅
   - Verificación de firma ✅
   - Procesamiento de eventos ✅

### Lo que Necesitamos Mejorar

```typescript
// Evento de mensaje de Slack
{
  "type": "event_callback",
  "event": {
    "type": "message",
    "user": "U12345678",           // ID de usuario Slack
    "text": "Respuesta del FDE",   // Contenido
    "ts": "1234567890.123456",     // ID único del mensaje
    "thread_ts": "1234567890.000001", // ID del thread (si aplica)
    "channel": "C12345678"         // Canal
  }
}
```

### Mejoras Propuestas al Webhook

```typescript
// /api/slack/webhook/route.ts - MEJORADO

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // URL verification
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Verify signature
    if (!verifySlackSignature({ signature, timestamp, body: rawBody })) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle message events
    if (body.type === 'event_callback' && body.event.type === 'message') {
      const event = body.event;
      
      // Ignore bot messages
      if (event.bot_id || event.subtype) {
        return NextResponse.json({ ok: true });
      }

      // Key info
      const {
        channel: channelId,
        ts: messageTs,
        thread_ts: threadTs,
        user: slackUserId,
        text
      } = event;

      // 1. Find organization by channel
      const org = await findOrgBySlackChannel(channelId);
      if (!org) return NextResponse.json({ ok: true });

      // 2. Find or create conversation by thread_ts
      const effectiveThreadTs = threadTs || messageTs; // Use message ts if new thread
      let conversation = await findConversationByThreadTs(org.id, effectiveThreadTs);
      
      if (!conversation && !threadTs) {
        // New message not in a thread - might be start of new conversation
        // Only create if it's a reply to our bot OR meets certain criteria
        conversation = await createConversation({
          organization_id: org.id,
          slack_thread_ts: messageTs,
          slack_channel_id: channelId,
          title: `Conversación ${new Date().toLocaleDateString()}`,
          status: 'active',
        });
      }

      if (!conversation) {
        // Message is outside our tracked conversations
        return NextResponse.json({ ok: true });
      }

      // 3. Get Slack user info
      const userInfo = await getSlackUserInfo(slackUserId);

      // 4. Save message
      await saveMessage({
        conversation_id: conversation.id,
        organization_id: org.id,
        slack_message_ts: messageTs,
        sender_type: 'fde',
        sender_name: userInfo?.real_name || 'Sapira Team',
        sender_avatar_url: userInfo?.profile?.image_72,
        content: text,
      });

      // 5. Update conversation metadata
      await updateConversation(conversation.id, {
        last_message: text.substring(0, 100),
        last_message_at: new Date().toISOString(),
        unread_count: conversation.unread_count + 1,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Requisitos de Slack App

Para que funcione correctamente, asegúrate de:

1. **Event Subscriptions habilitadas** en api.slack.com
2. **Request URL** configurada: `https://tu-dominio.com/api/slack/webhook`
3. **Bot Events suscritos**:
   - `message.channels`
   - `message.groups`
   - `message.im`
   - `message.mpim`

4. **OAuth Scopes del Bot**:
   - `channels:history` - Leer mensajes en canales públicos
   - `groups:history` - Leer mensajes en canales privados
   - `chat:write` - Enviar mensajes
   - `users:read` - Obtener info de usuarios

5. **El bot debe estar en el canal** para recibir eventos

---

## Parte 3: Diseño de UI - Lista de Conversaciones

### Layout Propuesto

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │   CONVERSACIONES       │  │              CHAT ACTIVO                │ │
│  │                        │  │                                          │ │
│  │  + Nueva conversación  │  │  ┌──────────────────────────────────┐   │ │
│  │                        │  │  │  Pablo Senabre · Sapira Team     │   │ │
│  │  ┌──────────────────┐  │  │  │  "Consulta sobre integración"   │   │ │
│  │  │ 🟢 Soporte API   │  │  │  └──────────────────────────────────┘   │ │
│  │  │ Pablo: Perfecto! │  │  │                                          │ │
│  │  │ hace 2 min       │  │  │  ┌─ USER ─────────────────────────────┐ │ │
│  │  └──────────────────┘  │  │  │ Hola, tengo una duda sobre la API  │ │ │
│  │                        │  │  └────────────────────────────────────┘ │ │
│  │  ┌──────────────────┐  │  │                                          │ │
│  │  │ 🔵 Facturación   │  │  │  ┌─ FDE ──────────────────────────────┐ │ │
│  │  │ Ana: Te envío... │  │  │  │ ¡Claro! ¿Qué necesitas saber?     │ │ │
│  │  │ ayer             │  │  │  └────────────────────────────────────┘ │ │
│  │  └──────────────────┘  │  │                                          │ │
│  │                        │  │  ┌─ USER ─────────────────────────────┐ │ │
│  │  ┌──────────────────┐  │  │  │ Sobre el rate limit del endpoint  │ │ │
│  │  │ ✅ Onboarding    │  │  │  └────────────────────────────────────┘ │ │
│  │  │ Completado       │  │  │                                          │ │
│  │  │ 15 dic           │  │  │  ──────────────────────────────────────  │ │
│  │  └──────────────────┘  │  │  [ Escribe un mensaje...          📎 ] │ │
│  │                        │  │                                          │ │
│  └────────────────────────┘  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Componentes Necesarios

```typescript
// 1. ConversationList - Panel izquierdo
interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

// 2. ConversationItem - Cada fila en la lista
interface ConversationItemProps {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}

// 3. ChatPanel - Panel derecho con mensajes
interface ChatPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

// 4. ConversationHeader - Info de la conversación activa
interface ConversationHeaderProps {
  conversation: Conversation;
  fdeInfo: FDEInfo;
}
```

### Estados de Conversación

```typescript
type ConversationStatus = 
  | 'active'     // 🟢 Conversación abierta
  | 'pending'    // 🟡 Esperando respuesta del FDE
  | 'resolved'   // ✅ Marcada como resuelta
  | 'archived';  // 📦 Archivada

// Visual indicators
const statusIndicators = {
  active: { color: 'emerald', icon: Circle, label: 'Activa' },
  pending: { color: 'amber', icon: Clock, label: 'Pendiente' },
  resolved: { color: 'slate', icon: CheckCircle, label: 'Resuelta' },
  archived: { color: 'gray', icon: Archive, label: 'Archivada' },
};
```

---

## Parte 4: Migración de Datos

### Script de Migración SQL

```sql
-- 1. Crear tabla de conversaciones
CREATE TABLE IF NOT EXISTS fde_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slack_thread_ts VARCHAR(50),
  slack_channel_id VARCHAR(50),
  title VARCHAR(255) DEFAULT 'Nueva conversación',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'resolved', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  participant_ids UUID[] DEFAULT '{}'
);

-- 2. Índices
CREATE INDEX idx_fde_conversations_org ON fde_conversations(organization_id);
CREATE INDEX idx_fde_conversations_thread ON fde_conversations(slack_thread_ts);
CREATE INDEX idx_fde_conversations_status ON fde_conversations(status);
CREATE UNIQUE INDEX idx_fde_conversations_org_thread ON fde_conversations(organization_id, slack_thread_ts) WHERE slack_thread_ts IS NOT NULL;

-- 3. Agregar FK a fde_messages
ALTER TABLE fde_messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES fde_conversations(id) ON DELETE CASCADE;

-- 4. Migrar datos existentes: crear una conversación por cada thread único
INSERT INTO fde_conversations (organization_id, slack_thread_ts, slack_channel_id, title, created_at, last_message, last_message_at)
SELECT DISTINCT ON (organization_id, COALESCE(slack_thread_ts, id::text))
  organization_id,
  slack_thread_ts,
  slack_channel_id,
  COALESCE('Conversación de ' || TO_CHAR(MIN(created_at), 'DD Mon YYYY'), 'Conversación') as title,
  MIN(created_at) as created_at,
  (SELECT content FROM fde_messages m2 WHERE m2.organization_id = fde_messages.organization_id AND COALESCE(m2.slack_thread_ts, m2.id::text) = COALESCE(fde_messages.slack_thread_ts, fde_messages.id::text) ORDER BY created_at DESC LIMIT 1) as last_message,
  MAX(created_at) as last_message_at
FROM fde_messages
GROUP BY organization_id, COALESCE(slack_thread_ts, id::text), slack_channel_id;

-- 5. Actualizar mensajes existentes con conversation_id
UPDATE fde_messages SET conversation_id = c.id
FROM fde_conversations c
WHERE fde_messages.organization_id = c.organization_id
  AND COALESCE(fde_messages.slack_thread_ts, fde_messages.id::text) = COALESCE(c.slack_thread_ts, '');

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_fde_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fde_conversations_updated_at
  BEFORE UPDATE ON fde_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_fde_conversations_updated_at();

-- 7. RLS Policies
ALTER TABLE fde_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY fde_conversations_org_access ON fde_conversations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );
```

---

## Parte 5: Real-time Updates

### Configuración de Supabase Realtime

```typescript
// En el componente de chat
useEffect(() => {
  if (!currentOrg?.organization?.id) return;

  // Subscribe to new messages in ALL conversations for this org
  const messagesChannel = supabase
    .channel('fde_messages_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'fde_messages',
        filter: `organization_id=eq.${currentOrg.organization.id}`,
      },
      (payload) => {
        const newMsg = payload.new as Message;
        
        // If message is in current conversation, add to list
        if (newMsg.conversation_id === selectedConversationId) {
          setMessages(prev => [...prev, newMsg]);
        }
        
        // Update conversation list (unread count, last message)
        setConversations(prev => prev.map(c => 
          c.id === newMsg.conversation_id
            ? {
                ...c,
                last_message: newMsg.content,
                last_message_at: newMsg.created_at,
                unread_count: c.id !== selectedConversationId ? c.unread_count + 1 : c.unread_count,
              }
            : c
        ));
      }
    )
    .subscribe();

  // Subscribe to conversation updates (status changes, etc.)
  const conversationsChannel = supabase
    .channel('fde_conversations_realtime')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'fde_conversations',
        filter: `organization_id=eq.${currentOrg.organization.id}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new as Conversation, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev => prev.map(c =>
            c.id === payload.new.id ? { ...c, ...payload.new } : c
          ));
        } else if (payload.eventType === 'DELETE') {
          setConversations(prev => prev.filter(c => c.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(messagesChannel);
    supabase.removeChannel(conversationsChannel);
  };
}, [currentOrg?.organization?.id, selectedConversationId]);
```

---

## Parte 6: Checklist de Implementación

### Backend
- [ ] Crear migración para `fde_conversations`
- [ ] Actualizar migración de `fde_messages` con `conversation_id`
- [ ] Migrar datos existentes
- [ ] Actualizar `/api/slack/webhook` para manejar threads
- [ ] Actualizar `/api/slack/send` para crear/usar conversaciones
- [ ] Añadir endpoints para CRUD de conversaciones
- [ ] Configurar RLS policies
- [ ] Habilitar Realtime en ambas tablas

### Frontend
- [ ] Crear componente `ConversationList`
- [ ] Crear componente `ConversationItem`
- [ ] Actualizar `ChatPanel` para recibir `conversation`
- [ ] Implementar navegación entre conversaciones
- [ ] Añadir indicadores de unread
- [ ] Añadir estados visuales (active, pending, resolved)
- [ ] Implementar "Nueva conversación"
- [ ] Implementar "Marcar como resuelta"

### Slack
- [ ] Verificar que el bot está en el canal
- [ ] Verificar Event Subscriptions
- [ ] Probar recepción de mensajes
- [ ] Probar threads/replies

---

## Próximos Pasos Recomendados

1. **Fase 1**: Crear tabla `fde_conversations` y migrar datos
2. **Fase 2**: Actualizar webhook para manejar threads correctamente
3. **Fase 3**: Implementar UI de lista de conversaciones
4. **Fase 4**: Conectar real-time y probar flujo completo
5. **Fase 5**: Pulir UX (marcar leído, estados, filtros)

