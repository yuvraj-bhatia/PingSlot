"use client";

import { Download, Filter, History, RefreshCw, Table } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";
import {
  type DatasetSummary,
  listDatasets,
  listModels,
  listPredictions,
  type ModelSummary,
  type PredictionLog,
} from "@/lib/ai-engine/api";

const DEFAULT_LIMIT = 50;

const formatTimestamp = (value?: string | null) => {
  if (!value) return "Not available yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "Not available yet";
  return Number.isFinite(value) ? value.toFixed(4) : String(value);
};

const formatInputs = (inputs?: Record<string, number>) => {
  if (!inputs || Object.keys(inputs).length === 0) return "—";
  return Object.entries(inputs)
    .map(([key, value]) => `${key}: ${Number(value).toFixed(2)}`)
    .join(", ");
};

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function PredictionsPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState("");
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [datasetsError, setDatasetsError] = useState("");
  const [predictions, setPredictions] = useState<PredictionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelId, setModelId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    let isMounted = true;
    setModelsLoading(true);
    setModelsError("");

    listModels()
      .then((data) => {
        if (!isMounted) return;
        setModels(data);
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
    let isMounted = true;
    setDatasetsLoading(true);
    setDatasetsError("");

    listDatasets()
      .then((data) => {
        if (!isMounted) return;
        setDatasets(data);
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

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listPredictions({
        modelId: modelId || undefined,
        datasetId: datasetId || undefined,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setPredictions(data);
    } catch (err) {
      setPredictions([]);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load prediction history",
      );
    } finally {
      setLoading(false);
    }
  }, [modelId, datasetId, limit, startDate, endDate]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const modelLookup = useMemo(() => {
    return new Map(models.map((model) => [model.model_id, model.name]));
  }, [models]);

  const summary = useMemo(() => {
    const uniqueModels = new Set(predictions.map((p) => p.model_id)).size;
    const latest = predictions.reduce<string | null>((acc, item) => {
      if (!item.created_at) return acc;
      if (!acc) return item.created_at;
      return new Date(item.created_at) > new Date(acc) ? item.created_at : acc;
    }, null);

    return {
      count: predictions.length,
      uniqueModels,
      latest,
    };
  }, [predictions]);

  const handleExportCsv = () => {
    if (!predictions.length) return;

    const headers = [
      "timestamp",
      "model",
      "dataset",
      "target",
      "prediction",
      "ci_low",
      "ci_high",
      "inputs",
    ];

    const rows = predictions.map((item) => {
      const modelName =
        item.model_name || modelLookup.get(item.model_id) || item.model_id;
      const datasetName = item.dataset_name || item.dataset_id || "";
      const inputs = item.input_features
        ? JSON.stringify(item.input_features)
        : "";

      return [
        escapeCsvValue(formatTimestamp(item.created_at)),
        escapeCsvValue(modelName),
        escapeCsvValue(datasetName),
        escapeCsvValue(item.target_column),
        escapeCsvValue(formatNumber(item.prediction)),
        escapeCsvValue(item.ci_low != null ? formatNumber(item.ci_low) : ""),
        escapeCsvValue(item.ci_high != null ? formatNumber(item.ci_high) : ""),
        escapeCsvValue(inputs),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prediction-history.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Prediction History"
          description="Review model predictions and inference logs."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Prediction History" },
          ]}
        />

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Filter className="h-4 w-4" />}
            title="Filters"
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
                  <label className="field-label" htmlFor="predictions-model">
                    Model
                  </label>
                  <select
                    id="predictions-model"
                    className="input"
                    value={modelId}
                    onChange={(event) => setModelId(event.target.value)}
                    disabled={modelsLoading}
                  >
                    <option value="">All models</option>
                    {models.map((model) => (
                      <option key={model.model_id} value={model.model_id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {modelsLoading && (
                    <Text muted style={{ fontSize: "0.8rem" }}>
                      Loading models...
                    </Text>
                  )}
                  {modelsError && (
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(239, 68, 68, 0.9)",
                      }}
                    >
                      {modelsError}
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
                  <label className="field-label" htmlFor="predictions-dataset">
                    Dataset
                  </label>
                  <select
                    id="predictions-dataset"
                    className="input"
                    value={datasetId}
                    onChange={(event) => setDatasetId(event.target.value)}
                    disabled={datasetsLoading}
                  >
                    <option value="">All datasets</option>
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
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
                    <label className="field-label" htmlFor="predictions-start">
                      Start Date
                    </label>
                    <input
                      id="predictions-start"
                      className="input"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label className="field-label" htmlFor="predictions-end">
                      End Date
                    </label>
                    <input
                      id="predictions-end"
                      className="input"
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  <div style={{ flex: "1 1 120px" }}>
                    <label
                      className="field-label"
                      htmlFor="predictions-max-records"
                    >
                      Max Records
                    </label>
                    <input
                      id="predictions-max-records"
                      className="input"
                      type="number"
                      min={1}
                      max={500}
                      value={limit}
                      onChange={(event) => setLimit(Number(event.target.value))}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <Button onClick={fetchPredictions} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <Button
                      onClick={handleExportCsv}
                      variant="outline"
                      disabled={!predictions.length}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
            }
            minHeight="16rem"
          />

          <DashboardCard
            icon={<History className="h-4 w-4" />}
            title="Registry Summary"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  Records loaded: <strong>{summary.count}</strong>
                </Text>
                <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  Unique models: <strong>{summary.uniqueModels}</strong>
                </Text>
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Latest prediction: {formatTimestamp(summary.latest)}
                </Text>
              </div>
            }
            minHeight="16rem"
          />
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <DashboardCard
            icon={<Table className="h-4 w-4" />}
            title="Prediction Registry"
            minHeight="18rem"
            description={
              <div style={{ marginTop: "0.75rem" }}>
                {loading ? (
                  <div className="loading">Loading prediction history...</div>
                ) : error ? (
                  <div className="error">{error}</div>
                ) : predictions.length === 0 ? (
                  <AIEngineEmptyState
                    title="No predictions yet"
                    description="Predictions logged from the playground or batch inference will appear here."
                  />
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Dataset</th>
                          <th>Target</th>
                          <th>Prediction</th>
                          <th>Confidence Interval</th>
                          <th>Inputs</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.map((item) => {
                          const modelName =
                            item.model_name ||
                            modelLookup.get(item.model_id) ||
                            item.model_id;
                          const ciValue =
                            item.ci_low !== null &&
                            item.ci_low !== undefined &&
                            item.ci_high !== null &&
                            item.ci_high !== undefined
                              ? `${formatNumber(item.ci_low)} – ${formatNumber(
                                  item.ci_high,
                                )}`
                              : "Not available yet";

                          return (
                            <tr key={item.id}>
                              <td>{modelName}</td>
                              <td>
                                {item.dataset_name || "Not available yet"}
                              </td>
                              <td>{item.target_column}</td>
                              <td>{formatNumber(item.prediction)}</td>
                              <td>{ciValue}</td>
                              <td>{formatInputs(item.input_features)}</td>
                              <td>{formatTimestamp(item.created_at)}</td>
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
      </div>
    </PageContent>
  );
}
