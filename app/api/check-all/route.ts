import { NextRequest, NextResponse } from "next/server";
import { runChecks } from "../../../lib/backend";
import { z } from "zod";

const CheckAllSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

/**
 * POST /api/check-all
 * Run checks for all active targets (wrapper around runChecks).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CheckAllSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = await runChecks(undefined, parsed.data.forceRefresh);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/CheckAll] Failed to run checks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run checks",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check-all
 * Simple usage hint.
 */
export async function GET() {
  return NextResponse.json({
    description: "Run checks for all active targets.",
    usage: {
      method: "POST",
      body: { forceRefresh: "boolean (optional)" },
    },
  });
}
