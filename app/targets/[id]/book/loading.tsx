import { Card, CardContent } from "../../../../components/ui/Card";
import { PageHeader, PageShell } from "../../../../components/PageShell";

/**
 * Loading state for the Auto-Book page.
 */
export default function AutoBookLoading() {
  return (
    <div className="min-h-screen">
      <PageHeader>
        <div className="h-4 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-6 space-y-2">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </PageHeader>

      <PageShell className="pb-16">
        <div className="grid gap-6 lg:grid-cols-5 lg:h-[calc(100vh-16rem)] lg:min-h-[600px]">
          {/* Left Panel Skeleton */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="animate-pulse">
              <CardContent className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
                  <div className="h-6 w-32 rounded-lg bg-white/[0.06]" />
                </div>
                
                {/* Form fields */}
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-12 rounded-xl bg-white/[0.04]" />
                    <div className="h-12 rounded-xl bg-white/[0.04]" />
                  </div>
                  <div className="h-12 rounded-xl bg-white/[0.04]" />
                  <div className="h-12 rounded-xl bg-white/[0.04]" />
                  <div className="h-12 rounded-xl bg-accent/10" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel Skeleton */}
          <div className="lg:col-span-3 min-h-[400px] lg:min-h-0">
            <div className="h-full rounded-2xl border border-white/[0.1] bg-[#0A0A0A] animate-pulse">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-white/[0.1]" />
                  <div className="h-3 w-3 rounded-full bg-white/[0.1]" />
                  <div className="h-3 w-3 rounded-full bg-white/[0.1]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-lg bg-white/[0.05]" />
                </div>
              </div>
              
              {/* Content area */}
              <div className="flex h-[calc(100%-3rem)] items-center justify-center p-8">
                <div className="w-3/4 max-w-md space-y-4">
                  <div className="h-12 rounded-lg bg-white/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
                    <div className="h-4 w-1/2 rounded bg-white/[0.04]" />
                    <div className="h-4 w-5/6 rounded bg-white/[0.04]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
