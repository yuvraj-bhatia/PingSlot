import { NextRequest, NextResponse } from "next/server";
import { runChecks } from "../../../../lib/backend/pipeline";

/**
 * GET/POST /api/cron/check-all
 * Scheduled endpoint to check all active targets.
 * 
 * Called by Vercel Cron every 15 minutes.
 * 
 * Security:
 * - In production, verify CRON_SECRET header
 */
export async function GET(request: NextRequest) {
  return handleCronCheck(request);
}

export async function POST(request: NextRequest) {
  return handleCronCheck(request);
}

async function handleCronCheck(request: NextRequest) {
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

  console.log("[Cron] Starting scheduled check-all");
  const startTime = Date.now();

  try {
    const result = await runChecks();
    const duration = Date.now() - startTime;

    console.log(`[Cron] Check-all completed in ${duration}ms:`, result.summary);

    return NextResponse.json({
      success: true,
      runId: result.runId,
      summary: result.summary,
      durationMs: duration,
    });
  } catch (error) {
    console.error("[Cron] Check-all failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
