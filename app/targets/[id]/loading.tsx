import { PageShell } from "../../../components/PageShell";
import { Card, CardContent } from "../../../components/ui/Card";

export default function TargetDetailLoading() {
  return (
    <PageShell>
      <div className="py-8">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded bg-muted" />
      </div>
      
      <div className="grid gap-6 pb-12 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardContent className="py-12">
            <div className="space-y-4">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-pulse">
          <CardContent className="py-12">
            <div className="space-y-4">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
