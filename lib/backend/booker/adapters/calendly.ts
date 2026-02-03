/**
 * Calendly Platform Adapter
 * 
 * Handles auto-booking for Calendly pages.
 * 
 * URL Patterns:
 * - https://calendly.com/*
 */

import type { Page } from "playwright";
import { BaseAdapter } from "./base";
import type {
  SlotElement,
  UserProfile,
  BookingConfirmation,
} from "../types";

export class CalendlyAdapter extends BaseAdapter {
  name = "calendly";
  
  urlPatterns = [
    /calendly\.com/i,
  ];

  /**
   * Wait for Calendly page to be ready.
   */
  async waitForReady(page: Page): Promise<void> {
    // Wait for the calendar or time selection to load
    await page.waitForSelector(
      "[data-container='time-button'], [data-testid='calendar'], .calendar-table",
      { timeout: 15000 }
    ).catch(() => {
      return page.waitForLoadState("networkidle");
    });
  }

  /**
   * Find available time slots on Calendly page.
   */
  async findSlots(page: Page): Promise<SlotElement[]> {
    const slots: SlotElement[] = [];

    await this.waitForReady(page);

    // Calendly time slot selectors
    const slotSelectors = [
      "[data-container='time-button']",
      "button[data-testid*='time']",
      ".time-button:not(:disabled)",
      "[class*='spotButton']",
    ];

    for (const selector of slotSelectors) {
      try {
        const elements = await page.$$(selector);
        
        for (const element of elements) {
          const isDisabled = await element.getAttribute("disabled");
          if (isDisabled) continue;

          const text = await element.textContent();
          if (text) {
            const datetime = this.parseDateTime(text.trim());
            slots.push({
              selector,
              text: text.trim(),
              datetime: datetime || undefined,
            });
          }
        }

        if (slots.length > 0) break;
      } catch {
        // Continue to next selector
      }
    }

    // If no slots found, try selecting an available date first
    if (slots.length === 0) {
      const dateSelectors = [
        "[data-testid='calendar-day']:not([disabled])",
        "td[role='gridcell']:not([aria-disabled='true'])",
        ".calendar-day:not(.disabled)",
      ];

      for (const selector of dateSelectors) {
        try {
          const elements = await page.$$(selector);
          const availableDate = elements.find(async (el) => {
            const ariaDisabled = await el.getAttribute("aria-disabled");
            return ariaDisabled !== "true";
          });

          if (availableDate) {
            await availableDate.click();
            await page.waitForTimeout(1500);
            return this.findSlots(page);
          }
        } catch {
          // Continue
        }
      }
    }

    console.log(`[Calendly] Found ${slots.length} available slots`);
    return slots;
  }

  /**
   * Select a specific time slot.
   */
  async selectSlot(page: Page, slot: SlotElement): Promise<void> {
    const elements = await page.$$(slot.selector);
    
    for (const element of elements) {
      const text = await element.textContent();
      if (text?.trim() === slot.text) {
        await element.click();
        await page.waitForTimeout(1000);
        
        // Calendly often has a "Confirm" button after selecting time
        const confirmTimeSelectors = [
          "button:has-text('Confirm')",
          "button:has-text('Next')",
          "[data-testid='confirm-button']",
        ];

        for (const confirmSelector of confirmTimeSelectors) {
          const clicked = await this.safeClick(page, confirmSelector, { timeout: 3000 });
          if (clicked) break;
        }

        return;
      }
    }

    // Fallback
    await this.safeClick(page, slot.selector);
  }

  /**
   * Fill the booking form with user profile data.
   */
  async fillForm(page: Page, profile: UserProfile): Promise<void> {
    // Wait for form to appear
    await page.waitForSelector("input[name='name'], input[name='email']", { timeout: 10000 }).catch(() => {});

    const fieldMappings = [
      // Full name (Calendly often uses single name field)
      { selectors: ["input[name='name']", "input[name='full_name']"], value: `${profile.firstName} ${profile.lastName}` },
      
      // Email
      { selectors: ["input[name='email']", "input[type='email']"], value: profile.email },
      
      // Phone (if present)
      { selectors: ["input[name='phone']", "input[type='tel']"], value: profile.phone || "" },
    ];

    for (const mapping of fieldMappings) {
      if (!mapping.value) continue;

      for (const selector of mapping.selectors) {
        const filled = await this.safeFill(page, selector, mapping.value, { timeout: 2000 });
        if (filled) {
          console.log(`[Calendly] Filled ${selector}`);
          break;
        }
      }
    }

    // Handle any text areas (additional info)
    const textareaSelectors = ["textarea[name*='question']", "textarea[name*='note']"];
    for (const selector of textareaSelectors) {
      try {
        const textarea = await page.$(selector);
        if (textarea) {
          await textarea.fill("Booked via PingSlot");
        }
      } catch {
        // Ignore
      }
    }

    await page.waitForTimeout(500);
  }

  /**
   * Confirm the booking.
   */
  async confirm(page: Page): Promise<BookingConfirmation> {
    // Find and click the schedule/confirm button
    const submitSelectors = [
      "button:has-text('Schedule Event')",
      "button:has-text('Confirm')",
      "button[type='submit']",
      "[data-testid='submit-button']",
      ".confirm-button",
    ];

    let clicked = false;
    for (const selector of submitSelectors) {
      clicked = await this.safeClick(page, selector, { timeout: 3000 });
      if (clicked) {
        console.log(`[Calendly] Clicked submit button: ${selector}`);
        break;
      }
    }

    if (!clicked) {
      throw new Error("Could not find submit button");
    }

    // Wait for confirmation
    await page.waitForTimeout(3000);

    // Look for confirmation page
    const confirmationSelectors = [
      "[data-testid='confirmation']",
      ".confirmation-page",
      "[class*='confirmation']",
      "[class*='success']",
    ];

    let confirmationText = "";
    for (const selector of confirmationSelectors) {
      const text = await this.getElementText(page, selector, 5000);
      if (text) {
        confirmationText = text;
        break;
      }
    }

    if (!confirmationText) {
      confirmationText = await page.textContent("body") || "";
    }

    const confirmationNumber = this.extractConfirmationNumber(confirmationText);
    const screenshotBase64 = await this.takeScreenshot(page);

    return {
      confirmationNumber,
      slotDateTime: new Date().toISOString(),
      screenshotBase64,
      rawText: confirmationText.slice(0, 1000),
    };
  }
}

export const calendlyAdapter = new CalendlyAdapter();
