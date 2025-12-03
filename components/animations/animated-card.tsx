"use client"

import { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cardHoverVariants, duration, ease } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode
  className?: string
  enableHover?: boolean
  enableTap?: boolean
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, enableHover = true, enableTap = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        whileHover={enableHover ? "hover" : undefined}
        whileTap={enableTap ? { scale: 0.99 } : undefined}
        variants={cardHoverVariants}
        transition={{ duration: duration.fast, ease: ease.out }}
        className={cn(
          "rounded-xl border bg-card text-card-foreground",
          "transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

// Variant for clickable cards
interface ClickableCardProps extends AnimatedCardProps {
  onClick?: () => void
}

export const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ children, className, onClick, ...props }, ref) => {
    return (
      <AnimatedCard
        ref={ref}
        onClick={onClick}
        className={cn(
          "cursor-pointer",
          "hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          className
        )}
        {...props}
      >
        {children}
      </AnimatedCard>
    )
  }
)

ClickableCard.displayName = "ClickableCard"

