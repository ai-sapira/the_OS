# 🧠 Bot de Teams con Conocimiento de Gonvarri

## 📋 Resumen

El bot de Teams ahora está **alimentado con conocimiento del CSV de Gonvarri** para que pueda inferir automáticamente:
- **Business Unit** (initiative_id) - Finance, Legal, HR, Sales, Procurement
- **Project** (project_id) - Pricing, Invoicing, Advisory, NPS, etc.

Esto significa que cuando el bot crea un ticket desde Teams, **ya viene con BU y Project asignados**, no como `null`.

---

## 🚀 Cambios Realizados

### 1️⃣ Nuevo Archivo: `gonvarri-knowledge.js`

**Ubicación:** `sapira-teams-bot/lib/gonvarri-knowledge.js`

Contiene:
- ✅ **Business Units** con keywords (ej: Finance → "invoice", "pricing", "billing")
- ✅ **Projects** con keywords (ej: Invoicing → "invoice", "billing", "payment")
- ✅ **Ejemplos reales del CSV** para que el bot aprenda patrones
- ✅ Funciones de inferencia: `inferBusinessUnit()` y `inferProject()`

**Ejemplo de cómo funciona:**
```javascript
// Usuario dice: "Quiero automatizar las facturas que llegan por email"
inferBusinessUnit("automatizar facturas email") // → "Finance"
inferProject("facturas email", "Finance")       // → "Invoicing"
```

---

### 2️⃣ Gemini Service Actualizado

**Cambios en:** `sapira-teams-bot/lib/gemini-service.js`

1. **Importa el conocimiento de Gonvarri:**
   ```javascript
   const { getGonvarriContext, inferBusinessUnit, inferProject } = require('./gonvarri-knowledge')
   ```

2. **Prompt mejorado con contexto:**
   - Incluye la lista de Business Units y Projects
   - Incluye ejemplos reales del CSV
   - Pide a Gemini que infiera BU y Project

3. **Genera business_unit y project:**
   ```javascript
   return {
     title: "...",
     business_unit: "Finance",  // ← NUEVO
     project: "Invoicing",      // ← NUEVO
     priority: "P2",
     // ... resto de campos
   }
   ```

---

### 3️⃣ Teams Integration con Mapeo Inteligente

**Cambios en:** `lib/api/teams-integration.ts`

Nuevas funciones privadas:
- `getInitiativeIdByName()` - Mapea "Finance" → UUID de Finance en BD
- `getProjectIdByName()` - Mapea "Invoicing" → UUID de Invoicing en BD

**Cuando llega un ticket desde Teams:**
```typescript
// 1. Bot infiere: business_unit: "Finance", project: "Invoicing"
// 2. TeamsIntegration busca en BD:
const initiative_id = await getInitiativeIdByName("Finance")  // → UUID
const project_id = await getProjectIdByName("Invoicing")      // → UUID

// 3. Crea el issue con IDs reales
const issue = await IssuesAPI.createIssue(organizationId, {
  title: "...",
  initiative_id: initiative_id,  // ✅ Ya viene asignado
  project_id: project_id,         // ✅ Ya viene asignado
  // ...
})
```

---

### 4️⃣ Actualizado conversation-manager.js

**Cambio en:** `sapira-teams-bot/lib/conversation-manager.js`

Ahora incluye `business_unit` y `project` en el payload al API:
```javascript
ai_analysis: {
  summary: proposal.description,
  business_unit: proposal.business_unit,  // ← NUEVO
  project: proposal.project,               // ← NUEVO
  priority: proposal.priority,
  // ...
}
```

---

## 🎯 Mapeo de Keywords

### Business Units

| Business Unit | Keywords |
|---------------|----------|
| **Finance** | pricing, invoice, invoicing, financial, fraud, debt, accounting, payment, receivable, payable, billing, consolidation |
| **Sales** | offer, proposal, bid, tender, customer, negotiation, crafter, sales, selling, rfp |
| **Legal** | contract, legal, compliance, advisory, regulatory, law, agreement, terms |
| **HR** | employee, talent, recruitment, onboarding, attrition, career, upskilling, sentiment, nps, human resources, retention |
| **Procurement** | supplier, procurement, purchasing, rfp, spend, acquisition, vendor, sourcing, buying |

### Projects

| Project | Keywords | Business Units |
|---------|----------|----------------|
| **Pricing** | pricing, discount, margin, price, cost | Finance |
| **Invoicing** | invoice, billing, payment, collection, receivable, payable | Finance |
| **Advisory** | contract, legal, compliance, advisory, consulting | Legal |
| **NPS** | employee, sentiment, satisfaction, nps, onboarding, chatbot | HR |
| **Negotiation** | negotiation, supplier, customer, deal, bargain | Procurement, Sales |
| **Operations** | operations, inquiry, handling, operational | Procurement |
| **Processing** | processing, automation, rpa, workflow, process | Sales, Procurement |
| **Upskilling** | career, training, upskilling, learning, development | HR |
| **Retention** | attrition, retention, turnover, quit, leave | HR |
| **Compliance** | compliance, regulatory, risk, audit, regulation | Legal |
| **Accounting** | accounting, financial, consolidation, ledger | Finance |
| **Reporting** | reporting, analytics, insight, dashboard, analysis | HR, Procurement, Finance |

---

## 🧪 Cómo Probar

### Paso 1: Limpiar la BD

```sql
-- Ejecuta en Supabase SQL Editor:
-- scripts/clean-gonvarri-issues.sql
```

Esto borra todos los issues existentes de Gonvarri para empezar limpio.

### Paso 2: Verificar Business Units y Projects en BD

```sql
-- Ver Business Units (initiatives)
SELECT id, name FROM initiatives 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- Ver Projects
SELECT id, name FROM projects 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';
```

**IMPORTANTE:** Asegúrate de que existen en tu BD:
- ✅ Finance (initiative)
- ✅ Legal (initiative)
- ✅ HR (initiative)
- ✅ Sales (initiative)
- ✅ Procurement (initiative)
- ✅ Pricing (project)
- ✅ Invoicing (project)
- ✅ Advisory (project)
- ✅ etc.

### Paso 3: Probar conversaciones en Teams

**Ejemplo 1: Finance + Invoicing**
```
Usuario: "Hola, quiero automatizar el procesamiento de facturas"
Bot: [conversación natural]
Usuario: "Nos llegan por email y tenemos que meterlas a mano en SAP"
Bot: [genera propuesta]
  ✅ Business Unit: Finance
  ✅ Project: Invoicing
  ✅ Tech: RPA + IDP
  ✅ Impact: Reduced repetitive tasks
```

**Ejemplo 2: Legal + Advisory**
```
Usuario: "Necesito un asistente para revisar contratos legales"
Bot: [conversación]
  ✅ Business Unit: Legal
  ✅ Project: Advisory
  ✅ Tech: IDP + GenAI
  ✅ Impact: Increased productivity
```

**Ejemplo 3: HR + NPS**
```
Usuario: "Queremos un chatbot para ayudar a los empleados"
Bot: [conversación]
  ✅ Business Unit: HR
  ✅ Project: NPS
  ✅ Tech: GenAI (Chatbot)
  ✅ Impact: Increased productivity
```

### Paso 4: Verificar en Triage

Ve a `/triage-new` y verás:
- ✅ Issue creado desde Teams
- ✅ **Business Unit ya asignado**
- ✅ **Project ya asignado** (si se pudo inferir)
- ✅ Sugerencias AI todavía funcionan (por si quieres cambiar)

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario conversa con bot en Teams                            │
│    "Quiero automatizar las facturas que llegan por email"       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Gemini analiza conversación con contexto de Gonvarri         │
│    - Detecta keywords: "facturas", "email", "automatizar"       │
│    - Infiere: Business Unit = Finance, Project = Invoicing      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Bot presenta propuesta con BU y Project                      │
│    📋 Automatización de procesamiento de facturas por email     │
│    🎯 BU: Finance, Project: Invoicing                           │
│    🏷️ Tech: RPA + IDP, Impact: Increased efficiency            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Usuario confirma                                             │
│    "Sí, perfecto"                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Bot llama a API /api/teams/create-issue                      │
│    Payload: { business_unit: "Finance", project: "Invoicing" }  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. TeamsIntegration mapea nombres → IDs                         │
│    "Finance" → busca en BD → UUID                               │
│    "Invoicing" → busca en BD → UUID                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Crea issue con IDs ya asignados                              │
│    initiative_id: UUID de Finance                               │
│    project_id: UUID de Invoicing                                │
│    state: 'triage'                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Issue aparece en /triage-new CON BU y Project asignados     │
│    ✅ Ya tiene Business Unit: Finance                           │
│    ✅ Ya tiene Project: Invoicing                               │
│    ✅ Sugerencias AI siguen disponibles por si quieres cambiar  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Ventajas del Nuevo Sistema

1. **Menos trabajo manual** - BU y Project vienen pre-asignados
2. **Más precisión** - Basado en keywords reales del CSV
3. **Fallback inteligente** - Si Gemini falla, usa inferencia de keywords
4. **Sugerencias todavía disponibles** - Puedes cambiar en triage si es necesario
5. **Aprendizaje continuo** - Fácil añadir más keywords al archivo de conocimiento

---

## 🔧 Mantenimiento

### Añadir nuevos keywords

Edita `sapira-teams-bot/lib/gonvarri-knowledge.js`:

```javascript
const BUSINESS_UNITS = {
  'Finance': {
    keywords: ['pricing', 'invoice', 'NUEVA_KEYWORD'],
    // ...
  }
}
```

### Añadir nuevos Projects

```javascript
const PROJECTS = {
  'NuevoProject': {
    keywords: ['keyword1', 'keyword2'],
    business_units: ['Finance']
  }
}
```

### Añadir ejemplos del CSV

```javascript
const EXAMPLE_INITIATIVES = [
  {
    number: XX,
    title: 'Nuevo Ejemplo',
    businessUnit: 'Finance',
    project: 'Invoicing',
    shortDescription: '...',
    impact: 'Reduced costs',
    coreTechnology: 'RPA + IDP'
  }
]
```

---

## 📝 Archivos Modificados

1. ✅ `sapira-teams-bot/lib/gonvarri-knowledge.js` (NUEVO)
2. ✅ `sapira-teams-bot/lib/gemini-service.js` (actualizado)
3. ✅ `sapira-teams-bot/lib/conversation-manager.js` (actualizado)
4. ✅ `lib/api/teams-integration.ts` (actualizado)
5. ✅ `scripts/clean-gonvarri-issues.sql` (NUEVO)

---

## 🎯 Próximos Pasos

1. Limpia la BD con el script SQL
2. Verifica que existan los Business Units y Projects en Supabase
3. Prueba conversaciones en Teams
4. Verifica en /triage-new que los issues vienen con BU y Project asignados

¿Listo para probar? 🚀

