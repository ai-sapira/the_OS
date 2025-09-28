"use client"

import { useRoles } from "@/hooks/use-roles"
import { TriageInteractiveButton } from "@/components/ui/triage-interactive-button"
import { CheckCircle, Copy, XCircle, Clock, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TriageAction {
  id: "accept" | "decline" | "snooze"
  label: string
  icon: React.ComponentType<any>
  shortcut: string
  permission: string
}

const triageActions: TriageAction[] = [
  {
    id: "accept",
    label: "Accept",
    icon: CheckCircle,
    shortcut: "A",
    permission: "action.triage.accept",
  },
  {
    id: "decline",
    label: "Decline", 
    icon: XCircle,
    shortcut: "X",
    permission: "action.triage.decline",
  },
  {
    id: "snooze",
    label: "Snooze",
    icon: Clock,
    shortcut: "S", 
    permission: "action.triage.snooze",
  },
]

interface TriageWrapperProps {
  onAction: (action: "accept" | "decline" | "snooze") => void
  className?: string
}

export function TriageWrapper({ onAction, className }: TriageWrapperProps) {
  const { can, getRoleLabel, activeRole } = useRoles()

  const renderActionButton = (action: TriageAction) => {
    const hasPermission = can(action.permission)

    const button = (
      <TriageInteractiveButton
        text={action.label}
        shortcut={action.shortcut}
        icon={action.icon}
        variant={action.id}
        className={cn(
          !hasPermission && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => hasPermission && onAction(action.id)}
        disabled={!hasPermission}
      />
    )

    if (!hasPermission) {
      return (
        <TooltipProvider key={action.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Not allowed in {getRoleLabel(activeRole)} role (demo)</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return <div key={action.id}>{button}</div>
  }

  return (
    <div className="flex items-center gap-3 flex-nowrap relative z-10 w-full justify-start">
      {triageActions.map(action => renderActionButton(action))}
    </div>
  )
}
