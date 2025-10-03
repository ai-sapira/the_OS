# 🚀 Setup RÁPIDO Aurovitas - 3 Minutos

## ✅ Ya está hecho:
- ✅ Organización "Aurovitas" creada
- ✅ Middleware configurado

## 🎯 Solo falta crear el usuario (2 minutos):

### **PASO 1: Crear Usuario en Supabase Dashboard**

1. **Abre este link:**
   👉 https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users

2. **Click en "Add user" → "Create new user"**

3. **Rellena:**
   ```
   Email:             gerardo@aurovitas.com
   Password:          123456
   Auto Confirm User: ✅ (marcar)
   ```

4. **Click "Create user"**

5. **Copia el UUID** del usuario (aparece en la columna "ID")
   - Se ve algo así: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### **PASO 2: Vincular Usuario (SQL)**

1. **Ve al SQL Editor:**
   👉 https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql/new

2. **Pega y ejecuta** (reemplaza `UUID_AQUI` con el UUID que copiaste):

```sql
-- Vincular Gerardo con Aurovitas
INSERT INTO user_organizations (auth_user_id, organization_id, role, active)
VALUES (
  'UUID_AQUI',  -- ⬅️ PEGA AQUÍ EL UUID
  '22222222-2222-2222-2222-222222222222',
  'CEO',
  true
);
```

3. **Click "Run"**

---

### **PASO 3: Login**

1. **Abre:** http://localhost:3003

2. **Login con:**
   ```
   Email:    gerardo@aurovitas.com
   Password: 123456
   ```

3. **¡Listo!** Verás "Aurovitas" en el header

---

## 🎉 Credenciales Finales

```
Email:    gerardo@aurovitas.com
Password: 123456
Org:      Aurovitas (vacía)
Rol:      CEO
```

**URL:** http://localhost:3003 (tu servidor está en el puerto 3003)

---

## 🐛 Si Sigue Sin Funcionar

1. **Verifica que creaste el usuario en Supabase:**
   - https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/auth/users
   - Debe aparecer `gerardo@aurovitas.com` en la lista

2. **Verifica el vínculo:**
```sql
SELECT 
  au.email,
  o.name,
  uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.auth_user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE au.email = 'gerardo@aurovitas.com';
```

3. **Limpia cookies del navegador**
   - Abre DevTools (F12)
   - Application → Cookies → Eliminar todo
   - Refresca la página

4. **Prueba en modo incógnito**

---

## 📱 Contacto

Si después de esto sigue sin funcionar, comparte:
- Captura del error en la consola (F12)
- Captura de la lista de usuarios en Supabase
- El resultado del SQL de verificación

