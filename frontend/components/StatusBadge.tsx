"use client";

import { cn } from "../lib/cn";
import type { TargetStatus } from "../lib/apiTypes";

interface StatusBadgeProps {
  status: TargetStatus;
  className?: string;
  showLabel?: boolean;
}

/**
 * Accessible status badge with icon and text.
 * Not color-only - includes both visual indicator and text label.
 */
export function StatusBadge({
  status,
  className,
  showLabel = true,
}: StatusBadgeProps) {
  const config = {
    available: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
      label: "Available",
      className: "bg-success/15 text-success border-success/25",
    },
    unavailable: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      ),
      label: "Unavailable",
      className: "bg-accent/15 text-accent border-accent/25",
    },
    unknown: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
      label: "Unknown",
      className: "bg-muted text-foreground-muted border-border",
    },
    error: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
      ),
      label: "Error",
      className: "bg-error/15 text-error border-error/25",
    },
  };

  const { icon, label, className: statusClassName } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        statusClassName,
        className
      )}
      title={`Status: ${label}`}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </span>
  );
}
