"use client";

import { BarChart3, CheckCircle2, Info, Sliders, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Heading, Text } from "@/components/ui/form-components";
import {
  type DatasetUploadResponse,
  fetchDatasetFields,
  fetchDatasetPreview,
  loadSampleDataset,
  type TrainOLSResponse,
  trainOLSModel,
  uploadDataset,
} from "@/lib/ai-engine/api";

interface ParsedData {
  headers: string[];
  rows: string[][];
}

interface FieldInfo {
  name: string;
  type: string;
  is_numeric: boolean;
}

const PREVIEW_ROW_COUNT = 8;
const DEFAULT_P_VALUE = 0.05;
const MDA3_PRESET = {
  targetColumn: "Weekly_Sales",
  featureColumns: [
    "Product_Knowledge",
    "Personality",
    "Staff_Space_Ratio",
    "Confidence",
  ],
};

export default function FeatureAnalysisPage() {
  const { data: session } = useSession();
  const sessionUserId = useMemo(() => {
    const user = session?.user;
    if (user && typeof user === "object" && "id" in user) {
      return (user as { id?: string | null }).id ?? undefined;
    }
    return undefined;
  }, [session?.user]);

  const [datasetId, setDatasetId] = useState<string>("");
  const [datasetName, setDatasetName] = useState<string>("");
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [testSize, setTestSize] = useState<number>(20);
  const [pValueThreshold, setPValueThreshold] =
    useState<number>(DEFAULT_P_VALUE);
  const [maxFeatures, setMaxFeatures] = useState<number>(10);
  const [uploading, setUploading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<TrainOLSResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const numericFields = useMemo(
    () => fields.filter((field) => field.is_numeric).map((field) => field.name),
    [fields],
  );

  useEffect(() => {
    if (parsedData) {
      setMaxFeatures(Math.min(10, parsedData.headers.length));
    }
  }, [parsedData]);

  const initializeDataset = async (
    uploadResponse: DatasetUploadResponse,
    preset?: { targetColumn: string; featureColumns: string[] },
  ) => {
    setDatasetId(uploadResponse.dataset_id);
    setDatasetName(uploadResponse.name || "Sample Dataset");

    // 🔐 Remember the last dataset for Task 3 (so the dashboard card can use it)
    if (typeof window !== "undefined" && uploadResponse.dataset_id) {
      window.localStorage.setItem(
        "aiEngine:lastDatasetId",
        uploadResponse.dataset_id,
      );
    }

    const [fieldsResponse, previewResponse] = await Promise.all([
      fetchDatasetFields(uploadResponse.dataset_id),
      fetchDatasetPreview(uploadResponse.dataset_id, PREVIEW_ROW_COUNT),
    ]);

    setFields(fieldsResponse.fields);

    const headers =
      uploadResponse.schema.columns.length > 0
        ? uploadResponse.schema.columns
        : Object.keys(previewResponse.head[0] || {});

    const previewRows = previewResponse.head.map((row) =>
      headers.map((header) =>
        row[header] !== undefined && row[header] !== null
          ? String(row[header])
          : "",
      ),
    );

    setParsedData({ headers, rows: previewRows });

    const numericColumnNames = fieldsResponse.fields
      .filter((field) => field.is_numeric)
      .map((field) => field.name);

    const defaultTarget =
      numericColumnNames[numericColumnNames.length - 1] ||
      headers[headers.length - 1] ||
      "";

    let nextTarget = defaultTarget;
    let nextFeatures = numericColumnNames.filter(
      (column) => column !== defaultTarget,
    );

    if (preset) {
      const available = new Set(
        fieldsResponse.fields.map((field) => field.name),
      );
      const presetTarget = available.has(preset.targetColumn)
        ? preset.targetColumn
        : defaultTarget;
      const presetFeatures = preset.featureColumns.filter(
        (column) => available.has(column) && column !== presetTarget,
      );

      nextTarget = presetTarget;
      if (presetFeatures.length > 0) {
        nextFeatures = presetFeatures;
      }
    }

    setTargetColumn(nextTarget);
    setSelectedFeatures(nextFeatures);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setShowSuccess(false);
    setUploading(true);

    try {
      const response = await uploadDataset(file, {
        name: file.name,
        userId: sessionUserId ?? undefined,
      });

      await initializeDataset(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload dataset";
      setError(message);
      setDatasetId("");
      setDatasetName("");
      setFields([]);
      setParsedData(null);
      setSelectedFeatures([]);
      setTargetColumn("");
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setError("");
    setResult(null);
    setShowSuccess(false);
    setUploading(true);

    try {
      const response = await loadSampleDataset("mda3-sales");
      await initializeDataset(response, MDA3_PRESET);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load sample dataset";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const toggleFeature = (column: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(column)
        ? prev.filter((feature) => feature !== column)
        : [...prev, column],
    );
  };

  const estimatedModelCount = useMemo(() => {
    const candidateCount = selectedFeatures.length;
    if (candidateCount === 0) return 0;
    const capped = Math.min(candidateCount, maxFeatures);
    return 2 ** capped - 1;
  }, [selectedFeatures, maxFeatures]);

  const timeEstimate = useMemo(() => {
    if (estimatedModelCount < 1000) return "instant";
    if (estimatedModelCount < 5000) return "a few seconds";
    return "several minutes";
  }, [estimatedModelCount]);

  const isFormValid = useMemo(() => {
    return (
      datasetId &&
      selectedFeatures.length > 0 &&
      targetColumn.length > 0 &&
      !selectedFeatures.includes(targetColumn)
    );
  }, [datasetId, selectedFeatures, targetColumn]);

  const handleRunAnalysis = async () => {
    if (!isFormValid) {
      setError(
        "Please upload a dataset, select feature columns, and choose a valid target column.",
      );
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);
    setShowSuccess(false);

    try {
      const response = await trainOLSModel({
        datasetId,
        targetColumn,
        featureColumns: selectedFeatures,
        userId: sessionUserId ?? undefined,
        testSize: testSize / 100,
        pValueThreshold,
        maxFeatures,
      });

      setResult(response);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // 🔐 Remember the last trained model for Task 3 (if backend returns model_id)
      if (
        typeof window !== "undefined" &&
        typeof response.model_id === "string"
      ) {
        window.localStorage.setItem("aiEngine:lastModelId", response.model_id);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const featureOverview = useMemo(() => {
    if (!result) return null;
    const candidateCount =
      result.candidate_features?.length ?? result.feature_columns.length;
    const totalModels = result.total_models_evaluated ?? 0;
    return {
      candidateCount,
      selectedCount: result.feature_columns.length,
      totalModels,
      strongPredictors: result.strong_predictors ?? [],
      totalPossible: result.total_possible_models ?? 0,
    };
  }, [result]);

  const coefficientEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.coefficients)
      .filter(([name]) => name !== "const")
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [result]);

  const reasoning = result?.reasoning ?? [];

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Feature Analysis"
          description="Identify the best feature combinations using exhaustive OLS search."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Feature Analysis" },
          ]}
        />

        {error && (
          <div className="error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {showSuccess && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "var(--success)",
              marginBottom: "1.5rem",
            }}
          >
            <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            <span style={{ fontWeight: 600 }}>Analysis complete</span>
          </div>
        )}

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Upload className="h-4 w-4" />}
            title="Upload Dataset"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="input"
                  disabled={uploading || analyzing}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSample}
                  disabled={uploading || analyzing}
                >
                  Use Sample Data – Sales Productivity
                </Button>
                {datasetName && (
                  <Text muted>
                    Dataset: <strong>{datasetName}</strong>
                  </Text>
                )}
                {parsedData && (
                  <div>
                    <Text muted style={{ marginBottom: "0.75rem" }}>
                      Preview (first {PREVIEW_ROW_COUNT} rows)
                    </Text>
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            {parsedData.headers.map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.rows.map((row) => {
                            const rowKey = row.join("|");
                            return (
                              <tr key={rowKey}>
                                {row.map((cell, cellIndex) => {
                                  const header =
                                    parsedData.headers[cellIndex] ?? "column";
                                  return (
                                    <td key={`${rowKey}-${header}`}>{cell}</td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            }
          />

          <DashboardCard
            icon={<Sliders className="h-4 w-4" />}
            title="Configure Analysis"
            minHeight="18rem"
            description={
              !parsedData ? (
                <AIEngineEmptyState
                  title="Upload a dataset to configure analysis"
                  description="Once data is loaded, select candidate features and target columns."
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                      <legend className="field-label">
                        Candidate Features
                      </legend>
                      <div
                        style={{
                          maxHeight: "220px",
                          overflowY: "auto",
                          border: "1px solid var(--input-border)",
                          borderRadius: "10px",
                          padding: "0.75rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {fields.map((field) => {
                          const isDisabled =
                            !field.is_numeric || field.name === targetColumn;
                          return (
                            <label
                              key={field.name}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                                borderRadius: "6px",
                                transition: "background 0.2s ease",
                              }}
                              onMouseEnter={(event) => {
                                if (!isDisabled) {
                                  event.currentTarget.style.background =
                                    "var(--hover-bg)";
                                }
                              }}
                              onMouseLeave={(event) => {
                                event.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <input
                                type="checkbox"
                                disabled={isDisabled}
                                checked={selectedFeatures.includes(field.name)}
                                onChange={() => toggleFeature(field.name)}
                                style={{
                                  cursor: isDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              />
                              <span style={{ fontSize: "0.9rem" }}>
                                {field.name}
                                {!field.is_numeric && (
                                  <span
                                    style={{ color: "var(--muted-foreground)" }}
                                  >
                                    {" "}
                                    (non-numeric)
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div>
                      <label
                        className="field-label"
                        htmlFor="feature-analysis-target"
                      >
                        Target Column
                      </label>
                      <select
                        id="feature-analysis-target"
                        value={targetColumn}
                        onChange={(event) =>
                          setTargetColumn(event.target.value)
                        }
                        className="input"
                        style={{ marginTop: "0.5rem" }}
                      >
                        <option value="">-- Select Target --</option>
                        {numericFields.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                      <Text
                        muted
                        style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
                      >
                        Only numeric columns can be used as the target.
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label
                        className="field-label"
                        htmlFor="feature-analysis-test-size"
                      >
                        Test Size: {testSize}%
                      </label>
                      <input
                        id="feature-analysis-test-size"
                        type="range"
                        min="10"
                        max="40"
                        value={testSize}
                        onChange={(event) =>
                          setTestSize(Number(event.target.value))
                        }
                        style={{ width: "100%", marginTop: "0.5rem" }}
                      />
                      <Text
                        muted
                        style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
                      >
                        Controls the hold-out fraction for evaluation.
                      </Text>
                    </div>

                    <div>
                      <label
                        className="field-label"
                        htmlFor="feature-analysis-pvalue"
                      >
                        P-value Threshold: {pValueThreshold.toFixed(2)}
                      </label>
                      <input
                        id="feature-analysis-pvalue"
                        type="range"
                        min="1"
                        max="10"
                        value={Math.round(pValueThreshold * 100)}
                        onChange={(event) =>
                          setPValueThreshold(Number(event.target.value) / 100)
                        }
                        style={{ width: "100%", marginTop: "0.5rem" }}
                      />
                      <Text
                        muted
                        style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
                      >
                        Lower values enforce stricter significance requirements.
                      </Text>
                    </div>

                    <div>
                      <label
                        className="field-label"
                        htmlFor="feature-analysis-max-features"
                      >
                        Max Features Considered: {maxFeatures}
                      </label>
                      <input
                        id="feature-analysis-max-features"
                        type="range"
                        min="1"
                        max={Math.min(12, selectedFeatures.length || 12)}
                        value={maxFeatures}
                        onChange={(event) =>
                          setMaxFeatures(Number(event.target.value))
                        }
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        disabled={selectedFeatures.length === 0}
                      />
                      <Text
                        muted
                        style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
                      >
                        Prevents exponential explosion; capped at 12 for
                        performance.
                      </Text>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(37, 99, 235, 0.2)",
                        background: "rgba(37, 99, 235, 0.05)",
                        borderRadius: "12px",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Info
                          style={{
                            width: "18px",
                            height: "18px",
                            color: "var(--brand-primary-600)",
                          }}
                        />
                        <Text style={{ fontWeight: 600 }}>
                          Exhaustive Search Estimate
                        </Text>
                      </div>
                      <Text muted style={{ marginTop: "0.5rem" }}>
                        Estimated models evaluated:{" "}
                        <strong>{estimatedModelCount.toLocaleString()}</strong>
                      </Text>
                      <Text muted>
                        Estimated runtime: <strong>{timeEstimate}</strong>
                      </Text>
                      <Text
                        muted
                        style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
                      >
                        Tip: Reduce max features or increase p-value threshold
                        to trim the search space.
                      </Text>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleRunAnalysis}
                      disabled={!isFormValid || analyzing || uploading}
                    >
                      {analyzing
                        ? "Running analysis..."
                        : "Run Exhaustive Analysis"}
                    </Button>
                  </div>
                </div>
              )
            }
          />
        </div>

        {!result && !analyzing && !uploading && (
          <AIEngineEmptyState
            title="No analysis results yet"
            description="Upload a dataset and run the analysis to see top feature drivers."
          />
        )}

        {result && (
          <DashboardCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="Exhaustive Search Summary"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Drivers reflect impact on Weekly Sales for salespeople in the
                  MDA3 Sales Productivity dataset.
                </Text>
                {featureOverview && (
                  <div className="dashboard-grid">
                    <div style={{ textAlign: "center" }}>
                      <Text muted>Candidate Features</Text>
                      <Heading level={3} style={{ margin: "0.5rem 0" }}>
                        {featureOverview.candidateCount}
                      </Heading>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Text muted>Selected Features</Text>
                      <Heading level={3} style={{ margin: "0.5rem 0" }}>
                        {featureOverview.selectedCount}
                      </Heading>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Text muted>Models Evaluated</Text>
                      <Heading
                        level={3}
                        style={{
                          margin: "0.5rem 0",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {featureOverview.totalModels.toLocaleString()}
                      </Heading>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Text muted>Strong Predictors</Text>
                      <Heading level={3} style={{ margin: "0.5rem 0" }}>
                        {featureOverview.strongPredictors.length}
                      </Heading>
                    </div>
                  </div>
                )}

                {result.top_models && result.top_models.length > 0 && (
                  <div>
                    <Heading level={4} style={{ marginBottom: "1rem" }}>
                      Top Model Candidates
                    </Heading>
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Predictors</th>
                            <th>Adj R²</th>
                            <th>Max p-value</th>
                            <th>All Significant?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.top_models
                            .slice(0, 10)
                            .map((model, index) => {
                              const modelKey = `${model.predictors.join(
                                "|",
                              )}-${model.adj_r2}`;
                              return (
                                <tr key={modelKey}>
                                  <td>{index + 1}</td>
                                  <td style={{ fontWeight: 600 }}>
                                    {model.predictors.join(", ")}
                                  </td>
                                  <td
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {model.adj_r2.toFixed(4)}
                                  </td>
                                  <td
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {model.max_pvalue.toExponential(2)}
                                  </td>
                                  <td>
                                    {model.all_significant ? (
                                      <span style={{ color: "var(--success)" }}>
                                        Yes
                                      </span>
                                    ) : (
                                      <span style={{ color: "var(--warning)" }}>
                                        No
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {coefficientEntries.length > 0 && (
                  <div>
                    <Heading level={4} style={{ margin: "0 0 0.75rem" }}>
                      Final Model Coefficients
                    </Heading>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {coefficientEntries.map(([feature, coefficient]) => (
                        <div
                          key={feature}
                          style={{
                            border: "1px solid var(--input-border)",
                            borderRadius: "10px",
                            padding: "0.75rem 1rem",
                          }}
                        >
                          <Text muted>{feature}</Text>
                          <Heading
                            level={4}
                            style={{
                              marginTop: "0.35rem",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {coefficient.toFixed(4)}
                          </Heading>
                          <Text muted style={{ fontSize: "0.8rem" }}>
                            p ={" "}
                            {result.pvalues[feature] !== undefined
                              ? result.pvalues[feature].toExponential(2)
                              : "—"}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reasoning.length > 0 && (
                  <div>
                    <Heading level={4} style={{ margin: "0 0 0.75rem" }}>
                      Insights & Reasoning
                    </Heading>
                    <ul
                      style={{
                        paddingLeft: "1.25rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {reasoning.map((item) => (
                        <li key={item} style={{ marginBottom: "0.5rem" }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            }
          />
        )}
      </div>
    </PageContent>
  );
}
