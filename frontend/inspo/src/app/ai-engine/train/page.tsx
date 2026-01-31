"use client";

import {
  BarChart3,
  CheckCircle2,
  FileText,
  Sliders,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import MetricHint from "@/components/ui/ai-engine/MetricHint";
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

export default function TrainPage() {
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
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<TrainOLSResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const numericFields = useMemo(
    () => fields.filter((field) => field.is_numeric).map((field) => field.name),
    [fields],
  );

  const initializeDataset = async (
    uploadResponse: DatasetUploadResponse,
    preset?: { targetColumn: string; featureColumns: string[] },
  ) => {
    setDatasetId(uploadResponse.dataset_id);
    setDatasetName(uploadResponse.name || "Sample Dataset");

    const [fieldsResponse, previewResponse] = await Promise.all([
      fetchDatasetFields(uploadResponse.dataset_id),
      fetchDatasetPreview(uploadResponse.dataset_id, PREVIEW_ROW_COUNT),
    ]);

    const fieldList = fieldsResponse.fields;
    setFields(fieldList);

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

    const numericColumnNames = fieldList
      .filter((field) => field.is_numeric)
      .map((field) => field.name);

    const defaultTarget =
      numericColumnNames[numericColumnNames.length - 1] ||
      uploadResponse.schema.columns[uploadResponse.schema.columns.length - 1] ||
      "";

    let nextTarget = defaultTarget;
    let nextFeatures = numericColumnNames.filter(
      (column) => column !== defaultTarget,
    );

    if (preset) {
      const available = new Set(fieldList.map((field) => field.name));
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
      const uploadResponse = await uploadDataset(file, {
        name: file.name,
        userId: sessionUserId ?? undefined,
      });

      await initializeDataset(uploadResponse);
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

  const isFormValid = useMemo(() => {
    return (
      datasetId &&
      selectedFeatures.length > 0 &&
      targetColumn.length > 0 &&
      !selectedFeatures.includes(targetColumn)
    );
  }, [datasetId, selectedFeatures, targetColumn]);

  const handleTrain = async () => {
    if (!isFormValid) {
      setError(
        "Please upload a dataset, select feature columns, and choose a valid target column.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowSuccess(false);

    try {
      const trainingResponse = await trainOLSModel({
        datasetId,
        targetColumn,
        featureColumns: selectedFeatures,
        userId: sessionUserId ?? undefined,
        testSize: testSize / 100,
        pValueThreshold,
      });

      setResult(trainingResponse);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Training failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const featureSummary = useMemo(() => {
    if (!result) return null;
    const totalFeatures =
      result.candidate_features?.length ?? result.feature_columns.length;

    return {
      selected: result.feature_columns.length,
      total: totalFeatures,
    };
  }, [result]);

  const coefficientEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.coefficients)
      .filter(([name]) => name !== "const")
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [result]);

  const bestScore = useMemo(() => {
    if (!result) return null;
    return result.metrics.rsquared_adj ?? result.metrics.r2 ?? null;
  }, [result]);

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Upload & Train"
          description="Upload a dataset and run exhaustive OLS analysis."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Upload & Train" },
          ]}
        />

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
            <span style={{ fontWeight: 600 }}>Model trained successfully</span>
          </div>
        )}

        {error && (
          <div className="error" style={{ marginBottom: "1.5rem" }}>
            {error}
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
                <label
                  htmlFor="dataset-upload"
                  aria-disabled={uploading || loading}
                  style={{
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    padding: "3rem 2rem",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    cursor: uploading || loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    display: "block",
                    pointerEvents: uploading || loading ? "none" : "auto",
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading && !loading) {
                      e.currentTarget.style.borderColor =
                        "rgba(59, 130, 246, 0.5)";
                      e.currentTarget.style.background =
                        "rgba(59, 130, 246, 0.08)";
                      e.currentTarget.style.boxShadow =
                        "0 0 20px rgba(59, 130, 246, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="dataset-upload"
                    disabled={uploading || loading}
                  />
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "16px",
                      background: "rgba(59, 130, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    <Upload
                      style={{
                        width: "32px",
                        height: "32px",
                        color: "var(--brand-primary-500)",
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      marginBottom: "0.5rem",
                      fontSize: "1rem",
                    }}
                  >
                    {uploading
                      ? "Uploading..."
                      : "Click to upload or drag and drop"}
                  </Text>
                  <Text
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    CSV, XLSX, or XLS files supported
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    disabled={uploading || loading}
                  >
                    Use Sample Data – Sales Productivity
                  </Button>
                </label>

                {datasetName && (
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      background: "rgba(34, 197, 94, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(34, 197, 94, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText
                        style={{
                          width: "18px",
                          height: "18px",
                          color: "#4ade80",
                        }}
                      />
                    </div>
                    <div>
                      <Text
                        style={{
                          color: "#4ade80",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {datasetName}
                      </Text>
                      <Text
                        style={{
                          color: "rgba(74, 222, 128, 0.7)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Ready for training
                      </Text>
                    </div>
                  </div>
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
            title="Configuration"
            minHeight="18rem"
            description={
              !parsedData ? (
                <AIEngineEmptyState
                  title="Upload a dataset to configure training"
                  description="Once a dataset is uploaded, select features and target columns."
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
                    }}
                  >
                    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                      <legend className="field-label">Feature Columns</legend>
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
                      <label className="field-label" htmlFor="train-target">
                        Target Column
                      </label>
                      <select
                        id="train-target"
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
                        Only numeric columns are eligible as targets.
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label className="field-label" htmlFor="train-test-size">
                        Test Size: {testSize}%
                      </label>
                      <input
                        id="train-test-size"
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
                        Controls the hold-out fraction for evaluation (
                        {(1 - testSize / 100).toFixed(2)} train /{" "}
                        {(testSize / 100).toFixed(2)} test).
                      </Text>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="train-pvalue">
                        P-value Threshold: {pValueThreshold.toFixed(2)}
                      </label>
                      <input
                        id="train-pvalue"
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
                        Lower values enforce stricter statistical significance
                        criteria.
                      </Text>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleTrain}
                      disabled={!isFormValid || loading || uploading}
                    >
                      {loading ? "Training..." : "Train Model"}
                    </Button>
                  </div>
                </div>
              )
            }
          />
        </div>

        {!result && !loading && !uploading && (
          <AIEngineEmptyState
            title="No training results yet"
            description="Upload a dataset, configure features, and train to see model metrics here."
          />
        )}

        {result && (
          <DashboardCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="Training Results"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div className="dashboard-grid">
                  <div style={{ textAlign: "center" }}>
                    <Text muted>Model Type</Text>
                    <Heading level={3} style={{ margin: "0.5rem 0" }}>
                      {result.model_family}
                    </Heading>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text muted>
                      Adjusted R²
                      <MetricHint text="Higher is better" />
                    </Text>
                    <Heading
                      level={3}
                      style={{
                        margin: "0.5rem 0",
                        fontFamily: "var(--font-mono)",
                        color: "var(--success)",
                      }}
                    >
                      {bestScore !== null ? bestScore.toFixed(4) : "—"}
                    </Heading>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text muted>Features Used</Text>
                    <Heading level={3} style={{ margin: "0.5rem 0" }}>
                      {featureSummary?.selected ?? 0} /{" "}
                      {featureSummary?.total ?? 0}
                    </Heading>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text muted>
                      Test RMSE
                      <MetricHint text="Lower is better" />
                    </Text>
                    <Heading
                      level={3}
                      style={{
                        margin: "0.5rem 0",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {result.metrics.rmse.toFixed(3)}
                    </Heading>
                  </div>
                </div>

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
                                      <span style={{ color: "var(--error)" }}>
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
                    <Heading level={4} style={{ margin: "0 0 1rem" }}>
                      Coefficients &amp; Significance
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
                            background: "var(--surface-alt)",
                          }}
                        >
                          <Text muted style={{ marginBottom: "0.25rem" }}>
                            {feature}
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: "0.35rem",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            >
                              {coefficient.toFixed(4)}
                            </span>
                            <span
                              style={{
                                color: "var(--muted-foreground)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.8rem",
                              }}
                            >
                              p ={" "}
                              {result.pvalues[feature] !== undefined
                                ? result.pvalues[feature].toExponential(2)
                                : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.reasoning && result.reasoning.length > 0 && (
                  <div>
                    <Heading level={4} style={{ margin: "0 0 0.75rem" }}>
                      Key Takeaways
                    </Heading>
                    <ul
                      style={{
                        paddingLeft: "1.25rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {result.reasoning.map((item) => (
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
