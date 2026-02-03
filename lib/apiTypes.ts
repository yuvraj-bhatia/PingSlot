import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export const TargetTypeSchema = z.enum(["acuity", "generic", "unknown"]);
export type TargetType = z.infer<typeof TargetTypeSchema>;

export const TargetStatusSchema = z.enum([
  "available",
  "unavailable",
  "unknown",
  "error",
]);
export type TargetStatus = z.infer<typeof TargetStatusSchema>;

export const CheckRunStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
]);
export type CheckRunStatus = z.infer<typeof CheckRunStatusSchema>;

// ============================================================================
// Target Schemas - Aligned with mock data shapes from requirements
// ============================================================================

/**
 * TargetSummary - Used in dashboard list view
 * {
 *   id: string;
 *   name: string;
 *   bookingUrl: string | null;
 *   status: "available" | "unavailable" | "unknown" | "error";
 *   nextSlotTime: string | null;
 *   lastCheckedAt: string | null;
 *   lastAlertStatus: string | null;
 * }
 */
export const TargetSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  bookingUrl: z.string().nullable(),
  status: TargetStatusSchema,
  nextSlotTime: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  lastAlertStatus: z.string().nullable(),
  active: z.boolean().optional(),
});
export type TargetSummary = z.infer<typeof TargetSummarySchema>;

/**
 * TargetDetail - Used in detail page
 * {
 *   id: string;
 *   name: string;
 *   bookingUrl: string | null;
 *   requirementsUrl: string | null;
 *   status: string;
 *   nextSlotTime: string | null;
 *   lastCheckedAt: string | null;
 *   requirementsBullets: string[] | null;
 *   lastAlert: {
 *     status: string;
 *     reason: string | null;
 *     at: string | null;
 *   } | null;
 *   recentChecks: {
 *     checkedAt: string;
 *     status: string;
 *     nextSlotTime: string | null;
 *     rawDebug: string | null;
 *   }[];
 * }
 */
export const TargetDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  bookingUrl: z.string().nullable(),
  requirementsUrl: z.string().nullable(),
  alertEmail: z.string(),
  active: z.boolean().optional(),
  type: z.string().optional(),
  status: TargetStatusSchema,
  nextSlotTime: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  requirementsBullets: z.array(z.string()).nullable(),
  lastAlert: z
    .object({
      status: z.string(),
      reason: z.string().nullable(),
      at: z.string().nullable(),
    })
    .nullable(),
  lastCheck: z
    .object({
      status: z.string(),
      nextSlotTime: z.string().nullable(),
      bookingLink: z.string().nullable(),
      email: z.object({
        sent: z.boolean(),
        reason: z.string(),
      }),
      requirementsCount: z.number(),
      checkedAt: z.string(),
    })
    .nullable(),
  recentChecks: z.array(
    z.object({
      checkedAt: z.string(),
      status: TargetStatusSchema,
      nextSlotTime: z.string().nullable(),
      emailSent: z.boolean().optional(),
      rawDebug: z.string().nullable(),
    })
  ),
});
export type TargetDetail = z.infer<typeof TargetDetailSchema>;

// ============================================================================
// Check Run Schemas
// ============================================================================

export const CheckResultSchema = z.object({
  targetId: z.string(),
  targetName: z.string(),
  status: TargetStatusSchema,
  nextSlotTime: z.string().datetime().nullable(),
  bookingLink: z.string().nullable(),
  email: z.object({
    sent: z.boolean(),
    reason: z.string(),
  }),
  requirementsCount: z.number(),
});
export type CheckResult = z.infer<typeof CheckResultSchema>;

export const CheckRunSummarySchema = z.object({
  checked: z.number(),
  available: z.number(),
  emailsSent: z.number(),
});
export type CheckRunSummary = z.infer<typeof CheckRunSummarySchema>;

export const CheckRunResponseSchema = z.object({
  runId: z.string(),
  status: CheckRunStatusSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  summary: CheckRunSummarySchema.nullable(),
  results: z.array(CheckResultSchema).nullable(),
  errors: z.array(z.object({ targetId: z.string(), message: z.string() })).nullable(),
});
export type CheckRunResponse = z.infer<typeof CheckRunResponseSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

// Input schema for creating a target (for form validation)
export const CreateTargetInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  bookingUrl: z.string().url("Must be a valid URL").startsWith("https://", "Must use HTTPS"),
  type: z.enum(["acuity", "generic", "unknown"]).default("unknown"),
  requirementsUrl: z
    .union([
      z.string().url("Must be a valid URL").startsWith("https://", "Must use HTTPS"),
      z.literal(""),
    ])
    .optional()
    .transform((val) => val === "" ? undefined : val),
  alertEmail: z.string().email("Must be a valid email"),
  active: z.boolean().default(true),
});

// Type alias for form input - matches Zod schema inference
export type CreateTargetFormInput = {
  name: string;
  bookingUrl: string;
  type?: "acuity" | "generic" | "unknown";
  requirementsUrl?: string;
  alertEmail: string;
  active?: boolean;
};

// API input type (after transformation with defaults applied)
export type CreateTargetInput = {
  name: string;
  bookingUrl: string;
  type: "acuity" | "generic" | "unknown";
  requirementsUrl?: string;
  alertEmail: string;
  active: boolean;
};

export const StartCheckRunInputSchema = z.object({
  targetIds: z.array(z.string()).optional(),
});
export type StartCheckRunInput = z.infer<typeof StartCheckRunInputSchema>;

// Input schema for updating a target (for form validation)
export const UpdateTargetInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  bookingUrl: z.string().url("Must be a valid URL").startsWith("https://", "Must use HTTPS").optional(),
  type: z.enum(["acuity", "generic", "unknown"]).optional(),
  requirementsUrl: z
    .union([
      z.string().url("Must be a valid URL").startsWith("https://", "Must use HTTPS"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => val === "" ? null : val),
  alertEmail: z.string().email("Must be a valid email").optional(),
  active: z.boolean().optional(),
});

// Type alias for form input - matches Zod schema inference
export type UpdateTargetFormInput = {
  name?: string;
  bookingUrl?: string;
  type?: "acuity" | "generic" | "unknown";
  requirementsUrl?: string | null;
  alertEmail?: string;
  active?: boolean;
};

// ============================================================================
// Booking Schemas
// ============================================================================

export const BookingStatusSchema = z.enum([
  "pending",
  "navigating",
  "finding_slots",
  "selecting",
  "filling_form",
  "confirming",
  "success",
  "failed",
  "cancelled",
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSessionSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  status: BookingStatusSchema,
  currentStep: z.number(),
  totalSteps: z.number().default(5),
  screenshot: z.string().optional(),
  error: z.string().optional(),
  confirmation: z.object({
    number: z.string(),
    datetime: z.string(),
  }).optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
});
export type BookingSession = z.infer<typeof BookingSessionSchema>;

export const UserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const StartBookingInputSchema = z.object({
  targetId: z.string(),
  userProfile: UserProfileSchema,
});
export type StartBookingInput = z.infer<typeof StartBookingInputSchema>;
