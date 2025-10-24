# UI Shell (Sidebar + PageSheet + Resizable)

Este paquete contiene un layout completo listo para copiar a otro proyecto: sidebar, app shell, page sheet y versión redimensionable.

## Contenido
- AppShell y ResizableAppShell
- PageSheet y ResizablePageSheet
- Sidebar genérico por props
- Contexto y hook de redimensionado
- Utilidad `cn`

## Instalación
1) Copia la carpeta `export/ui-shell` a tu proyecto destino.
2) Asegúrate de tener TailwindCSS y las variables CSS necesarias.

## Tokens CSS requeridos
Añade a tus estilos globales (por ejemplo, `globals.css`) los tokens mínimos:

```css
:root {
  --bg-app: #F5F6F8;
  --surface-sheet: #FFFFFF;
  --stroke: #E7E8EC;
  --stroke-layout: #E7E8EC;
  --radius-sheet: 18px;
  --shadow-sheet: 0 8px 24px rgba(15,23,42,.08);
  --header-h: 44px;
  --toolbar-h: 44px;
  --sheet-halo-x: 8px;
  --sheet-halo-y: 8px;
  --sidebar-w: 320px;
}
```

## Uso básico

### App shell fijo
```tsx
import { AppShell, Sidebar, PageSheet, PageHeader, PageToolbar } from "./ui-shell"

export default function Page() {
  const items = [
    { id: 'triage', label: 'Triage', href: '/triage', section: 'global' },
    { id: 'projects', label: 'Projects', href: '/projects', section: 'workspace' },
  ]

  return (
    <AppShell sidebar={<Sidebar items={items} />}> 
      <PageSheet 
        header={<PageHeader>Header</PageHeader>} 
        toolbar={<PageToolbar>Toolbar</PageToolbar>}
      >
        Contenido...
      </PageSheet>
    </AppShell>
  )
}
```

### App shell redimensionable
```tsx
import { ResizableAppShell, ResizablePageSheet, Sidebar, PageHeader, PageToolbar } from "./ui-shell"

export default function Page() {
  const items = [ /* ... */ ]
  return (
    <ResizableAppShell sidebar={<Sidebar items={items} />}> 
      <ResizablePageSheet 
        header={<PageHeader>Header</PageHeader>}
        toolbar={<PageToolbar>Toolbar</PageToolbar>}
      >
        Contenido...
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
```

## Notas
- El Sidebar aquí es genérico y no depende de auth ni de roles, pásale `items` por props.
- Si quieres iconos, pasa un ReactNode en `item.icon`.
- Si ya tienes tus propias variables de diseño, ajusta los tokens `:root` a tu sistema.

## Requisitos
- Next.js (se usa `next/link`). Si no usas Next, reemplaza `Link` por tu componente/enlace.
- TailwindCSS configurado.

## Licencia
Uso interno del proyecto.

