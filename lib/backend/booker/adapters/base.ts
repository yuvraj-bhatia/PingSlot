/**
 * Base Platform Adapter
 * 
 * Abstract base class for platform-specific booking adapters.
 * Provides common utilities and default implementations.
 */

import type { Page } from "playwright";
import type {
  PlatformAdapter,
  SlotElement,
  UserProfile,
  BookingConfirmation,
} from "../types";

/**
 * Abstract base class for platform adapters.
 * Extend this class to create adapters for specific booking platforms.
 */
export abstract class BaseAdapter implements PlatformAdapter {
  abstract name: string;
  abstract urlPatterns: RegExp[];

  /**
   * Check if this adapter can handle the given URL.
   */
  canHandle(url: string): boolean {
    return this.urlPatterns.some((pattern) => pattern.test(url));
  }

  /**
   * Find available slots on the page.
   * Must be implemented by each adapter.
   */
  abstract findSlots(page: Page): Promise<SlotElement[]>;

  /**
   * Select a specific slot.
   * Must be implemented by each adapter.
   */
  abstract selectSlot(page: Page, slot: SlotElement): Promise<void>;

  /**
   * Fill the booking form with user profile data.
   * Must be implemented by each adapter.
   */
  abstract fillForm(page: Page, profile: UserProfile): Promise<void>;

  /**
   * Confirm the booking.
   * Must be implemented by each adapter.
   */
  abstract confirm(page: Page): Promise<BookingConfirmation>;

  /**
   * Wait for page to be ready.
   * Default implementation waits for network idle.
   */
  async waitForReady(page: Page): Promise<void> {
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
      // Fallback to domcontentloaded if networkidle times out
      return page.waitForLoadState("domcontentloaded");
    });
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Safely click an element with retry logic.
   */
  protected async safeClick(
    page: Page,
    selector: string,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<boolean> {
    const { timeout = 5000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        await page.click(selector, { timeout });
        return true;
      } catch (error) {
        if (i === retries - 1) {
          console.warn(`[Adapter] Failed to click ${selector} after ${retries} attempts`);
          return false;
        }
        await page.waitForTimeout(500);
      }
    }
    return false;
  }

  /**
   * Safely fill an input field.
   */
  protected async safeFill(
    page: Page,
    selector: string,
    value: string,
    options: { timeout?: number; clear?: boolean } = {}
  ): Promise<boolean> {
    const { timeout = 5000, clear = true } = options;

    try {
      const element = await page.waitForSelector(selector, { timeout });
      if (!element) return false;

      if (clear) {
        await element.fill("");
      }
      await element.fill(value);
      return true;
    } catch (error) {
      console.warn(`[Adapter] Failed to fill ${selector}:`, error);
      return false;
    }
  }

  /**
   * Wait for an element to appear and return its text content.
   */
  protected async getElementText(
    page: Page,
    selector: string,
    timeout = 5000
  ): Promise<string | null> {
    try {
      const element = await page.waitForSelector(selector, { timeout });
      return element ? await element.textContent() : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if an element exists on the page.
   */
  protected async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      const element = await page.$(selector);
      return element !== null;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view.
   */
  protected async scrollIntoView(page: Page, selector: string): Promise<void> {
    try {
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, selector);
      await page.waitForTimeout(300);
    } catch {
      // Ignore scroll errors
    }
  }

  /**
   * Take a screenshot and return as base64.
   */
  protected async takeScreenshot(page: Page): Promise<string> {
    const buffer = await page.screenshot({ type: "png" });
    return buffer.toString("base64");
  }

  /**
   * Extract confirmation number from page text using common patterns.
   */
  protected extractConfirmationNumber(text: string): string | null {
    // Common patterns for confirmation numbers
    const patterns = [
      /confirmation[:\s#]*([A-Z0-9-]+)/i,
      /reference[:\s#]*([A-Z0-9-]+)/i,
      /booking[:\s#]*([A-Z0-9-]+)/i,
      /appointment[:\s#]*([A-Z0-9-]+)/i,
      /#([A-Z0-9]{6,})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Parse datetime from various formats.
   */
  protected parseDateTime(text: string): string | null {
    try {
      // Try to parse as ISO date
      const date = new Date(text);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      // Try common date patterns
      // Add more patterns as needed
      const patterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        /(\w+)\s+(\d{1,2}),?\s+(\d{4})/,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const parsed = new Date(text);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
          }
        }
      }
    } catch {
      // Ignore parsing errors
    }

    return null;
  }
}
