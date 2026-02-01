import type {
  TargetSummary,
  TargetDetail,
  CheckRunResponse,
  CheckResult,
} from "./apiTypes";

// ============================================================================
// Fixture Data - Aligned with mock data shapes from requirements
// ============================================================================

export const mockTargets: TargetSummary[] = [
  {
    id: "target-1",
    name: "Downtown DMV",
    bookingUrl: "https://dmv.example.gov/booking",
    status: "available",
    nextSlotTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    lastCheckedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    lastAlertStatus: "sent",
  },
  {
    id: "target-2",
    name: "City Passport Office",
    bookingUrl: "https://passport.example.gov/appointments",
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    lastAlertStatus: "skipped: no availability",
  },
  {
    id: "target-3",
    name: "County Clerk - Marriage License",
    bookingUrl: "https://clerk.example.gov/marriage",
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    lastAlertStatus: null,
  },
  {
    id: "target-4",
    name: "Regional Tax Office",
    bookingUrl: "https://tax.example.gov/book",
    status: "error",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    lastAlertStatus: "failed: site unreachable",
  },
];

export const mockTargetDetails: Record<string, TargetDetail> = {
  "target-1": {
    id: "target-1",
    name: "Downtown DMV",
    bookingUrl: "https://dmv.example.gov/booking",
    requirementsUrl: "https://dmv.example.gov/requirements",
    alertEmail: "alerts@example.com",
    status: "available",
    nextSlotTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    lastCheckedAt: new Date(Date.now() - 300000).toISOString(),
    requirementsBullets: [
      "Valid driver's license or ID card",
      "Proof of residency (utility bill, lease agreement)",
      "Social Security Number",
      "Payment method (card or check)",
    ],
    lastAlert: {
      status: "sent",
      reason: "Slot became available",
      at: new Date(Date.now() - 300000).toISOString(),
    },
    lastCheck: {
      status: "available",
      nextSlotTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      bookingLink: "https://dmv.example.gov/booking",
      email: { sent: true, reason: "Alert sent" },
      requirementsCount: 4,
      checkedAt: new Date(Date.now() - 300000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 300000).toISOString(),
        status: "available",
        nextSlotTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        rawDebug: "Found 3 slots. Next: 2026-02-02T10:00:00Z",
      },
      {
        checkedAt: new Date(Date.now() - 3300000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        rawDebug: "No slots found in 90-day window",
      },
      {
        checkedAt: new Date(Date.now() - 6900000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        rawDebug: "No slots found in 90-day window",
      },
    ],
  },
  "target-2": {
    id: "target-2",
    name: "City Passport Office",
    bookingUrl: "https://passport.example.gov/appointments",
    requirementsUrl: "https://passport.example.gov/what-to-bring",
    alertEmail: "alerts@example.com",
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 600000).toISOString(),
    requirementsBullets: [
      "Completed DS-11 form",
      "Proof of US citizenship (birth certificate, naturalization certificate)",
      "Government-issued photo ID",
      "Passport photo (2x2 inches)",
      "Payment for fees",
    ],
    lastAlert: {
      status: "skipped",
      reason: "No availability detected",
      at: new Date(Date.now() - 600000).toISOString(),
    },
    lastCheck: {
      status: "unavailable",
      nextSlotTime: null,
      bookingLink: "https://passport.example.gov/appointments",
      email: { sent: false, reason: "No availability" },
      requirementsCount: 5,
      checkedAt: new Date(Date.now() - 600000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 600000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        rawDebug: "Calendar shows 'No appointments available'",
      },
      {
        checkedAt: new Date(Date.now() - 4200000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        rawDebug: "Calendar shows 'No appointments available'",
      },
    ],
  },
  "target-3": {
    id: "target-3",
    name: "County Clerk - Marriage License",
    bookingUrl: "https://clerk.example.gov/marriage",
    requirementsUrl: null,
    alertEmail: "alerts@example.com",
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    requirementsBullets: null,
    lastAlert: null,
    lastCheck: null,
    recentChecks: [],
  },
  "target-4": {
    id: "target-4",
    name: "Regional Tax Office",
    bookingUrl: "https://tax.example.gov/book",
    requirementsUrl: null,
    alertEmail: "alerts@example.com",
    status: "error",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 3600000).toISOString(),
    requirementsBullets: null,
    lastAlert: {
      status: "failed",
      reason: "Site unreachable (timeout)",
      at: new Date(Date.now() - 3600000).toISOString(),
    },
    lastCheck: {
      status: "error",
      nextSlotTime: null,
      bookingLink: "https://tax.example.gov/book",
      email: { sent: false, reason: "Check failed" },
      requirementsCount: 0,
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 3600000).toISOString(),
        status: "error",
        nextSlotTime: null,
        rawDebug: "Error: ETIMEDOUT at fetch booking page",
      },
      {
        checkedAt: new Date(Date.now() - 7200000).toISOString(),
        status: "error",
        nextSlotTime: null,
        rawDebug: "Error: ETIMEDOUT at fetch booking page",
      },
      {
        checkedAt: new Date(Date.now() - 10800000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        rawDebug: "No slots available",
      },
    ],
  },
};

// ============================================================================
// Check Run Simulation
// ============================================================================

const activeCheckRuns = new Map<string, CheckRunResponse>();

export function startMockCheckRun(targetIds?: string[]): string {
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const targets = targetIds
    ? mockTargets.filter((t) => targetIds.includes(t.id))
    : mockTargets;

  // Create pending run
  const run: CheckRunResponse = {
    runId,
    status: "pending",
    startedAt: new Date().toISOString(),
    completedAt: null,
    summary: null,
    results: null,
    errors: null,
  };

  activeCheckRuns.set(runId, run);

  // Simulate state transitions
  setTimeout(() => {
    run.status = "running";
  }, 500);

  setTimeout(() => {
    const results: CheckResult[] = targets.map((target) => ({
      targetId: target.id,
      targetName: target.name,
      status: target.status,
      nextSlotTime: target.nextSlotTime,
      bookingLink: target.bookingUrl,
      email: { 
        sent: target.lastAlertStatus === "sent", 
        reason: target.lastAlertStatus || "N/A" 
      },
      requirementsCount: mockTargetDetails[target.id]?.requirementsBullets?.length || 0,
    }));

    run.status = "completed";
    run.completedAt = new Date().toISOString();
    run.results = results;
    run.summary = {
      checked: results.length,
      available: results.filter((r) => r.status === "available").length,
      emailsSent: results.filter((r) => r.email.sent).length,
    };
  }, 3000);

  return runId;
}

export function getMockCheckRun(runId: string): CheckRunResponse | null {
  return activeCheckRuns.get(runId) || null;
}

// ============================================================================
// Target CRUD Operations
// ============================================================================

let nextTargetId = 100;

export function createMockTarget(input: {
  name: string;
  bookingUrl: string;
  type: "acuity" | "generic" | "unknown";
  requirementsUrl?: string | null;
  alertEmail: string;
  active: boolean;
}): TargetSummary {
  const id = `target-${nextTargetId++}`;
  const target: TargetSummary = {
    id,
    name: input.name,
    bookingUrl: input.bookingUrl,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    lastAlertStatus: null,
  };

  mockTargets.push(target);
  mockTargetDetails[id] = {
    id,
    name: input.name,
    bookingUrl: input.bookingUrl,
    requirementsUrl: input.requirementsUrl || null,
    alertEmail: input.alertEmail,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    requirementsBullets: null,
    lastAlert: null,
    lastCheck: null,
    recentChecks: [],
  };

  return target;
}

// ============================================================================
// Toggle Target Active
// ============================================================================

export function toggleMockTargetActive(id: string, active: boolean): TargetSummary | null {
  const target = mockTargets.find((t) => t.id === id);
  const detail = mockTargetDetails[id];

  if (!target || !detail) return null;

  // Note: active field doesn't exist in new types, this is for API compatibility
  return target;
}

// ============================================================================
// Dev-only: Simulate availability toggle
// ============================================================================

export function simulateAvailability(targetId: string, available: boolean): void {
  const target = mockTargets.find((t) => t.id === targetId);
  const detail = mockTargetDetails[targetId];

  if (!target || !detail) return;

  const nextSlot = available
    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    : null;

  target.status = available ? "available" : "unavailable";
  target.nextSlotTime = nextSlot;
  target.lastCheckedAt = new Date().toISOString();
  target.lastAlertStatus = available ? "sent" : "skipped: no availability";

  detail.status = available ? "available" : "unavailable";
  detail.nextSlotTime = nextSlot;
  detail.lastCheckedAt = new Date().toISOString();
  detail.lastAlert = available
    ? {
        status: "sent",
        reason: "Slot became available",
        at: new Date().toISOString(),
      }
    : {
        status: "skipped",
        reason: "No availability detected",
        at: new Date().toISOString(),
      };
  detail.lastCheck = {
    status: available ? "available" : "unavailable",
    nextSlotTime: nextSlot,
    bookingLink: target.bookingUrl,
    email: { sent: available, reason: available ? "Alert sent" : "No availability" },
    requirementsCount: detail.requirementsBullets?.length || 0,
    checkedAt: new Date().toISOString(),
  };
  
  detail.recentChecks.unshift({
    checkedAt: new Date().toISOString(),
    status: available ? "available" : "unavailable",
    nextSlotTime: nextSlot,
    rawDebug: available ? "Found available slots" : "No slots available",
  });
}
