/**
 * PingSlot - Centralized Zod Validation Schemas
 * 
 * This file contains all Zod schemas for request validation.
 * Import from here for consistent validation throughout the codebase.
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const PlatformSchema = z.enum([
  'acuity',
  'calendly',
  'microsoft',
  'generic',
  'unknown',
]);

export const AppointmentTypeSchema = z.enum([
  'passport',
  'consulate',
  'city_planning',
  'dmv',
  'generic',
]);

export const TargetStatusSchema = z.enum([
  'available',
  'unavailable',
  'unknown',
  'error',
]);

export const BookingStatusSchema = z.enum([
  'pending',
  'initializing',
  'navigating',
  'finding_slots',
  'selecting',
  'filling_form',
  'confirming',
  'success',
  'failed',
  'cancelled',
]);

export const NotificationTypeSchema = z.enum([
  'availability',
  'booking_success',
  'booking_failed',
  'booking_started',
]);

export const RequirementCategorySchema = z.enum([
  'document',
  'payment',
  'preparation',
  'other',
]);

// ============================================================================
// TARGET SCHEMAS
// ============================================================================

/**
 * Schema for creating a new target
 */
export const CreateTargetSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  bookingUrl: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (url) => url.startsWith('https://'),
      'URL must use HTTPS for security'
    ),
  platform: PlatformSchema.optional().default('unknown'),
  appointmentType: AppointmentTypeSchema.optional().default('generic'),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  type: z.enum(['acuity', 'generic', 'unknown']).optional().default('unknown'),
  requirementsUrl: z
    .union([
      z.string().url('Must be a valid URL'),
      z.literal(''),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  alertEmail: z
    .string()
    .email('Must be a valid email address'),
  active: z.boolean().optional().default(true),
});

export type CreateTargetInput = z.infer<typeof CreateTargetSchema>;

/**
 * Schema for updating an existing target
 * All fields are optional
 */
export const UpdateTargetSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  bookingUrl: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (url) => url.startsWith('https://'),
      'URL must use HTTPS for security'
    )
    .optional(),
  platform: PlatformSchema.optional(),
  appointmentType: AppointmentTypeSchema.optional(),
  country: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  type: z.enum(['acuity', 'generic', 'unknown']).optional(),
  requirementsUrl: z
    .union([
      z.string().url('Must be a valid URL'),
      z.literal(''),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  alertEmail: z
    .string()
    .email('Must be a valid email address')
    .optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

export type UpdateTargetInput = z.infer<typeof UpdateTargetSchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

/**
 * Schema for user address in booking profile
 */
export const AddressSchema = z.object({
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

/**
 * Schema for user profile used in auto-booking
 */
export const UserProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be at most 100 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters')
    .trim(),
  email: z
    .string()
    .email('Must be a valid email address'),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]+$/, 'Must be a valid phone number')
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
    .optional(),
  address: AddressSchema.optional(),
}).passthrough(); // Allow additional fields

export type UserProfileInput = z.infer<typeof UserProfileSchema>;

/**
 * Schema for preferred slot in booking
 */
export const PreferredSlotSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
    .optional(),
  timeRange: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
});

/**
 * Schema for starting an auto-booking session
 */
export const StartBookingSchema = z.object({
  userProfile: UserProfileSchema,
  preferredSlot: PreferredSlotSchema.optional(),
});

export type StartBookingInput = z.infer<typeof StartBookingSchema>;

// ============================================================================
// CHECK SCHEMAS
// ============================================================================

/**
 * Schema for triggering a check run
 */
export const CheckRunSchema = z.object({
  targetIds: z.array(z.string().cuid()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export type CheckRunInput = z.infer<typeof CheckRunSchema>;

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Schema for pagination parameters
 */
export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * Schema for target list query parameters
 */
export const TargetListQuerySchema = PaginationSchema.extend({
  status: TargetStatusSchema.optional(),
  platform: PlatformSchema.optional(),
  appointmentType: AppointmentTypeSchema.optional(),
  active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export type TargetListQuery = z.infer<typeof TargetListQuerySchema>;

// ============================================================================
// REQUIREMENTS SCHEMAS
// ============================================================================

/**
 * Schema for a single requirement item
 */
export const RequirementItemSchema = z.object({
  text: z.string().min(1, 'Requirement text is required'),
  category: RequirementCategorySchema,
  required: z.boolean(),
  details: z.string().optional(),
});

export type RequirementItemInput = z.infer<typeof RequirementItemSchema>;

/**
 * Schema for extracting requirements
 */
export const ExtractRequirementsSchema = z.object({
  sourceUrl: z.string().url('Must be a valid URL').optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export type ExtractRequirementsInput = z.infer<typeof ExtractRequirementsSchema>;

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

/**
 * Schema for notification payload
 */
export const NotificationPayloadSchema = z.object({
  targetName: z.string().min(1),
  bookingUrl: z.string().url(),
  nextSlotTime: z.string().nullable(),
  requirementsBullets: z.array(z.string()),
  requirementsUrl: z.string().url().nullable(),
  alertEmail: z.string().email(),
});

export type NotificationPayloadInput = z.infer<typeof NotificationPayloadSchema>;

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

/**
 * Schema for updating user settings
 */
export const UpdateSettingsSchema = z.object({
  alertEmail: z.string().email().optional(),
  appointmentTypes: z.array(AppointmentTypeSchema).optional(),
  preferredStates: z.array(z.string()).optional(),
  includeNeighborStates: z.boolean().optional(),
  notifyOnAvailable: z.boolean().optional(),
  notifyOnSlotChange: z.boolean().optional(),
  notifyOnRequiresInteraction: z.boolean().optional(),
  includeRequirements: z.boolean().optional(),
  maxEmailsPerDay: z.number().int().min(0).max(100).optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// ============================================================================
// ID VALIDATION
// ============================================================================

/**
 * Schema for validating CUID
 */
export const CuidSchema = z.string().cuid('Invalid ID format');

/**
 * Validate a CUID
 */
export function validateCuid(id: string): boolean {
  return CuidSchema.safeParse(id).success;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate request body with a schema
 */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error };
  } catch {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Invalid JSON in request body',
        },
      ]),
    };
  }
}

/**
 * Parse and validate query parameters with a schema
 */
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const result = schema.safeParse(params);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

/**
 * Format Zod error for API response
 */
export function formatZodError(error: z.ZodError<unknown>): {
  message: string;
  issues: { path: string; message: string }[];
} {
  const issues = error.issues || [];
  return {
    message: issues[0]?.message || 'Validation failed',
    issues: issues.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}
