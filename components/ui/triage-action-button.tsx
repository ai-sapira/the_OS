import React from "react";
import { cn } from "@/lib/utils";

interface TriageActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  shortcut: string;
  variant?: "accept" | "default";
}

const TriageActionButton = React.forwardRef<
  HTMLButtonElement,
  TriageActionButtonProps
>(({ text, shortcut, variant = "default", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-transparent h-8 px-4 text-center transition-all duration-200",
        variant === "accept" 
          ? "hover:bg-purple-500/5 hover:border-purple-500/30 hover:text-purple-400" 
          : "hover:bg-muted/20",
        className,
      )}
      {...props}
    >
      {/* Estado normal */}
      <span className="inline-block transition-all duration-200 group-hover:opacity-0 text-[12px] text-foreground">
        {text}
        <kbd className="ml-2 text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      </span>
      
      {/* Estado hover - letra destacada */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100">
        <span className="text-[12px] font-medium flex items-center gap-2">
          <span className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors",
            variant === "accept" 
              ? "bg-purple-400/20 text-purple-400 group-hover:bg-purple-400/30" 
              : "bg-foreground/20 text-foreground"
          )}>
            {shortcut}
          </span>
          <span className={variant === "accept" ? "text-purple-400" : "text-foreground"}>
            {text}
          </span>
        </span>
      </div>
      
      {/* Dot hover effect - más sutil */}
      <div className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-150",
        variant === "accept" ? "bg-purple-400" : "bg-foreground"
      )}></div>
    </button>
  );
});

TriageActionButton.displayName = "TriageActionButton";

export { TriageActionButton };
