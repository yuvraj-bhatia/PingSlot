/**
 * Main alert builder and sender
 * This is the single function Yuvraj will call
 */

import type { Target, CheckResult, AlertResult } from "./types.js";
import { getRequirementsBullets } from "./requirements.js";
import { sendAlertEmail } from "./email.js";

const LOG_PREFIX = "[AADI]";

/**
 * Build the email subject line
 */
function buildSubject(target: Target, nextSlotTime: string | null): string {
  const timeStr = nextSlotTime || "Available";
  return `Slot found: ${target.name} — ${timeStr}`;
}

/**
 * Build the email text body
 */
function buildEmailText(
  target: Target,
  checkResult: CheckResult,
  bullets: string[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`🎉 A slot is now available for ${target.name}!`);
  lines.push("");

  // Slot time
  if (checkResult.nextSlotTime) {
    lines.push(`📅 Next available slot: ${checkResult.nextSlotTime}`);
  } else {
    lines.push(`📅 Available (time not parsed)`);
  }
  lines.push("");

  // Booking link
  lines.push(`🔗 Book now: ${checkResult.bookingLink}`);
  lines.push("");

  // Requirements checklist
  if (bullets.length > 0) {
    lines.push("📋 Requirements checklist:");
    for (const bullet of bullets) {
      lines.push(`  • ${bullet}`);
    }
    lines.push("");
  }

  // Source links
  lines.push("---");
  lines.push("Source links:");
  lines.push(`  • Booking page: ${target.bookingUrl}`);
  if (target.requirementsUrl) {
    lines.push(`  • Requirements: ${target.requirementsUrl}`);
  }
  lines.push("");

  // Footer
  lines.push("— PingSlot Alert System");

  return lines.join("\n");
}

/**
 * Build optional HTML email body
 */
function buildEmailHtml(
  target: Target,
  checkResult: CheckResult,
  bullets: string[]
): string {
  const bulletsHtml =
    bullets.length > 0
      ? `
        <h3>📋 Requirements checklist:</h3>
        <ul>
          ${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n          ")}
        </ul>
      `
      : "";

  const requirementsLink = target.requirementsUrl
    ? `<li><a href="${escapeHtml(target.requirementsUrl)}">Requirements page</a></li>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .cta:hover { background: #1d4ed8; }
    ul { padding-left: 20px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>🎉 Slot Available!</h1>
  <p>A slot is now available for <strong>${escapeHtml(target.name)}</strong>!</p>
  
  <p>📅 <strong>${checkResult.nextSlotTime ? `Next available slot: ${escapeHtml(checkResult.nextSlotTime)}` : "Available (time not parsed)"}</strong></p>
  
  <p><a class="cta" href="${escapeHtml(checkResult.bookingLink)}">Book Now →</a></p>
  
  ${bulletsHtml}
  
  <div class="footer">
    <p><strong>Source links:</strong></p>
    <ul>
      <li><a href="${escapeHtml(target.bookingUrl)}">Booking page</a></li>
      ${requirementsLink}
    </ul>
    <p>— PingSlot Alert System</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Build and send an alert email
 * This is the main function that Yuvraj will call
 * 
 * Never throws - always returns a result object
 */
export async function buildAndSendAlert(args: {
  target: Target;
  checkResult: CheckResult;
}): Promise<AlertResult> {
  const { target, checkResult } = args;

  try {
    console.log(`${LOG_PREFIX} Building alert for target: ${target.name}`);

    // Step 1: Get requirements bullets
    let bullets: string[] = [];
    let requirementsSkipped = false;

    try {
      bullets = await getRequirementsBullets(target.requirementsUrl);
      console.log(`${LOG_PREFIX} Got ${bullets.length} requirement bullets`);
    } catch (err) {
      console.log(`${LOG_PREFIX} Failed to get requirements, continuing without`);
      requirementsSkipped = true;
    }

    // Step 2: Build email content
    const subject = buildSubject(target, checkResult.nextSlotTime);
    const text = buildEmailText(target, checkResult, bullets);
    const html = buildEmailHtml(target, checkResult, bullets);

    console.log(`${LOG_PREFIX} Email built, subject: ${subject}`);

    // Step 3: Check if we should send
    if (!process.env.RESEND_API_KEY) {
      console.log(`${LOG_PREFIX} RESEND_API_KEY not configured, skipping send`);
      return {
        sent: false,
        reason: "resend not configured",
        requirementsBullets: bullets,
      };
    }

    // Step 4: Send the email
    const emailResult = await sendAlertEmail({
      to: target.alertEmail,
      subject,
      text,
      html,
    });

    if (emailResult.success) {
      console.log(`${LOG_PREFIX} Alert sent successfully`);
      return {
        sent: true,
        reason: requirementsSkipped ? "sent (requirements skipped)" : "sent",
        requirementsBullets: bullets,
        messageId: emailResult.messageId,
      };
    } else {
      console.log(`${LOG_PREFIX} Failed to send alert: ${emailResult.error}`);
      return {
        sent: false,
        reason: `error: ${emailResult.error}`,
        requirementsBullets: bullets,
      };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log(`${LOG_PREFIX} Unexpected error in buildAndSendAlert:`, errorMessage);
    return {
      sent: false,
      reason: `error: ${errorMessage}`,
      requirementsBullets: [],
    };
  }
}

/*
 * ===============================
 * USAGE EXAMPLE (for Yuvraj)
 * ===============================
 * 
 * import { buildAndSendAlert } from './alerts';
 * import type { Target, CheckResult } from './alerts';
 * 
 * const target: Target = {
 *   id: 'visa-appt-123',
 *   name: 'US Visa Appointment - Mumbai',
 *   bookingUrl: 'https://ais.usvisa-info.com/en-in/niv',
 *   type: 'generic',
 *   requirementsUrl: 'https://example.com/visa-requirements.pdf',
 *   alertEmail: 'user@example.com',
 * };
 * 
 * const checkResult: CheckResult = {
 *   status: 'available',
 *   nextSlotTime: '2024-03-15 10:30 AM',
 *   bookingLink: 'https://ais.usvisa-info.com/book/12345',
 *   requirementsBullets: [], // Will be filled by buildAndSendAlert
 *   email: {
 *     shouldSend: true,
 *     sent: false,
 *     sentTo: null,
 *     reason: '',
 *   },
 * };
 * 
 * const result = await buildAndSendAlert({ target, checkResult });
 * console.log(result);
 * // {
 * //   sent: true,
 * //   reason: 'sent',
 * //   requirementsBullets: ['Bring valid passport', 'Photo required', ...],
 * //   messageId: 'abc123'
 * // }
 */
