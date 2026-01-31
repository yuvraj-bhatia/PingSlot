"use client";

import anime from "animejs/lib/anime.es.js";
import * as d3 from "d3";
import {
  type ChartDimensions,
  DEFAULT_DIMENSIONS,
  formatNumber,
  useD3Chart,
} from "./D3Base";

export interface LineChartDataPoint {
  x: number | Date | string;
  y: number;
  label?: string;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  width?: number;
  height?: number;
  margin?: Partial<ChartDimensions["margin"]>;
  xLabel?: string;
  yLabel?: string;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
  curve?: d3.CurveFactory;
  className?: string;
}

export default function LineChart({
  data,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
  margin = DEFAULT_DIMENSIONS.margin,
  xLabel = "",
  yLabel = "",
  color = "var(--brand-primary-600)",
  showGrid = true,
  showPoints = true,
  curve = d3.curveMonotoneX,
  className = "",
}: LineChartProps) {
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

      const points = chartData as LineChartDataPoint[];

      // Determine if X axis is dates or numbers
      const firstX = points[0]?.x;
      const isDateAxis =
        firstX instanceof Date ||
        (typeof firstX === "string" &&
          !Number.isNaN(Date.parse(firstX)) &&
          Number.isNaN(Number(firstX)));

      // Create scales
      let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;

      if (isDateAxis) {
        xScale = d3
          .scaleTime()
          .domain(
            d3.extent(points, (d) => {
              const x = d.x;
              return x instanceof Date
                ? x
                : typeof x === "string"
                  ? new Date(x)
                  : new Date(Number(x));
            }) as [Date, Date],
          )
          .range([0, innerWidth]);
      } else {
        // Numeric scale
        xScale = d3
          .scaleLinear()
          .domain(
            d3.extent(points, (d) => {
              const x = d.x;
              return typeof x === "number" ? x : Number(x) || 0;
            }) as [number, number],
          )
          .nice()
          .range([0, innerWidth]);
      }

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(points, (d) => d.y) || 0] as [number, number])
        .nice()
        .range([innerHeight, 0]);

      // Create line generator
      const line = d3
        .line<LineChartDataPoint>()
        .x((d) => {
          const x = d.x;
          if (isDateAxis) {
            const xVal =
              x instanceof Date
                ? x
                : typeof x === "string"
                  ? new Date(x)
                  : new Date(Number(x));
            return (xScale as d3.ScaleTime<number, number>)(xVal);
          } else {
            const xVal = typeof x === "number" ? x : Number(x) || 0;
            return (xScale as d3.ScaleLinear<number, number>)(xVal);
          }
        })
        .y((d) => yScale(d.y))
        .curve(curve);

      // Create area generator
      const area = d3
        .area<LineChartDataPoint>()
        .x((d) => {
          const x = d.x;
          if (isDateAxis) {
            const xVal =
              x instanceof Date
                ? x
                : typeof x === "string"
                  ? new Date(x)
                  : new Date(Number(x));
            return (xScale as d3.ScaleTime<number, number>)(xVal);
          } else {
            const xVal = typeof x === "number" ? x : Number(x) || 0;
            return (xScale as d3.ScaleLinear<number, number>)(xVal);
          }
        })
        .y0(innerHeight)
        .y1((d) => yScale(d.y))
        .curve(curve);

      // Append group for chart
      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${dimensions.margin.left},${dimensions.margin.top})`,
        );

      // Add grid lines
      if (showGrid) {
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
      }

      // Add area
      const areaPath = g
        .append("path")
        .datum(points)
        .attr("fill", color)
        .attr("fill-opacity", 0)
        .attr("d", area);

      // Add line
      const linePath = g
        .append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", line);

      // Add points
      if (showPoints) {
        const pointSelection = g
          .selectAll(".point")
          .data(points)
          .enter()
          .append("circle")
          .attr("class", "point")
          .attr("cx", (d) => {
            const x = d.x;
            if (isDateAxis) {
              const xVal =
                x instanceof Date
                  ? x
                  : typeof x === "string"
                    ? new Date(x)
                    : new Date(Number(x));
              return (xScale as d3.ScaleTime<number, number>)(xVal);
            } else {
              const xVal = typeof x === "number" ? x : Number(x) || 0;
              return (xScale as d3.ScaleLinear<number, number>)(xVal);
            }
          })
          .attr("cy", (d) => yScale(d.y))
          .attr("r", 0)
          .attr("fill", color)
          .attr("stroke", "white")
          .attr("stroke-width", 2);

        anime({
          targets: pointSelection.nodes(),
          r: 4,
          opacity: [0, 1],
          delay: anime.stagger(60),
          easing: "spring(1, 80, 8, 4)",
        });
      }

      // Animations
      const totalLength = linePath.node()?.getTotalLength();
      if (totalLength) {
        linePath
          .attr("stroke-dasharray", totalLength)
          .attr("stroke-dashoffset", totalLength);

        anime({
          targets: linePath.node(),
          strokeDashoffset: [totalLength, 0],
          duration: 900,
          easing: "easeOutQuad",
        });
      }

      anime({
        targets: areaPath.node(),
        fillOpacity: [0, 0.1],
        duration: 700,
        easing: "easeOutCubic",
      });

      // Add axes
      const xAxis = isDateAxis
        ? d3
            .axisBottom(xScale as d3.ScaleTime<number, number>)
            .tickFormat(
              d3.timeFormat("%b %d") as (d: Date | d3.NumberValue) => string,
            )
        : d3
            .axisBottom(xScale as d3.ScaleLinear<number, number>)
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
    [width, height, color, showGrid, showPoints],
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
