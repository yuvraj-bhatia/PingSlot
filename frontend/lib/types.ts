export type TargetType = "acuity" | "generic" | "unknown";

export type TargetStatus = "available" | "unavailable" | "unknown" | "error";

export type EmailResult = {
  sent: boolean;
  reason: string;
};

export type TargetSummary = {
  id: string;
  name: string;
  type: TargetType;
  bookingUrl: string | null;
  status: TargetStatus;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  lastEmailSent: EmailResult | null;
  active: boolean;
};

export type TargetDetail = {
  id: string;
  name: string;
  type: TargetType;
  bookingUrl: string | null;
  requirementsUrl: string | null;
  alertEmail: string;
  active: boolean;
  status: TargetStatus;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  requirementsBullets: string[] | null;
  lastCheck: {
    status: TargetStatus;
    nextSlotTime: string | null;
    bookingLink: string | null;
    email: EmailResult;
    requirementsCount: number;
    checkedAt: string;
  } | null;
  recentChecks: {
    checkedAt: string;
    status: TargetStatus;
    nextSlotTime: string | null;
    emailSent: boolean;
    rawDebug: string | null;
  }[];
};

export type CheckResult = {
  targetId: string;
  targetName: string;
  status: TargetStatus;
  nextSlotTime: string | null;
  bookingLink: string | null;
  email: EmailResult;
  requirementsCount: number;
};

export type CheckRunResponse = {
  results: CheckResult[];
  summary: {
    checked: number;
    available: number;
    emailsSent: number;
  };
};

export type CreateTargetInput = {
  name: string;
  bookingUrl: string;
  type: TargetType;
  requirementsUrl?: string;
  alertEmail: string;
  active: boolean;
};
