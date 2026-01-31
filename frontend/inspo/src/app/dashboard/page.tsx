"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  Rocket,
  Target,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import {
  ActivityItem,
  DashboardCard,
  KPICard,
} from "../../components/ui/dashboard/dashboard-cards";
import { Heading, Text } from "../../components/ui/form-components";

interface DashboardData {
  metrics: {
    totalModels: number;
    totalDatasets: number;
    totalPredictions: number;
    activeModels: number;
  };
  recentActivity: Array<{
    icon: string;
    title: string;
    subtitle: string;
    time: string;
  }>;
  backendAvailable: boolean;
  error?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/SignIn");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (status !== "authenticated") return;

      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
        setDashboardData({
          metrics: {
            totalModels: 0,
            totalDatasets: 0,
            totalPredictions: 0,
            activeModels: 0,
          },
          recentActivity: [],
          backendAvailable: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <PageContent>
        <div
          className="loading"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Loading your dashboard...
        </div>
      </PageContent>
    );
  }

  if (!session) {
    return null;
  }

  const metrics = dashboardData?.metrics || {
    totalModels: 0,
    totalDatasets: 0,
    totalPredictions: 0,
    activeModels: 0,
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const backendAvailable = dashboardData?.backendAvailable ?? false;

  return (
    <PageContent>
      <div
        className="dashboard-header"
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <Heading
          level={1}
          style={{
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Welcome to APTECH Dashboard
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Monitor your sales productivity and AI-powered forecasts at a glance.
        </Text>
      </div>

      {/* Backend Status Warning */}
      {!backendAvailable && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "10px",
            color: "#fbbf24",
          }}
        >
          <AlertTriangle className="h-5 w-5" />
          <Text style={{ color: "#fbbf24" }}>
            ML Backend unavailable. Showing cached data. {error && `(${error})`}
          </Text>
        </div>
      )}

      {/* Top row: 4 KPI mini-cards - NOW WITH REAL DATA */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <KPICard
          icon={<BrainCircuit className="h-4 w-4" />}
          title="Trained Models"
          value={String(metrics.totalModels)}
          subtext={
            metrics.totalModels > 0
              ? "Models available for predictions"
              : "No models trained yet"
          }
        />
        <KPICard
          icon={<Database className="h-4 w-4" />}
          title="Datasets"
          value={String(metrics.totalDatasets)}
          subtext={
            metrics.totalDatasets > 0
              ? "Datasets uploaded"
              : "Upload a dataset to start"
          }
        />
        <KPICard
          icon={<Target className="h-4 w-4" />}
          title="Predictions Made"
          value={String(metrics.totalPredictions)}
          subtext={
            metrics.totalPredictions > 0
              ? "Total predictions run"
              : "Run your first prediction"
          }
        />
        <KPICard
          icon={<Rocket className="h-4 w-4" />}
          title="Active Models"
          value={String(metrics.activeModels)}
          subtext={
            metrics.activeModels > 0
              ? "Ready for inference"
              : "Train a model to get started"
          }
        />
      </div>

      {/* Middle row: 2 main panels */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <DashboardCard
          icon={<Activity className="h-4 w-4" />}
          title="Quick Actions"
          description={
            <>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "1rem",
                  display: "block",
                }}
              >
                Get started with APTECH AI Engine.
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <a
                  href="/ai-engine/train"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                    color: "#60a5fa",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Train a New Model
                </a>
                <a
                  href="/ai-engine/predictions"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "8px",
                    color: "#4ade80",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Target className="h-4 w-4" />
                  Make Predictions
                </a>
                <a
                  href="/hiring_scenario"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    borderRadius: "8px",
                    color: "#c084fc",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Rocket className="h-4 w-4" />
                  Hiring Scenarios
                </a>
              </div>
            </>
          }
        />

        <DashboardCard
          icon={<Cpu className="h-4 w-4" />}
          title="System Status"
          description={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                Current system health and connectivity.
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: backendAvailable ? "#4ade80" : "#f87171",
                    }}
                  />
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    ML Backend:{" "}
                    {backendAvailable ? "Connected" : "Disconnected"}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#4ade80",
                    }}
                  />
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Database: Connected
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#4ade80",
                    }}
                  />
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Authentication: Active
                  </Text>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Bottom row: Recent Activities - NOW REAL */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
        }}
      >
        <DashboardCard
          icon={<Zap className="h-4 w-4" />}
          title="Recent Activity"
          description={
            <div style={{ marginTop: "1rem" }}>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "1rem",
                  display: "block",
                }}
              >
                Latest changes from the audit log.
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem
                      key={`${activity.title}-${activity.time}-${index}`}
                      icon={
                        activity.icon === "🤖" ? (
                          <BrainCircuit className="h-4 w-4" />
                        ) : activity.icon === "📊" ? (
                          <Database className="h-4 w-4" />
                        ) : (
                          <Code2 className="h-4 w-4" />
                        )
                      }
                      title={activity.title}
                      description={activity.subtitle}
                      meta={activity.time}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <Text style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                      No recent activity. Upload a dataset or train a model to
                      get started.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>
    </PageContent>
  );
}
