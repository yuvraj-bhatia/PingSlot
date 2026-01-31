/**
 * Requirements extraction module
 * Extracts bullet points from PDF or HTML requirements pages
 */

const LOG_PREFIX = "[AADI]";

/**
 * Safely parse JSON from response, returning {} on failure
 */
async function safeJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Keywords that indicate a line is a requirement
 */
const REQUIREMENT_KEYWORDS = [
  "bring",
  "required",
  "documents",
  "fee",
  "payment",
  "photo",
  "id",
  "passport",
  "proof",
];

/**
 * Check if a URL points to a PDF
 */
function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

/**
 * Check content-type via HEAD request to detect PDF
 */
async function checkContentTypeForPdf(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type") || "";
    return contentType.toLowerCase().includes("pdf");
  } catch (err) {
    console.log(`${LOG_PREFIX} HEAD request failed, falling back to extension check`);
    return false;
  }
}

/**
 * Placeholder for Reducto API call
 * TODO: Replace with actual Reducto endpoint when available
 */
async function extractTextFromPdfViaReducto(pdfUrl: string): Promise<string> {
  const apiKey = process.env.REDUCTO_API_KEY;
  
  if (!apiKey) {
    console.log(`${LOG_PREFIX} REDUCTO_API_KEY not set, skipping PDF extraction`);
    return "";
  }

  try {
    // Reducto API endpoint - using their parse endpoint
    // Docs: https://docs.reducto.ai/
    const response = await fetch("https://platform.reducto.ai/parse", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_url: pdfUrl,
        // Request plain text output
        options: {
          output_format: "text",
        },
      }),
    });

    if (!response.ok) {
      console.log(`${LOG_PREFIX} Reducto API error: ${response.status}`);
      return "";
    }

    const data: any = await safeJson(response);
    
    // Extract text from response - adjust based on actual Reducto response structure
    // This is a placeholder structure; update when we know exact response format
    return data.text || data.content || data.result?.text || "";
  } catch (err) {
    console.log(`${LOG_PREFIX} Reducto API call failed:`, err);
    return "";
  }
}

/**
 * Fetch HTML content from URL
 */
async function fetchHtmlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`${LOG_PREFIX} Failed to fetch HTML: ${response.status}`);
      return "";
    }
    return await response.text();
  } catch (err) {
    console.log(`${LOG_PREFIX} HTML fetch failed:`, err);
    return "";
  }
}

/**
 * Strip HTML tags (crude regex approach)
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")   // Remove styles
    .replace(/<[^>]+>/g, " ")                          // Remove all tags
    .replace(/&nbsp;/g, " ")                           // Replace &nbsp;
    .replace(/&amp;/g, "&")                            // Replace &amp;
    .replace(/&lt;/g, "<")                             // Replace &lt;
    .replace(/&gt;/g, ">")                             // Replace &gt;
    .replace(/&quot;/g, '"')                           // Replace &quot;
    .replace(/&#39;/g, "'");                           // Replace &#39;
}

/**
 * Check if a line looks like a bullet point
 */
function isBulletLine(line: string): boolean {
  const trimmed = line.trim();
  
  // Check for bullet characters
  if (/^[-•*]\s/.test(trimmed)) return true;
  
  // Check for numbered lists (1., 2., etc.)
  if (/^\d+\.\s/.test(trimmed)) return true;
  
  return false;
}

/**
 * Check if a line contains requirement keywords
 */
function hasRequirementKeyword(line: string): boolean {
  const lower = line.toLowerCase();
  return REQUIREMENT_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Clean a bullet line
 */
function cleanBullet(line: string): string {
  return line
    .trim()
    .replace(/\s+/g, " ")           // Collapse multiple spaces
    .replace(/[.,;:!?]+$/, "");     // Remove trailing punctuation
}

/**
 * Extract bullets from text content
 */
function extractBulletsFromText(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const bullets: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Check if it's a bullet or contains keywords
    if (isBulletLine(trimmed) || hasRequirementKeyword(trimmed)) {
      const cleaned = cleanBullet(trimmed);
      
      // Skip if empty, too long, or duplicate
      if (!cleaned) continue;
      if (cleaned.length > 140) continue;
      if (seen.has(cleaned.toLowerCase())) continue;
      
      seen.add(cleaned.toLowerCase());
      bullets.push(cleaned);
      
      // Max 8 bullets
      if (bullets.length >= 8) break;
    }
  }

  return bullets;
}

/**
 * Get requirements bullets from a URL (PDF or HTML)
 * Never throws - always returns an array (possibly empty)
 */
export async function getRequirementsBullets(
  requirementsUrl?: string | null
): Promise<string[]> {
  try {
    // No URL provided
    if (!requirementsUrl) {
      console.log(`${LOG_PREFIX} No requirementsUrl provided, returning empty bullets`);
      return [];
    }

    console.log(`${LOG_PREFIX} Extracting requirements from: ${requirementsUrl}`);

    // Check if PDF
    let isPdf = isPdfUrl(requirementsUrl);
    
    if (!isPdf) {
      // Try HEAD request to check content-type
      isPdf = await checkContentTypeForPdf(requirementsUrl);
    }

    let text = "";

    if (isPdf) {
      console.log(`${LOG_PREFIX} Detected PDF, using Reducto`);
      text = await extractTextFromPdfViaReducto(requirementsUrl);
    } else {
      console.log(`${LOG_PREFIX} Detected HTML, fetching content`);
      const html = await fetchHtmlContent(requirementsUrl);
      text = stripHtmlTags(html);
    }

    if (!text) {
      console.log(`${LOG_PREFIX} No text extracted, returning empty bullets`);
      return [];
    }

    const bullets = extractBulletsFromText(text);
    console.log(`${LOG_PREFIX} Extracted ${bullets.length} bullets`);
    
    return bullets;
  } catch (err) {
    console.log(`${LOG_PREFIX} Error in getRequirementsBullets:`, err);
    return [];
  }
}

/*
 * ===============================
 * USAGE EXAMPLE (for testing)
 * ===============================
 * 
 * import { getRequirementsBullets } from './requirements';
 * 
 * // Test with HTML page
 * const bullets = await getRequirementsBullets('https://example.com/requirements.html');
 * console.log(bullets);
 * // Expected: ['Bring valid photo ID', 'Payment required at time of appointment', ...]
 * 
 * // Test with PDF (requires REDUCTO_API_KEY)
 * const pdfBullets = await getRequirementsBullets('https://example.com/docs/requirements.pdf');
 * console.log(pdfBullets);
 * 
 * // Test with no URL
 * const empty = await getRequirementsBullets(null);
 * console.log(empty); // []
 */
