/**
 * Location-Based Search Service (Cache-First, No Scraping)
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
 * WHAT THIS SERVICE DOES:
 * 1. Finds user's state and optionally neighboring states
 * 2. Queries database for matching targets
 * 3. Returns cached check results (from database Check table)
 * 4. Marks stale/uncached targets as "checking"
 * 5. NEVER calls Firecrawl - that's the pipeline's job
 * 
 * WHY CACHE IS TRUSTED FIRST:
 * - Instant feedback to user
 * - Reduces unnecessary API calls
 * - Check pipeline refreshes stale data
 * - UI can poll or wait for updates
 */

import prisma from "./db";
import config from "./config";
import {
  US_STATES,
  findState,
  getNeighboringStates,
  getStatesWithinDistance,
  type USState,
} from "./usStates";

// ============================================================================
// Types
// ============================================================================

export type LocationSearchInput = {
  userState: string;              // User's state (code or name)
  appointmentType: "dmv" | "passport" | "visa" | "consulate" | "city_planning" | "all";
  includeNeighbors?: boolean;     // Include neighboring states (default: true)
  maxDistance?: number;           // Max distance in miles (optional)
};

export type LocationSearchResult = {
  targetId: string;
  name: string;
  state: string;
  stateName: string;
  appointmentType: string;
  bookingUrl: string;
  distance: number;               // Distance from user's state in miles
  
  // Availability info (from cache or "checking")
  status: "available" | "unavailable" | "unknown" | "requires_interaction" | "checking";
  nextSlotTime: string | null;
  
  // Cache metadata
  cached: boolean;
  cacheAge: number | null;
  stale: boolean;
  lastCheckedAt: string | null;
};

export type LocationSearchResponse = {
  userState: string;
  userStateName: string;
  searchedStates: string[];
  totalTargets: number;
  cachedResults: number;
  staleResults: number;
  results: LocationSearchResult[];
  
  // IDs of targets that need fresh checks
  targetsNeedingCheck: string[];
};

// ============================================================================
// Configuration
// ============================================================================

// Cache TTL - results older than this are "stale"
const CACHE_TTL_MS = config.cacheTtlMinutes * 60 * 1000;

// ============================================================================
// Distance Calculation
// ============================================================================

/**
 * Calculate approximate distance between two states in miles.
 * Uses Haversine-like approximation (good enough for sorting).
 */
function calculateDistance(state1: USState, state2: USState): number {
  if (state1.code === state2.code) return 0;
  
  const latDiff = state1.lat - state2.lat;
  const lngDiff = state1.lng - state2.lng;
  
  // Rough miles per degree (varies by latitude, but good for US)
  return Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69);
}

// ============================================================================
// Main Search Function (Cache-First)
// ============================================================================

/**
 * Search for appointments by location.
 * 
 * ============================================================================
 * CRITICAL: This function does NOT scrape. It only returns cached results.
 * ============================================================================
 * 
 * WHY WE DON'T SCRAPE HERE:
 * - User wants instant results when selecting a state
 * - Scraping 5+ states would take 15-30 seconds
 * - Instead, we return cached data and let /api/check refresh stale targets
 * - UI shows "checking" status and updates when fresh data arrives
 * 
 * @param input - Search parameters including user's state
 * @returns Cached results + list of targets needing fresh checks
 */
export async function searchByLocation(
  input: LocationSearchInput
): Promise<LocationSearchResponse> {
  console.log(`[LocationSearch] Searching by location (cache-first, no scraping)`);
  
  // Find user's state
  const userState = findState(input.userState);
  if (!userState) {
    console.log(`[LocationSearch] Invalid state: ${input.userState}`);
    return {
      userState: input.userState,
      userStateName: "Unknown",
      searchedStates: [],
      totalTargets: 0,
      cachedResults: 0,
      staleResults: 0,
      results: [],
      targetsNeedingCheck: [],
    };
  }
  
  console.log(`[LocationSearch] User state: ${userState.name} (${userState.code})`);
  
  // Determine which states to search
  let statesToSearch: USState[];
  
  if (input.maxDistance) {
    statesToSearch = getStatesWithinDistance(userState.code, input.maxDistance);
  } else if (input.includeNeighbors !== false) {
    statesToSearch = getNeighboringStates(userState.code);
  } else {
    statesToSearch = [userState];
  }
  
  const stateCodes = statesToSearch.map(s => s.code);
  console.log(`[LocationSearch] Searching ${statesToSearch.length} states: ${stateCodes.join(", ")}`);
  
  // Query targets from database with their latest check
  type WhereClause = {
    active: boolean;
    state?: { in: string[] };
    appointmentType?: string;
  };
  
  const whereClause: WhereClause = {
    active: true,
    state: { in: stateCodes },
  };
  
  if (input.appointmentType && input.appointmentType !== "all") {
    whereClause.appointmentType = input.appointmentType;
  }
  
  const targets = await prisma.target.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      bookingUrl: true,
      appointmentType: true,
      state: true,
      // Include latest check for cache
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
        select: {
          status: true,
          nextSlotTime: true,
          checkedAt: true,
        },
      },
    },
    orderBy: [
      { state: "asc" },
      { name: "asc" },
    ],
  });
  
  console.log(`[LocationSearch] Found ${targets.length} targets in database`);
  
  if (targets.length === 0) {
    return {
      userState: userState.code,
      userStateName: userState.name,
      searchedStates: stateCodes,
      totalTargets: 0,
      cachedResults: 0,
      staleResults: 0,
      results: [],
      targetsNeedingCheck: [],
    };
  }
  
  // Build results from cache (NO SCRAPING)
  const results: LocationSearchResult[] = [];
  const targetsNeedingCheck: string[] = [];
  let cachedCount = 0;
  let staleCount = 0;
  
  const now = Date.now();
  
  for (const target of targets) {
    const lastCheck = target.checks[0];
    const lastCheckedAt = lastCheck?.checkedAt;
    
    // Determine cache status
    let cached = false;
    let stale = true;
    let cacheAge: number | null = null;
    
    if (lastCheckedAt) {
      cacheAge = Math.round((now - lastCheckedAt.getTime()) / 1000);
      cached = true;
      stale = (now - lastCheckedAt.getTime()) > CACHE_TTL_MS;
      
      if (!stale) {
        cachedCount++;
      } else {
        staleCount++;
      }
    }
    
    // Mark stale/uncached for checking
    if (!cached || stale) {
      targetsNeedingCheck.push(target.id);
    }
    
    // Find state info for distance calculation
    const targetState = findState(target.state || "");
    const distance = targetState ? calculateDistance(userState, targetState) : 999;
    
    // Status from cache if fresh, otherwise "checking"
    const status = (cached && !stale && lastCheck)
      ? lastCheck.status as LocationSearchResult["status"]
      : "checking";
    
    results.push({
      targetId: target.id,
      name: target.name,
      state: target.state || "",
      stateName: targetState?.name || target.state || "Unknown",
      appointmentType: target.appointmentType,
      bookingUrl: target.bookingUrl,
      distance,
      status,
      nextSlotTime: (cached && !stale && lastCheck?.nextSlotTime)
        ? lastCheck.nextSlotTime.toISOString()
        : null,
      cached,
      cacheAge,
      stale,
      lastCheckedAt: lastCheckedAt?.toISOString() || null,
    });
  }
  
  // Sort: user's state first, then by availability, then by distance
  results.sort((a, b) => {
    // User's state first
    if (a.state === userState.code && b.state !== userState.code) return -1;
    if (b.state === userState.code && a.state !== userState.code) return 1;
    
    // Available first
    if (a.status === "available" && b.status !== "available") return -1;
    if (b.status === "available" && a.status !== "available") return 1;
    
    // Then by distance
    return a.distance - b.distance;
  });
  
  console.log(`[LocationSearch] Results: ${cachedCount} cached, ${staleCount} stale, ${targetsNeedingCheck.length} need checking`);
  
  return {
    userState: userState.code,
    userStateName: userState.name,
    searchedStates: stateCodes,
    totalTargets: targets.length,
    cachedResults: cachedCount,
    staleResults: staleCount,
    results,
    targetsNeedingCheck,
  };
}

// ============================================================================
// Cache Pre-warming (Optional, for Demo)
// ============================================================================

/**
 * Pre-warm cache for specific states.
 * 
 * NOTE: This is the ONLY function that should trigger scraping.
 * It's called explicitly by /api/check, not by search.
 * 
 * @deprecated Use /api/check with targetIds instead
 */
export async function prewarmCache(stateCodes: string[]): Promise<void> {
  console.log(`[LocationSearch] prewarmCache is deprecated - use /api/check instead`);
  // No-op: scraping should happen through the check pipeline
}

// ============================================================================
// Cache Stats (for debugging)
// ============================================================================

export function getCacheStats(): {
  message: string;
} {
  return {
    message: "Cache is now stored in database Check table. Query /api/results for cache info.",
  };
}

export function clearCache(): void {
  console.log("[LocationSearch] clearCache is a no-op - cache is in database");
}

export default {
  searchByLocation,
  prewarmCache,
  getCacheStats,
  clearCache,
};
