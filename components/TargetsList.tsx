"use client";

import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { cn } from "../lib/cn";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { SimpleTooltip } from "./ui/Tooltip";
import type { TargetSummary } from "../lib/apiTypes";
import { formatDateTime, formatRelativeTime } from "../lib/formatters";

interface TargetsListProps {
  targets: TargetSummary[];
  isLoading?: boolean;
  error?: Error | null;
  highlightedIds?: Set<string>;
}

/**
 * Responsive targets list with table on desktop, cards on mobile.
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
      <Card className="border-error/30 bg-error/5">
        <CardContent className="py-8 text-center">
          <p className="text-error">Failed to load targets</p>
          <p className="text-sm text-foreground-muted">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (targets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium text-foreground">No targets yet</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Add a target to start monitoring. Your first check will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/50 bg-muted/30">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Name
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Status
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Next slot
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Last checked
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Last alert
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-foreground-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {targets.map((target) => (
              <tr
                key={target.id}
                className={cn(
                  "transition-all duration-200 hover:bg-muted/40 hover:shadow-sm",
                  highlightedIds?.has(target.id) && "animate-pulse-subtle bg-success/10 border-l-2 border-l-success"
                )}
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/targets/${target.id}`}
                    className="font-semibold text-foreground hover:text-accent transition-colors"
                  >
                    {target.name}
                  </Link>
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
                    {target.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={target.status} />
                </td>
                <td className="px-6 py-4 text-foreground-muted">
                  {target.nextSlotTime
                    ? formatDateTime(target.nextSlotTime)
                    : "—"}
                </td>
                <td className="px-6 py-4 text-foreground-muted">
                  {target.lastCheckedAt
                    ? formatRelativeTime(target.lastCheckedAt)
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  {target.lastEmailSent ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          target.lastEmailSent.sent
                            ? "bg-success animate-pulse"
                            : "bg-foreground-muted"
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-foreground-muted text-xs">
                        {target.lastEmailSent.sent ? "Sent" : "Not sent"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-foreground-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <SimpleTooltip content="View details">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="h-8 w-8"
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
                          className="h-8 w-8"
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
        {targets.map((target) => (
          <Card
            key={target.id}
            className={cn(
              "transition-all duration-200 hover:shadow-lg",
              highlightedIds?.has(target.id) && "animate-pulse-subtle border-success/50 border-l-4 shadow-lg"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/targets/${target.id}`}
                    className="font-medium text-foreground hover:text-accent hover:underline"
                  >
                    {target.name}
                  </Link>
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-foreground-muted">
                    {target.type}
                  </span>
                </div>
                <StatusBadge status={target.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-foreground-muted">Next slot</dt>
                  <dd className="text-foreground">
                    {target.nextSlotTime
                      ? formatDateTime(target.nextSlotTime)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-muted">
                    Last checked
                  </dt>
                  <dd className="text-foreground">
                    {target.lastCheckedAt
                      ? formatRelativeTime(target.lastCheckedAt)
                      : "Never"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-muted">Last alert</dt>
                  <dd className="flex items-center gap-1.5">
                    {target.lastEmailSent ? (
                      <>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            target.lastEmailSent.sent
                              ? "bg-success"
                              : "bg-foreground-muted"
                          )}
                        />
                        <span className="text-foreground">
                          {target.lastEmailSent.sent ? "Sent" : "Not sent"}
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground-muted">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild className="flex-1">
                  <Link href={`/targets/${target.id}`}>
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
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
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Booking
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
 */
function TargetsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-6 w-20 rounded bg-muted" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

