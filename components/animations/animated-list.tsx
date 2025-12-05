"use client"

import { motion, AnimatePresence } from "framer-motion"
import { listContainerVariants, listItemVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
  as?: "div" | "ul" | "ol"
}

export function AnimatedList({ 
  children, 
  className,
  as: Component = "div" 
}: AnimatedListProps) {
  const MotionComponent = motion[Component]
  
  return (
    <MotionComponent
      variants={listContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </MotionComponent>
  )
}

interface AnimatedListItemProps {
  children: React.ReactNode
  className?: string
  as?: "div" | "li"
  layoutId?: string
}

export function AnimatedListItem({ 
  children, 
  className,
  as: Component = "div",
  layoutId
}: AnimatedListItemProps) {
  const MotionComponent = motion[Component]
  
  return (
    <MotionComponent
      variants={listItemVariants}
      layoutId={layoutId}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}

// Convenience wrapper for animated lists with AnimatePresence
interface AnimatedListWithPresenceProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedListWithPresence({ 
  children, 
  className 
}: AnimatedListWithPresenceProps) {
  return (
    <AnimatePresence mode="popLayout">
      <AnimatedList className={className}>
        {children}
      </AnimatedList>
    </AnimatePresence>
  )
}


