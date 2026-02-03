"use client";

import { StepIndicator } from "./StepIndicator";
import { BrowserStream } from "./BrowserStream";
import type { BookingStatus } from "../../lib/apiTypes";

interface BookingViewProps {
  status: BookingStatus;
  currentStep: number;
  screenshot?: string;
  error?: string;
  className?: string;
}

export function BookingView({
  status,
  currentStep,
  screenshot,
  error,
  className,
}: BookingViewProps) {
  return (
    <div className={className ?? ""}>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <StepIndicator currentStep={currentStep} status={status} />
        </div>
        <div className="lg:col-span-3 min-h-[320px]">
          <BrowserStream status={status} screenshot={screenshot} error={error} />
        </div>
      </div>
    </div>
  );
}
