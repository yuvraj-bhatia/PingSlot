"use client";

import { Bot, Settings, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import MetricHint from "@/components/ui/ai-engine/MetricHint";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";
import {
  type AutoMLTrainingResult,
  type DatasetFieldsResponse,
  type DatasetSummary,
  fetchDatasetFields,
  listDatasets,
  trainAutoMLModel,
} from "@/lib/ai-engine/api";

export default function ModelBuildingPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [datasetsError, setDatasetsError] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [fields, setFields] = useState<DatasetFieldsResponse | null>(null);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [testSize, setTestSize] = useState(20);
  const [cvFolds, setCvFolds] = useState(5);
  const [normalizationMethod, setNormalizationMethod] = useState<
    "none" | "standard" | "minmax"
  >("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoMLTrainingResult | null>(null);
  const [error, setError] = useState("");
  const [automlDisabled, setAutomlDisabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setDatasetsLoading(true);
    setDatasetsError("");

    listDatasets()
      .then((data) => {
        if (!isMounted) return;
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetId((prev) => prev || data[0].dataset_id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setDatasetsError(
          err instanceof Error ? err.message : "Failed to load datasets",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setDatasetsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) {
      setFields(null);
      setTargetColumn("");
      setSelectedFeatures([]);
      return;
    }

    setFieldsLoading(true);
    setFieldsError("");

    fetchDatasetFields(selectedDatasetId)
      .then((data) => {
        setFields(data);
        const numeric = data.fields.filter((field) => field.is_numeric);
        const defaultTarget = numeric[numeric.length - 1]?.name || "";
        setTargetColumn(defaultTarget);
        setSelectedFeatures(
          numeric
            .map((field) => field.name)
            .filter((name) => name && name !== defaultTarget),
        );
      })
      .catch((err) => {
        setFieldsError(
          err instanceof Error ? err.message : "Failed to load dataset fields",
        );
        setFields(null);
        setTargetColumn("");
        setSelectedFeatures([]);
      })
      .finally(() => setFieldsLoading(false));
  }, [selectedDatasetId]);

  const numericFields = useMemo(() => {
    if (!fields) return [];
    return fields.fields
      .filter((field) => field.is_numeric)
      .map((field) => field.name);
  }, [fields]);

  useEffect(() => {
    if (!targetColumn) return;
    setSelectedFeatures((prev) => prev.filter((item) => item !== targetColumn));
  }, [targetColumn]);

  const toggleFeature = (name: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const isFormValid = useMemo(() => {
    return (
      selectedDatasetId &&
      targetColumn &&
      selectedFeatures.length > 0 &&
      !selectedFeatures.includes(targetColumn)
    );
  }, [selectedDatasetId, targetColumn, selectedFeatures]);

  const handleTrain = async () => {
    if (!isFormValid) {
      setError(
        "Select a dataset, pick a target, and choose at least one feature column.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAutomlDisabled(false);

    try {
      const response = await trainAutoMLModel({
        datasetId: selectedDatasetId,
        targetColumn,
        featureList: selectedFeatures,
        testSize: testSize / 100,
        cvFolds,
        normalizationMethod,
      });
      setResult(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "AutoML training failed. Please try again.";
      if (message.toLowerCase().includes("disabled")) {
        setAutomlDisabled(true);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const bestAlgorithm =
    result?.best_algorithm ||
    result?.best_model ||
    result?.model_family ||
    "Not available yet";

  const metrics = result?.metrics;

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Advanced Model Building (AutoML)"
          description="Configure AutoML experiments and review results."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Advanced Model Building" },
          ]}
        />

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Choose Dataset"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label className="field-label" htmlFor="automl-dataset">
                    Dataset
                  </label>
                  <select
                    id="automl-dataset"
                    className="input"
                    value={selectedDatasetId}
                    onChange={(event) =>
                      setSelectedDatasetId(event.target.value)
                    }
                    disabled={datasetsLoading}
                  >
                    <option value="">Select dataset</option>
                    {datasets.map((dataset) => (
                      <option
                        key={dataset.dataset_id}
                        value={dataset.dataset_id}
                      >
                        {dataset.name}
                      </option>
                    ))}
                  </select>
                  {datasetsLoading && (
                    <Text muted style={{ fontSize: "0.8rem" }}>
                      Loading datasets...
                    </Text>
                  )}
                  {datasetsError && (
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(239, 68, 68, 0.9)",
                      }}
                    >
                      {datasetsError}
                    </Text>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label className="field-label" htmlFor="automl-target">
                    Target Column
                  </label>
                  <select
                    id="automl-target"
                    className="input"
                    value={targetColumn}
                    onChange={(event) => setTargetColumn(event.target.value)}
                    disabled={fieldsLoading || numericFields.length === 0}
                  >
                    <option value="">Select target</option>
                    {numericFields.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {fieldsLoading && (
                    <Text muted style={{ fontSize: "0.8rem" }}>
                      Loading dataset fields...
                    </Text>
                  )}
                  {fieldsError && (
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(239, 68, 68, 0.9)",
                      }}
                    >
                      {fieldsError}
                    </Text>
                  )}
                </div>
              </div>
            }
          />

          <DashboardCard
            icon={<Settings className="h-4 w-4" />}
            title="Configure AutoML"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <fieldset
                  style={{
                    border: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <legend className="field-label">Feature Columns</legend>
                  <div
                    style={{
                      maxHeight: "180px",
                      overflowY: "auto",
                      display: "grid",
                      gap: "0.5rem",
                      paddingRight: "0.25rem",
                    }}
                  >
                    {numericFields.length === 0 ? (
                      <Text muted>No numeric columns available yet.</Text>
                    ) : (
                      numericFields.map((column) => {
                        const isTarget = column === targetColumn;
                        return (
                          <label
                            key={column}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              opacity: isTarget ? 0.5 : 1,
                              cursor: isTarget ? "not-allowed" : "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFeatures.includes(column)}
                              disabled={isTarget}
                              onChange={() => toggleFeature(column)}
                            />
                            <span>{column}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </fieldset>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label className="field-label" htmlFor="automl-test-size">
                      Test Size (%)
                    </label>
                    <input
                      id="automl-test-size"
                      className="input"
                      type="number"
                      min={10}
                      max={40}
                      value={testSize}
                      onChange={(event) =>
                        setTestSize(Number(event.target.value))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label className="field-label" htmlFor="automl-cv-folds">
                      CV Folds
                    </label>
                    <input
                      id="automl-cv-folds"
                      className="input"
                      type="number"
                      min={2}
                      max={10}
                      value={cvFolds}
                      onChange={(event) =>
                        setCvFolds(Number(event.target.value))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      className="field-label"
                      htmlFor="automl-normalization"
                    >
                      Normalization
                    </label>
                    <select
                      id="automl-normalization"
                      className="input"
                      value={normalizationMethod}
                      onChange={(event) =>
                        setNormalizationMethod(
                          event.target.value as "none" | "standard" | "minmax",
                        )
                      }
                    >
                      <option value="none">None</option>
                      <option value="standard">Standard</option>
                      <option value="minmax">Min-Max</option>
                    </select>
                  </div>
                </div>

                <Text muted style={{ fontSize: "0.8rem" }}>
                  AutoML orchestration is live; advanced scheduling is coming
                  soon.
                </Text>
              </div>
            }
          />
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <DashboardCard
            icon={<Bot className="h-4 w-4" />}
            title="Run AutoML"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {error && <div className="error">{error}</div>}

                <Button
                  onClick={handleTrain}
                  disabled={loading || !isFormValid}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? "Training AutoML models..." : "Run AutoML"}
                </Button>

                {loading ? (
                  <div className="loading">Training AutoML models...</div>
                ) : automlDisabled ? (
                  <AIEngineEmptyState
                    title="AutoML is temporarily disabled"
                    description="AutoML will be re-enabled once the training service is updated."
                  />
                ) : result ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      <Text style={{ fontWeight: 600 }}>Best Algorithm</Text>
                      <Text style={{ marginTop: "0.25rem" }}>
                        {bestAlgorithm}
                      </Text>
                      <div
                        style={{
                          display: "grid",
                          gap: "0.35rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <Text muted>
                          R²
                          <MetricHint text="Higher is better" />:{" "}
                          {metrics?.r2 !== undefined
                            ? metrics.r2.toFixed(4)
                            : "Not available yet"}
                        </Text>
                        <Text muted>
                          RMSE
                          <MetricHint text="Lower is better" />:{" "}
                          {metrics?.rmse !== undefined
                            ? metrics.rmse.toFixed(4)
                            : "Not available yet"}
                        </Text>
                        <Text muted>
                          MAE
                          <MetricHint text="Lower is better" />:{" "}
                          {metrics?.mae !== undefined
                            ? metrics.mae.toFixed(4)
                            : "Not available yet"}
                        </Text>
                      </div>
                    </div>

                    {result.model_performances?.length ? (
                      <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Algorithm</th>
                              <th>CV Mean</th>
                              <th>CV Std</th>
                              <th>Test R²</th>
                              <th>Test RMSE</th>
                              <th>Test MAE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.model_performances.map((perf) => (
                              <tr key={perf.model_name}>
                                <td>{perf.rank}</td>
                                <td>{perf.model_name}</td>
                                <td>{perf.cv_mean_score.toFixed(4)}</td>
                                <td>{perf.cv_std_score.toFixed(4)}</td>
                                <td>{perf.test_r2.toFixed(4)}</td>
                                <td>{perf.test_rmse.toFixed(4)}</td>
                                <td>{perf.test_mae.toFixed(4)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <AIEngineEmptyState
                        title="No model comparisons available"
                        description="Model performance details will appear here after training."
                      />
                    )}
                  </div>
                ) : (
                  <AIEngineEmptyState
                    title="Run AutoML to see results"
                    description="AutoML results and comparison metrics will show here after training."
                  />
                )}
              </div>
            }
          />
        </div>
      </div>
    </PageContent>
  );
}
