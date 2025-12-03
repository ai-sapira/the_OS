"use client"

import { motion, AnimatePresence } from "framer-motion"
import { pageVariants, pageTransition, duration } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale"
  /** Delay before animation starts */
  delay?: number
}

const directionVariants = {
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  left: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
  right: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
}

export function AnimatedPage({ 
  children, 
  className, 
  direction = "up",
  delay = 0 
}: AnimatedPageProps) {
  const variants = directionVariants[direction]
  
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: duration.normal, 
        ease: [0.33, 1, 0.68, 1],
        delay 
      }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  )
}

// For use with page transitions
export function PageTransitionWrapper({ 
  children,
  layoutId 
}: { 
  children: React.ReactNode
  layoutId?: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layoutId}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Stagger children animation
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  /** Delay between each child */
  stagger?: number
  /** Initial delay before first child */
  delayChildren?: number
}

export function StaggerContainer({ 
  children, 
  className,
  stagger = 0.05,
  delayChildren = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: duration.normal, ease: [0.33, 1, 0.68, 1] }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade in on scroll (intersection observer based)
interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  /** Only animate once */
  once?: boolean
  /** Threshold for intersection */
  threshold?: number
}

export function FadeInView({ 
  children, 
  className,
  once = true,
  threshold = 0.1
}: FadeInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{ duration: duration.slow, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
