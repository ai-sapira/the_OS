# 🏢 Selección de Organización en Modo Demo

## 📊 Organizaciones Disponibles

### **1. Gonvarri (Con Datos de Demo)** 🏭
```
ID:   01234567-8901-2345-6789-012345678901
Slug: gonvarri
Datos:
  - ✅ ~50+ Issues
  - ✅ ~20+ Projects  
  - ✅ 6 Initiatives (Business Units)
  - ✅ Usuarios de prueba
  - ✅ Roadmap con datos
```

### **2. Aurovitas (Completamente Vacía)** 🆕
```
ID:   22222222-2222-2222-2222-222222222222
Slug: aurovitas
Datos:
  - ❌ 0 Issues
  - ❌ 0 Projects
  - ❌ 0 Initiatives
  - ✅ Lista para empezar desde cero
```

---

## 🔄 ¿A Cuál Estás Accediendo Ahora?

**Si ves todo VACÍO** → Estás en **Aurovitas** ✅

**Si ves datos** → Estás en **Gonvarri** 

---

## 🎯 Cómo Cambiar de Organización

### **Opción 1: Cambiar en el Código (Permanente)**

Edita el archivo: `hooks/use-supabase-data.ts` línea 48

**Para ver Gonvarri (con datos):**
```typescript
return currentOrg?.organization.id || '01234567-8901-2345-6789-012345678901'  // Gonvarri
```

**Para ver Aurovitas (vacía):**
```typescript
return currentOrg?.organization.id || '22222222-2222-2222-2222-222222222222'  // Aurovitas
```

Luego reinicia el servidor:
```bash
./restart-clean.sh
```

---

### **Opción 2: Usar localStorage (Temporal)**

Abre la consola del navegador (`F12`) y ejecuta:

**Para ver Gonvarri:**
```javascript
localStorage.setItem('sapira.currentOrg', '01234567-8901-2345-6789-012345678901')
location.reload()
```

**Para ver Aurovitas:**
```javascript
localStorage.setItem('sapira.currentOrg', '22222222-2222-2222-2222-222222222222')
location.reload()
```

---

## 🆕 Aurovitas - Organización Vacía

Si quieres trabajar con **Aurovitas** (organización completamente nueva, sin datos):

### **Características:**
- ✅ Base de datos vacía
- ✅ Sin issues, proyectos o iniciativas
- ✅ Perfecto para empezar desde cero
- ✅ Crear tu propia estructura

### **Usuario de prueba (si reactivas login):**
```
Email:    gerardo@aurovitas.com
Password: aurovitas123
Rol:      CEO
```

---

## 📝 Verificar Organización Actual

**En la consola del navegador:**
```javascript
// Ver qué organización está guardada
console.log(localStorage.getItem('sapira.currentOrg'))

// Ver ID de Gonvarri
console.log('Gonvarri:', '01234567-8901-2345-6789-012345678901')

// Ver ID de Aurovitas  
console.log('Aurovitas:', '22222222-2222-2222-2222-222222222222')
```

---

## 🎨 Lo Que Verás en Cada Organización

### **Gonvarri:**
```
Dashboard:
  ✅ Issues activos
  ✅ Proyectos en curso
  ✅ 6 Business Units:
     - Finance
     - Sales
     - Operations
     - HR
     - IT
     - All Departments
  ✅ Roadmap con fechas
  ✅ Métricas y gráficos
```

### **Aurovitas:**
```
Dashboard:
  ❌ "No hay issues"
  ❌ "No hay proyectos"
  ❌ "No hay iniciativas"
  ✅ Botones para crear:
     - Nuevo Issue
     - Nuevo Project
     - Nueva Initiative
```

---

## 🚀 Recomendación

**Si quieres ver la app funcionando con datos:**
→ Usa **Gonvarri**

**Si quieres empezar desde cero y crear todo:**
→ Usa **Aurovitas**

---

## 🔧 Siguiente Paso

Dime qué prefieres:

1. **Ver Gonvarri con todos los datos de demo** 🏭
2. **Quedarte en Aurovitas completamente vacía** 🆕
3. **Poder cambiar fácilmente entre ambas** 🔄

Y te ayudo a configurarlo! 😊

