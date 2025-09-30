# 🚀 Deploy Completo - Vercel + Render

Se necesitan **DOS deploys** para que el sistema completo funcione:

1. ✅ **Proyecto Principal (Next.js)** → Vercel
2. ✅ **Bot de Teams** → Render

---

## 📦 DEPLOY 1: Proyecto Principal (Vercel)

### Archivos Modificados:

**API (crítico para bot):**
- ✅ `lib/api/teams-integration.ts` - Acepta campos de Gonvarri
- ✅ `lib/api/issues.ts` - CreateIssueData actualizada
- ✅ `lib/database/types.ts` - Tipos con nuevos campos

**UI y Vistas:**
- `app/triage-new/page.tsx` - Triage actualizado
- `app/initiatives/[slug]/page.tsx` - Vista de initiatives
- `components/new-issue-modal.tsx` - Modal nuevo
- `components/ui/modal/accept-issue-modal.tsx` - Modal de aceptación
- Otros componentes UI

**Base de Datos:**
- `supabase/migrations/add_gonvarri_fields_to_issues.sql` - Nuevos campos

**Documentación:**
- `AGENT_GONVARRI_UPDATE.md`
- `DEPLOY_BOT_INSTRUCTIONS.md`
- `VERCEL_DEPLOY_COMMIT.txt`
- Otros docs

### Comandos:

```bash
# En la raíz del proyecto
cd /Users/pablosenabre/Sapira/the_OS

# 1. Añadir archivos críticos del API
git add lib/api/teams-integration.ts lib/api/issues.ts lib/database/types.ts

# 2. Añadir migración de BD
git add supabase/migrations/add_gonvarri_fields_to_issues.sql

# 3. Añadir vistas y componentes
git add app/triage-new/page.tsx app/initiatives/[slug]/page.tsx
git add components/new-issue-modal.tsx components/new-project-modal.tsx
git add components/ui/modal/accept-issue-modal.tsx

# 4. Añadir documentación
git add AGENT_GONVARRI_UPDATE.md DEPLOY_BOT_INSTRUCTIONS.md VERCEL_DEPLOY_COMMIT.txt
git add GONVARRI_CHANGES_SUMMARY.md ROADMAP_STRATEGY.md

# 5. Añadir otros archivos modificados
git add app/issues/[id]/ app/issues/page.tsx app/roadmap/page.tsx
git add lib/database/MODEL.md

# 6. Commit
git commit -F VERCEL_DEPLOY_COMMIT.txt

# 7. Push - Vercel redesplegará automáticamente
git push origin main
```

### Verificación:
```bash
# Después del deploy, verifica la migración de BD
# En Supabase SQL Editor, ejecuta:
# SELECT column_name FROM information_schema.columns 
# WHERE table_name = 'issues' AND column_name IN ('short_description', 'impact', 'core_technology');
```

---

## 📦 DEPLOY 2: Bot de Teams (Render)

### Archivos Modificados:

**JavaScript (producción):**
- ✅ `lib/gemini-service.js` - Prompts actualizados
- ✅ `lib/conversation-manager.js` - Nuevos campos

**TypeScript (versión moderna):**
- ✅ `bot/types.ts` - Tipos actualizados
- ✅ `bot/gemini.service.ts` - Lógica actualizada
- ✅ `bot/ticket-creation.service.ts` - Creación con campos
- ✅ `bot/adaptive-cards.ts` - UI para initiatives

**Documentación:**
- ✅ `COMMIT_MESSAGE.txt` - Mensaje preparado
- ✅ `DEPLOYMENT_GONVARRI.md` - Guía de deploy

### Comandos:

```bash
# Ir a la carpeta del bot
cd sapira-teams-bot

# 1. Añadir archivos JavaScript (usados en producción)
git add lib/gemini-service.js lib/conversation-manager.js

# 2. Añadir archivos TypeScript
git add bot/types.ts bot/gemini.service.ts bot/ticket-creation.service.ts bot/adaptive-cards.ts

# 3. Añadir guías y ejemplos
git add bot/gonvarri-examples.json bot/gonvarri-triage-guide.md

# 4. Añadir documentación
git add COMMIT_MESSAGE.txt DEPLOYMENT_GONVARRI.md

# 5. Commit
git commit -F COMMIT_MESSAGE.txt

# 6. Push - Render redesplegará automáticamente
git push origin main

# 7. Volver a la raíz
cd ..
```

### Verificación:
```bash
# Health check del bot
curl https://your-bot-domain.onrender.com/health

# Debería responder:
# {"status":"healthy","message":"Sapira Teams Bot is running"}
```

---

## 🔄 Orden Recomendado

### Opción A: Deploy Secuencial (Más Seguro)

1. **Primero: Vercel** (API lista para recibir nuevos campos)
   - Ejecuta deploy 1
   - Espera confirmación en Vercel
   - Verifica que la migración de BD se ejecutó

2. **Segundo: Render** (Bot envía nuevos campos)
   - Ejecuta deploy 2
   - Espera confirmación en Render
   - Prueba conversación end-to-end

### Opción B: Deploy Paralelo (Más Rápido)

```bash
# Terminal 1: Deploy Vercel
cd /Users/pablosenabre/Sapira/the_OS
# ... comandos del deploy 1

# Terminal 2: Deploy Render (en paralelo)
cd /Users/pablosenabre/Sapira/the_OS/sapira-teams-bot
# ... comandos del deploy 2
```

---

## 🧪 Testing End-to-End

Después de ambos deploys:

### 1. Test en Teams

```
Usuario: "Quiero automatizar la detección de fraude en facturas"

Bot: "¿Qué tecnología consideras usar?"

Usuario: "IA predictiva con procesamiento de documentos"

Bot: [Genera tarjeta con]:
     - Título: FraudFinder AI
     - Tecnología: IDP + Predictive AI
     - Complejidad: 3/3
     - Impacto Negocio: 3/3
     - Prioridad: P0

Usuario: [Click en "✅ Crear initiative"]

Bot: "✅ Initiative creada: GON-XXX"
```

### 2. Verificar en Triage

1. Ir a: `https://your-domain.vercel.app/triage-new`
2. Buscar la initiative creada
3. Verificar que muestra:
   - ✅ `short_description`
   - ✅ `impact`
   - ✅ `core_technology`
   - ✅ Prioridad calculada correctamente

### 3. Verificar en Base de Datos

```sql
-- En Supabase SQL Editor
SELECT 
  key, 
  title, 
  short_description, 
  impact, 
  core_technology,
  priority,
  origin
FROM issues 
WHERE origin = 'teams'
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📊 Resumen de Cambios

| Componente | Cambio | Deploy |
|------------|--------|--------|
| **API** | Acepta campos de Gonvarri | Vercel ✅ |
| **Base de Datos** | Columnas nuevas | Vercel ✅ |
| **Bot - Prompts** | Initiatives en vez de tickets | Render ✅ |
| **Bot - Campos** | Genera campos Gonvarri | Render ✅ |
| **UI - Triage** | Muestra nuevos campos | Vercel ✅ |
| **UI - Tarjetas** | Tarjetas de initiatives | Render ✅ |

---

## ⚠️ Migración de Base de Datos

**IMPORTANTE:** La primera vez que se despliegue a Vercel, ejecutar manualmente la migración:

```sql
-- En Supabase SQL Editor
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS impact TEXT,
ADD COLUMN IF NOT EXISTS core_technology TEXT;
```

O usar el archivo de migración:
```bash
# Contenido en: supabase/migrations/add_gonvarri_fields_to_issues.sql
```

---

## 🔄 Rollback

Si algo falla:

### Rollback Vercel:
```bash
cd /Users/pablosenabre/Sapira/the_OS
git log --oneline -5
git revert HEAD
git push origin main
```

### Rollback Render:
```bash
cd sapira-teams-bot
git log --oneline -5
git revert HEAD
git push origin main
```

---

## ✅ Checklist Completo

### Pre-Deploy:
- [ ] Migración de BD revisada
- [ ] Variables de entorno en Vercel verificadas
- [ ] Variables de entorno en Render verificadas
- [ ] Commits anteriores anotados (para rollback)

### Deploy Vercel:
- [ ] Archivos del API añadidos
- [ ] Migración de BD añadida
- [ ] Commit y push ejecutados
- [ ] Deploy completado en Vercel
- [ ] Migración de BD ejecutada
- [ ] Health check OK

### Deploy Render:
- [ ] Archivos del bot añadidos
- [ ] Commit y push ejecutados
- [ ] Deploy completado en Render
- [ ] Health check OK

### Testing:
- [ ] Conversación de prueba en Teams exitosa
- [ ] Tarjeta adaptativa muestra campos correctos
- [ ] Initiative creada en BD
- [ ] Initiative visible en triage
- [ ] Campos de Gonvarri presentes

---

## 🎉 ¡Todo Listo!

Una vez completados ambos deploys, el sistema completo estará funcionando con la estructura de Gonvarri.

**Dashboards:**
- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com
- Supabase: https://supabase.com/dashboard
