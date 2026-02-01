"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
} from "lucide-react";
import { PageHeader, PageShell } from "../../../components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/StatusBadge";
import { useTarget } from "../../../lib/hooks";
import {
  formatDateTime,
  formatHumanDate,
  formatRelativeTime,
} from "../../../lib/formatters";
import type { TargetStatus } from "../../../lib/apiTypes";
import { cn } from "../../../lib/cn";

interface TargetDetailPageProps {
  params: { id: string };
}

interface EmailAlert {
  id: string;
  sentAt: string;
  slotFound: string | null;
  subject: string;
  preview: string;
  body: string;
}

const AUTO_CHECK_INTERVAL_MINUTES = 5;

function getNextAutoCheckInMinutes(lastCheckedAt: string | null) {
  if (!lastCheckedAt) return null;
  const last = new Date(lastCheckedAt);
  if (Number.isNaN(last.getTime())) return null;
  const next = last.getTime() + AUTO_CHECK_INTERVAL_MINUTES * 60 * 1000;
  const diffMinutes = Math.round((next - Date.now()) / 60000);
  return Math.max(0, diffMinutes);
}

function getCheckNote(status: TargetStatus, nextSlotTime: string | null) {
  if (status === "available") {
    return nextSlotTime ? "New slot detected" : "Slot available";
  }
  if (status === "error") {
    return "Check failed";
  }
  if (status === "unknown") {
    return "Status unclear";
  }
  return "No slots detected";
}

/**
 * Target Detail Screen
 */
export default function TargetDetailPage({ params }: TargetDetailPageProps) {
  const { data: target, isLoading, error } = useTarget(params.id);
  const [openAlertId, setOpenAlertId] = useState<string | null>(null);

  const emailAlerts = useMemo<EmailAlert[]>(() => {
    if (!target) return [];
    const alerts: EmailAlert[] = [];

    const createEmail = ({
      id,
      sentAt,
      slotFound,
      summary,
    }: {
      id: string;
      sentAt: string;
      slotFound: string | null;
      summary: string;
    }) => {
      const slotLine = slotFound
        ? `Next available: ${formatHumanDate(slotFound)}.`
        : "No slots were available at the time of this check.";
      const body = [
        "Hello,",
        "",
        `We just ran a check for ${target.name}.`,
        slotLine,
        summary ? `Note: ${summary}` : null,
        target.bookingUrl ? `Booking page: ${target.bookingUrl}` : null,
        `Sent: ${formatDateTime(sentAt)}`,
        "",
        "— PingSlot",
      ]
        .filter(Boolean)
        .join("\n");

      return {
        id,
        sentAt,
        slotFound,
        subject: slotFound
          ? `Slot found for ${target.name}`
          : `Update for ${target.name}`,
        preview: slotFound
          ? `Next available: ${formatHumanDate(slotFound)}`
          : summary || "No slots detected on the last check.",
        body,
      };
    };

    if (target.lastAlert?.at) {
      alerts.push(
        createEmail({
          id: "last-alert",
          sentAt: target.lastAlert.at,
          slotFound: target.nextSlotTime,
          summary: target.lastAlert.reason || "Automated alert from PingSlot.",
        })
      );
    }

    target.recentChecks
      .filter((check) => check.status === "available")
      .slice(0, 3)
      .forEach((check, index) => {
        alerts.push(
          createEmail({
            id: `check-${index}`,
            sentAt: check.checkedAt,
            slotFound: check.nextSlotTime,
            summary: "Slot detected during automated check.",
          })
        );
      });

    return alerts.slice(0, 5);
  }, [target]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHeader>
          <div className="h-4 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-white/[0.06]" />
        </PageHeader>
        <PageShell className="pb-12 space-y-6">
          <Card variant="glass" className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-40 rounded-xl bg-white/[0.04]" />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="glass" className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-32 rounded-xl bg-white/[0.04]" />
              </CardContent>
            </Card>
            <Card variant="glass" className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-32 rounded-xl bg-white/[0.04]" />
              </CardContent>
            </Card>
          </div>
        </PageShell>
      </div>
    );
  }

  if (error || !target) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageShell>
          <div className="py-20 text-center" role="alert" aria-live="assertive">
            <p className="text-xl font-semibold text-error">
              {error ? "Failed to load target" : "Target not found"}
            </p>
            <p className="mt-2 text-foreground-muted">
              {error?.message || "The target you're looking for doesn't exist."}
            </p>
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </PageShell>
      </div>
    );
  }

  const nextAutoCheckIn = getNextAutoCheckInMinutes(target.lastCheckedAt);
  const nextSlotLabel = target.nextSlotTime
    ? formatHumanDate(target.nextSlotTime)
    : "No slots currently";
  const requirementsBullets = target.requirementsBullets ?? [];
  const requirementsSource =
    requirementsBullets.length === 0
      ? "none"
      : target.requirementsUrl
        ? "page"
        : "document";
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHeader>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors group"
          aria-label="Return to dashboard"
        >
          <ArrowLeft
            className="h-4 w-4 group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
          />
          Back to dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground-muted/70">
              Target details
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {target.name}
            </h1>
            <p className="text-sm text-foreground-muted">
              Deep view of status, requirements, and alerts for this target.
            </p>
          </div>
          <Button variant="secondary" size="sm" aria-label="Edit target">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </PageHeader>

      <PageShell className="pb-16 space-y-8">
        <Card variant="glass">
          <CardContent className="relative p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted/70">
                    Status
                  </span>
                  <StatusBadge
                    status={target.status}
                    size="lg"
                    className="px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-foreground-muted/70">
                    Next available slot
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
                    {nextSlotLabel}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last checked {formatRelativeTime(target.lastCheckedAt)}
                  </span>
                  <span className="text-foreground-muted/50">·</span>
                  <span>
                    {nextAutoCheckIn === null
                      ? "Auto-check schedule unavailable"
                      : `Next auto-check in ${nextAutoCheckIn} min`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {target.bookingUrl ? (
                  <Button asChild>
                    <a
                      href={target.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open booking page in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open booking page
                    </a>
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <ExternalLink className="h-4 w-4" />
                    Open booking page
                  </Button>
                )}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs text-foreground-muted">
                  {target.bookingUrl ? (
                    <span className="break-all">
                      {target.bookingUrl.replace(/^https?:\/\//, "")}
                    </span>
                  ) : (
                    <span>No booking URL on file.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 border border-teal/20">
                  <FileText className="h-5 w-5 text-teal" />
                </div>
                Requirements / What to Bring
              </CardTitle>
              {target.requirementsUrl ? (
                <CardDescription className="flex items-center gap-2">
                  Extracted from booking page
                  <a
                    href={target.requirementsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal hover:underline"
                  >
                    View source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              ) : (
                <CardDescription>Capture documents or page notes here.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {requirementsBullets.length > 0 ? (
                <div className="space-y-4">
                  {requirementsSource === "document" && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                      Personalized from your document:
                    </p>
                  )}
                  <ul className="space-y-3" role="list">
                    {requirementsBullets.map((bullet, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="mt-2 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(255,128,0,0.5)]" />
                        <span className="text-sm text-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
                  <FileText
                    className="mx-auto h-10 w-10 text-foreground-muted/50"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No requirements extracted yet.
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    Add a requirements URL or document.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                Email Alerts for this Target
              </CardTitle>
              <CardDescription>
                Sent At · Slot Found · Email Preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailAlerts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
                  <Mail
                    className="mx-auto h-10 w-10 text-foreground-muted/50"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No alerts sent yet
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    Emails appear here whenever a slot is detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden rounded-xl bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted sm:grid sm:grid-cols-12">
                    <div className="col-span-3">Sent at</div>
                    <div className="col-span-3">Slot found</div>
                    <div className="col-span-5">Email preview</div>
                    <div className="col-span-1 text-right">View</div>
                  </div>
                  {emailAlerts.map((alert) => (
                    <EmailAlertRow
                      key={alert.id}
                      alert={alert}
                      isOpen={openAlertId === alert.id}
                      onToggle={() =>
                        setOpenAlertId((prev) =>
                          prev === alert.id ? null : alert.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1]">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              Check History
            </CardTitle>
            <CardDescription>Last few automated checks</CardDescription>
          </CardHeader>
          <CardContent>
            {target.recentChecks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
                <Clock
                  className="mx-auto h-10 w-10 text-foreground-muted/50"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium text-foreground">
                  No check history yet
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  A history will appear once checks begin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden rounded-xl bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted sm:grid sm:grid-cols-12">
                  <div className="col-span-3">Checked at</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-4">Next slot at time</div>
                  <div className="col-span-3">Notes</div>
                </div>
                {target.recentChecks.slice(0, 8).map((check, index) => (
                  <div
                    key={`${check.checkedAt}-${index}`}
                    className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-12 sm:items-center"
                  >
                    <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                      Checked at
                    </div>
                    <div className="sm:col-span-3 text-sm font-medium text-foreground">
                      {formatDateTime(check.checkedAt)}
                    </div>
                    <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                      Status
                    </div>
                    <div className="sm:col-span-2">
                      <StatusBadge status={check.status} size="sm" />
                    </div>
                    <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                      Next slot at time
                    </div>
                    <div className="sm:col-span-4 text-sm text-foreground-muted">
                      {check.nextSlotTime
                        ? formatHumanDate(check.nextSlotTime)
                        : "—"}
                    </div>
                    <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                      Notes
                    </div>
                    <div className="sm:col-span-3 text-xs text-foreground-muted">
                      {getCheckNote(check.status, check.nextSlotTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}

function EmailAlertRow({
  alert,
  isOpen,
  onToggle,
}: {
  alert: EmailAlert;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div
        className={cn(
          "grid gap-3 p-4 sm:grid-cols-12 sm:items-center transition-colors",
          "cursor-pointer hover:bg-white/[0.03]"
        )}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
          Sent at
        </div>
        <div className="sm:col-span-3 text-sm font-medium text-foreground">
          {formatDateTime(alert.sentAt)}
        </div>

        <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
          Slot found
        </div>
        <div className="sm:col-span-3 text-sm text-foreground-muted">
          {alert.slotFound ? formatHumanDate(alert.slotFound) : "No slot"}
        </div>

        <div className="sm:hidden text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
          Email preview
        </div>
        <div className="sm:col-span-5">
          <p className="text-sm font-semibold text-foreground">
            {alert.subject}
          </p>
          <p className="text-xs text-foreground-muted">{alert.preview}</p>
        </div>

        <div className="hidden sm:flex sm:col-span-1 sm:justify-end text-foreground-muted">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
      {isOpen && (
        <div
          className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-4"
          role="region"
          aria-label="Email body"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            Full email body
          </p>
          <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            {alert.body}
          </div>
        </div>
      )}
    </div>
  );
}
