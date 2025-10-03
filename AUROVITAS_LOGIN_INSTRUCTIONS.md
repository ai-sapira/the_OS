# 🎯 Acceso a Aurovitas - Organización Vacía

## ✅ TODO ESTÁ CONFIGURADO Y LISTO

### 📊 Estado Actual

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Organización** | ✅ Creada | Aurovitas (ID: 22222222-2222-2222-2222-222222222222) |
| **Usuario** | ✅ Creado | gerardo@aurovitas.com |
| **Vínculo** | ✅ Configurado | Gerardo → Aurovitas (CEO) |
| **Email Confirmado** | ✅ Sí | Puede hacer login inmediatamente |
| **Middleware** | ✅ Activado | Requiere autenticación |
| **Base de Datos** | ✅ Vacía | 0 issues, 0 projects, 0 initiatives |

---

## 🚀 CÓMO ACCEDER (SUPER FÁCIL)

### **Paso 1: Iniciar la App**
```bash
cd /Users/pablosenabre/Sapira/the_OS
pnpm dev
```

### **Paso 2: Abrir en el Navegador**
```
http://localhost:3000
```

### **Paso 3: Login**

Serás redirigido automáticamente a `/login`. Ingresa:

```
Email:    gerardo@aurovitas.com
Password: aurovitas123
```

### **Paso 4: ¡Listo!**

Una vez dentro verás:
- ✅ **Header con "Aurovitas"** (indicando tu organización)
- ✅ **Organización completamente vacía** (sin issues, projects, initiatives)
- ✅ **Puedes crear todo desde cero**
- ✅ **No verás nada de Gonvarri** (están completamente separadas)

---

## 🎨 Lo Que Puedes Hacer

### Como CEO de Aurovitas, puedes:

1. **Ver el dashboard general** (vacío inicialmente)
2. **Crear Business Units** (Initiatives)
3. **Crear Proyectos**
4. **Crear Issues/Tickets**
5. **Ver métricas** (cuando tengas datos)
6. **Ver roadmap** (cuando tengas proyectos)
7. **Crear encuestas**
8. **Ver organigrama** (cuando tengas más usuarios)

---

## 👥 Si Necesitas Más Usuarios

### **Crear un BU Manager:**

1. **En Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users
   - Click "Add user" → "Create new user"
   - Email: `manager@aurovitas.com`
   - Password: `aurovitas123`
   - Auto confirm: ✅
   - Copiar UUID del usuario

2. **Primero crear una Business Unit** (desde la UI o SQL):
```sql
INSERT INTO initiatives (id, organization_id, name, slug, description, active)
VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'Ventas',
  'ventas',
  'Departamento de Ventas',
  true
)
RETURNING id;  -- Copia este ID
```

3. **Vincular manager a la BU:**
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, initiative_id, active)
VALUES (
  'UUID_DEL_MANAGER',
  '22222222-2222-2222-2222-222222222222',
  'BU',
  'UUID_DE_LA_INITIATIVE',
  true
);
```

### **Crear un Empleado:**

1. **En Supabase Dashboard:**
   - Email: `empleado@aurovitas.com`
   - Password: `aurovitas123`
   - Copiar UUID

2. **Vincular:**
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'UUID_DEL_EMPLEADO',
  '22222222-2222-2222-2222-222222222222',
  'EMP',
  true
);
```

---

## 🔐 Credenciales de Acceso

### **Aurovitas (Nueva - Vacía)**
```
Email:    gerardo@aurovitas.com
Password: aurovitas123
Rol:      CEO
```

### **Gonvarri (Existente - Con Datos de Demo)**
Actualmente en modo demo sin autenticación real.
Para acceder, necesitarías crear usuarios similares.

---

## 🔄 Cambiar de Organización

Para cambiar entre organizaciones:
1. Click en tu avatar (esquina superior derecha)
2. Click en "Cerrar sesión"
3. Login con otro usuario de otra organización

---

## 🛠️ Troubleshooting

### **"No puedo hacer login"**
- Verifica que el servidor esté corriendo (`pnpm dev`)
- Verifica las credenciales: `gerardo@aurovitas.com` / `aurovitas123`
- Abre la consola del navegador para ver errores

### **"No veo la organización en el header"**
- El AuthContext puede tardar un momento en cargar
- Refresca la página (F5)
- Verifica en la consola si hay errores

### **"Me redirige a /login constantemente"**
- Verifica que el middleware esté correctamente configurado
- Limpia cookies del navegador
- Prueba en modo incógnito

### **"Veo datos de Gonvarri"**
- Esto NO debería pasar si el AuthContext funciona correctamente
- Verifica que el `currentOrg` esté seteado a Aurovitas
- Abre DevTools → Console y verifica `localStorage.getItem('sapira.currentOrg')`

---

## 📋 Verificación Técnica

Si quieres verificar que todo está correcto:

```sql
-- Ver todas las organizaciones
SELECT id, name, slug FROM organizations;

-- Ver usuario de Aurovitas
SELECT 
  au.email,
  o.name,
  uo.role,
  uo.active
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE o.slug = 'aurovitas';

-- Verificar que Aurovitas está vacía
SELECT 
  (SELECT COUNT(*) FROM issues WHERE organization_id = '22222222-2222-2222-2222-222222222222') as issues,
  (SELECT COUNT(*) FROM projects WHERE organization_id = '22222222-2222-2222-2222-222222222222') as projects,
  (SELECT COUNT(*) FROM initiatives WHERE organization_id = '22222222-2222-2222-2222-222222222222') as initiatives;
```

---

## 🎉 ¡Todo Listo!

Tu organización **Aurovitas** está:
- ✅ Creada
- ✅ Completamente vacía
- ✅ Con login funcional
- ✅ Lista para usar

**Credenciales:**
- Email: `gerardo@aurovitas.com`
- Password: `aurovitas123`

**URL:** http://localhost:3000

¡Disfruta explorando tu nueva organización! 🚀

