# 👤 Vista Employee - Qué Ve Cada Usuario

## Caso: guillermo@sapira.ai

Hay **DOS escenarios** dependiendo de cómo uses la cuenta:

---

## 📊 Escenario 1: Guillermo como Usuario SAP (Demo Mode)

### Situación:
- `guillermo@sapira.ai` es tu cuenta de **Sapira (SAP)**
- Estás usando el **selector de roles** para cambiar a "Employee"
- El sistema entra en **modo demo**

### Lo que verás:
```
┌─────────────────────────────────────────────┐
│  Cambiaste a: Employee                      │
│  🎭 Simulando usuario: Carlos Rodríguez     │
├─────────────────────────────────────────────┤
│  Badge: "Filtered to: Me"                   │
│                                             │
│  ✅ Issues donde Carlos es assignee:        │
│     • (según lo que tenga en BD)            │
│                                             │
│  ✅ Issues donde Carlos es reporter:        │
│     • (según lo que tenga en BD)            │
│                                             │
│  ❌ NO verás:                               │
│     • Issues de otros empleados             │
│     • Issues sin relación contigo           │
└─────────────────────────────────────────────┘
```

**Mock User Utilizado:**
```typescript
// Del código: hooks/use-supabase-data.ts línea 27
'EMP': '33333333-3333-3333-3333-333333333333'   // Carlos Rodríguez
```

**SQL Query que se ejecuta:**
```sql
SELECT * FROM issues
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
  AND state != 'triage'
  AND (
    assignee_id = '33333333-3333-3333-3333-333333333333'
    OR reporter_id = '33333333-3333-3333-3333-333333333333'
  )
```

---

## 📊 Escenario 2: Guillermo como Usuario EMP Real

### Situación:
- Se crea un usuario real `guillermo@sapira.ai` con rol **EMP** (no SAP)
- Login directamente como Employee
- **NO** hay selector de roles (solo ves tu rol real)

### Lo que verás:
```
┌─────────────────────────────────────────────┐
│  Usuario: Guillermo                         │
│  Rol: Employee                              │
├─────────────────────────────────────────────┤
│  Badge: "Filtered to: Me"                   │
│                                             │
│  ✅ Issues donde TÚ eres assignee:          │
│     Ejemplo:                                │
│     • GON-123: Actualizar documentación     │
│     • GON-145: Revisar código frontend      │
│                                             │
│  ✅ Issues donde TÚ eres reporter:          │
│     Ejemplo:                                │
│     • GON-156: Bug en el login              │
│     • GON-178: Mejora en el dashboard       │
│                                             │
│  ❌ NO verás:                               │
│     • Issues asignados a otros              │
│     • Issues reportados por otros           │
│     • Triage (no tienes acceso)             │
└─────────────────────────────────────────────┘
```

**SQL Query que se ejecuta:**
```sql
SELECT * FROM issues
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
  AND state != 'triage'
  AND (
    assignee_id = '[TU_USER_ID_REAL]'
    OR reporter_id = '[TU_USER_ID_REAL]'
  )
```

---

## 🔍 Cómo Verificar Qué Verá

### Para Demo Mode (Escenario 1):

```sql
-- Ver qué issues tiene Carlos Rodríguez (mock user de EMP)
SELECT 
  i.id,
  i.key,
  i.title,
  i.state,
  i.priority,
  CASE 
    WHEN i.assignee_id = '33333333-3333-3333-3333-333333333333' THEN 'Asignado'
    WHEN i.reporter_id = '33333333-3333-3333-3333-333333333333' THEN 'Reportado'
  END as relacion
FROM issues i
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state != 'triage'
  AND (
    i.assignee_id = '33333333-3333-3333-3333-333333333333'
    OR i.reporter_id = '33333333-3333-3333-3333-333333333333'
  )
ORDER BY i.updated_at DESC;
```

### Para Usuario Real (Escenario 2):

```sql
-- Primero, obtener tu user_id
SELECT id, name, email, role 
FROM users 
WHERE email = 'guillermo@sapira.ai';

-- Luego, ver tus issues (reemplaza USER_ID_AQUI)
SELECT 
  i.id,
  i.key,
  i.title,
  i.state,
  i.priority,
  CASE 
    WHEN i.assignee_id = 'USER_ID_AQUI' THEN 'Asignado a ti'
    WHEN i.reporter_id = 'USER_ID_AQUI' THEN 'Reportado por ti'
  END as relacion
FROM issues i
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state != 'triage'
  AND (
    i.assignee_id = 'USER_ID_AQUI'
    OR i.reporter_id = 'USER_ID_AQUI'
  )
ORDER BY i.updated_at DESC;
```

---

## 🎯 Respuesta Directa a Tu Pregunta

### Si `guillermo@sapira.ai` es tu cuenta SAP actual:

**Cuando cambies a Employee**, verás:
- ✅ Los issues de **Carlos Rodríguez** (mock user de EMP)
- ✅ Solo issues donde Carlos es assignee o reporter
- ✅ Badge "Filtered to: Me" en el sidebar

**Si Carlos NO tiene issues asignados**, verás:
- 📭 **Lista vacía** (no hay error, simplemente no tiene trabajo asignado)

---

## 🧪 Cómo Probar

### Opción A: Ver qué tiene Carlos ahora mismo

1. Abre Supabase SQL Editor
2. Ejecuta:
```sql
-- Contar issues de Carlos
SELECT COUNT(*) as total_issues
FROM issues
WHERE (
  assignee_id = '33333333-3333-3333-3333-333333333333'
  OR reporter_id = '33333333-3333-3333-3333-333333333333'
)
AND state != 'triage';
```

3. Si devuelve **0**: Carlos no tiene issues (verás pantalla vacía)
4. Si devuelve **> 0**: Verás esos issues

### Opción B: Asignar issues a Carlos para probar

```sql
-- Asignar 3 issues a Carlos para testing
UPDATE issues
SET assignee_id = '33333333-3333-3333-3333-333333333333'
WHERE key IN ('GON-10', 'GON-15', 'GON-20')
  AND organization_id = '01234567-8901-2345-6789-012345678901';
```

Ahora cuando cambies a Employee verás esos 3 issues.

---

## 📊 Comparación Visual

### Como SAP (tu rol real):
```
Initiatives: ███████████████ 6 BUs
Projects:    ███████████████████ 15 proyectos
Issues:      █████████████████████████ 56 issues
```

### Como Employee (Carlos simulado):
```
Initiatives: ██ (solo las relacionadas con sus issues)
Projects:    ███ (solo los relacionados con sus issues)
Issues:      ███ (solo los suyos: 3-5 issues)
```

---

## ⚠️ Nota Importante

El usuario `guillermo@sapira.ai` probablemente sea:
- ✅ Tu cuenta de **Sapira (SAP)** - Admin del sistema
- ❌ **NO** es un Employee real

Por lo tanto:
1. Cuando uses el **selector de roles** → Simula a Carlos Rodríguez
2. Si quieres probar con tu propio usuario como Employee → Necesitarías crear otra cuenta

---

## 💡 Recomendación

Para una demo completa, asegúrate de que Carlos tenga issues asignados:

```sql
-- Script rápido para setup de demo
-- Asigna 5 issues variados a Carlos

UPDATE issues
SET assignee_id = '33333333-3333-3333-3333-333333333333',
    state = 'in_progress'
WHERE key = 'GON-10';

UPDATE issues
SET assignee_id = '33333333-3333-3333-3333-333333333333',
    state = 'todo'
WHERE key = 'GON-15';

UPDATE issues
SET reporter_id = '33333333-3333-3333-3333-333333333333',
    state = 'todo'
WHERE key = 'GON-20';
```

Así tendrás contenido para mostrar cuando cambies a Employee.

---

## ✅ Checklist

- [ ] Ejecutar query para ver cuántos issues tiene Carlos
- [ ] Si es 0, asignar 3-5 issues a Carlos
- [ ] Probar cambio a Employee en la app
- [ ] Verificar badge "Filtered to: Me"
- [ ] Confirmar que solo ves issues de Carlos
- [ ] Volver a SAP y verificar que ves todo de nuevo

