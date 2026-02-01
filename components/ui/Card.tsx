import * as React from "react";
import { cn } from "../../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "glow" | "blue-glow";
}

/**
 * Card component with glass-like surfaces and restrained shadows.
 * Supports multiple variants for different use cases.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: cn(
        "bg-[#0D0D0D]/95 border border-white/[0.08]",
        "shadow-[0_15px_45px_rgba(0,0,0,0.55)]",
        "hover:border-white/[0.18]"
      ),
      glass: cn(
        "bg-[#0B0B0B]/80 border border-white/[0.08]",
        "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:border-white/[0.15]"
      ),
      bordered: cn(
        "bg-[#080808]/90 border-2 border-white/[0.1]",
        "shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
        "hover:border-white/[0.2]"
      ),
      glow: cn(
        "bg-[#111111]/90 border border-white/[0.1]",
        "shadow-[0_25px_60px_rgba(0,0,0,0.65)]",
        "hover:border-white/[0.15]"
      ),
      "blue-glow": cn(
        "bg-[#0D0D0D]/90 border border-white/[0.1]",
        "shadow-[0_18px_45px_rgba(0,0,0,0.55)]",
        "hover:border-white/[0.15]"
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  minHeight?: string;
}

export const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, children, minHeight = "auto", style, ...props }, ref) => {
    return (
      <div ref={ref} className="relative group" {...props}>
        {/* Subtle blue glow on hover */}
        <div 
          className="absolute -inset-[1px] rounded-[1.35rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(0, 119, 255, 0.15) 0%, transparent 50%, rgba(0, 180, 255, 0.1) 100%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden rounded-[1.25rem]",
            "border border-white/[0.1] bg-[#0A0A0A]/80 backdrop-blur-xl",
            "px-6 py-6 transition-all duration-300",
            "shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
            "hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
            className
          )}
          style={{ minHeight, ...style }}
        >
          {children}
        </div>
      </div>
    );
  }
);

GlassmorphicCard.displayName = "GlassmorphicCard";

/**
 * Card header section with consistent padding.
 */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-6 pb-2", className)}
      {...props}
    />
  );
}

/**
 * Card title with proper typography.
 */
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card description text.
 */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-foreground-muted", className)}
      {...props}
    />
  );
}

/**
 * Card content section with consistent padding.
 */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-4", className)} {...props} />;
}

/**
 * Card footer section with consistent padding.
 */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-6 pt-2 border-t border-white/[0.05]",
        className
      )}
      {...props}
    />
  );
}

/**
 * KPI Card - for displaying key metrics with icon.
 * Uses GlassmorphicCard shell for consistent spacing.
 */
interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KPICard({
  icon,
  title,
  value,
  subtext,
  trend = "neutral",
  className,
}: KPICardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-[#888888]",
  };

  return (
    <GlassmorphicCard 
      minHeight="10rem" 
      className={className}
    >
      <div className="relative flex flex-1 flex-col justify-between gap-3">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8000]/20 to-[#FF8000]/5 border border-[#FF8000]/30 text-[#FF8000] flex-shrink-0"
            style={{
              boxShadow: "0 0 20px rgba(255, 128, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            {icon}
          </div>
          <span className="text-sm font-medium text-[#888888]">
            {title}
          </span>
        </div>
        {/* Value and subtext */}
        <div className="flex flex-col gap-1">
          <span className="text-[2.25rem] leading-[2.75rem] font-bold text-[#F8F4F0] tracking-tight">
            {value}
          </span>
          {subtext && (
            <span className={cn("text-xs font-medium", trendColors[trend])}>
              {subtext}
            </span>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Dashboard Card - for displaying content sections with icon and title.
 * Uses GlassmorphicCard shell for consistent spacing.
 */
interface DashboardCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export function DashboardCard({
  icon,
  title,
  description,
  children,
  className,
  minHeight = "14rem",
}: DashboardCardProps) {
  return (
    <GlassmorphicCard 
      minHeight={minHeight} 
      className={cn("gap-6", className)}
    >
      <div className="relative flex flex-1 flex-col justify-between gap-3">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8000]/20 to-[#FF8000]/5 border border-[#FF8000]/30 text-[#FF8000] flex-shrink-0"
            style={{
              boxShadow: "0 0 20px rgba(255, 128, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            {icon}
          </div>
          <h3 className="text-xl font-semibold leading-tight text-[#F8F4F0]">
            {title}
          </h3>
        </div>
        {/* Description/content */}
        {description && (
          <div className="text-sm leading-relaxed text-[#888888]">
            {description}
          </div>
        )}
        {children}
      </div>
    </GlassmorphicCard>
  );
}
