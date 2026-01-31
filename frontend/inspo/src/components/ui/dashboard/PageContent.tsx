import type { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standardized content wrapper for all dashboard pages
 * Ensures consistent padding, max-width, and layout structure
 */
export function PageContent({ children, className = "" }: PageContentProps) {
  const classes = ["dashboard-container", "fade-in", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {children}
    </div>
  );
}
