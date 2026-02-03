import { NextRequest, NextResponse } from "next/server";
import { getTargetDetail, updateTarget, deleteTarget, toggleTargetActive } from "../../../../lib/backend";
import { UpdateTargetSchema, formatZodError, validateCuid } from "../../../../lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/targets/[id]
 * Get detailed information about a specific target.
 * 
 * Response:
 * { 
 *   success: true;
 *   target: TargetDetail;
 * }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate ID format
  if (!validateCuid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid target ID format" },
      { status: 400 }
    );
  }

  try {
    const target = await getTargetDetail(id);

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      target // Legacy format preserved
    });
  } catch (error) {
    console.error("[API] Failed to get target:", error);
    return NextResponse.json(
      { 
        success: false,
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
 * Request body (all fields optional, at least one required):
 * {
 *   name?: string;
 *   bookingUrl?: string;
 *   platform?: "acuity" | "calendly" | "microsoft" | "generic" | "unknown";
 *   appointmentType?: "passport" | "consulate" | "city_planning" | "dmv" | "generic";
 *   country?: string | null;
 *   state?: string | null;
 *   city?: string | null;
 *   type?: "acuity" | "generic" | "unknown";
 *   requirementsUrl?: string | null;
 *   alertEmail?: string;
 *   active?: boolean;
 * }
 * 
 * Response:
 * { 
 *   success: true;
 *   target: TargetSummary;
 * }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate ID format
  if (!validateCuid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid target ID format" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Handle special case: toggle active status (for backwards compatibility)
    if (Object.keys(body).length === 1 && typeof body.active === "boolean") {
      const target = await toggleTargetActive(id, body.active);
      
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Target not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true,
        target 
      });
    }

    // Validate input with Zod schema
    const result = UpdateTargetSchema.safeParse(body);
    
    if (!result.success) {
      const formatted = formatZodError(result.error);
      return NextResponse.json(
        {
          success: false,
          error: formatted.message,
          issues: formatted.issues,
        },
        { status: 400 }
      );
    }

    // General update with validated data
    const target = await updateTarget(id, {
      name: result.data.name,
      bookingUrl: result.data.bookingUrl,
      platform: result.data.platform,
      appointmentType: result.data.appointmentType,
      country: result.data.country ?? undefined,
      state: result.data.state ?? undefined,
      city: result.data.city ?? undefined,
      type: result.data.type,
      requirementsUrl: result.data.requirementsUrl ?? undefined,
      alertEmail: result.data.alertEmail,
      active: result.data.active,
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      target 
    });
  } catch (error) {
    console.error("[API] Failed to update target:", error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: "A target with this booking URL already exists",
          message: error.message
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
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

  // Validate ID format
  if (!validateCuid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid target ID format" },
      { status: 400 }
    );
  }

  try {
    const deleted = await deleteTarget(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    console.error("[API] Failed to delete target:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
