# 🔧 Fix: Formato de Issues Creados desde Teams

## 🐛 Problema Actual

Los issues creados desde Teams tienen formato incorrecto:

### Issue Actual:
```
TÍTULO: "Bot automating CET info to proposals"  ❌ Muy largo

RESUMEN (short_description):
Bot automating CET info to proposals

IMPACTO (impact):
Reduced repetitive tasks

DETALLES (description):
Business Unit: Sales
Project: Processing

Bot automating CET info to proposals  ← Repite el título

Impact: Reduced repetitive tasks  ← Repite el impact
Core Technology: Data + RPA + IDP
```

### Issue Deseado:
```
TÍTULO: "GMHS's Offer Automation"  ✅ Corto, 2-4 palabras

RESUMEN (short_description):
Bot automating CET info to proposals

IMPACTO (impact):
Reduced repetitive tasks

DETALLES (description):
This initiative aims to automate the extraction of CET (Customer Equipment Type) 
information and automatically populate it into proposal documents. Currently, 
sales representatives manually copy this data from internal systems, which is 
time-consuming and error-prone. The bot will utilize RPA to extract data from 
CET databases and IDP to intelligently insert it into proposal templates, 
reducing repetitive tasks and improving accuracy.
```

## 📋 Reglas del Formato

### 1. Título (title)
- **Máximo 50 caracteres**
- **2-4 palabras idealmente**
- **Estilo**: Nombre del proyecto/iniciativa
- **Ejemplos buenos**:
  - "InvoiceGenius"
  - "HRChatbot GenAI"
  - "SmartBidder"
  - "GMHS's Offer Automation"
  - "FraudFinder AI"
  - "ComplyStreamline"

### 2. Resumen (short_description)
- **1 línea, máximo 80 caracteres**
- **Describe QUÉ hace** en forma breve
- **Ejemplos**:
  - "GenAI chatbots for HR queries"
  - "Automated invoice generation"
  - "Bot automating CET info to proposals"

### 3. Impacto (impact)
- **1 línea, máximo 50 caracteres**
- **Describe el BENEFICIO**
- **Usar frases estandarizadas**:
  - "Reduced repetitive tasks"
  - "Increased productivity"
  - "Reduced processing costs"
  - "Reduce time on investigations"
  - "Improved decision-making"

### 4. Detalles (description)
- **Párrafo narrativo de 3-5 frases**
- **NO incluir metadatos** (Business Unit, Project, Impact, etc.)
- **Estructura**:
  1. Qué problema resuelve
  2. Cómo funciona actualmente (situación actual)
  3. Cómo funcionará con la solución (tecnología)
  4. Beneficio esperado
  
- **Ejemplo completo**:
  ```
  This initiative aims to create a robot that automatically reads and extracts 
  key data from invoices. This will streamline invoice processing, reduce manual 
  data entry, and improve accuracy. The robot will utilize IDP (Intelligent 
  Document Processing) to identify key information such as invoice number, date, 
  vendor details, line items, and total amount. This data can then be automatically 
  entered into accounting software. The initiative will leverage RPA for data 
  transfer and system integration.
  ```

## 🔧 Cambios Necesarios

### Fix #1: Prompt de Gemini para Título Corto

**Archivo**: `sapira-teams-bot/lib/gemini-service.js`

**En generateTicketProposal (línea ~249)**:

```javascript
{
  "title": "Nombre corto y memorable del proyecto (máx 50 chars, 2-4 palabras)",
  "short_description": "Descripción breve del alcance en 1 línea (máx 80 chars)",
  "description": "Descripción narrativa detallada de 3-5 frases explicando el problema actual, la solución propuesta, tecnología a usar, y beneficio esperado. NO incluir metadatos como Business Unit, Project, Impact. Solo texto narrativo explicativo.",
  // ... resto igual
}
```

**Agregar ejemplos en el prompt**:
```
EJEMPLOS DE TÍTULOS CORRECTOS:
❌ "Bot automating CET info to proposals" (muy largo)
✅ "GMHS Offer Automation" (corto y claro)

❌ "GenAI chatbot for HR employee queries and support" (muy largo)
✅ "HRChatbot GenAI" (perfecto)

❌ "Automated system for invoice data extraction and processing" (muy largo)
✅ "InvoiceGenius" (ideal)

REGLAS PARA EL TÍTULO:
- Máximo 50 caracteres
- Preferiblemente 2-4 palabras
- Puede ser un nombre de proyecto creativo
- Si incluye tecnología, hazlo breve (ej: "GenAI", "AI", no "Generative AI Powered")
```

**Agregar ejemplos para description**:
```
EJEMPLOS DE DESCRIPCIÓN (description) CORRECTA:

✅ CORRECTO:
"This initiative aims to automate the extraction of CET information and 
populate it into proposal documents. Currently, sales reps manually copy 
this data, which is time-consuming. The bot will use RPA to extract data 
and IDP to insert it into templates, reducing repetitive tasks."

❌ INCORRECTO:
"Business Unit: Sales
Project: Processing

Bot automating CET info to proposals

Impact: Reduced repetitive tasks
Core Technology: Data + RPA + IDP"

REGLAS PARA LA DESCRIPCIÓN:
- SOLO texto narrativo, NO incluir metadatos estructurados
- Explica el problema, la solución, la tecnología, y el beneficio
- 3-5 frases mínimo
- Escribe en párrafo corrido, no en bullet points
```

### Fix #2: Función generateIssueDescription

**Archivo**: `lib/api/teams-integration.ts`

**Buscar la función `generateIssueDescription`** (debería estar alrededor de línea 200-250):

```typescript
// ANTES (si está así):
private static generateIssueDescription(conversationData: TeamsConversationData): string {
  const { ai_analysis, messages } = conversationData
  
  let description = ''
  
  // Add business context if available
  if (ai_analysis.business_unit) {
    description += `Business Unit: ${ai_analysis.business_unit}\n`
  }
  if (ai_analysis.project) {
    description += `Project: ${ai_analysis.project}\n`
  }
  
  description += `\n${ai_analysis.summary}\n\n`
  
  if (ai_analysis.impact) {
    description += `Impact: ${ai_analysis.impact}\n`
  }
  if (ai_analysis.core_technology) {
    description += `Core Technology: ${ai_analysis.core_technology}\n`
  }
  
  // ... etc
  
  return description
}

// DESPUÉS (nuevo):
private static generateIssueDescription(conversationData: TeamsConversationData): string {
  const { ai_analysis } = conversationData
  
  // Si Gemini ya generó una descripción narrativa, usarla directamente
  if (ai_analysis.summary && ai_analysis.summary.length > 100) {
    return ai_analysis.summary
  }
  
  // Fallback: construir descripción básica
  return `This initiative was reported via Teams. ${ai_analysis.summary || 'Details to be provided.'}`
}
```

### Fix #3: Título más Inteligente

**Archivo**: `lib/api/teams-integration.ts`

**Buscar función `generateIssueTitle`** (debería estar cerca de generateIssueDescription):

```typescript
// ANTES:
private static generateIssueTitle(summary: string): string {
  // Truncate if too long
  return summary.length > 100 ? summary.substring(0, 97) + '...' : summary
}

// DESPUÉS:
private static generateIssueTitle(summary: string): string {
  // Si el summary ya es corto (< 50 chars), usarlo tal cual
  if (summary.length <= 50) {
    return summary
  }
  
  // Si es más largo, intentar extraer palabras clave
  // Tomar las primeras 3-4 palabras significativas
  const words = summary.split(' ').filter(w => w.length > 2) // Filtrar palabras muy cortas
  const shortTitle = words.slice(0, 4).join(' ')
  
  // Si aún es muy largo, truncar
  return shortTitle.length > 50 ? shortTitle.substring(0, 47) + '...' : shortTitle
}
```

## 🧪 Ejemplos de Transformación

### Ejemplo 1: Invoice Processing
```
INPUT (del bot):
summary: "Bot automating invoice data extraction and processing"
short_description: "Automated invoice generation"
impact: "Reduced processing costs"

OUTPUT esperado:
title: "InvoiceGenius"  ✅ (corto)
short_description: "Automated invoice generation"  ✅
impact: "Reduced processing costs"  ✅
description: "This initiative aims to create a robot that automatically 
reads and extracts key data from invoices. This will streamline invoice 
processing, reduce manual data entry, and improve accuracy. The robot 
will utilize IDP to identify key information such as invoice number, date, 
vendor details, line items, and total amount..."  ✅ (narrativo)
```

### Ejemplo 2: HR Chatbot
```
INPUT:
summary: "GenAI powered chatbot for answering HR employee queries"
short_description: "GenAI chatbots for HR queries"
impact: "Reduced HR workload"

OUTPUT esperado:
title: "HRChatbot GenAI"  ✅
short_description: "GenAI chatbots for HR queries"  ✅
impact: "Reduced HR workload"  ✅
description: "This initiative aims to deploy a GenAI-powered chatbot to 
handle common HR queries from employees. Currently, HR staff spend significant 
time answering repetitive questions about policies, benefits, and procedures. 
The chatbot will leverage GenAI technology to provide accurate, instant responses, 
reducing HR workload and improving employee satisfaction..."  ✅
```

## 📝 Checklist de Implementación

- [ ] **Actualizar prompt de Gemini** con reglas de título corto
- [ ] **Agregar ejemplos** de títulos buenos vs malos
- [ ] **Actualizar prompt de description** para generar texto narrativo
- [ ] **Modificar `generateIssueDescription()`** para usar solo el summary
- [ ] **Mejorar `generateIssueTitle()`** para crear títulos más cortos
- [ ] **Probar** creando un issue desde Teams

## 🚀 Testing

Después de aplicar los cambios, probar creando un issue desde Teams con:

```
Usuario: "Quiero automatizar las facturas que llegan por email"
Bot: [pregunta detalles]
Usuario: "Llegan unas 500 al mes y tenemos que meter los datos a mano en SAP"
Bot: [pregunta más]
Usuario: "Queremos usar IDP para extraer los datos automáticamente"
Bot: [propuesta]
Usuario: "Sí, créalo"
```

**Verificar que el issue tenga**:
- ✅ Título corto (ej: "InvoiceGenius" o "Invoice Automation")
- ✅ short_description de 1 línea
- ✅ impact de 1 línea
- ✅ description narrativa de 3-5 frases SIN metadatos

---

**¿Quieres que aplique estos cambios ahora?**

