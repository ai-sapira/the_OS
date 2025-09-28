"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModalHeader } from "./modal-header"
import { ModalFooter } from "./modal-footer"

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ModalVariant = 'default' | 'confirm' | 'danger' | 'drawer-right'

export interface ModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  size?: ModalSize
  variant?: ModalVariant
  dismissible?: boolean
  initialFocusRef?: React.RefObject<HTMLElement>
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]", 
  lg: "max-w-[800px]",
  xl: "max-w-[1024px]"
}

const variantClasses: Record<ModalVariant, string> = {
  default: "rounded-2xl",
  confirm: "rounded-2xl",
  danger: "rounded-2xl border-[color:var(--modal-danger)]",
  "drawer-right": "rounded-l-2xl rounded-r-none ml-auto mr-0 h-full max-h-none max-w-[480px] sm:max-w-[640px]"
}

const overlayClasses = "fixed inset-0 z-50 bg-[color:rgba(var(--overlay-rgb,11,11,12),var(--overlay-alpha))] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

const contentBaseClasses = "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-0 border border-[color:var(--stroke)] bg-[color:var(--surface-2)] shadow-[var(--elev-1)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"

const drawerClasses = "fixed right-0 top-0 z-50 grid h-full w-full translate-x-0 translate-y-0 gap-0 border-l border-[color:var(--stroke)] bg-[color:var(--surface-2)] shadow-[var(--elev-1)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"

export function Modal({
  open,
  onOpenChange,
  size = 'md',
  variant = 'default',
  dismissible = true,
  initialFocusRef,
  title,
  subtitle,
  icon,
  footer,
  className,
  children,
  ...props
}: ModalProps) {
  const isDrawer = variant === 'drawer-right'
  
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClasses} />
        <DialogPrimitive.Content
          className={cn(
            isDrawer ? drawerClasses : contentBaseClasses,
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          onPointerDownOutside={dismissible ? undefined : (e) => e.preventDefault()}
          onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
          {...props}
        >
          {/* Header */}
          {(title || icon) && (
            <ModalHeader
              icon={icon}
              title={title || ''}
              subtitle={subtitle}
              onClose={dismissible ? () => onOpenChange(false) : undefined}
              variant={variant}
            />
          )}
          
          {/* Body content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          
          {/* Footer */}
          {footer}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Modal.displayName = "Modal"
