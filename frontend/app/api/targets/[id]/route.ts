import { NextRequest, NextResponse } from "next/server";
import { mockTargetDetails, toggleMockTargetActive } from "../../../../lib/fixtures";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/targets/:id
 * Get detailed information for a specific target.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const target = mockTargetDetails[id];

  if (!target) {
    return NextResponse.json(
      { error: "Target not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ target });
}

/**
 * PATCH /api/targets/:id
 * Update a target (e.g., toggle active state).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Handle active toggle
    if (typeof body.active === "boolean") {
      const target = toggleMockTargetActive(id, body.active);
      if (!target) {
        return NextResponse.json(
          { error: "Target not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ target });
    }

    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update target" },
      { status: 500 }
    );
  }
}
