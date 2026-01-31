"use client";

import { Award, BarChart3, CheckCircle2, Rocket, Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import MetricHint from "@/components/ui/ai-engine/MetricHint";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  getModelDetails,
  listModels,
  type ModelDetails,
  type ModelSummary,
} from "@/lib/ai-engine/api";

const SCORE_KEYS = ["rsquared_adj", "rsquared", "r2"];

const getScore = (metrics: Record<string, unknown>) => {
  for (const key of SCORE_KEYS) {
    const value = metrics[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
};

const getRmse = (metrics: Record<string, unknown>) => {
  const value = metrics.rmse ?? metrics.RMSE;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Number.POSITIVE_INFINITY;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return new Date(parsed).toLocaleDateString();
};

interface ComparisonInsight {
  bestR2: { modelId: string; score: number };
  fewestFeatures: { modelId: string; count: number } | null;
  mostStable: { modelId: string; rmse: number } | null;
}

export default function ComparePage() {
  const { data: session } = useSession();
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modelDetails, setModelDetails] = useState<
    Record<string, ModelDetails>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const response = await listModels();
        const currentUserId =
          typeof session?.user === "object" &&
          session?.user &&
          "id" in session.user
            ? ((session.user as { id?: string }).id ?? null)
            : null;
        const filtered =
          currentUserId != null
            ? response.filter(
                (model) =>
                  model.user_id === currentUserId || model.user_id == null,
              )
            : response;
        setModels(filtered);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load models";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadModels();
  }, [session?.user]);

  const handleToggleSelection = async (modelId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, modelId];
    });

    if (!modelDetails[modelId]) {
      try {
        const details = await getModelDetails(modelId);
        setModelDetails((prev) => ({ ...prev, [modelId]: details }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load model details";
        setError(message);
      }
    }
  };

  const insights = useMemo<ComparisonInsight | null>(() => {
    if (selectedIds.length < 2) return null;
    const details = selectedIds
      .map((id) => modelDetails[id])
      .filter((detail): detail is ModelDetails => Boolean(detail));
    if (details.length < 2) return null;

    const bestR2 = details.reduce(
      (best, detail) => {
        const score = getScore(detail.metrics);
        if (score > best.score) {
          return { modelId: detail.model_id, score };
        }
        return best;
      },
      { modelId: details[0].model_id, score: getScore(details[0].metrics) },
    );

    const fewestFeatures = details.reduce<{
      modelId: string;
      count: number;
    } | null>((best, detail) => {
      const count = detail.feature_columns.length;
      if (count === 0) return best;
      if (!best || count < best.count) {
        return { modelId: detail.model_id, count };
      }
      return best;
    }, null);

    const mostStable = details.reduce<{
      modelId: string;
      rmse: number;
    } | null>((best, detail) => {
      const rmse = getRmse(detail.metrics);
      if (!Number.isFinite(rmse)) return best;
      if (!best || rmse < best.rmse) {
        return { modelId: detail.model_id, rmse };
      }
      return best;
    }, null);

    return {
      bestR2,
      fewestFeatures,
      mostStable,
    };
  }, [selectedIds, modelDetails]);

  const renderSelectionList = () => {
    if (models.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Text muted style={{ marginBottom: "1rem" }}>
            No models available. Train a model to enable comparisons.
          </Text>
          <Link href="/ai-engine/train" style={{ textDecoration: "none" }}>
            <GradientButton variant="success" asChild>
              <span
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Rocket style={{ width: "16px", height: "16px" }} />
                Start Training
              </span>
            </GradientButton>
          </Link>
        </div>
      );
    }

    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}
      >
        {models.map((model) => {
          const isSelected = selectedIds.includes(model.model_id);
          return (
            <button
              key={model.model_id}
              type="button"
              onClick={() => void handleToggleSelection(model.model_id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                border: `2px solid ${
                  isSelected
                    ? "var(--brand-primary-600)"
                    : "var(--input-border)"
                }`,
                borderRadius: "10px",
                background: isSelected
                  ? "rgba(37, 99, 235, 0.05)"
                  : "var(--card-bg)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(event) => {
                if (!isSelected) {
                  event.currentTarget.style.borderColor =
                    "var(--brand-primary-600)";
                  event.currentTarget.style.background = "var(--hover-bg)";
                }
              }}
              onMouseLeave={(event) => {
                if (!isSelected) {
                  event.currentTarget.style.borderColor = "var(--input-border)";
                  event.currentTarget.style.background = "var(--card-bg)";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <Text style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {model.name}
                  </Text>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <Text muted style={{ fontSize: "0.85rem" }}>
                      {model.model_family}
                    </Text>
                    <Text muted style={{ fontSize: "0.85rem" }}>
                      {formatDate(model.created_at)}
                    </Text>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Text
                  style={{
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    color: "var(--brand-primary-600)",
                  }}
                >
                  R² {getScore(model.metrics).toFixed(3)}
                </Text>
                <Text muted style={{ fontSize: "0.85rem" }}>
                  {model.feature_columns.length} features
                </Text>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderComparisonTable = () => {
    if (selectedIds.length < 2) {
      return null;
    }

    const details = selectedIds
      .map((id) => modelDetails[id])
      .filter((detail): detail is ModelDetails => Boolean(detail));
    if (details.length < selectedIds.length) {
      return null;
    }

    const headers = details.map((detail) => detail.name);

    return (
      <>
        {insights && (
          <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
            <DashboardCard
              icon={<Award className="h-4 w-4" />}
              title={
                <span>
                  Best R²
                  <MetricHint text="Regression metric (higher is better)" />
                </span>
              }
              minHeight="10rem"
              description={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <Text style={{ fontWeight: 600 }}>
                    {modelDetails[insights.bestR2.modelId]?.name ?? "—"}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--success)",
                    }}
                  >
                    R² {insights.bestR2.score.toFixed(3)}
                  </Text>
                </div>
              }
            />

            {insights.fewestFeatures && (
              <DashboardCard
                icon={<Zap className="h-4 w-4" />}
                title="Fewest Features"
                minHeight="10rem"
                description={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <Text style={{ fontWeight: 600 }}>
                      {modelDetails[insights.fewestFeatures.modelId]?.name ??
                        "—"}
                    </Text>
                    <Text style={{ color: "var(--brand-primary-600)" }}>
                      {insights.fewestFeatures.count} features
                    </Text>
                  </div>
                }
              />
            )}

            {insights.mostStable &&
              Number.isFinite(insights.mostStable.rmse) && (
                <DashboardCard
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Most Stable"
                  minHeight="10rem"
                  description={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <Text style={{ fontWeight: 600 }}>
                        {modelDetails[insights.mostStable.modelId]?.name ?? "—"}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--warning)",
                        }}
                      >
                        RMSE {insights.mostStable.rmse.toFixed(3)}
                        <MetricHint text="Lower is better" />
                      </Text>
                    </div>
                  }
                />
              )}
          </div>
        )}

        <DashboardCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Detailed Comparison"
          minHeight="18rem"
          description={
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Adjusted R²</td>
                    {details.map((detail) => {
                      const score = getScore(detail.metrics);
                      const isBest =
                        insights?.bestR2.modelId === detail.model_id;
                      return (
                        <td
                          key={detail.model_id}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            background: isBest
                              ? "rgba(34, 197, 94, 0.1)"
                              : "transparent",
                            color: isBest
                              ? "var(--success)"
                              : "var(--foreground)",
                          }}
                        >
                          {score.toFixed(3)}
                          {isBest && (
                            <span style={{ marginLeft: "0.5rem" }}>★</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>RMSE</td>
                    {details.map((detail) => {
                      const rmse = getRmse(detail.metrics);
                      const isBest =
                        insights?.mostStable?.modelId === detail.model_id &&
                        Number.isFinite(rmse);
                      return (
                        <td
                          key={detail.model_id}
                          style={{
                            fontFamily: "var(--font-mono)",
                            background: isBest
                              ? "rgba(251, 191, 36, 0.1)"
                              : "transparent",
                            color: isBest
                              ? "var(--warning)"
                              : "var(--foreground)",
                          }}
                        >
                          {Number.isFinite(rmse) ? rmse.toFixed(3) : "—"}
                          {isBest && (
                            <span style={{ marginLeft: "0.5rem" }}>★</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Feature Count</td>
                    {details.map((detail) => {
                      const count = detail.feature_columns.length;
                      const isBest =
                        insights?.fewestFeatures?.modelId === detail.model_id;
                      return (
                        <td
                          key={detail.model_id}
                          style={{
                            background: isBest
                              ? "rgba(37, 99, 235, 0.1)"
                              : "transparent",
                            color: isBest
                              ? "var(--brand-primary-600)"
                              : "var(--foreground)",
                          }}
                        >
                          {count}
                          {isBest && (
                            <span style={{ marginLeft: "0.5rem" }}>★</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Target Column</td>
                    {details.map((detail) => (
                      <td key={detail.model_id}>{detail.target_column}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Dataset</td>
                    {details.map((detail) => (
                      <td key={detail.model_id}>
                        {detail.dataset_id
                          ? detail.dataset_id.slice(0, 8)
                          : "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          }
        />
      </>
    );
  };

  if (loading) {
    return (
      <PageContent>
        <AIEnginePageHeader
          title="Model Comparison"
          description="Compare up to 4 trained models side by side."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Model Comparison" },
          ]}
        />
        <div
          className="loading"
          style={{ padding: "2rem", borderRadius: "12px" }}
        >
          Loading model details...
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Model Comparison"
          description="Compare up to 4 trained models side by side."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Model Comparison" },
          ]}
        />

        {error && (
          <div className="error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Rocket className="h-4 w-4" />}
            title="Select Models"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {selectedIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear ({selectedIds.length})
                    </Button>
                  )}
                </div>
                {renderSelectionList()}
                {selectedIds.length >= 4 && (
                  <Text muted style={{ textAlign: "center" }}>
                    Maximum 4 models can be compared at once.
                  </Text>
                )}
              </div>
            }
          />

          <DashboardCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="Comparison Summary"
            minHeight="18rem"
            description={
              selectedIds.length < 2 ? (
                <AIEngineEmptyState
                  title="Select at least two models"
                  description="Pick models from the list to generate a comparison view."
                />
              ) : insights ? (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <Text muted>Models selected: {selectedIds.length}</Text>
                  <Text>
                    Best R²:{" "}
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {insights.bestR2.score.toFixed(3)}
                    </span>
                  </Text>
                  {insights.fewestFeatures && (
                    <Text>
                      Leanest model:{" "}
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {insights.fewestFeatures.count} features
                      </span>
                    </Text>
                  )}
                </div>
              ) : (
                <Text muted>Select models to populate summary insights.</Text>
              )
            }
          />
        </div>

        {renderComparisonTable()}
      </div>
    </PageContent>
  );
}
