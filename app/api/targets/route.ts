import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/backend/db";
import { listTargets, createTarget } from "../../../lib/backend";
import { CreateTargetInputSchema } from "../../../lib/apiTypes";
import { 
  TargetListQuerySchema, 
  CreateTargetSchema, 
  parseQuery,
  formatZodError 
} from "../../../lib/validations";
import type { PaginatedResponse, TargetSummary } from "../../../lib/types";

/**
 * GET /api/targets
 * List all targets with their current status.
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * - status: Filter by status (available, unavailable, unknown, error)
 * - platform: Filter by platform (acuity, calendly, microsoft, generic, unknown)
 * - appointmentType: Filter by appointment type
 * - active: Filter by active status (true/false)
 * 
 * Response (paginated):
 * {
 *   success: true;
 *   data: {
 *     items: TargetSummary[];
 *     total: number;
 *     page: number;
 *     pageSize: number;
 *     hasMore: boolean;
 *   };
 * }
 * 
 * Response (legacy - when no pagination params):
 * {
 *   targets: TargetSummary[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if pagination is requested
    const hasPagination = searchParams.has('page') || searchParams.has('pageSize');
    
    if (!hasPagination) {
      // Legacy response format for backwards compatibility
      const targets = await listTargets();
      return NextResponse.json({ targets });
    }

    // Parse query parameters with validation
    const queryResult = parseQuery(searchParams, TargetListQuerySchema);
    
    if (!queryResult.success) {
      const formatted = formatZodError(queryResult.error);
      return NextResponse.json(
        { success: false, error: formatted.message, issues: formatted.issues },
        { status: 400 }
      );
    }

    const { page, pageSize, status, platform, appointmentType, active } = queryResult.data;
    const skip = (page - 1) * pageSize;

    // Build where clause for filtering
    const where: {
      active?: boolean;
      platform?: string;
      appointmentType?: string;
    } = {};

    if (active !== undefined) {
      where.active = active;
    }
    if (platform) {
      where.platform = platform;
    }
    if (appointmentType) {
      where.appointmentType = appointmentType;
    }

    // Get total count and targets
    const [total, targets] = await Promise.all([
      prisma.target.count({ where }),
      prisma.target.findMany({
        where,
        include: {
          checks: {
            orderBy: { checkedAt: "desc" },
            take: 1,
          },
          alerts: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
          _count: {
            select: { checks: true, bookings: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const now = Date.now();

    // Transform to TargetSummary with status filtering
    let items: TargetSummary[] = targets.map((target) => {
      const lastCheck = target.checks[0];
      const lastAlert = target.alerts[0];
      
      const cacheAge = lastCheck?.checkedAt
        ? Math.round((now - lastCheck.checkedAt.getTime()) / 1000)
        : null;

      return {
        id: target.id,
        name: target.name,
        type: target.type,
        platform: target.platform,
        appointmentType: target.appointmentType,
        bookingUrl: target.bookingUrl,
        state: target.state,
        status: (lastCheck?.status || "unknown") as TargetSummary["status"],
        nextSlotTime: lastCheck?.nextSlotTime?.toISOString() || null,
        lastCheckedAt: lastCheck?.checkedAt?.toISOString() || null,
        lastAlertStatus: lastAlert
          ? `sent: ${lastAlert.sentAt.toISOString()}`
          : lastCheck
          ? lastCheck.status === "available" ? "skipped: already alerted" : "skipped: no availability"
          : null,
        active: target.active,
        cached: !!lastCheck,
        cacheAge,
      };
    });

    // Apply status filter (post-query since status is derived from checks)
    if (status) {
      items = items.filter((item) => item.status === status);
    }

    const response: PaginatedResponse<TargetSummary> = {
      items,
      total: status ? items.length : total, // Adjust total if status filtered
      page,
      pageSize,
      hasMore: skip + items.length < (status ? items.length : total),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("[API] Failed to list targets:", error);
    return NextResponse.json(
      { 
        success: false,
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
 *   platform?: "acuity" | "calendly" | "microsoft" | "generic" | "unknown";
 *   appointmentType?: "passport" | "consulate" | "city_planning" | "dmv" | "generic";
 *   country?: string;
 *   state?: string;
 *   city?: string;
 *   type?: "acuity" | "generic" | "unknown"; // Legacy field
 *   requirementsUrl?: string;
 *   alertEmail: string;
 *   active?: boolean;
 * }
 * 
 * Response:
 * { 
 *   success: true;
 *   data: { target: TargetSummary };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try new validation schema first, fall back to legacy
    const newResult = CreateTargetSchema.safeParse(body);
    
    if (newResult.success) {
      // Use new schema
      const target = await createTarget({
        name: newResult.data.name,
        bookingUrl: newResult.data.bookingUrl,
        platform: newResult.data.platform,
        appointmentType: newResult.data.appointmentType,
        country: newResult.data.country,
        state: newResult.data.state,
        city: newResult.data.city,
        type: newResult.data.type,
        requirementsUrl: newResult.data.requirementsUrl ?? undefined,
        alertEmail: newResult.data.alertEmail,
        active: newResult.data.active,
      });

      return NextResponse.json({ 
        success: true, 
        data: { target } 
      }, { status: 201 });
    }

    // Fall back to legacy schema for backwards compatibility
    const legacyResult = CreateTargetInputSchema.safeParse(body);
    if (!legacyResult.success) {
      // Return the new schema errors (more comprehensive)
      const formatted = formatZodError(newResult.error);
      return NextResponse.json(
        {
          success: false,
          error: formatted.message,
          issues: formatted.issues,
        },
        { status: 400 }
      );
    }

    // Create target with legacy schema
    const target = await createTarget({
      name: legacyResult.data.name,
      bookingUrl: legacyResult.data.bookingUrl,
      type: legacyResult.data.type,
      requirementsUrl: legacyResult.data.requirementsUrl,
      alertEmail: legacyResult.data.alertEmail,
      active: legacyResult.data.active,
    });

    // Return both legacy and new format for compatibility
    return NextResponse.json({ 
      success: true,
      target, // Legacy format
      data: { target } // New format
    }, { status: 201 });

  } catch (error) {
    console.error("[API] Failed to create target:", error);
    
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
        error: "Failed to create target",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
