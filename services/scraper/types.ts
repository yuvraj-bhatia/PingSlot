import type { Platform } from '@/lib/types';

export interface ScraperService {
  /**
   * Scrape a URL and return cleaned content
   */
  scrape(url: string): Promise<ScrapeResult>;

  /**
   * Analyze content for appointment availability using AI
   */
  analyzeAvailability(content: string, platform: Platform | string): Promise<AvailabilityResult>;

  /**
   * Compute diff between current and previous content
   */
  computeDiff(current: string, previous: string): Promise<DiffResult>;

  /**
   * Determine if a notification should be sent
   */
  shouldNotify(
    current: AvailabilityResult,
    previous: AvailabilityResult | null
  ): boolean;
}

export interface ScrapeResult {
  success: boolean;
  content: string; // Cleaned content
  html?: string; // Raw HTML (optional)
  screenshot?: string; // Base64 screenshot (optional)
  metadata?: {
    title?: string;
    description?: string;
    url: string;
  };
  error?: string;
}

export interface AvailabilityResult {
  hasAvailability: boolean;
  confidence: number; // 0.0 to 1.0
  slots: SlotInfo[];
  reasoning: string; // AI explanation
  rawAnalysis?: unknown; // Full AI response for debugging
}

export interface SlotInfo {
  datetime: string; // ISO string or descriptive
  location?: string;
  type?: string; // Appointment type
  rawText: string; // Exact text from page
}

export interface DiffResult {
  hasChanges: boolean;
  changes: string; // Human-readable diff summary
  addedContent?: string;
  removedContent?: string;
  significantChange: boolean; // True if likely affects availability
}
