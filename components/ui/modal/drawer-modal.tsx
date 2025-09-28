"use client"

import * as React from "react"
import { Modal } from "./modal"
import { ModalBody } from "./modal-body"
import { ModalFooter } from "./modal-footer"

export interface DrawerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export function DrawerModal({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
  className
}: DrawerModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      variant="drawer-right"
      size={size}
      title={title}
      subtitle={subtitle}
      icon={icon}
      className={className}
      footer={footer}
    >
      {children && (
        <ModalBody>
          {children}
        </ModalBody>
      )}
      
      {!footer && (
        <ModalFooter>
          <div className="ml-auto">
            <button
              onClick={() => onOpenChange(false)}
              className="h-9 px-3 rounded-lg border border-[color:var(--stroke)] hover:bg-[color:var(--surface-3)] text-[13px]"
            >
              Close
            </button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  )
}

DrawerModal.displayName = "DrawerModal"
