# 🎨 Sapira OS Style Kit

Kit de estilos para replicar la estética de Sapira OS en proyectos Next.js.

## Requisitos

- Next.js 14+
- React 18/19
- pnpm (recomendado) o npm

## Instalación Rápida

### 1. Instalar dependencias

```bash
pnpm add tailwindcss@^4.1.9 @tailwindcss/postcss tw-animate-css class-variance-authority clsx tailwind-merge framer-motion lucide-react next-themes

# Radix UI (instala solo los que necesites)
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-tabs
```

### 2. Copiar archivos

Copia estos archivos a tu proyecto manteniendo la estructura:

```
tu-proyecto/
├── app/
│   ├── globals.css      ← desde styles/globals.css
│   └── layout.tsx       ← actualizar con Inter font
├── components/
│   └── ui/              ← copiar carpeta completa
├── lib/
│   └── utils.ts         ← copiar
├── components.json      ← copiar (raíz del proyecto)
└── postcss.config.mjs   ← copiar (raíz del proyecto)
```

### 3. Configurar layout.tsx

```tsx
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="light">
      <body className={`font-sans ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

## Design Tokens

### Colores (OKLCH)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--primary` | `oklch(0.45 0.08 285)` | `oklch(0.6 0.1 285)` | Purple accent |
| `--background` | `oklch(0.99 0 0)` | `oklch(0.08 0 0)` | Page background |
| `--foreground` | `oklch(0.15 0 0)` | `oklch(0.92 0 0)` | Text |
| `--muted` | `oklch(0.96 0 0)` | `oklch(0.14 0 0)` | Muted surfaces |
| `--border` | `oklch(0.9 0 0)` | `oklch(0.2 0 0)` | Borders |
| `--destructive` | `oklch(0.55 0.15 15)` | `oklch(0.6 0.15 15)` | Danger/errors |

### Espaciado (8pt grid)

```css
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Radios

```css
--radius: 0.375rem;      /* Default: 6px */
--radius-6: 6px;
--radius-8: 8px;
--radius-12: 12px;
--radius-sheet: 18px;    /* For large panels */
```

### Timing (Animaciones)

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

## Componentes Incluidos

- `Button` - Con animaciones de Framer Motion
- `Card` - Surface con elevación
- `Badge` - Labels y tags
- `Input` - Form input estilizado
- `Avatar` - User avatars
- `Dialog` - Modal dialogs
- `Select` - Dropdowns
- `Tooltip` - Info tooltips
- `Tabs` - Tab navigation
- `ScrollArea` - Custom scrollbar

## Clases Utilitarias CSS

```css
/* Animaciones */
.animate-fade-in        /* Fade in desde arriba */
.animate-fade-slide-in  /* Slide up + fade */
.animate-pop-in         /* Scale bounce in */
.animate-shimmer        /* Loading shimmer */

/* Efectos */
.card-hover             /* Elevación al hover */
.btn-press              /* Feedback al click */
.sidebar-item           /* Animación sidebar */
.focus-ring             /* Focus visible */

/* Stagger (para listas) */
.stagger-1 through .stagger-8
```

## Dark Mode

El sistema soporta dark mode. Para activarlo:

```tsx
// En tu html tag
<html className="dark">

// O usa next-themes
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>
```

## Tips

1. **Usar `cn()` siempre** para combinar clases:
   ```tsx
   import { cn } from "@/lib/utils"
   <div className={cn("base-class", conditional && "conditional-class")} />
   ```

2. **Variables CSS** están disponibles globalmente:
   ```tsx
   <div style={{ background: "var(--surface-1)" }} />
   ```

3. **Animaciones con Framer Motion** ya configuradas en Button, añadir a otros componentes según necesites.

---

Creado por Sapira Team • 2025

