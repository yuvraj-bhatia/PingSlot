/**
 * Check Pipeline (Firecrawl Only for Stale/Missing Targets)
 * 
 * ============================================================================
 * USER FLOW STEP 3: Backend runs Firecrawl ONLY for uncached or stale targets
 * ============================================================================
 * 
 * WHY CACHE IS TRUSTED FIRST:
 * - Avoids unnecessary API calls to Firecrawl
 * - Provides instant results for fresh data
 * - Reduces load on target websites
 * - Speeds up the check run
 * 
 * WHEN FIRECRAWL IS CALLED:
 * - Target has no Check record (never checked)
 * - Target's last Check is older than cacheTtlMinutes
 * - forceRefresh=true is passed
 * 
 * WHEN FIRECRAWL IS NOT CALLED:
 * - Target has a fresh Check record (< cacheTtlMinutes old)
 * - In this case, we return the cached result
 * 
 * STRICT CONSTRAINTS (NON-NEGOTIABLE):
 * - This pipeline ONLY processes URLs from the database
 * - It NEVER crawls, follows links, or discovers new URLs
 * - Firecrawl is used ONLY with scrapeUrl() on explicit URLs
 * - LLM NEVER fetches URLs, only processes pre-fetched text
 * - Reducto is ONLY called when sending email AND includeRequirements === true
 */

import prisma from "./db";
import config from "./config";
import { checkTargetAvailability, type ExtractionResult, type Target } from "./firecrawlChecker";
import { extractAvailabilityWithLLM, normalizeFirecrawlText } from "./llmExtractor";
import { computeDiff, recordAlert, type DiffResult } from "./diffEngine";
import { extractRequirements, getCachedRequirements } from "./requirements";
import { sendNotification } from "./notifier";
import { getSettings, canSendEmail, type UserSettings } from "./settings";

// ============================================================================
// Types
// ============================================================================

export type CheckResultItem = {
  targetId: string;
  targetName: string;
  status: "available" | "unavailable" | "unknown" | "requires_interaction" | "error";
  nextSlotTime: string | null;
  bookingLink: string | null;
  email: {
    sent: boolean;
    reason: string;
  };
  requirementsCount: number;
  rawDebug: string | null;
  /** Hint for what interaction is needed (if requires_interaction) */
  interactionHint?: string;
  /** Whether result came from cache */
  cached: boolean;
  /** Processing time in ms (0 if cached) */
  processingTimeMs: number;
};

export type CheckRunResult = {
  runId: string;
  status: "completed" | "failed";
  startedAt: string;
  completedAt: string;
  results: CheckResultItem[];
  summary: {
    checked: number;
    available: number;
    emailsSent: number;
    cachedResults: number;
    freshResults: number;
  };
  errors: { targetId: string; message: string }[];
};

// ============================================================================
// Configuration
// ============================================================================

// Cache TTL in milliseconds
const CACHE_TTL_MS = config.cacheTtlMinutes * 60 * 1000;

// ============================================================================
// Cache Check
// ============================================================================

/**
 * Check if a target has a fresh cached result.
 * 
 * @returns The cached check if fresh, null if stale or missing
 */
async function getCachedCheck(targetId: string): Promise<{
  status: string;
  nextSlotTime: Date | null;
  bookingLink: string | null;
  rawText: string | null;
  checkedAt: Date;
} | null> {
  const lastCheck = await prisma.check.findFirst({
    where: { targetId },
    orderBy: { checkedAt: "desc" },
  });

  if (!lastCheck) {
    return null;
  }

  // Check if cache is still valid
  const age = Date.now() - lastCheck.checkedAt.getTime();
  if (age > CACHE_TTL_MS) {
    return null; // Stale
  }

  return lastCheck;
}

// ============================================================================
// Single Target Check (With Cache)
// ============================================================================

/**
 * Check a single target for availability.
 * 
 * ============================================================================
 * CACHE BEHAVIOR:
 * - If target has a fresh Check (< cacheTtlMinutes), return cached result
 * - If cache is stale or missing, call Firecrawl
 * ============================================================================
 * 
 * @param target - Target to check (from database)
 * @param settings - User settings (controls notifications and requirements)
 * @param forceRefresh - If true, ignore cache and always scrape
 */
async function checkSingleTarget(
  target: {
    id: string;
    name: string;
    bookingUrl: string;
    type: string;
    platform?: string;
    requirementsUrl: string | null;
    alertEmail: string;
  },
  settings: UserSettings,
  forceRefresh = false
): Promise<CheckResultItem> {
  const startTime = Date.now();

  // Step 0: Check cache first (unless forceRefresh)
  if (!forceRefresh) {
    const cached = await getCachedCheck(target.id);
    
    if (cached) {
      console.log(`[Pipeline] Using cached result for ${target.name} (age: ${Math.round((Date.now() - cached.checkedAt.getTime()) / 1000)}s)`);
      
      // Get cached requirements count
      const cachedRequirements = await getCachedRequirements(target.id);
      
      return {
        targetId: target.id,
        targetName: target.name,
        status: cached.status as CheckResultItem["status"],
        nextSlotTime: cached.nextSlotTime?.toISOString() || null,
        bookingLink: cached.bookingLink,
        email: {
          sent: false,
          reason: "Using cached result (no re-check needed)",
        },
        requirementsCount: cachedRequirements?.length || 0,
        rawDebug: cached.rawText?.slice(0, 500) || null,
        cached: true,
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  // Step 1: Extract availability from booking page using Firecrawl
  // IMPORTANT: This ONLY fetches the exact bookingUrl, nothing else
  console.log(`[Pipeline] Scraping ${target.name} (cache miss or forced refresh)`);
  
  try {
    let extraction: ExtractionResult = await checkTargetAvailability({
      id: target.id,
      name: target.name,
      bookingUrl: target.bookingUrl,
      type: (target.platform || target.type) as Target["type"],
    });

    // Step 1b: If keyword extraction returned "unknown" and we have Groq, try LLM
    // LLM ONLY processes the pre-fetched text - it NEVER fetches URLs
    if (extraction.status === "unknown" && config.groqApiKey && extraction.rawText) {
      console.log(`[Pipeline] Keyword extraction unclear for ${target.name}, trying LLM...`);
      
      try {
        const normalizedText = normalizeFirecrawlText(extraction.rawText);
        const llmResult = await extractAvailabilityWithLLM(normalizedText);
        
        // Only use LLM result if it's more definitive
        if (llmResult.availability_status !== "unknown") {
          extraction = {
            ...extraction,
            status: llmResult.availability_status as ExtractionResult["status"],
            nextSlotTime: llmResult.next_available_slot,
            interactionHint: llmResult.interaction_hint || extraction.interactionHint,
          };
          console.log(`[Pipeline] LLM extraction: ${llmResult.availability_status}`);
        }
      } catch (llmError) {
        console.warn(`[Pipeline] LLM extraction failed, using keyword result:`, llmError);
      }
    }

    // Step 2: Compute diff against last known state
    const diff: DiffResult = await computeDiff(target.id, {
      status: extraction.status,
      nextSlotTime: extraction.nextSlotTime,
    });

    // Step 3: Persist the check result
    await prisma.check.create({
      data: {
        targetId: target.id,
        status: extraction.status,
        nextSlotTime: extraction.nextSlotTime ? new Date(extraction.nextSlotTime) : null,
        bookingLink: extraction.bookingLink,
        rawText: extraction.rawText?.slice(0, 5000) || null,
        errorMessage: extraction.error || null,
      },
    });

    // Step 4: Handle notification if needed
    let emailResult = { sent: false, reason: diff.reason };
    let requirementsCount = 0;

    // Determine if we should send notification based on settings
    let shouldNotify = diff.shouldAlert;
    
    if (shouldNotify) {
      // Check notification preferences
      if (extraction.status === "available" && diff.isNewAvailability) {
        if (!settings.notifyOnAvailable) {
          shouldNotify = false;
          emailResult.reason = "Notification disabled for new availability (settings)";
        }
      } else if (extraction.status === "available" && diff.isSlotTimeChange) {
        if (!settings.notifyOnSlotChange) {
          shouldNotify = false;
          emailResult.reason = "Notification disabled for slot changes (settings)";
        }
      } else if (extraction.status === "requires_interaction") {
        if (!settings.notifyOnRequiresInteraction) {
          shouldNotify = false;
          emailResult.reason = "Notification disabled for pages requiring interaction (settings)";
        }
      }

      // Check rate limiting
      if (shouldNotify) {
        const rateCheck = await canSendEmail();
        if (!rateCheck.allowed) {
          shouldNotify = false;
          emailResult.reason = rateCheck.reason || "Rate limit exceeded";
        }
      }
    }

    if (shouldNotify) {
      // Get or extract requirements ONLY if includeRequirements is enabled
      // This is the ONLY place where Reducto may be called during a check
      let requirements: string[] = [];
      
      if (settings.includeRequirements && target.requirementsUrl) {
        const cached = await getCachedRequirements(target.id);
        if (cached) {
          requirements = cached;
        } else {
          console.log(`[Pipeline] Extracting requirements for email (includeRequirements=true)`);
          const extracted = await extractRequirements(target.id, target.requirementsUrl);
          requirements = extracted.bullets;
        }
      }
      
      requirementsCount = requirements.length;

      // Send notification
      const notificationEmail = settings.alertEmail || target.alertEmail;
      
      const notificationResult = await sendNotification({
        targetName: target.name,
        bookingUrl: target.bookingUrl,
        nextSlotTime: extraction.nextSlotTime,
        requirementsBullets: requirements,
        requirementsUrl: settings.includeRequirements ? target.requirementsUrl : null,
        alertEmail: notificationEmail,
      });

      if (notificationResult.sent) {
        await recordAlert(
          target.id,
          diff.dedupeHash,
          notificationEmail,
          extraction.nextSlotTime,
          notificationResult.emailId
        );

        emailResult = {
          sent: true,
          reason: diff.reason,
        };
      } else {
        emailResult = {
          sent: false,
          reason: notificationResult.error || "Email send failed",
        };
      }
    } else if (!diff.shouldAlert) {
      const cached = await getCachedRequirements(target.id);
      requirementsCount = cached?.length || 0;
    }

    const duration = Date.now() - startTime;
    console.log(`[Pipeline] Checked ${target.name} in ${duration}ms: ${extraction.status}`);

    return {
      targetId: target.id,
      targetName: target.name,
      status: extraction.status,
      nextSlotTime: extraction.nextSlotTime,
      bookingLink: extraction.bookingLink,
      email: emailResult,
      requirementsCount,
      rawDebug: extraction.rawText?.slice(0, 500) || null,
      interactionHint: extraction.interactionHint,
      cached: false,
      processingTimeMs: duration,
    };
  } catch (error) {
    console.error(`[Pipeline] Error checking ${target.name}:`, error);

    // Record error in database
    await prisma.check.create({
      data: {
        targetId: target.id,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      targetId: target.id,
      targetName: target.name,
      status: "error",
      nextSlotTime: null,
      bookingLink: target.bookingUrl,
      email: {
        sent: false,
        reason: error instanceof Error ? error.message : "Check failed",
      },
      requirementsCount: 0,
      rawDebug: null,
      cached: false,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

// ============================================================================
// Full Check Run
// ============================================================================

/**
 * Run checks for specified targets or all active targets.
 * 
 * ============================================================================
 * CACHE BEHAVIOR:
 * - Fresh cached results are returned immediately (no Firecrawl)
 * - Stale/missing results trigger Firecrawl
 * - forceRefresh=true ignores cache for all targets
 * ============================================================================
 * 
 * @param targetIds - Optional list of target IDs to check
 * @param forceRefresh - If true, ignore cache and scrape all targets
 */
export async function runChecks(
  targetIds?: string[],
  forceRefresh = false
): Promise<CheckRunResult> {
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = new Date().toISOString();

  console.log(`[Pipeline] Starting check run ${runId} (forceRefresh=${forceRefresh})`);

  // Load user settings
  const settings = await getSettings();
  console.log(`[Pipeline] Settings: types=${settings.appointmentTypes.length > 0 ? settings.appointmentTypes.join(",") : "all"}`);

  // Build target filter
  type WhereClause = {
    active: boolean;
    id?: { in: string[] };
    appointmentType?: { in: string[] };
    state?: { in: string[] };
  };

  const whereClause: WhereClause = { active: true };

  if (targetIds?.length) {
    whereClause.id = { in: targetIds };
  }

  if (settings.appointmentTypes.length > 0) {
    whereClause.appointmentType = { in: settings.appointmentTypes };
  }

  if (settings.preferredStates.length > 0) {
    let statesToCheck = [...settings.preferredStates];
    
    if (settings.includeNeighborStates) {
      const { getNeighborStates } = await import("./usStates");
      for (const state of settings.preferredStates) {
        const neighbors = getNeighborStates(state);
        statesToCheck = [...statesToCheck, ...neighbors];
      }
      statesToCheck = [...new Set(statesToCheck)];
    }
    
    whereClause.state = { in: statesToCheck };
  }

  // Get targets from database
  const targets = await prisma.target.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      bookingUrl: true,
      type: true,
      platform: true,
      appointmentType: true,
      state: true,
      requirementsUrl: true,
      alertEmail: true,
    },
  });

  if (targets.length === 0) {
    console.log("[Pipeline] No targets to check");
    return {
      runId,
      status: "completed",
      startedAt,
      completedAt: new Date().toISOString(),
      results: [],
      summary: { checked: 0, available: 0, emailsSent: 0, cachedResults: 0, freshResults: 0 },
      errors: [],
    };
  }

  console.log(`[Pipeline] Checking ${targets.length} targets`);

  // Run checks
  const results: CheckResultItem[] = [];
  const errors: { targetId: string; message: string }[] = [];
  let cachedCount = 0;
  let freshCount = 0;

  for (const target of targets) {
    try {
      const result = await checkSingleTarget(target, settings, forceRefresh);
      results.push(result);

      if (result.cached) {
        cachedCount++;
      } else {
        freshCount++;
      }

      if (result.status === "error") {
        errors.push({
          targetId: target.id,
          message: result.email.reason,
        });
      }

      // Small delay between fresh checks (not for cached)
      if (!result.cached) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      errors.push({
        targetId: target.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const completedAt = new Date().toISOString();

  const summary = {
    checked: results.length,
    available: results.filter((r) => r.status === "available").length,
    emailsSent: results.filter((r) => r.email.sent).length,
    cachedResults: cachedCount,
    freshResults: freshCount,
  };

  console.log(`[Pipeline] Check run ${runId} completed:`, summary);

  return {
    runId,
    status: "completed",
    startedAt,
    completedAt,
    results,
    summary,
    errors,
  };
}

/**
 * Run a quick check for a single target.
 * 
 * @param targetId - The target ID to check
 * @param forceRefresh - If true, ignore cache
 */
export async function runSingleCheck(
  targetId: string,
  forceRefresh = false
): Promise<CheckResultItem | null> {
  const settings = await getSettings();

  const target = await prisma.target.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      name: true,
      bookingUrl: true,
      type: true,
      platform: true,
      requirementsUrl: true,
      alertEmail: true,
    },
  });

  if (!target) {
    return null;
  }

  return checkSingleTarget(target, settings, forceRefresh);
}

export default {
  runChecks,
  runSingleCheck,
};
