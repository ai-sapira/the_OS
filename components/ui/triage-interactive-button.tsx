import React from "react";
import { cn } from "@/lib/utils";

interface TriageInteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  shortcut: string;
  icon: React.ComponentType<any>;
  variant?: "accept" | "duplicate" | "decline" | "snooze" | "default";
}

const TriageInteractiveButton = React.forwardRef<
  HTMLButtonElement,
  TriageInteractiveButtonProps
>(({ text, shortcut, icon: Icon, variant = "default", className, ...props }, ref) => {
  
  const getVariantStyles = () => {
    switch (variant) {
      case "accept":
        return {
          container: "hover:bg-green-50 hover:border-green-300 hover:text-green-700",
          background: "group-hover:bg-green-600",
          iconColor: "text-green-600",
          textHover: "text-green-700"
        }
      case "duplicate":
        return {
          container: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700",
          background: "group-hover:bg-orange-600",
          iconColor: "text-orange-600",
          textHover: "text-orange-700"
        }
      case "decline":
        return {
          container: "hover:bg-red-50 hover:border-red-300 hover:text-red-700",
          background: "group-hover:bg-red-600",
          iconColor: "text-red-600",
          textHover: "text-red-700"
        }
      case "snooze":
        return {
          container: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          background: "group-hover:bg-blue-600",
          iconColor: "text-blue-600",
          textHover: "text-blue-700"
        }
      default:
        return {
          container: "hover:bg-gray-50",
          background: "group-hover:bg-gray-900",
          iconColor: "text-gray-600",
          textHover: "text-gray-900"
        }
    }
  }

  const styles = getVariantStyles();

  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-white h-9 px-4 text-center transition-all duration-300 flex-shrink-0 min-w-0 shadow-sm",
        styles.container,
        className,
      )}
      {...props}
    >
      {/* Normal state */}
      <span className="inline-flex items-center gap-2 transition-all duration-300 group-hover:scale-110 group-hover:opacity-0 text-xs text-gray-700 font-medium">
        <Icon className="h-4 w-4" />
        <span className="truncate">{text}</span>
        <kbd className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
          {shortcut}
        </kbd>
      </span>
      
      {/* Hover state - enhanced version */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
        <span className="text-xs font-medium flex items-center gap-2">
          <span className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-xs font-bold transition-all duration-300",
            variant === "accept" ? "bg-green-100 text-green-700 group-hover:bg-green-200" :
            variant === "duplicate" ? "bg-orange-100 text-orange-700 group-hover:bg-orange-200" :
            variant === "decline" ? "bg-red-100 text-red-700 group-hover:bg-red-200" :
            variant === "snooze" ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200" :
            "bg-gray-100 text-gray-700"
          )}>
            {shortcut}
          </span>
          <span className={cn(styles.textHover, "truncate")}>
            {text}
          </span>
        </span>
      </div>
      
      {/* Animated background effect */}
      <div className={cn(
        "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 opacity-0",
        "group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:opacity-20",
        styles.background
      )}></div>

      {/* Subtle border glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 transition-all duration-300",
        "group-hover:opacity-100",
        variant === "accept" ? "shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
        variant === "duplicate" ? "shadow-[0_0_10px_rgba(249,115,22,0.2)]" :
        variant === "decline" ? "shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
        variant === "snooze" ? "shadow-[0_0_10px_rgba(59,130,246,0.2)]" :
        "shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      )}></div>
    </button>
  );
});

TriageInteractiveButton.displayName = "TriageInteractiveButton";

export { TriageInteractiveButton };
