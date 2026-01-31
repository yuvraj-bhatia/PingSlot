"use client";

import anime from "animejs/lib/anime.es.js";
import * as d3 from "d3";
import {
  type ChartDimensions,
  DEFAULT_DIMENSIONS,
  formatNumber,
  useD3Chart,
} from "./D3Base";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  margin?: Partial<ChartDimensions["margin"]>;
  xLabel?: string;
  yLabel?: string;
  horizontal?: boolean;
  showValues?: boolean;
  className?: string;
}

export default function BarChart({
  data,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
  margin = DEFAULT_DIMENSIONS.margin,
  xLabel = "",
  yLabel = "",
  horizontal = false,
  showValues = true,
  className = "",
}: BarChartProps) {
  const dimensions = {
    width,
    height,
    margin: { ...DEFAULT_DIMENSIONS.margin, ...margin },
  };

  const innerWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const innerHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // Create a color scale that cycles through colors
  const defaultColors = [
    "var(--brand-primary-600)",
    "var(--brand-primary-500)",
    "var(--brand-primary-400)",
    "var(--success)",
    "var(--warning)",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
  ];

  const getBarColor = (index: number, customColor?: string): string => {
    if (customColor) return customColor;
    return defaultColors[index % defaultColors.length];
  };

  const svgRef = useD3Chart<SVGSVGElement>(
    (svg, chartData) => {
      if (!chartData || chartData.length === 0) return;

      const bars = chartData as BarChartDataPoint[];
      const maxValue = d3.max(bars, (d) => d.value) || 0;

      if (horizontal) {
        // Horizontal bars
        const yScale = d3
          .scaleBand()
          .domain(bars.map((d) => d.label))
          .range([0, innerHeight])
          .padding(0.2);

        const xScale = d3
          .scaleLinear()
          .domain([0, maxValue])
          .nice()
          .range([0, innerWidth]);

        const g = svg
          .append("g")
          .attr(
            "transform",
            `translate(${dimensions.margin.left},${dimensions.margin.top})`,
          );

        // Add bars
        const barsSelection = g
          .selectAll(".bar")
          .data(bars)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => yScale(d.label) || 0)
          .attr("height", yScale.bandwidth())
          .attr("x", 0)
          .attr("width", 0)
          .attr("fill", (d, i) => getBarColor(i, d.color))
          .attr("rx", 4);

        anime({
          targets: barsSelection.nodes(),
          width: (_el: Element, i: number) => {
            const datum = bars[i];
            return datum ? xScale(datum.value) : 0;
          },
          easing: "easeOutCubic",
          duration: 650,
          delay: anime.stagger(60),
        });

        // Add value labels
        if (showValues) {
          g.selectAll(".value-label")
            .data(bars)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", (d) => xScale(d.value) + 5)
            .attr("y", (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("fill", "var(--foreground)")
            .attr("font-size", "12px")
            .attr("font-weight", "500")
            .text((d) => formatNumber(d.value));
        }

        // Add axes
        const xAxis = d3
          .axisBottom(xScale)
          .tickFormat((d) => formatNumber(Number(d)));
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(xAxis)
          .attr("color", "var(--muted-foreground)")
          .attr("font-size", "12px");

        g.append("g")
          .call(yAxis)
          .attr("color", "var(--muted-foreground)")
          .attr("font-size", "12px");
      } else {
        // Vertical bars
        const xScale = d3
          .scaleBand()
          .domain(bars.map((d) => d.label))
          .range([0, innerWidth])
          .padding(0.2);

        const yScale = d3
          .scaleLinear()
          .domain([0, maxValue])
          .nice()
          .range([innerHeight, 0]);

        const g = svg
          .append("g")
          .attr(
            "transform",
            `translate(${dimensions.margin.left},${dimensions.margin.top})`,
          );

        // Add bars
        const barsSelection = g
          .selectAll(".bar")
          .data(bars)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => xScale(d.label) || 0)
          .attr("width", xScale.bandwidth())
          .attr("y", innerHeight)
          .attr("height", 0)
          .attr("fill", (d, i) => getBarColor(i, d.color))
          .attr("rx", 4);

        anime({
          targets: barsSelection.nodes(),
          y: (_el: Element, i: number) => {
            const datum = bars[i];
            return datum ? yScale(datum.value) : yScale(0);
          },
          height: (_el: Element, i: number) => {
            const datum = bars[i];
            return datum ? innerHeight - yScale(datum.value) : 0;
          },
          easing: "easeOutCubic",
          duration: 650,
          delay: anime.stagger(60),
        });

        // Add value labels
        if (showValues) {
          g.selectAll(".value-label")
            .data(bars)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
            .attr("y", (d) => yScale(d.value) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "var(--foreground)")
            .attr("font-size", "11px")
            .attr("font-weight", "500")
            .text((d) => formatNumber(d.value));
        }

        // Add axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3
          .axisLeft(yScale)
          .tickFormat((d) => formatNumber(Number(d)));

        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(xAxis)
          .attr("color", "var(--muted-foreground)")
          .attr("font-size", "12px")
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

        g.append("g")
          .call(yAxis)
          .attr("color", "var(--muted-foreground)")
          .attr("font-size", "12px");
      }

      // Add labels
      if (xLabel && !horizontal) {
        svg
          .append("text")
          .attr(
            "transform",
            `translate(${dimensions.width / 2}, ${dimensions.height - 5})`,
          )
          .style("text-anchor", "middle")
          .attr("fill", "var(--muted-foreground)")
          .attr("font-size", "14px")
          .text(xLabel);
      }

      if (yLabel && !horizontal) {
        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 15)
          .attr("x", -dimensions.height / 2)
          .style("text-anchor", "middle")
          .attr("fill", "var(--muted-foreground)")
          .attr("font-size", "14px")
          .text(yLabel);
      }
    },
    data,
    [width, height, horizontal, showValues],
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
