import { Button } from "@/components/ui/button";
import * as React from "react";

interface ManagerButtonProps {
  name: string;
  initials: string;
  imageUrl?: string | null;
  className?: string;
  onClick?: () => void;
}

const ManagerButton = React.forwardRef<HTMLButtonElement, ManagerButtonProps>(
  ({ name, initials, imageUrl, className, onClick, ...props }, ref) => {
    // Generate a placeholder avatar from Unsplash if no imageUrl provided
    const avatarUrl = imageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80`;

    return (
      <Button 
        ref={ref}
        variant="ghost" 
        className={`rounded-full py-0 ps-0 h-8 bg-white hover:bg-gray-50 border border-gray-200 ${className}`}
        onClick={onClick}
        {...props}
      >
        <div className="me-0.5 flex aspect-square h-full p-1">
          <img
            className="h-auto w-full rounded-full object-cover"
            src={avatarUrl}
            alt={`${name} profile image`}
            width={24}
            height={24}
            aria-hidden="true"
            onError={(e) => {
              // Fallback to a different avatar if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1494790108755-2616c0763c81?w=40&h=40&fit=crop&crop=face&auto=format&q=80`;
            }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 pr-3">{name}</span>
      </Button>
    );
  },
);

ManagerButton.displayName = "ManagerButton";

export { ManagerButton };
