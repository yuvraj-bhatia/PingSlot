import Link from "next/link";
import { Card, CardContent } from "../ui/Card";
import { StatusBadge } from "../StatusBadge";
import type { TargetSummary } from "../../lib/apiTypes";
import { formatHumanDate, formatRelativeTime } from "../../lib/formatters";

interface TargetCardProps {
  target: TargetSummary;
  className?: string;
}

export function TargetCard({ target, className }: TargetCardProps) {
  return (
    <Card variant="glass" className={className}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/targets/${target.id}`}
              className="text-lg font-semibold text-foreground hover:text-accent transition-colors"
            >
              {target.name}
            </Link>
            <p className="mt-1 text-xs text-foreground-muted">
              {target.bookingUrl ? new URL(target.bookingUrl).hostname : "No booking URL"}
            </p>
          </div>
          <StatusBadge status={target.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-foreground-muted">
          <div>
            <p className="uppercase tracking-wider text-[10px]">Next slot</p>
            <p className="mt-1 text-foreground">
              {target.nextSlotTime ? formatHumanDate(target.nextSlotTime) : "—"}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-[10px]">Last checked</p>
            <p className="mt-1 text-foreground">
              {target.lastCheckedAt ? formatRelativeTime(target.lastCheckedAt) : "Never"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
