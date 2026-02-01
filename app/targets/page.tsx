"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Activity,
  Bell,
  Target,
  Zap,
} from "lucide-react";
import { AddTargetDrawer } from "../../components/AddTargetDrawer";
import { CheckNowButton } from "../../components/CheckNowButton";
import { RunSummary } from "../../components/RunSummary";
import { TargetsList } from "../../components/TargetsList";
import { PageHeader, PageShell, SectionHeading } from "../../components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTargets, useStartCheckRun, useCheckRun } from "../../lib/hooks";
import { formatRelativeTime, formatHumanDate } from "../../lib/formatters";
import { useToastHelpers } from "../../components/ToastProvider";
import { cn } from "../../lib/cn";

const STALE_THRESHOLD_MINUTES = 45;

function formatLatestSlot(targets: NonNullable<ReturnType<typeof useTargets>["data"]>) {
  const withSlots = targets
    .map((target) => ({
      id: target.id,
      name: target.name,
      slot: target.nextSlotTime,
    }))
    .filter((item) => item.slot)
    .map((item) => ({
      ...item,
      time: item.slot ? new Date(item.slot).getTime() : 0,
    }))
    .filter((item) => !Number.isNaN(item.time));

  if (withSlots.length === 0) {
    return null;
  }

  const nextOne = withSlots.reduce((closest, current) => {
    if (!closest) return current;
    return current.time < closest.time ? current : closest;
  }, null as (typeof withSlots)[0] | null);

  if (!nextOne) {
    return null;
  }

  return {
    name: nextOne.name,
    time: nextOne.time,
    formatted: formatHumanDate(nextOne.slot!),
  };
}

function StatsTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground-muted">
          {label}
        </p>
        {icon && (
          <span className="text-foreground-muted/60">{icon}</span>
        )}
      </div>
      <p className="mt-5 text-3xl font-semibold text-foreground">
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-foreground-muted">{detail}</p>
      )}
    </div>
  );
}

/**
 * Dedicated targets overview page styled to match the rest of the experience.
 */
export default function TargetsPage() {
  const {
    data: targets,
    isLoading: targetsLoading,
    error: targetsError,
    refetch: refetchTargets,
  } = useTargets();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [highlightedTargetIds, setHighlightedTargetIds] = useState<Set<string>>(
    new Set()
  );
  const startCheckRun = useStartCheckRun();
  const {
    data: checkRun,
    isLoading: checkRunLoading,
    error: checkRunError,
  } = useCheckRun(activeRunId);
  const { error: showError } = useToastHelpers();

  const stats = useMemo(() => {
    const list = targets ?? [];
    const threshold = Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000;
    const flattened = list.reduce(
      (acc, target) => {
        acc.total += 1;
        if (target.status === "available") acc.available += 1;
        if (target.status === "unavailable") acc.unavailable += 1;
        if (target.lastAlertStatus === "sent") acc.alerts += 1;

        const lastChecked =
          target.lastCheckedAt && !Number.isNaN(Date.parse(target.lastCheckedAt))
            ? new Date(target.lastCheckedAt).getTime()
            : null;

        if (lastChecked && lastChecked > (acc.latestChecked?.time ?? 0)) {
          acc.latestChecked = {
            value: target.lastCheckedAt!,
            time: lastChecked,
          };
        }

        if (!lastChecked || lastChecked < threshold) {
          acc.stale += 1;
        }

        return acc;
      },
      {
        total: 0,
        available: 0,
        unavailable: 0,
        alerts: 0,
        stale: 0,
        latestChecked: null as { value: string; time: number } | null,
      }
    );

    return {
      ...flattened,
      latestChecked: flattened.latestChecked?.value ?? null,
    };
  }, [targets]);

  const highlightSlot = useMemo(() => {
    if (!targets || targets.length === 0) return null;
    return formatLatestSlot(targets);
  }, [targets]);

  const handleCheckNow = useCallback(async () => {
    try {
      const result = await startCheckRun.mutateAsync({});
      setActiveRunId(result.runId);
    } catch (err) {
      showError(
        "Failed to start check",
        err instanceof Error ? err.message : "Please try again"
      );
    }
  }, [showError, startCheckRun]);

  useEffect(() => {
    if (checkRun?.status === "completed") {
      refetchTargets();

      if (checkRun.results?.length) {
        const changedIds = new Set(checkRun.results.map((result) => result.targetId));
        setHighlightedTargetIds(changedIds);

        const timer = setTimeout(() => {
          setHighlightedTargetIds(new Set());
        }, 2200);

        return () => clearTimeout(timer);
      }
    }
  }, [checkRun, refetchTargets]);

  useEffect(() => {
    if (targetsError) {
      showError(
        "Failed to load targets",
        targetsError instanceof Error ? targetsError.message : "Please refresh the page"
      );
    }
  }, [showError, targetsError]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHeader>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-foreground-muted/90"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to dashboard
            </Link>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Targets overview
            </h1>
            <p className="max-w-2xl text-base text-foreground-muted sm:text-lg">
              A glassy mission control for every monitored slot. Keep tabs on health,
              checks, and alerts from a single place.
            </p>
          </div>
          <div className="flex gap-3">
            <AddTargetDrawer onSuccess={() => refetchTargets()} />
            <CheckNowButton
              onClick={handleCheckNow}
              isLoading={startCheckRun.isPending || checkRunLoading}
              disabled={!targets || targets.length === 0}
            />
          </div>
        </div>
      </PageHeader>

      <PageShell className="pb-16 space-y-10">
        <Card variant="glass" className="border-accent/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <CardContent className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground-muted">
                Monitoring pulse
              </p>
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-foreground-muted/80" />
                <p className="text-sm text-foreground-muted">
                  {targetsLoading
                    ? "Gathering target health..."
                    : `${stats.total} target${stats.total === 1 ? "" : "s"} synchronized`}
                </p>
              </div>
              <div className="mb-4 text-sm font-semibold text-foreground">
                {highlightSlot ? (
                  <>
                    Next slot seen for{" "}
                    <span className="text-teal">{highlightSlot.name}</span>{" "}
                    at {highlightSlot.formatted}
                  </>
                ) : (
                  "No upcoming slot detected yet"
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-success" />
                  {stats.alerts} alert{stats.alerts === 1 ? "" : "s"} sent
                </span>
                <span className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-accent" />
                  {stats.available} avail{stats.available === 1 ? "" : "s"} now
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-warning" />
                  {stats.unavailable} targets paused
                </span>
              </div>
              <p className="text-xs text-foreground-muted/70">
                Latest check{" "}
                {stats.latestChecked
                  ? formatRelativeTime(stats.latestChecked)
                  : "pending"}
              </p>
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <StatsTile
                label="Total targets"
                value={stats.total}
                detail="Live feeds"
                icon={<Target className="h-4 w-4" />}
              />
              <StatsTile
                label="Available now"
                value={stats.available}
                detail="Slots freshly opened"
                icon={<Bell className="h-4 w-4" />}
              />
              <StatsTile
                label="Alerts sent"
                value={stats.alerts}
                detail="Since last full check"
                icon={<Activity className="h-4 w-4" />}
              />
              <StatsTile
                label="Stale targets"
                value={stats.stale}
                detail="No check in 45m"
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {(checkRun || startCheckRun.isPending || checkRunLoading) && (
          <section>
            <RunSummary
              run={checkRun || null}
              isLoading={startCheckRun.isPending || checkRunLoading}
              error={checkRunError}
            />
          </section>
        )}

        <section className="space-y-4">
          <SectionHeading
            title="Monitoring lanes"
            description="Every target under active observation"
            action={
              targets && targets.length > 0 ? (
                <span className="flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-1 text-xs font-semibold text-foreground-muted">
                  <Target className="h-3.5 w-3.5 text-accent" /> {targets.length} active
                </span>
              ) : undefined
            }
          />
          <TargetsList
            targets={targets ?? []}
            isLoading={targetsLoading}
            error={targetsError}
            highlightedIds={highlightedTargetIds}
          />
        </section>
      </PageShell>
    </div>
  );
}
