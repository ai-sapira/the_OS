# 🧪 Flujos de Testing - Sapira OS

Documento completo con todos los flujos de autenticación y registro para probar sistemáticamente.

## 📋 Checklist de Configuración Pre-Testing

### 1. Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `NEXT_PUBLIC_DEMO_MODE` NO está en `true` (o no existe)

### 2. Base de Datos
- [ ] Organización creada (ej: Gonvarri con slug `gonvarri`)
- [ ] Dominio configurado en `control_plane.organization_domains` (ej: `gonvarri.com`)
- [ ] `allow_self_registration = true` en la organización
- [ ] Logo de organización (opcional)

### 3. Servidores Corriendo
- [ ] OS Principal: `http://localhost:3001` (o puerto configurado)
- [ ] Admin App: `http://localhost:3002` (o puerto configurado)

---

## 🔐 FLUJO 1: Landing Page → Auto-Detección → Login

### Descripción
Usuario nuevo llega a la landing principal, introduce su email, y el sistema detecta su organización.

### Pasos
1. **Ir a**: `http://localhost:3001/`
2. **Verificar**: Se muestra formulario simple con campo de email
3. **Introducir email**: `test@gonvarri.com`
4. **Click en "Continuar"** o enviar formulario
5. **Verificar**: 
   - ✅ Redirige a `/gonvarri?email=test@gonvarri.com`
   - ✅ Se muestra landing de Gonvarri con logo/nombre
   - ✅ Botones "Iniciar sesión" y "Registrarse" visibles

### Resultado Esperado
- Redirección correcta a `/[slug]`
- Email pre-fill en la URL
- Landing muestra branding de la organización

### Errores Comunes
- ❌ "Organización no encontrada" → Verificar que el dominio está en `control_org_domains_v`
- ❌ No redirige → Verificar que `/api/auth/resolve-org` funciona

---

## 📝 FLUJO 2: Auto-Registro desde Landing de Org

### Descripción
Usuario nuevo llega a la landing de su organización y se registra directamente.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri`
2. **Verificar**: Landing muestra branding de Gonvarri
3. **Click en "Registrarse"**
4. **Verificar**: Redirige a `/gonvarri/signup`
5. **Completar formulario**:
   - Nombre: `Juan`
   - Apellidos: `Pérez`
   - Email: `juan@gonvarri.com` (debe ser dominio válido)
   - Contraseña: `test123`
6. **Click en "Crear cuenta"**
7. **Verificar**:
   - ✅ Usuario creado en Supabase Auth
   - ✅ Usuario creado en tabla `users`
   - ✅ Usuario vinculado en `user_organizations`
   - ✅ Auto-login exitoso
   - ✅ Redirige a `/issues`
   - ✅ Ve solo datos de su organización

### Resultado Esperado
- Usuario registrado y autenticado
- Redirige a dashboard (`/issues`)
- Solo ve datos de su organización

### Errores Comunes
- ❌ "El dominio no está permitido" → Verificar dominio en `control_org_domains_v`
- ❌ "El registro automático no está habilitado" → Verificar `allow_self_registration = true`
- ❌ "Este email ya está registrado" → Usuario ya existe
- ❌ Error JSON → Verificar que la API devuelve JSON válido

---

## 🔑 FLUJO 3: Login desde Landing de Org

### Descripción
Usuario existente llega a la landing y hace login.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri?email=juan@gonvarri.com`
2. **Click en "Iniciar sesión"**
3. **Verificar**: Redirige a `/login?org=gonvarri&email=juan@gonvarri.com`
4. **Verificar**: Email está pre-fill en el campo
5. **Introducir contraseña**: `test123`
6. **Click en "Iniciar sesión"**
7. **Verificar**:
   - ✅ Login exitoso
   - ✅ Redirige a `/issues`
   - ✅ Ve solo datos de Gonvarri
   - ✅ Cookie `sapira-org-slug` está establecida

### Resultado Esperado
- Login exitoso
- Redirige a dashboard
- Organización seleccionada correctamente

### Errores Comunes
- ❌ "Invalid login credentials" → Verificar email/contraseña
- ❌ No redirige → Verificar middleware y AuthProvider

---

## 🏠 FLUJO 4: Landing Principal con Email Existente

### Descripción
Usuario existente introduce su email en la landing principal.

### Pasos
1. **Ir a**: `http://localhost:3001/`
2. **Introducir email**: `juan@gonvarri.com` (usuario existente)
3. **Enviar formulario**
4. **Verificar**: 
   - ✅ Detecta que el usuario existe
   - ✅ Redirige a `/login?org=gonvarri&email=juan@gonvarri.com`
   - ✅ Email pre-fill en login

### Resultado Esperado
- Detección correcta de usuario existente
- Redirección directa a login con org y email

---

## 🚪 FLUJO 5: Logout y Re-Login

### Descripción
Usuario autenticado cierra sesión y vuelve a iniciar sesión.

### Pasos
1. **Estar autenticado** en `/issues`
2. **Click en avatar** (esquina superior derecha)
3. **Click en "Cerrar sesión"** (o usar botón del sidebar)
4. **Verificar**:
   - ✅ Sesión cerrada
   - ✅ Redirige a `/`
   - ✅ Cookies limpiadas
5. **Ir a**: `http://localhost:3001/gonvarri`
6. **Click en "Iniciar sesión"**
7. **Login con credenciales**
8. **Verificar**: Login exitoso y redirige a `/issues`

### Resultado Esperado
- Logout limpia sesión completamente
- Re-login funciona correctamente

---

## 👥 FLUJO 6: Usuario con Múltiples Organizaciones

### Descripción
Usuario que pertenece a más de una organización.

### Setup Previo
```sql
-- Vincular usuario a 2 organizaciones
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES 
  ('USER_UUID', 'ORG_1_UUID', 'EMP', true),
  ('USER_UUID', 'ORG_2_UUID', 'EMP', true);
```

### Pasos
1. **Login** con usuario que tiene múltiples orgs
2. **Verificar**: 
   - ✅ Redirige a `/select-org`
   - ✅ Muestra lista de organizaciones disponibles
3. **Seleccionar una organización**
4. **Verificar**:
   - ✅ Redirige a `/issues`
   - ✅ Ve solo datos de la org seleccionada
   - ✅ `users.organization_id` actualizado

### Resultado Esperado
- Selector de organización funciona
- Cambio de org persiste en backend

---

## 🔧 FLUJO 7: Crear Usuario desde Admin App

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
   - Rol: `EMP` (o CEO, BU, SAP)
   - Nombre: `Nuevo`
   - Apellidos: `Usuario`
5. **Click en "Crear usuario"**
6. **Verificar**:
   - ✅ Usuario creado exitosamente
   - ✅ Se muestran credenciales (guardar)
   - ✅ Usuario aparece en la lista
7. **Login con nuevo usuario** en OS Principal
8. **Verificar**: Login exitoso y acceso correcto

### Resultado Esperado
- Usuario creado desde Admin
- Puede hacer login inmediatamente
- Vinculado correctamente a la organización

---

## 📧 FLUJO 8: Invitar Usuario por Email

### Descripción
Staff invita a un usuario por email (envía invitación).

### Pasos
1. **Login en Admin App**
2. **Ir a**: Organizaciones → [Gonvarri] → Usuarios
3. **Click en "Invitar por email"**
4. **Completar**:
   - Email: `invitado@gonvarri.com`
   - Rol: `EMP`
5. **Click en "Enviar invitación"**
6. **Verificar**:
   - ✅ Invitación creada en `user_invitations`
   - ✅ Email enviado (si está configurado)
   - ✅ Aparece en "Invitaciones pendientes"
7. **Usuario hace click en link del email** (o va a `/invite/[token]`)
8. **Completa registro** con contraseña
9. **Verificar**: Usuario registrado y vinculado

### Resultado Esperado
- Invitación enviada
- Usuario puede completar registro
- Vinculado a organización correcta

---

## 🚫 FLUJO 9: Registro Bloqueado (allow_self_registration = false)

### Descripción
Organización que no permite auto-registro.

### Setup Previo
```sql
UPDATE organizations 
SET allow_self_registration = false 
WHERE slug = 'gonvarri';
```

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri`
2. **Verificar**: 
   - ✅ Landing muestra "El registro está gestionado por un administrador"
   - ✅ Botón "Registrarse" NO visible (o deshabilitado)
3. **Intentar acceder directamente**: `http://localhost:3001/gonvarri/signup`
4. **Verificar**: 
   - ✅ Muestra error o redirige
   - ✅ No permite registro

### Resultado Esperado
- Registro bloqueado correctamente
- Mensaje claro al usuario

---

## 🌐 FLUJO 10: Dominio No Permitido

### Descripción
Usuario intenta registrarse con email de dominio no permitido.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri/signup`
2. **Completar formulario** con email: `test@otrodominio.com`
3. **Click en "Crear cuenta"**
4. **Verificar**:
   - ✅ Error: "El dominio otrodominio.com no está permitido"
   - ✅ No se crea usuario

### Resultado Esperado
- Validación de dominio funciona
- Error claro al usuario

---

## 🔄 FLUJO 11: Cambio de Organización

### Descripción
Usuario con múltiples orgs cambia de organización.

### Pasos
1. **Login** con usuario multi-org
2. **Seleccionar organización A** en `/select-org`
3. **Verificar**: Ve datos de org A
4. **Logout**
5. **Login de nuevo**
6. **Seleccionar organización B** en `/select-org`
7. **Verificar**: 
   - ✅ Ve datos de org B
   - ✅ `users.organization_id` actualizado a org B
8. **Recargar página**
9. **Verificar**: Mantiene org B seleccionada

### Resultado Esperado
- Cambio de org funciona
- Persistencia correcta en backend
- No se pierde selección al recargar

---

## 🛡️ FLUJO 12: Protección de Rutas (RLS)

### Descripción
Verificar que RLS funciona correctamente.

### Pasos
1. **Login** como usuario de Gonvarri
2. **Ir a**: `/issues`
3. **Verificar**: Solo ve issues de Gonvarri
4. **Ir a**: `/projects`
5. **Verificar**: Solo ve projects de Gonvarri
6. **Ir a**: `/initiatives`
7. **Verificar**: Solo ve initiatives de Gonvarri
8. **Abrir DevTools** → Network
9. **Verificar requests**: Todos filtran por `organization_id`

### Resultado Esperado
- RLS funciona correctamente
- Usuario solo ve datos de su organización
- No hay datos de otras organizaciones

---

## 📱 FLUJO 13: Acceso Directo a Rutas Protegidas

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

### Resultado Esperado
- Middleware protege rutas correctamente
- Redirección a landing funciona

---

## 🔍 FLUJO 14: Verificación de Cookie de Org

### Descripción
Verificar que la cookie `sapira-org-slug` se establece correctamente.

### Pasos
1. **Ir a**: `http://localhost:3001/gonvarri`
2. **Abrir DevTools** → Application → Cookies
3. **Verificar**: Cookie `sapira-org-slug` = `gonvarri`
4. **Ir a**: `http://localhost:3001/aeq`
5. **Verificar**: Cookie `sapira-org-slug` = `aeq`
6. **Login** con usuario
7. **Verificar**: Cookie persiste después de login

### Resultado Esperado
- Cookie se establece correctamente
- Cambia según la org en la URL
- Persiste después de login

---

## 🎯 Checklist de Testing Completo

### Flujos Básicos
- [ ] FLUJO 1: Landing → Auto-detección → Login
- [ ] FLUJO 2: Auto-registro desde landing de org
- [ ] FLUJO 3: Login desde landing de org
- [ ] FLUJO 4: Landing con email existente

### Flujos de Sesión
- [ ] FLUJO 5: Logout y re-login
- [ ] FLUJO 11: Cambio de organización

### Flujos de Admin
- [ ] FLUJO 7: Crear usuario desde Admin
- [ ] FLUJO 8: Invitar usuario por email

### Flujos de Validación
- [ ] FLUJO 9: Registro bloqueado
- [ ] FLUJO 10: Dominio no permitido

### Flujos de Seguridad
- [ ] FLUJO 12: Protección de rutas (RLS)
- [ ] FLUJO 13: Acceso directo a rutas protegidas
- [ ] FLUJO 14: Verificación de cookie

### Flujos Avanzados
- [ ] FLUJO 6: Usuario con múltiples organizaciones

---

## 🐛 Troubleshooting Común

### Error: "Failed to execute 'json' on 'Response'"
- **Causa**: API no devuelve JSON válido o respuesta vacía
- **Solución**: Verificar que todas las APIs devuelven `NextResponse.json()`
- **Verificar**: Logs del servidor para ver qué devuelve la API

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
  -- Usar función RPC
  SELECT add_organization_domain('org_id', 'gonvarri.com');
  ```

---

## 📊 Resultados Esperados por Flujo

| Flujo | Estado | Notas |
|-------|--------|-------|
| FLUJO 1 | ⬜ | |
| FLUJO 2 | ⬜ | |
| FLUJO 3 | ⬜ | |
| FLUJO 4 | ⬜ | |
| FLUJO 5 | ⬜ | |
| FLUJO 6 | ⬜ | |
| FLUJO 7 | ⬜ | |
| FLUJO 8 | ⬜ | |
| FLUJO 9 | ⬜ | |
| FLUJO 10 | ⬜ | |
| FLUJO 11 | ⬜ | |
| FLUJO 12 | ⬜ | |
| FLUJO 13 | ⬜ | |
| FLUJO 14 | ⬜ | |

---

## 🚀 Próximos Pasos Después de Testing

1. **Documentar bugs encontrados**
2. **Priorizar fixes**
3. **Re-testear después de fixes**
4. **Preparar para deploy**

