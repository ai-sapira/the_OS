# ✅ AUROVITAS ACTIVADA - Organización Vacía

## 🎯 ¿Qué se ha hecho?

Se ha configurado la aplicación para acceder a **Aurovitas** (organización completamente vacía) en lugar de Gonvarri.

---

## 📝 Archivos Modificados

### **1. Hooks**
- ✅ `hooks/use-supabase-data.ts`
  - Cambió organización por defecto de Gonvarri → Aurovitas
  - ID: `22222222-2222-2222-2222-222222222222`

### **2. APIs**
Todos los archivos API ahora usan Aurovitas por defecto:
- ✅ `lib/api/issues.ts`
- ✅ `lib/api/surveys.ts`
- ✅ `lib/api/initiatives.ts`
- ✅ `lib/api/projects.ts`
- ✅ `lib/api/teams-integration.ts`
- ✅ `lib/api/teams-messenger.ts`

### **3. Componentes**
- ✅ `components/ui/editable-manager-dropdown.tsx`
  - Eliminados managers mock de Gonvarri
  - Array vacío por defecto

---

## 🏢 Organizaciones Disponibles

### **Aurovitas (ACTIVA ahora)** 🆕
```
ID:   22222222-2222-2222-2222-222222222222
Slug: aurovitas
Estado: COMPLETAMENTE VACÍA
  - 0 Issues
  - 0 Projects
  - 0 Initiatives
  - 0 Usuarios (excepto gerardo@aurovitas.com si activas login)
```

### **Gonvarri (Desactivada)** 🏭
```
ID:   01234567-8901-2345-6789-012345678901
Slug: gonvarri
Estado: Con datos de demo
  - 50+ Issues
  - 20+ Projects
  - 6 Initiatives
```

---

## 🚀 Cómo Acceder

### **Paso 1: Reiniciar el servidor**
```bash
cd /Users/pablosenabre/Sapira/the_OS
./restart-clean.sh
```

### **Paso 2: Abrir el navegador**
```
http://localhost:3000
```

### **Resultado:**
- ✅ **Sin login** (modo demo activado)
- ✅ **Dashboard vacío**
- ✅ **0 Issues, 0 Projects, 0 Initiatives**
- ✅ **Listo para crear contenido desde cero**

---

## 👀 Lo que Verás

### **Dashboard Principal**
```
🏠 Dashboard
  ❌ "No hay issues recientes"
  ❌ "No hay proyectos"
  
✅ Botones disponibles:
  - Crear nuevo issue
  - Crear nuevo proyecto
  - Crear nueva initiative
```

### **Páginas**
- **Issues** → Vacío
- **Projects** → Vacío
- **Initiatives** → Vacío
- **Roadmap** → Vacío
- **Metrics** → Sin datos
- **Surveys** → Vacío

---

## 🔄 Para Volver a Gonvarri (con datos)

### **Opción 1: Cambiar en localStorage (Temporal)**
Abre la consola del navegador (`F12`):
```javascript
localStorage.setItem('sapira.currentOrg', '01234567-8901-2345-6789-012345678901')
location.reload()
```

### **Opción 2: Cambiar en el código (Permanente)**
Edita `hooks/use-supabase-data.ts` línea 48:
```typescript
return currentOrg?.organization.id || '01234567-8901-2345-6789-012345678901'  // Gonvarri
```

Y también cambiar en todos los archivos API:
- `lib/api/issues.ts`
- `lib/api/surveys.ts`
- `lib/api/initiatives.ts`
- `lib/api/projects.ts`
- `lib/api/teams-integration.ts`
- `lib/api/teams-messenger.ts`

Luego reiniciar:
```bash
./restart-clean.sh
```

---

## 🆕 Crear Contenido en Aurovitas

### **Crear una Initiative (Business Unit)**
1. Ve a la página de Initiatives
2. Click en "Nueva Initiative"
3. Ingresa:
   - Nombre: "Ventas"
   - Descripción: "Departamento de Ventas"
   - Manager: (opcional, puedes dejarlo vacío)

### **Crear un Project**
1. Ve a la página de Projects
2. Click en "Nuevo Project"
3. Ingresa:
   - Nombre: "Portal Web"
   - Descripción: "Nuevo portal de clientes"
   - Initiative: Selecciona la BU que creaste
   - Fechas: Inicio y fin

### **Crear un Issue**
1. Ve a la página de Issues
2. Click en "Nuevo Issue"
3. Ingresa:
   - Título: "Implementar login"
   - Descripción: "Crear sistema de autenticación"
   - Initiative: Selecciona la BU
   - Project: Selecciona el proyecto (opcional)
   - Prioridad: Alta/Media/Baja

---

## 📊 Verificar Organización Actual

Abre la consola del navegador (`F12`):
```javascript
// Ver organización actual
console.log(localStorage.getItem('sapira.currentOrg'))

// Debería mostrar:
// "22222222-2222-2222-2222-222222222222"

// IDs de referencia:
console.log('Aurovitas:', '22222222-2222-2222-2222-222222222222')
console.log('Gonvarri:',  '01234567-8901-2345-6789-012345678901')
```

---

## 🔐 Login (Si lo Reactivas)

### **Usuario de Aurovitas:**
```
Email:    gerardo@aurovitas.com
Password: aurovitas123
Rol:      CEO
```

Para reactivar el login:
1. Descomenta líneas en `app/client-layout.tsx` (15-42)
2. Descomenta líneas en `middleware.ts` (68-78)
3. Reinicia el servidor

---

## ✅ Estado Final

- ✅ **Organización:** Aurovitas (vacía)
- ✅ **Autenticación:** Desactivada (modo demo)
- ✅ **Datos:** 0 issues, 0 projects, 0 initiatives
- ✅ **Listo para:** Crear contenido desde cero
- ✅ **Header:** Mostrará "Aurovitas" (cuando se cree contenido)

---

## 🆘 Solución de Problemas

### **Si ves datos de Gonvarri:**
```javascript
// Limpiar localStorage
localStorage.clear()
location.reload()
```

### **Si el servidor no inicia:**
```bash
killall node
rm -rf .next
npm run dev
```

### **Si hay errores 404:**
```bash
./restart-clean.sh
```

---

## 🎉 ¡Todo Listo!

Tu aplicación ahora está configurada para **Aurovitas** - una organización completamente vacía, lista para que crees contenido desde cero.

**URL:** http://localhost:3000

