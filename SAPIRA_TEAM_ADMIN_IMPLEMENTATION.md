# 👥 Implementación de Sapira Team en Admin App

## 📋 Resumen

Se ha creado una sección separada **"Sapira Team"** en el Admin App para gestionar los usuarios de Sapira de manera centralizada, diferente a las organizaciones cliente.

---

## ✅ Funcionalidades Implementadas

### **1. Sección "Sapira Team" en Admin App**

**Ubicación:** `/sapira-team`

**Características:**
- ✅ Lista todos los usuarios con email `@sapira.ai`
- ✅ Crear nuevos miembros del equipo Sapira
- ✅ Ver organizaciones donde cada usuario está asignado
- ✅ Añadir usuarios Sapira a organizaciones fácilmente
- ✅ Eliminar usuarios Sapira de organizaciones

### **2. Gestión Centralizada**

**Ventajas:**
- Los usuarios Sapira se gestionan desde un lugar centralizado
- No necesitas ir a cada organización para añadir usuarios Sapira
- Vista clara de qué usuarios Sapira están en qué organizaciones

### **3. Añadir a Organizaciones**

**Flujo:**
1. Desde `/sapira-team`, seleccionas un usuario
2. Click en "Añadir a org"
3. Seleccionas la organización
4. Opcionalmente seleccionas el perfil Sapira (FDE, Advisory Lead, Account Manager)
5. El usuario queda asignado a la organización con rol SAP

### **4. Integración con OS Principal**

**Selectores de Asignación:**
- ✅ Los usuarios Sapira asignados a una organización aparecen en los selectores
- ✅ Funciona en:
  - Asignación de owners en proyectos
  - Asignación de assignees en issues
  - Cualquier selector de usuarios

---

## 🎯 Estructura de Archivos

### **Admin App**

```
admin-app/
├── app/
│   └── sapira-team/
│       └── page.tsx                    # Página principal Sapira Team
├── app/api/admin/
│   └── sapira-team/
│       ├── route.ts                    # GET/POST: Listar y crear usuarios Sapira
│       └── [userId]/
│           └── organizations/
│               └── route.ts            # GET/POST/DELETE: Gestionar asignaciones
└── components/
    ├── CreateSapiraUserModal.tsx       # Modal para crear usuario Sapira
    └── AddToOrgModal.tsx               # Modal para añadir a organización
```

### **OS Principal**

```
lib/api/
├── issues.ts                           # getAvailableUsers() actualizado
└── projects.ts                         # getAvailableUsers() actualizado
```

---

## 🔄 Flujo Completo

### **1. Crear Usuario Sapira**

```
1. Admin App → Sapira Team → "Nuevo miembro"
2. Ingresar email (@sapira.ai obligatorio)
3. Ingresar contraseña y datos personales
4. Opcionalmente seleccionar perfil Sapira
5. Usuario creado (rol SAP automático)
```

### **2. Añadir Usuario Sapira a Organización**

```
1. Admin App → Sapira Team → Seleccionar usuario
2. Click "Añadir a org"
3. Seleccionar organización
4. Opcionalmente seleccionar perfil Sapira para esa org
5. Usuario asignado a organización
```

### **3. Usuario Sapira en OS Principal**

```
1. Usuario Sapira se loguea en OS Principal
2. Selecciona organización donde está asignado
3. Aparece en selectores de asignación:
   - Puede ser asignado como owner de proyectos
   - Puede ser asignado como assignee de issues
4. Puede usar RoleSwitcher para cambiar perfil
```

---

## 📊 API Endpoints

### **GET /api/admin/sapira-team**
Lista todos los usuarios Sapira

**Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "pablo@sapira.ai",
      "name": "Pablo Senabre",
      "active": true
    }
  ]
}
```

### **POST /api/admin/sapira-team**
Crea un nuevo usuario Sapira

**Body:**
```json
{
  "email": "nombre@sapira.ai",
  "password": "...",
  "first_name": "...",
  "last_name": "...",
  "sapira_role_type": "FDE" // opcional
}
```

### **GET /api/admin/sapira-team/[userId]/organizations**
Lista organizaciones donde el usuario está asignado

**Response:**
```json
{
  "organizations": [
    {
      "id": "...",
      "role": "SAP",
      "sapira_role_type": "FDE",
      "organizations": {
        "id": "...",
        "name": "Gonvarri",
        "slug": "gonvarri"
      }
    }
  ]
}
```

### **POST /api/admin/sapira-team/[userId]/organizations**
Añade usuario a organización

**Body:**
```json
{
  "organization_id": "...",
  "sapira_role_type": "FDE" // opcional
}
```

### **DELETE /api/admin/sapira-team/[userId]/organizations?organization_id=...**
Elimina usuario de organización

---

## 🎨 UI/UX

### **Página Principal (`/sapira-team`)**

- Tabla con todos los usuarios Sapira
- Botón "Nuevo miembro" para crear usuarios
- Botón "Ver orgs" para expandir y ver organizaciones
- Botón "Añadir a org" para cada usuario
- Botón eliminar (X) para quitar de organización

### **Modal Crear Usuario**

- Campo email (auto-completa @sapira.ai)
- Campos nombre/apellidos
- Campo contraseña
- Selector de perfil Sapira (opcional)

### **Modal Añadir a Org**

- Selector de organización
- Selector de perfil Sapira para esa organización (opcional)

---

## 🔒 Seguridad

- ✅ Solo usuarios Staff pueden acceder a `/sapira-team`
- ✅ Validación: Solo emails `@sapira.ai` permitidos
- ✅ Rol SAP automático para todos los usuarios Sapira
- ✅ Validación de perfiles Sapira (FDE, Advisory Lead, Account Manager)

---

## 📝 Próximos Pasos

1. ✅ **Implementado**: Sección Sapira Team en Admin App
2. ✅ **Implementado**: Crear usuarios Sapira
3. ✅ **Implementado**: Añadir usuarios a organizaciones
4. ✅ **Implementado**: Usuarios aparecen en selectores del OS Principal
5. 🔄 **Pendiente**: Editar usuarios Sapira existentes
6. 🔄 **Pendiente**: Ver/editar perfil Sapira en cada organización
7. 🔄 **Pendiente**: Mostrar perfil Sapira en selectores del OS Principal

---

## 📚 Referencias

- `admin-app/app/sapira-team/page.tsx`: Página principal
- `admin-app/app/api/admin/sapira-team/route.ts`: API de usuarios Sapira
- `lib/api/issues.ts`: `getAvailableUsers()` actualizado
- `lib/api/projects.ts`: `getAvailableUsers()` actualizado

