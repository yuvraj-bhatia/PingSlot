/**
 * Firecrawl Availability Checker (Enhanced)
 * 
 * A smart, adaptive appointment availability checker that:
 * - ONLY fetches explicit URLs from the database
 * - NEVER crawls, follows links, or discovers new URLs
 * - Uses Firecrawl SDK with ACTIONS for interactive pages
 * - Supports XHR/JSON endpoint detection for dynamic pages
 * - Returns structured availability results
 * 
 * Architecture:
 * - Adapter pattern for different booking systems (Acuity, DMV, Generic)
 * - Firecrawl Actions for pages requiring interaction
 * - Keyword-based heuristics as fallback
 * - Graceful error handling (never throws)
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import config from "./config";

// ============================================================================
// Types
// ============================================================================

export type TargetType = "acuity" | "dmv" | "generic" | "unknown";
export type PlatformType = "acuity" | "microsoft" | "dmv" | "generic" | "unknown";

export type AvailabilityStatus = 
  | "available" 
  | "unavailable" 
  | "unknown" 
  | "requires_interaction";

export type ExtractionResult = {
  status: AvailabilityStatus;
  nextSlotTime: string | null;
  bookingLink: string;
  rawText: string;
  error?: string;
  /** Additional context when status is requires_interaction */
  interactionHint?: string;
};

export type Target = {
  id: string;
  name: string;
  bookingUrl: string;
  type: TargetType;
  platform?: PlatformType;
};

// Internal type for adapter output
type AdapterResult = {
  status: AvailabilityStatus;
  nextSlotTime: string | null;
  interactionHint?: string;
};

// Firecrawl Action types
type FirecrawlAction = 
  | { type: "wait"; milliseconds?: number; selector?: string }
  | { type: "click"; selector: string; all?: boolean }
  | { type: "screenshot"; fullPage?: boolean }
  | { type: "write"; text: string }
  | { type: "press"; key: string }
  | { type: "scroll"; direction?: "up" | "down"; selector?: string }
  | { type: "scrape" }
  | { type: "executeJavascript"; script: string };

// ============================================================================
// Firecrawl Client Setup
// ============================================================================

function createFirecrawlClient(): FirecrawlApp | null {
  if (!config.firecrawlApiKey) {
    console.warn("[Firecrawl] No API key configured - will use basic fetch fallback");
    return null;
  }
  return new FirecrawlApp({ apiKey: config.firecrawlApiKey });
}

let firecrawlClient: FirecrawlApp | null = null;

function getFirecrawlClient(): FirecrawlApp | null {
  if (firecrawlClient === null && config.firecrawlApiKey) {
    firecrawlClient = createFirecrawlClient();
  }
  return firecrawlClient;
}

// ============================================================================
// Content Normalization
// ============================================================================

function normalizeFirecrawlResult(markdown: string | undefined, html: string | undefined): string {
  let text = markdown || "";

  if (!text && html) {
    text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  return text
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ============================================================================
// Interactive Page Detection
// ============================================================================

/**
 * Detects if a page requires user interaction before showing availability.
 * These pages have forms, dropdowns, or checkboxes that must be filled first.
 */
function detectInteractivePage(text: string, url: string): { isInteractive: boolean; hint: string } {
  // DMV pages typically require selecting appointment type
  const dmvInteractivePatterns = [
    { pattern: "select appointment type", hint: "Select an appointment type first" },
    { pattern: "choose a service", hint: "Choose a service type" },
    { pattern: "select a location", hint: "Select an office location" },
    { pattern: "select office", hint: "Select a DMV office" },
    { pattern: "what would you like to do", hint: "Select what you need to do" },
    { pattern: "schedule your appointment", hint: "Click to schedule appointment" },
  ];

  // Generic interactive patterns
  const genericInteractivePatterns = [
    { pattern: "please select", hint: "Selection required before viewing availability" },
    { pattern: "choose from the options", hint: "Choose an option to continue" },
    { pattern: "step 1", hint: "Multi-step form - complete step 1 first" },
    { pattern: "begin scheduling", hint: "Click to begin the scheduling process" },
  ];

  // Check if URL is a known DMV domain
  const isDmvUrl = url.includes("dmv.") || url.includes("/dmv/");

  const patterns = isDmvUrl 
    ? [...dmvInteractivePatterns, ...genericInteractivePatterns]
    : genericInteractivePatterns;

  for (const { pattern, hint } of patterns) {
    if (text.includes(pattern)) {
      return { isInteractive: true, hint };
    }
  }

  // Check for form elements that suggest interaction needed
  const formIndicators = [
    "[ ]", // Checkbox patterns in markdown
    "- [ ]",
    "select one",
    "choose one",
    "dropdown",
  ];

  for (const indicator of formIndicators) {
    if (text.includes(indicator)) {
      // Only flag as interactive if there's no clear availability signal
      const hasAvailabilitySignal = 
        text.includes("available") || 
        text.includes("book now") ||
        text.includes("schedule now");
      
      if (!hasAvailabilitySignal) {
        return { 
          isInteractive: true, 
          hint: "Form selection required before availability is shown" 
        };
      }
    }
  }

  return { isInteractive: false, hint: "" };
}

// ============================================================================
// Availability Detection (Enhanced)
// ============================================================================

function detectAvailability(text: string, url: string = ""): AvailabilityStatus {
  // === CHECK FOR INTERACTIVE PAGE FIRST ===
  const { isInteractive, hint } = detectInteractivePage(text, url);
  
  // === UNAVAILABLE SIGNALS (highest priority) ===
  const unavailablePatterns = [
    "no availability",
    "no appointments available",
    "no times available",
    "no slots available",
    "no openings",
    "fully booked",
    "all booked",
    "schedule is full",
    "no open slots",
    "currently unavailable",
    "not accepting appointments",
    "waitlist only",
    "wait list only",
    "check back later",
    "try again later",
    "no dates available",
    "nothing available",
    "sold out",
    "at capacity",
    "appointments are not available",
    "no appointment times",
    "no available times",
    "sorry, no appointments",
  ];

  for (const pattern of unavailablePatterns) {
    if (text.includes(pattern)) {
      return "unavailable";
    }
  }

  // === AVAILABLE SIGNALS ===
  const availablePatterns = [
    "book now",
    "schedule now",
    "book appointment",
    "schedule appointment",
    "available appointments",
    "available times",
    "available slots",
    "select a time",
    "select a date",
    "choose a time",
    "choose a slot",
    "pick a time",
    "pick a date",
    "next available",
    "appointments available",
    "open slots",
    "click to book",
    "reserve now",
    "make appointment",
    "appointment available",
    "slots open",
    "times open",
  ];

  for (const pattern of availablePatterns) {
    if (text.includes(pattern)) {
      return "available";
    }
  }

  // === TIME PATTERN DETECTION ===
  const timePatterns = [
    /\d{1,2}:\d{2}\s*(am|pm)/gi,
    /\d{1,2}\s*(am|pm)/gi,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+\w+\s+\d{1,2}/gi,
  ];

  let timeMatchCount = 0;
  for (const pattern of timePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      timeMatchCount += matches.length;
    }
  }

  if (timeMatchCount >= 3) {
    return "available";
  }

  // === CALENDAR INDICATORS ===
  const calendarIndicators = [
    "select date",
    "calendar",
    "available date",
    "appointment date",
  ];

  for (const indicator of calendarIndicators) {
    if (text.includes(indicator)) {
      return "available";
    }
  }

  // === IF INTERACTIVE, RETURN THAT STATUS ===
  if (isInteractive) {
    return "requires_interaction";
  }

  return "unknown";
}

// ============================================================================
// Time Slot Extraction
// ============================================================================

function extractNextSlot(text: string): string | null {
  const nextAvailableMatch = text.match(/next available[:\s]+([^.]+)/i);
  if (nextAvailableMatch) {
    const parsed = tryParseDateTime(nextAvailableMatch[1]);
    if (parsed) return parsed;
  }

  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    return constructDateTimeFromMatch(timeMatch);
  }

  const dateMatch = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:,?\s*\d{4})?/i);
  if (dateMatch) {
    const parsed = tryParseDateTime(dateMatch[0]);
    if (parsed) return parsed;
  }

  return null;
}

function tryParseDateTime(text: string): string | null {
  try {
    const date = new Date(text);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Parsing failed
  }
  return null;
}

function constructDateTimeFromMatch(match: RegExpMatchArray): string | null {
  try {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3]?.toLowerCase();

    if (meridian === "pm" && hours !== 12) {
      hours += 12;
    } else if (meridian === "am" && hours === 12) {
      hours = 0;
    }

    const now = new Date();
    const slotDate = new Date(now);
    slotDate.setHours(hours, minutes, 0, 0);

    if (slotDate <= now) {
      slotDate.setDate(slotDate.getDate() + 1);
    }

    return slotDate.toISOString();
  } catch {
    return null;
  }
}

// ============================================================================
// Adapters (Enhanced with Actions Support)
// ============================================================================

interface AvailabilityAdapter {
  /** Adapter name for logging */
  name: string;
  /** Extract availability from text */
  extract(text: string, url: string): AdapterResult;
  /** Get Firecrawl actions for interactive pages (optional) */
  getActions?(url: string): FirecrawlAction[] | null;
}

/**
 * Acuity Scheduling Adapter
 */
class AcuityAdapter implements AvailabilityAdapter {
  name = "Acuity";

  extract(text: string, url: string): AdapterResult {
    const acuityUnavailable = [
      "no availability",
      "no times available",
      "this calendar has no available",
      "no appointments are available",
    ];

    for (const pattern of acuityUnavailable) {
      if (text.includes(pattern)) {
        return { status: "unavailable", nextSlotTime: null };
      }
    }

    const timeSlotPattern = /\d{1,2}:\d{2}\s*(am|pm)/gi;
    const matches = text.match(timeSlotPattern);

    if (matches && matches.length > 0) {
      const firstSlot = matches[0];
      const timeMatch = firstSlot.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      const nextSlotTime = timeMatch ? constructDateTimeFromMatch(timeMatch) : null;

      return { status: "available", nextSlotTime };
    }

    if (text.includes("select a time") || text.includes("choose a time")) {
      return { status: "available", nextSlotTime: null };
    }

    return {
      status: detectAvailability(text, url),
      nextSlotTime: extractNextSlot(text),
    };
  }
}

/**
 * Calendly Adapter
 * 
 * Calendly is a popular scheduling platform with specific patterns:
 * - Pages show available time slots when meetings can be booked
 * - "Select a Date & Time" indicates the calendar is active
 * - Empty calendars show specific unavailable messages
 * 
 * Calendly pages are JavaScript-heavy, so we use waitFor and look for
 * specific Calendly UI patterns.
 */
class CalendlyAdapter implements AvailabilityAdapter {
  name = "Calendly";

  extract(text: string, url: string): AdapterResult {
    // Calendly-specific unavailable patterns
    const calendlyUnavailable = [
      "no times are available",
      "this link is no longer active",
      "this calendly link is no longer active",
      "page not found",
      "this event type is not available",
      "calendar owner has no availability",
      "no availability for this event",
      "there are no available times",
      "sorry, there are no times available",
    ];

    for (const pattern of calendlyUnavailable) {
      if (text.includes(pattern)) {
        return { status: "unavailable", nextSlotTime: null };
      }
    }

    // Calendly-specific available patterns
    const calendlyAvailable = [
      "select a date & time",
      "select a date and time",
      "pick a date",
      "choose a time",
      "select a time",
      "available times",
      "meeting duration",
      "min meeting",
      "minute meeting",
      "schedule event",
      "book a time",
    ];

    for (const pattern of calendlyAvailable) {
      if (text.includes(pattern)) {
        return { 
          status: "available", 
          nextSlotTime: extractNextSlot(text),
          interactionHint: "Select a date and time on Calendly"
        };
      }
    }

    // Look for time slot patterns (Calendly shows times like "9:00am", "2:30pm")
    const timeSlotPattern = /\d{1,2}:\d{2}\s*(am|pm)/gi;
    const matches = text.match(timeSlotPattern);

    if (matches && matches.length >= 2) {
      // Multiple time slots suggest availability
      const firstSlot = matches[0];
      const timeMatch = firstSlot.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      const nextSlotTime = timeMatch ? constructDateTimeFromMatch(timeMatch) : null;

      return { status: "available", nextSlotTime };
    }

    // Check for calendar/date indicators
    if (text.includes("calendly") && (text.includes("calendar") || text.includes("schedule"))) {
      return { 
        status: "available", 
        nextSlotTime: null,
        interactionHint: "Visit Calendly page to see available times"
      };
    }

    // Fall back to generic detection
    const status = detectAvailability(text, url);
    return {
      status,
      nextSlotTime: status === "available" ? extractNextSlot(text) : null,
    };
  }

  /**
   * Firecrawl actions to wait for Calendly's JavaScript to render
   */
  getActions(url: string): FirecrawlAction[] | null {
    return [
      // Wait for Calendly's React app to load
      { type: "wait", milliseconds: 3000 },
      // Scroll to ensure calendar is in view
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1000 },
      // Scrape the rendered content
      { type: "scrape" },
    ];
  }
}

/**
 * DMV Adapter (Enhanced with Actions)
 * 
 * DMV pages are complex - they often require:
 * 1. Selecting appointment type (REAL ID, license renewal, etc.)
 * 2. Selecting office location
 * 3. Then viewing availability
 * 
 * This adapter uses Firecrawl Actions to interact with the page.
 */
class DMVAdapter implements AvailabilityAdapter {
  name = "DMV";

  extract(text: string, url: string): AdapterResult {
    // DMV-specific DEFINITIVE unavailable patterns
    // These indicate the appointment system itself is unavailable
    const dmvDefinitiveUnavailable = [
      "no appointments available",
      "no available appointments", 
      "appointments are not available",
      "no appointment times",
      "appointment system is down",
      "scheduling system unavailable",
      "no dates available for",
      "all appointments are booked",
    ];

    for (const pattern of dmvDefinitiveUnavailable) {
      if (text.includes(pattern)) {
        return { status: "unavailable", nextSlotTime: null };
      }
    }

    // Note: "get in line is currently not available" is about the WALK-IN feature
    // NOT about scheduled appointments - so we don't treat it as unavailable

    // DMV-specific available patterns (appointment scheduling is available)
    const dmvAvailable = [
      "schedule your appointment",
      "book your appointment",
      "appointments to update",  // "Appointments to Update your REAL ID are Available"
      "real id update",          // REAL ID appointments section
      "select appointment type",
      "automobile",              // Drive test option
      "commercial",              // Commercial vehicle option
      "what would you like to do",
    ];

    for (const pattern of dmvAvailable) {
      if (text.includes(pattern)) {
        return { 
          status: "available", 
          nextSlotTime: extractNextSlot(text) 
        };
      }
    }

    // Check for interactive page (selection required)
    const interactivePatterns = [
      { pattern: "select appointment type", hint: "Select appointment type (REAL ID, license, etc.)" },
      { pattern: "what would you like to do", hint: "Select service type" },
      { pattern: "choose a service", hint: "Choose the service you need" },
      { pattern: "real id update", hint: "REAL ID appointments may be available" },
      { pattern: "automobile", hint: "Select vehicle type for drive test" },
      { pattern: "commercial", hint: "Commercial vehicle appointments available" },
    ];

    for (const { pattern, hint } of interactivePatterns) {
      if (text.includes(pattern)) {
        // DMV pages with selection options typically have availability
        // The user just needs to select what they want
        return {
          status: "available",
          nextSlotTime: null,
          interactionHint: hint,
        };
      }
    }

    // Check for office selection pages
    if (text.includes("select office") || text.includes("find office") || text.includes("office location")) {
      return {
        status: "available",
        nextSlotTime: null,
        interactionHint: "Select a DMV office to see available times",
      };
    }

    // Fall back to generic detection
    const status = detectAvailability(text, url);
    return {
      status,
      nextSlotTime: status === "available" ? extractNextSlot(text) : null,
    };
  }

  /**
   * Get Firecrawl actions to interact with DMV appointment page.
   * These actions simulate user interaction to reveal availability.
   */
  getActions(url: string): FirecrawlAction[] | null {
    // California DMV specific actions
    if (url.includes("dmv.ca.gov")) {
      return [
        // Wait for page to load
        { type: "wait", milliseconds: 2000 },
        // Scroll to see appointment options
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        // Try to click on REAL ID Update option if present
        { type: "executeJavascript", script: `
          // Try to find and click appointment type options
          const realIdOption = document.querySelector('[data-appointment-type="REAL_ID"]');
          if (realIdOption) realIdOption.click();
          
          // Or look for any checkbox/radio that might reveal availability
          const options = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
          if (options.length > 0) options[0].click();
          
          return { clicked: options.length > 0 };
        `},
        { type: "wait", milliseconds: 2000 },
        // Scrape the resulting content
        { type: "scrape" },
      ];
    }

    // Generic DMV actions
    return [
      { type: "wait", milliseconds: 2000 },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1000 },
      { type: "scrape" },
    ];
  }
}

/**
 * Generic Adapter (Fallback)
 */
class GenericAdapter implements AvailabilityAdapter {
  name = "Generic";

  extract(text: string, url: string): AdapterResult {
    const status = detectAvailability(text, url);
    const nextSlotTime = status === "available" ? extractNextSlot(text) : null;

    return { status, nextSlotTime };
  }
}

// Adapter registry
const adapters: Record<string, AvailabilityAdapter> = {
  acuity: new AcuityAdapter(),
  calendly: new CalendlyAdapter(),
  dmv: new DMVAdapter(),
  generic: new GenericAdapter(),
  unknown: new GenericAdapter(),
  microsoft: new GenericAdapter(),
};

/**
 * Auto-detect platform from URL if not specified
 */
function detectPlatformFromUrl(url: string): string | null {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes("calendly.com")) return "calendly";
  if (urlLower.includes("acuityscheduling.com") || urlLower.includes("acuity.")) return "acuity";
  if (urlLower.includes("dmv.") || urlLower.includes("/dmv/")) return "dmv";
  if (urlLower.includes("outlook.") || urlLower.includes("microsoft.")) return "microsoft";
  
  return null;
}

function getAdapter(type: string, url?: string): AvailabilityAdapter {
  // First try explicit type
  if (type && adapters[type.toLowerCase()]) {
    return adapters[type.toLowerCase()];
  }
  
  // Auto-detect from URL
  if (url) {
    const detected = detectPlatformFromUrl(url);
    if (detected && adapters[detected]) {
      return adapters[detected];
    }
  }
  
  return adapters.generic;
}

// ============================================================================
// Basic Fetch Fallback
// ============================================================================

async function basicFetch(url: string): Promise<{ markdown: string; html: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PingSlot-Monitor/1.0 (Appointment Availability Checker)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[BasicFetch] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const markdown = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return { markdown, html };
  } catch (error) {
    console.error(`[BasicFetch] Error fetching ${url}:`, error);
    return null;
  }
}

// ============================================================================
// Main Checker Function (Enhanced with Actions)
// ============================================================================

/**
 * Checks availability for a single target.
 * 
 * Enhanced flow:
 * 1. Try basic Firecrawl scrape
 * 2. If result is unclear/interactive, try with Actions
 * 3. Extract availability using appropriate adapter
 * 
 * IMPORTANT CONSTRAINTS:
 * - ONLY fetches the exact bookingUrl provided
 * - NEVER crawls, follows links, or discovers URLs
 */
export async function checkTargetAvailability(target: Target): Promise<ExtractionResult> {
  const { id, name, bookingUrl, type, platform } = target;
  const adapterType = platform || type || "generic";

  console.log(`[Checker] Checking ${name} (${adapterType}): ${bookingUrl}`);

  try {
    let markdown: string | undefined;
    let html: string | undefined;
    let usedActions = false;

    const client = getFirecrawlClient();
    // Pass URL for auto-detection of platform (e.g., calendly.com → Calendly adapter)
    const adapter = getAdapter(adapterType, bookingUrl);

    if (client) {
      try {
        // First attempt: Basic scrape
        console.log(`[Checker] Using ${adapter.name} adapter for ${name}`);
        
        const result = await client.scrapeUrl(bookingUrl, {
          formats: ["markdown", "html"],
          waitFor: 2000, // Wait for JS to render
        });

        if (result.success) {
          markdown = result.markdown;
          html = result.html;

          // Check if we need to use actions (page requires interaction)
          const normalizedText = normalizeFirecrawlResult(markdown, html);
          const initialStatus = detectAvailability(normalizedText, bookingUrl);

          // If unclear or requires interaction, try with actions
          if ((initialStatus === "unknown" || initialStatus === "requires_interaction") && 
              adapter.getActions && 
              typeof adapter.getActions === "function") {
            
            const actions = adapter.getActions(bookingUrl);
            
            if (actions && actions.length > 0) {
              console.log(`[Checker] Initial status unclear, trying with ${actions.length} actions...`);
              
              try {
                const actionResult = await client.scrapeUrl(bookingUrl, {
                  formats: ["markdown", "html"],
                  actions: actions,
                  waitFor: 3000,
                });

                if (actionResult.success) {
                  // Use action result if it has more content
                  const actionText = normalizeFirecrawlResult(actionResult.markdown, actionResult.html);
                  if (actionText.length > normalizedText.length) {
                    markdown = actionResult.markdown;
                    html = actionResult.html;
                    usedActions = true;
                    console.log(`[Checker] Actions revealed more content (${actionText.length} vs ${normalizedText.length} chars)`);
                  }
                }
              } catch (actionError) {
                console.warn(`[Checker] Actions failed, using initial scrape:`, actionError);
              }
            }
          }
        } else {
          console.warn(`[Checker] Firecrawl returned no data for ${bookingUrl}`);
        }
      } catch (firecrawlError) {
        console.warn(`[Checker] Firecrawl error, falling back to basic fetch:`, firecrawlError);
      }
    }

    // Fallback to basic fetch
    if (!markdown && !html) {
      const basicResult = await basicFetch(bookingUrl);
      if (basicResult) {
        markdown = basicResult.markdown;
        html = basicResult.html;
      }
    }

    // Check if we got any content
    if (!markdown && !html) {
      return {
        status: "unknown",
        nextSlotTime: null,
        bookingLink: bookingUrl,
        rawText: "",
        error: "Failed to fetch page content",
      };
    }

    // Normalize and extract
    const normalizedText = normalizeFirecrawlResult(markdown, html);

    if (!normalizedText) {
      return {
        status: "unknown",
        nextSlotTime: null,
        bookingLink: bookingUrl,
        rawText: "",
        error: "Page content was empty after normalization",
      };
    }

    // Extract using adapter
    const { status, nextSlotTime, interactionHint } = adapter.extract(normalizedText, bookingUrl);

    console.log(`[Checker] ${name}: status=${status}, usedActions=${usedActions}`);

    return {
      status,
      nextSlotTime,
      bookingLink: bookingUrl,
      rawText: normalizedText.slice(0, 5000),
      interactionHint,
    };

  } catch (error) {
    console.error(`[Checker] Unexpected error checking ${name}:`, error);

    return {
      status: "unknown",
      nextSlotTime: null,
      bookingLink: bookingUrl,
      rawText: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ============================================================================
// Batch Checker
// ============================================================================

export async function checkMultipleTargets(
  targets: Target[]
): Promise<Map<string, ExtractionResult>> {
  const results = new Map<string, ExtractionResult>();

  for (const target of targets) {
    const result = await checkTargetAvailability(target);
    results.set(target.id, result);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

// ============================================================================
// Exports
// ============================================================================

export {
  normalizeFirecrawlResult,
  detectAvailability,
  extractNextSlot,
  detectInteractivePage,
  detectPlatformFromUrl,
  AcuityAdapter,
  CalendlyAdapter,
  DMVAdapter,
  GenericAdapter,
  getAdapter,
};

export default {
  checkTargetAvailability,
  checkMultipleTargets,
};
