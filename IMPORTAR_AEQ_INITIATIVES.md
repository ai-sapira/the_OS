# 📊 Importar Initiatives de AEQ - Guía Rápida

## ✅ Archivos preparados

1. **CSV original**: `CIMD – Initiatives Sapira OS - CIMD Initiatives.csv` (tu archivo)
2. **CSV convertido**: `aeq-initiatives-import.csv` (formato listo para importar)
3. **Script de conversión Gonvarri → AEQ**: `scripts/convert-gonvarri-to-aeq.sql`

## 🔄 Mapeo realizado

He convertido tu CSV al formato requerido:

| Tu campo | → | Nuestro campo | Ejemplo |
|----------|---|---------------|---------|
| **Stream** | → | business_unit_name | "Fundacionales", "Altas", "Contratos Core" |
| **Stream** (slug) | → | business_unit_slug | "fundacionales", "altas", "contratos-core" |
| **Project** | → | project_name | "Plataforma", "Onboarding", "Contratos" |
| **Project** (slug) | → | project_slug | "plataforma", "onboarding", "contratos" |
| **Initiative** | → | initiative_title | "BFF / API Gateway v1..." |
| **Short Description** | → | initiative_description | Descripción completa |
| **Owner** | → | reporter_email | pablo@sapira.ai / adolfo@sapira.ai |
| **Status** | → | status | done → done, to do → backlog |
| **Core Technology** | → | tags | "nestjs,bff,cache" |

## 📊 Resumen de datos convertidos

- **55 initiatives** listas para importar
- **10 Business Units**: Definición, Fundacionales, Altas, Contratos (Core/Renovaciones/Modificaciones/Bajas), Clientes, Dashboard & To-Dos, Billing & Commissions, Settings, Seguimiento
- **14 Projects**: Programa W2M, Plataforma, Frontend, Onboarding, Contratos, Renovaciones, Modificaciones, Bajas, Clientes, Dashboard, To-Dos, Facturación, Settings, Adopción, Post Go-Live
- **Owners**: Pablo Senabre (53 initiatives), Adolfo Güell (2 initiatives formación/soporte)

## 🚀 Pasos para importar

### Paso 1: Convertir Gonvarri → AEQ (si aún no lo has hecho)

```bash
# Ve a Supabase SQL Editor:
# https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

# Copia y ejecuta: scripts/convert-gonvarri-to-aeq.sql
```

### Paso 2: Importar el CSV

```bash
cd /Users/pablosenabre/Sapira/the_OS

# Ejecutar script de importación
npx tsx scripts/import-csv-to-db.ts aeq-initiatives-import.csv aeq
```

### Paso 3: Ver el resultado

El script mostrará el progreso en tiempo real:

```
📂 Reading CSV file: aeq-initiatives-import.csv
✅ Parsed 55 rows from CSV

🔍 Finding organization: aeq
✅ Found organization: AEQ Energy (01234567-8901-2345-6789-012345678901)

👥 Loading existing users...
✅ Found 2 existing users

📦 Creating Business Unit: Definición
  ✅ Created BU: xxx-xxx-xxx
  📁 Creating Project: Programa W2M Agentes
    ✅ Created Project: yyy-yyy-yyy
    📝 Creating Issue: Definición funcional y técnica...
    ✅ Created Issue: AEQ-001

...

============================================================
📊 IMPORT SUMMARY
============================================================
✅ Business Units created: 10
✅ Projects created: 14
✅ Issues created: 55
============================================================
```

### Paso 4: Verificar en la app

```bash
# Reiniciar la app
npm run dev

# Abrir en navegador
# http://localhost:3000

# Login con:
# Email: guillermo@sapira.ai (o pablo@sapira.ai)
# Password: [tu contraseña]
```

Deberías ver:
- ✅ Logo de AEQ Energy
- ✅ 10 Business Units en `/initiatives`
- ✅ 14 Projects en `/projects`
- ✅ 55 Issues en `/issues`

## 📋 Estructura de datos importados

### Business Units (Initiatives en BD):
```
1. Definición (definicion)
2. Fundacionales (fundacionales)
3. Altas (altas)
4. Contratos Core (contratos-core)
5. Contratos Renovaciones (contratos-renovaciones)
6. Contratos Modificaciones (contratos-modificaciones)
7. Contratos Bajas (contratos-bajas)
8. Clientes (clientes)
9. Dashboard & To-Dos (dashboard-todos)
10. Billing & Commissions (billing-commissions)
11. Settings (settings)
12. Seguimiento (seguimiento)
```

### Projects principales:
```
- Plataforma (8 initiatives fundacionales)
- Onboarding (9 initiatives de altas)
- Contratos (varios sub-proyectos)
- Dashboard, To-Dos, Facturación, Settings, etc.
```

### Prioridades asignadas:
- **Critical**: BFF, Autenticación, Seguridad OWASP
- **High**: Mayoría de fundacionales, formularios clave, dashboard
- **Medium**: Funcionalidades secundarias
- **Low**: Branding, exportaciones, algunos documentos

### Status:
- **1 done**: Definición funcional (Adolfo)
- **54 backlog**: Resto de initiatives pendientes

## 🎯 Próximos pasos

1. **Revisar en `/issues`**: Ver todas las initiatives importadas
2. **Filtrar por Project**: Usar filtros para ver por proyecto
3. **Mover a triage/in_progress**: Cambiar estados según avance
4. **Asignar a más usuarios**: Crear más usuarios si necesitas
5. **Ajustar prioridades**: Modificar según criterio de negocio

## ⚠️ Notas importantes

1. **Los usuarios pablo@sapira.ai y adolfo@sapira.ai ya existen** en la tabla `users` (creados por convert-gonvarri-to-aeq.sql)

2. **Si necesitas crear más usuarios** para asignar:
```sql
INSERT INTO users (id, name, email, role, organization_id, active)
VALUES (
  gen_random_uuid(),
  'Nombre Apellido',
  'email@ejemplo.com',
  'EMP',  -- o 'BU', 'CEO', 'SAP'
  '01234567-8901-2345-6789-012345678901',  -- AEQ org ID
  true
);
```

3. **Si quieres reimportar** (por ejemplo, para corregir datos):
   - Las Business Units y Projects existentes se reutilizarán
   - Las Issues se crearán de nuevo (no se duplican por título)

4. **Campos no importados** (no necesarios para el sistema actual):
   - Esfuerzo (semanas)
   - Dependencias
   - Impact
   - Start date / Finish date
   - Initiative number

## 📚 Archivos relacionados

- CSV original: `CIMD – Initiatives Sapira OS - CIMD Initiatives.csv`
- CSV convertido: `aeq-initiatives-import.csv`
- Script SQL: `scripts/convert-gonvarri-to-aeq.sql`
- Script import: `scripts/import-csv-to-db.ts`
- Guía CSV: `scripts/CSV_IMPORT_GUIDE.md`

---

**¿Listo para importar?** → Ve al **Paso 1** arriba ⬆️

