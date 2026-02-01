/**
 * POST /api/search-location (Cache-First, No Scraping)
 * 
 * ============================================================================
 * USER FLOW STEP 1-2: User selects location, gets cached results instantly
 * ============================================================================
 * 
 * WHY SEARCH DOES NOT SCRAPE:
 * - User expects instant results when selecting a state
 * - Firecrawl scraping is slow (2-5 seconds per target)
 * - Cache provides fast initial response
 * - Stale targets are marked for /api/check to refresh
 * 
 * BEHAVIOR:
 * - Returns cached results from database Check table
 * - Marks stale/uncached targets as "checking"
 * - Returns targetsNeedingCheck array for UI to trigger /api/check
 * 
 * Request body:
 * {
 *   state: "CA" | "California" | etc.,
 *   appointmentType: "dmv" | "passport" | "visa" | "consulate" | "city_planning" | "all",
 *   includeNeighbors?: boolean (default: true),
 *   maxDistance?: number (optional, in miles)
 * }
 * 
 * Response:
 * {
 *   userState: string,
 *   userStateName: string,
 *   searchedStates: string[],
 *   totalTargets: number,
 *   cachedResults: number,
 *   staleResults: number,
 *   results: [...],
 *   targetsNeedingCheck: string[]  // IDs to pass to /api/check
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  searchByLocation,
  getCacheStats,
  clearCache,
} from "../../../lib/backend/locationSearch";
import { US_STATES, findState } from "../../../lib/backend/usStates";

// ============================================================================
// Request Validation
// ============================================================================

const SearchLocationRequestSchema = z.object({
  state: z.string().min(1, "State is required"),
  appointmentType: z.enum(["dmv", "passport", "visa", "consulate", "city_planning", "all"]).default("dmv"),
  includeNeighbors: z.boolean().default(true),
  maxDistance: z.number().optional(),
});

// ============================================================================
// POST Handler - Search by Location (Cache-First)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = SearchLocationRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { state, appointmentType, includeNeighbors, maxDistance } = parseResult.data;

    // Validate state exists
    const userState = findState(state);
    if (!userState) {
      return NextResponse.json(
        {
          error: "Invalid state",
          message: `State "${state}" not found. Use state code (e.g., "CA") or full name (e.g., "California")`,
          availableStates: US_STATES.map((s) => ({ code: s.code, name: s.name })),
        },
        { status: 400 }
      );
    }

    console.log(`[API/SearchLocation] Searching for ${appointmentType} in ${userState.name} (cache-first, no scraping)`);

    // Execute location-based search (CACHE-FIRST, NO SCRAPING)
    const result = await searchByLocation({
      userState: state,
      appointmentType,
      includeNeighbors,
      maxDistance,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/SearchLocation] Error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Discovery & Cache Stats
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Return cache stats
  if (action === "cache") {
    return NextResponse.json({
      cache: getCacheStats(),
    });
  }

  // Clear cache
  if (action === "clear-cache") {
    clearCache();
    return NextResponse.json({ message: "Cache cleared (note: cache is in database)" });
  }

  // Return API documentation
  return NextResponse.json({
    description: "Location-based personalized appointment search. Returns CACHED results only - no scraping.",
    features: [
      "Searches user's state + neighboring states",
      "Returns cached results from database",
      "Marks stale targets for refresh via /api/check",
      "Results sorted by distance and availability",
    ],
    usage: {
      method: "POST",
      body: {
        state: "string (required) - State code (e.g., 'CA') or name (e.g., 'California')",
        appointmentType: "'dmv' | 'passport' | 'visa' | 'consulate' | 'city_planning' | 'all' (default: 'dmv')",
        includeNeighbors: "boolean (default: true) - Include neighboring states",
        maxDistance: "number (optional) - Max distance in miles",
      },
    },
    notes: [
      "This endpoint returns CACHED results only - it does NOT scrape",
      "Check the 'targetsNeedingCheck' array in the response",
      "Call POST /api/check with those target IDs to refresh stale data",
    ],
    availableStates: US_STATES.map((s) => ({
      code: s.code,
      name: s.name,
      hasDmv: true,
      hasPassport: !!s.passportUrl,
      hasVisa: !!s.visaUrl,
      neighbors: s.neighbors,
    })),
  });
}
