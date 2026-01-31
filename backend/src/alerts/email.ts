/**
 * Email sending module using Resend API
 */

import type { EmailResult } from "./types.js";

const LOG_PREFIX = "[AADI]";

/**
 * Resend API endpoint
 */
const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Safely parse JSON from response, returning {} on failure
 */
async function safeJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Send an alert email via Resend
 * Never throws - always returns a result object
 */
export async function sendAlertEmail(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log(`${LOG_PREFIX} RESEND_API_KEY not configured`);
      return {
        success: false,
        error: "RESEND_API_KEY missing",
      };
    }

    const fromEmail = process.env.ALERT_FROM_EMAIL || "alerts@example.com";
    
    if (!process.env.ALERT_FROM_EMAIL) {
      console.log(`${LOG_PREFIX} ALERT_FROM_EMAIL not set, using default: ${fromEmail}`);
    }

    console.log(`${LOG_PREFIX} Sending email to: ${args.to}`);
    console.log(`${LOG_PREFIX} Subject: ${args.subject}`);

    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: args.to,
      subject: args.subject,
      text: args.text,
    };

    if (args.html) {
      payload.html = args.html;
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: any = await safeJson(response);

    if (!response.ok) {
      console.log(`${LOG_PREFIX} Resend API error: ${response.status}`, data);
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    console.log(`${LOG_PREFIX} Email sent successfully, messageId: ${data.id}`);
    
    return {
      success: true,
      messageId: data.id,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log(`${LOG_PREFIX} Error sending email:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/*
 * ===============================
 * USAGE EXAMPLE (for testing)
 * ===============================
 * 
 * import { sendAlertEmail } from './email';
 * 
 * // Set env vars first:
 * // process.env.RESEND_API_KEY = 're_xxx...';
 * // process.env.ALERT_FROM_EMAIL = 'noreply@yourdomain.com';
 * 
 * const result = await sendAlertEmail({
 *   to: 'user@example.com',
 *   subject: 'Slot Available!',
 *   text: 'A slot is now available. Book now!',
 * });
 * 
 * console.log(result);
 * // Success: { success: true, messageId: 'abc123' }
 * // Failure: { success: false, error: 'RESEND_API_KEY missing' }
 */
