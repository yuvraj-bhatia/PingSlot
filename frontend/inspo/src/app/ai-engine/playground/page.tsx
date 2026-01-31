"use client";

import { Rocket, Sliders, Target } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Heading, Text } from "@/components/ui/form-components";
import {
  fetchDatasetPreview,
  getModelDetails,
  listModels,
  type ModelDetails,
  type ModelSummary,
  makePrediction,
} from "@/lib/ai-engine/api";

interface PreviewStats {
  featureMedians: Record<string, number>;
}

const computePreviewStats = (
  headers: string[],
  rows: Record<string, unknown>[],
): PreviewStats => {
  if (rows.length === 0) return { featureMedians: {} };

  const numericValues: Record<string, number[]> = {};
  headers.forEach((header) => {
    numericValues[header] = [];
  });

  rows.forEach((row) => {
    headers.forEach((header) => {
      const value = row[header];
      const parsed = typeof value === "number" ? value : Number(value);
      if (!Number.isNaN(parsed)) {
        numericValues[header].push(parsed);
      }
    });
  });

  const featureMedians: Record<string, number> = {};
  headers.forEach((header) => {
    const values = numericValues[header];
    if (values && values.length > 0) {
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      featureMedians[header] = median;
    }
  });

  return { featureMedians };
};

const getScore = (metrics: Record<string, number | string | null>): number => {
  return (
    (metrics.rsquared_adj as number) ??
    (metrics.r2 as number) ??
    (metrics.rsquared as number) ??
    0
  );
};

export default function PlaygroundPage() {
  const { data: session } = useSession();
  const sessionUserId = useMemo(() => {
    const user = session?.user;
    if (user && typeof user === "object" && "id" in user) {
      return (user as { id?: string | null }).id ?? undefined;
    }
    return undefined;
  }, [session?.user]);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [modelDetails, setModelDetails] = useState<
    Record<string, ModelDetails>
  >({});
  const [previewStats, setPreviewStats] = useState<
    Record<string, PreviewStats>
  >({});
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [predictionResult, setPredictionResult] = useState<{
    prediction: number;
    ci_low?: number | null;
    ci_high?: number | null;
    target: string;
    latency_ms: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [predicting, setPredicting] = useState<boolean>(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const response = await listModels();
        const currentUserId = sessionUserId;
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
  }, [sessionUserId]);

  const selectedDetails = selectedModelId
    ? modelDetails[selectedModelId]
    : null;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedModelId || modelDetails[selectedModelId]) return;
      try {
        const details = await getModelDetails(selectedModelId);
        setModelDetails((prev) => ({ ...prev, [selectedModelId]: details }));

        let stats: PreviewStats | null = null;
        if (details.dataset_id) {
          const datasetId = details.dataset_id;
          const preview = await fetchDatasetPreview(datasetId, 20);
          const headers = Object.keys(preview.head[0] || {});
          const computedStats = computePreviewStats(headers, preview.head);
          stats = computedStats;
          setPreviewStats((prev) => ({
            ...prev,
            [datasetId]: computedStats,
          }));
        }

        const featureInputs: Record<string, string> = {};
        details.feature_columns.forEach((feature) => {
          const defaultValue = stats?.featureMedians[feature];
          featureInputs[feature] =
            defaultValue !== undefined ? String(defaultValue) : "";
        });
        setInputValues(featureInputs);
        setPredictionResult(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load model details";
        setError(message);
      }
    };

    void fetchDetails();
  }, [selectedModelId, modelDetails]);

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleUseExampleInputs = () => {
    if (!selectedDetails) return;
    const datasetId = selectedDetails.dataset_id;
    const stats = datasetId ? previewStats[datasetId] : undefined;

    const newInputs: Record<string, string> = {};
    selectedDetails.feature_columns.forEach((feature) => {
      if (stats?.featureMedians[feature] !== undefined) {
        newInputs[feature] = stats.featureMedians[feature].toString();
      } else {
        newInputs[feature] = "0";
      }
    });
    setInputValues(newInputs);
  };

  const isReadyToPredict = useMemo(() => {
    if (!selectedDetails) return false;
    return selectedDetails.feature_columns.every(
      (feature) =>
        inputValues[feature] !== undefined && inputValues[feature] !== "",
    );
  }, [selectedDetails, inputValues]);

  const handlePredict = async () => {
    if (!selectedDetails || !isReadyToPredict) return;

    setPredicting(true);
    setError("");
    setPredictionResult(null);

    try {
      const numericInputs: Record<string, number> = {};
      for (const feature of selectedDetails.feature_columns) {
        const value = Number(inputValues[feature]);
        if (Number.isNaN(value)) {
          throw new Error(`Invalid value for ${feature}`);
        }
        numericInputs[feature] = value;
      }

      const response = await makePrediction({
        modelId: selectedDetails.model_id,
        inputFeatures: numericInputs,
        userId: sessionUserId ?? undefined,
      });

      setPredictionResult({
        prediction: response.prediction,
        ci_low: response.ci_low ?? null,
        ci_high: response.ci_high ?? null,
        target: response.target_column,
        latency_ms: response.latency_ms,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prediction failed";
      setError(message);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <PageContent>
        <AIEnginePageHeader
          title="Prediction Playground"
          description="Run single predictions against your trained models."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Prediction Playground" },
          ]}
        />
        <div
          className="loading"
          style={{ padding: "2rem", borderRadius: "12px" }}
        >
          Loading models...
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Prediction Playground"
          description="Run single predictions against your trained models."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Prediction Playground" },
          ]}
        />

        {error && (
          <div className="error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Sliders className="h-4 w-4" />}
            title="Model Inputs"
            minHeight="18rem"
            description={
              models.length === 0 ? (
                <AIEngineEmptyState
                  title="No trained models available"
                  description="Train a model to unlock the prediction playground."
                  action={
                    <Link
                      href="/ai-engine/train"
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="primary" size="sm">
                        <Rocket style={{ width: "16px", height: "16px" }} />
                        Train a Model
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label className="field-label" htmlFor="playground-model">
                      Select Model
                    </label>
                    <select
                      id="playground-model"
                      value={selectedModelId}
                      onChange={(event) =>
                        handleSelectModel(event.target.value)
                      }
                      className="input"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <option value="">-- Choose a trained model --</option>
                      {models.map((model) => (
                        <option key={model.model_id} value={model.model_id}>
                          {model.name} • {model.model_family} • R²{" "}
                          {getScore(model.metrics).toFixed(3)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedModelId && !selectedDetails && (
                    <Text muted>Loading model details…</Text>
                  )}

                  {selectedDetails ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <Heading
                          level={4}
                          style={{
                            color: "var(--brand-primary-600)",
                            marginBottom: "0",
                          }}
                        >
                          Input Features
                        </Heading>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUseExampleInputs}
                        >
                          Use Example Inputs
                        </Button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        {selectedDetails.feature_columns.map((feature) => (
                          <div key={feature}>
                            <label
                              className="field-label"
                              htmlFor={`feature-input-${feature}`}
                            >
                              {feature}
                            </label>
                            <input
                              id={`feature-input-${feature}`}
                              type="number"
                              step="any"
                              value={inputValues[feature] ?? ""}
                              onChange={(event) =>
                                setInputValues((prev) => ({
                                  ...prev,
                                  [feature]: event.target.value,
                                }))
                              }
                              placeholder="Enter value"
                              className="input"
                              style={{ marginTop: "0.5rem" }}
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={handlePredict}
                        disabled={!isReadyToPredict || predicting}
                      >
                        {predicting ? "Predicting..." : "Predict"}
                      </Button>
                    </>
                  ) : (
                    <AIEngineEmptyState
                      title="Select a model to begin"
                      description="Choose a trained model to load input features."
                    />
                  )}
                </div>
              )
            }
          />

          <DashboardCard
            icon={<Target className="h-4 w-4" />}
            title="Prediction Output"
            minHeight="18rem"
            description={
              predictionResult ? (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <Text muted>Point estimate</Text>
                    <Heading level={3} style={{ marginTop: "0.25rem" }}>
                      {predictionResult.prediction.toFixed(3)}
                    </Heading>
                  </div>

                  {predictionResult.ci_low !== null &&
                  predictionResult.ci_low !== undefined &&
                  predictionResult.ci_high !== null &&
                  predictionResult.ci_high !== undefined ? (
                    <div>
                      <Text muted>95% range</Text>
                      <Text style={{ fontFamily: "var(--font-mono)" }}>
                        {predictionResult.ci_low.toFixed(3)} –{" "}
                        {predictionResult.ci_high.toFixed(3)}
                      </Text>
                      <div
                        style={{
                          marginTop: "0.75rem",
                          position: "relative",
                          height: "12px",
                          background: "rgba(255, 255, 255, 0.08)",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.2))",
                          }}
                        />
                        {(() => {
                          const span =
                            predictionResult.ci_high - predictionResult.ci_low;
                          const pos =
                            span > 0
                              ? ((predictionResult.prediction -
                                  predictionResult.ci_low) /
                                  span) *
                                100
                              : 50;
                          const clamped = Math.max(0, Math.min(100, pos));
                          return (
                            <div
                              style={{
                                position: "absolute",
                                left: `${clamped}%`,
                                top: "-4px",
                                width: "2px",
                                height: "20px",
                                background: "var(--brand-primary-600)",
                                boxShadow: "0 0 6px rgba(59, 130, 246, 0.8)",
                              }}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <Text muted>95% CI not available for this model.</Text>
                  )}

                  <Text muted>
                    Target: {predictionResult.target} • Latency:{" "}
                    {predictionResult.latency_ms.toFixed(1)} ms
                  </Text>
                </div>
              ) : (
                <AIEngineEmptyState
                  title="Run a prediction"
                  description={
                    selectedModelId
                      ? "Enter feature values and click Predict to see results."
                      : "Select a model to generate a prediction."
                  }
                />
              )
            }
          />
        </div>
      </div>
    </PageContent>
  );
}
