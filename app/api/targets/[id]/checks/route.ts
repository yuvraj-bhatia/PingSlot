import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/backend/db';
import { PaginationSchema, parseQuery } from '../../../../../lib/validations';
import type { CheckSummary, PaginatedResponse } from '../../../../../lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/targets/[id]/checks
 * Get check history for a specific target.
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * 
 * Response:
 * {
 *   success: true;
 *   data: {
 *     items: CheckSummary[];
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

    // Get total count and checks
    const [total, checks] = await Promise.all([
      prisma.check.count({ where: { targetId: id } }),
      prisma.check.findMany({
        where: { targetId: id },
        orderBy: { checkedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    // Get alerts to determine which checks resulted in emails
    const alertHashes = new Set(
      (await prisma.alert.findMany({
        where: { targetId: id },
        select: { dedupeHash: true },
      })).map((a) => a.dedupeHash)
    );

    // Transform to CheckSummary
    const items: CheckSummary[] = checks.map((check) => {
      const dedupeHash = `${id}:${check.nextSlotTime?.toISOString() || 'null'}`;
      return {
        id: check.id,
        checkedAt: check.checkedAt.toISOString(),
        status: check.status as CheckSummary['status'],
        nextSlotTime: check.nextSlotTime?.toISOString() || null,
        emailSent: alertHashes.has(dedupeHash),
        bookingLink: check.bookingLink,
        errorMessage: check.errorMessage,
        rawDebug: check.rawText?.slice(0, 500) || null,
      };
    });

    const response: PaginatedResponse<CheckSummary> = {
      items,
      total,
      page,
      pageSize,
      hasMore: skip + checks.length < total,
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
    console.error('[API/Checks] Failed to get check history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get check history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
