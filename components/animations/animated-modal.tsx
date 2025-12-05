"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  modalOverlayVariants, 
  modalContentVariants, 
  duration, 
  ease 
} from "@/lib/motion"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AnimatedModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  overlayClassName?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function AnimatedModal({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: AnimatedModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: duration.normal }}
            className={cn(
              "absolute inset-0 bg-black/40 backdrop-blur-sm",
              overlayClassName
            )}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal Container */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: duration.normal, ease: ease.out }}
              className={cn(
                "relative w-full max-w-lg pointer-events-auto",
                "bg-background rounded-2xl shadow-2xl",
                "border border-border/50",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "absolute top-4 right-4 z-10",
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent transition-colors"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Modal parts for composition
interface ModalPartProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedModalHeader({ children, className }: ModalPartProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-border/50", className)}>
      {children}
    </div>
  )
}

export function AnimatedModalBody({ children, className }: ModalPartProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}

export function AnimatedModalFooter({ children, className }: ModalPartProps) {
  return (
    <div className={cn("px-6 py-4 border-t border-border/50 flex justify-end gap-2", className)}>
      {children}
    </div>
  )
}


