/**
 * Date and time formatting utilities
 */

/**
 * Format a date string to a human-readable date/time format
 * Example: "Feb 2, 2026, 10:00 AM"
 */
export function formatDateTime(value: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format a date string to relative time
 * Example: "5m ago", "2h ago", "3d ago"
 */
export function formatRelativeTime(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateTime(value);
}

/**
 * Format a date string to a human-friendly format
 * - "Today at 10:00 AM"
 * - "Tomorrow at 2:30 PM"
 * - "Monday at 9:00 AM"
 * - "Feb 2 at 11:00 AM"
 * - "Feb 2, 2026 at 10:00 AM"
 */
export function formatHumanDate(value: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  // Within the next 7 days, show day name
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays < 7) {
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    return `${dayName} at ${timeStr}`;
  }

  // Default: show date
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  }).format(date);

  return `${dateStr} at ${timeStr}`;
}

/**
 * Format a date to display just the date part
 * Example: "Feb 2, 2026"
 */
export function formatDate(value: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date to display just the time part
 * Example: "10:00 AM"
 */
export function formatTime(value: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
