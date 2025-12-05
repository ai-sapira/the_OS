"use client"

import { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { buttonPressVariants, duration, ease } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "variants"> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "subtle" | "ghost"
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    const variants = {
      default: buttonPressVariants,
      subtle: {
        initial: { scale: 1 },
        hover: { scale: 1.01 },
        tap: { scale: 0.99 },
      },
      ghost: {
        initial: { scale: 1, opacity: 1 },
        hover: { scale: 1, opacity: 0.8 },
        tap: { scale: 0.98 },
      },
    }

    return (
      <motion.button
        ref={ref}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={variants[variant]}
        transition={{ duration: duration.instant, ease: ease.out }}
        className={cn(
          "inline-flex items-center justify-center",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

// Icon button variant
interface AnimatedIconButtonProps extends AnimatedButtonProps {
  size?: "sm" | "md" | "lg"
}

export const AnimatedIconButton = forwardRef<HTMLButtonElement, AnimatedIconButtonProps>(
  ({ children, className, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-7 w-7",
      md: "h-9 w-9",
      lg: "h-11 w-11",
    }

    return (
      <AnimatedButton
        ref={ref}
        variant="subtle"
        className={cn(
          sizes[size],
          "rounded-lg",
          "hover:bg-accent",
          className
        )}
        {...props}
      >
        {children}
      </AnimatedButton>
    )
  }
)

AnimatedIconButton.displayName = "AnimatedIconButton"


