import { NextRequest, NextResponse } from "next/server";
import { runSingleCheck } from "../../../../../lib/backend";
import { validateCuid } from "../../../../../lib/validations";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const CheckRequestSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

/**
 * POST /api/targets/[id]/check
 * Run a check for a single target by ID.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!validateCuid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid target ID format" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CheckRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = await runSingleCheck(id, parsed.data.forceRefresh);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const cachedResults = result.cached ? 1 : 0;
    const freshResults = result.cached ? 0 : 1;

    return NextResponse.json({
      runId: `single-${id}-${Date.now()}`,
      status: "completed",
      startedAt: now,
      completedAt: now,
      summary: {
        checked: 1,
        available: result.status === "available" ? 1 : 0,
        emailsSent: result.email.sent ? 1 : 0,
        cachedResults,
        freshResults,
      },
      results: [result],
      errors:
        result.status === "error"
          ? [{ targetId: id, message: result.email.reason }]
          : [],
    });
  } catch (error) {
    console.error("[API/TargetCheck] Failed to run check:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run check",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
