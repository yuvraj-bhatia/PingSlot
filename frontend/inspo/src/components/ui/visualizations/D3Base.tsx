"use client";

import * as d3 from "d3";
import type React from "react";
import { useEffect, useRef } from "react";

export interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export const DEFAULT_DIMENSIONS: ChartDimensions = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 60 },
};

export interface BaseChartProps {
  data: unknown[];
  width?: number;
  height?: number;
  margin?: Partial<ChartDimensions["margin"]>;
  className?: string;
  color?: string;
}

/**
 * Base hook for D3 charts with responsive sizing
 */
export function useD3Chart<T extends SVGSVGElement>(
  renderFn: (
    svg: d3.Selection<T, unknown, null, undefined>,
    data: unknown[],
  ) => void,
  data: unknown[],
  dependencies: React.DependencyList = [],
) {
  const svgRef = useRef<T>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    renderFn(svg, data);
  }, [data, ...dependencies, renderFn]);

  return svgRef;
}

/**
 * Get responsive chart dimensions
 */
export function getChartDimensions(
  containerWidth: number,
  defaultDimensions: ChartDimensions = DEFAULT_DIMENSIONS,
): ChartDimensions {
  const maxWidth = Math.min(containerWidth - 40, defaultDimensions.width);
  return {
    width: maxWidth,
    height: defaultDimensions.height,
    margin: defaultDimensions.margin,
  };
}

/**
 * Create color scale
 */
export function createColorScale(
  domain: number[],
  colors: string[] = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
): d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string, never> {
  if (domain.length <= colors.length) {
    return d3.scaleOrdinal<string>().domain(domain.map(String)).range(colors);
  }
  return d3.scaleSequential(d3.interpolateViridis).domain(domain);
}

/**
 * Format numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(decimals)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d3.timeFormat("%b %d, %Y")(d);
}
