// Motion configuration for consistent animations across the app
import type { Variants, Transition } from "framer-motion"

// Timing tokens
export const duration = {
  instant: 0.05,
  fast: 0.1,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
} as const

// Easing curves
export const ease = {
  out: [0.33, 1, 0.68, 1],
  in: [0.32, 0, 0.67, 0],
  inOut: [0.65, 0, 0.35, 1],
  bounce: [0.34, 1.56, 0.64, 1],
  spring: { type: "spring", stiffness: 400, damping: 30 },
} as const

// Default transitions
export const transitions = {
  fast: { duration: duration.fast, ease: ease.out },
  normal: { duration: duration.normal, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.out },
  bounce: { duration: duration.normal, ease: ease.bounce },
  spring: ease.spring,
} as const

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const pageTransition: Transition = {
  duration: duration.normal,
  ease: ease.out,
}

// Modal variants
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
}

export const modalTransition: Transition = {
  duration: duration.normal,
  ease: ease.out,
}

// List stagger variants
export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: duration.normal, ease: ease.out },
  },
  exit: { 
    opacity: 0, 
    y: -4,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

// Slide variants
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
}

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
}

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
}

// Scale variants
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.normal, ease: ease.bounce },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

// Toast variants
export const toastVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.95 },
}

// Dropdown/Menu variants
export const dropdownVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
}

// Sidebar item hover
export const sidebarItemVariants: Variants = {
  initial: { x: 0 },
  hover: { x: 2 },
  tap: { scale: 0.98 },
}

// Button press
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Card hover
export const cardHoverVariants: Variants = {
  initial: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: { 
    y: -2, 
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: { duration: duration.fast, ease: ease.out },
  },
}

// Badge appear
export const badgeVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.fast, ease: ease.bounce },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: duration.instant },
  },
}

// Skeleton shimmer (for loading states)
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
}

// Command palette specific
export const commandPaletteVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.normal, ease: ease.out },
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: duration.fast, ease: ease.in },
  },
}

export const commandItemVariants: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: duration.fast, ease: ease.out },
  },
}

// Hotkey indicator
export const hotkeyIndicatorVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: duration.fast, ease: ease.bounce },
  },
  exit: { 
    opacity: 0, 
    y: -4, 
    scale: 0.95,
    transition: { duration: duration.fast, ease: ease.in },
  },
}


