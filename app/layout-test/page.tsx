"use client"

import { 
  ResizableAppShell, 
  ResizablePageSheet, 
  PageHeader, 
  PageToolbar,
  ThreeColumnGrid,
  ListPlaceholder,
  ContentPlaceholder,
  PanelPlaceholder
} from "@/components/layout"

export default function LayoutTestPage() {
  return (
    <ResizableAppShell debugInfo={true}>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold">Layout Test</h1>
                <div className="h-5 w-px border-l border-gray-300"></div>
                <span className="text-sm text-gray-500">App Shell + Page Sheet Pattern</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 border border-dashed border-gray-300 rounded"></div>
                <div className="h-8 w-8 border border-dashed border-gray-300 rounded"></div>
              </div>
            </div>
          </PageHeader>
        }
        toolbar={
          <PageToolbar>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="h-7 w-16 border border-dashed border-gray-300 rounded"></div>
                <div className="h-7 w-20 border border-dashed border-gray-300 rounded"></div>
                <div className="h-7 w-24 border border-dashed border-gray-300 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-12 border border-dashed border-gray-300 rounded"></div>
                <div className="h-7 w-7 border border-dashed border-gray-300 rounded"></div>
              </div>
            </div>
          </PageToolbar>
        }
      >
        {/* Desktop/Tablet: Grid responsive */}
        <div className="hidden lg:block">
          <ThreeColumnGrid>
            {/* Columna izquierda - Lista */}
            <ListPlaceholder />
            
            {/* Columna central - Contenido */}
            <ContentPlaceholder />
            
            {/* Columna derecha - Panel (solo desktop XL) */}
            <div className="hidden xl:block">
              <PanelPlaceholder />
            </div>
          </ThreeColumnGrid>
        </div>

        {/* Mobile: Stack vertical */}
        <div className="lg:hidden space-y-6">
          <ListPlaceholder />
          <ContentPlaceholder />
          {/* Panel en mobile via drawer/modal cuando sea necesario */}
        </div>

        {/* Info de verificación */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Puntos de verificación visual ✓
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• ✅ Sidebar y halo = misma capa con mismo color exacto (--bg-app)</li>
            <li>• Sidebar sin borde - PageSheet con borde izq delimita la separación</li>
            <li>• Solo borde fino - sin sombra (estilo minimalista)</li>
            <li>• Header y Toolbar sticky dentro de sheet</li>
            <li>• Grid 3 columnas: 320–1fr–320 con gap 16px</li>
            <li>• Layout fijo sin scroll global - solo scroll en contenido PageSheet</li>
          </ul>
        </div>

        {/* Nueva funcionalidad de redimensionamiento */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 mb-2">
            🎯 Nueva funcionalidad: Sheet redimensionable con capas correctas
          </h3>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• 🎨 <strong>Fondo VERDADERAMENTE único</strong>: TODO el fondo es una sola capa (--bg-app)</li>
            <li>• 📋 <strong>Sheet flotante</strong>: Tarjeta "encima" con halo arriba/derecha/abajo (altura limitada)</li>
            <li>• 🖱️ <strong>Draggable inteligente</strong>: Zona de tolerancia de 40px para evitar ocultación accidental</li>
            <li>• 📐 <strong>Sidebar dinámico</strong>: Se adapta automáticamente al arrastre</li>
            <li>• 📏 Constraints: Sidebar min 200px, max 400px</li>
            <li>• 🔄 Auto-colapso: Por debajo de 120px el sidebar se colapsa</li>
            <li>• ⚡ Handle visual azul aparece al hover sobre el borde</li>
            <li>• 💾 Persistencia: Mantiene tu configuración preferida</li>
          </ul>
        </div>

        {/* Nueva info sobre zona de tolerancia */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            🧠 Lógica inteligente de arrastre
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Arrastre hacia la derecha</strong>: Sheet sigue inmediatamente al cursor</li>
            <li>• <strong>Arrastre hacia la izquierda</strong>: Zona de tolerancia de 40px antes de mover sheet</li>
            <li>• <strong>Previene ocultación</strong>: Evita que la sheet tape accidentalmente el sidebar</li>
            <li>• <strong>Intención clara</strong>: Solo expande sheet cuando es evidente que quieres minimizar sidebar</li>
          </ul>
        </div>

        {/* Medidas de referencia */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Redlines (medidas actualizadas)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <div>Sidebar: 256px (w-64)</div>
              <div>Halo uniforme: 8px en todos los lados (md+)</div>
              <div>Sheet radius: 18px</div>
              <div>Header: 56px, Toolbar: 46px</div>
            </div>
            <div>
              <div>Grid: 320px | 1fr | 320px</div>
              <div>Gap: 16px</div>
              <div>Fila lista: 64px + 1px separador</div>
              <div>✨ Sidebar llega hasta tarjeta - borde izq de tarjeta delimita</div>
            </div>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}
