"use client";

import { useState, useCallback, useEffect } from "react";
import { PageShell, PageHeader } from "../components/PageShell";
import { TargetsList } from "../components/TargetsList";
import { AddTargetDrawer } from "../components/AddTargetDrawer";
import { CheckNowButton } from "../components/CheckNowButton";
import { RunSummary } from "../components/RunSummary";
import { useTargets, useStartCheckRun, useCheckRun } from "../lib/hooks";
import { useToastHelpers } from "../components/ToastProvider";

/**
 * Dashboard page - main entry point for the app.
 * Displays targets list, check now action, and run summaries.
 */
export default function DashboardPage() {
  // Data fetching
  const {
    data: targets,
    isLoading: targetsLoading,
    error: targetsError,
    refetch: refetchTargets,
  } = useTargets();

  // Check run state
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [highlightedTargetIds, setHighlightedTargetIds] = useState<Set<string>>(
    new Set()
  );

  // Mutations and queries
  const startCheckRun = useStartCheckRun();
  const {
    data: checkRun,
    isLoading: checkRunLoading,
    error: checkRunError,
  } = useCheckRun(activeRunId);

  const { error: showError } = useToastHelpers();

  // Handle check now click
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
  }, [startCheckRun, showError]);

  // Handle check run completion
  useEffect(() => {
    if (checkRun?.status === "completed") {
      // Refresh targets list
      void refetchTargets();

      // Highlight targets that changed status
      if (checkRun.results) {
        const changedIds = new Set(
          checkRun.results.map((r) => r.targetId)
        );
        setHighlightedTargetIds(changedIds);

        // Clear highlights after animation
        const timer = setTimeout(() => {
          setHighlightedTargetIds(new Set());
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [checkRun, refetchTargets]);

  // Handle targets error
  useEffect(() => {
    if (targetsError) {
      showError(
        "Failed to load targets",
        targetsError instanceof Error
          ? targetsError.message
          : "Please refresh the page"
      );
    }
  }, [targetsError, showError]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHeader>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Dashboard
            </h1>
            <p className="text-base text-foreground-muted sm:text-lg">
              Track appointment availability, run checks, and review alert
              activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AddTargetDrawer onSuccess={() => refetchTargets()} />
            <CheckNowButton
              onClick={handleCheckNow}
              isLoading={startCheckRun.isPending || checkRunLoading}
              disabled={!targets || targets.length === 0}
            />
          </div>
        </div>
      </PageHeader>

      <PageShell className="space-y-8 pb-12">
        {/* Run Summary */}
        <RunSummary
          run={checkRun || null}
          isLoading={startCheckRun.isPending || checkRunLoading}
          error={checkRunError}
        />

        {/* Targets List */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              Targets
            </h2>
            {targets && (
              <span className="text-sm font-medium text-foreground-muted">
                {targets.length} target{targets.length !== 1 ? "s" : ""}
                {targets.filter((t) => t.active).length > 0 && (
                  <span className="ml-2 text-accent">
                    • {targets.filter((t) => t.active).length} active
                  </span>
                )}
              </span>
            )}
          </div>
          <TargetsList
            targets={targets || []}
            isLoading={targetsLoading}
            error={targetsError}
            highlightedIds={highlightedTargetIds}
          />
        </section>
      </PageShell>
    </div>
  );
}
