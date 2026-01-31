"use client";

import { BarChart3, Database, ScatterChart, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";
import {
  BarChart,
  type BarChartDataPoint,
  ScatterPlot,
  type ScatterPlotDataPoint,
} from "@/components/ui/visualizations";
import {
  type DatasetFieldsResponse,
  type DatasetPreviewResponse,
  type DatasetSummary,
  fetchDatasetFields,
  fetchDatasetPreview,
  listDatasets,
} from "@/lib/ai-engine/api";

const SAMPLE_ROWS = 200;

const toNumber = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const computeAverage = (values: number[]) => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

const computePearson = (xs: number[], ys: number[]) => {
  if (xs.length === 0 || xs.length !== ys.length) return null;
  const meanX = computeAverage(xs);
  const meanY = computeAverage(ys);
  if (meanX === null || meanY === null) return null;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  xs.forEach((x, idx) => {
    const y = ys[idx];
    numerator += (x - meanX) * (y - meanY);
    denomX += (x - meanX) ** 2;
    denomY += (y - meanY) ** 2;
  });
  const denominator = Math.sqrt(denomX * denomY);
  if (!denominator) return null;
  return numerator / denominator;
};

export default function VisualizationPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [datasetsError, setDatasetsError] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [preview, setPreview] = useState<DatasetPreviewResponse | null>(null);
  const [fields, setFields] = useState<DatasetFieldsResponse | null>(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState("");

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

  const handleDatasetChange = (nextId: string) => {
    setSelectedDatasetId(nextId);
    setPreview(null);
    setFields(null);
    setTargetColumn("");
  };

  const numericColumns = useMemo(() => {
    if (!fields) return [];
    return fields.fields
      .filter((field) => field.is_numeric)
      .map((field) => field.name);
  }, [fields]);

  useEffect(() => {
    if (!targetColumn && numericColumns.length > 0) {
      setTargetColumn(numericColumns[0]);
    }
  }, [numericColumns, targetColumn]);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.dataset_id === selectedDatasetId),
    [datasets, selectedDatasetId],
  );

  const sampleRows = useMemo(() => {
    if (!preview) return [];
    return [...preview.head, ...preview.tail];
  }, [preview]);

  const columnAverages = useMemo<BarChartDataPoint[]>(() => {
    if (!sampleRows.length || numericColumns.length === 0) return [];
    return numericColumns
      .map((column) => {
        const values = sampleRows
          .map((row) => toNumber(row[column]))
          .filter((value): value is number => value !== null);
        const avg = computeAverage(values);
        if (avg === null) return null;
        return { label: column, value: avg };
      })
      .filter((item): item is BarChartDataPoint => Boolean(item))
      .slice(0, 8);
  }, [numericColumns, sampleRows]);

  const correlationData = useMemo<BarChartDataPoint[]>(() => {
    if (
      !targetColumn ||
      numericColumns.length <= 1 ||
      sampleRows.length === 0
    ) {
      return [];
    }
    return numericColumns
      .filter((column) => column !== targetColumn)
      .map((column) => {
        const pairs = sampleRows
          .map((row) => ({
            x: toNumber(row[column]),
            y: toNumber(row[targetColumn]),
          }))
          .filter((pair) => pair.x !== null && pair.y !== null) as Array<{
          x: number;
          y: number;
        }>;
        const xs = pairs.map((pair) => pair.x);
        const ys = pairs.map((pair) => pair.y);
        const corr = computePearson(xs, ys);
        if (corr === null) return null;
        return {
          label: column,
          value: Math.abs(corr),
        };
      })
      .filter((item): item is BarChartDataPoint => Boolean(item))
      .slice(0, 8);
  }, [numericColumns, sampleRows, targetColumn]);

  const scatterData = useMemo<ScatterPlotDataPoint[]>(() => {
    if (!targetColumn || numericColumns.length < 2 || sampleRows.length === 0) {
      return [];
    }
    const xColumn = numericColumns.find((column) => column !== targetColumn);
    if (!xColumn) return [];
    return sampleRows
      .map((row): ScatterPlotDataPoint | null => {
        const x = toNumber(row[xColumn]);
        const y = toNumber(row[targetColumn]);
        if (x === null || y === null) return null;
        return { x, y, size: 4 };
      })
      .filter((item): item is ScatterPlotDataPoint => item !== null)
      .slice(0, 120);
  }, [numericColumns, sampleRows, targetColumn]);

  const handleLoadSample = async () => {
    if (!selectedDatasetId) {
      setSampleError("Select a dataset before loading a sample.");
      return;
    }
    setLoadingSample(true);
    setSampleError("");

    try {
      const [previewResponse, fieldsResponse] = await Promise.all([
        fetchDatasetPreview(selectedDatasetId, SAMPLE_ROWS),
        fetchDatasetFields(selectedDatasetId),
      ]);
      setPreview(previewResponse);
      setFields(fieldsResponse);
    } catch (err) {
      setPreview(null);
      setFields(null);
      setSampleError(
        err instanceof Error ? err.message : "Failed to load dataset preview",
      );
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Visualization Lab"
          description="Explore datasets with quick charts and summary signals."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Visualization Lab" },
          ]}
        />

        <div className="dashboard-grid" style={{ marginBottom: "1.5rem" }}>
          <DashboardCard
            icon={<Database className="h-4 w-4" />}
            title="Dataset Selection"
            minHeight="16rem"
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
                  <label className="field-label" htmlFor="viz-dataset">
                    Dataset
                  </label>
                  <select
                    id="viz-dataset"
                    className="input"
                    value={selectedDatasetId}
                    onChange={(event) =>
                      handleDatasetChange(event.target.value)
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
                  <label className="field-label" htmlFor="viz-target">
                    Target Column
                  </label>
                  <select
                    id="viz-target"
                    className="input"
                    value={targetColumn}
                    onChange={(event) => setTargetColumn(event.target.value)}
                    disabled={!numericColumns.length}
                  >
                    <option value="">Select target</option>
                    {numericColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleLoadSample} disabled={loadingSample}>
                  {loadingSample ? "Loading sample..." : "Load sample"}
                </Button>
                {sampleError && <div className="error">{sampleError}</div>}
              </div>
            }
          />

          <DashboardCard
            icon={<Target className="h-4 w-4" />}
            title="Dataset Summary"
            minHeight="16rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Text style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                  Data exploration for selected dataset.
                </Text>
                {loadingSample ? (
                  <div className="loading">Loading dataset sample...</div>
                ) : null}
                {selectedDataset ? (
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    <Text muted>
                      Rows: {selectedDataset.n_rows ?? "Not available yet"}
                    </Text>
                    <Text muted>
                      Columns:{" "}
                      {selectedDataset.n_columns ?? "Not available yet"}
                    </Text>
                    <Text muted>Numeric columns: {numericColumns.length}</Text>
                  </div>
                ) : (
                  <Text muted>Select a dataset to view summary metrics.</Text>
                )}
              </div>
            }
          />
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="Numeric Column Averages"
            minHeight="18rem"
            description={
              loadingSample ? (
                <div className="loading">Loading dataset sample...</div>
              ) : !preview ? (
                <AIEngineEmptyState
                  title="No sample loaded"
                  description="Load a dataset sample to see numeric summaries."
                />
              ) : columnAverages.length === 0 ? (
                <AIEngineEmptyState
                  title="No numeric data"
                  description="Numeric columns are required to plot averages."
                />
              ) : (
                <BarChart
                  data={columnAverages}
                  height={260}
                  showValues
                  xLabel="Column"
                  yLabel="Average"
                />
              )
            }
          />

          <DashboardCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="Target Correlation (Absolute)"
            minHeight="18rem"
            description={
              loadingSample ? (
                <div className="loading">Loading dataset sample...</div>
              ) : !preview ? (
                <AIEngineEmptyState
                  title="No sample loaded"
                  description="Load a dataset sample to compute correlations."
                />
              ) : !targetColumn ? (
                <AIEngineEmptyState
                  title="Select a target column"
                  description="Choose a numeric target to compute correlations."
                />
              ) : correlationData.length === 0 ? (
                <AIEngineEmptyState
                  title="Not available yet"
                  description="Not enough numeric columns to compute correlations."
                />
              ) : (
                <BarChart
                  data={correlationData}
                  height={260}
                  showValues
                  xLabel="Feature"
                  yLabel="Correlation"
                />
              )
            }
          />

          <DashboardCard
            icon={<ScatterChart className="h-4 w-4" />}
            title="Sample Scatter Plot"
            minHeight="18rem"
            description={
              loadingSample ? (
                <div className="loading">Loading dataset sample...</div>
              ) : !preview ? (
                <AIEngineEmptyState
                  title="No sample loaded"
                  description="Load a dataset sample to view scatter plots."
                />
              ) : scatterData.length === 0 ? (
                <AIEngineEmptyState
                  title="Not available yet"
                  description="Select a target with at least two numeric columns."
                />
              ) : (
                <ScatterPlot
                  data={scatterData}
                  height={260}
                  showTrendLine
                  xLabel="Feature"
                  yLabel="Target"
                />
              )
            }
          />
        </div>
      </div>
    </PageContent>
  );
}
