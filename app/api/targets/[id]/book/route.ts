import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/backend/db";
import { getBookingEngine } from "../../../../../lib/backend/booker";
import { sendBookingConfirmation, sendBookingFailed } from "../../../../../lib/backend/notifier";
import type { BookingStatusUpdate, UserProfile } from "../../../../../lib/backend/booker/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/targets/[id]/book
 * Start an auto-booking session for a target.
 * 
 * Request body:
 * {
 *   userProfile: {
 *     firstName: string;
 *     lastName: string;
 *     email: string;
 *     phone?: string;
 *   }
 * }
 * 
 * Response: Server-Sent Events stream with booking status updates
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get target
    const target = await prisma.target.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bookingUrl: true,
        alertEmail: true,
        requirementsBullets: true,
      },
    });

    if (!target) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const userProfile: UserProfile = body.userProfile;

    if (!userProfile?.firstName || !userProfile?.lastName || !userProfile?.email) {
      return NextResponse.json(
        { error: "User profile with firstName, lastName, and email is required" },
        { status: 400 }
      );
    }

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        targetId: id,
        status: "pending",
        userProfile: JSON.stringify(userProfile),
      },
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        const onStatus = async (update: BookingStatusUpdate) => {
          // Update booking status in database
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: update.status,
              screenshotUrl: update.screenshot ? `data:image/png;base64,${update.screenshot}` : undefined,
              errorMessage: update.error,
              slotDateTime: update.confirmation?.slotDateTime ? new Date(update.confirmation.slotDateTime) : undefined,
              confirmationNum: update.confirmation?.confirmationNumber,
              completedAt: ["success", "failed", "cancelled"].includes(update.status) ? new Date() : undefined,
            },
          });

          // Send SSE event
          sendEvent({
            type: "status",
            bookingId: booking.id,
            ...update,
          });
        };

        try {
          // Run the booking
          const engine = getBookingEngine({ headless: false, slowMo: 100 });
          const confirmation = await engine.book(
            target.id,
            target.bookingUrl,
            userProfile,
            onStatus
          );

          // Send success notification email
          const requirements = target.requirementsBullets
            ? JSON.parse(target.requirementsBullets)
            : [];

          await sendBookingConfirmation({
            targetName: target.name,
            bookingUrl: target.bookingUrl,
            slotDateTime: confirmation.slotDateTime,
            confirmationNumber: confirmation.confirmationNumber,
            requirementsBullets: requirements,
            alertEmail: userProfile.email,
          });

          // Send final success event
          sendEvent({
            type: "complete",
            bookingId: booking.id,
            success: true,
            confirmation,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          // Update booking as failed
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "failed",
              errorMessage,
              completedAt: new Date(),
            },
          });

          // Send failure notification email
          await sendBookingFailed({
            targetName: target.name,
            bookingUrl: target.bookingUrl,
            errorMessage,
            alertEmail: userProfile.email,
          });

          // Send error event
          sendEvent({
            type: "error",
            bookingId: booking.id,
            error: errorMessage,
          });
        } finally {
          // Close the stream
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[API] Booking error:", error);
    return NextResponse.json(
      {
        error: "Failed to start booking",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/targets/[id]/book
 * Get booking history for a target.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const bookings = await prisma.booking.findMany({
      where: { targetId: id },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[API] Failed to get bookings:", error);
    return NextResponse.json(
      { error: "Failed to get bookings" },
      { status: 500 }
    );
  }
}
