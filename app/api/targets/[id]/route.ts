import { NextRequest, NextResponse } from "next/server";
import { getTargetDetail, updateTarget, deleteTarget, toggleTargetActive } from "../../../../lib/backend";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/targets/[id]
 * Get detailed information about a specific target.
 * 
 * Response:
 * { target: TargetDetail }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const target = await getTargetDetail(id);

    if (!target) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ target });
  } catch (error) {
    console.error("[API] Failed to get target:", error);
    return NextResponse.json(
      { 
        error: "Failed to get target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/targets/[id]
 * Update a target's configuration.
 * 
 * Request body (all fields optional):
 * {
 *   name?: string;
 *   bookingUrl?: string;
 *   type?: "acuity" | "generic" | "unknown";
 *   requirementsUrl?: string | null;
 *   alertEmail?: string;
 *   active?: boolean;
 * }
 * 
 * Response:
 * { target: TargetSummary }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Handle special case: toggle active status
    if (Object.keys(body).length === 1 && typeof body.active === "boolean") {
      const target = await toggleTargetActive(id, body.active);
      
      if (!target) {
        return NextResponse.json(
          { error: "Target not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ target });
    }

    // General update
    const target = await updateTarget(id, body);

    if (!target) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ target });
  } catch (error) {
    console.error("[API] Failed to update target:", error);
    return NextResponse.json(
      { 
        error: "Failed to update target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/targets/[id]
 * Delete a target and all its associated data.
 * 
 * Response:
 * { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = await deleteTarget(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete target:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
