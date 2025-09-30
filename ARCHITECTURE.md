# 🏗️ Arquitectura del Sistema Sapira

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│  ┌─────────────┐              ┌──────────────┐                 │
│  │   Teams     │              │   Browser    │                 │
│  │  (Cliente)  │              │   (Web UI)   │                 │
│  └──────┬──────┘              └──────┬───────┘                 │
└─────────┼─────────────────────────────┼──────────────────────────┘
          │                             │
          │                             │
          ▼                             ▼
┌─────────────────────┐      ┌──────────────────────────┐
│   BOT de TEAMS      │      │   APLICACIÓN NEXT.JS     │
│   (Render.com)      │      │   (Vercel)               │
│                     │      │                          │
│  Repo separado:     │      │  Repo principal:         │
│  sapira-teams-bot/  │◄─────┤  the_OS/                 │
│                     │ API  │                          │
│  - server.js        │calls │  - API Routes            │
│  - Bot Framework    │      │  - Frontend React        │
│  - Gemini AI        │      │  - Triage UI             │
└──────────┬──────────┘      └──────────┬───────────────┘
           │                            │
           │                            │
           └────────────┬───────────────┘
                        ▼
                ┌───────────────┐
                │   SUPABASE    │
                │  (Database)   │
                │               │
                │  - issues     │
                │  - issue_links│
                │  - activities │
                └───────────────┘
```

---

## 🔧 Componentes del Sistema

### 1️⃣ **Bot de Teams** (Render)

**Repositorio:** `sapira-teams-bot/` (repositorio SEPARADO)

**URL de Deploy:** https://render.com → Tu servicio del bot

**Qué hace:**
- ✅ Recibe mensajes de Microsoft Teams
- ✅ Analiza conversaciones con Gemini AI
- ✅ Propone tickets al usuario
- ✅ **Llama a la API de Vercel** para crear el issue

**Código principal:**
```
sapira-teams-bot/
├── server.js              ← Servidor del bot
├── lib/
│   ├── conversation-manager.js  ← Crea tickets vía API
│   └── gemini-service.js        ← Análisis con AI
└── package.json
```

**Variables de entorno importantes:**
```bash
MICROSOFT_APP_ID=...           # Credenciales del bot
MICROSOFT_APP_PASSWORD=...
SAPIRA_API_URL=https://v0-internal-os-build.vercel.app  ← Llama AQUÍ
```

---

### 2️⃣ **Aplicación Next.js** (Vercel)

**Repositorio:** `the_OS/` (repositorio PRINCIPAL)

**URL de Deploy:** https://v0-internal-os-build.vercel.app

**Qué hace:**
- ✅ UI de triage, proyectos, iniciativas
- ✅ API endpoints para crear/actualizar issues
- ✅ Envía mensajes proactivos a Teams
- ✅ Frontend React + API Routes

**Código principal:**
```
the_OS/
├── app/
│   ├── triage-new/page.tsx          ← UI de triage
│   ├── api/
│   │   ├── teams/
│   │   │   ├── create-issue/route.ts  ← Bot llama AQUÍ
│   │   │   └── send-message/route.ts  ← Envía a Teams
│   └── ...
├── lib/
│   ├── api/
│   │   ├── teams-integration.ts       ← Crea issues de Teams
│   │   ├── teams-messenger.ts         ← Envía notificaciones
│   │   └── issues.ts                  ← CRUD de issues
└── components/
    └── ui/modal/accept-issue-modal.tsx
```

**Variables de entorno importantes:**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MICROSOFT_APP_ID=...              # Para enviar mensajes
MICROSOFT_APP_PASSWORD=...
```

---

### 3️⃣ **Supabase** (Base de Datos)

**URL:** https://iaazpsvjiltlkhyeakmx.supabase.co

**Tablas clave:**
```sql
issues
├── id, key, title, description
├── state, priority
├── initiative_id, project_id
└── origin ('teams', 'email', etc.)

issue_links
├── issue_id
├── provider ('teams')
├── external_id
└── teams_context (JSONB) ← ConversationReference para notificaciones

issue_activity
└── Historial de cambios
```

---

## 🔄 Flujo Completo: Crear Issue desde Teams

### **Paso 1: Usuario reporta en Teams**
```
Usuario en Teams → "Tengo un problema con X"
         ↓
Bot en Render (server.js)
```

### **Paso 2: Bot analiza con IA**
```
Bot (Render)
  ├── Recibe mensajes
  ├── Gemini AI analiza
  └── Propone ticket
         ↓
Usuario confirma "Sí"
```

### **Paso 3: Bot llama a API de Vercel**
```
Bot (Render)
  POST → https://v0-internal-os-build.vercel.app/api/teams/create-issue
  
  Body: {
    conversation_id: "...",
    ai_analysis: {...},
    conversation_reference: {    ← 🔑 CLAVE para notificaciones
      serviceUrl: "...",
      channelId: "...",
      user: {...},
      bot: {...}
    }
  }
```

### **Paso 4: Vercel crea el issue**
```
Vercel (app/api/teams/create-issue/route.ts)
  ├── Valida request
  ├── Llama TeamsIntegration.createIssueFromTeamsConversation()
  │   ├── Crea issue en Supabase
  │   └── Guarda teams_context en issue_links  ← Para notificaciones
  └── Devuelve issue_id, issue_key
```

### **Paso 5: Bot responde al usuario**
```
Bot (Render)
  ← Recibe issue_key de Vercel
  → Envía a Teams: "✅ Ticket SAP-19 creado!"
```

---

## 🔄 Flujo: Notificar Usuario en Teams (Triage)

### **Paso 1: Usuario hace triage en Web UI**
```
Usuario en Browser → Vercel (app/triage-new/page.tsx)
  ├── Selecciona issue
  ├── Click "Accept"
  ├── Rellena modal
  └── Confirma
```

### **Paso 2: Frontend llama a API**
```
Frontend (hooks/use-supabase-data.ts)
  POST → /api/teams/send-message
  
  Body: {
    issue_id: "...",
    message: "✅ Tu issue ha sido aceptado...",
    message_type: "status_update"
  }
```

### **Paso 3: Backend busca teams_context**
```
Vercel (app/api/teams/send-message/route.ts)
  ├── Llama TeamsMessenger.sendMessageToIssue()
  │   ├── Busca teams_context en issue_links  ← De aquí saca datos
  │   ├── Obtiene token de Microsoft
  │   └── POST a Teams Bot Framework API
  └── Mensaje llega a Teams del usuario! 🎉
```

---

## 🚀 Deployments

### **Render (Bot de Teams)**
```bash
# Repositorio separado
cd sapira-teams-bot/

# Deploy manual
git add -A
git commit -m "Update bot"
git push origin main  # Render auto-despliega

# O usar script
./deploy.sh
```

**URL del servicio:** https://dashboard.render.com → sapira-teams-bot

---

### **Vercel (App Next.js)**
```bash
# Repositorio principal
cd the_OS/

# Deploy automático al pushear
git add -A
git commit -m "Update app"
git push origin main  # Vercel auto-despliega

# O deploy manual
vercel --prod
```

**URL del proyecto:** https://vercel.com/dashboard → v0-internal-os-build

---

## 📋 Checklist de Deployment

### ✅ **Cuando cambias el BOT:**
- [ ] Edita archivos en `sapira-teams-bot/`
- [ ] Commitea y pushea al repo del bot
- [ ] Verifica en Render Dashboard que deployó
- [ ] NO necesitas tocar Vercel

### ✅ **Cuando cambias la APP:**
- [ ] Edita archivos en `the_OS/`
- [ ] Commitea y pushea al repo principal
- [ ] Verifica en Vercel Dashboard que deployó
- [ ] NO necesitas tocar Render

### ✅ **Cuando cambias la BD:**
- [ ] Crea migración en `supabase/migrations/`
- [ ] Aplica con `mcp_supabase_apply_migration`
- [ ] Actualiza types: `npx supabase gen types typescript --project-id iaazpsvjiltlkhyeakmx`
- [ ] Commitea los cambios

---

## 🔑 Variables de Entorno Críticas

### **Render (Bot)**
```bash
MICROSOFT_APP_ID=xxx
MICROSOFT_APP_PASSWORD=xxx
SAPIRA_API_URL=https://v0-internal-os-build.vercel.app  ← Apunta a Vercel
GEMINI_API_KEY=xxx
```

### **Vercel (App)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://iaazpsvjiltlkhyeakmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
MICROSOFT_APP_ID=xxx                # Para ENVIAR mensajes
MICROSOFT_APP_PASSWORD=xxx
NEXT_PUBLIC_BASE_URL=https://v0-internal-os-build.vercel.app
```

---

## ❓ FAQ

### **¿Por qué están separados?**
- El bot necesita estar **siempre corriendo** para recibir mensajes de Teams
- Render es mejor para servicios Node.js de larga duración
- Vercel es mejor para aplicaciones Next.js con edge functions

### **¿El bot necesita acceso a Supabase?**
- **NO directamente**
- El bot solo llama a `/api/teams/create-issue` en Vercel
- Vercel (la app) se encarga de escribir en Supabase

### **¿Cómo se comunican?**
```
Bot (Render) → HTTP POST → App (Vercel) → Supabase
                              ↓
                           HTTP POST → Teams API
```

### **¿Qué pasa si Vercel está caído?**
- Bot recibe mensaje
- Intenta llamar a Vercel
- Falla (error 500)
- Cae en "mock ticket creation"
- **Issue NO se crea en la BD**

### **¿Qué pasa si Render está caído?**
- Teams no puede enviar mensajes al bot
- Usuario no puede crear issues desde Teams
- **Pero la app web sigue funcionando normalmente**

---

## 🐛 Debugging

### **Issue no tiene teams_context**
1. ✅ Verifica que el bot esté actualizado en Render
2. ✅ Verifica que Vercel tenga el código nuevo
3. ✅ Verifica que `SAPIRA_API_URL` apunte a Vercel
4. ✅ Crea un issue NUEVO desde Teams

### **Notificación no llega a Teams**
1. ✅ Verifica que el issue tenga `teams_context`:
   ```sql
   SELECT teams_context FROM issue_links WHERE issue_id = '...';
   ```
2. ✅ Verifica que `MICROSOFT_APP_ID` esté en Vercel
3. ✅ Revisa logs de `/api/teams/send-message`

---

## 📊 Estado Actual (Después del Push)

| Componente | Repo | Deploy | Estado |
|------------|------|--------|--------|
| Bot Teams | `sapira-teams-bot` | Render | ✅ Actualizado (commit 2a6f514) |
| App Next.js | `the_OS` | Vercel | 🔄 Desplegando (commit 5cf4a79) |
| Base de Datos | - | Supabase | ✅ Migración aplicada |

**Próximo paso:** Esperar que Vercel termine de deployar (~2-5 min)
