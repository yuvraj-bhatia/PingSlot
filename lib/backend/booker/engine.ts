/**
 * Booking Engine
 *
 * Main orchestrator for the auto-booking system.
 * Manages browser lifecycle, adapter selection, and booking flow.
 * Supports video recording, cancellation, and real-time status updates.
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import * as path from "path";
import * as os from "os";
import {
  DEFAULT_BOOKING_OPTIONS,
  type BookingOptions,
  type BookingStatus,
  type BookingConfirmation,
  type StatusCallback,
  type UserProfile,
} from "./types";
import { getAdapter } from "./adapters";
import { getSessionManager, type SessionState } from "./session-manager";
import { captureScreenshot, captureCompressed } from "./screenshot";

// ============================================================================
// Extended Booking Options
// ============================================================================

export interface ExtendedBookingOptions extends BookingOptions {
  /** Record video of the booking process */
  recordVideo?: boolean;
  /** Directory to save video recordings */
  videoDir?: string;
  /** Platform hint for adapter selection */
  platformHint?: string;
  /** User agent string override */
  userAgent?: string;
  /** Viewport size */
  viewport?: { width: number; height: number };
  /** Enable session manager tracking */
  useSessionManager?: boolean;
}

const DEFAULT_EXTENDED_OPTIONS: ExtendedBookingOptions = {
  ...DEFAULT_BOOKING_OPTIONS,
  recordVideo: false,
  videoDir: path.join(os.tmpdir(), "pingslot-recordings"),
  useSessionManager: true,
  viewport: { width: 1280, height: 720 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// ============================================================================
// Booking Engine Class
// ============================================================================

export class BookingEngine {
  private browser: Browser | null = null;
  private options: ExtendedBookingOptions;
  private activeSessions: Map<string, { context: BrowserContext; page: Page }> =
    new Map();

  constructor(options: Partial<ExtendedBookingOptions> = {}) {
    this.options = { ...DEFAULT_EXTENDED_OPTIONS, ...options };
  }

  /**
   * Initialize the browser.
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    console.log("[BookingEngine] Launching browser...");
    this.browser = await chromium.launch({
      headless: this.options.headless ?? false,
      slowMo: this.options.slowMo ?? 100,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
    console.log("[BookingEngine] Browser launched");
  }

  /**
   * Close the browser.
   */
  async close(): Promise<void> {
    // Close all active sessions first
    for (const [sessionId, { context }] of this.activeSessions) {
      try {
        await context.close();
      } catch (error) {
        console.error(`[BookingEngine] Failed to close session ${sessionId}:`, error);
      }
    }
    this.activeSessions.clear();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log("[BookingEngine] Browser closed");
    }
  }

  /**
   * Book an appointment.
   *
   * @param targetId - The target ID
   * @param url - The booking URL
   * @param profile - User profile for form filling
   * @param onStatus - Callback for status updates
   * @param options - Override options for this booking
   */
  async book(
    targetId: string,
    url: string,
    profile: UserProfile,
    onStatus: StatusCallback,
    options: Partial<ExtendedBookingOptions> = {}
  ): Promise<BookingConfirmation> {
    const mergedOptions = { ...this.options, ...options };
    const sessionManager = mergedOptions.useSessionManager
      ? getSessionManager()
      : null;

    // Create session
    const session = sessionManager?.createSession(targetId);
    const sessionId = session?.id ?? `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const totalSteps = 6;
    let currentStep = 0;

    // Helper to check for cancellation
    const checkCancelled = (): boolean => {
      if (sessionManager?.isCancelled(sessionId)) {
        throw new Error("Booking was cancelled");
      }
      return false;
    };

    const updateStatus = async (
      status: BookingStatus,
      message: string,
      page?: Page,
      extra?: { confirmation?: BookingConfirmation; error?: string }
    ) => {
      checkCancelled();

      currentStep++;
      let screenshot: string | undefined;

      if (page && mergedOptions.captureScreenshots) {
        try {
          const result = await captureCompressed(page, 70);
          screenshot = result.base64;
        } catch {
          screenshot = undefined;
        }
      }

      // Update session manager
      if (sessionManager && session) {
        sessionManager.updateStep(sessionId, currentStep, status);
        if (screenshot) {
          sessionManager.addScreenshot(sessionId, screenshot, status);
        }
      }

      onStatus({
        sessionId,
        status,
        step: Math.min(currentStep, totalSteps),
        totalSteps,
        message,
        screenshot,
        ...extra,
      });
    };

    await this.initialize();
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    // Create browser context with optional video recording
    const contextOptions: Parameters<Browser["newContext"]>[0] = {
      viewport: mergedOptions.viewport,
      userAgent: mergedOptions.userAgent,
    };

    if (mergedOptions.recordVideo) {
      contextOptions.recordVideo = {
        dir: mergedOptions.videoDir!,
        size: mergedOptions.viewport,
      };
    }

    const context = await this.browser.newContext(contextOptions);
    const page = await context.newPage();

    // Track this session
    this.activeSessions.set(sessionId, { context, page });

    const adapter = getAdapter(url, mergedOptions.platformHint);
    sessionManager?.log(sessionId, `Using adapter: ${adapter.name}`, "info");

    try {
      // Step 1: Initialize
      await updateStatus("initializing", "Starting browser session...", page);
      checkCancelled();

      // Step 2: Navigate
      await updateStatus(
        "navigating",
        `Navigating to ${new URL(url).hostname}...`,
        page
      );
      await page.goto(url, { timeout: mergedOptions.timeout });

      if (adapter.waitForReady) {
        await adapter.waitForReady(page);
      }
      checkCancelled();

      // Step 3: Find slots
      await updateStatus(
        "finding_slots",
        "Looking for available time slots...",
        page
      );
      const slots = await adapter.findSlots(page);

      if (slots.length === 0) {
        throw new Error("No available slots found on the page");
      }

      console.log(`[BookingEngine] Found ${slots.length} slots`);
      sessionManager?.log(
        sessionId,
        `Found ${slots.length} available slot(s)`,
        "info"
      );
      checkCancelled();

      // Step 4: Select slot
      await updateStatus("selecting", `Selecting slot: ${slots[0].text}`, page);
      await adapter.selectSlot(page, slots[0]);
      await page.waitForTimeout(500);
      checkCancelled();

      // Step 5: Fill form
      await updateStatus("filling_form", "Filling booking form...", page);
      await adapter.fillForm(page, profile);
      await page.waitForTimeout(500);
      checkCancelled();

      // Step 6: Confirm
      await updateStatus("confirming", "Confirming booking...", page);
      const confirmation = await adapter.confirm(page);

      // Capture final screenshot
      let finalScreenshot: string | undefined;
      try {
        const result = await captureScreenshot(page);
        finalScreenshot = result.base64;
        confirmation.screenshotBase64 = finalScreenshot;
      } catch {
        // Ignore screenshot errors
      }

      // Success
      await updateStatus("success", "Booking confirmed!", page, { confirmation });

      if (sessionManager) {
        sessionManager.markSuccess(sessionId, confirmation);
      }

      // Get video path if recorded
      if (mergedOptions.recordVideo) {
        try {
          const video = page.video();
          if (video) {
            const videoPath = await video.path();
            console.log(`[BookingEngine] Video saved: ${videoPath}`);
          }
        } catch {
          // Video may not be available
        }
      }

      return confirmation;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const isCancelled = errorMessage === "Booking was cancelled";

      console.error("[BookingEngine] Booking failed:", errorMessage);

      // Take error screenshot
      let screenshot: string | undefined;
      try {
        const result = await captureScreenshot(page);
        screenshot = result.base64;
      } catch {
        // Ignore
      }

      if (sessionManager) {
        if (isCancelled) {
          sessionManager.cancelSession(sessionId);
        } else {
          sessionManager.markFailed(sessionId, errorMessage);
        }
      }

      onStatus({
        sessionId,
        status: isCancelled ? "cancelled" : "failed",
        step: currentStep,
        totalSteps,
        message: errorMessage,
        screenshot,
        error: errorMessage,
      });

      throw error;
    } finally {
      // Cleanup
      this.activeSessions.delete(sessionId);
      await context.close();
    }
  }

  /**
   * Cancel an active booking session.
   *
   * @param sessionId - The session ID to cancel
   * @returns True if cancellation was successful
   */
  async cancelBooking(sessionId: string): Promise<boolean> {
    const sessionManager = getSessionManager();

    // Cancel in session manager
    const cancelled = sessionManager.cancelSession(sessionId);

    // Close the browser context if it exists
    const activeSession = this.activeSessions.get(sessionId);
    if (activeSession) {
      try {
        await activeSession.context.close();
      } catch (error) {
        console.error(`[BookingEngine] Error closing session ${sessionId}:`, error);
      }
      this.activeSessions.delete(sessionId);
    }

    return cancelled;
  }

  /**
   * Get the status of a booking session.
   *
   * @param sessionId - The session ID
   * @returns The session state or null if not found
   */
  getSessionStatus(sessionId: string): SessionState | null {
    const sessionManager = getSessionManager();
    return sessionManager.getSession(sessionId);
  }

  /**
   * Get all active booking sessions.
   *
   * @returns Array of active sessions
   */
  getActiveSessions(): SessionState[] {
    const sessionManager = getSessionManager();
    return sessionManager.getActiveSessions();
  }

  /**
   * Take a screenshot and return as base64.
   * @deprecated Use captureScreenshot from screenshot.ts instead
   */
  private async takeScreenshot(page: Page): Promise<string> {
    try {
      const result = await captureCompressed(page, 70);
      return result.base64;
    } catch {
      return "";
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let engineInstance: BookingEngine | null = null;

/**
 * Get the booking engine instance.
 */
export function getBookingEngine(
  options?: Partial<ExtendedBookingOptions>
): BookingEngine {
  if (!engineInstance) {
    engineInstance = new BookingEngine(options);
  }
  return engineInstance;
}

/**
 * Close the booking engine and release resources.
 */
export async function closeBookingEngine(): Promise<void> {
  if (engineInstance) {
    await engineInstance.close();
    engineInstance = null;
  }
}

/**
 * Cancel an active booking.
 */
export async function cancelBooking(sessionId: string): Promise<boolean> {
  if (engineInstance) {
    return engineInstance.cancelBooking(sessionId);
  }
  return false;
}

export default {
  BookingEngine,
  getBookingEngine,
  closeBookingEngine,
  cancelBooking,
};
