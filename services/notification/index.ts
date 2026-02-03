import { resend } from "./resend";
import prisma from "@/lib/backend/db";
import { AvailabilityEmail } from "./templates/availability";
import { BookingSuccessEmail } from "./templates/booking-success";
import { BookingFailedEmail } from "./templates/booking-failed";
import type { Target, SlotInfo, Booking, RequirementItem } from "@/lib/types";

export interface NotificationService {
  sendAvailabilityAlert(target: Target, slots: SlotInfo[]): Promise<void>;
  sendBookingSuccess(
    target: Target,
    booking: Booking,
    requirements?: RequirementItem[]
  ): Promise<void>;
  sendBookingFailed(target: Target, error: string): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || "PingSlot <notifications@pingslot.app>";

  private ensureConfigured() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
  }

  private formatSlotForSubject(datetime?: string | null): string | null {
    if (!datetime) return null;
    const date = new Date(datetime);
    if (Number.isNaN(date.getTime())) return datetime;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    react: JSX.Element;
    text?: string;
  }): Promise<string | null> {
    this.ensureConfigured();
    const { data, error } = await resend.emails.send({
      from: this.fromEmail,
      to: options.to,
      subject: options.subject,
      react: options.react,
      text: options.text,
    });

    if (error) {
      throw new Error(error.message || "Resend failed to send email");
    }

    return data?.id ?? null;
  }

  async sendAvailabilityAlert(target: Target, slots: SlotInfo[]): Promise<void> {
    const slotLabel = this.formatSlotForSubject(slots[0]?.datetime);
    const subject = slotLabel
      ? `Appointment Available: ${target.name} (${slotLabel})`
      : `Appointment Available: ${target.name}`;

    const resendId = await this.sendEmail({
      to: target.alertEmail,
      subject,
      react: AvailabilityEmail({ target, slots }),
      text: `PingSlot found an appointment for ${target.name}. Visit ${target.bookingUrl} to book.`,
    });

    await prisma.notification.create({
      data: {
        targetId: target.id,
        type: "availability",
        email: target.alertEmail,
        subject,
        body: slots[0]?.datetime || null,
        resendId,
      },
    });
  }

  async sendBookingSuccess(
    target: Target,
    booking: Booking,
    requirements: RequirementItem[] = []
  ): Promise<void> {
    const subject = `Booked: ${target.name}`;

    const resendId = await this.sendEmail({
      to: target.alertEmail,
      subject,
      react: BookingSuccessEmail({ target, booking, requirements }),
      text: `PingSlot booked ${target.name}. Confirmation: ${booking.confirmationNum ?? "pending"}.`,
    });

    await prisma.notification.create({
      data: {
        targetId: target.id,
        type: "booking_success",
        email: target.alertEmail,
        subject,
        body: booking.confirmationNum || null,
        resendId,
        bookingId: booking.id,
      },
    });
  }

  async sendBookingFailed(target: Target, error: string): Promise<void> {
    const subject = `Booking Failed: ${target.name}`;

    const resendId = await this.sendEmail({
      to: target.alertEmail,
      subject,
      react: BookingFailedEmail({ target, error }),
      text: `PingSlot could not book ${target.name}. Error: ${error}`,
    });

    await prisma.notification.create({
      data: {
        targetId: target.id,
        type: "booking_failed",
        email: target.alertEmail,
        subject,
        body: error,
        resendId,
      },
    });
  }
}

export const notificationService = new NotificationServiceImpl();
