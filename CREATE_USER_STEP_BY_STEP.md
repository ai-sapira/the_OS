# 👤 Crear Usuario Gerardo - Paso a Paso

## ⚠️ IMPORTANTE: Verifica el Proyecto

Asegúrate de estar en el proyecto correcto:
```
Proyecto: Internal OS
ID: iaazpsvjiltlkhyeakmx
```

---

## 📝 Paso 1: Abrir Authentication

1. **Abre este link exacto:**
   https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. **Verifica que estás en:**
   - Proyecto: "Internal OS"
   - Sección: "Authentication" → "Users"

---

## 📝 Paso 2: Crear Usuario

1. **Click en el botón verde "Add user"** (esquina superior derecha)

2. **Selecciona "Create new user"**

3. **Rellena el formulario:**

   ```
   Email:                gerardo@aurovitas.com
   Password:             123456
   Auto Confirm User:    ✅ (IMPORTANTE: Marcar esta casilla)
   ```

4. **Click "Create user"**

---

## 📝 Paso 3: Copiar UUID

Después de crear el usuario:

1. Aparecerá en la lista de usuarios
2. En la columna **"ID"** verás un UUID largo
3. **Copia ese UUID completo**

Ejemplo de UUID:
```
bc033560-cb4e-41be-a18e-21d1eb5d06bd
```

---

## 📝 Paso 4: Pégame el UUID

Una vez que tengas el UUID, **pégalo aquí en el chat** y yo lo vincularé automáticamente con Aurovitas.

---

## 🐛 Troubleshooting

### "No veo el botón Add user"
- Verifica que estás en la pestaña "Users" dentro de "Authentication"
- Verifica que tienes permisos de admin en el proyecto

### "Me pide verificar email"
- Asegúrate de marcar **"Auto Confirm User"** ✅
- Esto evita tener que verificar el email manualmente

### "El usuario no aparece en la lista"
- Refresca la página
- Verifica que no hubo errores al crear

### "Dice que el email ya existe"
- El email ya fue usado antes
- Usa otro email o elimina el usuario anterior

---

## ✅ Cuando tengas el UUID

Pégamelo en el chat y ejecutaré:
```sql
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'TU_UUID_AQUI',
  '22222222-2222-2222-2222-222222222222',
  'CEO',
  true
);
```

¡Y estarás listo para hacer login! 🚀

