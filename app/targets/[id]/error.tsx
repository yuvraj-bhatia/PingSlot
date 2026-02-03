"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { PageHeader, PageShell } from "../../../components/PageShell";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for target detail pages.
 * Catches errors specific to individual target pages.
 */
export default function TargetErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[Target Error] Error loading target:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHeader>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to dashboard
        </Link>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Error Loading Target
          </h1>
        </div>
      </PageHeader>

      <PageShell>
        <Card variant="glass" className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Failed to load target details
              </h2>
              <p className="text-foreground-muted">
                We couldn&apos;t load the information for this target. This might be a temporary issue.
              </p>
            </div>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg bg-black/40 border border-white/10 p-4 text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="primary">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}
