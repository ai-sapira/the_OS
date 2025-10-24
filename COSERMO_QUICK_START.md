# ⚡ Cosermo - Quick Start (5 minutos)

Guía ultra rápida para activar Cosermo en 5 minutos.

---

## 🎯 Paso 1: Crear Organización (30 segundos)

1. **Abre:** https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

2. **Ejecuta:**
```sql
INSERT INTO organizations (id, name, slug, settings)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Cosermo',
  'cosermo',
  '{"sla_matrix": {"P0": {"hours": 4}, "P1": {"hours": 24}, "P2": {"hours": 72}, "P3": {"hours": 168}}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
```

3. **Verifica:**
```sql
SELECT name, slug FROM organizations WHERE slug = 'cosermo';
```
✅ Deberías ver: `Cosermo | cosermo`

---

## 👤 Paso 2: Crear Usuario CEO (1 minuto)

1. **Abre:** https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. **Click:** "Add user" → "Create new user"

3. **Rellena:**
   - Email: `ceo@cosermo.com`
   - Password: `cosermo123`
   - ✅ Auto Confirm User

4. **Crea** y **copia el UUID** (se ve en la columna ID)

---

## 🔗 Paso 3: Vincular Usuario (30 segundos)

1. **Vuelve al SQL Editor**

2. **Ejecuta** (reemplaza `TU_UUID_AQUI`):
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'TU_UUID_AQUI',  -- ⬅️ PEGA AQUÍ EL UUID QUE COPIASTE
  '33333333-3333-3333-3333-333333333333',
  'CEO',
  true
);
```

3. **Verifica:**
```sql
SELECT au.email, o.name, uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE au.email = 'ceo@cosermo.com';
```
✅ Deberías ver: `ceo@cosermo.com | Cosermo | CEO`

---

## 🚀 Paso 4: Probar Login (1 minuto)

1. **Ejecuta la app:**
```bash
pnpm dev
```

2. **Abre:** http://localhost:3000

3. **Login:**
   - Email: `ceo@cosermo.com`
   - Password: `cosermo123`

4. **Verifica:**
   - ✅ Header muestra "Cosermo"
   - ✅ No hay issues (vacío)
   - ✅ Puedes crear contenido nuevo

---

## ✅ ¡Listo!

**Credenciales:**
```
Email:    ceo@cosermo.com
Password: cosermo123
Org:      Cosermo (vacía)
```

**Próximos pasos opcionales:**
- Crear más usuarios: `/SETUP_COSERMO.md`
- Añadir logo: `/COSERMO_LOGO_INSTRUCTIONS.md`
- Crear Business Units: ver `/scripts/setup-cosermo.sql`

---

## 🔍 Verificación Rápida

```sql
-- Ver todas las organizaciones
SELECT name, slug FROM organizations ORDER BY name;

-- Ver usuarios de Cosermo
SELECT au.email, uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
WHERE uo.organization_id = '33333333-3333-3333-3333-333333333333';

-- Verificar que Cosermo está vacía
SELECT 
  'Issues' as tipo, COUNT(*) as cantidad 
FROM issues 
WHERE organization_id = '33333333-3333-3333-3333-333333333333'
UNION ALL
SELECT 'Projects', COUNT(*) 
FROM projects 
WHERE organization_id = '33333333-3333-3333-3333-333333333333';
```

---

**¿Problemas?** Consulta: `/SETUP_COSERMO.md` → Troubleshooting




