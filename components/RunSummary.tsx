"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../lib/cn";
import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import type { CheckRunResponse, CheckRunStatus } from "../lib/apiTypes";

interface RunSummaryProps {
  run: CheckRunResponse | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Displays check run summary with progress and results.
 * Updates in real-time as the run progresses.
 */
export function RunSummary({ run, isLoading, error }: RunSummaryProps) {
  const [showDetails, setShowDetails] = useState(true);

  // Auto-collapse completed runs after 5 seconds
  useEffect(() => {
    if (run?.status === "completed") {
      const timer = setTimeout(() => setShowDetails(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [run?.status]);

  if (!run && !isLoading && !error) return null;

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        run?.status === "completed" && "border-success/30",
        run?.status === "failed" && "border-error/30"
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon status={run?.status} isLoading={isLoading} error={error} />
            <div>
              <h3 className="font-medium text-foreground">
                {getTitle(run, isLoading, error)}
              </h3>
              {run && (
                <p className="text-xs text-foreground-muted">
                  Started {formatTime(run.startedAt)}
                </p>
              )}
            </div>
          </div>
          {run?.summary && (
            <div className="flex items-center gap-2">
              <SummaryBadge
                label="Checked"
                value={run.summary.checked}
                variant="default"
              />
              <SummaryBadge
                label="Available"
                value={run.summary.available}
                variant="success"
              />
              <SummaryBadge
                label="Emails"
                value={run.summary.emailsSent}
                variant="teal"
              />
            </div>
          )}
        </div>

        {/* Progress bar for running state */}
        {(run?.status === "pending" || run?.status === "running") && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse-subtle rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-xs text-foreground-muted">
              Checking targets for availability...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-error" />
            <div>
              <p className="font-medium text-error">Check failed</p>
              <p className="text-error/80">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
          </div>
        )}

        {/* Results table (collapsible) */}
        {run?.results && run.results.length > 0 && showDetails && (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-foreground-muted">
                    Target
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-foreground-muted">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {run.results.map((result) => (
                  <tr key={result.targetId}>
                    <td className="px-3 py-2 text-foreground">
                      {result.targetName}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={result.status} />
                    </td>
                    <td className="px-3 py-2">
                      <EmailStatus
                        sent={result.email.sent}
                        reason={result.email.reason}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Toggle details button */}
        {run?.results && run.results.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 text-xs text-foreground-muted hover:text-foreground"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function StatusIcon({
  status,
  isLoading,
  error,
}: {
  status?: CheckRunStatus;
  isLoading: boolean;
  error: Error | null;
}) {
  if (error) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/15">
        <AlertCircle className="h-5 w-5 text-error" />
      </div>
    );
  }

  if (isLoading || status === "pending" || status === "running") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
        <CheckCircle className="h-5 w-5 text-success" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
      <AlertCircle className="h-5 w-5 text-foreground-muted" />
    </div>
  );
}

function getTitle(
  run: CheckRunResponse | null,
  isLoading: boolean,
  error: Error | null
): string {
  if (error) return "Check failed";
  if (isLoading || !run) return "Starting check...";
  if (run.status === "pending") return "Waiting to start...";
  if (run.status === "running") return "Checking targets...";
  if (run.status === "completed") return "Check complete";
  return "Check failed";
}

function SummaryBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "default" | "success" | "teal";
}) {
  const variants = {
    default: "bg-muted text-foreground",
    success: "bg-success/15 text-success border-success/25",
    teal: "bg-teal/15 text-teal border-teal/25",
  };

  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-3 py-1.5 ${variants[variant]}`}
    >
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-80">
        {label}
      </span>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "available" | "unavailable" | "unknown" | "error";
}) {
  const config = {
    available: "bg-success/15 text-success border-success/25",
    unavailable: "bg-accent/15 text-accent border-accent/25",
    unknown: "bg-muted text-foreground-muted",
    error: "bg-error/15 text-error border-error/25",
  };

  return (
    <Badge variant="ghost" className={`border ${config[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function EmailStatus({ sent, reason }: { sent: boolean; reason: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          sent ? "bg-success" : "bg-foreground-muted"
        )}
      />
      <span className="text-xs text-foreground-muted">{reason}</span>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
