import { Card, CardContent } from "../ui/Card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No targets yet",
  description = "Add a target to start monitoring appointment availability.",
  action,
}: EmptyStateProps) {
  return (
    <Card variant="glass">
      <CardContent className="py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-accent"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <p className="mt-5 text-lg font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm text-foreground-muted">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
