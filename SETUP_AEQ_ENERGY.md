# 🔋 Setup AEQ Energy - Guía Rápida

## ✅ Lo que ya está hecho

- ✅ Logo copiado a `/public/logos/aeq.png`
- ✅ Script SQL preparado en `scripts/convert-gonvarri-to-aeq.sql`

## 🚀 Cómo ejecutar (3 minutos)

### Paso 1: Abrir Supabase SQL Editor

Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

### Paso 2: Copiar y ejecutar el script

Abre el archivo `scripts/convert-gonvarri-to-aeq.sql` y copia TODO el contenido.

Pégalo en el SQL Editor y haz click en **"Run"** o **"RUN"**.

### Paso 3: Verificar los resultados

Deberías ver en los resultados:

```
✅ CONVERSIÓN COMPLETADA
org_name: AEQ Energy
org_slug: aeq
users_count: 2
auth_users_count: 2
```

### Paso 4: Reiniciar la app

```bash
cd /Users/pablosenabre/Sapira/the_OS
npm run dev
```

### Paso 5: Entrar con Guillermo o Pablo

Abre http://localhost:3000

Login con:
- Email: `guillermo@sapira.ai` (o `pablo@sapira.ai`)
- Password: [tu contraseña actual]

**Deberías ver:**
- Logo de AEQ en el sidebar y header
- Organización: "AEQ Energy" en lugar de "Gonvarri"

## 📊 ¿Qué hace el script exactamente?

1. **Convierte Gonvarri → AEQ Energy**
   - Cambia el nombre de la organización
   - Cambia el slug: `gonvarri` → `aeq`
   - Configura el logo: `/logos/aeq.png`

2. **Crea 2 usuarios en tabla `users`** (para asignar issues):
   - `pablo@sapira.ai` (ID: aaaaaaaa-0000-0000-0000-000000000001)
   - `adolfo@sapira.ai` (ID: aaaaaaaa-0000-0000-0000-000000000002)

3. **NO toca los usuarios de login** (auth.users):
   - `guillermo@sapira.ai` → sigue pudiendo entrar
   - `pablo@sapira.ai` → sigue pudiendo entrar

## 🔍 Estado actual vs después

### ANTES (Gonvarri):
```
Organizations:
├─ Gonvarri (slug: gonvarri)
├─ Aurovitas (slug: aurovitas)
└─ Cosermo (slug: cosermo)

Auth users (login):
├─ guillermo@sapira.ai → Gonvarri (SAP)
├─ pablo@sapira.ai → Gonvarri (SAP)
├─ gerardo@aurovitas.com → Aurovitas (CEO)
└─ javiergarcia@cosermo.com → Cosermo (CEO)
```

### DESPUÉS (AEQ Energy):
```
Organizations:
├─ AEQ Energy (slug: aeq) ⬅️ CAMBIADO
├─ Aurovitas (slug: aurovitas)
└─ Cosermo (slug: cosermo)

Auth users (login):
├─ guillermo@sapira.ai → AEQ Energy (SAP) ⬅️ ACTUALIZADO
├─ pablo@sapira.ai → AEQ Energy (SAP) ⬅️ ACTUALIZADO
├─ gerardo@aurovitas.com → Aurovitas (CEO)
└─ javiergarcia@cosermo.com → Cosermo (CEO)

Users (para asignar):
├─ pablo@sapira.ai → AEQ Energy ⬅️ NUEVO
└─ adolfo@sapira.ai → AEQ Energy ⬅️ NUEVO
```

## 💡 Siguiente paso: Importar datos

Una vez que tengas AEQ configurado, puedes importar Business Units, Projects e Initiatives desde CSV:

```bash
# 1. Prepara tu CSV (ver scripts/example-import.csv)
# 2. Ejecuta:
npx tsx scripts/import-csv-to-db.ts mi-datos-aeq.csv aeq
```

Ver guía completa en: `scripts/CSV_IMPORT_GUIDE.md`

## ❓ FAQ

**¿Se pierden datos de Gonvarri?**
No se borran datos, solo se renombra la organización. Todos los issues, projects y business units que existían siguen ahí.

**¿Qué pasa con los otros usuarios (Aurovitas, Cosermo)?**
No se tocan. Siguen funcionando normal.

**¿Puedo volver atrás?**
Sí, solo ejecuta:
```sql
UPDATE organizations
SET name = 'Gonvarri', slug = 'gonvarri'
WHERE id = '01234567-8901-2345-6789-012345678901';
```

**¿Y si quiero crear Adolfo para login también?**
Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users
- Click "Add user"
- Email: adolfo@sapira.ai
- Password: [la que quieras]
- Auto confirm: ✅
- Luego vincúlalo a AEQ con:
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
SELECT id, '01234567-8901-2345-6789-012345678901', 'SAP', true
FROM auth.users WHERE email = 'adolfo@sapira.ai';
```

## 📝 Archivos relacionados

- Script SQL: `scripts/convert-gonvarri-to-aeq.sql`
- Logo: `public/logos/aeq.png`
- Guía CSV: `scripts/CSV_IMPORT_GUIDE.md`
- Ejemplo CSV: `scripts/example-import.csv`

---

**¿Listo para ejecutar?** → Ve al **Paso 1** arriba ⬆️




