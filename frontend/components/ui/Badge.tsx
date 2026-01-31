import * as React from "react";
import { cn } from "../../lib/cn";

const badgeVariants = {
  default: "bg-muted text-foreground border border-border",
  primary: "bg-accent/15 text-accent border border-accent/25",
  secondary: "bg-teal/15 text-teal border border-teal/25",
  success: "bg-success/15 text-success border border-success/25",
  warning: "bg-warning/15 text-warning border border-warning/25",
  error: "bg-error/15 text-error border border-error/25",
  outline: "bg-transparent text-foreground border border-border",
  ghost: "bg-transparent text-foreground-muted",
} as const;

const badgeSizes = {
  sm: "h-5 px-1.5 text-[10px]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-sm",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
}

/**
 * Badge component for displaying status, labels, or counts.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-full font-medium",
          "transition-colors",
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

/**
 * Status dot indicator for use with badges or standalone.
 */
export function StatusDot({
  status,
  className,
}: {
  status: "success" | "warning" | "error" | "info" | "default";
  className?: string;
}) {
  const statusColors = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
    default: "bg-foreground-muted",
  };

  return (
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        statusColors[status],
        className
      )}
    />
  );
}
