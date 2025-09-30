# 🚀 Cómo Aplicar las Actualizaciones del Roadmap

## 📋 Resumen de la Estrategia

He creado una distribución estratégica de los **36 issues de Gonvarri** a lo largo de **2025**, organizada por trimestres:

### **Q1 2025** (Enero-Marzo) 🔴
**Foco: Finance & Critical Systems**
- ✅ 11 issues
- 🎯 Proyectos: Invoicing (en progreso), Pricing, Accounting
- 🔥 **FraudFinder AI** ya está en progreso (P0)

### **Q2 2025** (Abril-Junio) 🟡
**Foco: HR & Legal Compliance**
- ✅ 10 issues  
- 🎯 Proyectos: NPS, Compliance, Advisory
- 🔥 **ComplianceAI Mapper** (P0), **GonvAlrri desk** (P1)

### **Q3 2025** (Julio-Septiembre) 🟢
**Foco: Procurement & Sales**
- ✅ 6 issues
- 🎯 Proyectos: Negotiation, Processing, Operations
- 🔥 **Bid Crafter**, **Supplier negotiation cockpit**

### **Q4 2025** (Octubre-Diciembre) 🔵
**Foco: Analytics & Development**
- ✅ 6 issues
- 🎯 Proyectos: Upskilling, Reporting, Retention
- 🔥 **TalentInsight AI**, **AttritionPredictor**

---

## 🎯 Beneficios de esta Distribución

1. **Vista SEMANAL**: Ver issues específicos (2-4 semanas de duración)
2. **Vista MENSUAL**: Ver proyectos activos del mes
3. **Vista TRIMESTRAL**: Ver la estrategia completa por áreas de negocio
4. **Coherencia**: Basada en el CSV real de Gonvarri, respetando BUs y prioridades

---

## 📝 Opción 1: Ejecutar en Supabase SQL Editor (RECOMENDADO)

### Paso 1: Ir a Supabase Dashboard
```
https://app.supabase.com/project/lnglciqfrvnzjxynzeyc/editor
```

### Paso 2: Abrir SQL Editor
1. Click en **SQL Editor** en el menú lateral
2. Click en **New Query**

### Paso 3: Copiar y Ejecutar el SQL
```bash
# Desde terminal:
cat scripts/update-roadmap-dates.sql | pbcopy
```

Luego pega en el SQL Editor y click en **Run**.

---

## 📝 Opción 2: Ejecutar desde Terminal (si tienes acceso)

```bash
# Asegúrate de tener las credenciales en .env.local
npm run update-roadmap-dates
```

---

## 📊 Visualización después de Aplicar

Una vez aplicado, podrás ver en `/roadmap`:

### **Vista Semana** (Enero 2025)
```
Semana 1-3:  ■■■ FraudFinder AI (en progreso)
Semana 2-4:  ░░■ Invoice AutoFlow (inicio)
Semana 5+:   ░░░ InvoiceGenius (planificado)
```

### **Vista Mes** (Marzo 2025)
```
Invoicing:   ████ (3 issues finalizando)
Accounting:  ██░░ (2 issues iniciando)
Pricing:     ████ (1 issue completándose)
```

### **Vista Trimestre** (Q1 2025)
```
Finance:     ████████████ (80% foco)
HR:          ██░░░░░░░░░░ (15% foco)
Legal:       █░░░░░░░░░░░ (5% foco)
```

---

## ✅ Verificación Post-Actualización

Después de ejecutar el script, verifica:

1. **Proyectos distribuidos por trimestre**
   ```sql
   SELECT name, start_date, end_date, status 
   FROM projects 
   ORDER BY start_date;
   ```

2. **Issues con fechas coherentes**
   ```sql
   SELECT key, title, start_date, due_date, priority, state
   FROM issues 
   WHERE start_date IS NOT NULL
   ORDER BY start_date
   LIMIT 20;
   ```

3. **Distribución por estado**
   ```sql
   SELECT state, COUNT(*) as count
   FROM issues
   GROUP BY state;
   ```

Deberías ver:
- `in_progress`: 1 (FraudFinder AI)
- `todo`: 6 (Q1 planificados)
- `triage`: 29 (Q2-Q4 en evaluación)

---

## 📈 Datos Clave

- **Total issues**: 36
- **Total proyectos**: 12
- **Duración promedio por issue**: 3-5 semanas
- **Issues simultáneos por proyecto**: 2-4
- **Proyectos activos por trimestre**: 3-4

---

## 🎨 Distribución de Prioridades

| Prioridad | Issues | % | Descripción |
|-----------|--------|---|-------------|
| P0 | 4 | 11% | Crítico (Fraud, Compliance, Invoice core) |
| P1 | 18 | 50% | Alta (Automatizaciones principales) |
| P2 | 13 | 36% | Media (Mejoras y herramientas) |
| P3 | 1 | 3% | Baja (Translator - herramienta general) |

---

## 🚨 Troubleshooting

### Error: "syntax error at or near..."
- Asegúrate de copiar **todo el contenido** del archivo SQL
- Ejecuta en el SQL Editor de Supabase, no en terminal

### Error: "permission denied"
- Usa el **SQL Editor** en Supabase Dashboard
- No uses el endpoint de API (requiere permisos especiales)

### No veo cambios en el roadmap
- Recarga la página `/roadmap` (Cmd+R o Ctrl+R)
- Verifica que el script se ejecutó sin errores
- Comprueba las fechas en SQL Editor

---

## 📞 Archivos Relacionados

- **SQL Script**: `scripts/update-roadmap-dates.sql`
- **Estrategia completa**: `ROADMAP_STRATEGY.md`
- **Este archivo**: `APPLY_ROADMAP_UPDATES.md`

---

## ✨ Siguiente Paso

1. ✅ Revisar la estrategia en `ROADMAP_STRATEGY.md`
2. ⏳ **Ejecutar el SQL en Supabase Dashboard** ← ESTÁS AQUÍ
3. ⏳ Verificar visualización en `/roadmap`
4. ⏳ Ajustar fechas según feedback

**¡Listo para transformar tu roadmap! 🚀**
