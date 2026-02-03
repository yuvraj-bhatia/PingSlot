import Firecrawl from '@mendable/firecrawl-js';
import type { ScrapeResult } from './types';

// Initialize Firecrawl client
const getFirecrawlClient = () => {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }
  return new Firecrawl({ apiKey });
};

/**
 * Scrape a URL using Firecrawl
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const firecrawl = getFirecrawlClient();

    const response: any = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 3000, // Wait for dynamic content
      timeout: 30000,
    });

    const payload = response?.data ?? response;
    const success = typeof response?.success === 'boolean' ? response.success : Boolean(payload);

    if (!success) {
      return {
        success: false,
        content: '',
        error: response?.error || payload?.error || 'Scrape failed - unknown error',
      };
    }

    // Clean and normalize the content
    const content = cleanContent(payload?.markdown || payload?.html || '');

    return {
      success: true,
      content,
      html: payload?.html,
      screenshot: payload?.screenshot,
      metadata: {
        title: payload?.metadata?.title,
        description: payload?.metadata?.description,
        url,
      },
    };
  } catch (error) {
    console.error('Firecrawl scrape error:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown scraping error',
    };
  }
}

/**
 * Clean scraped content for better AI analysis
 */
function cleanContent(content: string): string {
  return content
    // Remove excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    // Remove common boilerplate
    .replace(/cookie\s*(policy|notice|consent)/gi, '')
    .replace(/privacy\s*policy/gi, '')
    .replace(/terms\s*(of\s*service|and\s*conditions)/gi, '')
    // Normalize quotes
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();
}

/**
 * Validate if a URL is scrapeable
 */
export async function validateUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const urlObj = new URL(url);

    // Must be HTTPS
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' };
    }

    // Try a lightweight fetch to check if accessible
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'PingSlot/1.0' },
    });

    if (!response.ok) {
      return { valid: false, error: `URL returned status ${response.status}` };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid URL',
    };
  }
}
