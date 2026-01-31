"use client";

import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FolderKanban,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import {
  getModelDetails,
  listModels,
  type ModelDetails,
  type ModelSummary,
} from "@/lib/ai-engine/api";
import {
  ActivityItem,
  DashboardCard,
  KPICard,
} from "../../components/ui/dashboard/dashboard-cards";
import { Heading, Text } from "../../components/ui/form-components";

export const dynamic = "force-dynamic";

const SCORE_KEYS = ["rsquared_adj", "rsquared", "r2"];

const getModelScore = (metrics: Record<string, unknown>): number => {
  for (const key of SCORE_KEYS) {
    const value = metrics[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
};

// Helper to extract regression metrics
const getModelMetrics = (model: ModelSummary, details?: ModelDetails) => {
  const metrics = details?.metrics ?? model.metrics;

  // R² (coefficient of determination) - higher is better
  const r2 = getModelScore(model.metrics);

  // RMSE (Root Mean Squared Error) - lower is better
  const rmse =
    typeof metrics.rmse === "number"
      ? metrics.rmse
      : typeof metrics.rmse === "string"
        ? parseFloat(metrics.rmse) || null
        : null;

  // MAE (Mean Absolute Error) - lower is better
  const mae =
    typeof metrics.mae === "number"
      ? metrics.mae
      : typeof metrics.mae === "string"
        ? parseFloat(metrics.mae) || null
        : null;

  return {
    r2: r2 || 0,
    rmse,
    mae,
  };
};

export default function AnalyticsPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [modelDetails, setModelDetails] = useState<
    Record<string, ModelDetails>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const modelsList = await listModels();
        setModels(modelsList);

        // Fetch details for all models
        const detailsPromises = modelsList.map(async (model) => {
          try {
            const details = await getModelDetails(model.model_id);
            return { modelId: model.model_id, details };
          } catch {
            return null;
          }
        });

        const detailsResults = await Promise.all(detailsPromises);
        const detailsMap: Record<string, ModelDetails> = {};
        detailsResults.forEach((result) => {
          if (result) {
            detailsMap[result.modelId] = result.details;
          }
        });
        setModelDetails(detailsMap);
      } catch (err) {
        console.error("Failed to load models", err);
        const message =
          err instanceof Error ? err.message : "Failed to load models";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  // Calculate regression metrics
  const totalModels = models.length;
  const modelFamilies = new Set(models.map((m) => m.model_family)).size;

  let totalR2 = 0;
  let rmseSum = 0;
  let rmseCount = 0;
  let maeSum = 0;
  let maeCount = 0;

  models.forEach((model) => {
    const details = modelDetails[model.model_id];
    const metrics = getModelMetrics(model, details);
    totalR2 += metrics.r2;
    if (metrics.rmse !== null) {
      rmseSum += metrics.rmse;
      rmseCount++;
    }
    if (metrics.mae !== null) {
      maeSum += metrics.mae;
      maeCount++;
    }
  });

  const avgR2 = totalModels > 0 ? (totalR2 / totalModels) * 100 : 0;
  const avgRmse = rmseCount > 0 ? rmseSum / rmseCount : null;
  const avgMae = maeCount > 0 ? maeSum / maeCount : null;

  const activeProjects = loading ? "..." : String(totalModels);
  const modelsUsed = loading ? "..." : String(modelFamilies);
  const avgRmseDisplay = loading
    ? "..."
    : avgRmse !== null
      ? avgRmse.toFixed(2)
      : "N/A";
  const r2Rate = loading ? "..." : `${avgR2.toFixed(1)}%`;
  const r2Subtext = loading
    ? "Loading models..."
    : `Average across ${totalModels} models`;
  const rmseSubtext = loading
    ? "Loading..."
    : avgMae !== null
      ? `MAE: ${avgMae.toFixed(2)}`
      : "MAE: N/A";

  return (
    <PageContent>
      {/* Header */}
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
          Analytics Overview
        </Heading>

        {error && (
          <p
            style={{
              marginTop: "0.75rem",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            Failed to load analytics: {error}
          </p>
        )}
      </div>

      {/* Top row: 4 KPI mini-cards */}
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
          icon={<FolderKanban className="h-4 w-4" />}
          title="Active Projects"
          value={activeProjects}
          subtext={
            loading
              ? "Loading from API..."
              : "Total trained / configured models"
          }
        />
        <KPICard
          icon={<BrainCircuit className="h-4 w-4" />}
          title="AI Models Used"
          value={modelsUsed}
          subtext={
            loading ? "Loading from API..." : "Distinct model families in use"
          }
        />
        <KPICard
          icon={<Timer className="h-4 w-4" />}
          title="Avg RMSE"
          value={avgRmseDisplay}
          subtext={rmseSubtext}
        />
        <KPICard
          icon={<Target className="h-4 w-4" />}
          title="Average R²"
          value={r2Rate}
          subtext={r2Subtext}
        />
      </div>

      {/* Middle row: 2 main panels (temporarily disabled) */}
      {/*
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
          title="Performance Overview"
          description={
            <div
              style={{
                flexGrow: 1,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.5)",
                marginTop: "0.5rem",
              }}
            >
              [Performance Chart Placeholder]
            </div>
          }
        />

        <DashboardCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Resource Usage"
          description={
            <div
              style={{
                flexGrow: 1,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.5)",
                marginTop: "0.5rem",
              }}
            >
              [Resource Chart Placeholder]
            </div>
          }
        />
      </div>
      */}

      {/* Bottom row: Model Performance Table */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
          marginBottom: "2rem",
        }}
      >
        <DashboardCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Model Performance Summary"
          description={
            <div style={{ marginTop: "1rem" }}>
              {loading ? (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  Loading models...
                </Text>
              ) : models.length === 0 ? (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  No models available. Train a model to see analytics.
                </Text>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Model Name
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Family
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                          title="Coefficient of determination (higher is better)"
                        >
                          R²
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                          title="Root Mean Squared Error (lower is better)"
                        >
                          RMSE
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                          title="Mean Absolute Error (lower is better)"
                        >
                          MAE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model) => {
                        const details = modelDetails[model.model_id];
                        const metrics = getModelMetrics(model, details);
                        return (
                          <tr
                            key={model.model_id}
                            style={{
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <td style={{ padding: "0.75rem", fontWeight: 600 }}>
                              {model.name}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                color: "rgba(255, 255, 255, 0.7)",
                              }}
                            >
                              {model.model_family}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                fontFamily: "var(--font-mono)",
                                fontWeight: 600,
                                color:
                                  metrics.r2 > 0.8
                                    ? "#4ade80"
                                    : metrics.r2 > 0.6
                                      ? "#fbbf24"
                                      : "#f87171",
                              }}
                            >
                              {(metrics.r2 * 100).toFixed(1)}%
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {metrics.rmse !== null
                                ? metrics.rmse.toFixed(3)
                                : "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {metrics.mae !== null
                                ? metrics.mae.toFixed(3)
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Recent Activities */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
        }}
      >
        <DashboardCard
          icon={<Zap className="h-4 w-4" />}
          title="Recent Activities"
          description={
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <ActivityItem
                  icon={<Code2 className="h-4 w-4" />}
                  title="New Model Deployed"
                  description="Sentiment Analysis v2.0 deployed successfully"
                  meta="2h ago"
                />
                <ActivityItem
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Processing Completed"
                  description="Batch of 1000 images completed"
                  meta="5h ago"
                />
                <ActivityItem
                  icon={<Zap className="h-4 w-4" />}
                  title="Performance Optimization"
                  description="System performance improved by 15%"
                  meta="1d ago"
                />
              </div>
            </div>
          }
        />
      </div>
    </PageContent>
  );
}
