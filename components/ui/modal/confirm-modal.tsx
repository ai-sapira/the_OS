"use client"

import * as React from "react"
import { AlertTriangle, HelpCircle } from "lucide-react"
import { Modal } from "./modal"
import { ModalBody } from "./modal-body"
import { ModalFooter } from "./modal-footer"

export interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = 'default',
  size = 'sm'
}: ConfirmModalProps) {
  const isDanger = variant === 'danger'
  
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      variant={isDanger ? 'danger' : 'confirm'}
      title={title}
      icon={
        isDanger ? (
          <AlertTriangle className="h-4 w-4 text-[color:var(--modal-danger)]" />
        ) : (
          <HelpCircle className="h-4 w-4 text-[color:var(--modal-accent)]" />
        )
      }
    >
      {description && (
        <ModalBody>
          <p className="text-[13px] text-[color:var(--muted-text)]">
            {description}
          </p>
        </ModalBody>
      )}

      <ModalFooter
        secondaryLabel={cancelLabel}
        onSecondary={handleCancel}
        primaryLabel={confirmLabel}
        onPrimary={handleConfirm}
        variant={isDanger ? 'danger' : 'default'}
      />
    </Modal>
  )
}

ConfirmModal.displayName = "ConfirmModal"
