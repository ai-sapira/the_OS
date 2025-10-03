# 🚀 INSTRUCCIONES URGENTES - Crear Usuarios Mock en Aurovitas

## ⚡ Pasos Rápidos (2 minutos)

### 1. Abre Supabase SQL Editor
Ve a: https://supabase.com/dashboard/project/iaazpsvjiltlkhyeakmx/sql

### 2. Copia y Pega el Script
Abre el archivo: **`EJECUTAR_USUARIOS_AUROVITAS.sql`**

Copia TODO el contenido y pégalo en el SQL Editor de Supabase.

### 3. Ejecuta (Run)
Haz clic en el botón **"Run"** o presiona `Ctrl+Enter` / `Cmd+Enter`

### 4. Verifica el Resultado
Deberías ver una tabla con **13 usuarios**:
- ✅ 2 SAP (María García, Carlos Martínez)
- ✅ 1 CEO (Gerardo Dueso)
- ✅ 4 BU Managers (Roberto, Patricia, Miguel Ángel, Ana)
- ✅ 6 Employees (Elena, Javier, Cristina, Fernando, Isabel, Laura, David)

---

## ✅ Después de Ejecutar

Los usuarios aparecerán automáticamente en:
- 🎯 Dropdown de **Assignee** (asignar issues)
- 👤 Dropdown de **Manager** (asignar proyectos)
- 📊 Dropdown de **BU Owner** (asignar initiatives)
- 📋 Todos los selectores de usuarios

---

## 🔧 Si hay Error de "Duplicate Key"

**No te preocupes** - significa que algunos usuarios ya existen. El script usa `ON CONFLICT DO UPDATE`, así que simplemente los actualizará.

---

## 📋 IDs de Usuarios Importantes

Para referencia en el código:

```typescript
// SAP (Sapira Advisors)
'11111111-aaaa-2222-2222-222222222222' // María García
'11111111-aaaa-3333-3333-333333333333' // Carlos Martínez

// CEO
'11111111-aaaa-1111-1111-111111111111' // Gerardo Dueso

// BU Managers
'11111111-aaaa-4444-4444-444444444444' // Roberto Jiménez
'11111111-aaaa-5555-5555-555555555555' // Patricia Moreno
'11111111-aaaa-6666-6666-666666666666' // Miguel Ángel Torres
'11111111-aaaa-7777-7777-777777777777' // Ana Fernández

// Employees
'11111111-aaaa-8888-8888-888888888888' // Elena Ruiz
'11111111-aaaa-9999-9999-999999999999' // Javier Blanco
'11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Cristina Vargas
'11111111-aaaa-bbbb-bbbb-bbbbbbbbbbbb' // Fernando Castro
'11111111-aaaa-cccc-cccc-cccccccccccc' // Isabel Morales
'11111111-aaaa-dddd-dddd-dddddddddddd' // Laura Sánchez
'11111111-aaaa-eeee-eeee-eeeeeeeeeeee' // David López
```

---

## 🎉 ¡Listo!

Después de ejecutar el script:
1. Refresca tu aplicación (F5)
2. Los dropdowns de asignar deberían mostrar todos los usuarios
3. Ya puedes crear issues, proyectos e initiatives asignando personas

---

**⚠️ IMPORTANTE:** Estos son usuarios MOCK (solo para demo). No tienen cuentas de login en Supabase Auth.

