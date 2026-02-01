/**
 * Search Service (Cache-First, No Scraping)
 * 
 * ============================================================================
 * USER FLOW STEP 2: Search returns cached results immediately
 * ============================================================================
 * 
 * WHY SEARCH DOES NOT SCRAPE:
 * - Search is for FAST discovery - user wants to see matching targets instantly
 * - Firecrawl scraping is slow (2-5 seconds per target)
 * - Dashboard should show results immediately, then update as checks complete
 * - Scraping happens in /api/check, NOT in /api/search
 * 
 * WHAT THIS SERVICE DOES:
 * 1. Filters targets from database by appointmentType + location
 * 2. Returns cached check results if available (< cacheTtlMinutes old)
 * 3. Marks stale/uncached targets as "checking" for UI to show loading state
 * 4. NEVER calls Firecrawl - that's the pipeline's job
 * 
 * IMPORTANT CONSTRAINTS:
 * - ONLY queries existing targets in the database
 * - NEVER discovers or adds new URLs
 * - NEVER calls Firecrawl, Reducto, or any external scraping service
 */

import prisma from "./db";
import config from "./config";

// ============================================================================
// Types
// ============================================================================

export type AppointmentType = "passport" | "consulate" | "city_planning" | "dmv" | "visa" | "generic";

export type LocationFilter = {
  state?: string;
  city?: string;
  country?: string;
};

export type SearchInput = {
  appointmentType: AppointmentType | "all";
  location?: LocationFilter;
  includeNeighborStates?: boolean;
};

/**
 * Search result item with cache status.
 * Status can be from cache or "checking" if stale/missing.
 */
export type SearchResultItem = {
  targetId: string;
  name: string;
  location: string;
  bookingUrl: string;
  platform: string;
  appointmentType: string;
  
  // Availability info (from cache or "checking")
  status: "available" | "unavailable" | "unknown" | "requires_interaction" | "checking";
  nextSlotTime: string | null;
  
  // Cache metadata
  cached: boolean;              // True if result is from cache
  cacheAge: number | null;      // Age in seconds, null if not cached
  stale: boolean;               // True if cache is expired
  lastCheckedAt: string | null; // ISO timestamp of last check
};

export type SearchResponse = {
  totalTargets: number;
  cachedResults: number;
  staleResults: number;
  results: SearchResultItem[];
  
  // IDs of targets that need fresh checks (for /api/check to process)
  targetsNeedingCheck: string[];
};

// ============================================================================
// Configuration
// ============================================================================

// Cache TTL in milliseconds - results older than this are "stale"
const CACHE_TTL_MS = config.cacheTtlMinutes * 60 * 1000;

// ============================================================================
// Location Formatting
// ============================================================================

function formatLocation(target: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string {
  const parts: string[] = [];
  if (target.city) parts.push(target.city);
  if (target.state) parts.push(target.state);
  if (target.country) parts.push(target.country);
  return parts.join(", ") || "Unknown location";
}

// ============================================================================
// Target Filtering (Database Only)
// ============================================================================

/**
 * Filters targets from the database by appointment type and location.
 * 
 * WHY DATABASE ONLY:
 * - We have a predefined list of targets to monitor
 * - We NEVER discover or add new URLs automatically
 * - This ensures deterministic, safe behavior for demos
 */
async function filterTargets(input: SearchInput) {
  const { appointmentType, location } = input;

  // Build where clause - only active targets
  type WhereClause = {
    active: boolean;
    appointmentType?: string | { in: string[] };
    state?: { contains: string };
    city?: { contains: string };
    country?: { contains: string };
  };

  const whereClause: WhereClause = { active: true };

  // Filter by appointment type (unless "all")
  if (appointmentType && appointmentType !== "all") {
    whereClause.appointmentType = appointmentType;
  }

  // Add location filters if provided (case-insensitive partial match)
  if (location?.state) {
    // If includeNeighborStates, we'd expand here but that's handled by pipeline
    whereClause.state = { contains: location.state };
  }
  if (location?.city) {
    whereClause.city = { contains: location.city };
  }
  if (location?.country) {
    whereClause.country = { contains: location.country };
  }

  // Query database - ONLY returns existing targets
  const targets = await prisma.target.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      bookingUrl: true,
      platform: true,
      appointmentType: true,
      city: true,
      state: true,
      country: true,
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

  return targets;
}

// ============================================================================
// Main Search Function (Cache-First)
// ============================================================================

/**
 * Search for appointments by type and location.
 * 
 * ============================================================================
 * CRITICAL: This function does NOT scrape. It only returns cached results.
 * ============================================================================
 * 
 * WHY CACHE IS TRUSTED FIRST:
 * - Provides instant results to the user
 * - Avoids unnecessary API calls to Firecrawl
 * - Stale results are marked for refresh by /api/check
 * - User sees "checking" status for stale targets, then UI updates
 * 
 * @param input - Search criteria (appointmentType + optional location)
 * @returns Cached results + list of targets needing fresh checks
 */
export async function executeSearch(input: SearchInput): Promise<SearchResponse> {
  console.log(`[Search] Searching for ${input.appointmentType} appointments (cache-first, no scraping)`);
  if (input.location) {
    console.log(`[Search] Location filter:`, input.location);
  }

  // Step 1: Filter targets from database
  const targets = await filterTargets(input);

  console.log(`[Search] Found ${targets.length} matching targets in database`);

  if (targets.length === 0) {
    return {
      totalTargets: 0,
      cachedResults: 0,
      staleResults: 0,
      results: [],
      targetsNeedingCheck: [],
    };
  }

  // Step 2: Build results from cache (NO SCRAPING)
  const results: SearchResultItem[] = [];
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

    // If no cache or stale, mark for checking
    if (!cached || stale) {
      targetsNeedingCheck.push(target.id);
    }

    // Build result item
    // Status is from cache if fresh, otherwise "checking"
    const status = (cached && !stale && lastCheck)
      ? lastCheck.status as SearchResultItem["status"]
      : "checking";

    results.push({
      targetId: target.id,
      name: target.name,
      location: formatLocation(target),
      bookingUrl: target.bookingUrl,
      platform: target.platform,
      appointmentType: target.appointmentType,
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

  console.log(`[Search] Results: ${cachedCount} cached, ${staleCount} stale, ${targetsNeedingCheck.length} need checking`);

  return {
    totalTargets: targets.length,
    cachedResults: cachedCount,
    staleResults: staleCount,
    results,
    targetsNeedingCheck,
  };
}

// ============================================================================
// Validation
// ============================================================================

const VALID_APPOINTMENT_TYPES: (AppointmentType | "all")[] = [
  "passport",
  "consulate",
  "city_planning",
  "dmv",
  "visa",
  "generic",
  "all",
];

export function isValidAppointmentType(type: string): type is AppointmentType | "all" {
  return VALID_APPOINTMENT_TYPES.includes(type as AppointmentType);
}

export function getValidAppointmentTypes(): (AppointmentType | "all")[] {
  return [...VALID_APPOINTMENT_TYPES];
}

export default {
  executeSearch,
  isValidAppointmentType,
  getValidAppointmentTypes,
};
