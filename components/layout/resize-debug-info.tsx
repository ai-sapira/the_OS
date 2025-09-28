"use client"

interface ResizeDebugInfoProps {
  sidebarWidth: number
  effectiveWidth: number
  isCollapsed: boolean
  isDragging: boolean
}

export function ResizeDebugInfo({ sidebarWidth, effectiveWidth, isCollapsed, isDragging }: ResizeDebugInfoProps) {

  return (
    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
      <h3 className="text-sm font-medium text-purple-900 mb-2">
        🔧 Debug Info - Estado del Redimensionamiento
      </h3>
      <div className="grid grid-cols-2 gap-4 text-xs text-purple-700">
        <div>
          <div className="font-medium mb-1">Dimensiones:</div>
          <div>Ancho configurado: {sidebarWidth}px</div>
          <div>Ancho efectivo: {effectiveWidth}px</div>
          <div>Área principal: calc(100vw - {effectiveWidth}px)</div>
        </div>
        <div>
          <div className="font-medium mb-1">Estado:</div>
          <div>Colapsado: {isCollapsed ? '✅' : '❌'}</div>
          <div>Arrastrando: {isDragging ? '🟡 Sí' : '⚪ No'}</div>
          <div>Modo: {isCollapsed ? 'Compacto (64px)' : 'Expandido'}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-purple-600">
        💡 Tip: Arrastra desde el borde izquierdo de esta tarjeta para probar el redimensionamiento
      </div>
    </div>
  )
}
