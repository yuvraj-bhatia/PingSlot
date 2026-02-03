"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Monitor, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import type { BookingStatus } from "../../lib/apiTypes";

interface BrowserStreamProps {
  screenshot?: string;
  status: BookingStatus;
  error?: string;
  className?: string;
}

/**
 * Browser stream display component for showing Playwright screenshots.
 * Shows loading skeleton, error state, or actual screenshot.
 */
export function BrowserStream({
  screenshot,
  status,
  error,
  className,
}: BrowserStreamProps) {
  const isLoading = status === "pending" || (!screenshot && status !== "failed" && status !== "cancelled");
  const hasError = status === "failed" || status === "cancelled";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-2xl",
        "border border-white/[0.1] bg-[#0A0A0A]",
        className
      )}
    >
      {/* Browser chrome header */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-error/80" />
          <div className="h-3 w-3 rounded-full bg-warning/80" />
          <div className="h-3 w-3 rounded-full bg-success/80" />
        </div>
        
        {/* URL bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5">
            <Monitor className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="text-xs text-foreground-muted truncate">
              {status === "pending" && "Initializing browser..."}
              {status === "navigating" && "Loading page..."}
              {status === "finding_slots" && "Scanning for slots..."}
              {status === "selecting" && "Selecting slot..."}
              {status === "filling_form" && "Filling form..."}
              {status === "confirming" && "Confirming booking..."}
              {status === "success" && "Booking complete!"}
              {(status === "failed" || status === "cancelled") && "Session ended"}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isLoading && !hasError && (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          )}
          {status === "success" && (
            <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          )}
          {hasError && (
            <div className="h-2 w-2 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {isLoading && !hasError && !screenshot && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]"
            >
              {/* Animated browser skeleton */}
              <div className="relative w-3/4 max-w-md">
                <div className="animate-pulse space-y-4">
                  {/* Header skeleton */}
                  <div className="h-12 rounded-lg bg-white/[0.06]" />
                  {/* Content skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
                    <div className="h-4 w-1/2 rounded bg-white/[0.04]" />
                    <div className="h-4 w-5/6 rounded bg-white/[0.04]" />
                  </div>
                  {/* Form skeleton */}
                  <div className="space-y-3 pt-4">
                    <div className="h-10 rounded-lg bg-white/[0.06]" />
                    <div className="h-10 rounded-lg bg-white/[0.06]" />
                    <div className="h-10 w-1/3 rounded-lg bg-accent/20" />
                  </div>
                </div>
                
                {/* Scanning overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent"
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {status === "pending" && "Starting browser automation..."}
                  {status === "navigating" && "Loading booking page..."}
                  {status === "finding_slots" && "Scanning for available slots..."}
                  {status === "selecting" && "Selecting the best slot..."}
                  {status === "filling_form" && "Filling in your details..."}
                  {status === "confirming" && "Confirming your booking..."}
                </span>
              </div>
            </motion.div>
          )}

          {/* Screenshot display */}
          {screenshot && !hasError && (
            <motion.div
              key="screenshot"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <img
                src={screenshot}
                alt="Browser screenshot"
                className="h-full w-full object-contain"
              />
              
              {/* Live indicator */}
              {status !== "success" && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
                  <span className="text-xs font-medium text-white">LIVE</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Error state */}
          {hasError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A] p-8"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 border border-error/30">
                <AlertCircle className="h-10 w-10 text-error" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {status === "cancelled" ? "Booking Cancelled" : "Booking Failed"}
                </p>
                {error && (
                  <p className="mt-2 max-w-md text-sm text-foreground-muted">
                    {error}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty state (no screenshot yet, but not loading) */}
          {!screenshot && !isLoading && !hasError && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.1]">
                <ImageIcon className="h-8 w-8 text-foreground-muted" />
              </div>
              <p className="text-sm text-foreground-muted">
                Waiting for browser stream...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
