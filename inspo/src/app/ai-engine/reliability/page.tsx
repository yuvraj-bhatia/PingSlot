"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Info,
  Shield,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Text } from "@/components/ui/form-components";
import {
  type DatasetSummary,
  getDatasetReliability,
  getModelReliability,
  listDatasets,
  listModels,
  type ModelSummary,
  type ReliabilityBreakdownItem,
  type ReliabilityScore,
} from "@/lib/ai-engine/api";

const formatTimestamp = (value?: string | null) => {
  if (!value) return "Not available yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "rgba(34, 197, 94, 0.95)";
  if (score >= 60) return "rgba(234, 179, 8, 0.95)";
  if (score >= 40) return "rgba(249, 115, 22, 0.95)";
  return "rgba(239, 68, 68, 0.95)";
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return "rgba(34, 197, 94, 0.15)";
  if (score >= 60) return "rgba(234, 179, 8, 0.15)";
  if (score >= 40) return "rgba(249, 115, 22, 0.15)";
  return "rgba(239, 68, 68, 0.15)";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "good":
      return (
        <CheckCircle2
          className="h-3 w-3"
          style={{ color: "rgba(34, 197, 94, 0.95)" }}
        />
      );
    case "minor":
    case "moderate":
      return (
        <Info
          className="h-3 w-3"
          style={{ color: "rgba(234, 179, 8, 0.95)" }}
        />
      );
    case "warning":
      return (
        <AlertTriangle
          className="h-3 w-3"
          style={{ color: "rgba(249, 115, 22, 0.95)" }}
        />
      );
    case "critical":
    case "error":
      return (
        <XCircle
          className="h-3 w-3"
          style={{ color: "rgba(239, 68, 68, 0.95)" }}
        />
      );
    default:
      return (
        <Info className="h-3 w-3" style={{ color: "rgba(255,255,255,0.5)" }} />
      );
  }
};

const formatBreakdownKey = (key: string): string =>
  key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

interface BreakdownItemProps {
  name: string;
  item: ReliabilityBreakdownItem;
}

function BreakdownItem({ name, item }: BreakdownItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    item.columns !== undefined ||
    item.pairs !== undefined ||
    item.variables !== undefined;
  const columns = Array.isArray(item.columns)
    ? (item.columns as Array<Record<string, unknown>>)
    : null;
  const pairs = Array.isArray(item.pairs)
    ? (item.pairs as Array<{
        column1: string;
        column2: string;
        correlation: number;
      }>)
    : null;
  const variables = Array.isArray(item.variables)
    ? (item.variables as Array<{ variable: string; p_value: number }>)
    : null;

  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setExpanded((prev) => !prev)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: hasDetails ? "pointer" : "default",
          background: "transparent",
          border: "none",
          padding: 0,
          width: "100%",
          color: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {getStatusIcon(item.status)}
          <Text style={{ fontSize: "0.85rem" }}>
            {formatBreakdownKey(name)}
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {item.penalty !== undefined && item.penalty !== 0 && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "rgba(239, 68, 68, 0.9)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.penalty}
            </span>
          )}
          {hasDetails &&
            (expanded ? (
              <ChevronUp className="h-3 w-3" style={{ opacity: 0.5 }} />
            ) : (
              <ChevronDown className="h-3 w-3" style={{ opacity: 0.5 }} />
            ))}
        </div>
      </button>
      <Text muted style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
        {item.detail}
      </Text>
      {expanded && hasDetails && (
        <div
          style={{
            marginTop: "0.5rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {columns && (
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {columns.slice(0, 3).map((col) => {
                const label = String(
                  col.column || col.name || JSON.stringify(col),
                );
                return <li key={label}>{label}</li>;
              })}
            </ul>
          )}
          {pairs && (
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {pairs.slice(0, 3).map((pair) => (
                <li key={`${pair.column1}-${pair.column2}`}>
                  {pair.column1} ↔ {pair.column2} (r={pair.correlation})
                </li>
              ))}
            </ul>
          )}
          {variables && (
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {variables.slice(0, 3).map((v) => (
                <li key={v.variable}>
                  {v.variable} (p={v.p_value})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReliabilityPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [datasetsError, setDatasetsError] = useState("");
  const [modelsError, setModelsError] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [datasetReliability, setDatasetReliability] =
    useState<ReliabilityScore | null>(null);
  const [modelReliability, setModelReliability] =
    useState<ReliabilityScore | null>(null);
  const [datasetReliabilityLoading, setDatasetReliabilityLoading] =
    useState(false);
  const [modelReliabilityLoading, setModelReliabilityLoading] = useState(false);
  const [reliabilityError, setReliabilityError] = useState("");

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
    let isMounted = true;
    setModelsLoading(true);
    setModelsError("");

    listModels()
      .then((data) => {
        if (!isMounted) return;
        setModels(data);
        if (data.length > 0) {
          setSelectedModelId((prev) => prev || data[0].model_id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setModelsError(
          err instanceof Error ? err.message : "Failed to load models",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setModelsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) {
      setDatasetReliability(null);
      return;
    }
    setDatasetReliabilityLoading(true);
    setReliabilityError("");

    getDatasetReliability(selectedDatasetId)
      .then((data) => setDatasetReliability(data))
      .catch((err) =>
        setReliabilityError(
          err instanceof Error
            ? err.message
            : "Failed to load dataset reliability",
        ),
      )
      .finally(() => setDatasetReliabilityLoading(false));
  }, [selectedDatasetId]);

  useEffect(() => {
    if (!selectedModelId) {
      setModelReliability(null);
      return;
    }
    setModelReliabilityLoading(true);
    setReliabilityError("");

    getModelReliability(selectedModelId)
      .then((data) => setModelReliability(data))
      .catch((err) =>
        setReliabilityError(
          err instanceof Error
            ? err.message
            : "Failed to load model reliability",
        ),
      )
      .finally(() => setModelReliabilityLoading(false));
  }, [selectedModelId]);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.dataset_id === selectedDatasetId),
    [datasets, selectedDatasetId],
  );

  const selectedModel = useMemo(
    () => models.find((model) => model.model_id === selectedModelId),
    [models, selectedModelId],
  );

  const showReliabilityEmpty =
    !datasetReliability &&
    !modelReliability &&
    !datasetReliabilityLoading &&
    !modelReliabilityLoading &&
    !reliabilityError;

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Reliability & Data Quality"
          description="Track reliability scores and data-quality signals for datasets and models."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Reliability & Data Quality" },
          ]}
        />

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Database className="h-4 w-4" />}
            title="Datasets"
            minHeight="16rem"
            description={
              datasetsLoading ? (
                <div className="loading">Loading datasets...</div>
              ) : datasetsError ? (
                <div className="error">{datasetsError}</div>
              ) : datasets.length === 0 ? (
                <AIEngineEmptyState
                  title="No datasets available"
                  description="Upload a dataset to begin reliability scoring."
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <label className="field-label" htmlFor="reliability-dataset">
                    Select Dataset
                  </label>
                  <select
                    id="reliability-dataset"
                    className="input"
                    value={selectedDatasetId}
                    onChange={(event) =>
                      setSelectedDatasetId(event.target.value)
                    }
                  >
                    {datasets.map((dataset) => (
                      <option
                        key={dataset.dataset_id}
                        value={dataset.dataset_id}
                      >
                        {dataset.name}
                      </option>
                    ))}
                  </select>
                  {selectedDataset ? (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      <Text muted>
                        Rows: {selectedDataset.n_rows ?? "Not available yet"}
                      </Text>
                      <Text muted>
                        Columns:{" "}
                        {selectedDataset.n_columns ?? "Not available yet"}
                      </Text>
                      <Text muted>
                        Uploaded: {formatTimestamp(selectedDataset.created_at)}
                      </Text>
                    </div>
                  ) : null}
                </div>
              )
            }
          />

          <DashboardCard
            icon={<Boxes className="h-4 w-4" />}
            title="Models"
            minHeight="16rem"
            description={
              modelsLoading ? (
                <div className="loading">Loading models...</div>
              ) : modelsError ? (
                <div className="error">{modelsError}</div>
              ) : models.length === 0 ? (
                <AIEngineEmptyState
                  title="No models available"
                  description="Train a model to see reliability scoring."
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <label className="field-label" htmlFor="reliability-model">
                    Select Model
                  </label>
                  <select
                    id="reliability-model"
                    className="input"
                    value={selectedModelId}
                    onChange={(event) => setSelectedModelId(event.target.value)}
                  >
                    {models.map((model) => (
                      <option key={model.model_id} value={model.model_id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {selectedModel ? (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      <Text muted>Family: {selectedModel.model_family}</Text>
                      <Text muted>Status: {selectedModel.status}</Text>
                      <Text muted>
                        Created:{" "}
                        {formatTimestamp(selectedModel.created_at ?? null)}
                      </Text>
                    </div>
                  ) : null}
                </div>
              )
            }
          />
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <DashboardCard
            icon={<Shield className="h-4 w-4" />}
            title="Reliability Panel"
            minHeight="18rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {datasetReliabilityLoading || modelReliabilityLoading ? (
                  <div className="loading">Loading reliability scores...</div>
                ) : reliabilityError ? (
                  <div className="error">{reliabilityError}</div>
                ) : showReliabilityEmpty ? (
                  <AIEngineEmptyState
                    title="Select a dataset or model"
                    description="Choose a dataset or model from the panels on the left to view reliability scores and diagnostics."
                  />
                ) : (
                  <>
                    {datasetReliability ? (
                      <div
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Text
                          style={{ fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                          Dataset Reliability
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "999px",
                              background: getScoreBgColor(
                                datasetReliability.score,
                              ),
                              color: getScoreColor(datasetReliability.score),
                              fontWeight: 600,
                            }}
                          >
                            {datasetReliability.score}
                          </div>
                          <Text>{datasetReliability.label}</Text>
                        </div>
                        {datasetReliability.issues?.length ? (
                          <ul
                            style={{
                              marginTop: "0.75rem",
                              paddingLeft: "1.25rem",
                              fontSize: "0.85rem",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            {datasetReliability.issues.map((issue) => (
                              <li
                                key={issue}
                                style={{ marginBottom: "0.25rem" }}
                              >
                                {issue}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Text muted style={{ marginTop: "0.75rem" }}>
                            No issues reported.
                          </Text>
                        )}
                        {datasetReliability.breakdown &&
                          Object.keys(datasetReliability.breakdown).length >
                            0 && (
                            <div style={{ marginTop: "1rem" }}>
                              <Text
                                muted
                                style={{
                                  fontSize: "0.8rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                Breakdown:
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                {Object.entries(
                                  datasetReliability.breakdown,
                                ).map(([key, item]) => (
                                  <BreakdownItem
                                    key={key}
                                    name={key}
                                    item={item}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : null}

                    {modelReliability ? (
                      <div
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Text
                          style={{ fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                          Model Reliability
                          {modelReliability.model_family && (
                            <span
                              style={{
                                fontWeight: 400,
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              {" "}
                              ({modelReliability.model_family})
                            </span>
                          )}
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "999px",
                              background: getScoreBgColor(
                                modelReliability.score,
                              ),
                              color: getScoreColor(modelReliability.score),
                              fontWeight: 600,
                            }}
                          >
                            {modelReliability.score}
                          </div>
                          <Text>{modelReliability.label}</Text>
                        </div>
                        {modelReliability.issues?.length ? (
                          <ul
                            style={{
                              marginTop: "0.75rem",
                              paddingLeft: "1.25rem",
                              fontSize: "0.85rem",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            {modelReliability.issues.map((issue) => (
                              <li
                                key={issue}
                                style={{ marginBottom: "0.25rem" }}
                              >
                                {issue}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Text muted style={{ marginTop: "0.75rem" }}>
                            No issues reported.
                          </Text>
                        )}
                        {modelReliability.breakdown &&
                          Object.keys(modelReliability.breakdown).length >
                            0 && (
                            <div style={{ marginTop: "1rem" }}>
                              <Text
                                muted
                                style={{
                                  fontSize: "0.8rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                Breakdown:
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                {Object.entries(modelReliability.breakdown).map(
                                  ([key, item]) => (
                                    <BreakdownItem
                                      key={key}
                                      name={key}
                                      item={item}
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            }
          />
        </div>
      </div>
    </PageContent>
  );
}
