# 🔧 Solución de Problemas - Errores 404

## 🚨 Problema Detectado

Errores 404 en archivos estáticos de Next.js:
```
GET /issues 404
GET /_next/static/css/app/layout.css 404
GET /_next/static/chunks/main-app.js 404
GET /_next/static/chunks/app-pages-internals.js 404
```

## ✅ Solución

### **Paso 1: Detener TODO**
```bash
# Detener todos los procesos de Node
killall node

# O si no funciona, buscar y matar específicamente
lsof -ti:3000,3002 | xargs kill -9
```

### **Paso 2: Limpiar TODO**
```bash
cd /Users/pablosenabre/Sapira/the_OS

# Eliminar caché de Next.js
rm -rf .next

# Eliminar caché de node_modules
rm -rf node_modules/.cache

# Opcional: Si sigue sin funcionar, reinstalar dependencias
# rm -rf node_modules
# npm install
```

### **Paso 3: Reiniciar Correctamente**
```bash
# Usar npm (no pnpm si da problemas)
npm run dev

# O usar el script
./restart-clean.sh
```

### **Paso 4: Esperar a la Compilación Completa**
No abras el navegador hasta ver estos mensajes:
```
✓ Ready in Xs
○ Compiling / ...
✓ Compiled / in Xs
```

### **Paso 5: Abrir el Navegador**
```
http://localhost:3000
```

---

## 🔍 Verificar que Funciona

Deberías ver en la terminal:
```
✓ Compiled /issues in XXXXms
GET /issues 200 in XXXXms  <-- ¡200, no 404!
```

Si ves **200**, funciona ✅  
Si ves **404**, hay un problema ❌

---

## 🆘 Si Sigue Sin Funcionar

### **Opción 1: Reinstalar Dependencias**
```bash
cd /Users/pablosenabre/Sapira/the_OS
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

### **Opción 2: Verificar Puerto**
```bash
# Ver qué está usando el puerto 3000
lsof -i:3000

# Si hay algo, matarlo
lsof -ti:3000 | xargs kill -9

# Reintentar
npm run dev
```

### **Opción 3: Probar Otro Puerto**
```bash
# Editar package.json y cambiar:
"dev": "next dev -p 3001"

# O ejecutar directamente:
npx next dev -p 3001
```

---

## 📋 Checklist de Solución

- [ ] ✅ Detener todos los procesos de Node
- [ ] ✅ Eliminar `.next`
- [ ] ✅ Eliminar `node_modules/.cache`
- [ ] ✅ Ejecutar `npm run dev`
- [ ] ✅ Esperar a que compile completamente
- [ ] ✅ Abrir navegador en `http://localhost:3000`
- [ ] ✅ Verificar que GET / retorna 200
- [ ] ✅ Verificar que GET /issues retorna 200

---

## 🎯 Estado Esperado

Después de seguir estos pasos, deberías ver:

### **En la Terminal:**
```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 1.8s
GET / 200 in 2000ms
○ Compiling /issues ...
✓ Compiled /issues in 1.5s
GET /issues 200 in 1500ms
```

### **En el Navegador:**
- ✅ Página carga correctamente
- ✅ Sin errores 404 en la consola
- ✅ Dashboard de Aurovitas (vacío)
- ✅ "No hay issues", "No hay proyectos", etc.

---

## 💡 Nota Importante

**Los errores de extensiones del navegador son normales:**
```
utils.js:1 Failed to load resource
extensionState.js:1 Failed to load resource
```

**Ignorar esos errores** - son de extensiones como uBlock, LastPass, etc.

**Solo importan los errores de:**
- `/_next/static/...` 
- `/issues`
- `/projects`
- etc.

Si esos devuelven **200**, todo funciona correctamente ✅

