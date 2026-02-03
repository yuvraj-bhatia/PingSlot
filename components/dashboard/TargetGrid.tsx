import { DashboardGrid } from "../PageShell";

export function TargetGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardGrid columns={3} className={className}>
      {children}
    </DashboardGrid>
  );
}
