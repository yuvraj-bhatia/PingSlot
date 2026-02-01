/**
 * Backend Module Index
 * 
 * Central export for all backend functionality.
 * Import from here for clean access to all services.
 * 
 * ============================================================================
 * ARCHITECTURE SUMMARY (Demo-Driven User Flow)
 * ============================================================================
 * 
 * 1. SEARCH (Cache-First, No Scraping)
 *    - /api/search and /api/search-location return cached results instantly
 *    - Marks stale/uncached targets as "checking"
 *    - Returns targetsNeedingCheck for UI to trigger /api/check
 * 
 * 2. CHECK (Firecrawl for Stale/Missing Only)
 *    - /api/check runs Firecrawl ONLY for stale/missing targets
 *    - Fresh cached results are returned immediately
 *    - forceRefresh=true ignores cache
 * 
 * 3. REQUIREMENTS (On-Demand Only)
 *    - Reducto is called ONLY when user opens detail page
 *    - OR when sending email with includeRequirements=true
 *    - NEVER during search or check
 * 
 * 4. EMAIL (After Check Results)
 *    - Sent AFTER check results are finalized
 *    - Uses latest availability
 *    - Uses cached or newly parsed requirements
 */

// Database
export { prisma } from "./db";

// Configuration
export { config, validateConfig } from "./config";

// Firecrawl Checker (Safe, Deterministic URL Fetching)
export {
  checkTargetAvailability,
  checkMultipleTargets,
  normalizeFirecrawlResult,
  detectAvailability,
  extractNextSlot,
  detectPlatformFromUrl,
  AcuityAdapter,
  CalendlyAdapter,
  DMVAdapter,
  GenericAdapter,
  getAdapter,
  type ExtractionResult,
  type Target,
  type TargetType,
} from "./firecrawlChecker";

// LLM-Enhanced Extractor (Firecrawl + Groq Pipeline)
export {
  checkTargetAvailabilityWithLLM,
  checkMultipleTargetsWithLLM,
  normalizeFirecrawlText,
  extractAvailabilityWithLLM,
  type LLMExtractionResult,
  type PipelineResult,
  type PipelineTarget,
} from "./llmExtractor";

// Search Service (Cache-First, No Scraping)
export {
  executeSearch,
  isValidAppointmentType,
  getValidAppointmentTypes,
  type AppointmentType,
  type LocationFilter,
  type SearchInput,
  type SearchResultItem,
  type SearchResponse,
} from "./searchService";

// Location Search Service (Cache-First, No Scraping)
export {
  searchByLocation,
  getCacheStats,
  clearCache,
  type LocationSearchInput,
  type LocationSearchResult,
  type LocationSearchResponse,
} from "./locationSearch";

// Diff Engine (Anti-Spam Logic)
export { computeDiff, recordAlert, generateDedupeHash, type DiffResult } from "./diffEngine";

// Requirements Enrichment (On-Demand Only)
export {
  extractRequirements,
  getCachedRequirements,
  hasRequirementsCache,
  invalidateRequirementsCache,
  type RequirementsResult,
} from "./requirements";

// Notification Service
export { sendNotification, sendTestNotification, type NotificationPayload, type NotificationResult } from "./notifier";

// Pipeline (Main Orchestrator - Firecrawl for Stale/Missing Only)
export { runChecks, runSingleCheck, type CheckRunResult, type CheckResultItem } from "./pipeline";

// Target Management (On-Demand Requirements)
export {
  listTargets,
  getTargetDetail,
  createTarget,
  updateTarget,
  deleteTarget,
  toggleTargetActive,
  type CreateTargetInput,
  type UpdateTargetInput,
  type TargetSummary,
  type TargetDetail,
} from "./targets";

// User Settings
export {
  getSettings,
  updateSettings,
  resetSettings,
  shouldMonitorType,
  shouldMonitorState,
  canSendEmail,
  getEmailsSentToday,
  DEFAULT_SETTINGS,
  type UserSettings,
  type SettingsUpdate,
} from "./settings";

// US States Data
export {
  US_STATES,
  STATE_BY_CODE,
  STATE_BY_NAME,
  findState,
  getNeighboringStates,
  getNeighborStates,
  calculateDistance,
  getStatesWithinDistance,
  type USState,
} from "./usStates";
