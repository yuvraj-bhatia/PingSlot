/**
 * Alerts module - main export
 * 
 * This module handles:
 * 1. Extracting requirements bullets from PDF/HTML pages
 * 2. Building and sending alert emails via Resend
 */

// Re-export types
export type { Target, CheckResult, AlertResult, EmailResult } from "./types.js";

// Re-export main function
export { buildAndSendAlert } from "./buildAndSendAlert.js";

// Re-export utilities (for testing/advanced use)
export { getRequirementsBullets } from "./requirements.js";
export { sendAlertEmail } from "./email.js";
