/**
 * Auto-Booker Module
 *
 * THE STAR FEATURE of PingSlot - automated browser-based appointment booking.
 * This module provides:
 * - Playwright-based browser automation
 * - Platform-specific adapters (Acuity, Calendly, Generic)
 * - Real-time status streaming
 * - Session management with cancellation support
 * - Screenshot capture at each step
 * - Video recording option
 *
 * @example
 * ```typescript
 * import { getBookingEngine, getSessionManager } from '@/lib/backend/booker';
 *
 * const engine = getBookingEngine({ headless: false, recordVideo: true });
 * const confirmation = await engine.book(
 *   targetId,
 *   bookingUrl,
 *   userProfile,
 *   (status) => console.log(status)
 * );
 * ```
 */

// Types
export * from "./types";

// Engine
export {
  BookingEngine,
  getBookingEngine,
  closeBookingEngine,
  cancelBooking,
  type ExtendedBookingOptions,
} from "./engine";

// Session Management
export {
  SessionManager,
  getSessionManager,
  type SessionState,
  type SessionEvent,
} from "./session-manager";

// Screenshot Utilities
export {
  captureScreenshot,
  captureFullPage,
  captureCompressed,
  captureElement,
  captureStepScreenshot,
  type ScreenshotOptions,
  type ScreenshotResult,
} from "./screenshot";

// Adapters
export {
  getAdapter,
  getAdapterByName,
  getAllAdapters,
  getSupportedPlatforms,
  isUrlSupported,
  detectPlatform,
  acuityAdapter,
  calendlyAdapter,
  genericAdapter,
  AcuityAdapter,
  CalendlyAdapter,
  GenericAdapter,
  BaseAdapter,
} from "./adapters";
