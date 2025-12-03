"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Command, ArrowRight, Keyboard } from "lucide-react"
import { useHotkeyContext, formatHotkey, type HotkeyAction } from "@/lib/context/hotkey-context"
import { modalOverlayVariants, modalContentVariants, listItemVariants, duration, ease } from "@/lib/motion"
import { cn } from "@/lib/utils"

const categoryLabels = {
  navigation: "Navegación",
  actions: "Acciones",
  general: "General",
} as const

const categoryIcons = {
  navigation: "🧭",
  actions: "⚡",
  general: "⚙️",
} as const

function HotkeyRow({ action, index }: { action: HotkeyAction; index: number }) {
  const formattedKey = formatHotkey(action)
  
  return (
    <motion.div
      variants={listItemVariants}
      custom={index}
      className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-lg",
        "hover:bg-accent/50 transition-colors duration-100",
        "group cursor-default"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">
          {action.label}
        </div>
        {action.description && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {action.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 ml-4 shrink-0">
        {formattedKey.split(" ").map((part, i) => (
          <span key={i} className="flex items-center">
            {part === "→" ? (
              <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
            ) : (
              <kbd className={cn(
                "inline-flex items-center justify-center",
                "h-6 min-w-6 px-1.5 rounded-md",
                "bg-muted text-foreground",
                "text-[11px] font-medium font-mono",
                "border border-border/50",
                "group-hover:bg-primary/10 group-hover:border-primary/20",
                "transition-colors duration-100"
              )}>
                {part === "⌘" ? <Command className="h-3 w-3" /> : part}
              </kbd>
            )}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function HotkeySection({ 
  category, 
  hotkeys 
}: { 
  category: HotkeyAction["category"]
  hotkeys: HotkeyAction[] 
}) {
  if (hotkeys.length === 0) return null

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3 px-3">
        <span className="text-base">{categoryIcons[category]}</span>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryLabels[category]}
        </h3>
      </div>
      <div className="space-y-0.5">
        {hotkeys.map((action, index) => (
          <HotkeyRow key={action.id} action={action} index={index} />
        ))}
      </div>
    </div>
  )
}

export function HotkeyHelpModal() {
  const { isHelpOpen, setHelpOpen, getHotkeysByCategory } = useHotkeyContext()

  const navigationHotkeys = getHotkeysByCategory("navigation")
  const actionHotkeys = getHotkeysByCategory("actions")
  const generalHotkeys = getHotkeysByCategory("general")

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isHelpOpen) {
        setHelpOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isHelpOpen, setHelpOpen])

  return (
    <AnimatePresence>
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: duration.normal }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setHelpOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: duration.normal, ease: ease.out }}
              className={cn(
                "w-full max-w-lg max-h-[80vh] overflow-hidden",
                "bg-background rounded-2xl shadow-2xl",
                "border border-border/50",
                "flex flex-col"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    "bg-primary/10 text-primary"
                  )}>
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Atajos de Teclado
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Navega más rápido con el teclado
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setHelpOpen(false)}
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent transition-colors"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <motion.div 
                className="flex-1 overflow-y-auto px-3 py-4"
                initial="initial"
                animate="animate"
                variants={{
                  initial: { opacity: 0 },
                  animate: { 
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                  }
                }}
              >
                <HotkeySection category="actions" hotkeys={actionHotkeys} />
                <HotkeySection category="navigation" hotkeys={navigationHotkeys} />
                <HotkeySection category="general" hotkeys={generalHotkeys} />
                
                {/* Help tip */}
                <div className={cn(
                  "mt-6 mx-3 p-3 rounded-lg",
                  "bg-muted/30 border border-border/30"
                )}>
                  <p className="text-xs text-muted-foreground text-center">
                    Presiona <kbd className="mx-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">?</kbd> en cualquier momento para ver esta ayuda
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

