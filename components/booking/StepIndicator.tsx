"use client";

import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import type { BookingStatus } from "../../lib/apiTypes";

interface StepIndicatorProps {
  currentStep: number;
  status: BookingStatus;
  className?: string;
}

const STEPS = [
  { id: 0, label: "Navigating", description: "Opening booking page" },
  { id: 1, label: "Finding Slots", description: "Scanning for availability" },
  { id: 2, label: "Selecting", description: "Choosing best slot" },
  { id: 3, label: "Filling Form", description: "Entering your details" },
  { id: 4, label: "Confirming", description: "Finalizing booking" },
];

function getStepStatus(
  stepIndex: number,
  currentStep: number,
  bookingStatus: BookingStatus
): "pending" | "active" | "complete" | "error" {
  if (bookingStatus === "failed" || bookingStatus === "cancelled") {
    if (stepIndex === currentStep) return "error";
    if (stepIndex < currentStep) return "complete";
    return "pending";
  }

  if (bookingStatus === "success") {
    return "complete";
  }

  if (stepIndex < currentStep) return "complete";
  if (stepIndex === currentStep) return "active";
  return "pending";
}

/**
 * Horizontal step indicator for booking progress.
 * Shows 5 steps with animated transitions.
 */
export function StepIndicator({
  currentStep,
  status,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Horizontal stepper */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line background */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/[0.1]" />
        
        {/* Progress line */}
        <motion.div
          className="absolute left-0 top-5 h-0.5 bg-accent"
          initial={{ width: "0%" }}
          animate={{
            width: status === "success" 
              ? "100%" 
              : `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {STEPS.map((step, index) => {
          const stepStatus = getStepStatus(index, currentStep, status);
          
          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center z-10"
            >
              {/* Step circle */}
              <motion.div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  stepStatus === "complete" && "border-accent bg-accent text-accent-foreground",
                  stepStatus === "active" && "border-accent bg-accent/20 text-accent",
                  stepStatus === "pending" && "border-white/[0.2] bg-white/[0.05] text-foreground-muted",
                  stepStatus === "error" && "border-error bg-error/20 text-error"
                )}
                initial={false}
                animate={{
                  scale: stepStatus === "active" ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {stepStatus === "complete" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                )}
                {stepStatus === "active" && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {stepStatus === "pending" && (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
                {stepStatus === "error" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                )}
              </motion.div>

              {/* Step label */}
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    stepStatus === "complete" && "text-accent",
                    stepStatus === "active" && "text-foreground",
                    stepStatus === "pending" && "text-foreground-muted",
                    stepStatus === "error" && "text-error"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-foreground-muted">
          {status === "success"
            ? "Booking complete!"
            : status === "failed"
            ? "Booking failed"
            : status === "cancelled"
            ? "Booking cancelled"
            : STEPS[currentStep]?.description || "Processing..."}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Compact vertical step indicator for mobile.
 */
export function StepIndicatorCompact({
  currentStep,
  status,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {STEPS.map((step, index) => {
        const stepStatus = getStepStatus(index, currentStep, status);
        
        return (
          <motion.div
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3 transition-colors",
              stepStatus === "active" && "bg-accent/10 border border-accent/30",
              stepStatus === "complete" && "bg-success/5",
              stepStatus === "error" && "bg-error/10 border border-error/30",
              stepStatus === "pending" && "opacity-50"
            )}
            initial={false}
            animate={{
              scale: stepStatus === "active" ? 1.02 : 1,
            }}
          >
            {/* Step indicator */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                stepStatus === "complete" && "bg-success text-white",
                stepStatus === "active" && "bg-accent text-accent-foreground",
                stepStatus === "pending" && "bg-white/[0.1] text-foreground-muted",
                stepStatus === "error" && "bg-error text-white"
              )}
            >
              {stepStatus === "complete" && <Check className="h-4 w-4" />}
              {stepStatus === "active" && <Loader2 className="h-4 w-4 animate-spin" />}
              {stepStatus === "pending" && index + 1}
              {stepStatus === "error" && <X className="h-4 w-4" />}
            </div>

            {/* Step info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  stepStatus === "active" && "text-foreground",
                  stepStatus === "complete" && "text-success",
                  stepStatus === "pending" && "text-foreground-muted",
                  stepStatus === "error" && "text-error"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
