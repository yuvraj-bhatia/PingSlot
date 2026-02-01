/**
 * POST /api/search (Cache-First, No Scraping)
 * 
 * ============================================================================
 * USER FLOW STEP 2: Search returns cached results immediately
 * ============================================================================
 * 
 * WHY SEARCH DOES NOT SCRAPE:
 * - Search is for FAST discovery - user wants to see matching targets instantly
 * - Firecrawl scraping is slow (2-5 seconds per target)
 * - Dashboard should show results immediately, then update as checks complete
 * - Scraping happens in /api/check, NOT here
 * 
 * BEHAVIOR:
 * - Returns cached results if available (< cacheTtlMinutes old)
 * - Marks stale/uncached targets as "checking"
 * - Returns targetsNeedingCheck array for UI to trigger /api/check
 * 
 * Request body:
 * {
 *   appointmentType: "passport" | "consulate" | "city_planning" | "dmv" | "visa" | "generic" | "all",
 *   location?: {
 *     state?: string,
 *     city?: string,
 *     country?: string
 *   }
 * }
 * 
 * Response:
 * {
 *   totalTargets: number,
 *   cachedResults: number,
 *   staleResults: number,
 *   results: [...],
 *   targetsNeedingCheck: string[]  // IDs to pass to /api/check
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeSearch, isValidAppointmentType, getValidAppointmentTypes } from "../../../lib/backend/searchService";

// ============================================================================
// Request Validation Schema
// ============================================================================

const SearchRequestSchema = z.object({
  appointmentType: z.string().min(1, "appointmentType is required"),
  location: z
    .object({
      state: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = SearchRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { appointmentType, location } = parseResult.data;

    if (!isValidAppointmentType(appointmentType)) {
      return NextResponse.json(
        {
          error: "Invalid appointmentType",
          message: `appointmentType must be one of: ${getValidAppointmentTypes().join(", ")}`,
          received: appointmentType,
        },
        { status: 400 }
      );
    }

    // Execute search (cache-first, NO SCRAPING)
    // Returns cached results + list of targets needing fresh checks
    const result = await executeSearch({
      appointmentType: appointmentType as any,
      location,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/Search] Error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler (for discovery)
// ============================================================================

export async function GET() {
  return NextResponse.json({
    description: "Search for appointments by type and location. Returns CACHED results only - no scraping.",
    availableTypes: getValidAppointmentTypes(),
    usage: {
      method: "POST",
      body: {
        appointmentType: "string (required) - one of the availableTypes",
        location: {
          state: "string (optional)",
          city: "string (optional)",
          country: "string (optional)",
        },
      },
    },
    notes: [
      "This endpoint returns CACHED results only - it does NOT scrape",
      "Check the 'targetsNeedingCheck' array in the response",
      "Call POST /api/check with those target IDs to refresh stale data",
    ],
  });
}
