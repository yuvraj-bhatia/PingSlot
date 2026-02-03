import { KPICard } from "../ui/Card";
import { DashboardGrid } from "../PageShell";

export interface QuickStatItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}

interface QuickStatsProps {
  items: QuickStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickStats({ items, columns = 4, className }: QuickStatsProps) {
  return (
    <DashboardGrid columns={columns} className={className}>
      {items.map((item, index) => (
        <KPICard
          key={`${item.title}-${index}`}
          icon={item.icon ?? <span className="h-5 w-5" />}
          title={item.title}
          value={item.value}
          subtext={item.subtext}
          trend={item.trend}
        />
      ))}
    </DashboardGrid>
  );
}
