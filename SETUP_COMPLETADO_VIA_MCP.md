# ✅ Setup Completado Vía Supabase MCP

## 🎉 Lo que se ha hecho AUTOMÁTICAMENTE

### ✅ 1. Migración RLS Aplicada
- Políticas RLS actualizadas para SAP override
- Índices de performance creados
- Políticas para: issues, projects, initiatives, users, user_organizations

### ✅ 2. Issues de Prueba Creados

#### Para Juan Pérez (Employee Demo):
- **SAI-8675**: Actualizar dashboard de métricas financieras (P1, in_progress)
- **SAI-8676**: Revisar reportes mensuales de facturación (P2, todo)
- **SAI-8677**: Optimizar proceso de aprobación de presupuestos (P3, todo)

#### Para Miguel López y Finance BU:
- **SAI-8678**: Integración con nuevo sistema contable (P0, in_progress)
- **SAI-8679**: Análisis de costos Q4 2024 (P1, todo)
- **SAI-8680**: Auditoría interna mensual (P2, todo)

### ✅ 3. Verificación Completada

**Usuarios Mock Confirmados:**
- SAP: Pablo Senabre (`11111111-1111-1111-1111-111111111111`)
- CEO: CEO Director (`22222222-2222-2222-2222-222222222222`)
- BU: Miguel López (`55555555-5555-5555-5555-555555555555`) → Finance
- EMP: Juan Pérez (`77777777-7777-7777-7777-777777777777`)

**Organizaciones:**
- Gonvarri: `01234567-8901-2345-6789-012345678901`
- Aurovitas: `22222222-2222-2222-2222-222222222222`

---

## ⚠️ Lo que DEBES HACER MANUALMENTE (5 minutos)

### Paso 1: Crear Auth User para SAP

1. Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. Click en **"Add User"** → **"Create new user"**

3. Completar:
   ```
   Email: pablo@sapira.com
   Password: [elige un password seguro - ANÓTALO]
   Auto Confirm User: ✅ YES
   ```

4. Click **"Create user"**

5. **IMPORTANTE:** Copia el **UUID** del usuario creado (aparece en la lista)

---

### Paso 2: Vincular Auth User a Gonvarri

Una vez creado el auth user y copiado su UUID, ejecuta este SQL en Supabase:

```sql
-- PASO 2A: Vincular usuario SAP a Gonvarri
-- REEMPLAZA 'UUID_AQUI' con el UUID que copiaste del paso 1

INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'UUID_AQUI',  -- ⚠️ CAMBIAR por UUID del auth user
  '01234567-8901-2345-6789-012345678901',  -- Gonvarri
  'SAP',
  true
)
ON CONFLICT (auth_user_id, organization_id) 
DO UPDATE SET role = 'SAP', active = true;

-- PASO 2B: Actualizar tabla users para vincular auth_user_id
UPDATE users
SET auth_user_id = 'UUID_AQUI'  -- ⚠️ MISMO UUID del paso anterior
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND email = 'pablo@sapira.com';

-- PASO 2C: Verificar que funcionó
SELECT 
  u.email,
  o.name,
  uo.role
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE u.id = 'UUID_AQUI';  -- ⚠️ MISMO UUID

-- Debe mostrar: pablo@sapira.com | Gonvarri | SAP
```

---

### Paso 3: Deploy a Vercel

```bash
git add .
git commit -m "feat: SAP demo mode implementation with RLS and test data"
git push origin main

# Esperar ~2-3 minutos para que Vercel despliegue
```

---

### Paso 4: Probar en Producción

1. Ve a: **https://app.sapira.com**

2. Login:
   ```
   Email: pablo@sapira.com
   Password: [el que creaste en Paso 1]
   ```

3. Seleccionar: **Gonvarri**

4. ✅ **Verificar que aparece RoleSwitcher** en header

5. **Probar cambios de rol:**

   a) Cambiar a **CEO**:
      - Debe ver todos los proyectos
      - Debe ver todas las initiatives
      - Debe ver ~44 issues (los 38 originales + los 6 nuevos)
   
   b) Cambiar a **BU Manager** (Finance):
      - Solo proyectos de Finance
      - Solo issues de Finance
      - Debe ver ~7 issues de Finance
   
   c) Cambiar a **Employee** (Juan Pérez):
      - Solo sus issues asignados
      - Debe ver 3 issues (SAI-8675, 8676, 8677)

6. **Verificar consola** (F12):
   - No debe haber errores en rojo
   - Pueden aparecer logs azules de `[useSupabaseData]` (normal)

---

## ✅ Checklist Final

- [ ] Auth user creado (`pablo@sapira.com`)
- [ ] UUID del auth user copiado
- [ ] SQL del Paso 2 ejecutado (3 queries)
- [ ] Verificación SQL muestra: `Gonvarri | SAP`
- [ ] Deploy a Vercel completado
- [ ] Login funciona en app.sapira.com
- [ ] RoleSwitcher aparece en header
- [ ] Cambio a CEO funciona (ve todo)
- [ ] Cambio a BU funciona (ve solo Finance)
- [ ] Cambio a Employee funciona (ve 3 issues)
- [ ] No hay errores en consola

---

## 📊 Datos de Demo Listos

### Vista CEO (todo)
- Total issues: ~44
- Total initiatives: 6
- Total proyectos: Todos de Gonvarri

### Vista BU Manager (Finance)
- Issues de Finance: ~7
- Proyectos de Finance: Solo los de esa BU
- Ejemplos de issues:
  - SAI-8675: Dashboard métricas (P1, in_progress) - Juan Pérez
  - SAI-8678: Integración contable (P0, in_progress) - Miguel López
  - SAI-8679: Análisis costos Q4 (P1, todo) - María González

### Vista Employee (Juan Pérez)
- Issues asignados: 3
  - SAI-8675: Dashboard métricas (P1, in_progress)
  - SAI-8676: Reportes facturación (P2, todo)
  - SAI-8677: Optimizar presupuestos (P3, todo)
- Vista simplificada sin roadmap ni métricas globales

---

## 🎬 Guión de Demo Sugerido

```
👋 Inicio
"Les voy a mostrar Sapira OS desde diferentes perspectivas"

📊 CEO (cambiar a CEO)
"Primero, la vista ejecutiva completa..."
→ Mostrar roadmap, todas las BUs, métricas globales
→ "El CEO tiene visibilidad total de las 6 business units"

🏢 BU Manager (cambiar a BU)
"Ahora como Manager de Finance..."
→ Mostrar solo proyectos de Finance
→ Mostrar issues de Finance (SAI-8678, 8679, etc.)
→ "Solo ve su área, optimizando su foco"

👤 Employee (cambiar a EMP)
"Y finalmente, un empleado como Juan..."
→ Mostrar sus 3 issues
→ Vista simple y clara
→ "Solo ve lo que necesita para trabajar"

✨ Cierre
"Cada rol ve exactamente lo relevante para su función"
```

---

## 📚 Documentación Completa

- **SAP_DEMO_MODE.md** - Guía completa de uso
- **IMPLEMENTATION_SUMMARY.md** - Detalles técnicos
- **READY_TO_DEPLOY.md** - Checklist pre-deploy

---

## 🎯 ¡Listo para tu Primera Demo!

Solo necesitas:
1. ✅ Crear auth user (2 min)
2. ✅ Ejecutar SQL (1 min)
3. ✅ Deploy (automático)
4. ✅ Probar (5 min)

**Total: ~10 minutos y listo para demo a Gonvarri** 🚀

---

**Generado automáticamente vía Supabase MCP**  
**Fecha:** 2025-01-03  
**Estado:** ✅ 90% Completado - Solo falta crear auth user

