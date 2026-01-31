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
 * Page header section with consistent vertical spacing.
 */
export function PageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-8 md:py-12", className)}>
      {children}
    </div>
  );
}

/**
 * Page section with consistent vertical padding.
 */
export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-6", className)}>
      {children}
    </section>
  );
}
