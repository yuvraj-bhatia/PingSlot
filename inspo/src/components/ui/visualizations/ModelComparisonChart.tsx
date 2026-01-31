"use client";

import BarChart, { type BarChartDataPoint } from "./BarChart";
import ScatterPlot, { type ScatterPlotDataPoint } from "./ScatterPlot";

export interface ModelComparisonData {
  modelName: string;
  r2: number;
  rmse: number;
  mae: number;
  cvMean?: number;
  cvStd?: number;
  features?: number;
}

export interface ModelComparisonChartProps {
  data: ModelComparisonData[];
  chartType?: "bar" | "scatter";
  metric?: "r2" | "rmse" | "mae";
  width?: number;
  height?: number;
}

export default function ModelComparisonChart({
  data,
  chartType = "bar",
  metric = "r2",
  width = 800,
  height = 400,
}: ModelComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-alt)",
          borderRadius: "10px",
          border: "1px solid var(--input-border)",
        }}
      >
        <p style={{ color: "var(--muted-foreground)" }}>
          No comparison data available
        </p>
      </div>
    );
  }

  const metricLabel = {
    r2: "R² Score",
    rmse: "RMSE",
    mae: "MAE",
  }[metric];

  if (chartType === "bar") {
    const barData: BarChartDataPoint[] = data
      .map((d, i) => ({
        label: d.modelName,
        value: d[metric],
        color: i === 0 ? "var(--success)" : undefined, // Highlight best model
      }))
      .sort((a, b) =>
        metric === "r2" ? b.value - a.value : a.value - b.value,
      );

    return (
      <BarChart
        data={barData}
        width={width}
        height={height}
        yLabel={metricLabel}
        horizontal={true}
        showValues={true}
      />
    );
  }

  // Scatter plot: RMSE vs R²
  const scatterData: ScatterPlotDataPoint[] = data.map((d) => ({
    x: d.rmse,
    y: d.r2,
    label: d.modelName,
    size: 8,
  }));

  return (
    <ScatterPlot
      data={scatterData}
      width={width}
      height={height}
      xLabel="RMSE"
      yLabel="R² Score"
      showTrendLine={true}
    />
  );
}
