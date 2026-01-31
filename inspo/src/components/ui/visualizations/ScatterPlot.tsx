"use client";

import anime from "animejs/lib/anime.es.js";
import * as d3 from "d3";
import {
  type ChartDimensions,
  DEFAULT_DIMENSIONS,
  formatNumber,
  useD3Chart,
} from "./D3Base";

export interface ScatterPlotDataPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  size?: number;
}

export interface ScatterPlotProps {
  data: ScatterPlotDataPoint[];
  width?: number;
  height?: number;
  margin?: Partial<ChartDimensions["margin"]>;
  xLabel?: string;
  yLabel?: string;
  showTrendLine?: boolean;
  className?: string;
}

export default function ScatterPlot({
  data,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
  margin = DEFAULT_DIMENSIONS.margin,
  xLabel = "",
  yLabel = "",
  showTrendLine = false,
  className = "",
}: ScatterPlotProps) {
  const dimensions = {
    width,
    height,
    margin: { ...DEFAULT_DIMENSIONS.margin, ...margin },
  };

  const innerWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const innerHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const svgRef = useD3Chart<SVGSVGElement>(
    (svg, chartData) => {
      if (!chartData || chartData.length === 0) return;

      const points = chartData as ScatterPlotDataPoint[];

      // Create scales
      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(points, (d) => d.x) as [number, number])
        .nice()
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(points, (d) => d.y) as [number, number])
        .nice()
        .range([innerHeight, 0]);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${dimensions.margin.left},${dimensions.margin.top})`,
        );

      // Add grid
      const xAxisGrid = d3
        .axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => "");
      const yAxisGrid = d3
        .axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => "");

      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxisGrid)
        .attr("stroke", "var(--input-border)")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

      g.append("g")
        .attr("class", "grid")
        .call(yAxisGrid)
        .attr("stroke", "var(--input-border)")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

      // Add trend line if requested
      let trendPath: d3.Selection<
        SVGPathElement,
        [number, number][],
        null,
        undefined
      > | null = null;

      if (showTrendLine && points.length > 1) {
        // Calculate linear regression
        const n = points.length;
        const sumX = d3.sum(points, (d) => d.x);
        const sumY = d3.sum(points, (d) => d.y);
        const sumXY = d3.sum(points, (d) => d.x * d.y);
        const sumXX = d3.sum(points, (d) => d.x * d.x);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const linearRegression = (x: number) => slope * x + intercept;

        const trendLine = d3
          .line<[number, number]>()
          .x((d) => xScale(d[0]))
          .y((d) => yScale(d[1]));

        const xDomain = xScale.domain();
        const trendData: [number, number][] = [
          [xDomain[0], linearRegression(xDomain[0])],
          [xDomain[1], linearRegression(xDomain[1])],
        ];

        trendPath = g
          .append("path")
          .datum(trendData)
          .attr("fill", "none")
          .attr("stroke", "var(--brand-primary-600)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0.7)
          .attr("d", trendLine);
      }

      // Add points
      const pointSelection = g
        .selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 0)
        .attr("fill", (d) => d.color || colorScale(d.label || "default"))
        .attr("opacity", 0.7)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);

      anime({
        targets: pointSelection.nodes(),
        r: (_el: Element, i: number) => {
          const datum = points[i];
          return datum?.size || 5;
        },
        opacity: [0, 0.85],
        delay: anime.stagger(40),
        easing: "easeOutBack",
        duration: 650,
      });

      if (trendPath) {
        const length = trendPath.node()?.getTotalLength();
        if (length) {
          trendPath
            .attr("stroke-dasharray", length)
            .attr("stroke-dashoffset", length);

          anime({
            targets: trendPath.node(),
            strokeDashoffset: [length, 0],
            duration: 800,
            easing: "easeOutQuad",
          });
        }
      }

      // Add axes
      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((d) => formatNumber(Number(d)));
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => formatNumber(Number(d)));

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("color", "var(--muted-foreground)")
        .attr("font-size", "12px");

      g.append("g")
        .call(yAxis)
        .attr("color", "var(--muted-foreground)")
        .attr("font-size", "12px");

      // Add labels
      if (xLabel) {
        g.append("text")
          .attr(
            "transform",
            `translate(${innerWidth / 2}, ${innerHeight + 35})`,
          )
          .style("text-anchor", "middle")
          .attr("fill", "var(--muted-foreground)")
          .attr("font-size", "14px")
          .text(xLabel);
      }

      if (yLabel) {
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -dimensions.margin.left + 15)
          .attr("x", -innerHeight / 2)
          .style("text-anchor", "middle")
          .attr("fill", "var(--muted-foreground)")
          .attr("font-size", "14px")
          .text(yLabel);
      }
    },
    data,
    [width, height, showTrendLine],
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
