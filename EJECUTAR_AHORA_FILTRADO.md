# 🚀 Ejecutar Ahora: Configurar Filtrado por Roles

## ✅ Lo que ya está listo

He configurado el sistema completo de filtrado por roles:

1. ✅ **APIs con filtrado**: `IssuesAPI`, `ProjectsAPI`, `InitiativesAPI` ya filtran por `initiative_id`
2. ✅ **Hook de datos**: `use-supabase-data.ts` aplica filtros según el rol activo
3. ✅ **UI**: Sidebar muestra badge "Filtered to: My BU" para BU Managers
4. ✅ **Documentación**: `FILTRADO_POR_ROLES.md` explica todo el sistema
5. ✅ **Script de prueba**: `scripts/test-bu-filtering.sql` para verificar

## 🎯 Lo que necesitas hacer AHORA

### PASO 1: Ejecutar el Script SQL (2 minutos)

1. Abre Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/TU_PROJECT/sql/new
   ```

2. Copia y pega el contenido de:
   ```
   scripts/test-bu-filtering.sql
   ```

3. Click en **RUN** ▶️

4. **ANOTA estos valores del Query #4**:
   ```
   Finance Initiative ID: ___________________________________
   Finance Manager ID:    ___________________________________
   Manager Name:          ___________________________________
   ```

### PASO 2: Verificar Contenido (1 minuto)

Del mismo script, mira los resultados del **Query #5 y #6**:

```
Finance Issues:   ___ (debe ser > 0)
Finance Projects: ___ (debe ser > 0)
```

⚠️ **IMPORTANTE**: Si ves 0 issues o 0 projects, necesitas crear contenido en Finance primero.

### PASO 3: Actualizar Mock Users (30 segundos)

Si los IDs del script NO coinciden con los actuales, abre:
```
hooks/use-supabase-data.ts
```

Y actualiza las líneas 24-27 y 32-33:

```typescript
const GONVARRI_MOCK_USERS = {
  'SAP': '11111111-1111-1111-1111-111111111111',
  'CEO': '22222222-2222-2222-2222-222222222222',
  'BU': 'PEGA_FINANCE_MANAGER_ID_AQUI',  // <-- Actualizar con Query #4
  'EMP': '33333333-3333-3333-3333-333333333333'
}

const GONVARRI_BU_INITIATIVES = {
  'PEGA_FINANCE_MANAGER_ID_AQUI': 'PEGA_FINANCE_INITIATIVE_ID_AQUI',  // <-- Actualizar
}
```

### PASO 4: Probar (2 minutos)

1. **Iniciar app**:
   ```bash
   pnpm dev
   ```

2. **Login como SAP**:
   - Email: `sapira@sapira.com` (o tu usuario SAP)

3. **Cambiar a BU Manager**:
   - En sidebar, click selector de roles (arriba)
   - Selecciona **BU Manager**
   - Debe aparecer badge: "Filtered to: My BU"

4. **Verificar filtrado**:
   - Ve a `/initiatives` → Solo debe aparecer **Finance**
   - Ve a `/projects` → Solo proyectos de Finance
   - Ve a `/issues` → Solo issues de Finance

5. **Probar otros roles**:
   - Cambia a **Employee** → Solo issues propios
   - Cambia a **CEO** → Todo visible, sin badge

## 📊 Resultado Esperado

### BU Manager de Finance ve:

**Initiatives** (`/initiatives`):
```
✅ Finance
```

**Projects** (`/projects`):
```
✅ Invoicing
✅ Pricing
✅ Accounting
```

**Issues** (`/issues`):
```
✅ GON-36: Invoice AutoFlow
✅ GON-47: InvoiceGenius
✅ GON-50: FraudFinder AI
✅ [otros issues de Finance]
```

### BU Manager NO ve:
```
❌ Sales
❌ HR
❌ Legal
❌ Procurement
❌ Issues de otras BUs
```

## 🐛 Si algo no funciona

### Problema: "Veo TODO el contenido"
**Solución**: Los IDs de mock users están incorrectos. Repite PASO 1 y PASO 3.

### Problema: "No veo NADA"
**Solución**: No hay contenido en Finance. 

Ejecuta esto en Supabase SQL Editor:
```sql
-- Ver cuántos issues tiene Finance
SELECT COUNT(*) 
FROM issues iss
JOIN initiatives i ON i.id = iss.initiative_id
WHERE i.slug = 'finance'
  AND iss.organization_id = '01234567-8901-2345-6789-012345678901';
```

Si devuelve 0, necesitas asignar issues a Finance:
```sql
-- Asignar issues existentes a Finance
UPDATE issues 
SET initiative_id = 'FINANCE_INITIATIVE_ID_AQUI'
WHERE key IN ('GON-36', 'GON-47', 'GON-50', 'GON-69', 'GON-80', 'GON-81', 'GON-82', 'GON-83', 'GON-87', 'GON-90')
  AND organization_id = '01234567-8901-2345-6789-012345678901';
```

### Problema: "El selector de roles no aparece"
**Solución**: Solo usuarios SAP pueden cambiar de rol. Verifica que estés logueado con un usuario SAP.

## 📹 Demo Rápida

Para mostrar el filtrado en una demo:

1. **Login como SAP**
2. **Mostrar vista completa** (CEO o SAP)
   - Cuenta cuántas initiatives ves (ej: 6)
   - Cuenta cuántos proyectos ves (ej: 15)
   
3. **Cambiar a BU Manager**
   - Click selector → "BU Manager"
   - Aparece badge "Filtered to: My BU"
   - Ahora solo ves Finance (1 initiative, 3 projects)
   
4. **Cambiar a Employee**
   - Click selector → "Employee"
   - Badge "Filtered to: Me"
   - Solo tus issues asignados

5. **Volver a vista completa**
   - Click selector → "CEO" o "Sapira"
   - Badge desaparece
   - Todo visible de nuevo

## ✅ Checklist Final

Antes de dar por terminado:

- [ ] Script SQL ejecutado sin errores
- [ ] IDs anotados y verificados
- [ ] Mock users actualizados (si fue necesario)
- [ ] Finance tiene contenido (issues y projects)
- [ ] BU Manager solo ve Finance
- [ ] Employee solo ve sus issues
- [ ] CEO ve todo
- [ ] Badges aparecen correctamente
- [ ] Demo probada con todos los roles

## 🎉 ¡Listo!

El sistema de filtrado por roles está **completamente implementado** y listo para usar.

Solo necesitas ejecutar el script SQL y verificar que los IDs coincidan.

---

**Tiempo estimado total**: 5-10 minutos

**Archivos importantes**:
- 📄 `FILTRADO_POR_ROLES.md` - Documentación completa
- 🔧 `scripts/test-bu-filtering.sql` - Script de verificación
- ⚙️ `hooks/use-supabase-data.ts` - Mock users (si necesitas actualizar IDs)


