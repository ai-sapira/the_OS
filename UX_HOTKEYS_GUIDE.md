# 🎹 Guía de UX Upgrades: Hotkeys + Cmd-K + Animaciones

## Nomenclatura

| Concepto UI | Tabla en DB | Modal |
|-------------|-------------|-------|
| **Iniciativas** | `issues` | `NewIssueModal` |
| **Business Units** | `initiatives` | `NewInitiativeModal` |
| **Projects** | `projects` | `NewProjectModal` |

## ✅ Implementado

### 1. Sistema de Hotkeys con Feedback Visual

**Atajos disponibles:**

| Atajo | Acción |
|-------|--------|
| `⌘ K` | Abrir Command Palette |
| `⌘ /` | Mostrar ayuda de atajos |
| `?` | Mostrar ayuda de atajos |
| `N` | Nueva Iniciativa |
| `⇧ N` | Nuevo Business Unit |
| `⇧ P` | Nuevo Project |
| `G → H` | Ir a Home |
| `G → T` | Ir a Triage |
| `G → B` | Ir a Business Units |
| `G → P` | Ir a Projects |
| `G → R` | Ir a Roadmap |
| `G → M` | Ir a Métricas |
| `G → S` | Ir a Surveys |
| `G → I` | Ir a Insights |
| `⌘ .` | Toggle sidebar |
| `Esc` | Cerrar modal/cancelar |

**Características:**
- Feedback visual en la parte inferior de la pantalla cuando se activa un atajo
- Indicador de secuencia activa (ej: `G → ?` esperando...)
- Modal de ayuda completo con todos los atajos organizados por categoría

### 2. Command Palette V2 (⌘K)

**Características:**
- Búsqueda real en Supabase (iniciativas, business units, usuarios, projects)
- Modos de búsqueda con prefijos:
  - `>` para comandos
  - `#` para iniciativas
  - `@` para usuarios
  - `/` para navegación
  - `!` para business units
- Acciones rápidas integradas:
  - Crear nueva Iniciativa
  - Crear nuevo Business Unit
  - Crear nuevo Project
- Diseño moderno con animaciones fluidas
- Footer con tips de uso
- Navegación con flechas ↑↓
- ESC para cerrar

### 3. Sistema de Animaciones

**Componentes disponibles:**

```tsx
import { 
  AnimatedPage,
  AnimatedList, 
  AnimatedListItem,
  AnimatedCard,
  AnimatedButton,
  AnimatedModal 
} from "@/components/animations"
```

**CSS Classes disponibles:**
- `.card-hover` - Hover effect para cards
- `.btn-press` - Press feedback para botones
- `.sidebar-item` - Animación sidebar
- `.animate-fade-slide-in` - Fade + slide in
- `.animate-pop-in` - Pop in para badges
- `.animate-shimmer` - Loading shimmer
- `.stagger-1` a `.stagger-8` - Delays para listas

**CSS Variables de timing:**
```css
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in: cubic-bezier(0.32, 0, 0.67, 0);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## 📁 Archivos Creados/Modificados

```
lib/
├── motion.ts                    # Config de animaciones
└── context/hotkey-context.tsx   # Sistema de hotkeys

components/
├── hotkeys/                     # Indicador + Modal ayuda
├── animations/                  # Componentes animados
├── command-palette-v2.tsx       # Nuevo Cmd-K
└── app-hotkeys.tsx              # Hotkeys globales

app/
├── client-layout.tsx            # Integración con modales
├── globals.css                  # Tokens de animación
└── home/page.tsx                # Métricas animadas
```

## 🎯 Uso

### Registrar un hotkey personalizado

```tsx
import { useRegisterHotkey } from "@/lib/context/hotkey-context"

function MyComponent() {
  useRegisterHotkey({
    id: "my-custom-hotkey",
    key: "s",
    modifier: "cmd",
    label: "Guardar",
    description: "Guarda el documento actual",
    category: "actions",
    handler: () => console.log("Guardado!")
  })
  
  return <div>...</div>
}
```

### Usar componentes animados

```tsx
import { AnimatedList, AnimatedListItem } from "@/components/animations"

function MyList({ items }) {
  return (
    <AnimatedList>
      {items.map(item => (
        <AnimatedListItem key={item.id}>
          {item.name}
        </AnimatedListItem>
      ))}
    </AnimatedList>
  )
}
```

### Usar motion variants

```tsx
import { motion } from "framer-motion"
import { listContainerVariants, listItemVariants } from "@/lib/motion"

function MyAnimatedComponent() {
  return (
    <motion.div variants={listContainerVariants} initial="initial" animate="animate">
      {items.map(item => (
        <motion.div key={item.id} variants={listItemVariants}>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

## 🎨 Accesibilidad

El sistema respeta `prefers-reduced-motion`. Cuando está activado:
- Todas las animaciones se reducen a 0.01ms
- Las transiciones también se minimizan
- El scroll behavior es automático

## 🚀 Próximos pasos sugeridos

1. Aplicar `AnimatedList` a más páginas (triage, business units, etc.)
2. Agregar más hotkeys específicos por página
3. Implementar sonidos sutiles opcionales (usar `use-sound`)
4. Agregar page transitions entre rutas
