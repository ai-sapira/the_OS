# 🎭 SAP Demo Mode - Sistema de Cambio de Roles

## 📋 Índice
- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Cómo Funciona](#cómo-funciona)
- [Caso de Uso: Demo a Gonvarri](#caso-de-uso-demo-a-gonvarri)
- [Configuración Inicial](#configuración-inicial)
- [Arquitectura Técnica](#arquitectura-técnica)
- [Seguridad](#seguridad)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

### **Problema que resuelve**
Necesitas hacer demos a clientes (ej: Gonvarri) mostrándoles cómo se ve la plataforma desde **diferentes roles** (CEO, BU Manager, Employee) usando **SUS datos reales**.

### **Solución implementada**
- **RoleSwitcher visible SOLO para usuarios SAP** (Sapira)
- Permite cambiar entre roles durante la demo
- Usa **datos reales del cliente** (no mocks ficticios)
- Clientes normales **NO pueden cambiar de rol** (solo ven su vista)
- Funciona en **producción** (app.sapira.com en Vercel)

### **Beneficios**
✅ Demos realistas con datos del cliente  
✅ Cambio de rol en tiempo real  
✅ Seguro (solo SAP puede hacerlo)  
✅ Sin necesidad de múltiples cuentas  
✅ Funciona en producción  

---

## 🎬 Cómo Funciona

### **Flujo de Demo**

```
1. Login como usuario SAP
   → Email: pablo@sapira.com
   → Password: [tu password]

2. Seleccionar organización cliente
   → Ejemplo: "Gonvarri"

3. Aparece RoleSwitcher en header
   → Badge: "Viewing as Sapira"
   → Selector con roles: CEO, BU Manager, Employee

4. Durante la presentación:
   
   a) Seleccionar "CEO"
      → "Miren, así ve el CEO toda su organización"
      → Muestra: Roadmap completo, todos los proyectos, métricas globales
      → DATOS REALES de Gonvarri
   
   b) Seleccionar "BU Manager"
      → "Así lo ve un Manager de Business Unit"
      → Muestra: Solo proyectos de su BU, issues filtrados
      → Ejemplo: Ver como "Miguel López" (Finance Manager)
   
   c) Seleccionar "Employee"
      → "Y así lo ve un empleado"
      → Muestra: Solo sus issues asignados
      → Vista limitada
   
5. Cambiar de rol instantáneamente
   → Sin recargar página
   → Los datos se actualizan automáticamente
```

### **Comparación: SAP vs Usuario Normal**

| Aspecto | Usuario SAP | Usuario Normal (CEO, BU, EMP) |
|---------|-------------|-------------------------------|
| **RoleSwitcher** | ✅ Visible | ❌ No visible |
| **Cambiar rol** | ✅ Permitido | ❌ Bloqueado |
| **Datos visibles** | Según rol seleccionado | Solo su rol real |
| **RLS (seguridad BD)** | Ve todo (SAP override) | Filtrado estricto |
| **Casos de uso** | Demos, testing, soporte | Uso normal del sistema |

---

## 💼 Caso de Uso: Demo a Gonvarri

### **Preparación** (5 minutos antes de la demo)

1. **Verificar acceso**
   ```sql
   -- En Supabase SQL Editor
   SELECT 
     u.email,
     o.name as organization,
     uo.role
   FROM user_organizations uo
   JOIN auth.users u ON u.id = uo.auth_user_id
   JOIN organizations o ON o.id = uo.organization_id
   WHERE u.email = 'pablo@sapira.com'
     AND o.slug = 'gonvarri';
   
   -- Debe mostrar: role = 'SAP'
   ```

2. **Login de prueba**
   - Ir a https://app.sapira.com
   - Login con tu usuario SAP
   - Verificar que aparece RoleSwitcher

3. **Probar cambios de rol**
   - CEO → Ver todo
   - BU → Ver solo Finance (u otra BU)
   - EMP → Ver solo issues asignados

### **Durante la Demo** (ejemplo con Gonvarri)

**Escenario: Presentación al CEO y equipo directivo**

```
👔 INICIO (Como SAP/Presentador)
"Buenos días, les voy a mostrar cómo funciona Sapira OS 
desde las diferentes perspectivas de su organización."

📊 VISTA CEO (cambiar a CEO)
"Primero, así es como lo ve el CEO..."
→ Mostrar Roadmap completo
→ Todas las iniciativas (BUs)
→ Métricas consolidadas
→ Vista estratégica

"El CEO tiene visibilidad completa de toda la organización,
puede ver el estado de todas las iniciativas y proyectos."

🏢 VISTA BU MANAGER (cambiar a BU Manager)
"Ahora, así es como lo ve un Manager de Business Unit, 
por ejemplo Miguel López de Finance..."
→ Solo proyectos de Finance
→ Solo issues de Finance
→ Métricas de su BU
→ No ve otras BUs

"El BU Manager está enfocado solo en su área, 
optimiza su flujo de trabajo sin distracciones."

👤 VISTA EMPLOYEE (cambiar a Employee)
"Y finalmente, así lo ve un empleado como Juan Pérez..."
→ Solo issues asignados a él
→ Solo issues que reportó
→ Vista simple y clara

"El empleado ve justo lo que necesita para su trabajo,
sin complejidad innecesaria."

✨ CIERRE (volver a CEO o SAP)
"Como ven, cada rol ve exactamente lo que necesita,
con los datos REALES de su organización."
```

### **Tips para la Demo**

✅ **DO:**
- Explicar que estás usando SUS datos reales
- Mencionar que cada rol ve información relevante
- Destacar la facilidad de uso para cada rol
- Mostrar algún issue o proyecto concreto de ellos

❌ **DON'T:**
- No mencionar "modo demo" o "simulación"
- No decir que estás "hackeando" el sistema
- No mostrar el código o explicar detalles técnicos
- No comparar con otros clientes

---

## ⚙️ Configuración Inicial

### **Paso 1: Crear Usuario SAP en Supabase**

1. Ir a [Supabase Dashboard → Auth → Users](https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users)

2. Click en "Add User" → "Create new user"

3. Completar:
   - **Email**: `pablo@sapira.com` (o tu email preferido)
   - **Password**: [password seguro]
   - **Auto Confirm User**: ✅ YES

4. Click "Create user"

5. **Copiar el UUID** del usuario creado

### **Paso 2: Aplicar Migración RLS**

En Supabase SQL Editor, ejecutar:

```sql
-- Archivo: supabase/migrations/20250103_sap_demo_mode.sql
-- Este archivo ya está en el proyecto, solo copiarlo y ejecutar
```

Esto actualiza las políticas RLS para permitir que SAP vea todo.

### **Paso 3: Dar Acceso SAP a Gonvarri**

En Supabase SQL Editor:

```sql
-- Archivo: scripts/setup-sap-access.sql
-- Reemplazar 'pablo@sapira.com' con tu email
-- Ejecutar el script completo
```

Verifica que funcionó:

```sql
SELECT 
  u.email,
  o.name,
  uo.role
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE u.email = 'pablo@sapira.com';

-- Debe mostrar: Gonvarri | SAP
```

### **Paso 4: Verificar Usuarios Mock**

Los usuarios mock deben existir en la tabla `users`:

```sql
-- Archivo: scripts/verify-gonvarri-users.sql
-- Ejecutar para ver los IDs actuales
```

Si los IDs no coinciden, actualizar en:
```typescript
// hooks/use-supabase-data.ts
const GONVARRI_MOCK_USERS = {
  'CEO': 'UUID_REAL_DEL_CEO',
  'BU': 'UUID_REAL_DEL_BU_MANAGER',
  'EMP': 'UUID_REAL_DEL_EMPLOYEE'
}
```

### **Paso 5: Deploy a Vercel**

```bash
git add .
git commit -m "feat: Add SAP demo mode for role switching"
git push origin main

# Vercel desplegará automáticamente
```

### **Paso 6: Probar en Producción**

1. Ir a https://app.sapira.com
2. Login con `pablo@sapira.com`
3. Seleccionar "Gonvarri"
4. Verificar que aparece RoleSwitcher
5. Probar cambiar entre roles

---

## 🏗️ Arquitectura Técnica

### **Componentes Modificados**

```
lib/context/auth-context.tsx
├─ Agregado: isSAPUser (boolean)
└─ Expone si el usuario actual tiene rol SAP

hooks/use-roles.ts
├─ Importa: useAuth()
├─ activeRole = isSAPUser && demoRole ? demoRole : realRole
├─ switchRole() → Solo funciona si isSAPUser = true
└─ Persiste demoRole en localStorage por org

components/header.tsx
└─ {isSAPUser && <RoleSwitcher />}

hooks/use-supabase-data.ts
├─ getCurrentUser() 
│  ├─ Si isSAPUser && activeRole !== 'SAP': usa MOCK_USERS
│  └─ Si NO isSAPUser: usa user.id real
└─ MOCK_USERS_BY_ORG (Gonvarri, Aurovitas, etc.)

supabase/migrations/20250103_sap_demo_mode.sql
└─ RLS policies con "SAP override"
   ├─ SAP ve TODO
   └─ Otros roles: filtrado estricto
```

### **Flujo de Datos**

```
Usuario SAP selecciona rol "BU" en RoleSwitcher
                    │
                    ▼
use-roles.ts actualiza activeRole = "BU"
                    │
                    ▼
use-supabase-data.ts ejecuta getCurrentUser()
                    │
                    ├─ isSAPUser = true
                    ├─ activeRole = "BU"
                    ├─ orgSlug = "gonvarri"
                    │
                    ▼
Retorna GONVARRI_MOCK_USERS["BU"]
= "55555555-5555-5555-5555-555555555555" (Miguel López)
                    │
                    ▼
IssuesAPI.getIssuesByRole("BU", userId, initiativeId)
                    │
                    ▼
Base de datos filtra issues con:
- initiative_id = Finance
                    │
                    ▼
Usuario SAP ve SOLO issues de Finance
(como si fuera Miguel López)
```

### **RLS Policies (Row Level Security)**

```sql
-- Ejemplo: Policy de issues
CREATE POLICY "Users see issues based on role with SAP override" ON issues
  FOR SELECT USING (
    organization_id IN (user's orgs)
    AND (
      -- SAP: Ve TODO
      EXISTS (SELECT 1 FROM user_organizations 
              WHERE role = 'SAP' ...)
      OR
      -- CEO: Ve TODO de su org
      EXISTS (SELECT 1 FROM user_organizations 
              WHERE role = 'CEO' ...)
      OR
      -- BU: Solo su initiative
      EXISTS (SELECT 1 FROM user_organizations 
              WHERE role = 'BU' 
              AND initiative_id = issues.initiative_id ...)
      OR
      -- EMP: Solo sus issues
      (assignee_id = user.id OR reporter_id = user.id)
    )
  );
```

**Nota importante:** La policy permite que SAP vea todo, pero el filtrado adicional por usuario mock se hace en el hook `use-supabase-data.ts`.

---

## 🔒 Seguridad

### **¿Es seguro este sistema?**

✅ **SÍ** - Con las siguientes consideraciones:

1. **Solo usuarios SAP pueden cambiar de rol**
   - Validado en frontend (use-roles.ts)
   - RoleSwitcher solo visible para SAP
   - Usuario normal NO tiene acceso

2. **RLS sigue activo**
   - Usuario SAP debe tener acceso a la organización
   - No puede acceder a orgs donde no esté registrado
   - Políticas de BD verifican auth.uid()

3. **Usuarios mock son reales**
   - No se crean usuarios fantasma
   - Se usa ID de usuarios existentes en la BD
   - No se modifica autenticación del usuario

### **¿Qué NO puede hacer un usuario SAP?**

❌ Acceder a organizaciones donde no tiene registro  
❌ Ver datos de clientes sin permiso  
❌ Modificar datos como otro usuario (solo lectura)  
❌ Bypassear autenticación  

### **¿Qué pasa si alguien hackea localStorage?**

- localStorage solo guarda `demoRole` preferido
- NO guarda credenciales
- NO cambia el rol real en la BD
- Solo afecta a la vista en ese navegador
- RLS sigue validando en servidor

### **Mejores prácticas**

1. **Limitar usuarios SAP**
   - Solo dar acceso SAP a personal de Sapira
   - Usar emails corporativos
   - Rotar contraseñas regularmente

2. **Auditar accesos**
   - (Futuro) Implementar audit_logs
   - Registrar cuando SAP cambia de rol
   - Alertar si acceso inusual

3. **Para clientes reales**
   - NUNCA dar rol SAP a clientes
   - Solo roles: CEO, BU, EMP
   - RLS estricto sin override

---

## 🐛 Troubleshooting

### **❌ RoleSwitcher no aparece**

**Síntoma:** Login exitoso pero no veo el switcher

**Solución:**
1. Verificar rol en BD:
   ```sql
   SELECT role FROM user_organizations uo
   JOIN auth.users u ON u.id = uo.auth_user_id
   WHERE u.email = 'tu@email.com'
   AND uo.organization_id = 'ID_ORG';
   ```
2. Debe decir `role = 'SAP'`
3. Si dice otro rol, ejecutar `scripts/setup-sap-access.sql`

---

### **❌ Al cambiar rol no cambian los datos**

**Síntoma:** Cambio a "BU Manager" pero sigo viendo todo

**Solución:**
1. Verificar IDs de mock users:
   ```sql
   -- Ejecutar scripts/verify-gonvarri-users.sql
   ```
2. Copiar IDs reales
3. Actualizar `hooks/use-supabase-data.ts`:
   ```typescript
   const GONVARRI_MOCK_USERS = {
     'BU': 'UUID_CORRECTO_AQUI',
     // ...
   }
   ```
4. Hacer commit y push
5. Esperar deploy de Vercel

---

### **❌ Error: "No organization selected"**

**Síntoma:** Login exitoso pero error al entrar

**Solución:**
1. Verificar registro en user_organizations:
   ```sql
   SELECT * FROM user_organizations
   WHERE auth_user_id = 'TU_UUID'
   AND active = true;
   ```
2. Si no hay registros, ejecutar:
   ```sql
   -- scripts/setup-sap-access.sql
   ```

---

### **❌ Datos vacíos al cambiar a Employee**

**Síntoma:** Como Employee no veo ningún issue

**Posibles causas:**
1. El usuario mock Employee no tiene issues asignados
2. Solución temporal: Asignar issues a ese user_id en BD
3. O usar otro Employee con issues:
   ```sql
   -- Buscar Employee con issues
   SELECT u.id, u.name, COUNT(i.id) as issues
   FROM users u
   LEFT JOIN issues i ON i.assignee_id = u.id
   WHERE u.role = 'EMP'
   GROUP BY u.id, u.name
   ORDER BY issues DESC;
   ```
4. Actualizar `GONVARRI_MOCK_USERS['EMP']` con ese ID

---

### **❌ "Invalid login credentials"**

**Síntoma:** No puedo hacer login

**Solución:**
1. Verificar en Supabase Dashboard que el usuario existe
2. Verificar email confirmado (confirmed_at no null)
3. Resetear password desde dashboard
4. O crear nuevo usuario

---

### **❌ Middleware redirige a /login constantemente**

**Síntoma:** Loop infinito de redirects

**Solución:**
1. Ver `middleware.ts` líneas 70-82
2. Asegurar que autenticación está activa
3. Verificar cookies de Supabase
4. Limpiar cookies del navegador
5. Login de nuevo

---

## 📚 Archivos de Referencia

### **Migraciones SQL**
- `supabase/migrations/20250103_sap_demo_mode.sql` - RLS policies
- `scripts/setup-sap-access.sql` - Setup inicial
- `scripts/verify-gonvarri-users.sql` - Verificar IDs

### **Código**
- `lib/context/auth-context.tsx` - AuthContext con isSAPUser
- `hooks/use-roles.ts` - Lógica de cambio de rol
- `hooks/use-supabase-data.ts` - Mock users mapping
- `components/header.tsx` - Mostrar RoleSwitcher
- `components/role-switcher.tsx` - UI del switcher

### **Documentación**
- Este archivo (`SAP_DEMO_MODE.md`) - Guía completa
- `MULTI_TENANT_SETUP.md` - Multi-tenant general
- `DEMO_MODE_ROLES.md` - Demo mode legacy (deprecado)

---

## ✅ Checklist Pre-Demo

Antes de cada demo, verificar:

- [ ] Login funciona con usuario SAP
- [ ] Puedo acceder a la organización del cliente
- [ ] RoleSwitcher aparece en header
- [ ] Cambio a CEO muestra todos los datos
- [ ] Cambio a BU muestra solo esa BU
- [ ] Cambio a Employee muestra solo sus issues
- [ ] Datos mostrados son del cliente real
- [ ] No hay errores en consola del navegador
- [ ] Internet estable (para acceder a Vercel)

---

## 🎓 Preguntas Frecuentes

### **¿Puedo dar acceso SAP a un cliente?**
No recomendado. SAP está diseñado para personal de Sapira. Si un cliente necesita ver múltiples vistas, mejor crear usuarios separados con roles diferentes.

### **¿Funciona con múltiples organizaciones?**
Sí. Un usuario SAP puede tener acceso a Gonvarri, Aurovitas, etc. El demoRole se guarda por organización.

### **¿Puedo hacer demo offline?**
No. Requiere conexión a Supabase (producción en Vercel).

### **¿Afecta a otros usuarios?**
No. El cambio de rol es solo para tu sesión. Otros usuarios (incluso otros SAP) no se ven afectados.

### **¿Los cambios persisten?**
El rol demo se guarda en localStorage. Si cierras el navegador y vuelves, mantiene el último rol seleccionado (por organización).

---

## 🚀 Próximos Pasos (Opcional)

### **Mejoras futuras:**

1. **Audit Log**
   - Registrar cuando SAP cambia de rol
   - Ver histórico de accesos
   - Alertas de seguridad

2. **Demo Mode Automático**
   - Crear organizaciones específicas de demo
   - Con datos sintéticos pero realistas
   - Auto-cleanup después de X días

3. **Recording de Demos**
   - Grabar sesión de demo
   - Compartir grabación con cliente
   - Analytics de qué roles mostraron más

4. **Multi-idioma**
   - RoleSwitcher en inglés/español
   - Según preferencia del cliente

---

**🎉 ¡Sistema listo para demos en producción!**

Para dudas o soporte: [contacto interno de Sapira]

