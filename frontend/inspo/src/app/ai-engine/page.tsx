"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Rocket,
  Target,
  UploadCloud,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import MetricHint from "@/components/ui/ai-engine/MetricHint";
import {
  ActivityItem,
  DashboardCard,
  KPICard,
} from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down";
}

interface ActivityItemData {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
}

function AIEngineContent() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [activities, setActivities] = useState<ActivityItemData[]>([]);
  const [r2TrendData, setR2TrendData] = useState<number[]>([]);
  const [resourceData, setResourceData] = useState<{
    cpu: number;
    memory: number;
    gpu?: number;
  }>({ cpu: 0, memory: 0, gpu: 0 });

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-engine/dashboard");

      let data: {
        metrics?: MetricCard[];
        recentActivity?: ActivityItemData[];
        accuracyTrend?: number[];
        resourceUsage?: { cpu: number; memory: number; gpu?: number };
      } | null = null;

      if (res.ok) {
        data = await res.json();
      } else {
        console.error("Dashboard API error", res.status);
        data = {
          metrics: [],
          recentActivity: [],
          accuracyTrend: [],
          resourceUsage: { cpu: 0, memory: 0, gpu: 0 },
        };
      }

      const metrics = Array.isArray(data?.metrics) ? data.metrics : [];
      const recentActivity = Array.isArray(data?.recentActivity)
        ? data.recentActivity
        : [];
      const r2Trend = Array.isArray(data?.accuracyTrend)
        ? data.accuracyTrend
        : [];
      const resourceUsage = data?.resourceUsage ?? {
        cpu: 0,
        memory: 0,
        gpu: 0,
      };

      setMetrics(metrics);
      setActivities(recentActivity);
      setR2TrendData(r2Trend);
      setResourceData(resourceUsage);
    } catch (e) {
      console.error("Dashboard fetch error", e);
      setMetrics([]);
      setActivities([]);
      setR2TrendData([]);
      setResourceData({ cpu: 0, memory: 0, gpu: 0 });
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const getMetricIcon = (icon: string) => {
    if (
      icon.includes("target") ||
      icon.includes("🎯") ||
      icon.includes("Accuracy") ||
      icon.includes("R²") ||
      icon.includes("R2")
    ) {
      return <Target className="h-4 w-4" />;
    }
    if (
      icon.includes("database") ||
      icon.includes("💾") ||
      icon.includes("Data")
    ) {
      return <Database className="h-4 w-4" />;
    }
    if (
      icon.includes("chart") ||
      icon.includes("📊") ||
      icon.includes("Predictions")
    ) {
      return <BarChart3 className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getActivityIcon = (icon: string) => {
    if (
      icon.includes("code") ||
      icon.includes("💻") ||
      icon.includes("Deployed")
    ) {
      return <Code2 className="h-4 w-4" />;
    }
    if (
      icon.includes("check") ||
      icon.includes("✅") ||
      icon.includes("Completed")
    ) {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (
      icon.includes("rocket") ||
      icon.includes("🚀") ||
      icon.includes("Launched")
    ) {
      return <Rocket className="h-4 w-4" />;
    }
    return <Zap className="h-4 w-4" />;
  };

  const getMetricSubtext = (title: string, value: string) => {
    const parsed = Number(value);
    const hasValue = Number.isFinite(parsed) && parsed > 0;
    switch (title) {
      case "Total Models":
        return hasValue
          ? "Models ready for predictions"
          : "No models trained yet";
      case "Total Datasets":
        return hasValue ? "Datasets available" : "Upload a dataset to start";
      case "Total Predictions":
        return hasValue ? "Predictions logged" : "No predictions yet";
      case "Active Models":
        return hasValue ? "Models active now" : "No active models";
      default:
        return "Latest snapshot";
    }
  };

  return (
    <div>
      <AIEnginePageHeader
        title="Overview"
        description="Track model activity, datasets, and operational health."
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "AI Engine", href: "/ai-engine" },
          { label: "Overview" },
        ]}
      />

      {/* KPI Cards */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {metrics.map((m) => (
          <KPICard
            key={m.title}
            icon={getMetricIcon(m.icon)}
            title={m.title}
            value={m.value}
            subtext={getMetricSubtext(m.title, m.value)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <DashboardCard
          icon={<Rocket className="h-4 w-4" />}
          title="Quick Actions"
          description={
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/ai-engine/train" style={{ textDecoration: "none" }}>
                <Button variant="primary">
                  <Rocket className="h-4 w-4 mr-2" />
                  Train Model
                </Button>
              </Link>
              <Link
                href="/ai-engine/feature-analysis"
                style={{ textDecoration: "none" }}
              >
                <Button variant="outline">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Feature Analysis
                </Button>
              </Link>
              <Link
                href="/ai-engine/playground"
                style={{ textDecoration: "none" }}
              >
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Playground
                </Button>
              </Link>
            </div>
          }
        />

        {/* Recent Activity */}
        <DashboardCard
          icon={<Activity className="h-4 w-4" />}
          title="Recent Activity"
          description={
            activities.length ? (
              <div style={{ marginTop: "1rem" }}>
                {activities.map((a, index) => (
                  <ActivityItem
                    key={`${a.title}-${a.time}-${index}`}
                    icon={getActivityIcon(a.icon)}
                    title={a.title}
                    description={a.subtitle}
                    meta={a.time}
                  />
                ))}
              </div>
            ) : (
              <AIEngineEmptyState
                title="No recent activity"
                description="Recent training and dataset activity will appear here."
              />
            )
          }
        />
      </div>

      {/* Charts */}
      <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
        <DashboardCard
          icon={<BarChart3 className="h-4 w-4" />}
          title={
            <span>
              R² Trend
              <MetricHint text="Regression metric (higher is better)" />
            </span>
          }
          description={
            r2TrendData.length ? (
              <div style={{ marginTop: "1rem" }}>
                <AccuracyChart data={r2TrendData} />
              </div>
            ) : (
              <AIEngineEmptyState
                title="Not enough history yet"
                description="Trend data will appear after a few training runs."
              />
            )
          }
        />

        <DashboardCard
          icon={<Activity className="h-4 w-4" />}
          title="Resource Usage"
          description={
            resourceData.cpu || resourceData.memory ? (
              <div style={{ marginTop: "1rem" }}>
                <ResourceChart
                  cpu={resourceData.cpu}
                  memory={resourceData.memory}
                />
              </div>
            ) : (
              <AIEngineEmptyState
                title="Monitoring not enabled"
                description="Resource usage appears when monitoring is configured."
              />
            )
          }
        />
      </div>

      {/* ❌ Removed Task 3 completely */}
    </div>
  );
}

export default function AIEnginePage() {
  return (
    <PageContent>
      <Suspense fallback={<AIEngineLoadingFallback />}>
        <AIEngineContent />
      </Suspense>
    </PageContent>
  );
}

function AIEngineLoadingFallback() {
  return (
    <div className="loading" style={{ padding: "2rem", borderRadius: "12px" }}>
      Loading AI Engine...
    </div>
  );
}

function AccuracyChart({ data }: { data: number[] }) {
  if (!data.length) {
    return (
      <div
        style={{
          height: "200px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.5)" }}>
          No data available
        </Text>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);

  return (
    <div>
      <svg
        viewBox="0 0 400 200"
        style={{ width: "100%", height: "200px" }}
        role="img"
        aria-label="Model performance trend"
      >
        <title>Model performance trend</title>
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={i * 50}
            x2="400"
            y2={i * 50}
            stroke="rgba(255,255,255,0.1)"
          />
        ))}

        <polyline
          fill="none"
          stroke="#0070f3"
          strokeWidth="3"
          points={data
            .map((v, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = 200 - ((v - min) / (max - min)) * 180;
              return `${x},${y}`;
            })
            .join(" ")}
        />

        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * 400;
          const y = 200 - ((v - min) / (max - min)) * 180;
          const pointKey = `${v}-${min}-${max}-${data.length}`;
          return <circle key={pointKey} cx={x} cy={y} r="4" fill="#0070f3" />;
        })}
      </svg>

      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
        Performance over time
      </div>
    </div>
  );
}

function ResourceChart({ cpu, memory }: { cpu: number; memory: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const cpuOffset = circumference - (cpu / 100) * circumference;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{ width: "100%", maxWidth: "200px" }}
        role="img"
        aria-label="CPU usage"
      >
        <title>CPU usage</title>
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="15"
          fill="none"
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#0070f3"
          strokeWidth="15"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={cpuOffset}
          transform="rotate(-90 100 100)"
        />

        <text
          x="100"
          y="100"
          textAnchor="middle"
          dy="0.3em"
          fontSize="32"
          fontWeight="bold"
          fill="#ffffff"
        >
          {cpu}%
        </text>
      </svg>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>CPU</Text>
          <Text style={{ fontWeight: 600, color: "#ffffff" }}>{cpu}%</Text>
        </div>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>Memory</Text>
          <Text style={{ fontWeight: 600, color: "#ffffff" }}>{memory}GB</Text>
        </div>
      </div>
    </div>
  );
}
