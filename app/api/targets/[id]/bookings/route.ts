import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/backend/db';
import { PaginationSchema, parseQuery } from '../../../../../lib/validations';
import type { BookingSummary, PaginatedResponse } from '../../../../../lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/targets/[id]/bookings
 * Get booking history for a specific target.
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * 
 * Response:
 * {
 *   success: true;
 *   data: {
 *     items: BookingSummary[];
 *     total: number;
 *     page: number;
 *     pageSize: number;
 *     hasMore: boolean;
 *   };
 * }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Validate target exists
    const target = await prisma.target.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target not found' },
        { status: 404 }
      );
    }

    // Parse pagination parameters
    const queryResult = parseQuery(request.nextUrl.searchParams, PaginationSchema);
    
    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const { page, pageSize } = queryResult.data;
    const skip = (page - 1) * pageSize;

    // Get total count and bookings
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: { targetId: id } }),
      prisma.booking.findMany({
        where: { targetId: id },
        orderBy: { startedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    // Transform to BookingSummary
    const items: BookingSummary[] = bookings.map((booking) => ({
      id: booking.id,
      status: booking.status as BookingSummary['status'],
      slotDateTime: booking.slotDateTime?.toISOString() || null,
      confirmationNum: booking.confirmationNum,
      screenshotUrl: booking.screenshotUrl,
      errorMessage: booking.errorMessage,
      startedAt: booking.startedAt.toISOString(),
      completedAt: booking.completedAt?.toISOString() || null,
    }));

    const response: PaginatedResponse<BookingSummary> = {
      items,
      total,
      page,
      pageSize,
      hasMore: skip + bookings.length < total,
    };

    return NextResponse.json({
      success: true,
      data: response,
      target: {
        id: target.id,
        name: target.name,
      },
    });

  } catch (error) {
    console.error('[API/Bookings] Failed to get booking history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get booking history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
