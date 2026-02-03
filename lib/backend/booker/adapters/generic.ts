/**
 * Generic Platform Adapter
 * 
 * AI-powered fallback adapter for unknown booking platforms.
 * Uses heuristics and common patterns to find and interact with booking elements.
 */

import type { Page } from "playwright";
import { BaseAdapter } from "./base";
import type {
  SlotElement,
  UserProfile,
  BookingConfirmation,
} from "../types";

export class GenericAdapter extends BaseAdapter {
  name = "generic";
  
  // Matches everything - used as fallback
  urlPatterns = [/.*/];

  /**
   * Wait for page to be ready.
   */
  async waitForReady(page: Page): Promise<void> {
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {
      return page.waitForLoadState("domcontentloaded");
    });
  }

  /**
   * Find available time slots using common patterns.
   */
  async findSlots(page: Page): Promise<SlotElement[]> {
    const slots: SlotElement[] = [];

    await this.waitForReady(page);

    // Common patterns for time slots across various platforms
    const slotPatterns = [
      // Button-based time slots
      "button:has-text(/\\d{1,2}:\\d{2}/)",
      "button:has-text(/\\d{1,2}\\s*(AM|PM)/i)",
      
      // Link-based slots
      "a:has-text(/\\d{1,2}:\\d{2}/)",
      "a:has-text(/available/i)",
      
      // Generic slot containers
      "[class*='slot']:not([class*='disabled'])",
      "[class*='time']:not([class*='disabled'])",
      "[class*='available']",
      
      // List items that look like times
      "li:has-text(/\\d{1,2}:\\d{2}/)",
      
      // Radio/checkbox options
      "input[type='radio'] + label:has-text(/\\d{1,2}/)",
    ];

    for (const pattern of slotPatterns) {
      try {
        const elements = await page.$$(pattern);
        
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (!isVisible) continue;

          const text = await element.textContent();
          if (text && text.length < 100) {
            slots.push({
              selector: pattern,
              text: text.trim(),
              datetime: this.parseDateTime(text.trim()) || undefined,
            });
          }
        }

        if (slots.length >= 5) break; // Limit to avoid too many
      } catch {
        // Continue to next pattern
      }
    }

    // Deduplicate by text
    const uniqueSlots = slots.filter((slot, index, self) =>
      index === self.findIndex((s) => s.text === slot.text)
    );

    console.log(`[Generic] Found ${uniqueSlots.length} potential slots`);
    return uniqueSlots.slice(0, 10);
  }

  /**
   * Select a specific slot.
   */
  async selectSlot(page: Page, slot: SlotElement): Promise<void> {
    // Try to find the exact element
    try {
      const elements = await page.$$(slot.selector);
      
      for (const element of elements) {
        const text = await element.textContent();
        if (text?.trim() === slot.text) {
          await element.click();
          await page.waitForTimeout(1000);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Try clicking by text
    try {
      await page.click(`text="${slot.text}"`);
    } catch {
      console.warn(`[Generic] Could not select slot: ${slot.text}`);
    }
  }

  /**
   * Fill the booking form using common field patterns.
   */
  async fillForm(page: Page, profile: UserProfile): Promise<void> {
    // Wait a moment for form to appear
    await page.waitForTimeout(1000);

    // Common form field patterns
    const fieldPatterns = [
      // First name
      {
        selectors: [
          "input[name*='first'][name*='name' i]",
          "input[placeholder*='first' i]",
          "input[id*='first' i]",
          "input[aria-label*='first' i]",
        ],
        value: profile.firstName,
      },
      // Last name
      {
        selectors: [
          "input[name*='last'][name*='name' i]",
          "input[placeholder*='last' i]",
          "input[id*='last' i]",
          "input[aria-label*='last' i]",
        ],
        value: profile.lastName,
      },
      // Full name (if separate fields not found)
      {
        selectors: [
          "input[name='name']",
          "input[placeholder*='name' i]:not([placeholder*='first' i]):not([placeholder*='last' i])",
          "input[aria-label*='name' i]:not([aria-label*='first' i]):not([aria-label*='last' i])",
        ],
        value: `${profile.firstName} ${profile.lastName}`,
      },
      // Email
      {
        selectors: [
          "input[type='email']",
          "input[name*='email' i]",
          "input[placeholder*='email' i]",
          "input[id*='email' i]",
        ],
        value: profile.email,
      },
      // Phone
      {
        selectors: [
          "input[type='tel']",
          "input[name*='phone' i]",
          "input[placeholder*='phone' i]",
          "input[id*='phone' i]",
        ],
        value: profile.phone || "",
      },
    ];

    for (const field of fieldPatterns) {
      if (!field.value) continue;

      for (const selector of field.selectors) {
        const filled = await this.safeFill(page, selector, field.value, { timeout: 1500 });
        if (filled) {
          console.log(`[Generic] Filled field: ${selector}`);
          break;
        }
      }
    }

    // Check required checkboxes
    try {
      const checkboxes = await page.$$("input[type='checkbox'][required]");
      for (const checkbox of checkboxes) {
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check();
        }
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Confirm the booking.
   */
  async confirm(page: Page): Promise<BookingConfirmation> {
    // Common submit button patterns
    const submitPatterns = [
      "button[type='submit']",
      "input[type='submit']",
      "button:has-text(/confirm/i)",
      "button:has-text(/book/i)",
      "button:has-text(/schedule/i)",
      "button:has-text(/submit/i)",
      "button:has-text(/complete/i)",
      "a:has-text(/confirm/i)",
      "[class*='submit']",
      "[class*='confirm']",
    ];

    let clicked = false;
    for (const pattern of submitPatterns) {
      clicked = await this.safeClick(page, pattern, { timeout: 2000 });
      if (clicked) {
        console.log(`[Generic] Clicked: ${pattern}`);
        break;
      }
    }

    if (!clicked) {
      throw new Error("Could not find submit/confirm button");
    }

    // Wait for response
    await page.waitForTimeout(3000);

    // Try to find confirmation
    const pageText = await page.textContent("body") || "";
    const confirmationNumber = this.extractConfirmationNumber(pageText);
    const screenshotBase64 = await this.takeScreenshot(page);

    return {
      confirmationNumber,
      slotDateTime: new Date().toISOString(),
      screenshotBase64,
      rawText: pageText.slice(0, 1000),
    };
  }
}

export const genericAdapter = new GenericAdapter();
