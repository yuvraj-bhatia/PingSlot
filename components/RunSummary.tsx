"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Mail, Target, Zap } from "lucide-react";
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
 * Modern check run summary with glassmorphism effects.
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

  const borderColor = run?.status === "completed" 
    ? "border-success/30" 
    : run?.status === "failed" 
    ? "border-error/30" 
    : "border-accent/30";

  return (
    <Card
      variant="glass"
      className={cn(
        "transition-all duration-300",
        borderColor,
        run?.status === "completed" && "shadow-[0_0_40px_-10px_rgba(34,197,94,0.2)]",
        run?.status === "failed" && "shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]",
        (isLoading || run?.status === "pending" || run?.status === "running") && 
          "shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]"
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <StatusIcon status={run?.status} isLoading={isLoading} error={error} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {getTitle(run, isLoading, error)}
              </h3>
              {run && (
                <p className="text-sm text-foreground-muted">
                  Started {formatTime(run.startedAt)}
                </p>
              )}
            </div>
          </div>
          
          {run?.summary && (
            <div className="flex items-center gap-3">
              <SummaryBadge
                icon={<Target className="h-4 w-4" />}
                label="Checked"
                value={run.summary.checked}
                variant="default"
              />
              <SummaryBadge
                icon={<Zap className="h-4 w-4" />}
                label="Available"
                value={run.summary.available}
                variant="success"
              />
              <SummaryBadge
                icon={<Mail className="h-4 w-4" />}
                label="Emails"
                value={run.summary.emailsSent}
                variant="accent"
              />
            </div>
          )}
        </div>

        {/* Progress bar for running state */}
        {(run?.status === "pending" || run?.status === "running") && (
          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div 
                className="h-full rounded-full bg-accent/80 transition-all"
                style={{ width: "60%" }}
              />
            </div>
            <p className="mt-3 text-sm text-foreground-muted">
              Checking targets for availability...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-error" />
            <div>
              <p className="font-semibold text-error">Check failed</p>
              <p className="mt-1 text-sm text-error/80">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
          </div>
        )}

        {/* Results table (collapsible) */}
        {run?.results && run.results.length > 0 && showDetails && (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.08] bg-white/[0.04]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {run.results.map((result) => (
                  <tr key={result.targetId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {result.targetName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={result.status} />
                    </td>
                    <td className="px-4 py-3">
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
            className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show details ({run.results.length} results)
              </>
            )}
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error/15 border border-error/25">
        <AlertCircle className="h-6 w-6 text-error" />
      </div>
    );
  }

  if (isLoading || status === "pending" || status === "running") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 border border-accent/25">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 border border-success/25">
        <CheckCircle className="h-6 w-6 text-success" />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
      <AlertCircle className="h-6 w-6 text-foreground-muted" />
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
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "default" | "success" | "accent";
}) {
  const variants = {
    default: "bg-white/[0.06] border-white/[0.1] text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
    success: "bg-success/15 border-success/25 text-success shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
    accent: "bg-accent/15 border-accent/25 text-accent shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border px-4 py-2.5 min-w-[80px]",
        variants[variant]
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xl font-bold leading-none">{value}</span>
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-70">
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
    unavailable: "bg-warning/15 text-warning border-warning/25",
    unknown: "bg-white/[0.06] text-foreground-muted border-white/[0.1]",
    error: "bg-error/15 text-error border-error/25",
  };

  return (
    <Badge variant="ghost" className={cn("border font-semibold", config[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function EmailStatus({ sent, reason }: { sent: boolean; reason: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          sent
            ? "bg-success shadow-[0_0_8px_rgba(0,0,0,0.4)]"
            : "bg-foreground-muted"
        )}
      />
      <span className="text-sm text-foreground-muted">{reason}</span>
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
