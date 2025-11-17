# 🔄 Flujos Completos de Acceso, Onboarding y Casos de Uso

Documento completo con todos los flujos de acceso, onboarding, administración y casos de uso del sistema Sapira Pharo.

## 📋 Checklist de Configuración Pre-Testing

### 1. Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `NEXT_PUBLIC_APP_URL` configurado

### 2. Base de Datos
- [ ] Organizaciones creadas con slugs correctos
- [ ] Dominios configurados en `control_org_domains_v`
- [ ] `allow_self_registration = true` para orgs que lo necesiten
- [ ] Business Units creadas para testing

### 3. Servidores Corriendo
- [ ] OS Principal: `http://localhost:3001` (o puerto configurado)
- [ ] Admin App: `http://localhost:3002` (o puerto configurado)

---

## 🔐 FLUJO 1: Acceso a Admin App (Solo Staff)

### Descripción
Usuario intenta acceder al Admin App. Solo usuarios con email `@sapira.ai` pueden acceder.

### Pasos
1. **Ir a**: `http://localhost:3002/` (Admin App)
2. **Login con email**: `staff@sapira.ai`
3. **Verificar**: 
   - ✅ Login exitoso
   - ✅ Acceso al dashboard de Admin App
   - ✅ Puede ver organizaciones y usuarios

### Intentar Acceso con Email NO-Staff
1. **Intentar login con**: `usuario@gonvarri.com`
2. **Verificar**: 
   - ❌ Acceso denegado o redirige
   - ❌ No puede acceder a rutas protegidas

### Resultado Esperado
- Solo usuarios `@sapira.ai` pueden acceder
- Validación en cada API route del Admin App
- Middleware protege rutas correctamente

### Errores Comunes
- ❌ "Unauthorized" → Verificar que email termina en `@sapira.ai`
- ❌ No redirige → Verificar middleware y `isStaffFromToken()`

### Archivos Clave
- `admin-app/lib/supabase/server.ts` → `isStaffFromToken()`
- `admin-app/app/api/admin/**/*.ts` → Rutas protegidas

---

## 🔐 FLUJO 2: Acceso a OS Principal (Usuario Autenticado)

### Descripción
Usuario autenticado accede al OS Principal. Sistema verifica sesión y organizaciones.

### Pasos
1. **Usuario autenticado** accede a `http://localhost:3001/issues`
2. **Middleware verifica**:
   - ✅ Sesión válida
   - ✅ Usuario tiene organizaciones
3. **Si tiene 1 organización**:
   - ✅ Auto-selecciona organización
   - ✅ Redirige a `/issues`
4. **Si tiene múltiples organizaciones**:
   - ✅ Redirige a `/select-org`
   - ✅ Usuario selecciona organización
5. **Si NO tiene organizaciones**:
   - ❌ Muestra error o redirige

### Resultado Esperado
- Acceso correcto según número de organizaciones
- Auto-selección funciona para 1 org
- Selector funciona para múltiples orgs

### Errores Comunes
- ❌ "No organizations found" → Usuario no tiene orgs asignadas
- ❌ Loop de redirección → Verificar AuthGuard y middleware

### Archivos Clave
- `middleware.ts` → Verifica sesión
- `lib/context/auth-context.tsx` → Carga organizaciones
- `app/client-layout.tsx` → AuthGuard

---

## 🔑 FLUJO 3: Login en OS Principal (Usuario Cliente)

### Descripción
Usuario cliente hace login en el OS Principal.

### Pasos
1. **Ir a**: `http://localhost:3001/login` o `http://localhost:3001/gonvarri/login`
2. **Introducir credenciales**:
   - Email: `usuario@gonvarri.com`
   - Contraseña: `password123`
3. **Click en "Iniciar sesión"**
4. **Sistema verifica** credenciales en Supabase Auth
5. **Si válido**:
   - ✅ Carga organizaciones del usuario
   - ✅ Si tiene 1 org → Redirige a `/issues`
   - ✅ Si tiene múltiples → Redirige a `/select-org`
   - ✅ Si NO tiene orgs → Muestra error

### Resultado Esperado
- Login exitoso
- Redirección correcta según número de organizaciones
- Sesión persistente

### Errores Comunes
- ❌ "Invalid login credentials" → Verificar email/contraseña
- ❌ No redirige → Verificar AuthProvider y middleware

---

## 🔑 FLUJO 4: Login Usuario Sapira (@sapira.ai)

### Descripción
Usuario con email `@sapira.ai` hace login. Sistema detecta dominio y redirige a selector de organización.

### Pasos
1. **Ir a**: `http://localhost:3001/login`
2. **Introducir credenciales**:
   - Email: `pablo@sapira.ai`
   - Contraseña: `password123`
3. **Sistema detecta** dominio `@sapira.ai`
4. **Redirige automáticamente** a `/select-org`
5. **Usuario selecciona** organización
6. **Accede** a OS Principal con rol asignado en esa org

### Resultado Esperado
- Detección automática de dominio Sapira
- Redirección a selector de organización
- Acceso con rol correcto

### Errores Comunes
- ❌ No detecta dominio → Verificar lógica en `login/page.tsx`
- ❌ No redirige → Verificar redirección después de login

---

## 📝 FLUJO 5: Auto-Registro desde Landing de Org

### Descripción
Usuario nuevo se registra directamente desde la landing de su organización.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri`
2. **Verificar**: Landing muestra branding de Gonvarri
3. **Click en "Registrarse"**
4. **Verificar**: Redirige a `/gonvarri/signup`
5. **Completar formulario**:
   - Nombre: `Juan`
   - Apellidos: `Pérez`
   - Email: `juan@gonvarri.com` (debe ser dominio válido)
   - Contraseña: `test123` (mínimo 6 caracteres)
   - Rol: Seleccionar entre CEO, BU Manager o Employee
   - Si selecciona BU Manager → Debe elegir Business Unit
6. **Click en "Crear cuenta"**
7. **Sistema valida**:
   - ✅ Email del dominio permitido
   - ✅ Contraseña >= 6 caracteres
   - ✅ Rol válido (EMP, BU, CEO)
   - ✅ Si BU → initiative_id requerido
   - ✅ SAP bloqueado
8. **Creación de usuario**:
   - ✅ Usuario creado en `auth.users`
   - ✅ Usuario creado en `users` table
   - ✅ Usuario vinculado en `user_organizations`
   - ✅ Si BU → `initiative_id` guardado
9. **Auto-login**:
   - ✅ Intenta login automático
   - ✅ Si éxito → Redirige a `/issues`
   - ✅ Si falla → Redirige a `/login?registered=true`

### Resultado Esperado
- Usuario registrado y autenticado
- Redirige a dashboard
- Solo ve datos de su organización
- Rol asignado correctamente

### Errores Comunes
- ❌ "El dominio no está permitido" → Verificar dominio en `control_org_domains_v`
- ❌ "El registro automático no está habilitado" → Verificar `allow_self_registration = true`
- ❌ "Este email ya está registrado" → Usuario ya existe
- ❌ "BU requiere Business Unit" → Seleccionar BU si rol es BU

### Archivos Clave
- `app/[org-slug]/signup/page.tsx` → Formulario de registro
- `app/api/auth/auto-register/route.ts` → Endpoint de registro
- `app/api/auth/check-org-signup/route.ts` → Verificación de org

---

## 📧 FLUJO 6: Invitación por Email desde OS Principal

### Descripción
Admin de organización invita a un usuario por email desde el OS Principal.

### Requisitos Previos
- Usuario debe ser `isOrgAdmin` de la organización
- Email válido
- Rol válido (SAP, CEO, BU, EMP)

### Pasos
1. **Login** como org admin en OS Principal
2. **Ir a**: `/users` o sección de usuarios
3. **Click en "Invitar usuario"**
4. **Completar formulario**:
   - Email: `nuevo@gonvarri.com`
   - Rol: `EMP` (o CEO, BU, SAP)
   - Si BU → Seleccionar Business Unit
5. **Click en "Enviar invitación"**
6. **Sistema valida**:
   - ✅ Usuario es org admin
   - ✅ Email válido
   - ✅ Rol válido
   - ✅ Si BU → initiative_id requerido
   - ✅ Usuario no existe en la org (o está suspendido)
7. **Sistema crea invitación**:
   - ✅ Supabase Auth `inviteUserByEmail()`
   - ✅ Guarda en `user_invitations` table
   - ✅ Envía email con link de invitación
8. **Usuario recibe email**:
   - Link: `/auth/callback?organization_id=X&role=Y&initiative_id=Z`
9. **Usuario hace click**:
   - ✅ Redirige a callback
   - ✅ Crea cuenta en Supabase Auth
   - ✅ Crea registro en `users` table
   - ✅ Crea registro en `user_organizations` table
   - ✅ Marca invitación como aceptada

### Resultado Esperado
- Invitación enviada correctamente
- Usuario puede completar registro
- Vinculado a organización correcta
- Rol asignado correctamente

### Errores Comunes
- ❌ "Forbidden: Not an organization admin" → Usuario no es org admin
- ❌ "User already exists" → Usuario ya está en la organización
- ❌ "BU role requires initiative_id" → Seleccionar BU si rol es BU

### Archivos Clave
- `app/api/org/users/invite/route.ts` → Endpoint de invitación
- `app/auth/callback/route.ts` → Callback de invitación
- `components/InviteUserModal.tsx` → UI de invitación

---

## 🔧 FLUJO 7: Crear Usuario Directo desde Admin App

### Descripción
Staff de Sapira crea un usuario directamente desde el Admin App.

### Pasos
1. **Login en Admin App**: `http://localhost:3002/login`
   - Email: `staff@sapira.ai`
   - Password: `[password]`
2. **Ir a**: Organizaciones → [Gonvarri] → Usuarios
3. **Click en "Crear usuario"**
4. **Completar formulario**:
   - Email: `nuevo@gonvarri.com`
   - Contraseña: `test123`
   - Confirmar contraseña: `test123`
   - Nombre: `Nuevo`
   - Apellidos: `Usuario`
   - Rol: `EMP` (o CEO, BU, SAP)
   - Si SAP → Seleccionar `sapira_role_type` (FDE, Advisory Lead, Account Manager)
   - Si BU → Seleccionar Business Unit
5. **Sistema valida**:
   - ✅ Usuario es Staff (@sapira.ai)
   - ✅ Email válido
   - ✅ Si email @sapira.ai → Rol debe ser SAP
   - ✅ Si SAP → `sapira_role_type` válido
   - ✅ Si BU → initiative_id requerido
6. **Click en "Crear usuario"**
7. **Sistema crea**:
   - ✅ Usuario en `auth.users`
   - ✅ Registro en `users` table
   - ✅ Registro en `user_organizations` table
   - ✅ Si SAP → Guarda `sapira_role_type`
8. **Verificar**:
   - ✅ Usuario creado exitosamente
   - ✅ Aparece en lista de usuarios
   - ✅ Puede hacer login inmediatamente

### Resultado Esperado
- Usuario creado desde Admin
- Puede hacer login inmediatamente
- Vinculado correctamente a la organización
- Rol y tipo Sapira asignados correctamente

### Errores Comunes
- ❌ "Unauthorized" → Verificar que usuario es Staff
- ❌ "Invalid role" → Verificar rol válido
- ❌ "Email @sapira.ai must have SAP role" → Cambiar rol a SAP

### Archivos Clave
- `admin-app/app/api/admin/organizations/[id]/users/create/route.ts`
- `admin-app/components/CreateUserModal.tsx`

---

## 📧 FLUJO 8: Invitar Usuario desde Admin App

### Descripción
Staff de Sapira invita a un usuario por email desde el Admin App.

### Pasos
1. **Login en Admin App**
2. **Ir a**: Organizaciones → [Gonvarri] → Usuarios
3. **Click en "Invitar por email"**
4. **Completar formulario**:
   - Email: `invitado@gonvarri.com`
   - Rol: `EMP` (o CEO, BU, SAP)
   - Si SAP → Seleccionar `sapira_role_type`
   - Si BU → Seleccionar Business Unit
5. **Sistema valida**:
   - ✅ Usuario es Staff
   - ✅ Si email @sapira.ai → Rol automáticamente SAP
   - ✅ Si SAP → `sapira_role_type` válido
   - ✅ Si BU → initiative_id requerido
6. **Click en "Enviar invitación"**
7. **Sistema crea invitación**:
   - ✅ Supabase Auth `inviteUserByEmail()`
   - ✅ Guarda en `user_invitations` con `sapira_role_type`
   - ✅ Envía email con link
8. **Usuario acepta invitación**:
   - ✅ Callback crea usuario
   - ✅ Guarda `sapira_role_type` si existe
   - ✅ Marca invitación como aceptada

### Resultado Esperado
- Invitación enviada correctamente
- Usuario puede completar registro
- Tipo Sapira guardado si aplica
- Vinculado a organización correcta

### Archivos Clave
- `admin-app/app/api/admin/organizations/[id]/users/invite/route.ts`
- `admin-app/components/InviteUserModal.tsx`
- `app/auth/callback/route.ts` → Lee `sapira_role_type` de invitación

---

## 🔄 FLUJO 9: Selección de Organización (Multi-Org)

### Descripción
Usuario con múltiples organizaciones selecciona una organización.

### Pasos
1. **Login** con usuario que tiene múltiples organizaciones
2. **Sistema detecta** múltiples orgs
3. **Redirige** a `/select-org`
4. **Verificar**: 
   - ✅ Muestra lista de organizaciones disponibles
   - ✅ Muestra rol en cada organización
5. **Seleccionar** una organización
6. **Sistema guarda**:
   - ✅ Selección en localStorage
   - ✅ Persiste en backend (`/api/auth/select-org`)
   - ✅ Carga contexto de esa organización (rol, permisos)
7. **Redirige** a `/issues`
8. **Verificar**:
   - ✅ Ve solo datos de la org seleccionada
   - ✅ Rol correcto aplicado
   - ✅ Permisos según rol

### Resultado Esperado
- Selector de organización funciona
- Cambio de org persiste en backend
- No se pierde selección al recargar
- Contexto actualizado correctamente

### Errores Comunes
- ❌ No muestra organizaciones → Verificar carga de `user_organizations`
- ❌ No persiste selección → Verificar API `/api/auth/select-org`

### Archivos Clave
- `app/(auth)/select-org/page.tsx` → Página de selección
- `app/api/auth/select-org/route.ts` → Persiste selección
- `lib/context/auth-context.tsx` → Carga organización seleccionada

---

## 🎭 FLUJO 10: RoleSwitcher (Solo Usuario SAP)

### Descripción
Usuario con rol SAP usa el RoleSwitcher para cambiar de rol en modo demo.

### Requisitos Previos
- Usuario debe tener rol SAP en la organización
- Solo funciona en OS Principal

### Pasos
1. **Login** como usuario SAP
2. **Verificar**: 
   - ✅ Ve RoleSwitcher en header
   - ✅ Muestra rol actual: "Sapira" (con tipo si existe)
3. **Click en RoleSwitcher**
4. **Ver opciones**:
   - CEO
   - BU Manager
   - Employee
   - Sapira (volver)
5. **Seleccionar** rol diferente (ej: BU Manager)
6. **Sistema cambia**:
   - ✅ UI (sidebar, permisos visuales)
   - ✅ Filtra datos usando demo mode
   - ✅ NO cambia rol real en BD
   - ✅ NO afecta RLS (sigue siendo SAP)
7. **Verificar**:
   - ✅ Ve vista de BU Manager
   - ✅ Datos filtrados como BU
   - ✅ Pero sigue siendo SAP en la BD
8. **Volver a SAP**:
   - ✅ Seleccionar "Sapira" en RoleSwitcher
   - ✅ Vuelve a vista completa

### Resultado Esperado
- RoleSwitcher solo visible para SAP
- Cambio de rol funciona en demo mode
- No afecta seguridad (RLS sigue activo)
- Puede volver a SAP en cualquier momento

### Errores Comunes
- ❌ RoleSwitcher no aparece → Verificar que `isSAPUser = true`
- ❌ No cambia vista → Verificar `use-roles.ts` y `use-supabase-data.ts`

### Archivos Clave
- `components/role-switcher.tsx` → Componente RoleSwitcher
- `hooks/use-roles.ts` → Lógica de cambio de rol
- `hooks/use-supabase-data.ts` → Demo mode con usuarios mock

---

## 🏢 FLUJO 11: Crear Organización desde Admin App

### Descripción
Staff de Sapira crea una nueva organización desde el Admin App.

### Pasos
1. **Login en Admin App**
2. **Ir a**: Organizaciones → "Crear organización"
3. **Completar formulario**:
   - Nombre: `Nueva Organización`
   - Slug: `nueva-org` (único)
   - Dominios permitidos: `nuevaorg.com`
   - `allow_self_registration`: true/false
   - Logo (opcional)
4. **Click en "Crear"**
5. **Sistema crea**:
   - ✅ Registro en `organizations` table
   - ✅ Dominios en `control_org_domains_v`
   - ✅ Configuración guardada
6. **Verificar**:
   - ✅ Organización aparece en lista
   - ✅ Dominios configurados correctamente
   - ✅ Puede acceder desde OS Principal

### Resultado Esperado
- Organización creada exitosamente
- Dominios configurados
- Lista para usar

### Archivos Clave
- `admin-app/app/api/admin/organizations/route.ts`

---

## 🚫 FLUJO 12: Registro Bloqueado (allow_self_registration = false)

### Descripción
Organización que no permite auto-registro bloquea el registro.

### Setup Previo
```sql
UPDATE organizations 
SET allow_self_registration = false 
WHERE slug = 'gonvarri';
```

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri`
2. **Verificar**: 
   - ✅ Landing muestra mensaje apropiado
   - ✅ Botón "Registrarse" NO visible (o deshabilitado)
3. **Intentar acceder directamente**: `http://localhost:3001/gonvarri/signup`
4. **Verificar**: 
   - ✅ Muestra error o redirige
   - ✅ No permite registro
   - ✅ Mensaje: "El registro automático no está habilitado"

### Resultado Esperado
- Registro bloqueado correctamente
- Mensaje claro al usuario
- No se puede registrar directamente

---

## 🌐 FLUJO 13: Dominio No Permitido en Registro

### Descripción
Usuario intenta registrarse con email de dominio no permitido.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri/signup`
2. **Completar formulario** con email: `test@otrodominio.com`
3. **Click en "Crear cuenta"**
4. **Sistema valida** dominio en `control_org_domains_v`
5. **Verificar**:
   - ✅ Error: "El dominio otrodominio.com no está permitido"
   - ✅ No se crea usuario
   - ✅ Formulario muestra error

### Resultado Esperado
- Validación de dominio funciona
- Error claro al usuario
- No se crea usuario parcial

---

## 🛡️ FLUJO 14: Protección de Rutas (RLS)

### Descripción
Verificar que Row Level Security funciona correctamente según el rol del usuario.

### Pasos
1. **Login** como usuario de Gonvarri con rol EMP
2. **Ir a**: `/issues`
3. **Verificar**: 
   - ✅ Solo ve issues asignados a él
   - ✅ NO ve issues de otros usuarios
   - ✅ NO ve issues de otras organizaciones
4. **Login** como usuario CEO
5. **Ir a**: `/issues`
6. **Verificar**: 
   - ✅ Ve todos los issues de su organización
   - ✅ NO ve issues de otras organizaciones
7. **Login** como usuario BU Manager
8. **Ir a**: `/issues`
9. **Verificar**: 
   - ✅ Solo ve issues de su Business Unit
   - ✅ NO ve issues de otras BUs
10. **Login** como usuario SAP
11. **Ir a**: `/issues`
12. **Verificar**: 
    - ✅ Ve todos los issues de sus organizaciones
    - ✅ Puede cambiar de rol con RoleSwitcher

### Resultado Esperado
- RLS funciona correctamente por rol
- Usuario solo ve datos permitidos
- No hay datos de otras organizaciones
- Filtrado correcto por Business Unit

### Archivos Clave
- `supabase/migrations/*_rls.sql` → Políticas RLS
- `hooks/use-supabase-data.ts` → Filtrado adicional por rol

---

## 📱 FLUJO 15: Acceso Directo a Rutas Protegidas

### Descripción
Usuario no autenticado intenta acceder a rutas protegidas.

### Pasos
1. **Cerrar sesión** (o usar ventana incógnito)
2. **Intentar acceder**: `http://localhost:3001/issues`
3. **Verificar**: 
   - ✅ Middleware redirige a `/`
   - ✅ No puede acceder sin autenticación
4. **Intentar acceder**: `http://localhost:3001/projects`
5. **Verificar**: Redirige a `/`
6. **Intentar acceder**: `http://localhost:3001/users`
7. **Verificar**: Redirige a `/`

### Resultado Esperado
- Middleware protege rutas correctamente
- Redirección a landing funciona
- No hay acceso sin autenticación

---

## 👥 FLUJO 16: Usuario con Múltiples Organizaciones y Roles

### Descripción
Usuario que pertenece a múltiples organizaciones con diferentes roles.

### Setup Previo
```sql
-- Vincular usuario a 2 organizaciones con diferentes roles
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES 
  ('USER_UUID', 'ORG_1_UUID', 'CEO', true),
  ('USER_UUID', 'ORG_2_UUID', 'EMP', true);
```

### Pasos
1. **Login** con usuario multi-org
2. **Verificar**: Redirige a `/select-org`
3. **Seleccionar** organización A (rol CEO)
4. **Verificar**: 
   - ✅ Ve vista de CEO
   - ✅ Permisos de CEO activos
   - ✅ Ve todos los issues de org A
5. **Cambiar** a organización B (rol EMP)
6. **Verificar**: 
   - ✅ Ve vista de Employee
   - ✅ Permisos de EMP activos
   - ✅ Solo ve sus issues asignados

### Resultado Esperado
- Cambio de organización funciona
- Rol cambia según organización
- Permisos correctos por rol
- Datos filtrados correctamente

---

## 🎯 Checklist de Testing Completo

### Flujos de Acceso
- [ ] FLUJO 1: Acceso a Admin App (Solo Staff)
- [ ] FLUJO 2: Acceso a OS Principal (Usuario Autenticado)
- [ ] FLUJO 3: Login en OS Principal (Usuario Cliente)
- [ ] FLUJO 4: Login Usuario Sapira (@sapira.ai)
- [ ] FLUJO 15: Acceso Directo a Rutas Protegidas

### Flujos de Onboarding
- [ ] FLUJO 5: Auto-Registro desde Landing de Org
- [ ] FLUJO 6: Invitación por Email desde OS Principal
- [ ] FLUJO 7: Crear Usuario Directo desde Admin App
- [ ] FLUJO 8: Invitar Usuario desde Admin App
- [ ] FLUJO 12: Registro Bloqueado
- [ ] FLUJO 13: Dominio No Permitido

### Flujos de Organización
- [ ] FLUJO 9: Selección de Organización (Multi-Org)
- [ ] FLUJO 11: Crear Organización desde Admin App
- [ ] FLUJO 16: Usuario con Múltiples Organizaciones y Roles

### Flujos de Roles y Permisos
- [ ] FLUJO 10: RoleSwitcher (Solo Usuario SAP)
- [ ] FLUJO 14: Protección de Rutas (RLS)

---

## 🐛 Troubleshooting Común

### Error: "Unauthorized" en Admin App
- **Causa**: Email no termina en `@sapira.ai`
- **Solución**: Verificar que usuario es Staff
- **Verificar**: `admin-app/lib/supabase/server.ts` → `isStaffFromToken()`

### Error: "Organización no encontrada"
- **Causa**: Slug no existe o dominio no configurado
- **Solución**: 
  ```sql
  SELECT * FROM organizations WHERE slug = 'gonvarri';
  SELECT * FROM control_org_domains_v WHERE organization_id = '...';
  ```

### Error: "El registro automático no está habilitado"
- **Causa**: `allow_self_registration = false`
- **Solución**: 
  ```sql
  UPDATE organizations SET allow_self_registration = true WHERE slug = 'gonvarri';
  ```

### Error: "El dominio no está permitido"
- **Causa**: Dominio no está en `control_org_domains_v`
- **Solución**: Añadir dominio desde Admin App o directamente:
  ```sql
  SELECT add_organization_domain('org_id', 'gonvarri.com');
  ```

### Error: RoleSwitcher no aparece
- **Causa**: Usuario no tiene rol SAP
- **Solución**: Verificar `user_organizations.role = 'SAP'`
- **Verificar**: `lib/context/auth-context.tsx` → `isSAPUser`

---

## 📊 Matriz de Permisos por Rol

| Acción | SAP | CEO | BU | EMP |
|--------|-----|-----|----|----|
| **Acceso Admin App** | ✅ (si @sapira.ai) | ❌ | ❌ | ❌ |
| **Ver todos issues** | ✅ | ✅ | ❌ | ❌ |
| **Ver issues de BU** | ✅ | ✅ | ✅ | ❌ |
| **Ver sus issues** | ✅ | ✅ | ✅ | ✅ |
| **Crear proyectos** | ✅ | ✅ | ✅ | ❌ |
| **Gestionar BUs** | ✅ | ✅ | ✅ | ❌ |
| **Configuración** | ✅ | ❌ | ❌ | ❌ |
| **RoleSwitcher** | ✅ | ❌ | ❌ | ❌ |
| **Invitar usuarios** | ✅ (si org admin) | ❌ | ❌ | ❌ |
| **Editar usuarios** | ✅ (si org admin) | ❌ | ❌ | ❌ |

---

## 🚀 Próximos Pasos

1. **Documentar bugs encontrados**
2. **Priorizar fixes**
3. **Re-testear después de fixes**
4. **Preparar para deploy**

---

## 📚 Referencias

- `ARCHITECTURE_ROLES.md` → Arquitectura completa de roles
- `ROLES_SYSTEM.md` → Sistema de roles detallado
- `FLUJOS_TESTING.md` → Flujos de testing originales
- `middleware.ts` → Middleware de acceso
- `lib/context/auth-context.tsx` → Contexto de autenticación
- `app/api/auth/*` → Endpoints de autenticación
- `supabase/migrations/*` → Políticas RLS
