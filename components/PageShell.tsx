import { cn } from "../lib/cn";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Consistent page container with responsive padding and max-width.
 * Used for header, main content sections, and footer.
 */
export function PageShell({
  children,
  className,
  as: Component = "div",
}: PageShellProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Page header section with consistent vertical spacing and gradient overlay.
 */
export function PageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Background gradient shapes - More prominent blue glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary blue glow - larger and more intense */}
        <div 
          className="absolute -top-32 -left-20 h-[500px] w-[500px] rounded-full blur-[100px] animate-pulse-subtle"
          style={{
            background: "radial-gradient(circle, rgba(0, 119, 255, 0.45) 0%, rgba(0, 87, 184, 0.25) 40%, transparent 70%)",
          }}
        />
        {/* Secondary cyan accent - bottom right */}
        <div 
          className="absolute -bottom-20 -right-24 h-[450px] w-[450px] rounded-full blur-[90px] animate-pulse-subtle"
          style={{
            background: "radial-gradient(circle, rgba(0, 180, 255, 0.35) 0%, rgba(0, 140, 220, 0.2) 35%, transparent 65%)",
            animationDelay: "1s",
          }}
        />
        {/* Tertiary glow - center top for depth */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(ellipse, rgba(0, 100, 255, 0.2) 0%, rgba(0, 87, 184, 0.1) 50%, transparent 80%)",
          }}
        />
      </div>
      
      <PageShell className={cn("relative py-10 md:py-14", className)}>
        {children}
      </PageShell>
    </div>
  );
}

/**
 * Page section with consistent vertical padding.
 */
export function PageSection({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "dark";
}) {
  const variants = {
    default: "",
    highlight: "bg-accent/5 border-y border-accent/10",
    dark: "bg-background-elevated/50",
  };

  return (
    <section className={cn("py-8", variants[variant], className)}>
      <PageShell>{children}</PageShell>
    </section>
  );
}

/**
 * Dashboard container with fade-in animation
 */
export function DashboardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fade-in flex flex-col min-h-full",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Section heading with optional description
 */
export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Grid layout for dashboard cards
 */
export function DashboardGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", colClasses[columns], className)}>
      {children}
    </div>
  );
}
