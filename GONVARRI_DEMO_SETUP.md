# 🎯 Setup de Demo Gonvarri

Esta guía te ayudará a configurar los datos de Gonvarri en el sistema para la demo.

## 📋 Resumen de Cambios

Se han añadido los siguientes campos a la tabla `issues` para soportar las initiatives de Gonvarri:

- **`short_description`**: Descripción breve de la iniciativa
- **`impact`**: Impacto en el negocio (ej: "Reduced repetitive tasks")
- **`core_technology`**: Tecnología core utilizada (ej: "Predictive AI", "GenAI + Analytics")

### Fórmula de Prioridad

La prioridad se calcula automáticamente desde `difficulty` (1-3) + `impact_score` (1-3):

| Total | Prioridad |
|-------|-----------|
| 6     | P0 (Crítica) |
| 5     | P1 (Alta) |
| 3-4   | P2 (Media) |
| 2     | P3 (Baja) |

## 🚀 Pasos de Instalación

### 1. Ejecutar Migración SQL

Aplica la migración a Supabase:

```bash
# Opción A: Desde Supabase Dashboard
# Copia el contenido de supabase/migrations/add_gonvarri_fields_to_issues.sql
# y ejecútalo en el SQL Editor

# Opción B: CLI de Supabase (si está configurado)
supabase db push
```

### 2. Configurar Variables de Entorno

Asegúrate de tener las siguientes variables en tu `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # Solo para el script de import
```

### 3. Importar Datos de Gonvarri

Ejecuta el script de importación:

```bash
# Instalar tsx si no lo tienes
npm install -g tsx

# Ejecutar script de importación
npx tsx scripts/import-gonvarri-initiatives.ts
```

**Esto hará:**
- ✅ Crear 36 issues en estado `triage` desde el CSV
- ✅ Calcular la prioridad automáticamente
- ✅ Guardar 2 ejemplos para el bot (`GON-6` y `GON-50`)

### 4. Verificar la Importación

Ve a la página de Triage en tu aplicación:
```
http://localhost:3000/triage-new
```

Deberías ver todos los issues de Gonvarri listados con:
- 🟣 Badge de tecnología (ej: "Predictive AI")
- 🎯 Prioridad calculada (P0-P3)
- 📝 Descripción corta y metadata completa

## 📊 Estructura de Datos del CSV

El CSV `Gonvarri clean initiatives shared - Hoja 1.csv` contiene:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Initiative number | Número único | 6 |
| Initiative | Nombre | "Agile pricing" |
| Business unit | Departamento | "Finance" |
| Project | Proyecto | "Pricing" |
| Short Description | Resumen | "AI for pricing and discount margins" |
| Impact | Impacto | "Reduced repetitive tasks" |
| Core Technology | Tecnología | "Predictive AI" |
| Difficulty (1-3) | Dificultad técnica | 2 |
| Impact Score (1-3) | Impacto en negocio | 3 |

## 🎨 Cambios en la UI

### Página de Triage (`/triage-new`)

**Listado de issues:**
- Nuevo badge morado con icono de hexágono mostrando `core_technology`
- Se muestra junto a otros badges (Estado, Prioridad, Teams)

**Detalle de issue:**
- Sección **Resumen** (azul) con `short_description`
- Grid de 2 columnas:
  - **Impacto** (verde) con el valor de `impact`
  - **Tecnología Core** (morado) con `core_technology`
- Descripción completa debajo (gris)

### Página de Issues (`/issues`)

**Tarjetas de issue:**
- Descripción corta debajo del título
- Badge de tecnología (morado con emoji 🔧)
- Mejor visualización de información relevante

## 🤖 Bot de Teams - Conocimiento Actualizado

El bot ahora tiene contexto sobre las initiatives de Gonvarri:

**Archivo de guía**: `sapira-teams-bot/bot/gonvarri-triage-guide.md`

**Ejemplos guardados**: `sapira-teams-bot/bot/gonvarri-examples.json`

El bot puede:
- ✅ Sugerir campos Gonvarri al crear issues
- ✅ Calcular difficulty e impact_score basándose en ejemplos
- ✅ Proponer tecnologías core adecuadas
- ✅ Estimar prioridades correctamente

## 📝 Ejemplos Destacados

### GON-6: Agile Pricing
```json
{
  "title": "Agile pricing",
  "short_description": "AI for pricing and discount margins",
  "impact": "Reduced repetitive tasks",
  "core_technology": "Predictive AI",
  "priority": "P1"
}
```

### GON-50: FraudFinder AI
```json
{
  "title": "FraudFinder AI",
  "short_description": "Fraudulent transactions detection",
  "impact": "Reduce time on investigations",
  "core_technology": "IDP + Predictive AI",
  "priority": "P0"
}
```

## 🔍 Verificación Post-Setup

1. **Verifica la migración:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'issues' 
   AND column_name IN ('short_description', 'impact', 'core_technology');
   ```

2. **Cuenta los issues importados:**
   ```sql
   SELECT COUNT(*) FROM issues WHERE key LIKE 'GON-%';
   ```
   Debería devolver: **36**

3. **Verifica prioridades calculadas:**
   ```sql
   SELECT key, title, priority, short_description, core_technology 
   FROM issues 
   WHERE key LIKE 'GON-%' 
   ORDER BY priority;
   ```

## 🎯 Para la Demo

### Flujo Recomendado:

1. **Mostrar Triage**: Abre `/triage-new`
   - Muestra la lista de 36 initiatives
   - Explica los badges de tecnología

2. **Selecciona GON-50 (FraudFinder AI)**
   - Muestra el resumen en azul
   - Destaca el impacto (reduce tiempo de investigaciones)
   - Señala la tecnología (IDP + Predictive AI)
   - Prioridad P0 (crítica) por difficulty=3 + impact=3

3. **Acepta el issue**
   - Asigna a Finance (BU)
   - Asigna a proyecto "Invoicing"
   - Muestra cómo se mueve a backlog

4. **Mostrar Issues Board**: Abre `/issues`
   - Visualiza el issue en la columna "To Do"
   - Muestra el badge de tecnología
   - Explica la prioridad calculada

## 🛠️ Troubleshooting

### Error: "Missing Supabase credentials"
- Asegúrate de tener todas las variables de entorno configuradas
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté presente para el script

### Los issues no aparecen en Triage
- Verifica que el estado sea `'triage'`
- Chequea que `snooze_until` sea NULL o pasado

### Prioridades incorrectas
- Revisa que los valores de difficulty e impact_score en el CSV sean números 1-3
- Verifica la fórmula: `difficulty + impact_score = priority_score`

## 📚 Recursos Adicionales

- **Modelo de datos**: `/lib/database/MODEL.md`
- **API de Issues**: `/lib/api/issues.ts`
- **Tipos TypeScript**: `/lib/database/types.ts`
- **CSV original**: `/Gonvarri clean initiatives shared - Hoja 1.csv`

---

¿Problemas? Revisa los logs del script de importación y verifica la consola del navegador.
