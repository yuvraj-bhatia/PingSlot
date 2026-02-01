import { NextRequest, NextResponse } from "next/server";
import { runSingleCheck } from "../../../../lib/backend";

interface RouteParams {
  params: Promise<{ runId: string }>;
}

/**
 * GET /api/check/[runId]
 * Get the status of a specific check run.
 * 
 * Note: In the new synchronous design, check runs complete immediately.
 * This endpoint is kept for backward compatibility but will return
 * a "not found" for most cases since we don't persist run IDs.
 * 
 * For single target checks, use POST /api/check with targetIds.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { runId } = await params;

  // In the new design, we don't persist run IDs since checks are synchronous
  // This endpoint is kept for API compatibility
  
  return NextResponse.json(
    { 
      error: "Check run not found",
      message: "Check runs are now synchronous. Use POST /api/check to run checks.",
      runId 
    },
    { status: 404 }
  );
}

/**
 * POST /api/check/[runId]
 * Run a check for a single target by ID.
 * 
 * This is a convenience endpoint that treats runId as targetId.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { runId: targetId } = await params;

  try {
    const result = await runSingleCheck(targetId);

    if (!result) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      runId: `single-${targetId}-${Date.now()}`,
      status: "completed",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      summary: {
        checked: 1,
        available: result.status === "available" ? 1 : 0,
        emailsSent: result.email.sent ? 1 : 0,
      },
      results: [result],
      errors: result.status === "error" 
        ? [{ targetId, message: result.email.reason }]
        : [],
    });
  } catch (error) {
    console.error("[API] Single check failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to run check",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
