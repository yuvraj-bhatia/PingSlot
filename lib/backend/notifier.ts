/**
 * Notification Service (Resend Integration)
 * 
 * Only triggered if diff engine approves.
 * Sends plain text emails with:
 * - Next available slot
 * - Direct booking link
 * - Requirements checklist
 * - Source links
 * 
 * Reliability > beauty
 */

import { Resend } from "resend";
import config from "./config";

export type NotificationPayload = {
  targetName: string;
  bookingUrl: string;
  nextSlotTime: string | null;
  requirementsBullets: string[];
  requirementsUrl: string | null;
  alertEmail: string;
};

export type NotificationResult = {
  sent: boolean;
  emailId?: string;
  error?: string;
};

// ============================================================================
// Resend Client
// ============================================================================

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!config.resendApiKey) {
    console.warn("[Notifier] No Resend API key configured");
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(config.resendApiKey);
  }

  return resendClient;
}

// ============================================================================
// Email Formatting
// ============================================================================

function formatSlotTime(isoTime: string | null): string {
  if (!isoTime) {
    return "Check the booking page for available times";
  }

  try {
    const date = new Date(isoTime);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return isoTime;
  }
}

function buildEmailSubject(targetName: string, nextSlotTime: string | null): string {
  if (nextSlotTime) {
    const date = new Date(nextSlotTime);
    const shortDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `🟢 Appointment Available: ${targetName} (${shortDate})`;
  }
  return `🟢 Appointment Available: ${targetName}`;
}

function buildEmailBody(payload: NotificationPayload): string {
  const lines: string[] = [];

  // Header
  lines.push(`Good news! An appointment slot is now available at ${payload.targetName}.`);
  lines.push("");

  // Slot details
  lines.push("📅 NEXT AVAILABLE SLOT");
  lines.push("─".repeat(40));
  lines.push(formatSlotTime(payload.nextSlotTime));
  lines.push("");

  // Booking link
  lines.push("🔗 BOOK NOW");
  lines.push("─".repeat(40));
  lines.push(payload.bookingUrl);
  lines.push("");
  lines.push("⚡ Act fast - appointments fill up quickly!");
  lines.push("");

  // Requirements checklist
  if (payload.requirementsBullets.length > 0) {
    lines.push("📋 WHAT TO BRING");
    lines.push("─".repeat(40));
    for (const bullet of payload.requirementsBullets) {
      lines.push(`• ${bullet}`);
    }
    lines.push("");

    if (payload.requirementsUrl) {
      lines.push(`Full requirements: ${payload.requirementsUrl}`);
      lines.push("");
    }
  }

  // Footer
  lines.push("─".repeat(40));
  lines.push("This alert was sent by PingSlot (Appointment Monitoring & Alerting).");
  lines.push("You're receiving this because you set up monitoring for this appointment.");

  return lines.join("\n");
}

function buildHtmlEmail(payload: NotificationPayload): string {
  const slotTime = formatSlotTime(payload.nextSlotTime);
  
  const requirementsList = payload.requirementsBullets.length > 0
    ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 What to Bring
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          ${payload.requirementsBullets.map((b) => `<li style="margin: 8px 0;">${b}</li>`).join("")}
        </ul>
        ${payload.requirementsUrl ? `<p style="margin: 12px 0 0 0; font-size: 13px;"><a href="${payload.requirementsUrl}" style="color: #0066cc;">View full requirements →</a></p>` : ""}
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0 0 8px 0; font-size: 24px;">🟢 Appointment Available!</h1>
    <p style="margin: 0; opacity: 0.9; font-size: 16px;">${payload.targetName}</p>
  </div>

  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
      📅 Next Available Slot
    </h3>
    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111;">
      ${slotTime}
    </p>
  </div>

  <div style="text-align: center; margin: 24px 0;">
    <a href="${payload.bookingUrl}" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Book Now →
    </a>
    <p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">
      ⚡ Act fast - appointments fill up quickly!
    </p>
  </div>

  ${requirementsList}

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  
  <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
    Sent by PingSlot (Appointment Monitoring & Alerting)<br>
    You're receiving this because you set up monitoring for this appointment.
  </p>

</body>
</html>
  `.trim();
}

// ============================================================================
// Main Notification Function
// ============================================================================

/**
 * Send an availability notification email
 * 
 * @param payload - The notification details
 * @returns Result with sent status and email ID
 */
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const client = getResendClient();

  if (!client) {
    // Development mode: log instead of sending
    if (config.isDevelopment) {
      console.log("[Notifier] DEV MODE - Would send email:");
      console.log("  To:", payload.alertEmail);
      console.log("  Subject:", buildEmailSubject(payload.targetName, payload.nextSlotTime));
      console.log("  Slot:", formatSlotTime(payload.nextSlotTime));
      console.log("  Requirements:", payload.requirementsBullets.length, "items");
      
      return {
        sent: true,
        emailId: `dev-${Date.now()}`,
      };
    }

    return {
      sent: false,
      error: "Email service not configured (RESEND_API_KEY required)",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: config.resendFromEmail,
      to: payload.alertEmail,
      subject: buildEmailSubject(payload.targetName, payload.nextSlotTime),
      text: buildEmailBody(payload),
      html: buildHtmlEmail(payload),
    });

    if (error) {
      console.error("[Notifier] Resend error:", error);
      return {
        sent: false,
        error: error.message,
      };
    }

    return {
      sent: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error("[Notifier] Failed to send email:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a test notification (for verification)
 */
export async function sendTestNotification(email: string): Promise<NotificationResult> {
  return sendNotification({
    targetName: "Test Target",
    bookingUrl: "https://example.com/book",
    nextSlotTime: new Date(Date.now() + 86400000).toISOString(),
    requirementsBullets: [
      "Valid ID or driver's license",
      "Proof of address (utility bill)",
      "Payment method",
    ],
    requirementsUrl: "https://example.com/requirements",
    alertEmail: email,
  });
}

export default {
  sendNotification,
  sendTestNotification,
};
