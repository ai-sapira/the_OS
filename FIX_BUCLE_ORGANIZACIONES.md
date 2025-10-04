# 🔧 Fix del Bucle de Carga de Organizaciones

## 🐛 El Problema

Cada vez que hacías login, `loadUserOrganizations` se llamaba **4-5 veces**:

1. `getSession()` → `loadUserOrganizations` ✅
2. `onAuthStateChange` con evento `SIGNED_IN` → `loadUserOrganizations` ✅
3. `onAuthStateChange` con evento `INITIAL_SESSION` → `loadUserOrganizations` ✅
4. Re-renders adicionales → más llamadas ✅

**Resultado:** 
- 4-5 llamadas al API por cada login
- Logs duplicados
- Experiencia lenta
- Consumo innecesario de recursos

## ❌ Por qué no funcionaba el `loadingOrgs` flag

El flag con `useState` no funcionaba porque:
- Las llamadas ocurren **tan rápido** que el estado no se actualiza a tiempo
- `useState` es **asíncrono** → el flag se lee antes de actualizarse
- Múltiples eventos disparan llamadas casi simultáneas

## ✅ La Solución: Usar Refs + Event Filtering

### 1. **useRef en lugar de useState**
```typescript
// ANTES: Estado asíncrono
const [loadingOrgs, setLoadingOrgs] = useState(false)

// AHORA: Ref síncrona
const loadingRef = useRef(false)
const lastLoadedUserIdRef = useRef<string | null>(null)
```

**¿Por qué funciona?**
- `useRef` es **sincrónico** → se lee y escribe instantáneamente
- No causa re-renders
- Perfecto para flags de control

### 2. **Filtrar Eventos de Auth**
```typescript
// ANTES: Procesaba TODOS los eventos
onAuthStateChange((event, session) => {
  setUser(session?.user ?? null)
  if (session?.user) {
    await loadUserOrganizations(session.user.id)
  }
})

// AHORA: Solo procesa SIGNED_IN
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    setUser(session?.user ?? null)
    if (session?.user) {
      await loadUserOrganizations(session.user.id)
    }
  }
})
```

**Eventos que ignoramos:**
- `INITIAL_SESSION` (ya cargamos con `getSession()`)
- `TOKEN_REFRESHED` (no necesita recargar orgs)
- Otros eventos irrelevantes

### 3. **Cache de Usuario Cargado**
```typescript
// Si ya cargamos las orgs para este user, skip
if (lastLoadedUserIdRef.current === authUserId && userOrgs.length > 0) {
  console.log('[AuthProvider] Organizations already loaded for this user, skipping...')
  setLoading(false)
  return
}
```

### 4. **Cleanup Apropiado**
```typescript
useEffect(() => {
  let mounted = true
  
  // ... código
  
  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])
```

Previene actualizaciones de estado después de unmount.

---

## 📊 Antes vs Después

### ANTES (❌ 4-5 llamadas):
```
[AuthProvider] Loading organizations for user: xxx
[AuthProvider] Calling API route...
[AuthProvider] Success - found 1 organizations
[AuthProvider] Loading organizations for user: xxx  ← Duplicado
[AuthProvider] Calling API route...
[AuthProvider] Success - found 1 organizations
[AuthProvider] Loading organizations for user: xxx  ← Duplicado
[AuthProvider] Calling API route...
[AuthProvider] Success - found 1 organizations
[AuthProvider] Loading organizations for user: xxx  ← Duplicado
[AuthProvider] Calling API route...
```

### DESPUÉS (✅ 1 llamada):
```
[AuthProvider] Loading organizations for user: xxx
[AuthProvider] Calling API route...
[AuthProvider] Success - found 1 organizations
[AuthProvider] Organizations already loaded for this user, skipping...
[AuthProvider] Already loading organizations, skipping...
```

---

## 🧪 Cómo Probar

1. **Reinicia el servidor:**
   ```bash
   # Ctrl+C
   npm run dev
   ```

2. **Limpia caché del navegador:**
   - Abre DevTools (F12)
   - Right-click en el botón reload
   - "Empty Cache and Hard Reload"

3. **Login:**
   - Ve a http://localhost:3000/login
   - Login con `pablo@sapira.ai`

4. **Verifica los logs:**
   
   **En la terminal (servidor):**
   ```
   [API /user/organizations] Request received
   [API /user/organizations] Success - found 1 organizations
   GET /api/user/organizations 200 in XXms
   ```
   ✅ **Deberías ver solo 1 request**

   **En la consola del navegador:**
   ```
   [AuthProvider] Loading organizations for user: xxx
   [AuthProvider] Success - found 1 organizations
   [AuthProvider] Already loading organizations, skipping...
   ```
   ✅ **Deberías ver "skipping" para las llamadas posteriores**

5. **Resultado:**
   - ✅ Login rápido
   - ✅ Redirect inmediato al dashboard
   - ✅ Sin llamadas duplicadas
   - ✅ RoleSwitcher visible

---

## 🎯 Cambios Técnicos

### Archivos Modificados:
- `lib/context/auth-context.tsx`

### Cambios:
1. ✅ Import de `useRef`
2. ✅ Agregado `loadingRef` y `lastLoadedUserIdRef`
3. ✅ Filtrado de eventos: solo procesar `SIGNED_IN`
4. ✅ Check de caché: skip si ya se cargó para este user
5. ✅ Cleanup apropiado con `mounted` flag
6. ✅ Uso de refs síncronas en lugar de estado asíncrono

### Commits:
- `d07cad6` - Fix del bucle de carga

---

## ✅ Resultado Esperado

Después de este fix:
- **1 sola llamada** a `/api/user/organizations` por login
- **Login rápido** y sin delays
- **Logs limpios** y claros
- **Experiencia fluida** para el usuario
- **Menor consumo** de recursos del servidor

---

## 🚀 Próximos Pasos

1. ✅ Prueba en local
2. ⏳ Configura `SUPABASE_SERVICE_ROLE_KEY` en Vercel
3. ⏳ Deploy y prueba en producción
4. ⏳ Prueba el RoleSwitcher en diferentes roles

---

**Los errores de `chrome-extension://` que ves son de extensiones de Chrome (password managers, etc.) - ignóralos completamente, no son de tu app.**

