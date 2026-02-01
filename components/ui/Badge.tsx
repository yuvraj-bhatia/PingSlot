import * as React from "react";
import { cn } from "../../lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "ghost" | "accent" | "teal";
  size?: "sm" | "md";
}

/**
 * Modern Badge component with glassmorphism effects.
 */
export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    default: cn(
      "bg-white/[0.06] text-foreground border-white/[0.1]",
      "shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
    ),
    success: cn(
      "bg-success/15 text-success border-success/25",
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    ),
    warning: cn(
      "bg-warning/15 text-warning border-warning/25",
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    ),
    error: cn(
      "bg-error/15 text-error border-error/25",
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    ),
    accent: cn(
      "bg-accent/15 text-accent border-accent/25",
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    ),
    teal: cn(
      "bg-teal/15 text-teal border-teal/25",
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    ),
    ghost: "bg-transparent border-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full border font-semibold",
        "backdrop-blur-sm transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
