"use client";

import BarChart, { type BarChartDataPoint } from "./BarChart";
import LineChart, { type LineChartDataPoint } from "./LineChart";

export interface ModelPerformanceData {
  date: string | Date;
  r2: number;
  rmse: number;
  mae: number;
  modelName?: string;
}

export interface ModelPerformanceChartProps {
  data: ModelPerformanceData[];
  metric?: "r2" | "rmse" | "mae";
  chartType?: "line" | "bar";
  width?: number;
  height?: number;
}

export default function ModelPerformanceChart({
  data,
  metric = "r2",
  chartType = "line",
  width = 800,
  height = 400,
}: ModelPerformanceChartProps) {
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
          No performance data available
        </p>
      </div>
    );
  }

  const metricLabel = {
    r2: "R² Score",
    rmse: "RMSE",
    mae: "MAE",
  }[metric];

  if (chartType === "line") {
    const lineData: LineChartDataPoint[] = data.map((d) => ({
      x: d.date,
      y: d[metric],
      label: d.modelName,
    }));

    return (
      <LineChart
        data={lineData}
        width={width}
        height={height}
        xLabel="Date"
        yLabel={metricLabel}
        color="var(--brand-primary-600)"
        showGrid={true}
        showPoints={true}
      />
    );
  }

  const barData: BarChartDataPoint[] = data.map((d, i) => ({
    label: d.modelName || `Model ${i + 1}`,
    value: d[metric],
  }));

  return (
    <BarChart
      data={barData}
      width={width}
      height={height}
      yLabel={metricLabel}
      showValues={true}
    />
  );
}
