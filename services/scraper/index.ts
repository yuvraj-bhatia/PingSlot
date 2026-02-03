import { scrapeUrl, validateUrl } from './firecrawl';
import { analyzeAvailability, preprocessForPlatform } from './analyzer';
import { computeDiff } from './differ';
import type {
  ScraperService,
  ScrapeResult,
  AvailabilityResult,
  DiffResult,
} from './types';

// Re-export types
export * from './types';

/**
 * Main scraper service implementation
 */
class ScraperServiceImpl implements ScraperService {
  /**
   * Scrape a URL and return content
   */
  async scrape(url: string): Promise<ScrapeResult> {
    // Validate URL first
    const validation = await validateUrl(url);
    if (!validation.valid) {
      return {
        success: false,
        content: '',
        error: validation.error,
      };
    }

    return scrapeUrl(url);
  }

  /**
   * Analyze scraped content for availability
   */
  async analyzeAvailability(
    content: string,
    platform: string
  ): Promise<AvailabilityResult> {
    // Preprocess content based on platform
    const processedContent = preprocessForPlatform(content, platform);
    return analyzeAvailability(processedContent, platform);
  }

  /**
   * Compute diff between content versions
   */
  async computeDiff(current: string, previous: string): Promise<DiffResult> {
    return computeDiff(current, previous);
  }

  /**
   * Determine if notification should be sent based on analysis
   */
  shouldNotify(current: AvailabilityResult, previous: AvailabilityResult | null): boolean {
    // Don't notify if currently unavailable
    if (!current.hasAvailability) {
      return false;
    }

    // Notify if this is the first check with availability
    if (!previous) {
      return true;
    }

    // Notify if was unavailable, now available
    if (!previous.hasAvailability && current.hasAvailability) {
      return true;
    }

    // Notify if new slots appeared
    if (previous.hasAvailability && current.hasAvailability) {
      const previousSlotTimes = new Set(
        previous.slots.map((s) => s.datetime.toLowerCase())
      );

      const hasNewSlots = current.slots.some(
        (slot) => !previousSlotTimes.has(slot.datetime.toLowerCase())
      );

      if (hasNewSlots) {
        return true;
      }
    }

    return false;
  }

  /**
   * Full check workflow: scrape -> analyze -> diff -> decide
   */
  async performCheck(
    url: string,
    platform: string,
    previousContent?: string,
    previousAnalysis?: AvailabilityResult
  ): Promise<{
    scrape: ScrapeResult;
    analysis: AvailabilityResult | null;
    diff: DiffResult | null;
    shouldNotify: boolean;
  }> {
    // Step 1: Scrape
    const scrape = await this.scrape(url);

    if (!scrape.success) {
      return {
        scrape,
        analysis: null,
        diff: null,
        shouldNotify: false,
      };
    }

    // Step 2: Analyze
    const analysis = await this.analyzeAvailability(scrape.content, platform);

    // Step 3: Diff (if we have previous content)
    const diff = previousContent
      ? await this.computeDiff(scrape.content, previousContent)
      : null;

    // Step 4: Decide on notification
    const notify = this.shouldNotify(analysis, previousAnalysis || null);

    return {
      scrape,
      analysis,
      diff,
      shouldNotify: notify,
    };
  }
}

// Export singleton instance
export const scraperService = new ScraperServiceImpl();

// Export class for testing
export { ScraperServiceImpl };
