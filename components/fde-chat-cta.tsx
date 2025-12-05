"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FDEChatCTAProps {
  className?: string;
  variant?: "button" | "floating" | "inline";
  size?: "sm" | "md" | "lg";
  label?: string;
  context?: string; // Optional context to prefill in the new conversation
}

export function FDEChatCTA({
  className,
  variant = "button",
  size = "sm",
  label = "Open thread",
  context,
}: FDEChatCTAProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to chat with new=true to create a new conversation
    // Optionally include context as a prefill message
    const params = new URLSearchParams();
    params.set("new", "true");
    if (context) {
      params.set("context", context);
    }
    router.push(`/fde/chat?${params.toString()}`);
  };

  if (variant === "floating") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClick}
              size="icon"
              className={cn(
                "fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50",
                "bg-slate-900 hover:bg-slate-800 text-white",
                "transition-all duration-200 hover:scale-105",
                className
              )}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors",
          "text-xs font-medium",
          className
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  // Default button variant
  const sizeClasses = {
    sm: "h-7 px-3 text-xs",
    md: "h-8 px-4 text-sm",
    lg: "h-9 px-5 text-sm",
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(
        sizeClasses[size],
        "border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5",
        className
      )}
    >
      <MessageSquare className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

