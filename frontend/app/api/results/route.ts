import { NextRequest, NextResponse } from "next/server";
import { targetDetails } from "../../../lib/mockData";

// GET /api/results?targetId=... - latest + last 5
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

    // TODO: Replace with real database query
    const target = targetDetails[targetId];
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
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
