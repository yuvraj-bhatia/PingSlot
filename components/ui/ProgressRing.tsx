"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  showValue?: boolean;
  color?: "accent" | "success" | "teal" | "error";
  className?: string;
  children?: React.ReactNode;
}

const sizes = {
  sm: 32,
  md: 48,
  lg: 64,
};

const strokeWidths = {
  sm: 3,
  md: 4,
  lg: 5,
};

const colors = {
  accent: {
    stroke: "#00D4FF",
    glow: "0 0 20px rgba(0, 212, 255, 0.5)",
  },
  success: {
    stroke: "#22C55E",
    glow: "0 0 20px rgba(34, 197, 94, 0.5)",
  },
  teal: {
    stroke: "#0057B8",
    glow: "0 0 20px rgba(0, 87, 184, 0.5)",
  },
  error: {
    stroke: "#EF4444",
    glow: "0 0 20px rgba(239, 68, 68, 0.5)",
  },
};

/**
 * ProgressRing - Circular progress indicator.
 * Animated SVG ring that fills based on progress percentage.
 */
export function ProgressRing({
  progress,
  size = "md",
  strokeWidth,
  showValue = false,
  color = "accent",
  className,
  children,
}: ProgressRingProps) {
  const dimension = sizes[size];
  const stroke = strokeWidth ?? strokeWidths[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const colorConfig = colors[color];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(${colorConfig.glow})` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
        {showValue && !children && (
          <span
            className={cn(
              "font-semibold",
              size === "sm" && "text-[10px]",
              size === "md" && "text-xs",
              size === "lg" && "text-sm"
            )}
            style={{ color: colorConfig.stroke }}
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * IndeterminateRing - Spinning progress indicator for unknown progress.
 */
export function IndeterminateRing({
  size = "md",
  color = "accent",
  className,
}: {
  size?: "sm" | "md" | "lg";
  color?: "accent" | "success" | "teal" | "error";
  className?: string;
}) {
  const dimension = sizes[size];
  const stroke = strokeWidths[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const colorConfig = colors[color];

  return (
    <div
      className={cn("relative inline-flex", className)}
      style={{ width: dimension, height: dimension }}
    >
      <motion.svg
        width={dimension}
        height={dimension}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        {/* Background ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={stroke}
        />
        {/* Spinning segment */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          style={{ filter: `drop-shadow(${colorConfig.glow})` }}
        />
      </motion.svg>
    </div>
  );
}

/**
 * ProgressBar - Linear progress indicator.
 */
export function ProgressBar({
  progress,
  color = "accent",
  showValue = false,
  size = "md",
  className,
}: {
  progress: number;
  color?: "accent" | "success" | "teal" | "error";
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colorConfig = colors[color];
  const heights = { sm: "h-1", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("w-full", className)}>
      {showValue && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-foreground-muted">Progress</span>
          <span className="text-xs font-medium" style={{ color: colorConfig.stroke }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-white/[0.1] overflow-hidden",
          heights[size]
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", heights[size])}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${colorConfig.stroke}80, ${colorConfig.stroke})`,
            boxShadow: colorConfig.glow,
          }}
        />
      </div>
    </div>
  );
}

/**
 * PulsingDot - Simple pulsing status indicator.
 */
export function PulsingDot({
  color = "accent",
  size = "md",
  className,
}: {
  color?: "accent" | "success" | "teal" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colorConfig = colors[color];
  const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-3 w-3" };

  return (
    <span className={cn("relative flex", dotSizes[size], className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        )}
        style={{ backgroundColor: colorConfig.stroke }}
      />
      <span
        className={cn("relative inline-flex rounded-full h-full w-full")}
        style={{
          backgroundColor: colorConfig.stroke,
          boxShadow: colorConfig.glow,
        }}
      />
    </span>
  );
}
