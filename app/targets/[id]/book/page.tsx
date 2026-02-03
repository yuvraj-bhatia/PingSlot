"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, AlertTriangle, Zap } from "lucide-react";
import { PageHeader, PageShell } from "../../../../components/PageShell";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { StatusBadge } from "../../../../components/StatusBadge";
import {
  StepIndicator,
  StepIndicatorCompact,
  BrowserStream,
  ConfirmationCard,
  UserProfileForm,
} from "../../../../components/booking";
import { useTarget, useBookingSession } from "../../../../lib/hooks";
import { useToastHelpers } from "../../../../components/ToastProvider";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { ConfettiCelebration } from "../../../../components/ConfettiCelebration";
import type { UserProfile } from "../../../../lib/apiTypes";

interface AutoBookPageProps {
  params: { id: string };
}

type PageState = "form" | "booking" | "success" | "error";

/**
 * Auto-Book Page - Split-screen layout for automated booking.
 * Left panel: Control panel with step indicator and actions
 * Right panel: Browser stream showing Playwright screenshots
 */
export default function AutoBookPage({ params }: AutoBookPageProps) {
  const { data: target, isLoading: targetLoading, error: targetError } = useTarget(params.id);
  const { success: showSuccess, error: showError } = useToastHelpers();
  
  const [pageState, setPageState] = useState<PageState>("form");
  const [showConfetti, setShowConfetti] = useState(false);
  
  const booking = useBookingSession(params.id, {
    onStatusChange: (status) => {
      if (status === "success") {
        setPageState("success");
        setShowConfetti(true);
        showSuccess("Booking complete!", "Your appointment has been booked successfully.");
      } else if (status === "failed" || status === "cancelled") {
        setPageState("error");
      }
    },
    onError: (error) => {
      showError("Booking failed", error);
    },
  });

  const handleStartBooking = useCallback(
    async (userProfile: UserProfile) => {
      setPageState("booking");
      await booking.start(userProfile);
    },
    [booking]
  );

  const handleCancel = useCallback(async () => {
    await booking.cancel();
    setPageState("form");
  }, [booking]);

  const handleRetry = useCallback(() => {
    setPageState("form");
  }, []);

  // Loading state
  if (targetLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader>
          <div className="h-4 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-white/[0.06]" />
        </PageHeader>
        <PageShell>
          <div className="grid h-[calc(100vh-16rem)] gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 animate-pulse">
              <Card variant="glass" className="h-full">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="h-8 w-48 rounded-lg bg-white/[0.06]" />
                    <div className="h-24 rounded-xl bg-white/[0.04]" />
                    <div className="h-64 rounded-xl bg-white/[0.04]" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3 animate-pulse">
              <div className="h-full rounded-2xl bg-white/[0.04]" />
            </div>
          </div>
        </PageShell>
      </div>
    );
  }

  // Error state
  if (targetError || !target) {
    return (
      <div className="min-h-screen">
        <PageShell>
          <div className="py-20 text-center" role="alert">
            <p className="text-xl font-semibold text-error">
              {targetError ? "Failed to load target" : "Target not found"}
            </p>
            <p className="mt-2 text-foreground-muted">
              {targetError?.message || "The target you're looking for doesn't exist."}
            </p>
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </PageShell>
      </div>
    );
  }

  // Check if target has availability
  if (target.status !== "available" && pageState === "form") {
    return (
      <div className="min-h-screen">
        <PageHeader>
          <Link
            href={`/targets/${params.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to target
          </Link>

          <div className="mt-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Auto-Book: {target.name}
            </h1>
          </div>
        </PageHeader>

        <PageShell>
          <Card variant="glass" className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 border border-warning/30">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  No Slots Available
                </h2>
                <p className="text-foreground-muted">
                  Auto-booking is only available when there are open appointment slots.
                  Current status:
                </p>
                <div className="flex justify-center pt-2">
                  <StatusBadge status={target.status} size="lg" />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button asChild variant="secondary">
                  <Link href={`/targets/${params.id}`}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Target
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Confetti celebration on success */}
      <ConfettiCelebration 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />

      <PageHeader>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Targets", href: "/targets" },
            { label: target.name, href: `/targets/${params.id}` },
            { label: "Auto-Book" },
          ]}
          className="mb-4"
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)",
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.15)",
                }}
              >
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Auto-Book
              </h1>
            </div>
            <p className="text-sm text-foreground-muted">
              Automated booking for <span className="text-foreground font-medium">{target.name}</span>
            </p>
          </div>
          
          {booking.isActive && (
            <Button variant="danger" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel Booking
            </Button>
          )}
        </div>
      </PageHeader>

      <PageShell className="pb-16">
        {/* Split-screen layout */}
        <div className="grid gap-6 lg:grid-cols-5 lg:h-[calc(100vh-16rem)] lg:min-h-[600px]">
          {/* Left Panel - Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Form State */}
              {pageState === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserProfileForm
                    onSubmit={handleStartBooking}
                    isLoading={booking.status === "pending"}
                  />
                </motion.div>
              )}

              {/* Booking State */}
              {pageState === "booking" && (
                <motion.div
                  key="booking"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step Indicator - Desktop */}
                  <Card variant="glass" className="hidden lg:block">
                    <CardContent className="p-6">
                      <StepIndicator
                        currentStep={booking.currentStep}
                        status={booking.status}
                      />
                    </CardContent>
                  </Card>

                  {/* Step Indicator - Mobile */}
                  <Card variant="glass" className="lg:hidden">
                    <CardContent className="p-4">
                      <StepIndicatorCompact
                        currentStep={booking.currentStep}
                        status={booking.status}
                      />
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card variant="glass">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground-muted">
                          Status
                        </span>
                        <div className="flex items-center gap-2">
                          {booking.isConnected && (
                            <span className="flex items-center gap-1.5 text-xs text-success">
                              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <p className="text-lg font-semibold text-foreground capitalize">
                          {booking.status.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-sm text-foreground-muted">
                          {booking.status === "navigating" && "Opening the booking page..."}
                          {booking.status === "finding_slots" && "Scanning for available slots..."}
                          {booking.status === "selecting" && "Selecting the best available slot..."}
                          {booking.status === "filling_form" && "Filling in your details..."}
                          {booking.status === "confirming" && "Confirming your booking..."}
                        </p>
                      </div>

                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Success State */}
              {pageState === "success" && booking.confirmation && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ConfirmationCard
                    confirmationNumber={booking.confirmation.number}
                    datetime={booking.confirmation.datetime}
                    targetName={target.name}
                    bookingUrl={target.bookingUrl || undefined}
                  />
                </motion.div>
              )}

              {/* Error State */}
              {pageState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="glass">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 border border-error/30">
                        <AlertTriangle className="h-8 w-8 text-error" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-foreground">
                          {booking.status === "cancelled" ? "Booking Cancelled" : "Booking Failed"}
                        </h2>
                        {booking.error && (
                          <p className="text-foreground-muted">
                            {booking.error}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 pt-2">
                        <Button onClick={handleRetry}>
                          Try Again
                        </Button>
                        <Button asChild variant="secondary">
                          <Link href={`/targets/${params.id}`}>
                            Back to Target
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Browser Stream */}
          <div className="lg:col-span-3 min-h-[400px] lg:min-h-0">
            <BrowserStream
              screenshot={booking.screenshot || undefined}
              status={booking.status}
              error={booking.error || undefined}
              className="h-full"
            />
          </div>
        </div>
      </PageShell>
    </div>
  );
}
