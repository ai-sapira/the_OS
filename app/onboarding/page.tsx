"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { OnboardingProvider } from "./context/onboarding-context"
import { OnboardingLoading } from "./components/onboarding-loading"
import { OnboardingCreateOrg } from "./components/onboarding-create-org"
import { OnboardingDiscovery } from "./components/onboarding-discovery"
import { OnboardingWorkspace } from "./components/onboarding-workspace"
import { OnboardingDeploy } from "./components/onboarding-deploy"
import { OnboardingSummary } from "./components/onboarding-summary"

type OnboardingStep = "loading" | "create-org" | "discovery" | "workspace" | "deploy" | "summary"

// Smooth page transition variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.98,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.02,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const STEPS: OnboardingStep[] = ["loading", "create-org", "discovery", "workspace", "deploy", "summary"]

function OnboardingContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("loading")

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step)
  }

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex < STEPS.length - 1) {
      goToStep(STEPS[currentIndex + 1])
    }
  }

  const handleSkip = () => {
    // If we're past the initial steps, go to summary instead of home
    const summaryRequiredSteps: OnboardingStep[] = ["discovery", "workspace", "deploy"]
    if (summaryRequiredSteps.includes(currentStep)) {
      goToStep("summary")
    } else {
      router.push("/home")
    }
  }

  const handleComplete = () => {
    router.push("/home")
  }

  // Calculate progress (excluding loading)
  const progressSteps = STEPS.filter(s => s !== "loading")
  const currentProgressIndex = progressSteps.indexOf(currentStep)
  const progress = currentStep === "loading" ? 0 : ((currentProgressIndex + 1) / progressSteps.length) * 100

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50/80 overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, rgba(120, 103, 255, 0.4) 0%, transparent 70%)"
          }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, rgba(120, 103, 255, 0.3) 0%, transparent 70%)"
          }}
        />
      </div>

      {/* Progress bar at top - subtle */}
      {currentStep !== "loading" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      )}

      {/* Main content with transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          {currentStep === "loading" && (
            <OnboardingLoading 
              onComplete={handleNext} 
              orgName="Your Organization"
            />
          )}
          
          {currentStep === "create-org" && (
            <OnboardingCreateOrg 
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === "discovery" && (
            <OnboardingDiscovery 
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === "workspace" && (
            <OnboardingWorkspace 
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === "deploy" && (
            <OnboardingDeploy 
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === "summary" && (
            <OnboardingSummary 
              onComplete={handleComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Step indicator dots - bottom */}
      {currentStep !== "loading" && currentStep !== "summary" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50"
        >
          {progressSteps.filter(s => s !== "summary").map((step, index) => (
            <button
              key={step}
              onClick={() => {
                // Only allow going back, not forward
                const targetIndex = progressSteps.indexOf(step)
                if (targetIndex <= currentProgressIndex) {
                  goToStep(step)
                }
              }}
              disabled={progressSteps.indexOf(step) > currentProgressIndex}
              className={`transition-all duration-300 rounded-full ${
                currentStep === step 
                  ? "w-8 h-2 bg-gray-900" 
                  : progressSteps.indexOf(step) < currentProgressIndex
                    ? "w-2 h-2 bg-gray-400 hover:bg-gray-500 cursor-pointer"
                    : "w-2 h-2 bg-gray-200 cursor-not-allowed"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
