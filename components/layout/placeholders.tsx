"use client"

// Placeholder components para verificar proporciones del layout

export function ListPlaceholder() {
  return (
    <div 
      className="flex flex-col"
      style={{ width: 'var(--list-w)' }}
    >
      <div className="mb-4">
        <div className="h-4 border border-dashed border-gray-300 rounded w-24 mb-2"></div>
        <div className="h-3 border border-dashed border-gray-300 rounded w-16"></div>
      </div>
      
      {/* 6 filas de lista */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col">
          <div 
            className="flex items-center gap-3 border border-dashed border-gray-300 rounded-lg px-3"
            style={{ height: '64px' }}
          >
            <div className="w-8 h-8 border border-dashed border-gray-300 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-3 border border-dashed border-gray-300 rounded w-32 mb-1"></div>
              <div className="h-2 border border-dashed border-gray-300 rounded w-24"></div>
            </div>
            <div className="w-12 h-5 border border-dashed border-gray-300 rounded flex-shrink-0"></div>
          </div>
          {i < 5 && (
            <div 
              className="border-t border-dashed border-gray-300"
              style={{ height: '1px', margin: '0' }}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ContentPlaceholder() {
  return (
    <div className="flex-1">
      {/* Título */}
      <div className="mb-6">
        <div className="h-6 border border-dashed border-gray-300 rounded w-48 mb-2"></div>
        <div className="h-4 border border-dashed border-gray-300 rounded w-32"></div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mb-6">
        <div className="h-8 border border-dashed border-gray-300 rounded w-20"></div>
        <div className="h-8 border border-dashed border-gray-300 rounded w-16"></div>
        <div className="h-8 border border-dashed border-gray-300 rounded w-24"></div>
      </div>

      {/* Bloque de texto 1 */}
      <div className="mb-6">
        <div className="h-4 border border-dashed border-gray-300 rounded w-40 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 border border-dashed border-gray-300 rounded w-full"></div>
          <div className="h-3 border border-dashed border-gray-300 rounded w-5/6"></div>
          <div className="h-3 border border-dashed border-gray-300 rounded w-4/5"></div>
        </div>
      </div>

      {/* Bloque de texto 2 */}
      <div className="mb-6">
        <div className="h-4 border border-dashed border-gray-300 rounded w-32 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 border border-dashed border-gray-300 rounded w-full"></div>
          <div className="h-3 border border-dashed border-gray-300 rounded w-3/4"></div>
        </div>
      </div>

      {/* Lista inline */}
      <div>
        <div className="h-4 border border-dashed border-gray-300 rounded w-28 mb-3"></div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
              <div className="h-3 border border-dashed border-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PanelPlaceholder() {
  return (
    <div 
      className="flex flex-col"
      style={{ 
        width: 'var(--panel-w)',
        background: 'var(--surface-panel)',
        borderRadius: '12px',
        padding: '16px'
      }}
    >
      {/* Header del panel */}
      <div className="mb-4">
        <div className="h-4 border border-dashed border-gray-300 rounded w-24 mb-2"></div>
        <div className="h-2 border border-dashed border-gray-300 rounded w-16"></div>
      </div>

      {/* Sección 1 */}
      <div className="mb-6">
        <div className="h-3 border border-dashed border-gray-300 rounded w-20 mb-3 text-xs"></div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2" style={{ height: '42px' }}>
            <div className="w-6 h-6 border border-dashed border-gray-300 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-2 border border-dashed border-gray-300 rounded w-24 mb-1"></div>
              <div className="h-2 border border-dashed border-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección 2 */}
      <div className="mb-6">
        <div className="h-3 border border-dashed border-gray-300 rounded w-16 mb-3 text-xs"></div>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2" style={{ height: '42px' }}>
            <div className="w-6 h-6 border border-dashed border-gray-300 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-2 border border-dashed border-gray-300 rounded w-20 mb-1"></div>
              <div className="h-2 border border-dashed border-gray-300 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección 3 */}
      <div>
        <div className="h-3 border border-dashed border-gray-300 rounded w-18 mb-3 text-xs"></div>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2" style={{ height: '42px' }}>
            <div className="w-6 h-6 border border-dashed border-gray-300 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-2 border border-dashed border-gray-300 rounded w-28 mb-1"></div>
              <div className="h-2 border border-dashed border-gray-300 rounded w-14"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Grid container para desktop con responsive
export function ThreeColumnGrid({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="grid xl:grid-cols-[var(--list-w)_1fr_var(--panel-w)] lg:grid-cols-[var(--list-w)_1fr] grid-cols-1 lg:gap-4 gap-6"
      style={{ 
        gap: 'var(--gap-layout)' 
      }}
    >
      {children}
    </div>
  )
}

// Mobile stack version - lista arriba, contenido debajo
export function MobileStackGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 lg:hidden">
      {children}
    </div>
  )
}
