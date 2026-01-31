"use client";

import anime from "animejs/lib/anime.es.js";
import * as d3 from "d3";
import {
  type ChartDimensions,
  DEFAULT_DIMENSIONS,
  formatNumber,
  useD3Chart,
} from "./D3Base";

export interface PieChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  width?: number;
  height?: number;
  margin?: Partial<ChartDimensions["margin"]>;
  innerRadiusRatio?: number;
  showLegend?: boolean;
  className?: string;
}

export default function PieChart({
  data,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
  margin = DEFAULT_DIMENSIONS.margin,
  innerRadiusRatio = 0.45,
  showLegend = true,
  className,
}: PieChartProps) {
  const dimensions = {
    width,
    height,
    margin: { ...DEFAULT_DIMENSIONS.margin, ...margin },
  };

  const radius =
    Math.min(
      dimensions.width - dimensions.margin.left - dimensions.margin.right,
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom,
    ) / 2;

  const svgRef = useD3Chart<SVGSVGElement>(
    (svg, chartData) => {
      if (!chartData || chartData.length === 0) return;
      const slices = chartData as PieChartDataPoint[];

      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${dimensions.width / 2},${dimensions.height / 2})`,
        );

      const pie = d3
        .pie<PieChartDataPoint>()
        .sort(null)
        .value((d) => d.value);

      const arc = d3
        .arc<d3.PieArcDatum<PieChartDataPoint>>()
        .innerRadius(radius * innerRadiusRatio)
        .outerRadius(radius);

      const colorScale = d3
        .scaleOrdinal<string>()
        .domain(slices.map((d) => d.label))
        .range([
          "#3b82f6",
          "#8b5cf6",
          "#ef4444",
          "#10b981",
          "#f59e0b",
          "#06b6d4",
          "#ec4899",
          "#a855f7",
        ]);

      const arcs = g
        .selectAll("path")
        .data(pie(slices))
        .enter()
        .append("path")
        .attr(
          "d",
          arc as d3.ValueFn<
            SVGPathElement,
            d3.PieArcDatum<PieChartDataPoint>,
            string | null
          >,
        )
        .attr("fill", (d, i) => d.data.color || colorScale(String(i)))
        .attr("stroke", "rgba(255,255,255,0.8)")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.9)
        .attr("transform", "scale(0.85)");

      anime({
        targets: arcs.nodes(),
        scale: [0.85, 1],
        easing: "easeOutBack",
        delay: anime.stagger(80),
        duration: 700,
      });

      // Labels
      const labelArc = d3
        .arc<d3.PieArcDatum<PieChartDataPoint>>()
        .innerRadius(radius * 0.65)
        .outerRadius(radius * 0.95);

      const labels = g
        .selectAll(".label")
        .data(pie(slices))
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      labels
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "-0.2em")
        .attr("font-weight", 700)
        .text((d) => d.data.label);

      labels
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .attr("fill", "rgba(255,255,255,0.8)")
        .text((d) => formatNumber(d.data.value));

      anime({
        targets: labels.nodes(),
        opacity: [0, 1],
        delay: anime.stagger(90, { start: 200 }),
        easing: "easeOutQuad",
        duration: 500,
      });

      // Center total
      const total = d3.sum(slices, (d) => d.value);
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.3em")
        .attr("fill", "white")
        .attr("font-size", "18px")
        .attr("font-weight", 700)
        .text(formatNumber(total));

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("fill", "rgba(255,255,255,0.7)")
        .attr("font-size", "12px")
        .text("Total");

      // Legend (optional)
      if (showLegend) {
        const legend = svg
          .append("g")
          .attr(
            "transform",
            `translate(${dimensions.margin.left},${dimensions.margin.top})`,
          );

        const legendItem = legend
          .selectAll(".legend-item")
          .data(slices)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (_, i) => `translate(0, ${i * 22})`)
          .attr("opacity", 0);

        legendItem
          .append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", (d, i) => d.color || colorScale(String(i)));

        legendItem
          .append("text")
          .attr("x", 20)
          .attr("y", 11)
          .attr("fill", "rgba(255,255,255,0.9)")
          .attr("font-size", "12px")
          .text((d) => `${d.label} (${formatNumber(d.value)})`);

        anime({
          targets: legendItem.nodes(),
          opacity: [0, 1],
          translateX: [-6, 0],
          delay: anime.stagger(60, { start: 400 }),
          easing: "easeOutCubic",
        });
      }
    },
    data,
    [width, height, innerRadiusRatio],
  );

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
        <p style={{ color: "var(--muted-foreground)" }}>No data available</p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={{ display: "block", maxWidth: "100%" }}
    />
  );
}
