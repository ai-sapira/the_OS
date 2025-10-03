# 🏭 Setup Completo - Gonvarri

## ✅ Estado Actual

- ✅ **Organización Gonvarri creada** (ID: `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`)
- ✅ **5 Business Units creadas**:
  - Tecnología e Innovación
  - Producción
  - Logística
  - Recursos Humanos
  - Finanzas

---

## 👥 PASO 1: Crear Usuarios en Supabase Auth

### **1.1 Ir a Supabase Dashboard**

Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

### **1.2 Crear los siguientes usuarios**

Click en **"Add user"** → **"Create new user"** para cada uno:

| Email | Password | Rol | Business Unit |
|-------|----------|-----|---------------|
| **ceo@gonvarri.com** | gonvarri123 | CEO | - |
| **tech@gonvarri.com** | gonvarri123 | BU | Tecnología e Innovación |
| **prod@gonvarri.com** | gonvarri123 | BU | Producción |
| **log@gonvarri.com** | gonvarri123 | BU | Logística |
| **hr@gonvarri.com** | gonvarri123 | BU | Recursos Humanos |
| **finance@gonvarri.com** | gonvarri123 | BU | Finanzas |
| **empleado@gonvarri.com** | gonvarri123 | EMP | - |

**Importante**: Para cada usuario:
- ✅ **Auto Confirm User**: Activar (para desarrollo)
- 📋 **Copiar el UUID** de cada usuario después de crearlo

---

## 🔗 PASO 2: Vincular Usuarios a Gonvarri

### **2.1 Obtener los UUIDs de los usuarios**

En Supabase SQL Editor, ejecuta:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

Copia los UUIDs de cada usuario.

### **2.2 Vincular usuarios a la organización**

Ejecuta este SQL **reemplazando los UUIDs** con los que copiaste:

```sql
-- IDs de Business Units de Gonvarri
-- Tecnología: 11111111-1111-1111-1111-111111111111
-- Producción: 22222222-2222-2222-2222-222222222222
-- Logística: 33333333-3333-3333-3333-333333333333
-- RRHH: 44444444-4444-4444-4444-444444444444
-- Finanzas: 55555555-5555-5555-5555-555555555555

-- Vincular usuarios (REEMPLAZA los UUIDs)
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES
  -- CEO de Gonvarri
  ('UUID_CEO_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'CEO', NULL, true),
  
  -- BU Manager - Tecnología
  ('UUID_TECH_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '11111111-1111-1111-1111-111111111111', true),
  
  -- BU Manager - Producción
  ('UUID_PROD_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '22222222-2222-2222-2222-222222222222', true),
  
  -- BU Manager - Logística
  ('UUID_LOG_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '33333333-3333-3333-3333-333333333333', true),
  
  -- BU Manager - RRHH
  ('UUID_HR_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '44444444-4444-4444-4444-444444444444', true),
  
  -- BU Manager - Finanzas
  ('UUID_FINANCE_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'BU', '55555555-5555-5555-5555-555555555555', true),
  
  -- Empleado
  ('UUID_EMP_AQUI', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'EMP', NULL, true)
ON CONFLICT (auth_user_id, organization_id) DO NOTHING;
```

### **2.3 Verificar la vinculación**

```sql
SELECT 
  au.email,
  o.name as organization,
  uo.role,
  i.name as business_unit
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE o.slug = 'gonvarri' AND uo.active = true
ORDER BY uo.role, au.email;
```

Deberías ver algo como:

```
email                  | organization | role | business_unit
-----------------------|--------------|------|------------------
ceo@gonvarri.com       | Gonvarri     | CEO  | NULL
tech@gonvarri.com      | Gonvarri     | BU   | Tecnología e Innovación
prod@gonvarri.com      | Gonvarri     | BU   | Producción
log@gonvarri.com       | Gonvarri     | BU   | Logística
hr@gonvarri.com        | Gonvarri     | BU   | Recursos Humanos
finance@gonvarri.com   | Gonvarri     | BU   | Finanzas
empleado@gonvarri.com  | Gonvarri     | EMP  | NULL
```

---

## 🎭 CÓMO FUNCIONA EL CAMBIO DE ROL

### **Sistema Actual (Dual)**

El sistema tiene **DOS formas de trabajar** que coexisten:

#### **Modo 1: Rol Real (desde Auth Context)** ✅ NUEVO
- El rol viene de `user_organizations.role`
- Es el rol **asignado en la base de datos**
- Se usa para **seguridad y permisos reales**
- **No se puede cambiar** sin modificar la BD

#### **Modo 2: Role Switcher (Demo/Testing)** 🎨 LEGACY
- El `<RoleSwitcher>` del header sigue funcionando
- Permite **simular diferentes roles** para demos
- **No afecta** los datos que ves (eso lo controla RLS)
- Útil para **probar la UI** de diferentes roles

### **Comportamiento en Producción**

**Lo que el usuario verá:**

1. **Login**: `ceo@gonvarri.com` / `gonvarri123`
2. **Automático**: Se carga su rol = `CEO` (desde la BD)
3. **Header**: Se muestra "Gonvarri" 
4. **RLS**: Solo ve datos de Gonvarri
5. **Role Switcher**: Puede cambiar la vista UI (pero sigue siendo CEO en la BD)

**Ejemplo:**
```
Usuario real: CEO de Gonvarri
- Datos visibles: Solo de Gonvarri (RLS lo garantiza)
- UI actual: CEO (por defecto)
- Role Switcher: Puede cambiar a "BU" para ver cómo se vería
- Pero los permisos reales: Siguen siendo de CEO
```

### **Para Desactivar el Role Switcher**

Si quieres **bloquear** el rol en producción:

**Opción A: Ocultar el switcher**
```tsx
// components/header.tsx
{/* Comentar o eliminar */}
{/* <RoleSwitcher /> */}
```

**Opción B: Usar el rol real del contexto**
```tsx
// hooks/use-roles.ts
export function useRoles() {
  const { currentOrg } = useAuth()
  
  // Usar el rol real de la organización
  const [activeRole, setActiveRole] = useState<Role>(
    currentOrg?.role || "EMP"
  )
  
  // Bloquear el cambio de rol
  const switchRole = (role: Role) => {
    // No hacer nada, rol bloqueado
  }
  // ...
}
```

---

## 🏢 CÓMO MONTAR UNA NUEVA ORGANIZACIÓN

### **Opción A: Usando SQL (Más rápido)**

```sql
-- 1. Crear la organización
INSERT INTO organizations (id, name, slug, settings)
VALUES (
  gen_random_uuid(),  -- O un UUID específico
  'Nueva Empresa',
  'nueva-empresa',
  '{
    "sla_matrix": {
      "P0": {"hours": 4},
      "P1": {"hours": 24},
      "P2": {"hours": 72},
      "P3": {"hours": 168}
    }
  }'::jsonb
)
RETURNING id, name, slug;

-- 2. Copiar el ID de la org creada
-- Luego crear sus Business Units:

INSERT INTO initiatives (organization_id, name, slug, description, active)
VALUES
  ('ORG_ID_AQUI', 'Tecnología', 'tecnologia', 'Departamento de TI', true),
  ('ORG_ID_AQUI', 'Ventas', 'ventas', 'Departamento comercial', true),
  ('ORG_ID_AQUI', 'Operaciones', 'operaciones', 'Operaciones y logística', true)
RETURNING id, name;

-- 3. Crear usuarios en Supabase Auth Dashboard

-- 4. Vincular usuarios a la organización
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id)
VALUES
  ('AUTH_USER_UUID', 'ORG_ID_AQUI', 'CEO', NULL),
  ('AUTH_USER_UUID', 'ORG_ID_AQUI', 'BU', 'INITIATIVE_ID'),
  ('AUTH_USER_UUID', 'ORG_ID_AQUI', 'EMP', NULL);
```

### **Opción B: Template Reutilizable**

```sql
-- Template completo para nueva organización
DO $$
DECLARE
  new_org_id UUID;
  tech_bu_id UUID;
  sales_bu_id UUID;
BEGIN
  -- 1. Crear organización
  INSERT INTO organizations (name, slug, settings)
  VALUES (
    'Cliente ABC',
    'cliente-abc',
    '{
      "sla_matrix": {
        "P0": {"hours": 2},
        "P1": {"hours": 24},
        "P2": {"hours": 72},
        "P3": {"hours": 168}
      }
    }'::jsonb
  )
  RETURNING id INTO new_org_id;

  -- 2. Crear Business Units
  INSERT INTO initiatives (organization_id, name, slug, active)
  VALUES 
    (new_org_id, 'Tecnología', 'tecnologia', true)
  RETURNING id INTO tech_bu_id;
  
  INSERT INTO initiatives (organization_id, name, slug, active)
  VALUES 
    (new_org_id, 'Ventas', 'ventas', true)
  RETURNING id INTO sales_bu_id;

  -- 3. Mostrar IDs para vincular usuarios
  RAISE NOTICE 'Organización creada: %', new_org_id;
  RAISE NOTICE 'BU Tecnología: %', tech_bu_id;
  RAISE NOTICE 'BU Ventas: %', sales_bu_id;
END $$;
```

### **Checklist Nueva Organización**

- [ ] Crear organización en tabla `organizations`
- [ ] Crear Business Units en tabla `initiatives`
- [ ] Crear usuarios en Supabase Auth Dashboard
- [ ] Vincular usuarios en tabla `user_organizations`
- [ ] Verificar con query de validación
- [ ] Probar login con un usuario

---

## 🧪 PROBAR EL SETUP DE GONVARRI

### **Test 1: Login CEO**
```bash
# 1. Ejecutar app
pnpm dev

# 2. Ir a http://localhost:3000
# 3. Login: ceo@gonvarri.com / gonvarri123
# 4. Verificar: Se muestra "Gonvarri" en header
```

### **Test 2: Login BU Manager**
```bash
# 1. Logout del CEO
# 2. Login: tech@gonvarri.com / gonvarri123
# 3. Verificar: 
#    - Se muestra "Gonvarri"
#    - Solo ve datos de Tecnología (si aplica filtro)
```

### **Test 3: Login Empleado**
```bash
# 1. Logout
# 2. Login: empleado@gonvarri.com / gonvarri123
# 3. Verificar:
#    - Se muestra "Gonvarri"
#    - Solo ve sus issues asignados
```

---

## 🔐 SEGURIDAD: Row Level Security (RLS)

### **Qué hace RLS**

```sql
-- Ejemplo: Usuario login como ceo@gonvarri.com
-- Su auth.uid() = UUID del usuario

-- Cuando ejecuta:
SELECT * FROM issues;

-- RLS automáticamente lo convierte en:
SELECT * FROM issues 
WHERE organization_id IN (
  SELECT organization_id 
  FROM user_organizations 
  WHERE auth_user_id = 'UUID_CEO' -- Su UUID
    AND active = true
);

-- Resultado: Solo ve issues de Gonvarri
```

### **Garantías de Seguridad**

✅ **Imposible** ver datos de otras organizaciones  
✅ **Automático** - no requiere código adicional  
✅ **A nivel de BD** - incluso si hay un bug en el frontend  
✅ **Auditable** - se puede revisar en `pg_policies`  

---

## 📊 Queries Útiles de Administración

### **Ver todas las organizaciones y usuarios**
```sql
SELECT 
  o.name as org,
  COUNT(DISTINCT uo.auth_user_id) as total_users,
  COUNT(DISTINCT i.id) as total_bus
FROM organizations o
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.active = true
LEFT JOIN initiatives i ON i.organization_id = o.id AND i.active = true
GROUP BY o.id, o.name
ORDER BY o.name;
```

### **Ver usuarios de una organización específica**
```sql
SELECT 
  au.email,
  uo.role,
  i.name as business_unit
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
LEFT JOIN initiatives i ON i.id = uo.initiative_id
WHERE uo.organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' -- Gonvarri
  AND uo.active = true
ORDER BY uo.role, au.email;
```

### **Desactivar un usuario de una org (sin borrarlo)**
```sql
UPDATE user_organizations
SET active = false
WHERE auth_user_id = 'UUID_USUARIO'
  AND organization_id = 'UUID_ORG';
```

### **Cambiar rol de un usuario**
```sql
UPDATE user_organizations
SET role = 'BU',
    initiative_id = 'UUID_INITIATIVE'
WHERE auth_user_id = 'UUID_USUARIO'
  AND organization_id = 'UUID_ORG';
```

---

## 🎯 Resumen para Demo de Gonvarri

**Setup completado:**
- ✅ Organización Gonvarri creada
- ✅ 5 Business Units configuradas
- ✅ Sistema de autenticación multi-tenant activo
- ✅ RLS protegiendo los datos

**Próximos pasos:**
1. Crear usuarios en Supabase Auth (7 usuarios recomendados)
2. Vincularlos con el SQL del PASO 2
3. Habilitar Email Auth en Supabase
4. Probar login con cada rol

**Credenciales de prueba:**
- CEO: `ceo@gonvarri.com` / `gonvarri123`
- Tech Manager: `tech@gonvarri.com` / `gonvarri123`
- Empleado: `empleado@gonvarri.com` / `gonvarri123`

**Cambio de organización:**
- Cerrar sesión → Login con otra org
- No hay selector de org (si solo tiene 1)

