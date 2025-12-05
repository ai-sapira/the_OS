"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useHotkeyContext, formatHotkey } from "@/lib/context/hotkey-context"
import { hotkeyIndicatorVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Command, ArrowRight } from "lucide-react"

export function HotkeyIndicator() {
  const { activeSequence, lastHotkey } = useHotkeyContext()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Active sequence indicator */}
        {activeSequence && (
          <motion.div
            key="sequence"
            variants={hotkeyIndicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-background/95 backdrop-blur-md",
              "border border-border/50 shadow-lg shadow-black/5",
              "dark:bg-popover/95 dark:border-border/30"
            )}
          >
            <div className="flex items-center gap-1.5">
              <kbd className={cn(
                "inline-flex items-center justify-center",
                "h-7 min-w-7 px-2 rounded-md",
                "bg-primary text-primary-foreground",
                "text-xs font-medium font-mono",
                "shadow-sm"
              )}>
                {activeSequence.toUpperCase()}
              </kbd>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <div className={cn(
                "h-7 min-w-7 px-2 rounded-md",
                "bg-muted/50 border border-dashed border-border",
                "flex items-center justify-center",
                "text-xs font-mono text-muted-foreground"
              )}>
                ?
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              esperando...
            </span>
          </motion.div>
        )}

        {/* Last hotkey feedback */}
        {!activeSequence && lastHotkey && (
          <motion.div
            key={`hotkey-${lastHotkey.id}`}
            variants={hotkeyIndicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl",
              "bg-background/95 backdrop-blur-md",
              "border border-border/50 shadow-lg shadow-black/5",
              "dark:bg-popover/95 dark:border-border/30"
            )}
          >
            <div className="flex items-center gap-1">
              {formatHotkey(lastHotkey).split(" ").map((part, i) => (
                <span key={i} className="flex items-center">
                  {part === "→" ? (
                    <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                  ) : (
                    <kbd className={cn(
                      "inline-flex items-center justify-center",
                      "h-6 min-w-6 px-1.5 rounded-md",
                      "bg-muted text-foreground",
                      "text-[11px] font-medium font-mono",
                      "border border-border/50"
                    )}>
                      {part === "⌘" ? <Command className="h-3 w-3" /> : part}
                    </kbd>
                  )}
                </span>
              ))}
            </div>
            <span className="text-sm text-foreground font-medium">
              {lastHotkey.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


