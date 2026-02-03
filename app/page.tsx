"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Target, Clock, Bell, Zap, TrendingUp } from "lucide-react";
import { PageShell, PageHeader, DashboardGrid, SectionHeading } from "../components/PageShell";
import { TargetsList } from "../components/TargetsList";
import { AddTargetDrawer } from "../components/AddTargetDrawer";
import { CheckNowButton } from "../components/CheckNowButton";
import { RunSummary } from "../components/RunSummary";
import { KPICard, Card, CardContent } from "../components/ui/Card";
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

  // Compute stats
  const stats = {
    totalTargets: targets?.length ?? 0,
    activeTargets: targets?.filter(t => t.status === "available").length ?? 0,
    unavailable: targets?.filter(t => t.status === "unavailable").length ?? 0,
    lastChecked: targets?.[0]?.lastCheckedAt ?? null,
  };

  return (
    <motion.div 
      className="min-h-[calc(100vh-8rem)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <PageHeader>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 border border-[rgba(0,212,255,0.35)] bg-[rgba(0,212,255,0.1)]" style={{ boxShadow: "0 0 25px rgba(0, 212, 255, 0.15)" }}>
              <Activity className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-sm font-bold text-[#00D4FF]">Dashboard</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Appointment Monitor
            </h1>
            <p className="max-w-xl text-base text-foreground-muted sm:text-lg">
              Track appointment availability across all your targets. Get instant alerts when slots open up.
            </p>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AddTargetDrawer onSuccess={() => refetchTargets()} />
            <CheckNowButton
              onClick={handleCheckNow}
              isLoading={startCheckRun.isPending || checkRunLoading}
              disabled={!targets || targets.length === 0}
            />
          </motion.div>
        </div>
      </PageHeader>

      <PageShell className="space-y-10 pb-16">
        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DashboardGrid columns={4}>
            <KPICard
              icon={<Target className="h-5 w-5" />}
              title="Total Targets"
              value={stats.totalTargets}
              subtext={stats.totalTargets > 0 ? "Being monitored" : "Add a target to start"}
            />
            <KPICard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Available"
              value={stats.activeTargets}
              subtext={stats.activeTargets > 0 ? "Slots open now" : "No open slots"}
              trend={stats.activeTargets > 0 ? "up" : "neutral"}
            />
            <KPICard
              icon={<Clock className="h-5 w-5" />}
              title="Unavailable"
              value={stats.unavailable}
              subtext="No slots available"
            />
            <KPICard
              icon={<Bell className="h-5 w-5" />}
              title="Last Check"
              value={stats.lastChecked ? formatTimeAgo(stats.lastChecked) : "—"}
              subtext={stats.lastChecked ? "Automatic check" : "Never checked"}
            />
          </DashboardGrid>
        </motion.section>

        {/* Run Summary - Only show when active */}
        {(checkRun || startCheckRun.isPending || checkRunLoading) && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <RunSummary
              run={checkRun || null}
              isLoading={startCheckRun.isPending || checkRunLoading}
              error={checkRunError}
            />
          </motion.section>
        )}

        {/* Targets List */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionHeading
            title="Monitoring Targets"
            description="All endpoints being monitored for availability"
            action={
              targets && targets.length > 0 && (
                <span className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-[rgba(0,87,184,0.3)] bg-[rgba(0,87,184,0.1)]" style={{ color: "#0066CC" }}>
                  <Zap className="h-4 w-4" />
                  {targets.length} target{targets.length !== 1 ? "s" : ""}
                </span>
              )
            }
          />
          <TargetsList
            targets={targets || []}
            isLoading={targetsLoading}
            error={targetsError}
            highlightedIds={highlightedTargetIds}
          />
        </motion.section>

        {/* Quick Tips Card - Show when no targets */}
        {!targetsLoading && (!targets || targets.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="glass" className="p-8">
              <CardContent className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]" style={{ boxShadow: "0 0 35px rgba(0, 212, 255, 0.2)" }}>
                  <Target className="h-8 w-8 text-[#00D4FF]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#F8F4F0]">
                    Get Started with PingSlot
                  </h3>
                  <p className="max-w-md mx-auto text-[#888888]">
                    Add your first monitoring target to start tracking appointment availability. 
                    You&apos;ll receive alerts as soon as slots become available.
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                  <AddTargetDrawer onSuccess={() => refetchTargets()} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </PageShell>
    </motion.div>
  );
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
