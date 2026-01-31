import type {
  TargetSummary,
  TargetDetail,
  CheckRunResponse,
  CheckResult,
} from "./apiTypes";

// ============================================================================
// Fixture Data
// ============================================================================

export const mockTargets: TargetSummary[] = [
  {
    id: "target-1",
    name: "City Hall - Midtown",
    type: "acuity",
    bookingUrl: "https://cityhall.acuityscheduling.com",
    status: "available",
    nextSlotTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    lastCheckedAt: new Date().toISOString(),
    lastEmailSent: {
      sent: true,
      reason: "Slot available within 48 hours",
    },
    active: true,
  },
  {
    id: "target-2",
    name: "DMV - Westlake",
    type: "generic",
    bookingUrl: "https://dmv.example.gov/westlake",
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    lastEmailSent: {
      sent: false,
      reason: "No slots available",
    },
    active: true,
  },
  {
    id: "target-3",
    name: "County Office",
    type: "unknown",
    bookingUrl: null,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    lastEmailSent: null,
    active: false,
  },
  {
    id: "target-4",
    name: "Passport Center - Downtown",
    type: "generic",
    bookingUrl: "https://passport.example.gov/book",
    status: "available",
    nextSlotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    lastCheckedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    lastEmailSent: {
      sent: true,
      reason: "New slot opened",
    },
    active: true,
  },
];

export const mockTargetDetails: Record<string, TargetDetail> = {
  "target-1": {
    id: "target-1",
    name: "City Hall - Midtown",
    type: "acuity",
    bookingUrl: "https://cityhall.acuityscheduling.com",
    requirementsUrl: "https://cityhall.gov/requirements",
    alertEmail: "alerts@example.com",
    active: true,
    status: "available",
    nextSlotTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastCheckedAt: new Date().toISOString(),
    requirementsBullets: [
      "Bring state-issued ID",
      "Arrive 15 minutes early",
      "Print confirmation page",
    ],
    lastCheck: {
      status: "available",
      nextSlotTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      bookingLink: "https://cityhall.acuityscheduling.com/schedule.php?appointment=12345",
      email: {
        sent: true,
        reason: "Slot available within 48 hours",
      },
      requirementsCount: 3,
      checkedAt: new Date().toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date().toISOString(),
        status: "available",
        nextSlotTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        emailSent: true,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: "available",
        nextSlotTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        emailSent: true,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
    ],
  },
  "target-2": {
    id: "target-2",
    name: "DMV - Westlake",
    type: "generic",
    bookingUrl: "https://dmv.example.gov/westlake",
    requirementsUrl: "https://dmv.example.gov/requirements",
    alertEmail: "dmv-alerts@example.com",
    active: true,
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    requirementsBullets: [
      "Proof of residence",
      "Payment card",
      "Completed application form",
    ],
    lastCheck: {
      status: "unavailable",
      nextSlotTime: null,
      bookingLink: null,
      email: {
        sent: false,
        reason: "No slots available",
      },
      requirementsCount: 3,
      checkedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        status: "error",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: "Connection timeout after 30s",
      },
    ],
  },
  "target-3": {
    id: "target-3",
    name: "County Office",
    type: "unknown",
    bookingUrl: null,
    requirementsUrl: null,
    alertEmail: "admin@example.com",
    active: false,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    requirementsBullets: null,
    lastCheck: {
      status: "unknown",
      nextSlotTime: null,
      bookingLink: null,
      email: {
        sent: false,
        reason: "Target inactive",
      },
      requirementsCount: 0,
      checkedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "unknown",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: "Timeout from upstream system",
      },
    ],
  },
  "target-4": {
    id: "target-4",
    name: "Passport Center - Downtown",
    type: "generic",
    bookingUrl: "https://passport.example.gov/book",
    requirementsUrl: "https://passport.example.gov/requirements",
    alertEmail: "travel@example.com",
    active: true,
    status: "available",
    nextSlotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastCheckedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    requirementsBullets: [
      "Valid photo ID",
      "Passport photo (2x2 inches)",
      "Application fee",
      "Birth certificate",
    ],
    lastCheck: {
      status: "available",
      nextSlotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      bookingLink: "https://passport.example.gov/book/confirm?slot=456",
      email: {
        sent: true,
        reason: "New slot opened",
      },
      requirementsCount: 4,
      checkedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    recentChecks: [
      {
        checkedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "available",
        nextSlotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        emailSent: true,
        rawDebug: null,
      },
      {
        checkedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
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
    : mockTargets.filter((t) => t.active);

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
      email: target.lastEmailSent || { sent: false, reason: "N/A" },
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
    type: input.type,
    bookingUrl: input.bookingUrl,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: null,
    lastEmailSent: null,
    active: input.active,
  };

  mockTargets.push(target);
  mockTargetDetails[id] = {
    ...target,
    requirementsUrl: input.requirementsUrl || null,
    alertEmail: input.alertEmail,
    requirementsBullets: null,
    lastCheck: null,
    recentChecks: [],
  };

  return target;
}

export function toggleMockTargetActive(id: string, active: boolean): TargetSummary | null {
  const target = mockTargets.find((t) => t.id === id);
  const detail = mockTargetDetails[id];

  if (!target || !detail) return null;

  target.active = active;
  detail.active = active;

  return target;
}

// ============================================================================
// Dev-only: Simulate availability toggle
// ============================================================================

export function simulateAvailability(targetId: string, available: boolean): void {
  const target = mockTargets.find((t) => t.id === targetId);
  const detail = mockTargetDetails[targetId];

  if (!target || !detail) return;

  if (available) {
    const nextSlot = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    target.status = "available";
    target.nextSlotTime = nextSlot;
    detail.status = "available";
    detail.nextSlotTime = nextSlot;
    if (detail.lastCheck) {
      detail.lastCheck.status = "available";
      detail.lastCheck.nextSlotTime = nextSlot;
      detail.lastCheck.email = { sent: true, reason: "Simulated availability" };
    }
  } else {
    target.status = "unavailable";
    target.nextSlotTime = null;
    detail.status = "unavailable";
    detail.nextSlotTime = null;
    if (detail.lastCheck) {
      detail.lastCheck.status = "unavailable";
      detail.lastCheck.nextSlotTime = null;
      detail.lastCheck.email = { sent: false, reason: "Simulated unavailability" };
    }
  }
}
