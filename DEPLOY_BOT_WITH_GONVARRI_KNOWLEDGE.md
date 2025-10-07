# 🚀 Deploy del Bot con Conocimiento de Gonvarri

## 📋 Resumen de Cambios

Hemos actualizado el bot de Teams para que infiera automáticamente:
- **Business Unit** (Finance, Legal, HR, Sales, Procurement)
- **Project** (Pricing, Invoicing, Advisory, NPS, etc.)

## ✅ Checklist Pre-Deploy

### 1. Verificar que los archivos nuevos están en el repo

Archivos añadidos/modificados:
- ✅ `sapira-teams-bot/lib/gonvarri-knowledge.js` (NUEVO)
- ✅ `sapira-teams-bot/lib/gemini-service.js` (actualizado)
- ✅ `sapira-teams-bot/lib/conversation-manager.js` (actualizado)

### 2. Variables de Entorno Necesarias

El bot necesita estas variables en Render:

```bash
# Microsoft Teams
MICROSOFT_APP_ID=<tu_app_id>
MICROSOFT_APP_PASSWORD=<tu_password>
MICROSOFT_APP_TYPE=SingleTenant

# Google Gemini
GEMINI_API_KEY=<tu_gemini_key>

# Sapira API (IMPORTANTE - debe apuntar a tu app Next.js)
SAPIRA_API_URL=https://v0-internal-os-build.vercel.app
# O si es producción:
# SAPIRA_API_URL=https://tu-dominio-produccion.com

# Puerto (opcional, Render lo gestiona)
PORT=3000
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Añadir la variable **`SAPIRA_API_URL`** en Render si no existe.

---

## 🚀 Pasos para Deploy en Render

### Opción A: Auto-Deploy desde Git (Recomendado)

Si tu repo está conectado a Render con auto-deploy:

```bash
# 1. Commit los cambios
cd /Users/pablosenabre/Sapira/the_OS
git add sapira-teams-bot/
git commit -m "feat: Add Gonvarri knowledge to Teams bot for BU and Project inference"

# 2. Push a la rama conectada a Render (main o production)
git push origin main
```

✅ Render detectará el push y hará deploy automáticamente.

---

### Opción B: Deploy Manual desde Dashboard

Si prefieres control manual:

1. **Ve a Render Dashboard**
   - https://dashboard.render.com/
   - Busca el servicio `sapira-teams-bot`

2. **Trigger Manual Deploy**
   - Click en "Manual Deploy" → "Deploy latest commit"
   - O si hiciste push: "Clear build cache & deploy"

3. **Verificar Variables de Entorno**
   - Ve a "Environment" en tu servicio
   - Asegúrate de que existe `SAPIRA_API_URL`
   - Ejemplo: `https://v0-internal-os-build.vercel.app`

4. **Verificar Deploy**
   - Ve a "Logs" para ver si el deploy fue exitoso
   - Busca el mensaje: `✅ Sapira Teams Bot running on port 3000`

---

### Opción C: Deploy desde CLI de Render (Alternativa)

Si tienes Render CLI instalado:

```bash
cd sapira-teams-bot
render deploy
```

---

## 🧪 Verificar que el Deploy Funcionó

### 1. Revisar Logs de Render

Ve a: https://dashboard.render.com/ → Tu servicio → Logs

Busca estos mensajes:
```
✅ Sapira Teams Bot running on port 3000
📍 Bot endpoint ready at: https://tu-app.onrender.com/api/messages
```

### 2. Probar en Teams

**Conversación de Prueba #1: Finance + Invoicing**
```
Tú: "Hola, quiero automatizar las facturas que llegan por email"
Bot: [conversación natural]
Tú: "Nos llegan 500 al mes y tenemos que meterlas a mano en SAP"
Bot: [genera propuesta]
  ✅ Debería inferir: Business Unit = Finance, Project = Invoicing
```

**Conversación de Prueba #2: Legal + Advisory**
```
Tú: "Necesito un asistente virtual para revisar contratos legales"
Bot: [conversación]
  ✅ Debería inferir: Business Unit = Legal, Project = Advisory
```

**Conversación de Prueba #3: HR + NPS**
```
Tú: "Queremos un chatbot para ayudar a los empleados con dudas"
Bot: [conversación]
  ✅ Debería inferir: Business Unit = HR, Project = NPS
```

### 3. Verificar en /triage-new

Después de crear un ticket desde Teams:

1. Ve a: https://v0-internal-os-build.vercel.app/triage-new
2. Busca el issue recién creado
3. ✅ Debería tener **Business Unit asignado**
4. ✅ Debería tener **Project asignado** (si se pudo inferir)

---

## 🔧 Troubleshooting

### Error: "Business Unit not found in DB"

**Causa**: El nombre inferido no coincide exactamente con el de la BD.

**Solución**: Verifica que los nombres en `gonvarri-knowledge.js` coincidan:
```javascript
// Debe coincidir exactamente con la BD
'Finance' → SELECT name FROM initiatives WHERE name ILIKE '%Finance%'
```

### Error: "API error: 500"

**Causa**: El bot no puede conectar con la API de Next.js.

**Solución**: 
1. Verifica que `SAPIRA_API_URL` esté configurada
2. Prueba la URL manualmente: `https://tu-app.vercel.app/api/teams/create-issue`

### Error: "No JSON found in response"

**Causa**: Gemini no está devolviendo JSON válido.

**Solución**: El código ya tiene fallback. Revisa los logs para ver el error específico.

---

## 📊 Monitorear el Sistema

### Logs de Render
```bash
# Ver logs en tiempo real
render logs --service sapira-teams-bot --tail

# O desde Dashboard:
# https://dashboard.render.com/ → sapira-teams-bot → Logs
```

### Logs de Supabase (para ver si llegan los issues)
```sql
-- Ver issues creados desde Teams en las últimas 24h
SELECT 
  key,
  title,
  initiative_id,
  project_id,
  created_at
FROM issues 
WHERE origin = 'teams' 
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Métricas a Observar

1. **Tasa de inferencia correcta**
   - ¿Cuántos issues vienen con BU y Project asignados?
   - Target: >80% con BU asignado

2. **Falsos positivos**
   - ¿Hay issues asignados a BU/Project incorrectos?
   - Ajustar keywords en `gonvarri-knowledge.js`

3. **Tiempo de respuesta**
   - El bot debería responder en <3 segundos
   - Si es más lento, revisar llamadas a Gemini

---

## 🎯 Post-Deploy: Mejoras Continuas

### Añadir nuevos keywords

Si ves que algunos issues no se infieren correctamente, edita:

`sapira-teams-bot/lib/gonvarri-knowledge.js`

```javascript
const BUSINESS_UNITS = {
  'Finance': {
    keywords: ['pricing', 'invoice', 'NUEVA_KEYWORD'],
    // Añade keywords que veas en conversaciones reales
  }
}
```

Luego haz deploy de nuevo.

### Monitorear conversaciones

Revisa los issues en triage para ver qué palabras clave usan los usuarios y añádelas al sistema.

---

## ✅ Checklist Final

Antes de dar por terminado el deploy:

- [ ] Bot desplegado en Render sin errores
- [ ] Variable `SAPIRA_API_URL` configurada
- [ ] Probado 3 conversaciones diferentes (Finance, Legal, HR)
- [ ] Issues aparecen en /triage-new con BU asignado
- [ ] Logs de Render sin errores críticos
- [ ] Documentación actualizada en el repo

---

## 📝 Comandos Rápidos

```bash
# Commit y push para deploy automático
git add sapira-teams-bot/
git commit -m "feat: Add Gonvarri knowledge for BU/Project inference"
git push origin main

# Ver estado del servicio
curl https://sapira-teams-bot.onrender.com/health

# Ver logs (si tienes Render CLI)
render logs --service sapira-teams-bot --tail
```

---

¡Listo para producción! 🚀


