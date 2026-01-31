"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { PageShell, PageHeader } from "../../../components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/StatusBadge";
import { useTarget } from "../../../lib/hooks";
import { simulateAvailability } from "../../../lib/fixtures";
import { useState, useCallback } from "react";
import { useToastHelpers } from "../../../components/ToastProvider";

interface TargetDetailPageProps {
  params: { id: string };
}

export default function TargetDetailPage({ params }: TargetDetailPageProps) {
  const { data: target, isLoading, error, refetch } = useTarget(params.id);
  const [isSimulating, setIsSimulating] = useState(false);
  const { success } = useToastHelpers();

  const handleSimulateAvailability = useCallback(async () => {
    setIsSimulating(true);
    simulateAvailability(params.id, true);
    await refetch();
    success("Availability simulated", "Target now shows as available");
    setIsSimulating(false);
  }, [params.id, refetch, success]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="py-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
      </PageShell>
    );
  }

  if (error || !target) {
    return (
      <PageShell>
        <div className="py-12 text-center">
          <p className="text-error">Target not found</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <div>
      <PageHeader>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {target.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-foreground-muted">
                {target.type}
              </span>
              <span className="text-sm text-foreground-muted">
                {target.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={target.status} />
          </div>
        </div>
      </PageHeader>

      <PageShell className="pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Target Details */}
          <Card>
            <CardHeader>
              <CardTitle>Target Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-foreground-muted">Booking URL</p>
                {target.bookingUrl ? (
                  <a
                    href={target.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal hover:underline"
                  >
                    {target.bookingUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-foreground-muted">Not set</p>
                )}
              </div>
              <div>
                <p className="text-xs text-foreground-muted">
                  Requirements URL
                </p>
                {target.requirementsUrl ? (
                  <a
                    href={target.requirementsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal hover:underline"
                  >
                    {target.requirementsUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-foreground-muted">Not set</p>
                )}
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Alert email</p>
                <p className="text-foreground">{target.alertEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Latest Check */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Latest Check</CardTitle>
              {target.lastCheckedAt && (
                <span className="text-xs text-foreground-muted">
                  {formatRelativeTime(target.lastCheckedAt)}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {target.lastCheck ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-muted">
                      Status
                    </span>
                    <StatusBadge status={target.lastCheck.status} />
                  </div>
                  <div>
                    <span className="text-sm text-foreground-muted">
                      Next slot
                    </span>
                    <p className="text-foreground">
                      {target.lastCheck.nextSlotTime
                        ? formatDateTime(target.lastCheck.nextSlotTime)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-foreground-muted">
                      Email status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          target.lastCheck.email.sent
                            ? "bg-success"
                            : "bg-foreground-muted"
                        }`}
                      />
                      <span className="text-sm text-foreground">
                        {target.lastCheck.email.sent
                          ? "Sent"
                          : "Not sent"}{" "}
                        — {target.lastCheck.email.reason}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-foreground-muted">
                  No checks have been run yet.
                </p>
              )}

              {/* Dev-only simulate button */}
              <div className="border-t border-border pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSimulateAvailability}
                  isLoading={isSimulating}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Simulate Availability
                </Button>
                <p className="mt-1 text-xs text-foreground-muted">
                  Dev-only: Force target to show as available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Checklist */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Requirements Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            {target.requirementsBullets &&
            target.requirementsBullets.length > 0 ? (
              <ul className="space-y-2">
                {target.requirementsBullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground-muted">
                No requirements listed for this target.
              </p>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>History (Last 5 Checks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {target.recentChecks.length === 0 ? (
                <p className="text-foreground-muted">
                  No check history available.
                </p>
              ) : (
                target.recentChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDateTime(check.checkedAt)}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        Next slot:{" "}
                        {check.nextSlotTime
                          ? formatDateTime(check.nextSlotTime)
                          : "—"}
                      </p>
                      {check.rawDebug && (
                        <p className="text-xs text-foreground-muted">
                          Debug: {check.rawDebug}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={check.status} />
                      <span className="text-xs text-foreground-muted">
                        {check.emailSent ? "📧" : "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
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

  return formatDateTime(dateString);
}
