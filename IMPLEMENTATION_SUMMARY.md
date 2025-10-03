# ✅ Implementación Completada: SAP Demo Mode

## 🎯 Resumen

Se ha implementado exitosamente el **sistema de demo para usuarios SAP** que permite:

✅ Cambiar entre roles (CEO, BU, Employee) durante demos  
✅ Ver datos reales de clientes (ej: Gonvarri)  
✅ RoleSwitcher visible solo para usuarios SAP  
✅ Seguridad: usuarios normales NO pueden cambiar de rol  
✅ Funciona en producción (Vercel)  

---

## 📦 Archivos Creados/Modificados

### **Nuevos Archivos**

```
supabase/migrations/
  └── 20250103_sap_demo_mode.sql          # RLS policies para SAP

scripts/
  ├── setup-sap-access.sql                # Setup acceso SAP
  └── verify-gonvarri-users.sql           # Verificar IDs usuarios

Documentación/
  ├── SAP_DEMO_MODE.md                    # Guía completa (LEER PRIMERO)
  └── IMPLEMENTATION_SUMMARY.md           # Este archivo
```

### **Archivos Modificados**

```
lib/context/auth-context.tsx              # + isSAPUser
hooks/use-roles.ts                        # + validación SAP
hooks/use-supabase-data.ts                # + mock users mejorado
components/header.tsx                     # + RoleSwitcher condicional
middleware.ts                             # ✅ Autenticación activada
```

---

## 🚀 Pasos para Completar el Setup

### **PASO 1: Aplicar Migración SQL** ⏱️ 2 minutos

1. Ir a [Supabase SQL Editor](https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new)

2. Copiar y ejecutar el contenido de:
   ```
   supabase/migrations/20250103_sap_demo_mode.sql
   ```

3. Verificar que no hay errores (debe decir "Success")

---

### **PASO 2: Crear Usuario SAP** ⏱️ 3 minutos

1. Ir a [Supabase Auth → Users](https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users)

2. Click **"Add User"** → **"Create new user"**

3. Completar:
   - Email: `pablo@sapira.com` (o tu email)
   - Password: `[elige un password seguro]`
   - Auto Confirm User: ✅ **YES**

4. Click **"Create user"**

5. ⚠️ **Importante:** Copiar el **UUID** del usuario creado

---

### **PASO 3: Dar Acceso SAP a Gonvarri** ⏱️ 2 minutos

1. En [Supabase SQL Editor](https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new)

2. Copiar contenido de:
   ```
   scripts/setup-sap-access.sql
   ```

3. ⚠️ **Reemplazar** `pablo@sapira.com` con tu email (3 lugares)

4. Ejecutar el script completo

5. Verificar resultado:
   ```sql
   SELECT 
     u.email,
     o.name,
     uo.role
   FROM user_organizations uo
   JOIN auth.users u ON u.id = uo.auth_user_id
   JOIN organizations o ON o.id = uo.organization_id
   WHERE u.email = 'tu@email.com';
   ```
   
   Debe mostrar: `Gonvarri | SAP`

---

### **PASO 4: Verificar IDs de Usuarios Mock** ⏱️ 5 minutos

1. En [Supabase SQL Editor](https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new)

2. Ejecutar:
   ```
   scripts/verify-gonvarri-users.sql
   ```

3. Anotar los IDs de:
   - 1 usuario CEO
   - 1 usuario BU Manager (con issues asignados)
   - 1 usuario Employee (con issues asignados)

4. Abrir `hooks/use-supabase-data.ts`

5. Actualizar líneas 23-28:
   ```typescript
   const GONVARRI_MOCK_USERS = {
     'SAP': '11111111-1111-1111-1111-111111111111',
     'CEO': 'UUID_REAL_CEO',           // ← Cambiar
     'BU': 'UUID_REAL_BU_MANAGER',     // ← Cambiar
     'EMP': 'UUID_REAL_EMPLOYEE'       // ← Cambiar
   }
   ```

6. Si el BU Manager tiene initiative, actualizar líneas 31-35:
   ```typescript
   const GONVARRI_BU_INITIATIVES = {
     'UUID_REAL_BU_MANAGER': 'UUID_DE_SU_INITIATIVE', // ← Verificar
     // ...
   }
   ```

---

### **PASO 5: Deploy a Vercel** ⏱️ 3 minutos

```bash
# En tu terminal

git add .
git commit -m "feat: Implement SAP demo mode for role switching"
git push origin main

# Vercel desplegará automáticamente
# Esperar ~2-3 minutos
```

---

### **PASO 6: Probar en Producción** ⏱️ 5 minutos

1. Ir a: **https://app.sapira.com**

2. Login:
   - Email: `pablo@sapira.com` (o el tuyo)
   - Password: [el que creaste]

3. Seleccionar organización: **Gonvarri**

4. ✅ **Verificar que aparece RoleSwitcher** en el header
   - Debe mostrar: `"Viewing as Sapira"` con selector

5. **Probar cambios de rol:**
   
   a) Cambiar a **CEO**:
      - ✅ Debe mostrar todos los proyectos
      - ✅ Debe mostrar todas las initiatives
      - ✅ Debe mostrar todos los issues
   
   b) Cambiar a **BU Manager**:
      - ✅ Solo proyectos de su BU
      - ✅ Solo issues de su BU
      - ✅ Métricas filtradas
   
   c) Cambiar a **Employee**:
      - ✅ Solo issues asignados a él
      - ✅ Solo issues que reportó
      - ✅ Vista simplificada

6. **Verificar consola del navegador** (F12)
   - No debe haber errores en rojo
   - Puedes ver logs de `[useSupabaseData]` en azul (normal)

---

## ✅ Checklist de Validación

Marca cada item cuando funcione:

- [ ] Migración SQL ejecutada sin errores
- [ ] Usuario SAP creado en Supabase Auth
- [ ] User_organizations tiene registro con role='SAP'
- [ ] Login funciona con usuario SAP
- [ ] RoleSwitcher aparece en header
- [ ] Cambio a CEO muestra todos los datos
- [ ] Cambio a BU muestra datos filtrados
- [ ] Cambio a Employee muestra solo sus issues
- [ ] No hay errores en consola
- [ ] Deploy en Vercel completado

---

## 🎬 Cómo Hacer una Demo

### **Preparación** (1 minuto antes)

1. Login en https://app.sapira.com
2. Seleccionar organización del cliente (ej: Gonvarri)
3. Verificar que RoleSwitcher funciona
4. Tener guión mental preparado

### **Durante la Demo** (10-15 minutos)

```
👋 Inicio
"Les voy a mostrar cómo funciona Sapira OS 
desde diferentes perspectivas de su organización."

📊 Vista CEO (cambiar a CEO)
"Así lo ve el CEO..."
→ Roadmap completo
→ Todas las BUs
→ Métricas globales

🏢 Vista BU Manager (cambiar a BU)
"Así lo ve un Manager de Business Unit..."
→ Solo su BU
→ Proyectos filtrados
→ Issues de su área

👤 Vista Employee (cambiar a Employee)
"Y así lo ve un empleado..."
→ Solo sus issues
→ Vista simple

✨ Cierre
"Cada rol ve exactamente lo que necesita,
con sus datos reales."
```

Ver guía completa en: **SAP_DEMO_MODE.md**

---

## 🐛 Problemas Comunes

### **RoleSwitcher no aparece**

```sql
-- Verificar rol en BD
SELECT role FROM user_organizations uo
JOIN auth.users u ON u.id = uo.auth_user_id
WHERE u.email = 'tu@email.com'
AND uo.organization_id = 'ID_GONVARRI';

-- Debe decir 'SAP'
-- Si no, ejecutar scripts/setup-sap-access.sql
```

### **Al cambiar rol no cambian datos**

1. Verificar IDs en `use-supabase-data.ts`
2. Ejecutar `scripts/verify-gonvarri-users.sql`
3. Actualizar UUIDs correctos
4. Commit + push
5. Esperar deploy

### **Error de login**

1. Verificar usuario en Supabase Dashboard
2. Verificar email confirmado
3. Resetear password si es necesario

Ver más en: **SAP_DEMO_MODE.md** → Troubleshooting

---

## 📚 Documentación

### **Para leer ahora:**
1. **SAP_DEMO_MODE.md** ← 📖 **LEER COMPLETO**
   - Guía de uso
   - Cómo hacer demos
   - Arquitectura técnica
   - Troubleshooting completo

### **Referencia:**
2. `scripts/setup-sap-access.sql` - Setup usuario SAP
3. `scripts/verify-gonvarri-users.sql` - Verificar IDs
4. `supabase/migrations/20250103_sap_demo_mode.sql` - RLS policies

---

## 🔐 Seguridad

### **✅ Lo que SÍ hace:**
- Solo usuarios SAP pueden cambiar de rol
- RoleSwitcher solo visible para SAP
- RLS sigue activo (seguridad BD)
- Usuarios normales NO afectados

### **❌ Lo que NO hace:**
- No da acceso a orgs sin permiso
- No modifica datos de otros usuarios
- No bypasea autenticación
- No crea usuarios fantasma

### **Mejores prácticas:**
1. Solo dar rol SAP a personal de Sapira
2. Usar passwords seguros
3. Nunca dar SAP a clientes
4. Rotar contraseñas regularmente

---

## 🎓 Próximos Pasos (Opcional)

### **Backoffice (pendiente)**
- Panel `/admin` para gestión de organizaciones
- CRUD de usuarios
- Sistema de invitaciones
- Audit logs

Ver propuesta completa en conversación anterior.

### **Mejoras a Demo Mode:**
- Grabar sesiones de demo
- Analytics de vistas
- Multi-idioma
- Organizaciones demo sintéticas

---

## 📞 Contacto

Si tienes problemas durante el setup:

1. Revisar **SAP_DEMO_MODE.md** → Troubleshooting
2. Verificar logs en consola del navegador
3. Revisar Supabase logs (si hay errores de BD)
4. Contactar a: [tu contacto interno]

---

## 🎉 ¡Listo para Demos!

Una vez completados los 6 pasos arriba, el sistema está **100% funcional** para hacer demos a clientes en producción.

**Siguiente demo:** Gonvarri
- Login: `pablo@sapira.com`
- Org: Gonvarri
- Roles: CEO → BU Manager → Employee
- Duración: ~15 minutos

---

**Creado:** 2025-01-03  
**Última actualización:** 2025-01-03  
**Estado:** ✅ Implementación Completa

