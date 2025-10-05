# ✅ Formato de Issues Actualizado

## 🎯 Cambios Aplicados

### 1. **Título Corto** (title)
- **Antes**: "Bot automating CET info to proposals" (41 chars, 6 palabras)
- **Ahora**: "GMHS Offer Automation" (21 chars, 3 palabras)

**Reglas aplicadas**:
- Máximo 50 caracteres
- 2-4 palabras idealmente
- Nombres creativos de proyecto (ej: "InvoiceGenius", "FraudFinder AI")
- Se filtran palabras cortas ("a", "the", "to") automáticamente

### 2. **Descripción Narrativa** (description)
- **Antes**: Metadatos estructurados mezclados
  ```
  Business Unit: Sales
  Project: Processing
  
  Bot automating CET info to proposals
  
  Impact: Reduced repetitive tasks
  Core Technology: Data + RPA + IDP
  ```

- **Ahora**: Texto narrativo puro
  ```
  This initiative aims to automate the extraction of CET information and 
  populate it into proposal documents. Currently, sales representatives 
  manually copy this data from internal systems, which is time-consuming 
  and error-prone. The bot will utilize RPA to extract data from CET 
  databases and IDP to intelligently insert it into proposal templates. 
  This will reduce repetitive tasks and improve accuracy while freeing 
  up sales time for higher-value activities.
  ```

**Estructura narrativa (3-5 frases)**:
1. Qué problema resuelve
2. Situación actual (pain point)
3. Solución propuesta con tecnología
4. Beneficio esperado

### 3. **Resumen y Impacto** (sin cambios)
- `short_description`: "Bot automating CET info to proposals" (1 línea, ~80 chars)
- `impact`: "Reduced repetitive tasks" (1 línea, ~50 chars)

---

## 📂 Archivos Modificados

### `/lib/api/teams-integration.ts`

#### Función `generateIssueTitle()` (líneas 228-246)
```typescript
private static generateIssueTitle(summary: string): string {
  const cleanSummary = summary.trim()
  
  // If already short enough (< 50 chars), use as is
  if (cleanSummary.length <= 50) {
    return cleanSummary
  }
  
  // Extract first 3-4 significant words (length > 2)
  const words = cleanSummary
    .split(' ')
    .filter(w => w.length > 2) // Filter out short words like "a", "the", "to"
  
  const shortTitle = words.slice(0, 4).join(' ')
  
  // If still too long, truncate
  return shortTitle.length > 50 ? shortTitle.substring(0, 47) + '...' : shortTitle
}
```

**Comportamiento**:
- "Bot automating CET information to proposals" → "Bot automating CET information"
- "GenAI chatbot for HR queries" → "GenAI chatbot queries"
- "InvoiceGenius" → "InvoiceGenius" ✅

#### Función `generateIssueDescription()` (líneas 248-274)
```typescript
private static generateIssueDescription(data: TeamsConversationData): string {
  const { ai_analysis } = data
  
  // Use the AI-generated summary as the main description
  // Gemini should provide a narrative description (3-5 sentences)
  if (ai_analysis.summary && ai_analysis.summary.length > 100) {
    return ai_analysis.summary
  }
  
  // Fallback: construct a basic narrative description
  let description = `This initiative was reported via Microsoft Teams. `
  
  if (ai_analysis.short_description) {
    description += `${ai_analysis.short_description}. `
  }
  
  if (ai_analysis.impact) {
    description += `The expected impact is: ${ai_analysis.impact}. `
  }
  
  if (ai_analysis.core_technology) {
    description += `The solution will utilize ${ai_analysis.core_technology} technology.`
  }
  
  return description
}
```

**Comportamiento**:
- Si Gemini genera un `summary` largo (>100 chars), se usa directamente
- Si no, construye una descripción narrativa básica con los campos disponibles
- **NO** incluye metadatos estructurados

### `/sapira-teams-bot/lib/gemini-service.js`

#### Prompt `generateTicketProposal()` (líneas 249-298)

**Agregado**:

```
"title": "Nombre CORTO del proyecto (máx 50 chars, 2-4 palabras idealmente, 
         ej: 'InvoiceGenius', 'HRChatbot GenAI', 'SmartBidder')"

"description": "Descripción NARRATIVA de 3-5 frases explicando: 
               (1) qué problema resuelve, (2) cómo funciona ahora, 
               (3) cómo funcionará con la solución y tecnología, 
               (4) beneficio esperado. 
               IMPORTANTE: SOLO texto narrativo en párrafo, 
               NO incluir metadatos estructurados como 'Business Unit:', 
               'Project:', 'Impact:', etc."

EJEMPLOS DE TÍTULOS CORRECTOS:
❌ "Bot automating CET info to proposals" (muy largo, 7 palabras)
✅ "GMHS Offer Automation" (perfecto, 3 palabras)

❌ "GenAI chatbot for HR employee queries and support" (muy largo)
✅ "HRChatbot GenAI" (perfecto, 2 palabras)

❌ "Automated system for invoice data extraction" (muy largo)
✅ "InvoiceGenius" (ideal, 1 palabra creativa)

EJEMPLOS DE DESCRIPCIÓN (description) CORRECTA:

✅ CORRECTO (narrativa de 3-5 frases):
"This initiative aims to automate the extraction of CET information..."

❌ INCORRECTO (metadatos estructurados):
"Business Unit: Sales
Project: Processing..."
```

---

## 🧪 Ejemplos de Transformación

### Ejemplo 1: Invoice Processing Bot

**Usuario dice**: "Quiero automatizar la lectura de facturas que llegan por email"

**Gemini genera**:
```json
{
  "title": "InvoiceGenius",
  "short_description": "Automated invoice data extraction",
  "description": "This initiative aims to create a robot that automatically reads and extracts key data from invoices received via email. Currently, staff manually review each invoice and enter data into the accounting system, which is time-consuming and prone to errors. The robot will utilize IDP (Intelligent Document Processing) to identify key information such as invoice number, date, vendor details, line items, and total amount. This data will then be automatically entered into SAP, reducing processing time by 80% and improving data accuracy.",
  "impact": "Reduced processing costs",
  "core_technology": "RPA + IDP",
  "business_unit": "Finance",
  "project": "Invoicing"
}
```

**Issue final en Sapira**:
- **Título**: "InvoiceGenius" ✅
- **Resumen**: "Automated invoice data extraction" ✅
- **Impacto**: "Reduced processing costs" ✅
- **Detalles**: [descripción narrativa de arriba] ✅

---

### Ejemplo 2: HR Chatbot

**Usuario dice**: "Queremos un chatbot con IA para responder preguntas de RRHH"

**Gemini genera**:
```json
{
  "title": "HRChatbot GenAI",
  "short_description": "GenAI chatbot for HR employee queries",
  "description": "This initiative aims to deploy a GenAI-powered chatbot to handle common HR queries from employees. Currently, HR staff spend significant time answering repetitive questions about policies, benefits, vacation days, and procedures. The chatbot will leverage GenAI technology to provide accurate, instant responses based on company documentation and policies. This will reduce HR workload by 60% and improve employee satisfaction through immediate support availability 24/7.",
  "impact": "Reduced HR workload",
  "core_technology": "GenAI (Chatbot)",
  "business_unit": "HR",
  "project": "Operations"
}
```

**Issue final en Sapira**:
- **Título**: "HRChatbot GenAI" ✅
- **Resumen**: "GenAI chatbot for HR employee queries" ✅
- **Impacto**: "Reduced HR workload" ✅
- **Detalles**: [descripción narrativa de arriba] ✅

---

### Ejemplo 3: CET Proposal Automation

**Usuario dice**: "Necesito automatizar la info de CET en las propuestas comerciales"

**Gemini genera**:
```json
{
  "title": "GMHS Offer Automation",
  "short_description": "Bot automating CET info to proposals",
  "description": "This initiative aims to automate the extraction of CET (Customer Equipment Type) information and automatically populate it into proposal documents. Currently, sales representatives manually copy this data from internal systems into Word templates, which takes 2-3 hours per proposal and is prone to copy-paste errors. The bot will utilize RPA to extract data from the CET database and IDP to intelligently insert it into proposal templates. This will reduce repetitive tasks and free up sales time for customer interactions.",
  "impact": "Reduced repetitive tasks",
  "core_technology": "RPA + IDP + Data",
  "business_unit": "Sales",
  "project": "Processing"
}
```

**Issue final en Sapira**:
- **Título**: "GMHS Offer Automation" ✅
- **Resumen**: "Bot automating CET info to proposals" ✅
- **Impacto**: "Reduced repetitive tasks" ✅
- **Detalles**: [descripción narrativa de arriba] ✅

---

## 🚀 Testing

### Para probar los cambios:

1. **Desde Teams**, iniciar conversación con el bot:
   ```
   Usuario: Quiero automatizar las facturas
   Bot: [pregunta detalles]
   Usuario: [responde]
   Bot: [propone ticket]
   Usuario: Sí, créalo
   ```

2. **Verificar en Sapira** (`/triage-new`):
   - ✅ Título corto (2-4 palabras, < 50 chars)
   - ✅ Resumen de 1 línea
   - ✅ Impacto de 1 línea
   - ✅ Detalles con descripción narrativa (3-5 frases)
   - ❌ NO debe tener "Business Unit:", "Project:", etc.

3. **Verificar en la UI**:
   - El issue debe verse limpio y profesional
   - La descripción debe leer como un párrafo explicativo
   - No debe haber redundancia entre campos

---

## 📋 Checklist

- [x] Actualizar `generateIssueTitle()` para títulos cortos
- [x] Actualizar `generateIssueDescription()` para descripciones narrativas
- [x] Actualizar prompt de Gemini con ejemplos y reglas
- [x] Agregar ejemplos de títulos correctos e incorrectos
- [x] Agregar ejemplos de descripciones correctas e incorrectas
- [ ] Probar creando issue desde Teams
- [ ] Verificar formato en triage
- [ ] Confirmar que no hay metadatos estructurados en detalles

---

## 📝 Notas Importantes

1. **El título se acorta automáticamente** si Gemini genera uno muy largo
2. **La descripción narrativa** es responsabilidad de Gemini, con fallback si falla
3. **Los campos separados** (`short_description`, `impact`) se mantienen sin cambios
4. **Los metadatos** (Business Unit, Project) siguen existiendo pero NO en la descripción visible

---

**Estado**: ✅ Cambios aplicados y listos para testing
**Próximo paso**: Probar creación de issue desde Teams y verificar formato

