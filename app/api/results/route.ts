import { NextRequest, NextResponse } from "next/server";
import { getTargetDetail } from "../../../lib/backend";

/**
 * GET /api/results?targetId=...
 * Get the latest check result and history for a target.
 * 
 * Query params:
 * - targetId: string (required)
 * 
 * Response:
 * {
 *   target: { id, name, type, status };
 *   latest: CheckResult | null;
 *   history: RecentCheck[];
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json(
        { error: "Missing required parameter: targetId" },
        { status: 400 }
      );
    }

    const target = await getTargetDetail(targetId);
    
    if (!target) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      target: {
        id: target.id,
        name: target.name,
        type: target.type,
        status: target.status,
      },
      latest: target.lastCheck,
      history: target.recentChecks.slice(0, 5),
    });
  } catch (error) {
    console.error("[API] Failed to fetch results:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch results",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
