# Resizable Layout System

Este sistema permite redimensionar dinámicamente la PageSheet, donde el sidebar se adapta automáticamente al espacio disponible.

## Concepto principal

**🎯 La PageSheet se mueve, el Sidebar se adapta**

- La tarjeta (PageSheet) tiene una posición variable desde el borde izquierdo
- El sidebar ocupa automáticamente el espacio disponible a la izquierda
- El usuario arrastra el borde izquierdo de la tarjeta para redimensionar

## Componentes principales

### ResizableAppShell
Versión mejorada del AppShell que incluye funcionalidad de redimensionamiento.

```tsx
import { ResizableAppShell } from "@/components/layout"

<ResizableAppShell 
  debugInfo={true} // Opcional: muestra info de debug
  onOpenCommandPalette={handleCommandPalette}
  onOpenCreateIssue={handleCreateIssue}
>
  {children}
</ResizableAppShell>
```

### useResizablePageSheet Hook
Hook reutilizable que maneja toda la lógica de redimensionamiento de la tarjeta.

```tsx
const {
  sheetPosition,           // Posición de la tarjeta desde la izquierda
  effectiveSidebarWidth,   // Ancho efectivo del sidebar
  isSidebarCollapsed,      // Estado de colapso del sidebar
  isDragging,              // Estado de arrastre
  toggleSidebarCollapse,   // Función para toggle manual del sidebar
  handleMouseDown,         // Handler para el drag handle
  dragRef,                // Ref para el handle
  containerRef            // Ref para el contenedor
} = useResizablePageSheet({
  initialSheetPosition: 256,    // Posición inicial de la tarjeta
  minSidebarWidth: 200,         // Sidebar mínimo antes de colapso
  maxSidebarWidth: 400,         // Sidebar máximo
  sidebarCollapseThreshold: 120, // Umbral de auto-colapso
  collapsedSidebarWidth: 64     // Ancho del sidebar colapsado
})
```

## Características

### 🎯 Redimensionamiento dinámico
- Arrastra desde el borde izquierdo de la PageSheet
- La tarjeta se mueve horizontalmente
- El sidebar se adapta automáticamente al espacio disponible

### 🔄 Estados persistentes
- Guarda el tamaño del sidebar en localStorage
- Recuerda el estado de colapso entre sesiones

### 🎨 UX mejorada
- Transiciones suaves (200ms ease-out)
- Handle visual con hover
- Cursor col-resize durante el arrastre
- Overlay para mejor experiencia de drag

### 📱 Responsive
- Adaptable a diferentes tamaños de pantalla
- Modo colapsado en dispositivos pequeños

## Implementación técnica

### Constraints
- **MIN_WIDTH**: 200px (mínimo antes de auto-colapso)
- **MAX_WIDTH**: 400px (máximo del sidebar)
- **COLLAPSE_THRESHOLD**: 180px (umbral de auto-colapso)
- **COLLAPSED_WIDTH**: 64px (ancho cuando está colapsado)
- **HANDLE_WIDTH**: 4px (ancho del handle de arrastre)

### Eventos
- `mousedown`: Inicia el arrastre
- `mousemove`: Actualiza el tamaño durante el arrastre
- `mouseup`: Finaliza el arrastre

### Estados CSS
- Transiciones deshabilitadas durante el arrastre
- Cursor global col-resize durante drag
- User-select disabled durante drag

## Debug Mode

Activa el modo debug para ver información en tiempo real:

```tsx
<ResizableAppShell debugInfo={true}>
  {children}
</ResizableAppShell>
```

Muestra un overlay en la esquina inferior derecha con:
- Ancho configurado vs efectivo
- Estado de colapso
- Estado de arrastre

## Compatibilidad

- ✅ Desktop (drag completo)
- ✅ Tablet (drag + botón toggle)
- ✅ Mobile (solo botón toggle)
- ✅ Todos los navegadores modernos
- ✅ Persistencia en localStorage

## Próximas mejoras

- [ ] Soporte para gestos touch en móviles
- [ ] Animaciones más fluidas
- [ ] Temas personalizables para el handle
- [ ] Soporte para multiple panels
