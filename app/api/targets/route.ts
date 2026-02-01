import { NextRequest, NextResponse } from "next/server";
import { listTargets, createTarget } from "../../../lib/backend";
import { CreateTargetInputSchema } from "../../../lib/apiTypes";

/**
 * GET /api/targets
 * List all targets with their current status.
 * 
 * Response:
 * {
 *   targets: TargetSummary[]
 * }
 */
export async function GET() {
  try {
    const targets = await listTargets();
    return NextResponse.json({ targets });
  } catch (error) {
    console.error("[API] Failed to list targets:", error);
    return NextResponse.json(
      { 
        error: "Failed to list targets",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/targets
 * Create a new monitoring target.
 * 
 * Request body:
 * {
 *   name: string;
 *   bookingUrl: string;
 *   type?: "acuity" | "generic" | "unknown";
 *   requirementsUrl?: string;
 *   alertEmail: string;
 *   active?: boolean;
 * }
 * 
 * Response:
 * { target: TargetSummary }
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

    // Create target
    const target = await createTarget({
      name: result.data.name,
      bookingUrl: result.data.bookingUrl,
      type: result.data.type,
      requirementsUrl: result.data.requirementsUrl,
      alertEmail: result.data.alertEmail,
      active: result.data.active,
    });

    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create target:", error);
    return NextResponse.json(
      { 
        error: "Failed to create target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
