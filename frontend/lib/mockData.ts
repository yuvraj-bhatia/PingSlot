import type {
  TargetDetail,
  TargetSummary,
  CheckRunResponse,
} from "./types";

export const targetSummaries: TargetSummary[] = [
  {
    id: "city-hall",
    name: "City Hall - Midtown",
    type: "acuity",
    bookingUrl: "https://cityhall.acuityscheduling.com",
    status: "available",
    nextSlotTime: "2026-02-01T14:30:00.000Z",
    lastCheckedAt: "2026-01-31T17:22:00.000Z",
    lastEmailSent: { sent: true, reason: "Slot available within 48 hours" },
    active: true,
  },
  {
    id: "dmv-westlake",
    name: "DMV - Westlake",
    type: "generic",
    bookingUrl: "https://dmv.example.gov/westlake",
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: "2026-01-31T17:18:00.000Z",
    lastEmailSent: { sent: false, reason: "No slots available" },
    active: true,
  },
  {
    id: "county-office",
    name: "County Office",
    type: "unknown",
    bookingUrl: null,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: "2026-01-31T16:58:00.000Z",
    lastEmailSent: null,
    active: false,
  },
];

export const targetDetails: Record<string, TargetDetail> = {
  "city-hall": {
    id: "city-hall",
    name: "City Hall - Midtown",
    type: "acuity",
    bookingUrl: "https://cityhall.acuityscheduling.com",
    requirementsUrl: "https://cityhall.gov/requirements",
    alertEmail: "user@example.com",
    active: true,
    status: "available",
    nextSlotTime: "2026-02-01T14:30:00.000Z",
    lastCheckedAt: "2026-01-31T17:22:00.000Z",
    requirementsBullets: [
      "Bring state-issued ID",
      "Arrive 15 minutes early",
      "Print confirmation page",
    ],
    lastCheck: {
      status: "available",
      nextSlotTime: "2026-02-01T14:30:00.000Z",
      bookingLink: "https://cityhall.acuityscheduling.com/schedule.php?appointment=12345",
      email: { sent: true, reason: "Slot available within 48 hours" },
      requirementsCount: 3,
      checkedAt: "2026-01-31T17:22:00.000Z",
    },
    recentChecks: [
      {
        checkedAt: "2026-01-31T17:22:00.000Z",
        status: "available",
        nextSlotTime: "2026-02-01T14:30:00.000Z",
        emailSent: true,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T16:52:00.000Z",
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T16:22:00.000Z",
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T15:52:00.000Z",
        status: "available",
        nextSlotTime: "2026-02-03T10:00:00.000Z",
        emailSent: true,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T15:22:00.000Z",
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
    ],
  },
  "dmv-westlake": {
    id: "dmv-westlake",
    name: "DMV - Westlake",
    type: "generic",
    bookingUrl: "https://dmv.example.gov/westlake",
    requirementsUrl: "https://dmv.example.gov/requirements",
    alertEmail: "user@example.com",
    active: true,
    status: "unavailable",
    nextSlotTime: null,
    lastCheckedAt: "2026-01-31T17:18:00.000Z",
    requirementsBullets: ["Proof of residence", "Payment card", "Application form"],
    lastCheck: {
      status: "unavailable",
      nextSlotTime: null,
      bookingLink: null,
      email: { sent: false, reason: "No slots available" },
      requirementsCount: 3,
      checkedAt: "2026-01-31T17:18:00.000Z",
    },
    recentChecks: [
      {
        checkedAt: "2026-01-31T17:18:00.000Z",
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T16:48:00.000Z",
        status: "unavailable",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: null,
      },
      {
        checkedAt: "2026-01-31T16:18:00.000Z",
        status: "error",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: "Connection timeout after 30s",
      },
    ],
  },
  "county-office": {
    id: "county-office",
    name: "County Office",
    type: "unknown",
    bookingUrl: null,
    requirementsUrl: null,
    alertEmail: "admin@example.com",
    active: false,
    status: "unknown",
    nextSlotTime: null,
    lastCheckedAt: "2026-01-31T16:58:00.000Z",
    requirementsBullets: null,
    lastCheck: {
      status: "unknown",
      nextSlotTime: null,
      bookingLink: null,
      email: { sent: false, reason: "Target inactive" },
      requirementsCount: 0,
      checkedAt: "2026-01-31T16:58:00.000Z",
    },
    recentChecks: [
      {
        checkedAt: "2026-01-31T16:58:00.000Z",
        status: "unknown",
        nextSlotTime: null,
        emailSent: false,
        rawDebug: "Timeout from upstream system",
      },
    ],
  },
};

// Mock check run response
export const mockCheckRunResponse = (targetIds?: string[]): CheckRunResponse => {
  const targets = targetIds
    ? targetSummaries.filter((t) => targetIds.includes(t.id))
    : targetSummaries.filter((t) => t.active);

  const results = targets.map((target) => {
    const detail = targetDetails[target.id];
    return {
      targetId: target.id,
      targetName: target.name,
      status: target.status,
      nextSlotTime: target.nextSlotTime,
      bookingLink: detail?.bookingUrl,
      email: detail?.lastCheck?.email ?? { sent: false, reason: "N/A" },
      requirementsCount: detail?.requirementsBullets?.length ?? 0,
    };
  });

  return {
    results,
    summary: {
      checked: results.length,
      available: results.filter((r) => r.status === "available").length,
      emailsSent: results.filter((r) => r.email.sent).length,
    },
  };
};

// Mock create target
let nextId = 100;
export const createMockTarget = (input: {
  name: string;
  bookingUrl: string;
  type: "acuity" | "generic" | "unknown";
  requirementsUrl?: string;
  alertEmail: string;
  active: boolean;
}): TargetSummary => {
  const id = `target-${nextId++}`;
  const newTarget: TargetSummary = {
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
  targetSummaries.push(newTarget);
  targetDetails[id] = {
    ...newTarget,
    requirementsUrl: input.requirementsUrl ?? null,
    alertEmail: input.alertEmail,
    requirementsBullets: null,
    lastCheck: null,
    recentChecks: [],
  };
  return newTarget;
};
