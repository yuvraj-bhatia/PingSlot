"use client";

import { cn } from "../lib/cn";
import type { TargetStatus } from "../lib/apiTypes";

interface StatusBadgeProps {
  status: TargetStatus;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Modern status badge with glassmorphism effects and subtle glow.
 * Not color-only - includes both visual indicator and text label.
 */
export function StatusBadge({
  status,
  className,
  showLabel = true,
  size = "md",
}: StatusBadgeProps) {
  const config = {
    available: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )}
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
      label: "Available",
      className: cn(
        "bg-success/15 text-success border-success/25",
        "shadow-[0_0_12px_rgba(34,197,94,0.2)]"
      ),
      dotClass: "bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]",
    },
    unavailable: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      ),
      label: "Unavailable",
      className: cn(
        "bg-warning/15 text-warning border-warning/25",
        "shadow-[0_0_12px_rgba(245,158,11,0.15)]"
      ),
      dotClass: "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    },
    unknown: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
      label: "Unknown",
      className: "bg-white/[0.06] text-foreground-muted border-white/[0.1]",
      dotClass: "bg-foreground-muted",
    },
    error: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
      ),
      label: "Error",
      className: cn(
        "bg-error/15 text-error border-error/25",
        "shadow-[0_0_12px_rgba(239,68,68,0.2)]"
      ),
      dotClass: "bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    },
  };

  const { icon, label, className: statusClassName, dotClass } = config[status];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        "backdrop-blur-sm transition-all duration-200",
        sizeStyles[size],
        statusClassName,
        className
      )}
      title={`Status: ${label}`}
    >
      {/* Animated dot for available status */}
      {status === "available" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", dotClass)} />
        </span>
      )}
      {status !== "available" && icon}
      {showLabel && <span>{label}</span>}
    </span>
  );
}
