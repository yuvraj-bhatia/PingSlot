import { NextRequest, NextResponse } from "next/server";
import { runChecks } from "../../../lib/backend";
import { z } from "zod";

/**
 * POST /api/check (Firecrawl for Stale/Missing Only)
 * 
 * ============================================================================
 * USER FLOW STEP 3: Backend runs Firecrawl ONLY for uncached or stale targets
 * ============================================================================
 * 
 * CACHE BEHAVIOR:
 * - If a target has a fresh Check (< cacheTtlMinutes), return cached result
 * - If cache is stale or missing, call Firecrawl
 * - forceRefresh=true ignores cache and scrapes all targets
 * 
 * WHY CACHE IS TRUSTED FIRST:
 * - Avoids unnecessary API calls to Firecrawl
 * - Provides instant results for fresh data
 * - Reduces load on target websites
 * 
 * Request body:
 * {
 *   targetIds?: string[],     // Optional: specific targets to check
 *   forceRefresh?: boolean    // Optional: ignore cache and always scrape
 * }
 * 
 * Response:
 * {
 *   runId: string;
 *   status: "completed" | "failed";
 *   startedAt: string;
 *   completedAt: string;
 *   summary: {
 *     checked: number;
 *     available: number;
 *     emailsSent: number;
 *     cachedResults: number;   // Results from cache
 *     freshResults: number;    // Results from Firecrawl
 *   };
 *   results: CheckResultItem[];
 *   errors: { targetId: string; message: string }[];
 * }
 */

const CheckRequestSchema = z.object({
  targetIds: z.array(z.string()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Validate input
    const result = CheckRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { targetIds, forceRefresh } = result.data;

    console.log(`[API/Check] Starting check run (forceRefresh=${forceRefresh}, targets=${targetIds?.length || "all"})`);

    // Run the check pipeline
    // - Uses cache for fresh results
    // - Calls Firecrawl only for stale/missing
    const checkResult = await runChecks(targetIds, forceRefresh);

    return NextResponse.json(checkResult);
  } catch (error) {
    console.error("[API] Check run failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to run checks",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    description: "Run availability checks on targets. Uses cache for fresh results, Firecrawl for stale/missing.",
    usage: {
      method: "POST",
      body: {
        targetIds: "string[] (optional) - Specific target IDs to check. If omitted, checks all active targets.",
        forceRefresh: "boolean (optional, default: false) - If true, ignores cache and scrapes all targets.",
      },
    },
    notes: [
      "Fresh cached results (< cacheTtlMinutes old) are returned immediately without scraping",
      "Stale or missing results trigger Firecrawl scraping",
      "Use forceRefresh=true to force scraping all targets",
      "Check summary.cachedResults and summary.freshResults to see cache efficiency",
    ],
    workflow: [
      "1. Call POST /api/search to get cached results + targetsNeedingCheck",
      "2. Call POST /api/check with { targetIds: targetsNeedingCheck } to refresh stale data",
      "3. Poll or re-call /api/search to get updated results",
    ],
  });
}
