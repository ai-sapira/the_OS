# Modal Design System

Sistema completo de modales reutilizables siguiendo el 8-pt grid y con el look/UX específico de la captura. Basado en **Radix Dialog** para accesibilidad y **Tailwind** para estilos.

## 🎯 Características

- ✅ **8-pt grid** completo con tokens CSS 
- ✅ **Radix Dialog** base (focus trap, roles ARIA, Esc to close)
- ✅ **Toolbar** con hotkeys (A, M, D, S) 
- ✅ **Chip controls** reutilizables (select, button, status)
- ✅ **Variantes**: default, confirm, danger, drawer-right
- ✅ **Animaciones** suaves con reduced-motion support
- ✅ **TypeScript** completo

## 📁 Estructura

```
components/ui/modal/
├── index.ts                 # Exports principales
├── modal.tsx                # Componente base 
├── modal-header.tsx         # Header con icono + título + close
├── modal-toolbar.tsx        # Fila de botones de acción
├── modal-body.tsx           # Contenido principal
├── modal-footer.tsx         # Footer con CTAs
├── chip-row.tsx             # Contenedor para chips
├── chip-control.tsx         # Chips individuales 
├── accept-issue-modal.tsx   # Modal específico para Accept
├── confirm-modal.tsx        # Modal de confirmación
├── drawer-modal.tsx         # Modal tipo drawer desde derecha
└── README.md               # Esta documentación
```

## 🚀 Uso Básico

### AcceptIssueModal (replica exacta de la captura)

```tsx
import { AcceptIssueModal } from "@/components/ui/modal"

function TriagePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const issue = { key: "SAI-123", title: "Implement feature" }

  return (
    <AcceptIssueModal
      issue={issue}
      open={modalOpen}
      onOpenChange={setModalOpen}
      onAccept={(data) => console.log('Accept:', data)}
      onDuplicate={(data) => console.log('Duplicate:', data)}
      onDecline={(data) => console.log('Decline:', data)}
      onSnooze={(data) => console.log('Snooze:', data)}
    />
  )
}
```

### ConfirmModal

```tsx
import { ConfirmModal } from "@/components/ui/modal"

<ConfirmModal
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete project?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="danger"
  onConfirm={handleDelete}
/>
```

### Drawer Modal

```tsx
import { DrawerModal } from "@/components/ui/modal"

<DrawerModal
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  title="Settings"
  size="md"
>
  <div className="space-y-4">
    {/* Contenido del drawer */}
  </div>
</DrawerModal>
```

## 🧩 Componentes Modulares

### Modal Base

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal"

<Modal open={open} onOpenChange={setOpen} size="lg">
  <ModalHeader icon={<Icon />} title="Custom Modal" />
  <ModalBody>
    {/* Tu contenido */}
  </ModalBody>
  <ModalFooter
    primaryLabel="Save"
    onPrimary={handleSave}
    secondaryLabel="Cancel"
    onSecondary={() => setOpen(false)}
  />
</Modal>
```

### Chip Controls

```tsx
import { ChipRow, ChipControl } from "@/components/ui/modal"

<ChipRow>
  <ChipControl 
    kind="select" 
    label="Priority" 
    value="P1 - High"
    icon={<GaugeIcon />}
    hotkey="P"
    onClick={openPrioritySelect}
  />
  <ChipControl 
    kind="button" 
    label="Assign"
    icon={<UserIcon />}
    hotkey="A"
    onClick={handleAssign}
  />
  <ChipControl 
    kind="status" 
    label="Backlog"
    icon={<LoaderIcon />}
  />
</ChipRow>
```

## ⌨️ Hotkeys

El sistema incluye soporte completo para hotkeys:

```tsx
import { useHotkeys } from "@/hooks/use-hotkeys"

useHotkeys([
  { key: 'a', handler: () => setAction('accept') },
  { key: 'm', handler: () => setAction('duplicate') },
  { key: 'd', handler: () => setAction('decline') },
  { key: 's', handler: () => setAction('snooze') },
  { key: 'enter', modifier: 'cmd', handler: handleSubmit },
], modalOpen)
```

## 🎨 Design Tokens

Todos los tokens están definidos en `globals.css`:

```css
:root {
  /* Espaciado - 8pt grid */
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Radios */
  --radius-6: 6px;
  --radius-8: 8px;
  --radius-12: 12px;
  
  /* Colores */
  --modal-accent: #7867FF;
  --modal-danger: #ED5E68;
  --modal-warning: #E7A23A;
  --modal-success: #3CCB7F;
  
  /* Superficies */
  --surface-1: #FFFFFF;
  --surface-2: #FAFAFA;
  --surface-3: #F5F5F5;
  --stroke: #E5E5E5;
  
  /* Elevación */
  --elev-1: 0 8px 28px rgba(0, 0, 0, 0.15);
}
```

## 📏 Sizing

- `sm: 480px` - Confirmaciones simples
- `md: 640px` - Modales estándar  
- `lg: 800px` - Formularios complejos (Accept Issue)
- `xl: 960px` - Casos especiales

## 🎭 Variantes

- `default` - Modal estándar centrado
- `confirm` - Para confirmaciones (icono de pregunta)
- `danger` - Para acciones destructivas (rojo)
- `drawer-right` - Sheet desde la derecha

## ♿ Accesibilidad

- ✅ Focus trap automático
- ✅ ARIA roles y labels
- ✅ Escape para cerrar
- ✅ Click outside para cerrar
- ✅ Navegación por teclado
- ✅ Screen reader friendly

## 🔧 Migración desde modal anterior

Reemplaza el modal existente:

```tsx
// ANTES
import { TriageActionModal } from "@/components/triage-action-modal"

// DESPUÉS  
import { AcceptIssueModal } from "@/components/ui/modal"
```

El API es compatible pero con mejor UX y más características.

## 📚 Ejemplos Completos

Ver `components/modal-examples.tsx` para ejemplos funcionando de todos los tipos de modales.
