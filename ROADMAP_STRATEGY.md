# 📅 Estrategia de Roadmap - Gonvarri 2025

## 🎯 Visión General

Distribución estratégica de 36 iniciativas de Gonvarri a lo largo de 2025, organizadas por trimestres y prioridades para facilitar la visualización en diferentes escalas temporales.

---

## 📊 Distribución por Trimestre

### **Q1 2025 (Enero-Marzo) - Finance & Critical Systems** 🔴
**Foco:** Sistemas críticos de facturación y detección de fraude

| Proyecto | Issues | Estado | Prioridad |
|----------|--------|--------|-----------|
| **Invoicing** | 6 | In Progress | P0-P1 |
| **Pricing** | 1 | Planned | P1 |
| **Accounting** | 4 | Planned | P2 |

**Iniciativas clave:**
- ✅ `GON-50` FraudFinder AI (En progreso, P0)
- 🔄 `GON-36` Invoice AutoFlow (P0)
- 🔄 `GON-47` InvoiceGenius (P1)

**Duración típica de issues:** 2-4 semanas

---

### **Q2 2025 (Abril-Junio) - HR & Legal Compliance** 🟡
**Foco:** Experiencia de empleados y cumplimiento legal

| Proyecto | Issues | Estado | Prioridad |
|----------|--------|--------|-----------|
| **NPS** | 5 | Planned | P1-P2 |
| **Compliance** | 2 | Planned | P0-P1 |
| **Advisory** | 3 | Planned | P2 |

**Iniciativas clave:**
- 🎯 `GON-51` ComplianceAI Mapper (P0 - Legal)
- 🎯 `GON-11` GonvAlrri desk (P1 - HR)
- 🎯 `GON-55` Onboarding Buddy (P2 - HR)

**Duración típica de issues:** 3-6 semanas

---

### **Q3 2025 (Julio-Septiembre) - Procurement & Sales** 🟢
**Foco:** Automatización de ventas y compras

| Proyecto | Issues | Estado | Prioridad |
|----------|--------|--------|-----------|
| **Negotiation** | 2 | Planned | P1 |
| **Processing** | 3 | Planned | P1-P2 |
| **Operations** | 1 | Planned | P2 |

**Iniciativas clave:**
- 🎯 `GON-27` Supplier negotiation cockpit (P1)
- 🎯 `GON-24` Bid Crafter (P1)
- 🎯 `GON-28` Customer Negotiation Cockpit (P1)

**Duración típica de issues:** 3-4 semanas

---

### **Q4 2025 (Octubre-Diciembre) - Analytics & Development** 🔵
**Foco:** Desarrollo de talento y analítica de negocio

| Proyecto | Issues | Estado | Prioridad |
|----------|--------|--------|-----------|
| **Upskilling** | 2 | Planned | P2 |
| **Reporting** | 3 | Planned | P1-P2 |
| **Retention** | 1 | Planned | P1 |

**Iniciativas clave:**
- 🎯 `GON-77` TalentInsight AI (P1)
- 🎯 `GON-59` AttritionPredictor (P1)
- 🎯 `GON-94` PathFinder GenAI (P2)

**Duración típica de issues:** 5-7 semanas

---

## 🔍 Visualización por Escala

### **Vista SEMANAL** (1-2 semanas)
Perfecto para ver:
- Issues individuales en progreso
- Tareas específicas del sprint actual
- Dependencias a corto plazo

**Ejemplo Enero 2025:**
- Semana 1-2: FraudFinder AI (en progreso)
- Semana 3-4: Invoice AutoFlow (inicio)

---

### **Vista MENSUAL** (4 semanas)
Perfecto para ver:
- Proyectos del mes actual
- Hitos mensuales
- Coordinación entre equipos

**Ejemplo Marzo 2025:**
- Invoicing: 3 issues finalizando
- Accounting: 2 issues iniciando
- Pricing: 1 issue completándose

---

### **Vista TRIMESTRAL** (3 meses)
Perfecto para ver:
- Estrategia de negocio
- Temas/áreas de enfoque
- Roadmap ejecutivo

**Ejemplo Q1 2025:**
- Foco en Finance (80% recursos)
- 11 iniciativas totales
- 3 proyectos principales

---

## 📈 Distribución de Prioridades

```
P0 (Crítico):     4 issues  (11%)  - FraudFinder, ComplianceAI, Invoice AutoFlow
P1 (Alta):       18 issues  (50%)  - Mayoría de automatizaciones core
P2 (Media):      13 issues  (36%)  - Mejoras y herramientas de apoyo
P3 (Baja):        1 issue   (3%)   - Translator (herramienta general)
```

---

## 🎨 Estados del Roadmap

| Estado | Issues | Descripción |
|--------|--------|-------------|
| **in_progress** | 1 | FraudFinder AI (ya iniciado) |
| **todo** | 6 | Q1 planificado para iniciar |
| **triage** | 29 | En evaluación para Q2-Q4 |

---

## 🏢 Distribución por Business Unit

| BU | Proyectos | Issues | % Total |
|----|-----------|--------|---------|
| **Finance** | 3 | 13 | 36% |
| **HR** | 4 | 11 | 31% |
| **Legal** | 2 | 5 | 14% |
| **Procurement** | 3 | 4 | 11% |
| **Sales** | 1 | 3 | 8% |

---

## 📋 Aplicar esta Estrategia

### Opción 1: Ejecutar script SQL
```bash
# Desde Supabase SQL Editor
cat scripts/update-roadmap-dates.sql
# Copiar y ejecutar en Supabase Dashboard
```

### Opción 2: Usar script TypeScript
```bash
cd /Users/pablosenabre/Sapira/the_OS
npm run update-roadmap-dates
```

---

## ✅ Beneficios de esta Distribución

1. **Visualización clara en todas las escalas**
   - Semana: Issues específicos
   - Mes: Proyectos activos
   - Trimestre: Estrategia completa

2. **Priorización coherente**
   - Q1: Sistemas críticos (Finance)
   - Q2: Compliance y cultura (Legal/HR)
   - Q3: Eficiencia operativa (Procurement/Sales)
   - Q4: Desarrollo a largo plazo (Analytics/Upskilling)

3. **Distribución realista**
   - 2-7 semanas por issue (según complejidad)
   - 2-4 issues simultáneos por proyecto
   - 3-4 proyectos activos por trimestre

4. **Coherencia con CSV de Gonvarri**
   - Todos los 36 issues del CSV incluidos
   - Business Units correctamente asignadas
   - Tecnologías core respetadas

---

## 🚀 Próximos Pasos

1. ✅ Revisar distribución trimestral
2. ⏳ Ejecutar script de actualización
3. ⏳ Verificar visualización en roadmap
4. ⏳ Ajustar fechas según feedback del equipo
