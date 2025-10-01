# 🚀 Instrucciones para Deploy del Bot a Producción

## ✅ Cambios Realizados

Se ha actualizado completamente el bot de Teams Sapira para **initiatives de automatización/IA de Gonvarri**.

---

## 📦 Archivos Modificados

**En `/sapira-teams-bot/`:**

### Archivos JavaScript (usados en producción):
- ✅ `lib/gemini-service.js` - Prompts y lógica actualizada para Gonvarri
- ✅ `lib/conversation-manager.js` - Inclusión de nuevos campos

### Archivos TypeScript (versión moderna):
- ✅ `bot/types.ts` - Tipos con campos de Gonvarri
- ✅ `bot/gemini.service.ts` - Servicio actualizado
- ✅ `bot/ticket-creation.service.ts` - Creación con nuevos campos
- ✅ `bot/adaptive-cards.ts` - UI para initiatives

### Documentación:
- ✅ `COMMIT_MESSAGE.txt` - Mensaje de commit preparado
- ✅ `DEPLOYMENT_GONVARRI.md` - Guía de despliegue

---

## 🚀 Pasos para Deploy

### Opción 1: Deploy Manual (Recomendado para revisar)

```bash
# 1. Navegar a la carpeta del bot
cd sapira-teams-bot

# 2. Ver cambios
git status

# 3. Añadir archivos
git add lib/gemini-service.js lib/conversation-manager.js
git add bot/types.ts bot/gemini.service.ts bot/ticket-creation.service.ts bot/adaptive-cards.ts
git add COMMIT_MESSAGE.txt DEPLOYMENT_GONVARRI.md

# 4. Commit con mensaje preparado
git commit -F COMMIT_MESSAGE.txt

# 5. Push a producción
git push origin main

# 6. Monitorear deployment
# El servicio en Render redesplegará automáticamente
# Dashboard: https://dashboard.render.com
```

### Opción 2: Deploy con Script Automático

```bash
cd sapira-teams-bot
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 Verificación Post-Deploy

### 1. Health Check
```bash
curl https://your-bot-domain.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "message": "Sapira Teams Bot is running"
}
```

### 2. Test en Teams

**Conversación de prueba:**
```
Tú: "Necesito automatizar la detección de fraude en facturas"

Sapira: "¿Qué tecnología consideras usar? ¿Sería IA predictiva, 
         procesamiento de documentos, o una combinación?"

Tú: "IA predictiva con procesamiento de documentos"

Sapira: "¿Cuál es el impacto esperado? ¿Reducción de costes, 
         tiempo, o mejora en detección?"

Tú: "Reducir el tiempo de investigaciones de fraude"

Sapira: [Muestra tarjeta con propuesta]
        🚀 Propuesta de Initiative
        - Título: FraudFinder AI
        - Alcance: Fraudulent transactions detection
        - Tecnología Core: IDP + Predictive AI
        - Impacto: Reduce time on investigations
        - Complejidad: 3/3 (Compleja)
        - Impacto Negocio: 3/3 (Crítico)
        - Prioridad: P0 (Crítica)
```

### 3. Verificar en Base de Datos

Comprobar que el issue creado tenga:
- ✅ `short_description`
- ✅ `impact`
- ✅ `core_technology`
- ✅ `priority` calculada correctamente

---

## 🔐 Variables de Entorno en Render

Asegurarse de tener configuradas:

```env
MICROSOFT_APP_ID=<tu-app-id>
MICROSOFT_APP_PASSWORD=<tu-password>
MICROSOFT_APP_TENANT_ID=<tu-tenant-id>
GEMINI_API_KEY=<tu-gemini-key>
SAPIRA_API_URL=<url-de-tu-api>
NODE_ENV=production
PORT=3000
```

---

## 📊 Diferencias Clave

### ANTES (Soporte Técnico):
- Preguntaba sobre errores, dispositivos, navegadores
- Creaba "tickets de soporte"
- Campos: title, description, priority

### AHORA (Initiatives de IA/Automatización):
- Pregunta sobre tecnología, impacto en negocio, complejidad
- Crea "initiatives de automatización/IA"
- Campos adicionales:
  - `short_description`: Alcance breve
  - `impact`: Impacto en negocio
  - `core_technology`: Tecnología core
  - `difficulty`: 1-3 (complejidad técnica)
  - `impact_score`: 1-3 (impacto en negocio)
  - `priority`: Calculada automáticamente

**Cálculo de Prioridad:**
```
difficulty + impact_score = total
- 6 puntos → P0 (Crítica)
- 5 puntos → P1 (Alta)
- 3-4 puntos → P2 (Media)
- 2 puntos → P3 (Baja)
```

---

## 🔄 Rollback (si es necesario)

Si hay problemas después del deploy:

```bash
cd sapira-teams-bot

# Ver últimos commits
git log --oneline -5

# Revertir al commit anterior
git revert HEAD

# Push
git push origin main
```

---

## 📚 Documentación Relacionada

- `/AGENT_GONVARRI_UPDATE.md` - Resumen completo de cambios
- `/sapira-teams-bot/DEPLOYMENT_GONVARRI.md` - Guía de deployment
- `/sapira-teams-bot/bot/gonvarri-triage-guide.md` - Guía de triage

---

## ✅ Checklist Pre-Deploy

- [ ] Cambios revisados en local
- [ ] Variables de entorno verificadas en Render
- [ ] Backup de versión anterior (git commit anterior anotado)
- [ ] Equipo notificado del deploy programado

## ✅ Checklist Post-Deploy

- [ ] Health check OK
- [ ] Test de conversación exitoso
- [ ] Tarjeta adaptativa muestra campos correctos
- [ ] Initiative creada con todos los campos
- [ ] Prioridad calculada correctamente
- [ ] Equipo notificado de deploy completado

---

## 🎉 ¡Listo para Producción!

Una vez completados los pasos, el bot estará desplegado y funcionando con la nueva estructura de Gonvarri.

**Próximos pasos:**
1. Monitorear logs en Render por 24h
2. Recopilar feedback de usuarios
3. Ajustar prompts si es necesario

