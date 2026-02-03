"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { formatRelativeTime, formatHumanDate } from "../lib/formatters";

interface TimelineItem {
  id: string;
  timestamp: string;
  status: "success" | "error" | "pending" | "running";
  title: string;
  description?: string;
  details?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  maxItems?: number;
  className?: string;
}

/**
 * Timeline - Visual timeline component for check history.
 * Displays events in a vertical timeline with status indicators.
 */
export function Timeline({ items, maxItems = 10, className }: TimelineProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-10 w-10 text-foreground-muted/40 mb-3" />
        <p className="text-sm text-foreground-muted">No history yet</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div
        className="absolute left-4 top-3 bottom-3 w-[2px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 212, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
        }}
      />

      <div className="space-y-0">
        {displayItems.map((item, index) => (
          <TimelineEntry
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === displayItems.length - 1}
            delay={index * 0.05}
          />
        ))}
      </div>

      {items.length > maxItems && (
        <div className="mt-4 pl-12 text-xs text-foreground-muted">
          + {items.length - maxItems} more entries
        </div>
      )}
    </div>
  );
}

interface TimelineEntryProps {
  item: TimelineItem;
  isFirst: boolean;
  isLast: boolean;
  delay: number;
}

function TimelineEntry({ item, isFirst, isLast, delay }: TimelineEntryProps) {
  const statusConfig = {
    success: {
      icon: Check,
      color: "text-success",
      bg: "bg-success/20",
      border: "border-success/30",
      glow: "0 0 12px rgba(34, 197, 94, 0.3)",
    },
    error: {
      icon: X,
      color: "text-error",
      bg: "bg-error/20",
      border: "border-error/30",
      glow: "0 0 12px rgba(239, 68, 68, 0.3)",
    },
    pending: {
      icon: Clock,
      color: "text-foreground-muted",
      bg: "bg-white/[0.08]",
      border: "border-white/[0.15]",
      glow: "none",
    },
    running: {
      icon: Loader2,
      color: "text-accent",
      bg: "bg-accent/20",
      border: "border-accent/30",
      glow: "0 0 12px rgba(0, 212, 255, 0.3)",
    },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <motion.div
      className="relative flex gap-4 py-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border",
          config.bg,
          config.border
        )}
        style={{ boxShadow: config.glow }}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            config.color,
            item.status === "running" && "animate-spin"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {item.title}
            </p>
            {item.description && (
              <p className="text-xs text-foreground-muted mt-0.5 truncate">
                {item.description}
              </p>
            )}
          </div>
          <time className="text-xs text-foreground-muted whitespace-nowrap">
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>

        {item.details && (
          <div className="mt-2 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
            <p className="text-xs text-foreground-muted">{item.details}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Compact timeline for smaller spaces.
 */
export function TimelineCompact({
  items,
  maxItems = 5,
  className,
}: TimelineProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className={cn("space-y-2", className)}>
      {displayItems.map((item, index) => (
        <motion.div
          key={item.id}
          className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
        >
          {/* Status dot */}
          <div
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              item.status === "success" && "bg-success",
              item.status === "error" && "bg-error",
              item.status === "pending" && "bg-foreground-muted",
              item.status === "running" && "bg-accent animate-pulse"
            )}
            style={{
              boxShadow:
                item.status === "success"
                  ? "0 0 8px rgba(34, 197, 94, 0.5)"
                  : item.status === "error"
                  ? "0 0 8px rgba(239, 68, 68, 0.5)"
                  : item.status === "running"
                  ? "0 0 8px rgba(0, 212, 255, 0.5)"
                  : "none",
            }}
          />

          {/* Title */}
          <span className="flex-1 text-sm text-foreground truncate">
            {item.title}
          </span>

          {/* Time */}
          <time className="text-xs text-foreground-muted">
            {formatRelativeTime(item.timestamp)}
          </time>
        </motion.div>
      ))}

      {items.length > maxItems && (
        <p className="text-xs text-foreground-muted text-center pt-2">
          + {items.length - maxItems} more
        </p>
      )}
    </div>
  );
}

/**
 * Convert check history data to timeline items.
 */
export function checksToTimelineItems(
  checks: Array<{
    id: string;
    createdAt: string;
    status: string;
    slotsFound?: number;
    errorMessage?: string;
  }>
): TimelineItem[] {
  return checks.map((check) => ({
    id: check.id,
    timestamp: check.createdAt,
    status:
      check.status === "completed"
        ? check.slotsFound && check.slotsFound > 0
          ? "success"
          : "pending"
        : check.status === "failed"
        ? "error"
        : check.status === "running"
        ? "running"
        : "pending",
    title:
      check.status === "completed"
        ? check.slotsFound && check.slotsFound > 0
          ? `${check.slotsFound} slot${check.slotsFound > 1 ? "s" : ""} found`
          : "No slots available"
        : check.status === "failed"
        ? "Check failed"
        : check.status === "running"
        ? "Checking..."
        : "Pending",
    description: check.errorMessage,
  }));
}
