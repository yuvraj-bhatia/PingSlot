/**
 * PingSlot - Centralized TypeScript Types
 * 
 * This file contains all TypeScript interfaces and types used across the application.
 * Import from here for consistent typing throughout the codebase.
 */

// ============================================================================
// ENUMS AND LITERAL TYPES
// ============================================================================

/** Target platform types - used for adapter selection */
export type Platform = 'acuity' | 'calendly' | 'microsoft' | 'generic' | 'unknown';

/** Appointment types for filtering */
export type AppointmentType = 'passport' | 'consulate' | 'city_planning' | 'dmv' | 'generic';

/** Target/Check status values */
export type TargetStatus = 'available' | 'unavailable' | 'unknown' | 'error';

/** Booking status values - tracks the auto-booking process */
export type BookingStatus = 
  | 'pending'
  | 'initializing'
  | 'navigating'
  | 'finding_slots'
  | 'selecting'
  | 'filling_form'
  | 'confirming'
  | 'success'
  | 'failed'
  | 'cancelled';

/** Notification types */
export type NotificationType = 
  | 'availability'
  | 'booking_success'
  | 'booking_failed'
  | 'booking_started';

/** Requirement categories */
export type RequirementCategory = 'document' | 'payment' | 'preparation' | 'other';

// ============================================================================
// DATABASE MODELS
// ============================================================================

/** Target model - represents a monitored appointment page */
export interface Target {
  id: string;
  name: string;
  bookingUrl: string;
  platform: Platform;
  appointmentType: AppointmentType;
  country: string | null;
  state: string | null;
  city: string | null;
  type: string; // Legacy field
  requirementsUrl: string | null;
  alertEmail: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  requirementsBullets: string | null; // JSON array as string
  requirementsHash: string | null;
}

/** Check model - represents a single availability check */
export interface Check {
  id: string;
  targetId: string;
  status: TargetStatus;
  nextSlotTime: Date | null;
  bookingLink: string | null;
  checkedAt: Date;
  rawText: string | null;
  errorMessage: string | null;
}

/** Alert model - represents a sent availability alert */
export interface Alert {
  id: string;
  targetId: string;
  dedupeHash: string;
  sentTo: string;
  sentAt: Date;
  nextSlotTime: Date | null;
  emailId: string | null;
}

/** Booking model - represents an auto-booking attempt */
export interface Booking {
  id: string;
  targetId: string;
  status: BookingStatus;
  slotDateTime: Date | null;
  confirmationNum: string | null;
  screenshotUrl: string | null;
  errorMessage: string | null;
  userProfile: string | null; // JSON as string
  startedAt: Date;
  completedAt: Date | null;
}

/** Notification model - represents any notification sent */
export interface Notification {
  id: string;
  targetId: string;
  type: NotificationType;
  email: string;
  subject: string;
  body: string | null;
  resendId: string | null;
  bookingId: string | null;
  sentAt: Date;
}

/** Requirement model - extracted requirements for an appointment */
export interface Requirement {
  id: string;
  targetId: string;
  sourceUrl: string | null;
  items: string; // JSON array as string
  rawContent: string | null;
  contentHash: string | null;
  extractedAt: Date;
  updatedAt: Date;
}

/** Requirement item - parsed from the items JSON */
export interface RequirementItem {
  text: string;
  category: RequirementCategory;
  required: boolean;
  details?: string;
}

/** User settings model */
export interface UserSettings {
  id: string;
  alertEmail: string;
  appointmentTypes: string; // JSON array as string
  preferredStates: string; // JSON array as string
  includeNeighborStates: boolean;
  notifyOnAvailable: boolean;
  notifyOnSlotChange: boolean;
  notifyOnRequiresInteraction: boolean;
  includeRequirements: boolean;
  maxEmailsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/** Input for creating a new target */
export interface CreateTargetInput {
  name: string;
  bookingUrl: string;
  platform?: Platform;
  appointmentType?: AppointmentType;
  country?: string;
  state?: string;
  city?: string;
  type?: string;
  requirementsUrl?: string;
  alertEmail: string;
  active?: boolean;
}

/** Input for updating an existing target */
export interface UpdateTargetInput {
  name?: string;
  bookingUrl?: string;
  platform?: Platform;
  appointmentType?: AppointmentType;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  type?: string;
  requirementsUrl?: string | null;
  alertEmail?: string;
  active?: boolean;
}

/** User profile for auto-booking */
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Additional fields can be added as needed
  [key: string]: unknown;
}

/** Input for starting an auto-booking session */
export interface StartBookingInput {
  userProfile: UserProfile;
  preferredSlot?: {
    date?: string; // ISO date string
    timeRange?: 'morning' | 'afternoon' | 'evening' | 'any';
  };
}

/** Input for check run */
export interface CheckRunInput {
  targetIds?: string[];
  forceRefresh?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Target summary for list views */
export interface TargetSummary {
  id: string;
  name: string;
  type: string;
  platform: string;
  appointmentType: string;
  bookingUrl: string;
  state: string | null;
  status: TargetStatus;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  lastAlertStatus: string | null;
  active: boolean;
  cached: boolean;
  cacheAge: number | null;
}

/** Target detail for detail views */
export interface TargetDetail {
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
  status: TargetStatus;
  nextSlotTime: string | null;
  lastCheckedAt: string | null;
  requirementsBullets: string[] | null;
  requirementsSource: 'cached' | 'fresh' | 'pending' | null;
  lastAlert: {
    status: string;
    reason: string | null;
    at: string | null;
  } | null;
  lastCheck: {
    status: string;
    nextSlotTime: string | null;
    bookingLink: string | null;
    email: { sent: boolean; reason: string };
    requirementsCount: number;
    checkedAt: string;
  } | null;
  recentChecks: CheckSummary[];
}

/** Check summary for history views */
export interface CheckSummary {
  id?: string;
  checkedAt: string;
  status: TargetStatus;
  nextSlotTime: string | null;
  emailSent?: boolean;
  rawDebug?: string | null;
  bookingLink?: string | null;
  errorMessage?: string | null;
}

/** Booking summary for history views */
export interface BookingSummary {
  id: string;
  status: BookingStatus;
  slotDateTime: string | null;
  confirmationNum: string | null;
  screenshotUrl: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

/** Check run result */
export interface CheckRunResult {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  summary: CheckRunSummary | null;
  results: CheckResultItem[] | null;
  errors: { targetId: string; message: string }[] | null;
}

/** Check run summary */
export interface CheckRunSummary {
  checked: number;
  available: number;
  emailsSent: number;
  cachedResults?: number;
  freshResults?: number;
}

/** Individual check result item */
export interface CheckResultItem {
  targetId: string;
  targetName: string;
  status: TargetStatus;
  nextSlotTime: string | null;
  bookingLink: string | null;
  email: {
    sent: boolean;
    reason: string;
  };
  requirementsCount: number;
  cached?: boolean;
}

// ============================================================================
// BOOKING SESSION TYPES (Real-time Auto-Booking)
// ============================================================================

/** Booking session state - sent via SSE during auto-booking */
export interface BookingSession {
  id: string;
  targetId: string;
  status: BookingStatus;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  stepDescription?: string;
  screenshot?: string; // base64 encoded
  error?: string;
  confirmation?: BookingConfirmation;
  startedAt: string;
  updatedAt: string;
}

/** Booking confirmation details */
export interface BookingConfirmation {
  confirmationNumber?: string;
  dateTime: string;
  location?: string;
  screenshotUrl?: string;
  additionalInfo?: Record<string, string>;
}

/** Booking step definition */
export interface BookingStep {
  step: number;
  name: string;
  description: string;
}

/** Standard booking steps */
export const BOOKING_STEPS: BookingStep[] = [
  { step: 1, name: 'initializing', description: 'Starting browser...' },
  { step: 2, name: 'navigating', description: 'Navigating to booking page...' },
  { step: 3, name: 'finding_slots', description: 'Finding available slots...' },
  { step: 4, name: 'selecting', description: 'Selecting appointment slot...' },
  { step: 5, name: 'filling_form', description: 'Filling booking form...' },
  { step: 6, name: 'confirming', description: 'Confirming booking...' },
];

// ============================================================================
// SCRAPER TYPES
// ============================================================================

/** Result from scraping a URL */
export interface ScrapeResult {
  success: boolean;
  content: string;
  html?: string;
  screenshot?: string; // base64
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    url?: string;
  };
}

/** Result from availability analysis */
export interface AvailabilityResult {
  hasAvailability: boolean;
  confidence: number; // 0-1
  slots: SlotInfo[];
  reasoning: string;
}

/** Slot information */
export interface SlotInfo {
  datetime: string;
  location?: string;
  type?: string;
  rawText?: string;
}

/** AI analysis result */
export interface AIAnalysis {
  hasAvailability: boolean;
  confidence: number;
  reasoning: string;
  slots?: SlotInfo[];
}

/** Diff result from comparing content */
export interface DiffResult {
  hasChanges: boolean;
  isSignificant: boolean;
  changes?: string;
  summary?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/** Notification payload for sending */
export interface NotificationPayload {
  targetName: string;
  bookingUrl: string;
  nextSlotTime: string | null;
  requirementsBullets: string[];
  requirementsUrl: string | null;
  alertEmail: string;
}

/** Notification result */
export interface NotificationResult {
  sent: boolean;
  emailId?: string;
  error?: string;
}

/** Booking notification payload */
export interface BookingNotificationPayload {
  targetName: string;
  bookingUrl: string;
  status: 'success' | 'failed' | 'started';
  slotDateTime?: string;
  confirmationNum?: string;
  errorMessage?: string;
  requirementsBullets?: string[];
  alertEmail: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Generic ID type */
export type ID = string;

/** Date string in ISO format */
export type ISODateString = string;

/** JSON value type */
export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

/** Partial with at least one property required */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

/** Make specific properties required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific properties optional */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
