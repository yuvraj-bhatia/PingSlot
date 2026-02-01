/**
 * Target Service (CRUD + On-Demand Requirements)
 * 
 * ============================================================================
 * USER FLOW STEP 6: Requirements parsed when user opens detail page
 * ============================================================================
 * 
 * CRUD operations for the target registry.
 * 
 * KEY BEHAVIOR:
 * - listTargets() returns cached status (no scraping)
 * - getTargetDetail() triggers requirements extraction ON-DEMAND
 * - createTarget() does NOT trigger any scraping
 * - toggleTargetActive() does NOT trigger scraping
 * 
 * WHY REQUIREMENTS ARE PARSED ON-DEMAND:
 * - Reducto API calls are expensive
 * - Most users won't view every appointment's requirements
 * - Better UX: fast listing, then load details when needed
 */

import prisma from "./db";
import { extractRequirements, getCachedRequirements } from "./requirements";
import type { TargetType } from "./firecrawlChecker";

export type CreateTargetInput = {
  name: string;
  bookingUrl: string;
  type?: TargetType;
  platform?: string;
  appointmentType?: string;
  state?: string;
  city?: string;
  country?: string;
  requirementsUrl?: string | null;
  alertEmail: string;
  active?: boolean;
};

export type UpdateTargetInput = {
  name?: string;
  bookingUrl?: string;
  type?: TargetType;
  platform?: string;
  appointmentType?: string;
  state?: string;
  city?: string;
  country?: string;
  requirementsUrl?: string | null;
  alertEmail?: string;
  active?: boolean;
};

export type TargetSummary = {
  id: string;
  name: string;
  type: string;
  platform: string;
  appointmentType: string;
  bookingUrl: string;
  state: string | null;
  status: string;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  lastAlertStatus: string | null;
  active: boolean;
  
  // Cache metadata
  cached: boolean;
  cacheAge: number | null;
};

export type TargetDetail = {
  id: string;
  name: string;
  type: string;
  platform: string;
  appointmentType: string;
  bookingUrl: string;
  requirementsUrl: string | null;
  alertEmail: string;
  active: boolean;
  state: string | null;
  city: string | null;
  country: string | null;
  
  // Availability (from last check)
  status: string;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  
  // Requirements (extracted on-demand)
  requirementsBullets: string[] | null;
  requirementsSource: "cached" | "fresh" | "pending" | null;
  
  // Alert info
  lastAlert: {
    status: string;
    reason: string | null;
    at: string | null;
  } | null;
  
  // Last check summary
  lastCheck: {
    status: string;
    nextSlotTime: string | null;
    bookingLink: string | null;
    email: { sent: boolean; reason: string };
    requirementsCount: number;
    checkedAt: string;
  } | null;
  
  // History
  recentChecks: {
    checkedAt: string;
    status: string;
    nextSlotTime: string | null;
    emailSent: boolean;
    rawDebug: string | null;
  }[];
};

// ============================================================================
// List Targets (Cache-Only, No Scraping)
// ============================================================================

/**
 * List all targets with their cached status.
 * 
 * IMPORTANT: This does NOT trigger any scraping.
 * Status comes from the last Check record in the database.
 */
export async function listTargets(): Promise<TargetSummary[]> {
  const targets = await prisma.target.findMany({
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
      },
      alerts: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();

  return targets.map((target) => {
    const lastCheck = target.checks[0];
    const lastAlert = target.alerts[0];
    
    // Calculate cache age
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
      status: lastCheck?.status || "unknown",
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
}

// ============================================================================
// Get Target Detail (On-Demand Requirements)
// ============================================================================

/**
 * Get detailed information for a single target.
 * 
 * ============================================================================
 * CRITICAL: This triggers requirements extraction ON-DEMAND
 * ============================================================================
 * 
 * WHY ON-DEMAND:
 * - User is viewing this specific appointment
 * - They likely want to see the requirements
 * - Now is the right time to extract (if not cached)
 * 
 * @param id - Target ID
 * @param extractRequirementsNow - If true, extract requirements if not cached (default: true)
 */
export async function getTargetDetail(
  id: string,
  extractRequirementsNow = true
): Promise<TargetDetail | null> {
  const target = await prisma.target.findUnique({
    where: { id },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 10,
      },
      alerts: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  if (!target) {
    return null;
  }

  const lastCheck = target.checks[0];
  const lastAlert = target.alerts[0];

  // Requirements extraction ON-DEMAND
  let requirementsBullets: string[] | null = null;
  let requirementsSource: "cached" | "fresh" | "pending" | null = null;

  if (target.requirementsUrl) {
    // Check cache first
    const cached = await getCachedRequirements(id);
    
    if (cached) {
      requirementsBullets = cached;
      requirementsSource = "cached";
    } else if (extractRequirementsNow) {
      // Extract on-demand (this is where Reducto may be called)
      console.log(`[Targets] Extracting requirements on-demand for ${target.name}`);
      
      const result = await extractRequirements(id, target.requirementsUrl);
      requirementsBullets = result.bullets;
      requirementsSource = result.source === "cached" ? "cached" : "fresh";
    } else {
      requirementsSource = "pending";
    }
  }

  // Build recent checks with alert status
  const alertHashes = new Set(
    (await prisma.alert.findMany({
      where: { targetId: id },
      select: { dedupeHash: true },
    })).map((a) => a.dedupeHash)
  );

  const recentChecks = target.checks.map((check) => {
    const dedupeHash = `${id}:${check.nextSlotTime?.toISOString() || "null"}`;
    return {
      checkedAt: check.checkedAt.toISOString(),
      status: check.status,
      nextSlotTime: check.nextSlotTime?.toISOString() || null,
      emailSent: alertHashes.has(dedupeHash),
      rawDebug: check.rawText?.slice(0, 500) || check.errorMessage || null,
    };
  });

  return {
    id: target.id,
    name: target.name,
    type: target.type,
    platform: target.platform,
    appointmentType: target.appointmentType,
    bookingUrl: target.bookingUrl,
    requirementsUrl: target.requirementsUrl,
    alertEmail: target.alertEmail,
    active: target.active,
    state: target.state,
    city: target.city,
    country: target.country,
    status: lastCheck?.status || "unknown",
    nextSlotTime: lastCheck?.nextSlotTime?.toISOString() || null,
    lastCheckedAt: lastCheck?.checkedAt?.toISOString() || null,
    requirementsBullets,
    requirementsSource,
    lastAlert: lastAlert
      ? {
          status: "sent",
          reason: `Alert sent for slot at ${lastAlert.nextSlotTime?.toISOString() || "unknown time"}`,
          at: lastAlert.sentAt.toISOString(),
        }
      : null,
    lastCheck: lastCheck
      ? {
          status: lastCheck.status,
          nextSlotTime: lastCheck.nextSlotTime?.toISOString() || null,
          bookingLink: lastCheck.bookingLink,
          email: lastAlert
            ? { sent: true, reason: "Alert sent" }
            : { sent: false, reason: "No alert needed" },
          requirementsCount: requirementsBullets?.length || 0,
          checkedAt: lastCheck.checkedAt.toISOString(),
        }
      : null,
    recentChecks,
  };
}

// ============================================================================
// Create Target (No Scraping)
// ============================================================================

/**
 * Create a new target.
 * 
 * IMPORTANT: This does NOT trigger any scraping.
 * The target will be checked on the next /api/check call.
 */
export async function createTarget(input: CreateTargetInput): Promise<TargetSummary> {
  const target = await prisma.target.create({
    data: {
      name: input.name,
      bookingUrl: input.bookingUrl,
      type: input.type || "unknown",
      platform: input.platform || "unknown",
      appointmentType: input.appointmentType || "generic",
      state: input.state || null,
      city: input.city || null,
      country: input.country || null,
      requirementsUrl: input.requirementsUrl || null,
      alertEmail: input.alertEmail,
      active: input.active ?? true,
    },
  });

  return {
    id: target.id,
    name: target.name,
    type: target.type,
    platform: target.platform,
    appointmentType: target.appointmentType,
    bookingUrl: target.bookingUrl,
    state: target.state,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    lastAlertStatus: null,
    active: target.active,
    cached: false,
    cacheAge: null,
  };
}

// ============================================================================
// Update Target
// ============================================================================

export async function updateTarget(
  id: string,
  input: UpdateTargetInput
): Promise<TargetSummary | null> {
  const existing = await prisma.target.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const target = await prisma.target.update({
    where: { id },
    data: {
      name: input.name,
      bookingUrl: input.bookingUrl,
      type: input.type,
      platform: input.platform,
      appointmentType: input.appointmentType,
      state: input.state,
      city: input.city,
      country: input.country,
      requirementsUrl: input.requirementsUrl,
      alertEmail: input.alertEmail,
      active: input.active,
    },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
      },
      alerts: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  const lastCheck = target.checks[0];
  const lastAlert = target.alerts[0];
  const now = Date.now();
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
    status: lastCheck?.status || "unknown",
    nextSlotTime: lastCheck?.nextSlotTime?.toISOString() || null,
    lastCheckedAt: lastCheck?.checkedAt?.toISOString() || null,
    lastAlertStatus: lastAlert
      ? `sent: ${lastAlert.sentAt.toISOString()}`
      : null,
    active: target.active,
    cached: !!lastCheck,
    cacheAge,
  };
}

// ============================================================================
// Delete Target
// ============================================================================

export async function deleteTarget(id: string): Promise<boolean> {
  const existing = await prisma.target.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.target.delete({ where: { id } });
  return true;
}

// ============================================================================
// Toggle Target Active
// ============================================================================

export async function toggleTargetActive(id: string, active: boolean): Promise<TargetSummary | null> {
  return updateTarget(id, { active });
}

export default {
  listTargets,
  getTargetDetail,
  createTarget,
  updateTarget,
  deleteTarget,
  toggleTargetActive,
};
