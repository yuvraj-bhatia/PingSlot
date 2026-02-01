"use client";

import Link from "next/link";
import { ExternalLink, Eye, ArrowRight } from "lucide-react";
import { cn } from "../lib/cn";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { SimpleTooltip } from "./ui/Tooltip";
import type { TargetSummary } from "../lib/apiTypes";
import { formatRelativeTime, formatHumanDate } from "../lib/formatters";

interface TargetsListProps {
  targets: TargetSummary[];
  isLoading?: boolean;
  error?: Error | null;
  highlightedIds?: Set<string>;
}

/**
 * Responsive targets list with glassmorphism table on desktop, cards on mobile.
 * Includes skeleton loading, empty state, and error state.
 */
export function TargetsList({
  targets,
  isLoading,
  error,
  highlightedIds,
}: TargetsListProps) {
  if (isLoading) {
    return <TargetsListSkeleton />;
  }

  if (error) {
    return (
      <Card variant="bordered" className="border-error/30 bg-error/5" role="alert" aria-live="assertive">
        <CardContent className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 border border-error/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-error"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold text-error">Failed to load targets</p>
          <p className="mt-2 text-sm text-foreground-muted">{error.message}</p>
          <p className="mt-4 text-xs text-foreground-muted">
            Please refresh the page or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (targets.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-accent"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold text-foreground">No targets yet</p>
          <p className="mt-2 text-sm text-foreground-muted">
            Add a target to start monitoring appointment availability.
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Click the &quot;Add target&quot; button above to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-white/[0.03]">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Name
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Next slot
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Last checked
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Last alert
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {targets.map((target, index) => (
              <tr
                key={target.id}
                className={cn(
                  "transition-all duration-300 hover:bg-white/[0.04]",
                  highlightedIds?.has(target.id) && "bg-success/10 border-l-2 border-l-success animate-pulse"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-5">
                  <Link
                    href={`/targets/${target.id}`}
                    className="group flex items-center gap-2 font-semibold text-foreground hover:text-accent transition-colors"
                  >
                    {target.name}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={target.status} />
                </td>
                <td className="px-6 py-5 text-foreground-muted">
                  {target.nextSlotTime
                    ? formatHumanDate(target.nextSlotTime)
                    : "—"}
                </td>
                <td className="px-6 py-5 text-foreground-muted">
                  {target.lastCheckedAt
                    ? formatRelativeTime(target.lastCheckedAt)
                    : "Never"}
                </td>
                <td className="px-6 py-5">
                  {target.lastAlertStatus ? (
                    <span 
                      className={cn(
                        "inline-flex items-center gap-2 text-xs font-medium",
                        target.lastAlertStatus === "sent" 
                          ? "text-success" 
                          : "text-foreground-muted"
                      )}
                      title={`Last alert: ${target.lastAlertStatus}`}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          target.lastAlertStatus === "sent"
                            ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                            : target.lastAlertStatus.startsWith("failed")
                            ? "bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : "bg-foreground-muted"
                        )}
                        aria-hidden="true"
                      />
                      <span className="max-w-[120px] truncate capitalize">
                        {target.lastAlertStatus}
                      </span>
                    </span>
                  ) : (
                    <span className="text-foreground-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <SimpleTooltip content="View details">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="h-9 w-9 rounded-xl"
                        aria-label={`View details for ${target.name}`}
                      >
                        <Link href={`/targets/${target.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View {target.name}</span>
                        </Link>
                      </Button>
                    </SimpleTooltip>
                    {target.bookingUrl && (
                      <SimpleTooltip content="Open booking site">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className="h-9 w-9 rounded-xl"
                          aria-label={`Open booking page for ${target.name}`}
                        >
                          <a
                            href={target.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">
                              Open booking for {target.name}
                            </span>
                          </a>
                        </Button>
                      </SimpleTooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {targets.map((target, index) => (
          <Card
            key={target.id}
            variant="glass"
            className={cn(
              "transition-all duration-300 hover:translate-y-[-2px]",
              highlightedIds?.has(target.id) && "border-success/50 border-l-4 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/targets/${target.id}`}
                    className="font-semibold text-foreground hover:text-accent transition-colors truncate block"
                  >
                    {target.name}
                  </Link>
                </div>
                <StatusBadge status={target.status} />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground-muted/70">Next slot</dt>
                  <dd className="text-foreground font-medium">
                    {target.nextSlotTime
                      ? formatHumanDate(target.nextSlotTime)
                      : "—"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground-muted/70">
                    Last checked
                  </dt>
                  <dd className="text-foreground font-medium">
                    {target.lastCheckedAt
                      ? formatRelativeTime(target.lastCheckedAt)
                      : "Never"}
                  </dd>
                </div>
                <div className="col-span-2 space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground-muted/70">Last alert</dt>
                  <dd className="flex items-center gap-2">
                    {target.lastAlertStatus ? (
                      <>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            target.lastAlertStatus === "sent"
                              ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                              : target.lastAlertStatus.startsWith("failed")
                              ? "bg-error"
                              : "bg-foreground-muted"
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-foreground font-medium capitalize">
                          {target.lastAlertStatus}
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground-muted">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center gap-3">
                <Button variant="secondary" size="sm" asChild className="flex-1">
                  <Link href={`/targets/${target.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
                {target.bookingUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={target.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open booking page for ${target.name} in new tab`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Book Now
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/**
 * Skeleton loader for targets list.
 * Shows animated placeholder while data is loading.
 */
function TargetsListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading targets">
      {/* Desktop skeleton */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
        <div className="border-b border-white/[0.08] bg-white/[0.03] px-6 py-4">
          <div className="flex gap-6">
            {["Name", "Status", "Next slot", "Last checked", "Last alert", "Actions"].map((_, i) => (
              <div key={i} className="h-4 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
            ))}
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="flex items-center gap-6 px-6 py-5 border-b border-white/[0.04] last:border-0"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-5 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-7 w-24 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-28 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-20 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-9 w-20 rounded-xl bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      {[1, 2, 3].map((i) => (
        <Card 
          key={i} 
          variant="glass" 
          className="animate-pulse md:hidden"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/3 rounded-lg bg-white/[0.06]" />
              <div className="h-7 w-24 rounded-full bg-white/[0.06]" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="h-4 w-24 rounded-lg bg-white/[0.06]" />
              <div className="h-4 w-24 rounded-lg bg-white/[0.06]" />
              <div className="h-4 w-32 rounded-lg bg-white/[0.06] col-span-2" />
            </div>
            <div className="mt-5 flex gap-3">
              <div className="h-10 flex-1 rounded-xl bg-white/[0.06]" />
              <div className="h-10 flex-1 rounded-xl bg-white/[0.06]" />
            </div>
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Loading targets...</span>
    </div>
  );
}
