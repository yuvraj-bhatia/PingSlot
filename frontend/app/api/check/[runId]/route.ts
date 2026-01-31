import { NextRequest, NextResponse } from "next/server";
import { getMockCheckRun } from "../../../../lib/fixtures";

interface RouteParams {
  params: { runId: string };
}

/**
 * GET /api/check/:runId
 * Get check run status and results.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { runId } = params;

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  const run = getMockCheckRun(runId);

  if (!run) {
    return NextResponse.json(
      { error: "Check run not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(run);
}
