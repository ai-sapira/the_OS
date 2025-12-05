"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface OnboardingLoadingProps {
  onComplete: () => void
  orgName: string
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gray-300 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Animated logo paths
function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow effect behind logo */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: "rgba(120, 103, 255, 0.15)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main logo container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gray-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner animated ring */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent, rgba(120, 103, 255, 0.3), transparent)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center content */}
        <motion.div
          className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(120, 103, 255, 0.2)",
              "0 0 40px rgba(120, 103, 255, 0.4)",
              "0 0 20px rgba(120, 103, 255, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white font-bold text-xl tracking-tight">S</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function OnboardingLoading({ onComplete, orgName }: OnboardingLoadingProps) {
  const [loadingText, setLoadingText] = useState("Preparing your workspace")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const texts = [
      "Preparing your workspace",
      "Setting up your organization",
      "Almost ready",
    ]
    
    let textIndex = 0
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length
      setLoadingText(texts[textIndex])
    }, 1000)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Auto-advance after animation
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearInterval(textInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center cursor-pointer"
      onClick={onComplete}
    >
      <FloatingParticles />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <AnimatedLogo />
        
        {/* Brand text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            Sapira <span className="text-gray-400">Pharo</span>
          </h1>
          <motion.p
            className="mt-2 text-sm text-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {loadingText}...
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 200 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="h-0.5 bg-gray-200 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        {/* Click to continue hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-gray-400"
        >
          Click anywhere to continue
        </motion.p>
      </div>
    </div>
  )
}


