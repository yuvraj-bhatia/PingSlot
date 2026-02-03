"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the application.
 * Catches unhandled errors and displays a user-friendly error page.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console (in production, send to error tracking service)
    console.error("[Error Boundary] Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card variant="glass" className="max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-foreground-muted">
              An unexpected error occurred. Don&apos;t worry, your data is safe.
            </p>
          </div>

          {/* Error Details (development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-black/40 border border-white/10 p-4 text-left">
              <p className="text-xs font-mono text-red-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-foreground-muted">
                  Error ID: {error.digest}
                </p>
              )}
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
                <Home className="h-4 w-4" />
                Go to dashboard
              </Link>
            </Button>
          </div>

          {/* Support Note */}
          <p className="text-xs text-foreground-muted">
            If this problem persists, please refresh the page or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
