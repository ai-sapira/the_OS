# 🔧 Fix: Bot de Teams Crea Tickets Demasiado Agresivamente

## 🐛 Problemas Detectados

### Problema #1: Conversación No Se Resetea
Después de crear un ticket, la conversación se marca como 'completed' pero **NO se elimina de memoria**. 

**Impacto**: Si dices "Buenas" de nuevo, el bot usa la MISMA conversación anterior y puede intentar crear otro ticket con el contexto viejo.

### Problema #2: Prompt Demasiado Permisivo
El prompt de `shouldCreateTicket` dice:
- "Si después de 4-5 intercambios ya hay una idea clara, probablemente es suficiente"
- Esto hace que cree tickets prematuramente

### Problema #3: Fallback Peligroso
Si Gemini falla al evaluar, automáticamente crea ticket después de 6 mensajes:
```javascript
return conversation.messages.length >= 6; // ⚠️ Demasiado agresivo
```

### Problema #4: Estado 'completed' Sin Manejar
El flujo no resetea la conversación cuando está en estado 'completed'.

## ✅ Soluciones a Aplicar

### Fix #1: Resetear Conversación Después de Crear Ticket

**Archivo**: `sapira-teams-bot/server.js`

**Cambio en línea ~256**:
```javascript
// ANTES
responseText = `🎉 ¡Listo! Ya está creado el ticket **${result.ticket_key}**.

Puedes verlo aquí: ${result.ticket_url}

El equipo responsable lo revisará y te mantendrá informado. Si necesitas algo más, aquí estoy.`;

conversation.setState('completed');

// DESPUÉS
responseText = `🎉 ¡Listo! Ya está creado el ticket **${result.ticket_key}**.

Puedes verlo aquí: ${result.ticket_url}

El equipo responsable lo revisará y te mantendrá informado. Si necesitas reportar otra cosa, solo dime "nueva idea" o "tengo otro problema".`;

// Marcar conversación como completada y limpiarla después de un tiempo
conversation.setState('completed');

// Limpiar la conversación del Map después de 2 minutos
setTimeout(() => {
  const key = `${conversationId}:${userId}`;
  conversations.delete(key);
  console.log('🧹 Conversation cleaned:', key);
}, 120000); // 2 minutos
```

### Fix #2: Detectar Inicio de Nueva Conversación

**Archivo**: `sapira-teams-bot/server.js`

**Agregar ANTES de la línea ~175**:
```javascript
// Añadir mensaje del usuario
conversation.addMessage(activity.text, 'user');
console.log('💬 User message added to conversation');

// ⭐ NUEVO: Detectar si es conversación completada y usuario quiere empezar de nuevo
if (conversation.state === 'completed') {
  const lowerText = activity.text.toLowerCase().trim();
  const newConversationKeywords = [
    'nueva idea', 'otro problema', 'otra cosa', 'nuevo ticket', 
    'hola', 'buenas', 'hey', 'tengo otra idea', 'tengo un problema'
  ];
  
  const isStartingNew = newConversationKeywords.some(kw => lowerText.includes(kw));
  
  if (isStartingNew) {
    console.log('🔄 Starting new conversation - resetting state');
    
    // Resetear conversación pero mantener info del usuario
    const key = `${conversationId}:${userId}`;
    conversations.delete(key);
    
    // Crear nueva conversación limpia
    const newConversation = getOrCreateConversation(
      conversationId,
      userId,
      userName,
      userEmail
    );
    
    // Agregar el mensaje inicial
    newConversation.addMessage(activity.text, 'user');
    
    // Responder con bienvenida
    const responseText = await getGeminiService().continueConversation(newConversation);
    newConversation.addMessage(responseText, 'bot');
    
    await context.sendActivity({ type: 'message', text: responseText });
    console.log('✅ New conversation started');
    return; // Salir del flujo principal
  } else {
    // Si no está empezando de nuevo, recordarle que ya completó
    await context.sendActivity({ 
      type: 'message', 
      text: 'Ya completamos tu ticket anterior. Si tienes otra idea o problema, dime "nueva idea" y empezamos de cero.' 
    });
    console.log('✅ Reminded user to start new conversation');
    return;
  }
}

// Detectar si es el primer mensaje (conversación nueva)
const isFirstMessage = conversation.messages.length === 1;
```

### Fix #3: Hacer el Prompt de shouldCreateTicket Más Estricto

**Archivo**: `sapira-teams-bot/lib/gemini-service.js`

**Cambiar en línea ~17-65**:
```javascript
async shouldCreateTicket(conversation) {
  // ⭐ NUEVO: Requisitos mínimos más estrictos
  const messageCount = conversation.messages.length;
  
  // Si es el primer mensaje, NUNCA crear ticket
  if (messageCount <= 1) {
    return false;
  }
  
  // Si hay menos de 4 mensajes (2 intercambios), probablemente no hay info suficiente
  if (messageCount < 4) {
    return false;
  }

  const prompt = `
Analiza esta conversación entre un usuario y Sapira (asistente de IA):

${conversation.getHistory()}

¿Tienes suficiente contexto para generar una propuesta de initiative coherente?

⚠️ CRITERIO ESTRICTO:

✅ SUFICIENTE SI (TODOS los puntos):
1. El usuario explicó QUÉ proceso/problema específico quiere resolver
2. El usuario mencionó o se puede inferir cómo lo quiere resolver (tecnología, enfoque)
3. Se mencionó o se puede inferir el beneficio/impacto esperado
4. Hay suficiente detalle para escribir una descripción con sentido

❌ INSUFICIENTE SI (cualquiera):
- Solo hubo saludos o mensajes muy vagos
- El usuario solo hizo preguntas genéricas sin explicar su caso
- Falta el QUÉ (el problema/proceso)
- Falta el CÓMO (la tecnología/enfoque)
- La conversación es ambigua o abstracta
- El usuario todavía está explorando sin una idea clara

🎯 IMPORTANTE:
- SÉ CONSERVADOR: mejor pedir más info que crear ticket prematuro
- Si tienes dudas, responde false
- Solo di true si estás SEGURO de que hay suficiente para una propuesta sólida

EJEMPLOS:

❌ INSUFICIENTE:
user: "Buenas"
bot: "¡Hola! ¿En qué puedo ayudarte?"
user: "Quiero hacer algo con IA"
bot: "¿Qué te gustaría automatizar o mejorar?"
RESPUESTA: false (muy vago, sin detalles)

❌ INSUFICIENTE:
user: "Tengo un problema con las facturas"
bot: "Cuéntame más"
user: "Llegan por email y es un lío"
RESPUESTA: false (falta cómo quiere resolverlo, qué tecnología)

✅ SUFICIENTE:
user: "Quiero automatizar el procesamiento de facturas que llegan por email"
bot: "¿Qué parte os lleva más tiempo?"
user: "Tenemos que leer cada una y meter los datos en SAP manualmente, unas 500 al mes"
bot: "¿Qué beneficio esperarías?"
user: "Ahorrar tiempo, ahora nos lleva horas"
RESPUESTA: true (problema claro, volumen claro, tecnología implícita: IDP/RPA, beneficio claro)

Responde SOLO: true o false`;

  try {
    const model = this.client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const response = await model.generateContent(prompt);
    const responseText = response.response.text().toLowerCase().trim();
    
    const shouldCreate = responseText.includes('true');
    console.log(`🤔 shouldCreateTicket: ${shouldCreate} (messages: ${messageCount})`);
    
    return shouldCreate;
  } catch (error) {
    console.error('Error checking if should create ticket:', error);
    
    // ⭐ NUEVO: Fallback más conservador
    // Solo crear si hay MUCHOS mensajes (10+) asumiendo que ya hubo conversación larga
    const shouldCreate = messageCount >= 10;
    console.log(`⚠️ Gemini failed, using fallback: ${shouldCreate} (messages: ${messageCount})`);
    return shouldCreate;
  }
}
```

### Fix #4: Mejorar Mensaje Inicial

**Archivo**: `sapira-teams-bot/lib/gemini-service.js`

**En el prompt de continueConversation (línea ~104)**:

```javascript
IMPORTANTE:
- NO hagas preguntas mecánicas tipo checklist
- SI el usuario solo saluda (ej: "Hola", "Buenas"), devuelve saludo + pregunta abierta simple
  ✅ "¡Hola! ¿En qué puedo ayudarte hoy?"
  ❌ "¡Hola! Me encantaría escuchar tu idea. ¿De qué va?"
- SI el usuario da info vaga (ej: "Tengo una idea"), pide MÁS contexto específico
  ✅ "¿Qué proceso o problema quieres mejorar?"
  ❌ "Cuéntame más"
```

## 🧪 Cómo Probar los Fixes

### Escenario 1: Saludo Simple
```
Usuario: "Buenas"
Bot esperado: "¡Hola! ¿En qué puedo ayudarte hoy?"
Usuario: "nada solo saludaba"
Bot esperado: "Entendido, aquí estoy si necesitas algo 👍"
❌ NO debe crear ticket
```

### Escenario 2: Info Vaga
```
Usuario: "Tengo una idea"
Bot esperado: "¿Qué proceso o problema quieres mejorar?"
Usuario: "Las facturas"
Bot esperado: "¿Qué pasa con las facturas? ¿Cuál es el problema actual?"
❌ NO debe crear ticket hasta tener más info
```

### Escenario 3: Ticket Completo → Nueva Conversación
```
[...conversación que termina en ticket creado: GON-52]
Bot: "🎉 ¡Listo! Ya está creado el ticket GON-52..."
Usuario: "Buenas"  [nuevo mensaje después de crear ticket]
Bot esperado: "Ya completamos tu ticket anterior. Si tienes otra idea o problema, dime 'nueva idea' y empezamos de cero."
❌ NO debe crear otro ticket
```

### Escenario 4: Nueva Idea Después de Ticket
```
[...ticket anterior completado]
Usuario: "Tengo otra idea"
Bot esperado: "¡Perfecto! Cuéntame, ¿de qué va?" [conversación reseteada]
✅ Empieza conversación NUEVA desde cero
```

## 📝 Checklist de Implementación

- [ ] **Fix #1**: Agregar timeout para limpiar conversación después de crear ticket
- [ ] **Fix #2**: Detectar estado 'completed' y manejar inicio de nueva conversación
- [ ] **Fix #3**: Hacer prompt de shouldCreateTicket más estricto
- [ ] **Fix #4**: Mejorar manejo de fallback (10+ mensajes en lugar de 6)
- [ ] **Fix #5**: Agregar logs de debug para rastrear decisiones

## 🚀 Deployment

Después de aplicar los fixes:

```bash
# En el directorio del bot
cd sapira-teams-bot

# Commit los cambios
git add .
git commit -m "fix: bot menos agresivo al crear tickets

- Resetear conversación después de crear ticket
- Prompt más estricto para shouldCreateTicket
- Manejar estado completed correctamente
- Fallback más conservador (10+ mensajes)
- Detectar inicio de nueva conversación"

# Push a GitHub
git push origin main

# Render auto-deployará los cambios
```

## 📊 Métricas de Éxito

Después de los fixes, deberías ver:
- ✅ Menos tickets creados por saludos simples
- ✅ Conversaciones más largas antes de crear tickets
- ✅ Usuario puede decir "Buenas" sin que cree tickets
- ✅ Conversaciones se resetean correctamente después de tickets

---

**¿Quieres que aplique estos fixes ahora?**

