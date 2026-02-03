"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../lib/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs - Navigation breadcrumb trail component.
 * Auto-generates from pathname or accepts custom items.
 * Follows WCAG accessibility guidelines.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on root pages
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center gap-1" role="list">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg transition-colors",
              "text-foreground-muted hover:text-foreground hover:bg-white/[0.05]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            )}
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {/* Separator */}
              <ChevronRight
                className="h-3.5 w-3.5 text-foreground-muted/50 mx-1"
                aria-hidden="true"
              />

              {/* Breadcrumb item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "px-2 py-1 rounded-lg font-medium",
                    isLast
                      ? "text-foreground bg-white/[0.04]"
                      : "text-foreground-muted"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-colors",
                    "text-foreground-muted hover:text-foreground hover:bg-white/[0.05]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Format the label
    const label = formatBreadcrumbLabel(segment, segments, i);

    // Don't add href for the last item
    const isLast = i === segments.length - 1;

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}

/**
 * Format segment into human-readable label
 */
function formatBreadcrumbLabel(
  segment: string,
  segments: string[],
  index: number
): string {
  // Handle dynamic route segments (e.g., [id])
  if (segment.startsWith("[") && segment.endsWith("]")) {
    return segment.slice(1, -1);
  }

  // Handle specific route patterns
  const routeLabels: Record<string, string> = {
    targets: "Targets",
    book: "Auto-Book",
    landing: "Home",
  };

  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  // Check if this looks like an ID (UUID or similar)
  if (isUUID(segment) || segment.length > 20) {
    // Try to get context from previous segment
    const prevSegment = segments[index - 1];
    if (prevSegment === "targets") {
      return "Target Details";
    }
    return "Details";
  }

  // Default: capitalize and replace hyphens/underscores
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Check if string looks like a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Compact breadcrumbs variant for mobile
 */
export function BreadcrumbsCompact({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show on root
  if (segments.length === 0) {
    return null;
  }

  // Get parent path
  const parentPath = "/" + segments.slice(0, -1).join("/") || "/";
  const parentLabel =
    segments.length > 1
      ? formatBreadcrumbLabel(segments[segments.length - 2], segments, segments.length - 2)
      : "Dashboard";

  return (
    <Link
      href={parentPath}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
        "text-foreground-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        className
      )}
    >
      <ChevronRight className="h-4 w-4 rotate-180" />
      <span>Back to {parentLabel}</span>
    </Link>
  );
}
