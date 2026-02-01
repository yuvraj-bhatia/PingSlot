/**
 * Backend Configuration
 * Centralized environment variable management with validation
 */

export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",

  // Firecrawl API (page fetching - NEVER crawls, only scrapes explicit URLs)
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || "",
  firecrawlBaseUrl: "https://api.firecrawl.dev/v1",

  // Groq LLM (structured extraction from pre-fetched text only)
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",

  // Resend Email (notifications)
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "PingSlot Alerts <alerts@localhost>",

  // Reducto PDF Parser (requirements extraction)
  reductoApiKey: process.env.REDUCTO_API_KEY || "",

  // Scheduling
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || "15", 10),

  // Cache settings
  cacheTtlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || "5", 10),
  maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE || "15", 10),

  // Feature flags
  isDevelopment: process.env.NODE_ENV === "development",
  useMockData: process.env.USE_MOCK_DATA === "true",
} as const;

/**
 * Validate required configuration at startup
 */
export function validateConfig(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required for core functionality
  if (!config.firecrawlApiKey) {
    missing.push("FIRECRAWL_API_KEY");
  }

  // Required for LLM extraction
  if (!config.groqApiKey) {
    warnings.push("GROQ_API_KEY (LLM extraction disabled, using keyword fallback)");
  }

  // Required for notifications
  if (!config.resendApiKey) {
    warnings.push("RESEND_API_KEY (email notifications disabled)");
  }

  // Optional for PDF requirements
  if (!config.reductoApiKey) {
    warnings.push("REDUCTO_API_KEY (PDF requirements extraction disabled)");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export default config;
