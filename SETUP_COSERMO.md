# 🏭 Setup Cosermo - Guía Paso a Paso

Organización vacía lista para usar, sin romper Gonvarri ni Aurovitas.

---

## ✅ ¿Qué vas a tener?

- ✅ Organización **Cosermo** creada y funcional
- ✅ Sistema de login separado de otras organizaciones
- ✅ **Vacía de contenido** (sin issues, projects, initiatives)
- ✅ Capacidad de **asignar usuarios** a issues
- ✅ Compatible con usuarios de tipo CEO, BU Manager y Empleado
- ✅ Sin afectar a Gonvarri ni Aurovitas

---

## 📋 Proceso Completo (5-10 minutos)

### **PASO 1: Crear la Organización** ✨

1. **Abre el SQL Editor de Supabase:**
   👉 https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

2. **Copia y ejecuta este SQL:**
   ```sql
   INSERT INTO organizations (id, name, slug, settings)
   VALUES (
     '33333333-3333-3333-3333-333333333333',
     'Cosermo',
     'cosermo',
     '{
       "sla_matrix": {
         "P0": {"hours": 4},
         "P1": {"hours": 24},
         "P2": {"hours": 72},
         "P3": {"hours": 168}
       }
     }'::jsonb
   )
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Verifica que se creó:**
   ```sql
   SELECT id, name, slug FROM organizations WHERE slug = 'cosermo';
   ```
   
   ✅ Deberías ver: `Cosermo | cosermo | 33333333-3333-3333-3333-333333333333`

---

### **PASO 2: Crear Usuario(s) en Supabase Auth** 👤

1. **Abre Authentication en Supabase:**
   👉 https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. **Click en "Add user" → "Create new user"**

3. **Crea el primer usuario** (por ejemplo, un CEO):
   ```
   Email:             ceo@cosermo.com
   Password:          cosermo123
   Auto Confirm User: ✅ (marcar)
   ```

4. **Click "Create user"**

5. **⚠️ IMPORTANTE:** Copia el **UUID** del usuario
   - Aparece en la columna "ID" de la tabla
   - Se ve algo así: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

6. **Repite** para crear más usuarios si necesitas:
   - `manager@cosermo.com`
   - `empleado@cosermo.com`
   - etc.

---

### **PASO 3: Vincular Usuarios a Cosermo** 🔗

1. **Vuelve al SQL Editor:**
   👉 https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

2. **Ejecuta este SQL** (reemplaza `UUID_AQUI` con los UUIDs que copiaste):

   ```sql
   -- Para CEO
   INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
   VALUES (
     'UUID_AQUI',  -- ⬅️ Pega aquí el UUID del CEO
     '33333333-3333-3333-3333-333333333333',
     'CEO',
     NULL,
     true
   )
   ON CONFLICT (auth_user_id, organization_id) DO NOTHING;
   ```

3. **Si creaste más usuarios**, repite con sus UUIDs:
   ```sql
   -- Para Manager (si lo creaste)
   INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
   VALUES (
     'UUID_MANAGER',  -- ⬅️ UUID del manager
     '33333333-3333-3333-3333-333333333333',
     'BU',  -- o 'EMP' si es empleado
     NULL,
     true
   );
   ```

4. **Verifica la vinculación:**
   ```sql
   SELECT 
     au.email,
     o.name as organization,
     uo.role,
     uo.active
   FROM user_organizations uo
   JOIN auth.users au ON au.id = uo.auth_user_id
   JOIN organizations o ON o.id = uo.organization_id
   WHERE o.slug = 'cosermo';
   ```

   ✅ Deberías ver:
   ```
   email            | organization | role | active
   -----------------|--------------|------|-------
   ceo@cosermo.com  | Cosermo      | CEO  | true
   ```

---

### **PASO 4: Probar el Login** 🚀

1. **Asegúrate de que la app está corriendo:**
   ```bash
   cd /Users/pablosenabre/Sapira/the_OS
   pnpm dev
   ```

2. **Abre el navegador:**
   ```
   http://localhost:3000
   ```

3. **Haz Login:**
   ```
   Email:    ceo@cosermo.com
   Password: cosermo123
   ```

4. **Verificaciones:**
   - ✅ Header muestra "Cosermo"
   - ✅ No hay issues (está vacío)
   - ✅ No hay projects (está vacío)
   - ✅ Puedes crear nuevo contenido desde cero

---

## 🎨 Añadir Logo (Cuando lo Tengas)

1. **Guarda el logo:**
   ```
   /public/logos/cosermo.svg
   ```
   o
   ```
   /public/logos/cosermo.png
   ```

2. **Actualiza la base de datos** (opcional):
   ```sql
   UPDATE organizations
   SET settings = settings || '{"logo": "/logos/cosermo.svg"}'::jsonb
   WHERE id = '33333333-3333-3333-3333-333333333333';
   ```

3. **El sistema** debería mostrar automáticamente el logo en el header/selector de organizaciones

---

## 📊 Business Units (Opcional)

Si Cosermo necesita departamentos/BUs desde el inicio:

```sql
INSERT INTO initiatives (organization_id, name, slug, description, active)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Producción', 'produccion', 'Departamento de Producción', true),
  ('33333333-3333-3333-3333-333333333333', 'Calidad', 'calidad', 'Control de Calidad', true),
  ('33333333-3333-3333-3333-333333333333', 'Logística', 'logistica', 'Logística y Distribución', true)
RETURNING id, name;
```

Luego puedes asignar BU Managers:
```sql
-- Primero obtén el ID de la BU
SELECT id, name FROM initiatives WHERE organization_id = '33333333-3333-3333-3333-333333333333';

-- Asigna el manager a esa BU
UPDATE user_organizations
SET role = 'BU', initiative_id = 'UUID_DE_LA_BU'
WHERE auth_user_id = 'UUID_DEL_USUARIO'
  AND organization_id = '33333333-3333-3333-3333-333333333333';
```

---

## 🔍 Verificaciones de Seguridad

### **Ver todas las organizaciones:**
```sql
SELECT 
  o.name as organization,
  o.slug,
  COUNT(DISTINCT uo.auth_user_id) as total_users,
  COUNT(DISTINCT iss.id) as total_issues
FROM organizations o
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.active = true
LEFT JOIN issues iss ON iss.organization_id = o.id
GROUP BY o.id, o.name, o.slug
ORDER BY o.name;
```

**Resultado esperado:**
```
organization | slug      | total_users | total_issues
-------------|-----------|-------------|-------------
Aurovitas    | aurovitas | X           | X
Cosermo      | cosermo   | 1+          | 0 ⬅️ Vacía
Gonvarri     | gonvarri  | X           | X
```

### **Verificar aislamiento:**
```sql
-- Login como usuario de Cosermo
-- Verificar que NO puede ver datos de otras orgs

-- Esta query debería devolver SOLO datos de Cosermo:
SELECT organization_id, COUNT(*) 
FROM issues 
GROUP BY organization_id;
```

---

## 🛠️ Comandos Útiles

### **Ver usuarios de Cosermo:**
```sql
SELECT 
  au.email,
  uo.role,
  i.name as business_unit
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE uo.organization_id = '33333333-3333-3333-3333-333333333333'
  AND uo.active = true;
```

### **Cambiar rol de usuario:**
```sql
UPDATE user_organizations
SET role = 'CEO', initiative_id = NULL
WHERE auth_user_id = 'UUID_USUARIO'
  AND organization_id = '33333333-3333-3333-3333-333333333333';
```

### **Desactivar usuario (sin borrarlo):**
```sql
UPDATE user_organizations
SET active = false
WHERE auth_user_id = 'UUID_USUARIO'
  AND organization_id = '33333333-3333-3333-3333-333333333333';
```

---

## 📝 Resumen

**ID de Cosermo:** `33333333-3333-3333-3333-333333333333`  
**Slug:** `cosermo`  
**Estado inicial:** Vacía (0 issues, 0 projects, 0 initiatives)  
**Capacidades:** Login, asignación de usuarios, creación de contenido  

**Credenciales de prueba:**
```
Email:    ceo@cosermo.com
Password: cosermo123
Org:      Cosermo
```

---

## ✅ Checklist de Setup

- [ ] Paso 1: Organización creada en BD
- [ ] Paso 2: Usuario(s) creado(s) en Supabase Auth
- [ ] Paso 3: Usuario(s) vinculado(s) a Cosermo
- [ ] Paso 4: Login probado y funcionando
- [ ] Paso 5: Verificado que no afecta otras organizaciones
- [ ] (Opcional) Logo añadido
- [ ] (Opcional) Business Units creadas

---

## 🐛 Troubleshooting

### **"Invalid login credentials"**
- Verifica que el usuario esté en Supabase Auth
- Verifica que Email Auth esté habilitado
- URL: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/providers

### **No se muestra "Cosermo" en el header**
- Verifica la vinculación en `user_organizations`
- Verifica que `active = true`
- Limpia cookies del navegador (F12 → Application → Cookies)

### **No puedo crear issues/asignar usuarios**
- Esto es normal si la org está vacía
- Primero crea usuarios en Cosermo
- Luego podrás asignarlos en issues

---

## 📚 Archivos Relacionados

- **Script SQL completo:** `/scripts/setup-cosermo.sql`
- **Multi-tenant docs:** `/MULTI_TENANT_SETUP.md`
- **Ejemplo Gonvarri:** `/GONVARRI_SETUP.md`
- **Ejemplo Aurovitas:** `/QUICK_SETUP_AUROVITAS.md`


