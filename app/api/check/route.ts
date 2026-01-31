import { NextRequest, NextResponse } from "next/server";
import { startMockCheckRun } from "../../../lib/fixtures";
import { StartCheckRunInputSchema } from "../../../lib/apiTypes";

/**
 * POST /api/check
 * Start a new check run.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = StartCheckRunInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.issues,
        },
        { status: 400 }
      );
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Start check run
    const runId = startMockCheckRun(result.data.targetIds);

    return NextResponse.json({
      runId,
      status: "pending",
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start check run" },
      { status: 500 }
    );
  }
}
