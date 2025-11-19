"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle2, AlertCircle } from "lucide-react"

// Deploy notifications - Humans in the loop - things that need your intervention
export interface DeployNotification {
  id: string
  label: string
  detail: string
  icon: React.ComponentType<any>
  priority: "high" | "medium" | "low"
  type: "eval" | "deployment" | "approval" | "review" | "error"
  timestamp: Date
  actionUrl?: string
}

// Mock notifications - In production, this would come from an API
const getDeployNotifications = (): DeployNotification[] => {
  return [
    {
      id: "notif-1",
      label: "Evaluation requires review",
      detail: "SAP invoice automation eval completed - needs approval",
      icon: Shield,
      priority: "high",
      type: "eval",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionUrl: "/evals",
    },
    {
      id: "notif-2",
      label: "Deployment pending approval",
      detail: "Salesforce lead sync automation ready for production",
      icon: CheckCircle2,
      priority: "medium",
      type: "approval",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      actionUrl: "/metrics",
    },
    {
      id: "notif-3",
      label: "QA review needed",
      detail: "RPA workflow for invoice processing ready for review",
      icon: AlertCircle,
      priority: "medium",
      type: "review",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      actionUrl: "/metrics",
    },
  ]
}

export function useDeployNotifications() {
  const [notifications, setNotifications] = useState<DeployNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In production, this would fetch from an API
    const loadNotifications = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      const notifs = getDeployNotifications()
      setNotifications(notifs)
      setIsLoading(false)
    }

    loadNotifications()
  }, [])

  const count = notifications.length
  const highPriorityCount = notifications.filter(n => n.priority === "high").length

  return {
    notifications,
    count,
    highPriorityCount,
    isLoading,
  }
}

