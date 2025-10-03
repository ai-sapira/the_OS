# 👥 Usuarios Mock para Aurovitas

## 🎯 Problema Resuelto

Los dropdowns de asignación (managers, assignees, BU owners) estaban vacíos en Aurovitas porque no había usuarios en la base de datos para esa organización.

## ✅ Solución

He creado un script SQL que inserta **13 usuarios mock** en Aurovitas para que los dropdowns funcionen correctamente.

---

## 🚀 Cómo Aplicar (2 opciones)

### **Opción 1: Supabase Dashboard (Recomendado)**

1. **Abre el SQL Editor de Supabase:**
   ```
   https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new
   ```

2. **Copia el contenido del archivo:**
   ```bash
   cat scripts/setup-aurovitas-users.sql
   ```

3. **Pega el SQL en el editor y ejecuta** (Click "Run")

4. **Verifica que se insertaron 13 usuarios:**
   - Al final del script hay un SELECT que muestra todos los usuarios

---

### **Opción 2: Desde la Terminal (Si tienes psql configurado)**

```bash
# Ejecutar el script directamente
psql postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres \
  -f scripts/setup-aurovitas-users.sql
```

---

## 👥 Usuarios Creados

### **Estrategia (3 usuarios)**

| Nombre | Email | Rol | Descripción |
|--------|-------|-----|-------------|
| Gerardo Dueso | gerardo@aurovitas.com | CEO | CEO de Aurovitas |
| María García | maria.garcia@sapira.ai | SAP | Asesora Sapira |
| Carlos Martínez | carlos.martinez@sapira.ai | SAP | Asesor Sapira |

### **BU Managers (4 usuarios)**

| Nombre | Email | Rol | Departamento |
|--------|-------|-----|--------------|
| Roberto Jiménez | roberto.jimenez@aurovitas.com | BU | Finance Manager |
| Patricia Moreno | patricia.moreno@aurovitas.com | BU | Legal Manager |
| Miguel Ángel Torres | miguel.torres@aurovitas.com | BU | HR Manager |
| Ana Fernández | ana.fernandez@aurovitas.com | BU | Sales Manager |

### **Empleados (6 usuarios)**

| Nombre | Email | Rol |
|--------|-------|-----|
| Elena Ruiz | elena.ruiz@aurovitas.com | EMP |
| Javier Blanco | javier.blanco@aurovitas.com | EMP |
| Cristina Vargas | cristina.vargas@aurovitas.com | EMP |
| Fernando Castro | fernando.castro@aurovitas.com | EMP |
| Isabel Morales | isabel.morales@aurovitas.com | EMP |
| Laura Sánchez | laura.sanchez@aurovitas.com | EMP |
| David López | david.lopez@aurovitas.com | EMP |

**Total: 13 usuarios** (1 CEO + 2 SAP + 4 BU + 6 EMP)

---

## ✨ Qué Cambiará

### **Antes (Dropdowns Vacíos):**
```
Manager: [Sin opciones]
Assignee: [Sin opciones]
Owner: [Sin opciones]
```

### **Después (Con Usuarios):**
```
Manager: 
  ✓ Roberto Jiménez (BU)
  ✓ Patricia Moreno (BU)
  ✓ Miguel Ángel Torres (BU)
  ✓ Ana Fernández (BU)
  ✓ María García (SAP)
  ✓ Carlos Martínez (SAP)

Assignee:
  ✓ Todos los 13 usuarios

Owner:
  ✓ Todos los 13 usuarios
```

---

## 🔍 Cómo Verificar

### **Desde la App:**

1. Reinicia el servidor si está corriendo:
   ```bash
   ./restart-clean.sh
   ```

2. Abre la app en el navegador:
   ```
   http://localhost:3000
   ```

3. Intenta **crear una Initiative** y seleccionar un Manager:
   - Ahora deberías ver los 4 BU managers + 2 SAP advisors

4. Intenta **crear un Issue** y seleccionar un Assignee:
   - Ahora deberías ver los 13 usuarios

### **Desde Supabase (SQL):**

```sql
-- Ver todos los usuarios de Aurovitas
SELECT 
  name,
  email,
  role,
  active
FROM users
WHERE organization_id = '22222222-2222-2222-2222-222222222222'
ORDER BY 
  CASE role
    WHEN 'SAP' THEN 1
    WHEN 'CEO' THEN 2
    WHEN 'BU' THEN 3
    WHEN 'EMP' THEN 4
  END,
  name;
```

---

## ⚠️ Notas Importantes

### **Estos usuarios son MOCK:**
- ✅ Aparecen en los dropdowns
- ✅ Se pueden asignar a issues, projects, initiatives
- ✅ Tienen nombre, email, rol, organización
- ❌ **NO pueden hacer login** (no tienen cuenta en Supabase Auth)
- ❌ **NO son usuarios reales** de Aurovitas

### **Para crear usuarios que SÍ puedan hacer login:**
1. Crea la cuenta en Supabase Auth Dashboard
2. Vincula el `auth_user_id` con el `user_id` en la tabla `users`
3. Ver: `CREATE_USER_STEP_BY_STEP.md`

---

## 🎉 Resultado Final

Después de ejecutar este script, Aurovitas tendrá:
- ✅ **13 usuarios mock** listos para asignar
- ✅ **Dropdowns funcionales** en toda la app
- ✅ **Diferentes roles** (CEO, BU, EMP, SAP)
- ✅ **Emails únicos** por usuario
- ✅ **Organización completa** para empezar a trabajar

---

## 🆘 Si Hay Problemas

### **"Los dropdowns siguen vacíos"**

1. Verifica que el script se ejecutó correctamente:
   ```sql
   SELECT COUNT(*) FROM users 
   WHERE organization_id = '22222222-2222-2222-2222-222222222222';
   ```
   Debería devolver: **13**

2. Verifica que la app está usando Aurovitas:
   ```javascript
   // Abre la consola del navegador (F12)
   console.log(localStorage.getItem('sapira.currentOrg'))
   // Debería mostrar: "22222222-2222-2222-2222-222222222222"
   ```

3. Limpia la caché y recarga:
   ```bash
   ./restart-clean.sh
   ```

### **"Error al ejecutar el script SQL"**

- Asegúrate de tener permisos de escritura en la tabla `users`
- Verifica que la organización Aurovitas existe:
  ```sql
  SELECT * FROM organizations 
  WHERE id = '22222222-2222-2222-2222-222222222222';
  ```

---

## 📚 Archivos Relacionados

- `scripts/setup-aurovitas-users.sql` - Script SQL para insertar usuarios
- `lib/api/issues.ts` - API que consulta usuarios (`getAvailableUsers()`)
- `lib/api/initiatives.ts` - API que consulta managers (`getAvailableManagers()`)
- `components/ui/editable-manager-dropdown.tsx` - Dropdown de managers
- `components/ui/editable-issue-assignee-dropdown.tsx` - Dropdown de assignees

---

## 🎯 Próximos Pasos

Una vez ejecutado el script, podrás:

1. ✅ **Crear Initiatives** y asignarles managers
2. ✅ **Crear Projects** y asignarles owners
3. ✅ **Crear Issues** y asignarlos a personas
4. ✅ **Ver métricas** por usuario/rol
5. ✅ **Usar todos los filtros** de la app

**¡Todo listo para trabajar con Aurovitas!** 🎉


