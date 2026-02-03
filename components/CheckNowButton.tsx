"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, RefreshCw } from "lucide-react";
import { SimpleTooltip } from "./ui/Tooltip";
import { IndeterminateRing } from "./ui/ProgressRing";

interface CheckNowButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  progress?: number; // 0-100, optional progress indicator
}

/**
 * Primary action button to start a check run with gradient styling.
 * Features improved loading state with animated progress indicator.
 */
export function CheckNowButton({
  onClick,
  isLoading,
  disabled,
  progress,
}: CheckNowButtonProps) {
  return (
    <SimpleTooltip content="Check all active targets for availability">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="relative min-w-[150px] overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl font-semibold h-11 px-5 text-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
        style={{
          backgroundColor: "#00D4FF",
          color: "#0A0A0A",
          border: "2px solid rgba(0, 212, 255, 0.3)",
          boxShadow: "0 0 20px rgba(0,212,255,0.5), 0 8px 32px rgba(0,212,255,0.35)",
        }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <IndeterminateRing size="sm" color="accent" className="brightness-0 invert" />
              <span>Checking...</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Play className="h-4 w-4" />
              <span>Check now</span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Progress bar overlay */}
        {isLoading && progress !== undefined && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white/30"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </button>
    </SimpleTooltip>
  );
}

/**
 * Compact check button for inline use.
 */
export function CheckNowButtonCompact({
  onClick,
  isLoading,
  disabled,
}: Omit<CheckNowButtonProps, "progress">) {
  return (
    <SimpleTooltip content="Run check now">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isLoading ? "Checking..." : "Run check now"}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>
    </SimpleTooltip>
  );
}
