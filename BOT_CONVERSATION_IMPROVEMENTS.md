# 🤖 Mejoras en Conversación del Bot de Teams

## 📋 Cambios Implementados

Se han aplicado mejoras significativas al bot de Teams para que **haga más preguntas técnicas** antes de crear un ticket.

### 1. **Requisitos Mínimos Más Estrictos**

**Antes:** Mínimo 4 mensajes (2 intercambios)
**Ahora:** Mínimo 6 mensajes (3 intercambios)

Esto fuerza al menos:
- Saludo inicial
- Descripción del problema
- Contexto técnico adicional
- Beneficio esperado

### 2. **Criterios de "Suficiente Información" Más Rigurosos**

**ANTES - 4 criterios:**
1. Problema específico
2. Tecnología (inferible)
3. Beneficio esperado
4. Detalle suficiente

**AHORA - 6 criterios (TODOS obligatorios):**
1. Problema ESPECÍFICO (no "facturas", sino "validar facturas en SAP")
2. Tecnología EXPLÍCITA (debe mencionarla el usuario: RPA, IDP, GenAI, etc.)
3. VOLUMEN/FRECUENCIA (cuántas facturas/día, cuánto tiempo, etc.)
4. Beneficio CUANTIFICADO (ahorrar X horas, no solo "ahorrar tiempo")
5. SISTEMAS involucrados (SAP, Oracle, email, etc.)
6. EQUIPO afectado (departamento, número de personas)

### 3. **Ejemplos de Conversaciones INSUFICIENTES Mejorados**

Se añadió el ejemplo exacto que el usuario reportó como problemático:

```
❌ INSUFICIENTE:
User: "Quiero hacer una herramienta de automatización de facturas"
Bot: "¿Qué te gustaría conseguir automatizando ese proceso?"
User: "La idea es ahorrar tiempo al personal de facturación, pierden mucho tiempo con procesos manuales"

RESPUESTA: false 
RAZÓN: Falta QUÉ EXACTAMENTE se automatiza, falta CÓMO (tecnología), falta VOLUMEN, muy genérico
```

### 4. **Preguntas Más Específicas del Bot**

El bot ahora hace preguntas que piden **información concreta**:

**ANTES:**
- "¿Qué te gustaría conseguir?"
- "Interesante, cuéntame más"

**AHORA:**
- "¿Cuántas facturas recibís al día o al mes más o menos?"
- "¿Me puedes dar más detalle? Por ejemplo, ¿qué parte del proceso es la más manual? ¿Meter datos en algún sistema?"
- "¿Ahora cómo las procesáis? ¿Las tenéis que meter en SAP o en algún otro sistema?"
- "¿Cuánto tiempo os lleva eso? Y, ¿habéis pensado en alguna tecnología tipo IDP para leer las facturas o RPA para automatizar la entrada en SAP?"

### 5. **Instrucciones Mejoradas para el Bot**

Se añadieron reglas explícitas:

```
⚠️ REGLAS DE ORO:
- SI falta VOLUMEN → pregunta "¿cuántas X al día/mes?" o "¿cuánto tiempo os lleva?"
- SI falta TECNOLOGÍA → pregunta "¿habéis pensado en alguna tecnología?" o sugiere opciones
- SI falta DETALLES TÉCNICOS → pregunta por sistemas, herramientas actuales, proceso exacto
- SI el usuario dice "ahorrar tiempo" → pide CUÁNTO tiempo específicamente
```

## 📊 Ejemplo de Conversación Mejorada

**ANTES (3 intercambios = ticket):**
```
User: "Quiero automatizar facturas"
Bot: "¿Qué quieres conseguir?"
User: "Ahorrar tiempo"
Bot: [Propone crear ticket] ❌
```

**AHORA (6+ intercambios necesarios):**
```
User: "Quiero automatizar facturas"
Bot: "¿Cuántas facturas recibís al día o al mes?"
User: "Unas 200 al mes"
Bot: "Vale, 200 al mes es un buen volumen. ¿Ahora cómo las procesáis? ¿Las tenéis que meter en SAP?"
User: "Sí, las metemos en SAP manualmente"
Bot: "¿Cuánto tiempo os lleva? Y, ¿habéis pensado en IDP para leer las facturas o RPA para SAP?"
User: "Nos lleva unas 15 horas semanales. Sí, pensábamos en IDP + RPA"
Bot: [AHORA SÍ tiene suficiente info para proponer ticket] ✅
```

## ✅ Información que el Bot Ahora Garantiza Antes de Crear Ticket

1. ✅ Problema específico con detalles técnicos
2. ✅ Tecnología explícita mencionada
3. ✅ Volumen cuantificado (N facturas, X horas)
4. ✅ Beneficio medible (ahorrar X horas/semana)
5. ✅ Sistemas involucrados (SAP, etc.)
6. ✅ Equipo afectado (departamento, personas)

## 🔧 Archivo Modificado

`/sapira-teams-bot/lib/gemini-service.js`

## 🎯 Resultado Esperado

Ahora el bot hará **al menos 3-4 preguntas técnicas** antes de proponer crear un ticket, recopilando:
- Volumen/frecuencia
- Tecnología específica
- Sistemas involucrados
- Tiempo/beneficio cuantificado
- Detalles del proceso actual

Esto garantiza tickets **bien fundamentados** con **contexto técnico suficiente**.

---

**Implementado:** 5 de octubre, 2025
**Archivos modificados:** `sapira-teams-bot/lib/gemini-service.js`

