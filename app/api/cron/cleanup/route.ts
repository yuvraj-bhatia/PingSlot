import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/backend/db";

/**
 * GET/POST /api/cron/cleanup
 * Scheduled endpoint to clean up old data.
 * 
 * Called by Vercel Cron daily at midnight.
 * 
 * Cleans up:
 * - Check records older than 30 days
 * - Alert records older than 90 days
 */
export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCleanup(request);
}

async function handleCleanup(request: NextRequest) {
  // Verify cron secret in production
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  console.log("[Cron] Starting scheduled cleanup");
  const startTime = Date.now();

  try {
    // Delete checks older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedChecks = await prisma.check.deleteMany({
      where: {
        checkedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Delete alerts older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedAlerts = await prisma.alert.deleteMany({
      where: {
        sentAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    // Delete failed bookings older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        status: "failed",
        startedAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    const duration = Date.now() - startTime;

    console.log(`[Cron] Cleanup completed in ${duration}ms:`, {
      deletedChecks: deletedChecks.count,
      deletedAlerts: deletedAlerts.count,
      deletedBookings: deletedBookings.count,
    });

    return NextResponse.json({
      success: true,
      cleaned: {
        checks: deletedChecks.count,
        alerts: deletedAlerts.count,
        bookings: deletedBookings.count,
      },
      durationMs: duration,
    });
  } catch (error) {
    console.error("[Cron] Cleanup failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
