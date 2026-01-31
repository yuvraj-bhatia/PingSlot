export type TargetType = "acuity" | "generic" | "unknown";
export type CheckStatus = "available" | "unavailable" | "unknown" | "blocked" | "error";

export type Target = {
    id: string;
    name: string;
    bookingUrl: string;
    type: TargetType;
    requirementsUrl?: string | null;
    alertEmail: string;
};

export type EmailDecision = {
    shouldSend: boolean;
    sent: boolean;
    sentTo: string | null;
    reason: string;
};

export type CheckResult = {
    status: CheckStatus;
    nextSlotTime: string | null;
    bookingLink: string;
    requirementsBullets: string[];
    email: EmailDecision;
};
