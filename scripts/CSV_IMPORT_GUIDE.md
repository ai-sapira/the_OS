# Guía de Importación CSV a Base de Datos

Esta guía explica cómo importar Business Units, Projects e Initiatives (Issues) desde un archivo CSV directamente a tu base de datos de Supabase.

## 📋 Requisitos previos

1. **Usuarios existentes**: Los emails de `reporter_email` y `assignee_email` deben corresponder a usuarios ya creados en la base de datos
2. **Organización existente**: La organización debe estar creada previamente en Supabase
3. **Variables de entorno**: Debes tener configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Formato del CSV

### Columnas requeridas:

| Columna | Descripción | Ejemplo | Obligatorio |
|---------|-------------|---------|-------------|
| `business_unit_name` | Nombre del departamento/BU | Finance | ✅ |
| `business_unit_slug` | Identificador único de BU | finance | ✅ |
| `project_name` | Nombre del proyecto | ERP Migration | ✅ |
| `project_slug` | Identificador único de proyecto | erp-migration | ✅ |
| `initiative_title` | Título de la iniciativa/issue | Optimize invoice processing | ✅ |
| `initiative_description` | Descripción detallada | Reduce manual processing time | ⚪ |
| `priority` | Prioridad: low, medium, high, critical | high | ⚪ (default: medium) |
| `status` | Estado: triage, backlog, in_progress, done | backlog | ⚪ (default: triage) |
| `reporter_email` | Email del reportero (debe existir) | miguel@company.com | ✅ |
| `assignee_email` | Email del asignado (debe existir) | ana@company.com | ⚪ |
| `rise_score` | Puntuación 0-100 | 85 | ⚪ (se calcula automático) |
| `tags` | Tags separados por comas | "automation,finance" | ⚪ |

### Valores válidos:

**Priority:**
- `low` - Baja prioridad
- `medium` - Prioridad media (default)
- `high` - Alta prioridad
- `critical` - Crítico

**Status:**
- `triage` - Pendiente de revisión (default)
- `backlog` - Aceptado, en backlog
- `in_progress` - En progreso
- `done` - Completado
- `declined` - Rechazado

## 🚀 Cómo usar

### Paso 1: Preparar tu CSV

Crea un archivo CSV siguiendo el formato. Puedes usar el archivo de ejemplo:

```bash
# Ver el ejemplo incluido
cat scripts/example-import.csv
```

O crear tu propio CSV:

```csv
business_unit_name,business_unit_slug,project_name,project_slug,initiative_title,initiative_description,priority,status,reporter_email,assignee_email,rise_score,tags
Finance,finance,ERP Migration,erp-migration,Optimize invoice processing,Reduce manual processing,high,backlog,miguel@gonvarri.com,ana@gonvarri.com,85,"automation,finance"
Sales,sales,Customer Portal,customer-portal,Add payment gateway,Integrate Stripe,critical,in_progress,carlos@gonvarri.com,juan@gonvarri.com,92,"payments,integration"
```

### Paso 2: Ejecutar el script de importación

```bash
# Sintaxis
npx tsx scripts/import-csv-to-db.ts <ruta_al_csv> <slug_organizacion>

# Ejemplo con el archivo de muestra
npx tsx scripts/import-csv-to-db.ts scripts/example-import.csv gonvarri

# Ejemplo con tu propio archivo
npx tsx scripts/import-csv-to-db.ts ~/Downloads/my-initiatives.csv gonvarri
```

### Paso 3: Revisar el resultado

El script mostrará el progreso en tiempo real:

```
📂 Reading CSV file: scripts/example-import.csv
✅ Parsed 13 rows from CSV

🔍 Finding organization: gonvarri
✅ Found organization: Gonvarri (xxx-xxx-xxx)

👥 Loading existing users...
✅ Found 8 existing users

📦 Creating Business Unit: Finance
  ✅ Created BU: yyy-yyy-yyy
  📁 Creating Project: ERP Migration
    ✅ Created Project: zzz-zzz-zzz
    📝 Creating Issue: Optimize invoice processing
    ✅ Created Issue: GON-123

...

============================================================
📊 IMPORT SUMMARY
============================================================
✅ Business Units created: 6
✅ Projects created: 8
✅ Issues created: 13
============================================================
```

## ⚠️ Notas importantes

### 1. **Usuarios deben existir primero**
Los emails en `reporter_email` y `assignee_email` deben corresponder a usuarios ya creados. Si un usuario no existe, esa fila será saltada.

Para crear usuarios antes, ejecuta:
```sql
-- Ver scripts/setup-<organization>.sql para ejemplos
```

### 2. **Slugs únicos**
- Los slugs deben ser únicos dentro de cada organización
- Usa minúsculas, sin espacios, sin acentos
- Ejemplo válido: `erp-migration`, `customer-portal`
- Ejemplo inválido: `ERP Migration`, `portal clientes`

### 3. **Tags entre comillas**
Si tus tags contienen comas, envuélvelos en comillas dobles:
```csv
...,tags
...,"automation,finance,urgent"
```

### 4. **El script es idempotente**
- Si ejecutas el script múltiples veces con los mismos datos, usará las entidades existentes
- No creará duplicados si los slugs ya existen
- Sí creará nuevas issues cada vez (no las dupla por título)

### 5. **Campos opcionales vacíos**
Puedes dejar campos opcionales vacíos:
```csv
...,assignee_email,rise_score,tags
...,,75,
...,ana@company.com,,
```

## 🔧 Troubleshooting

### Error: "Organization not found"
- Verifica que el slug de organización esté bien escrito
- Lista organizaciones disponibles:
```sql
SELECT id, name, slug FROM organizations;
```

### Error: "Reporter email not found"
- El email del reporter no existe en la base de datos
- Crea el usuario primero o usa un email existente

### Error: "CSV parse error"
- Verifica que tu CSV esté bien formateado
- Asegúrate de que los campos con comas estén entre comillas dobles
- Usa UTF-8 como codificación del archivo

### Error: "Missing environment variables"
- Verifica que tengas `.env.local` configurado con:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 📊 Ejemplo completo de flujo

```bash
# 1. Crear tu CSV (puedes usar Excel y exportar como CSV)
# Guárdalo como: ~/Desktop/my-initiatives.csv

# 2. Verificar que los usuarios existan
psql -h <supabase-host> -U postgres -d postgres -c "SELECT email FROM auth.users;"

# 3. Ejecutar la importación
npx tsx scripts/import-csv-to-db.ts ~/Desktop/my-initiatives.csv gonvarri

# 4. Verificar en la aplicación
# Ve a https://your-app.com/issues
```

## 💡 Tips

- **Usa Excel o Google Sheets** para crear el CSV, es más fácil
- **Exporta como CSV UTF-8** para evitar problemas con acentos
- **Empieza con pocas filas** para probar que todo funciona
- **Revisa los slugs** antes de importar - deben ser únicos
- **Prepara usuarios primero** - crea todos los usuarios antes de importar

## 🎯 Próximos pasos

Una vez importados los datos:
1. Ve a `/issues` para ver todas las iniciativas
2. Ve a `/projects` para ver los proyectos
3. Ve a `/initiatives` para ver las business units
4. Asigna usuarios adicionales si es necesario
5. Ajusta prioridades y estados según evolucione el trabajo










