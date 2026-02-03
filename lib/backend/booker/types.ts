/**
 * Auto-Booker Types
 * 
 * Type definitions for the Playwright-based auto-booking system.
 */

import type { Page } from "playwright";

// ============================================================================
// Booking Session Types
// ============================================================================

export type BookingStatus =
  | "initializing"
  | "navigating"
  | "finding_slots"
  | "selecting"
  | "filling_form"
  | "confirming"
  | "success"
  | "failed"
  | "cancelled";

export interface BookingSession {
  id: string;
  targetId: string;
  status: BookingStatus;
  currentStep: number;
  totalSteps: number;
  screenshot?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface BookingConfirmation {
  confirmationNumber: string | null;
  slotDateTime: string;
  screenshotBase64?: string;
  rawText?: string;
}

// ============================================================================
// User Profile Types
// ============================================================================

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  // Extended fields for specific platforms
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
}

// ============================================================================
// Slot Types
// ============================================================================

export interface SlotInfo {
  datetime: string;
  location?: string;
  type?: string;
  rawText: string;
  element?: SlotElement;
}

export interface SlotElement {
  selector: string;
  text: string;
  datetime?: string;
}

// ============================================================================
// Platform Adapter Interface
// ============================================================================

export interface PlatformAdapter {
  /** Unique name for this adapter */
  name: string;
  
  /** URL patterns this adapter can handle */
  urlPatterns: RegExp[];
  
  /** Check if this adapter can handle the given URL */
  canHandle(url: string): boolean;
  
  /** Find available slots on the page */
  findSlots(page: Page): Promise<SlotElement[]>;
  
  /** Select a specific slot */
  selectSlot(page: Page, slot: SlotElement): Promise<void>;
  
  /** Fill the booking form with user profile data */
  fillForm(page: Page, profile: UserProfile): Promise<void>;
  
  /** Confirm the booking */
  confirm(page: Page): Promise<BookingConfirmation>;
  
  /** Optional: Wait for page to be ready */
  waitForReady?(page: Page): Promise<void>;
}

// ============================================================================
// Booking Engine Types
// ============================================================================

export type StatusCallback = (update: BookingStatusUpdate) => void;

export interface BookingStatusUpdate {
  sessionId?: string;
  status: BookingStatus;
  step: number;
  totalSteps: number;
  message: string;
  screenshot?: string;
  confirmation?: BookingConfirmation;
  error?: string;
}

export interface BookingOptions {
  /** Run browser in headless mode (default: false for demo visibility) */
  headless?: boolean;
  /** Slow down actions for visibility (ms) */
  slowMo?: number;
  /** Timeout for operations (ms) */
  timeout?: number;
  /** Take screenshots at each step */
  captureScreenshots?: boolean;
}

export const DEFAULT_BOOKING_OPTIONS: BookingOptions = {
  headless: false,
  slowMo: 100,
  timeout: 30000,
  captureScreenshots: true,
};
