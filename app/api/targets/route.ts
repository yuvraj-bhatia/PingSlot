import { NextRequest, NextResponse } from "next/server";
import {
  mockTargets,
  createMockTarget,
} from "../../../lib/fixtures";
import { CreateTargetInputSchema } from "../../../lib/apiTypes";

/**
 * GET /api/targets
 * List all targets with summaries.
 */
export async function GET() {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({ targets: mockTargets });
}

/**
 * POST /api/targets
 * Create a new target.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = CreateTargetInputSchema.safeParse(body);
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create target
    const target = createMockTarget(result.data);

    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create target" },
      { status: 500 }
    );
  }
}
