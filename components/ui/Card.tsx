import * as React from "react";
import { cn } from "../../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "glow" | "compact";
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
        "shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
        "hover:border-white/[0.15]"
      ),
      glass: cn(
        "bg-[#0B0B0B]/80 border border-white/[0.08]",
        "shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
        "hover:border-white/[0.12]"
      ),
      bordered: cn(
        "bg-[#080808]/90 border-2 border-white/[0.1]",
        "shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
        "hover:border-white/[0.2]"
      ),
      glow: cn(
        "bg-[#111111]/90 border border-white/[0.1]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.6)]",
        "hover:border-white/[0.15]"
      ),
      compact: cn(
        "bg-[#0A0A0A]/90 border border-white/[0.08]",
        "shadow-[0_6px_20px_rgba(0,0,0,0.4)]",
        "hover:border-white/[0.12]"
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
  size?: "default" | "compact";
}

export const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, children, minHeight = "auto", size = "default", style, ...props }, ref) => {
    const sizeStyles = {
      default: "px-6 py-6",
      compact: "px-4 py-4",
    };

    return (
      <div ref={ref} className="relative group" {...props}>
        {/* Subtle glow on hover */}
        <div 
          className="absolute -inset-[1px] rounded-[1.35rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, transparent 50%, rgba(124, 58, 237, 0.08) 100%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden rounded-[1.25rem]",
            "border border-white/[0.08] bg-[#0A0A0A]/85 backdrop-blur-xl",
            "transition-all duration-300",
            "shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
            "hover:border-white/[0.12] hover:shadow-[0_10px_35px_rgba(0,0,0,0.5)]",
            sizeStyles[size],
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
 * KPI Card - Compact design for displaying key metrics.
 * More efficient use of space with horizontal layout option.
 */
interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  layout?: "vertical" | "horizontal";
}

export function KPICard({
  icon,
  title,
  value,
  subtext,
  trend = "neutral",
  className,
  layout = "vertical",
}: KPICardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-foreground-muted",
  };

  const trendIcons = {
    up: (
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V3M6 3L3 6M6 3L9 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    down: (
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3V9M6 9L3 6M6 9L9 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    neutral: null,
  };

  if (layout === "horizontal") {
    return (
      <GlassmorphicCard size="compact" className={className}>
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.1)",
            }}
          >
            <span className="text-accent">{icon}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {value}
              </span>
              {subtext && (
                <span className={cn("flex items-center gap-1 text-xs font-medium", trendColors[trend])}>
                  {trendIcons[trend]}
                  {subtext}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard size="compact" className={className}>
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              boxShadow: "0 0 12px rgba(0, 212, 255, 0.1)",
            }}
          >
            <span className="text-accent">{icon}</span>
          </div>
          <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
            {title}
          </span>
        </div>
        
        {/* Value row */}
        <div className="flex items-end justify-between gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
          {subtext && (
            <span className={cn("flex items-center gap-1 text-xs font-medium pb-1", trendColors[trend])}>
              {trendIcons[trend]}
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
  minHeight = "auto",
}: DashboardCardProps) {
  return (
    <GlassmorphicCard 
      minHeight={minHeight} 
      className={cn("gap-4", className)}
    >
      <div className="flex flex-col gap-4">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.1)",
            }}
          >
            <span className="text-accent">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
        </div>
        {/* Description/content */}
        {description && (
          <p className="text-sm text-foreground-muted leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Stat Card - Ultra-compact metric display
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        "bg-white/[0.03] border border-white/[0.06]",
        "transition-all duration-200 hover:bg-white/[0.05]",
        className
      )}
    >
      {icon && (
        <span className="text-accent flex-shrink-0">{icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-muted truncate">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
