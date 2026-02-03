/**
 * Acuity Scheduling Platform Adapter
 * 
 * Handles auto-booking for Acuity Scheduling pages.
 * Acuity is one of the most common appointment scheduling platforms.
 * 
 * URL Patterns:
 * - https://*.acuityscheduling.com/*
 * - https://app.acuityscheduling.com/*
 */

import type { Page } from "playwright";
import { BaseAdapter } from "./base";
import type {
  SlotElement,
  UserProfile,
  BookingConfirmation,
} from "../types";

export class AcuityAdapter extends BaseAdapter {
  name = "acuity";
  
  urlPatterns = [
    /acuityscheduling\.com/i,
    /squarespacescheduling\.com/i,
  ];

  /**
   * Wait for Acuity page to be ready.
   */
  async waitForReady(page: Page): Promise<void> {
    // Wait for the calendar or time slots to load
    await page.waitForSelector(
      ".choose-time, .appointment-type-list, .calendar-wrapper, [class*='time-slot']",
      { timeout: 15000 }
    ).catch(() => {
      // Fallback to generic load state
      return page.waitForLoadState("networkidle");
    });
  }

  /**
   * Find available time slots on Acuity page.
   */
  async findSlots(page: Page): Promise<SlotElement[]> {
    const slots: SlotElement[] = [];

    // Wait for time slots to appear
    await this.waitForReady(page);

    // Acuity uses various selectors for time slots
    const slotSelectors = [
      ".choose-time .time-slot:not(.disabled)",
      ".available-times button:not(:disabled)",
      "[class*='time-slot']:not([class*='disabled'])",
      ".time-selection button:not(:disabled)",
      ".appointment-time:not(.unavailable)",
    ];

    for (const selector of slotSelectors) {
      try {
        const elements = await page.$$(selector);
        
        for (const element of elements) {
          const text = await element.textContent();
          if (text) {
            const datetime = this.parseDateTime(text.trim());
            slots.push({
              selector: selector,
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

    // If no direct time slots, check for date selection first
    if (slots.length === 0) {
      // Try to find available dates in calendar
      const dateSelectors = [
        ".calendar-day:not(.disabled):not(.past)",
        "[class*='calendar'] td:not(.disabled)",
        ".day-available",
      ];

      for (const selector of dateSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            // Click first available date to reveal time slots
            await elements[0].click();
            await page.waitForTimeout(1000);
            
            // Try finding time slots again
            return this.findSlots(page);
          }
        } catch {
          // Continue to next selector
        }
      }
    }

    console.log(`[Acuity] Found ${slots.length} available slots`);
    return slots;
  }

  /**
   * Select a specific time slot.
   */
  async selectSlot(page: Page, slot: SlotElement): Promise<void> {
    // Find the element by its text content
    const elements = await page.$$(slot.selector);
    
    for (const element of elements) {
      const text = await element.textContent();
      if (text?.trim() === slot.text) {
        await this.scrollIntoView(page, slot.selector);
        await element.click();
        await page.waitForTimeout(500);
        
        // Wait for form to appear
        await page.waitForSelector(
          "input[name*='name'], input[name*='email'], input[type='email']",
          { timeout: 10000 }
        ).catch(() => {
          console.log("[Acuity] Form may not have appeared yet");
        });
        
        return;
      }
    }

    // Fallback: click the first matching element
    await this.safeClick(page, slot.selector);
  }

  /**
   * Fill the booking form with user profile data.
   */
  async fillForm(page: Page, profile: UserProfile): Promise<void> {
    // Common Acuity form field selectors
    const fieldMappings = [
      // Name fields
      { selectors: ["input[name*='firstName']", "input[name*='first_name']", "#firstName"], value: profile.firstName },
      { selectors: ["input[name*='lastName']", "input[name*='last_name']", "#lastName"], value: profile.lastName },
      { selectors: ["input[name*='name']:not([name*='first']):not([name*='last'])"], value: `${profile.firstName} ${profile.lastName}` },
      
      // Email
      { selectors: ["input[type='email']", "input[name*='email']", "#email"], value: profile.email },
      
      // Phone
      { selectors: ["input[type='tel']", "input[name*='phone']", "#phone"], value: profile.phone || "" },
    ];

    for (const mapping of fieldMappings) {
      if (!mapping.value) continue;

      for (const selector of mapping.selectors) {
        const filled = await this.safeFill(page, selector, mapping.value, { timeout: 2000 });
        if (filled) {
          console.log(`[Acuity] Filled ${selector}`);
          break;
        }
      }
    }

    // Handle any required checkboxes (terms, consent, etc.)
    const checkboxSelectors = [
      "input[type='checkbox'][required]",
      "input[type='checkbox'][name*='agree']",
      "input[type='checkbox'][name*='consent']",
    ];

    for (const selector of checkboxSelectors) {
      try {
        const checkbox = await page.$(selector);
        if (checkbox) {
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            await checkbox.check();
          }
        }
      } catch {
        // Ignore checkbox errors
      }
    }

    await page.waitForTimeout(500);
  }

  /**
   * Confirm the booking.
   */
  async confirm(page: Page): Promise<BookingConfirmation> {
    // Find and click the submit/confirm button
    const submitSelectors = [
      "button[type='submit']",
      "input[type='submit']",
      "button:has-text('Confirm')",
      "button:has-text('Book')",
      "button:has-text('Schedule')",
      ".confirm-button",
      ".submit-button",
    ];

    let clicked = false;
    for (const selector of submitSelectors) {
      clicked = await this.safeClick(page, selector, { timeout: 3000 });
      if (clicked) {
        console.log(`[Acuity] Clicked submit button: ${selector}`);
        break;
      }
    }

    if (!clicked) {
      throw new Error("Could not find submit button");
    }

    // Wait for confirmation page
    await page.waitForTimeout(3000);

    // Try to find confirmation details
    const confirmationSelectors = [
      ".confirmation-page",
      ".booking-confirmation",
      "[class*='confirmation']",
      "[class*='success']",
      ".thank-you",
    ];

    let confirmationText = "";
    for (const selector of confirmationSelectors) {
      const text = await this.getElementText(page, selector, 5000);
      if (text) {
        confirmationText = text;
        break;
      }
    }

    // If no specific confirmation element, get the whole page text
    if (!confirmationText) {
      confirmationText = await page.textContent("body") || "";
    }

    // Extract confirmation number
    const confirmationNumber = this.extractConfirmationNumber(confirmationText);

    // Try to extract the booked datetime
    let slotDateTime = new Date().toISOString();
    const datePatterns = [
      /(\w+,?\s+\w+\s+\d{1,2},?\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\s+\d{1,2}:\d{2})/i,
    ];

    for (const pattern of datePatterns) {
      const match = confirmationText.match(pattern);
      if (match) {
        const parsed = this.parseDateTime(match[1]);
        if (parsed) {
          slotDateTime = parsed;
          break;
        }
      }
    }

    // Take confirmation screenshot
    const screenshotBase64 = await this.takeScreenshot(page);

    return {
      confirmationNumber,
      slotDateTime,
      screenshotBase64,
      rawText: confirmationText.slice(0, 1000),
    };
  }
}

export const acuityAdapter = new AcuityAdapter();
