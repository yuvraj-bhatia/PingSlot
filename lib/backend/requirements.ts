/**
 * Requirements Enrichment Module (On-Demand Only)
 * 
 * ============================================================================
 * USER FLOW STEP 6: Requirements parsed ONLY when user opens detail page
 * ============================================================================
 * 
 * WHY REQUIREMENTS ARE PARSED ON-DEMAND:
 * - Reducto API calls are expensive (PDF parsing costs money)
 * - Most users won't view every appointment's requirements
 * - Parsing during check would slow down the entire pipeline
 * - Better UX: fast check results, then load requirements when needed
 * 
 * WHEN REQUIREMENTS ARE EXTRACTED:
 * 1. User opens appointment detail page → parse if not cached
 * 2. Email is about to be sent AND includeRequirements=true → parse if not cached
 * 3. NEVER during search or check pipeline
 * 
 * EXTRACTION SOURCES:
 * - PDF documents → Reducto API (if configured)
 * - HTML pages → Firecrawl markdown extraction
 * 
 * CACHING:
 * - Results cached in database (Target.requirementsBullets)
 * - Cache keyed by URL hash (Target.requirementsHash)
 * - Cache is reused across sessions
 */

import config from "./config";
import prisma from "./db";
import { createHash } from "crypto";

export type RequirementsResult = {
  bullets: string[];
  source: "pdf" | "html" | "cached" | "none";
  error?: string;
  /** Time taken to extract (0 if cached) */
  extractionTimeMs?: number;
};

// ============================================================================
// PDF Extraction (Reducto Integration)
// ============================================================================

interface ReductoResponse {
  success: boolean;
  data?: {
    text?: string;
    chunks?: { text: string }[];
  };
  error?: string;
}

/**
 * Extract text from PDF using Reducto API.
 * 
 * WHY REDUCTO:
 * - Best-in-class PDF text extraction
 * - Handles complex layouts (tables, columns)
 * - Returns structured text suitable for bullet extraction
 * 
 * COST CONSIDERATION:
 * - Reducto charges per page/document
 * - That's why we cache aggressively and only extract on-demand
 */
async function extractFromPdfWithReducto(url: string): Promise<string | null> {
  if (!config.reductoApiKey) {
    console.warn("[Requirements] No Reducto API key configured - PDF extraction unavailable");
    return null;
  }

  console.log(`[Requirements] Calling Reducto API for PDF: ${url}`);

  try {
    const response = await fetch("https://api.reducto.ai/v1/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.reductoApiKey}`,
      },
      body: JSON.stringify({
        url,
        output_format: "text",
      }),
    });

    if (!response.ok) {
      console.error(`[Requirements] Reducto error: ${response.status}`);
      return null;
    }

    const result: ReductoResponse = await response.json();

    if (!result.success || !result.data) {
      console.error("[Requirements] Reducto returned unsuccessful:", result.error);
      return null;
    }

    return result.data.text || result.data.chunks?.map((c) => c.text).join("\n") || null;
  } catch (error) {
    console.error("[Requirements] Reducto request failed:", error);
    return null;
  }
}

// ============================================================================
// HTML Extraction
// ============================================================================

/**
 * Extract text from HTML page.
 * Uses Firecrawl if available, falls back to basic fetch.
 */
async function extractFromHtml(url: string): Promise<string | null> {
  try {
    // Use Firecrawl if available (better JS rendering)
    if (config.firecrawlApiKey) {
      console.log(`[Requirements] Using Firecrawl for HTML: ${url}`);
      
      const response = await fetch(`${config.firecrawlBaseUrl}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.firecrawlApiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.markdown) {
          return result.data.markdown;
        }
      }
    }

    // Fallback to basic fetch
    console.log(`[Requirements] Using basic fetch for HTML: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PingSlot-Monitor/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    // Basic HTML to text conversion
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("[Requirements] HTML extraction failed:", error);
    return null;
  }
}

// ============================================================================
// Bullet Point Extraction
// ============================================================================

/**
 * Extract requirement bullet points from text.
 * Looks for lists, numbered items, and "bring" / "need" / "required" phrases.
 */
function extractBullets(text: string): string[] {
  const bullets: string[] = [];
  const seen = new Set<string>();

  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);

  // Patterns for list items
  const listPatterns = [
    /^[-•*]\s*(.+)$/,           // Bullet points
    /^\d+[.)]\s*(.+)$/,         // Numbered lists
    /^[a-z][.)]\s*(.+)$/i,      // Letter lists
    /^✓\s*(.+)$/,               // Checkmarks
  ];

  // Keywords that indicate requirements
  const requirementKeywords = [
    "bring",
    "need",
    "required",
    "must have",
    "necessary",
    "provide",
    "present",
    "show",
    "proof of",
    "valid",
    "original",
    "copy of",
    "document",
    "id",
    "identification",
  ];

  for (const line of lines) {
    // Check if it's a list item
    for (const pattern of listPatterns) {
      const match = line.match(pattern);
      if (match) {
        const item = match[1].trim();
        if (item.length > 5 && item.length < 200 && !seen.has(item.toLowerCase())) {
          bullets.push(item);
          seen.add(item.toLowerCase());
        }
        break;
      }
    }

    // Check for requirement keywords in non-list lines
    if (bullets.length < 8) {
      const lowerLine = line.toLowerCase();
      const hasKeyword = requirementKeywords.some((kw) => lowerLine.includes(kw));
      
      if (hasKeyword && line.length > 10 && line.length < 200) {
        const cleaned = line
          .replace(/^[-•*\d.)\s]+/, "")
          .replace(/[:;,]$/, "")
          .trim();
        
        if (cleaned.length > 10 && !seen.has(cleaned.toLowerCase())) {
          bullets.push(cleaned);
          seen.add(cleaned.toLowerCase());
        }
      }
    }
  }

  // Limit to 8 bullets max
  return bullets.slice(0, 8);
}

// ============================================================================
// Cache Helpers
// ============================================================================

function generateUrlHash(url: string): string {
  return createHash("md5").update(url).digest("hex");
}

// ============================================================================
// Main Requirements Extraction (On-Demand)
// ============================================================================

/**
 * Extract requirements from a URL.
 * 
 * ============================================================================
 * CRITICAL: This is called ON-DEMAND only, not during search or check.
 * ============================================================================
 * 
 * WHEN TO CALL:
 * - User opens appointment detail page (GET /api/targets/:id)
 * - Email is about to be sent AND includeRequirements=true
 * 
 * WHEN NOT TO CALL:
 * - During /api/search (returns cached results only)
 * - During /api/check (unless sending email with requirements)
 * 
 * @param targetId - The target to update with requirements
 * @param requirementsUrl - URL to the requirements page/PDF
 * @param forceRefresh - Force re-extraction even if cached
 */
export async function extractRequirements(
  targetId: string,
  requirementsUrl: string,
  forceRefresh = false
): Promise<RequirementsResult> {
  const startTime = Date.now();

  // Check cache first (unless forced refresh)
  if (!forceRefresh) {
    const cached = await getCachedRequirements(targetId);
    if (cached !== null) {
      const target = await prisma.target.findUnique({
        where: { id: targetId },
        select: { requirementsHash: true },
      });
      
      const urlHash = generateUrlHash(requirementsUrl);
      
      // Only use cache if URL hash matches (same requirements URL)
      if (target?.requirementsHash === urlHash) {
        console.log(`[Requirements] Using cached requirements for target ${targetId}`);
        return {
          bullets: cached,
          source: "cached",
          extractionTimeMs: 0,
        };
      }
    }
  }

  console.log(`[Requirements] Extracting requirements on-demand for target ${targetId}`);

  // Determine if it's a PDF
  const isPdf = requirementsUrl.toLowerCase().endsWith(".pdf") ||
    requirementsUrl.toLowerCase().includes("/pdf/") ||
    requirementsUrl.toLowerCase().includes("type=pdf");

  let text: string | null = null;

  if (isPdf) {
    text = await extractFromPdfWithReducto(requirementsUrl);
    if (!text) {
      return {
        bullets: [],
        source: "pdf",
        error: "PDF extraction not available (Reducto API key required)",
        extractionTimeMs: Date.now() - startTime,
      };
    }
  } else {
    text = await extractFromHtml(requirementsUrl);
  }

  if (!text) {
    return {
      bullets: [],
      source: "none",
      error: "Could not extract content from URL",
      extractionTimeMs: Date.now() - startTime,
    };
  }

  // Extract bullet points
  const bullets = extractBullets(text);

  // Cache the results
  const urlHash = generateUrlHash(requirementsUrl);
  await prisma.target.update({
    where: { id: targetId },
    data: {
      requirementsBullets: JSON.stringify(bullets),
      requirementsHash: urlHash,
    },
  });

  const extractionTimeMs = Date.now() - startTime;
  console.log(`[Requirements] Extracted ${bullets.length} bullets in ${extractionTimeMs}ms`);

  return {
    bullets,
    source: isPdf ? "pdf" : "html",
    extractionTimeMs,
  };
}

/**
 * Get cached requirements for a target.
 * 
 * IMPORTANT: This does NOT trigger extraction.
 * Use this for displaying requirements that were previously extracted.
 */
export async function getCachedRequirements(targetId: string): Promise<string[] | null> {
  const target = await prisma.target.findUnique({
    where: { id: targetId },
    select: { requirementsBullets: true },
  });

  if (!target?.requirementsBullets) {
    return null;
  }

  try {
    return JSON.parse(target.requirementsBullets) as string[];
  } catch {
    return null;
  }
}

/**
 * Check if requirements are cached for a target.
 */
export async function hasRequirementsCache(targetId: string): Promise<boolean> {
  const cached = await getCachedRequirements(targetId);
  return cached !== null;
}

/**
 * Invalidate cached requirements for a target.
 * Call this if the requirements URL changes.
 */
export async function invalidateRequirementsCache(targetId: string): Promise<void> {
  await prisma.target.update({
    where: { id: targetId },
    data: {
      requirementsBullets: null,
      requirementsHash: null,
    },
  });
}

export default {
  extractRequirements,
  getCachedRequirements,
  hasRequirementsCache,
  invalidateRequirementsCache,
};
