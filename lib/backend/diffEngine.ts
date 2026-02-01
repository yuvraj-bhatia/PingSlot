/**
 * State & Diff Engine (Anti-Spam Brain)
 * 
 * The most important backend logic. Ensures:
 * - No duplicate emails
 * - No spam
 * - Only meaningful changes trigger alerts
 * 
 * Change detection rules:
 * - unavailable → available ✅ (alert)
 * - available but slot time changed ✅ (alert)
 * - anything else ❌ (no alert)
 */

import prisma from "./db";

export type DiffResult = {
  shouldAlert: boolean;
  reason: string;
  dedupeHash: string;
  isNewAvailability: boolean;
  isSlotTimeChange: boolean;
};

export type CheckState = {
  status: "available" | "unavailable" | "unknown" | "requires_interaction" | "error";
  nextSlotTime: string | null;
};

/**
 * Generate a dedupe hash for alert deduplication
 * Format: targetId:nextSlotTime (or targetId:null if no slot)
 */
export function generateDedupeHash(targetId: string, nextSlotTime: string | null): string {
  return `${targetId}:${nextSlotTime || "null"}`;
}

/**
 * Get the last check state for a target
 */
export async function getLastCheckState(targetId: string): Promise<CheckState | null> {
  const lastCheck = await prisma.check.findFirst({
    where: { targetId },
    orderBy: { checkedAt: "desc" },
  });

  if (!lastCheck) {
    return null;
  }

  return {
    status: lastCheck.status as CheckState["status"],
    nextSlotTime: lastCheck.nextSlotTime?.toISOString() || null,
  };
}

/**
 * Check if an alert was already sent for this dedupe hash
 */
export async function wasAlertAlreadySent(dedupeHash: string): Promise<boolean> {
  const existingAlert = await prisma.alert.findUnique({
    where: { dedupeHash },
  });

  return existingAlert !== null;
}

/**
 * Compare current state with last known state and determine if alert is needed
 * 
 * @param targetId - The target being checked
 * @param current - Current extraction result
 * @returns Diff result with alert decision and reasoning
 */
export async function computeDiff(
  targetId: string,
  current: CheckState
): Promise<DiffResult> {
  const dedupeHash = generateDedupeHash(targetId, current.nextSlotTime);

  // Check if we already sent an alert for this exact state
  const alreadyAlerted = await wasAlertAlreadySent(dedupeHash);
  if (alreadyAlerted) {
    return {
      shouldAlert: false,
      reason: "Alert already sent for this slot",
      dedupeHash,
      isNewAvailability: false,
      isSlotTimeChange: false,
    };
  }

  // Get last known state
  const lastState = await getLastCheckState(targetId);

  // First check ever - only alert if available
  if (!lastState) {
    if (current.status === "available") {
      return {
        shouldAlert: true,
        reason: "First check found availability",
        dedupeHash,
        isNewAvailability: true,
        isSlotTimeChange: false,
      };
    }
    return {
      shouldAlert: false,
      reason: "First check - no availability",
      dedupeHash,
      isNewAvailability: false,
      isSlotTimeChange: false,
    };
  }

  // Rule 1: unavailable → available = ALERT
  if (lastState.status !== "available" && current.status === "available") {
    return {
      shouldAlert: true,
      reason: "Status changed from unavailable to available",
      dedupeHash,
      isNewAvailability: true,
      isSlotTimeChange: false,
    };
  }

  // Rule 2: available with different slot time = ALERT
  if (
    lastState.status === "available" &&
    current.status === "available" &&
    lastState.nextSlotTime !== current.nextSlotTime &&
    current.nextSlotTime !== null
  ) {
    // Only alert if the new slot is earlier (better opportunity)
    if (lastState.nextSlotTime && current.nextSlotTime) {
      const lastDate = new Date(lastState.nextSlotTime);
      const currentDate = new Date(current.nextSlotTime);
      
      if (currentDate < lastDate) {
        return {
          shouldAlert: true,
          reason: "Earlier slot became available",
          dedupeHash,
          isNewAvailability: false,
          isSlotTimeChange: true,
        };
      }
    }
    
    // New slot when we didn't have a specific time before
    if (!lastState.nextSlotTime && current.nextSlotTime) {
      return {
        shouldAlert: true,
        reason: "Specific slot time now available",
        dedupeHash,
        isNewAvailability: false,
        isSlotTimeChange: true,
      };
    }
  }

  // Rule 3: error/unknown/requires_interaction → available = ALERT
  if (
    (lastState.status === "error" || lastState.status === "unknown" || lastState.status === "requires_interaction") &&
    current.status === "available"
  ) {
    return {
      shouldAlert: true,
      reason: "Recovered from error/unknown to available",
      dedupeHash,
      isNewAvailability: true,
      isSlotTimeChange: false,
    };
  }

  // All other cases: no alert
  const reasons: Record<string, string> = {
    "available-available": "Still available (same state)",
    "unavailable-unavailable": "Still unavailable",
    "available-unavailable": "Became unavailable (no alert needed)",
    "error-error": "Still in error state",
    "unknown-unknown": "Still unknown",
    "requires_interaction-requires_interaction": "Still requires interaction",
    "requires_interaction-unavailable": "Became unavailable after interaction check",
    "available-requires_interaction": "Page now requires interaction",
    default: "No meaningful change detected",
  };

  const key = `${lastState.status}-${current.status}`;
  
  return {
    shouldAlert: false,
    reason: reasons[key] || reasons.default,
    dedupeHash,
    isNewAvailability: false,
    isSlotTimeChange: false,
  };
}

/**
 * Record an alert as sent (for deduplication)
 */
export async function recordAlert(
  targetId: string,
  dedupeHash: string,
  sentTo: string,
  nextSlotTime: string | null,
  emailId?: string
): Promise<void> {
  await prisma.alert.create({
    data: {
      targetId,
      dedupeHash,
      sentTo,
      nextSlotTime: nextSlotTime ? new Date(nextSlotTime) : null,
      emailId,
    },
  });
}

export default {
  computeDiff,
  recordAlert,
  generateDedupeHash,
  getLastCheckState,
  wasAlertAlreadySent,
};
