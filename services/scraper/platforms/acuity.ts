/**
 * Acuity-specific scraper helpers.
 * This module provides light preprocessing for scraped content.
 */

export function preprocessAcuityContent(content: string): string {
  return content
    .replace(/Powered by Acuity Scheduling/gi, "")
    .replace(/Scheduling by Acuity/gi, "")
    .replace(/\bPST\b|\bEST\b|\bCST\b|\bMST\b/gi, (match) => `[${match}]`)
    .trim();
}

export default {
  preprocessAcuityContent,
};
