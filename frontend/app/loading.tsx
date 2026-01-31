import { PageShell } from "../components/PageShell";
import { Card, CardContent } from "../components/ui/Card";

export default function DashboardLoading() {
  return (
    <PageShell>
      <div className="py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      
      <div className="space-y-4 pb-12">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-1/3 rounded bg-muted" />
                  <div className="h-6 w-20 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
