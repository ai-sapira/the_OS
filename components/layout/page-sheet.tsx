"use client"

import { ReactNode } from "react"

interface PageSheetProps {
  children: ReactNode
  header?: ReactNode
  toolbar?: ReactNode
}

export function PageSheet({ children, header, toolbar }: PageSheetProps) {
  return (
    <div 
      className="overflow-hidden isolate"
      style={{
        margin: 'var(--sheet-halo-y) var(--sheet-halo-x)',
        background: 'var(--surface-sheet)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-sheet)',
        boxShadow: 'var(--shadow-sheet)'
      }}
    >
      {/* Header sticky */}
      {header && (
        <div 
          className="sticky top-0 z-30"
          style={{
            height: 'var(--header-h)',
            borderBottom: '1px solid var(--stroke-layout)',
            marginLeft: 'calc(-1 * 1px)',
            marginRight: 'calc(-1 * 1px)',
            width: 'calc(100% + 2px)'
          }}
        >
          {header}
        </div>
      )}

      {/* Toolbar sticky */}
      {toolbar && (
        <div 
          className="sticky z-30"
          style={{
            top: header ? 'var(--header-h)' : '0',
            height: 'var(--toolbar-h)',
            borderBottom: '1px solid var(--stroke-layout)',
            marginLeft: 'calc(-1 * 1px)',
            marginRight: 'calc(-1 * 1px)',
            width: 'calc(100% + 2px)'
          }}
        >
          {toolbar}
        </div>
      )}

      {/* Body - scroll container */}
      <div 
        className="overflow-auto px-5 py-4"
        style={{
          height: `calc(100vh - var(--sheet-halo-y) * 2 - ${header ? 'var(--header-h)' : '0px'} - ${toolbar ? 'var(--toolbar-h)' : '0px'})`
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Components for common page structure
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-5 h-full">
      {children}
    </div>
  )
}

export function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-5 h-full">
      {children}
    </div>
  )
}
