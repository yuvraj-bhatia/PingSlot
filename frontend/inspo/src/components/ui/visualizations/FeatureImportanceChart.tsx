"use client";

import BarChart, { type BarChartDataPoint } from "./BarChart";

export interface FeatureImportanceData {
  feature: string;
  importance: number;
  coefficient?: number;
  pValue?: number;
}

export interface FeatureImportanceChartProps {
  data: FeatureImportanceData[];
  width?: number;
  height?: number;
  maxFeatures?: number;
  showPValues?: boolean;
}

export default function FeatureImportanceChart({
  data,
  width = 800,
  height = 400,
  maxFeatures = 10,
  showPValues = false,
}: FeatureImportanceChartProps) {
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
          No feature importance data available
        </p>
      </div>
    );
  }

  // Sort by importance and take top N
  const sortedData = [...data]
    .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, maxFeatures);

  const barData: BarChartDataPoint[] = sortedData.map((d) => {
    const isPositive = d.importance >= 0;
    const color = isPositive ? "var(--success)" : "var(--error)";
    const label =
      showPValues && d.pValue !== undefined
        ? `${d.feature} (p=${d.pValue.toFixed(3)})`
        : d.feature;

    return {
      label,
      value: Math.abs(d.importance),
      color,
    };
  });

  return (
    <BarChart
      data={barData}
      width={width}
      height={height}
      horizontal={true}
      xLabel="Importance"
      yLabel="Feature"
      showValues={true}
    />
  );
}
