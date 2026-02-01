/**
 * LLM-Enhanced Availability Extractor
 * 
 * Pipeline: Firecrawl → Normalize → LLM → Structured JSON
 * 
 * STRICT RULES (ENFORCED):
 * 1. LLM NEVER fetches URLs or browses the web
 * 2. LLM ONLY processes text already returned by Firecrawl
 * 3. Firecrawl ONLY called with scrapeUrl() on explicit URLs from database
 * 4. LLM outputs STRICT JSON and nothing else
 * 5. No hallucination, guessing, or inferred data
 */

import Groq from "groq-sdk";
import FirecrawlApp from "@mendable/firecrawl-js";

// ============================================================================
// Types
// ============================================================================

/**
 * Structured output from LLM extraction.
 * This is the ONLY format the LLM can return.
 */
export type LLMExtractionResult = {
  availability_status: "available" | "unavailable" | "unknown" | "requires_interaction";
  next_available_slot: string | null;
  location: string | null;
  /** Hint for what interaction is needed (if requires_interaction) */
  interaction_hint?: string | null;
};

/**
 * Full pipeline result including metadata.
 */
export type PipelineResult = {
  targetId: string;
  targetName: string;
  bookingUrl: string;
  extraction: LLMExtractionResult;
  rawTextLength: number;
  processingTimeMs: number;
  error?: string;
};

/**
 * Target input for the pipeline.
 */
export type PipelineTarget = {
  id: string;
  name: string;
  bookingUrl: string;
};

// ============================================================================
// Configuration
// ============================================================================

import config from "./config";

const GROQ_API_KEY = config.groqApiKey;
const FIRECRAWL_API_KEY = config.firecrawlApiKey;

// Groq model to use (fast and accurate for structured extraction)
const GROQ_MODEL = config.groqModel;

// Maximum text length to send to LLM (to avoid token limits)
const MAX_TEXT_LENGTH = 8000;

// ============================================================================
// Client Initialization
// ============================================================================

let groqClient: Groq | null = null;
let firecrawlClient: FirecrawlApp | null = null;

/**
 * Gets or creates the Groq client.
 */
function getGroqClient(): Groq {
  if (!groqClient) {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Gets or creates the Firecrawl client.
 */
function getFirecrawlClient(): FirecrawlApp | null {
  if (!firecrawlClient && FIRECRAWL_API_KEY) {
    firecrawlClient = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }
  return firecrawlClient;
}

// ============================================================================
// Step 1: Firecrawl Fetch Helper
// ============================================================================

/**
 * Fetches page content using Firecrawl scrapeUrl().
 * 
 * IMPORTANT: This function ONLY accepts explicit URLs from the database.
 * It NEVER crawls, follows links, or discovers new URLs.
 * 
 * @param url - The explicit URL to fetch (must be from database)
 * @returns Markdown content or null on failure
 */
async function fetchWithFirecrawl(url: string): Promise<string | null> {
  const client = getFirecrawlClient();

  if (!client) {
    console.warn("[LLM-Pipeline] Firecrawl not configured, using basic fetch");
    return basicFetch(url);
  }

  try {
    // ONLY use scrapeUrl() - NEVER crawl(), search(), or followLinks()
    const result = await client.scrapeUrl(url, {
      formats: ["markdown"],
    });

    if (result.success && result.markdown) {
      return result.markdown;
    }

    console.warn(`[LLM-Pipeline] Firecrawl returned no markdown for ${url}`);
    return null;
  } catch (error) {
    console.error(`[LLM-Pipeline] Firecrawl error for ${url}:`, error);
    return basicFetch(url);
  }
}

/**
 * Fallback fetch using native fetch API.
 * Used when Firecrawl is not available.
 */
async function basicFetch(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PingSlot-Monitor/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Basic HTML to text conversion
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  } catch (error) {
    console.error(`[LLM-Pipeline] Basic fetch error for ${url}:`, error);
    return null;
  }
}

// ============================================================================
// Step 2: Text Normalization
// ============================================================================

/**
 * Normalizes Firecrawl markdown text for LLM processing.
 * 
 * - Converts to lowercase for consistent matching
 * - Removes URLs (LLM should not see external links)
 * - Removes excessive whitespace
 * - Truncates to max length to avoid token limits
 * 
 * @param text - Raw markdown from Firecrawl
 * @returns Normalized text ready for LLM
 */
export function normalizeFirecrawlText(text: string): string {
  if (!text) return "";

  let normalized = text
    // Convert to lowercase
    .toLowerCase()
    // Remove URLs (LLM should not see external links)
    .replace(/https?:\/\/[^\s)]+/g, "[link]")
    // Remove markdown link syntax but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove image references
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    // Remove excessive whitespace
    .replace(/\s+/g, " ")
    // Remove special markdown characters
    .replace(/[#*_~`]/g, "")
    .trim();

  // Truncate to max length
  if (normalized.length > MAX_TEXT_LENGTH) {
    normalized = normalized.slice(0, MAX_TEXT_LENGTH) + "...";
  }

  return normalized;
}

// ============================================================================
// Step 3: LLM Extraction
// ============================================================================

/**
 * The system prompt for the LLM.
 * 
 * CRITICAL: The LLM is instructed to:
 * - ONLY extract facts from the provided text
 * - NEVER hallucinate or guess
 * - Return STRICT JSON format
 * - Detect pages that require user interaction
 */
const SYSTEM_PROMPT = `You are a precise data extraction assistant. Your ONLY job is to extract appointment availability information from the provided text.

STRICT RULES:
1. You must ONLY analyze the text provided - do NOT use any external knowledge
2. You must NEVER invent, guess, or hallucinate dates, times, or information
3. You must return ONLY valid JSON - no explanations, no prose, no markdown
4. If information is unclear or missing, use null

OUTPUT FORMAT (return EXACTLY this JSON structure):
{
  "availability_status": "available" | "unavailable" | "unknown" | "requires_interaction",
  "next_available_slot": string | null,
  "location": string | null,
  "interaction_hint": string | null
}

EXTRACTION RULES:
- availability_status:
  - "unavailable" if text clearly says "no appointments", "no availability", "fully booked", "sold out", "not available"
  - "available" if text shows specific dates/times, "book now", "schedule", available slots, or appointment options to choose from
  - "requires_interaction" if the page shows forms, dropdowns, checkboxes, or selection options that must be filled before availability is shown (e.g., "select appointment type", "choose a service", "select office location")
  - "unknown" if unclear or insufficient information

- next_available_slot:
  - Extract the EARLIEST mentioned date/time if appointments are available
  - Format as ISO 8601 if possible (e.g., "2026-02-15T09:00:00")
  - Use null if no specific time can be extracted
  - NEVER invent a date - only extract what's explicitly stated

- location:
  - Extract city, state, or office name if mentioned
  - Use null if no location is specified

- interaction_hint:
  - If requires_interaction, describe what the user needs to do (e.g., "Select appointment type", "Choose office location")
  - Use null if not applicable

IMPORTANT: For DMV and government appointment pages, if you see options like "REAL ID", "Driver License", "Vehicle Registration", etc., this usually means appointments ARE available - the user just needs to select what they want. Return "available" in these cases.

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`;

/**
 * Extracts availability information using Groq LLM.
 * 
 * IMPORTANT: The LLM ONLY processes text already fetched by Firecrawl.
 * It NEVER fetches URLs or browses the web.
 * 
 * @param normalizedText - Pre-processed text from Firecrawl (no URLs)
 * @returns Structured extraction result
 */
export async function extractAvailabilityWithLLM(
  normalizedText: string
): Promise<LLMExtractionResult> {
  // Default result for failures
  const defaultResult: LLMExtractionResult = {
    availability_status: "unknown",
    next_available_slot: null,
    location: null,
    interaction_hint: null,
  };

  if (!normalizedText || normalizedText.length < 50) {
    console.warn("[LLM-Pipeline] Text too short for meaningful extraction");
    return defaultResult;
  }

  try {
    const groq = getGroqClient();

    // Call Groq API with strict JSON mode
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Extract appointment availability from this text:\n\n${normalizedText}`,
        },
      ],
      temperature: 0, // Deterministic output
      max_tokens: 200, // Short response expected
      response_format: { type: "json_object" }, // Enforce JSON output
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      console.warn("[LLM-Pipeline] Empty response from Groq");
      return defaultResult;
    }

    // Parse and validate JSON response
    const parsed = JSON.parse(responseText);

    // Validate the structure
    const result: LLMExtractionResult = {
      availability_status: validateStatus(parsed.availability_status),
      next_available_slot: validateSlot(parsed.next_available_slot),
      location: typeof parsed.location === "string" ? parsed.location : null,
      interaction_hint: typeof parsed.interaction_hint === "string" ? parsed.interaction_hint : null,
    };

    return result;
  } catch (error) {
    console.error("[LLM-Pipeline] LLM extraction error:", error);
    return defaultResult;
  }
}

/**
 * Validates the availability status value.
 */
function validateStatus(
  status: unknown
): "available" | "unavailable" | "unknown" | "requires_interaction" {
  if (status === "available" || status === "unavailable" || status === "requires_interaction") {
    return status;
  }
  return "unknown";
}

/**
 * Validates and normalizes the slot time.
 */
function validateSlot(slot: unknown): string | null {
  if (typeof slot !== "string" || !slot) {
    return null;
  }

  // Try to parse as date to validate
  try {
    const date = new Date(slot);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Not a valid date
  }

  // Return as-is if it looks like a date string
  if (/\d{4}|\d{1,2}[\/\-]\d{1,2}|\d{1,2}:\d{2}/.test(slot)) {
    return slot;
  }

  return null;
}

// ============================================================================
// Step 4: Full Pipeline
// ============================================================================

/**
 * Complete pipeline: Firecrawl → Normalize → LLM → Structured Result
 * 
 * STRICT CONSTRAINTS:
 * 1. ONLY fetches the explicit URL provided (from database)
 * 2. NEVER crawls, follows links, or discovers URLs
 * 3. LLM ONLY processes pre-fetched text
 * 4. Returns STRICT JSON structure
 * 
 * @param target - Target with explicit bookingUrl from database
 * @returns Structured pipeline result
 */
export async function checkTargetAvailabilityWithLLM(
  target: PipelineTarget
): Promise<PipelineResult> {
  const startTime = Date.now();

  console.log(`[LLM-Pipeline] Processing: ${target.name}`);
  console.log(`[LLM-Pipeline] URL: ${target.bookingUrl}`);

  try {
    // Step 1: Fetch with Firecrawl (ONLY this explicit URL)
    const rawText = await fetchWithFirecrawl(target.bookingUrl);

    if (!rawText) {
      return {
        targetId: target.id,
        targetName: target.name,
        bookingUrl: target.bookingUrl,
        extraction: {
          availability_status: "unknown",
          next_available_slot: null,
          location: null,
          interaction_hint: null,
        },
        rawTextLength: 0,
        processingTimeMs: Date.now() - startTime,
        error: "Failed to fetch page content",
      };
    }

    // Step 2: Normalize text (remove URLs, lowercase, truncate)
    const normalizedText = normalizeFirecrawlText(rawText);

    console.log(`[LLM-Pipeline] Normalized text length: ${normalizedText.length}`);

    // Step 3: Extract with LLM (processes ONLY the pre-fetched text)
    const extraction = await extractAvailabilityWithLLM(normalizedText);

    console.log(`[LLM-Pipeline] Extraction result:`, extraction);

    // Step 4: Return structured result
    return {
      targetId: target.id,
      targetName: target.name,
      bookingUrl: target.bookingUrl,
      extraction,
      rawTextLength: normalizedText.length,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`[LLM-Pipeline] Pipeline error for ${target.name}:`, error);

    return {
      targetId: target.id,
      targetName: target.name,
      bookingUrl: target.bookingUrl,
      extraction: {
        availability_status: "unknown",
        next_available_slot: null,
        location: null,
        interaction_hint: null,
      },
      rawTextLength: 0,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Processes multiple targets sequentially.
 * 
 * @param targets - Array of targets (from database ONLY)
 * @returns Array of pipeline results
 */
export async function checkMultipleTargetsWithLLM(
  targets: PipelineTarget[]
): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];

  for (const target of targets) {
    const result = await checkTargetAvailabilityWithLLM(target);
    results.push(result);

    // Small delay between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  checkTargetAvailabilityWithLLM,
  checkMultipleTargetsWithLLM,
  normalizeFirecrawlText,
  extractAvailabilityWithLLM,
};
