import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/backend/db';
import { ExtractRequirementsSchema, formatZodError, parseBody } from '../../../../../lib/validations';
import { extractRequirements, getCachedRequirements } from '../../../../../lib/backend/requirements';
import type { RequirementItem } from '../../../../../lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/targets/[id]/requirements
 * Get requirements for a specific target.
 * 
 * Returns cached requirements if available, or null if not yet extracted.
 * 
 * Response:
 * {
 *   success: true;
 *   data: {
 *     hasRequirements: boolean;
 *     requirements: RequirementItem[] | null;
 *     source: 'cached' | 'database' | null;
 *     sourceUrl: string | null;
 *     extractedAt: string | null;
 *   };
 * }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Validate target exists
    const target = await prisma.target.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        requirementsUrl: true,
        requirementsBullets: true,
      },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target not found' },
        { status: 404 }
      );
    }

    // Check for requirements in the new Requirement model first
    const requirement = await prisma.requirement.findUnique({
      where: { targetId: id },
    });

    if (requirement) {
      let items: RequirementItem[] = [];
      try {
        items = JSON.parse(requirement.items);
      } catch {
        // Fallback to empty array if parse fails
      }

      return NextResponse.json({
        success: true,
        data: {
          hasRequirements: items.length > 0,
          requirements: items,
          source: 'database',
          sourceUrl: requirement.sourceUrl,
          extractedAt: requirement.extractedAt.toISOString(),
        },
        target: {
          id: target.id,
          name: target.name,
        },
      });
    }

    // Fallback to cached requirements in Target model (legacy)
    const cached = await getCachedRequirements(id);
    
    if (cached && cached.length > 0) {
      // Convert string array to RequirementItem array
      const items: RequirementItem[] = cached.map((text) => ({
        text,
        category: 'other' as const,
        required: true,
      }));

      return NextResponse.json({
        success: true,
        data: {
          hasRequirements: true,
          requirements: items,
          source: 'cached',
          sourceUrl: target.requirementsUrl,
          extractedAt: null, // Unknown for legacy cache
        },
        target: {
          id: target.id,
          name: target.name,
        },
      });
    }

    // No requirements found
    return NextResponse.json({
      success: true,
      data: {
        hasRequirements: false,
        requirements: null,
        source: null,
        sourceUrl: target.requirementsUrl,
        extractedAt: null,
      },
      target: {
        id: target.id,
        name: target.name,
      },
    });

  } catch (error) {
    console.error('[API/Requirements] Failed to get requirements:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get requirements',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/targets/[id]/requirements
 * Extract requirements for a target from its requirements URL.
 * 
 * Request body:
 * {
 *   sourceUrl?: string; // Override the target's requirementsUrl
 *   forceRefresh?: boolean; // Force re-extraction even if cached
 * }
 * 
 * Response:
 * {
 *   success: true;
 *   data: {
 *     requirements: RequirementItem[];
 *     source: 'fresh' | 'cached';
 *     sourceUrl: string;
 *     extractedAt: string;
 *   };
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Validate target exists
    const target = await prisma.target.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        requirementsUrl: true,
      },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const parseResult = await parseBody(request, ExtractRequirementsSchema);
    
    if (!parseResult.success) {
      const formatted = formatZodError(parseResult.error);
      return NextResponse.json(
        { success: false, error: formatted.message, issues: formatted.issues },
        { status: 400 }
      );
    }

    const { sourceUrl, forceRefresh } = parseResult.data;
    const urlToUse = sourceUrl || target.requirementsUrl;

    if (!urlToUse) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No requirements URL available. Provide sourceUrl in request body or set requirementsUrl on the target.',
        },
        { status: 400 }
      );
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const existing = await prisma.requirement.findUnique({
        where: { targetId: id },
      });

      if (existing) {
        let items: RequirementItem[] = [];
        try {
          items = JSON.parse(existing.items);
        } catch {
          // Fallback to empty array
        }

        return NextResponse.json({
          success: true,
          data: {
            requirements: items,
            source: 'cached',
            sourceUrl: existing.sourceUrl,
            extractedAt: existing.extractedAt.toISOString(),
          },
          target: {
            id: target.id,
            name: target.name,
          },
        });
      }
    }

    // Extract requirements using the backend service
    console.log(`[API/Requirements] Extracting requirements for ${target.name} from ${urlToUse}`);
    
    const result = await extractRequirements(id, urlToUse);
    
    if (!result.bullets || result.bullets.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          requirements: [],
          source: 'fresh',
          sourceUrl: urlToUse,
          extractedAt: new Date().toISOString(),
          message: 'No requirements found in the source document',
        },
        target: {
          id: target.id,
          name: target.name,
        },
      });
    }

    // Convert bullets to RequirementItem format
    const items: RequirementItem[] = result.bullets.map((text) => ({
      text,
      category: 'other' as const,
      required: true,
    }));

    // Store in Requirement model
    await prisma.requirement.upsert({
      where: { targetId: id },
      create: {
        targetId: id,
        sourceUrl: urlToUse,
        items: JSON.stringify(items),
        rawContent: null, // Could store raw content if available
      },
      update: {
        sourceUrl: urlToUse,
        items: JSON.stringify(items),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        requirements: items,
        source: result.source === 'cached' ? 'cached' : 'fresh',
        sourceUrl: urlToUse,
        extractedAt: new Date().toISOString(),
      },
      target: {
        id: target.id,
        name: target.name,
      },
    });

  } catch (error) {
    console.error('[API/Requirements] Failed to extract requirements:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to extract requirements',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/targets/[id]/requirements
 * Clear cached requirements for a target.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Delete from Requirement model
    await prisma.requirement.deleteMany({
      where: { targetId: id },
    });

    // Clear legacy cache in Target model
    await prisma.target.update({
      where: { id },
      data: {
        requirementsBullets: null,
        requirementsHash: null,
      },
    });

    console.log(`[API/Requirements] Cleared requirements cache for ${target.name}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Requirements cache cleared',
      },
    });

  } catch (error) {
    console.error('[API/Requirements] Failed to clear requirements:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear requirements',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
