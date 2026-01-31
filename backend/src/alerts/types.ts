/**
 * Type definitions for the alerts module
 * Matches Contract A (Target) and Contract B (CheckResult) exactly
 */

// Contract A - Target
export interface Target {
  id: string;
  name: string;
  bookingUrl: string;
  type: "acuity" | "generic" | "unknown";
  requirementsUrl?: string | null;
  alertEmail: string;
}

// Contract B - CheckResult
export interface CheckResult {
  status: "available" | "unavailable" | "unknown";
  nextSlotTime: string | null;
  bookingLink: string;
  requirementsBullets: string[];
  email: {
    shouldSend: boolean;
    sent: boolean;
    sentTo: string | null;
    reason: string;
  };
}

// Return type for buildAndSendAlert
export interface AlertResult {
  sent: boolean;
  reason: string;
  requirementsBullets: string[];
  messageId?: string;
}

// Return type for sendAlertEmail
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
