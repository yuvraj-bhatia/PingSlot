"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * Skeleton - Loading placeholder component with multiple variants.
 * Supports pulse and shimmer animations for different loading states.
 */
export default function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: "rounded-xl",
    text: "rounded-md h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    shimmer: "skeleton-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-white/[0.06]",
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton text line with realistic proportions.
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton card for KPI/stat cards.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-4",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-3 w-20" variant="text" />
      </div>
      <Skeleton className="h-8 w-16" variant="text" />
      <Skeleton className="h-3 w-24 mt-2" variant="text" />
    </div>
  );
}

/**
 * Skeleton for target list rows.
 */
export function SkeletonTargetRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-6 py-4 border-b border-white/[0.04]",
        className
      )}
    >
      <Skeleton className="h-5 w-5 rounded-full" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" variant="text" />
        <Skeleton className="h-3 w-32" variant="text" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-3 w-24" variant="text" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

/**
 * Skeleton for target cards (mobile view).
 */
export function SkeletonTargetCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" variant="text" />
          <Skeleton className="h-3 w-32" variant="text" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard page.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Targets List */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTargetRow key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for target detail page.
 */
export function TargetDetailSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" variant="text" />
        <Skeleton className="h-10 w-64" variant="text" />
        <Skeleton className="h-4 w-48" variant="text" />
      </div>

      {/* Status Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" variant="text" />
            <Skeleton className="h-4 w-32" variant="text" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard className="p-6" />
        <SkeletonCard className="p-6" />
      </div>

      {/* History */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-6">
        <Skeleton className="h-6 w-32 mb-6" variant="text" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4 rounded-full" variant="circular" />
              <Skeleton className="h-4 flex-1" variant="text" />
              <Skeleton className="h-4 w-24" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for booking page.
 */
export function BookingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5 animate-fade-in">
      {/* Left Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
                <Skeleton className="h-4 flex-1" variant="text" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-6 space-y-4">
          <Skeleton className="h-6 w-32" variant="text" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" variant="text" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
      </div>

      {/* Right Panel - Browser Stream */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 aspect-video flex items-center justify-center">
          <div className="text-center space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" variant="text" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add shimmer animation to globals.css
// .skeleton-shimmer {
//   background: linear-gradient(
//     90deg,
//     rgba(255, 255, 255, 0.03) 0%,
//     rgba(255, 255, 255, 0.08) 50%,
//     rgba(255, 255, 255, 0.03) 100%
//   );
//   background-size: 200% 100%;
//   animation: shimmer 2s linear infinite;
// }
