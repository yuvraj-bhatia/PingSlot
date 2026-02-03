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

export type BookingConfirmationPayload = {
  targetName: string;
  bookingUrl: string;
  slotDateTime: string;
  confirmationNumber: string | null;
  requirementsBullets: string[];
  alertEmail: string;
};

export type BookingFailedPayload = {
  targetName: string;
  bookingUrl: string;
  errorMessage: string;
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

// ============================================================================
// Booking Confirmation Email
// ============================================================================

function buildBookingConfirmationSubject(targetName: string, slotDateTime: string): string {
  const date = new Date(slotDateTime);
  const shortDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `✅ Booked: ${targetName} (${shortDate})`;
}

function buildBookingConfirmationBody(payload: BookingConfirmationPayload): string {
  const lines: string[] = [];

  lines.push(`Great news! Your appointment has been booked at ${payload.targetName}.`);
  lines.push("");

  lines.push("📅 APPOINTMENT DETAILS");
  lines.push("─".repeat(40));
  lines.push(formatSlotTime(payload.slotDateTime));
  if (payload.confirmationNumber) {
    lines.push(`Confirmation #: ${payload.confirmationNumber}`);
  }
  lines.push("");

  if (payload.requirementsBullets.length > 0) {
    lines.push("📋 WHAT TO BRING");
    lines.push("─".repeat(40));
    for (const bullet of payload.requirementsBullets) {
      lines.push(`• ${bullet}`);
    }
    lines.push("");
  }

  lines.push("🔗 BOOKING PAGE");
  lines.push("─".repeat(40));
  lines.push(payload.bookingUrl);
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("This booking was made automatically by PingSlot.");
  lines.push("Add this appointment to your calendar to avoid missing it!");

  return lines.join("\n");
}

function buildBookingConfirmationHtml(payload: BookingConfirmationPayload): string {
  const slotTime = formatSlotTime(payload.slotDateTime);
  
  const requirementsList = payload.requirementsBullets.length > 0
    ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 What to Bring
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #15803d;">
          ${payload.requirementsBullets.map((b) => `<li style="margin: 8px 0;">${b}</li>`).join("")}
        </ul>
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
  
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0 0 8px 0; font-size: 24px;">✅ Appointment Booked!</h1>
    <p style="margin: 0; opacity: 0.9; font-size: 16px;">${payload.targetName}</p>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
      📅 Appointment Details
    </h3>
    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #15803d;">
      ${slotTime}
    </p>
    ${payload.confirmationNumber ? `<p style="margin: 0; font-size: 14px; color: #166534;">Confirmation #: <strong>${payload.confirmationNumber}</strong></p>` : ""}
  </div>

  ${requirementsList}

  <div style="text-align: center; margin: 24px 0;">
    <a href="${payload.bookingUrl}" style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
      View Booking →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  
  <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
    This booking was made automatically by PingSlot.<br>
    Add this appointment to your calendar!
  </p>

</body>
</html>
  `.trim();
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmation(payload: BookingConfirmationPayload): Promise<NotificationResult> {
  const client = getResendClient();

  if (!client) {
    if (config.isDevelopment) {
      console.log("[Notifier] DEV MODE - Would send booking confirmation:");
      console.log("  To:", payload.alertEmail);
      console.log("  Subject:", buildBookingConfirmationSubject(payload.targetName, payload.slotDateTime));
      console.log("  Confirmation #:", payload.confirmationNumber);
      
      return {
        sent: true,
        emailId: `dev-booking-${Date.now()}`,
      };
    }

    return {
      sent: false,
      error: "Email service not configured",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: config.resendFromEmail,
      to: payload.alertEmail,
      subject: buildBookingConfirmationSubject(payload.targetName, payload.slotDateTime),
      text: buildBookingConfirmationBody(payload),
      html: buildBookingConfirmationHtml(payload),
    });

    if (error) {
      console.error("[Notifier] Resend error:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true, emailId: data?.id };
  } catch (error) {
    console.error("[Notifier] Failed to send booking confirmation:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Booking Failed Email
// ============================================================================

function buildBookingFailedSubject(targetName: string): string {
  return `❌ Booking Failed: ${targetName}`;
}

function buildBookingFailedBody(payload: BookingFailedPayload): string {
  const lines: string[] = [];

  lines.push(`Unfortunately, we couldn't complete your booking at ${payload.targetName}.`);
  lines.push("");

  lines.push("❌ ERROR DETAILS");
  lines.push("─".repeat(40));
  lines.push(payload.errorMessage);
  lines.push("");

  lines.push("🔗 TRY BOOKING MANUALLY");
  lines.push("─".repeat(40));
  lines.push(payload.bookingUrl);
  lines.push("");

  lines.push("The slot may still be available - try booking manually using the link above.");
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("This notification was sent by PingSlot.");

  return lines.join("\n");
}

function buildBookingFailedHtml(payload: BookingFailedPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0 0 8px 0; font-size: 24px;">❌ Booking Failed</h1>
    <p style="margin: 0; opacity: 0.9; font-size: 16px;">${payload.targetName}</p>
  </div>

  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
      Error Details
    </h3>
    <p style="margin: 0; font-size: 14px; color: #b91c1c;">
      ${payload.errorMessage}
    </p>
  </div>

  <p style="color: #666; margin: 20px 0;">
    The slot may still be available. Try booking manually using the button below.
  </p>

  <div style="text-align: center; margin: 24px 0;">
    <a href="${payload.bookingUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Try Manual Booking →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  
  <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
    This notification was sent by PingSlot.
  </p>

</body>
</html>
  `.trim();
}

/**
 * Send a booking failed notification email
 */
export async function sendBookingFailed(payload: BookingFailedPayload): Promise<NotificationResult> {
  const client = getResendClient();

  if (!client) {
    if (config.isDevelopment) {
      console.log("[Notifier] DEV MODE - Would send booking failed notification:");
      console.log("  To:", payload.alertEmail);
      console.log("  Error:", payload.errorMessage);
      
      return {
        sent: true,
        emailId: `dev-failed-${Date.now()}`,
      };
    }

    return {
      sent: false,
      error: "Email service not configured",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: config.resendFromEmail,
      to: payload.alertEmail,
      subject: buildBookingFailedSubject(payload.targetName),
      text: buildBookingFailedBody(payload),
      html: buildBookingFailedHtml(payload),
    });

    if (error) {
      console.error("[Notifier] Resend error:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true, emailId: data?.id };
  } catch (error) {
    console.error("[Notifier] Failed to send booking failed notification:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  sendNotification,
  sendTestNotification,
  sendBookingConfirmation,
  sendBookingFailed,
};
