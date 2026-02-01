/**
 * Settings Service
 * 
 * Manages global user settings for the appointment monitoring system.
 * This is a SINGLE-USER system - there's only one settings row with id="default".
 * 
 * Settings control:
 * - Which appointment types to monitor
 * - Which locations to prioritize
 * - When to send email notifications
 * - Whether to include requirements (Reducto)
 * - Rate limiting for emails
 */

import prisma from "./db";

// ============================================================================
// Types
// ============================================================================

/**
 * Parsed user settings with proper types.
 * JSON strings are parsed into arrays.
 */
export type UserSettings = {
  id: string;
  alertEmail: string;
  appointmentTypes: string[];  // Parsed from JSON
  preferredStates: string[];   // Parsed from JSON
  includeNeighborStates: boolean;
  notifyOnAvailable: boolean;
  notifyOnSlotChange: boolean;
  notifyOnRequiresInteraction: boolean;
  includeRequirements: boolean;
  maxEmailsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Settings update payload - all fields optional
 */
export type SettingsUpdate = Partial<Omit<UserSettings, "id" | "createdAt" | "updatedAt">>;

/**
 * Raw database row (JSON fields are strings)
 */
type RawUserSettings = {
  id: string;
  alertEmail: string;
  appointmentTypes: string;
  preferredStates: string;
  includeNeighborStates: boolean;
  notifyOnAvailable: boolean;
  notifyOnSlotChange: boolean;
  notifyOnRequiresInteraction: boolean;
  includeRequirements: boolean;
  maxEmailsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Default Settings
// ============================================================================

/**
 * Default settings used when no settings exist.
 * These are sensible defaults for a demo/new user.
 */
export const DEFAULT_SETTINGS: Omit<UserSettings, "id" | "createdAt" | "updatedAt"> = {
  alertEmail: "demo@example.com",
  appointmentTypes: [],           // Empty = monitor all types
  preferredStates: [],            // Empty = no location filtering
  includeNeighborStates: true,    // Include nearby states for better coverage
  notifyOnAvailable: true,        // Alert when appointments become available
  notifyOnSlotChange: true,       // Alert when earlier slots open up
  notifyOnRequiresInteraction: false, // Don't spam for pages needing interaction
  includeRequirements: true,      // Include "what to bring" in emails
  maxEmailsPerDay: 10,            // Reasonable daily limit
};

// ============================================================================
// Settings ID
// ============================================================================

/**
 * The single settings row ID.
 * This is a single-user system, so we use a constant ID.
 */
const SETTINGS_ID = "default";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse JSON string to array, with fallback to empty array
 */
function parseJsonArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert raw database row to parsed UserSettings
 */
function parseSettings(raw: RawUserSettings): UserSettings {
  return {
    ...raw,
    appointmentTypes: parseJsonArray(raw.appointmentTypes),
    preferredStates: parseJsonArray(raw.preferredStates),
  };
}

/**
 * Convert parsed arrays back to JSON strings for database storage
 */
function serializeForDb(settings: SettingsUpdate): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (key === "appointmentTypes" || key === "preferredStates") {
      // Convert arrays to JSON strings
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Get the current user settings.
 * Creates default settings if none exist.
 * 
 * This function is safe to call frequently - it reads from the database
 * each time to ensure settings changes are immediately reflected.
 */
export async function getSettings(): Promise<UserSettings> {
  // Try to get existing settings
  const existing = await prisma.userSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (existing) {
    return parseSettings(existing as RawUserSettings);
  }

  // Create default settings if none exist
  console.log("[Settings] Creating default settings...");
  
  const created = await prisma.userSettings.create({
    data: {
      id: SETTINGS_ID,
      alertEmail: DEFAULT_SETTINGS.alertEmail,
      appointmentTypes: JSON.stringify(DEFAULT_SETTINGS.appointmentTypes),
      preferredStates: JSON.stringify(DEFAULT_SETTINGS.preferredStates),
      includeNeighborStates: DEFAULT_SETTINGS.includeNeighborStates,
      notifyOnAvailable: DEFAULT_SETTINGS.notifyOnAvailable,
      notifyOnSlotChange: DEFAULT_SETTINGS.notifyOnSlotChange,
      notifyOnRequiresInteraction: DEFAULT_SETTINGS.notifyOnRequiresInteraction,
      includeRequirements: DEFAULT_SETTINGS.includeRequirements,
      maxEmailsPerDay: DEFAULT_SETTINGS.maxEmailsPerDay,
    },
  });

  return parseSettings(created as RawUserSettings);
}

/**
 * Update user settings.
 * Only updates the fields provided - other fields remain unchanged.
 * 
 * @param updates - Partial settings to update
 * @returns Updated settings
 */
export async function updateSettings(updates: SettingsUpdate): Promise<UserSettings> {
  // Ensure settings exist first
  await getSettings();

  // Serialize arrays to JSON strings
  const dbData = serializeForDb(updates);

  const updated = await prisma.userSettings.update({
    where: { id: SETTINGS_ID },
    data: dbData,
  });

  console.log("[Settings] Updated settings:", Object.keys(updates).join(", "));

  return parseSettings(updated as RawUserSettings);
}

/**
 * Reset settings to defaults.
 * Useful for testing or when user wants to start fresh.
 */
export async function resetSettings(): Promise<UserSettings> {
  const reset = await prisma.userSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      alertEmail: DEFAULT_SETTINGS.alertEmail,
      appointmentTypes: JSON.stringify(DEFAULT_SETTINGS.appointmentTypes),
      preferredStates: JSON.stringify(DEFAULT_SETTINGS.preferredStates),
      includeNeighborStates: DEFAULT_SETTINGS.includeNeighborStates,
      notifyOnAvailable: DEFAULT_SETTINGS.notifyOnAvailable,
      notifyOnSlotChange: DEFAULT_SETTINGS.notifyOnSlotChange,
      notifyOnRequiresInteraction: DEFAULT_SETTINGS.notifyOnRequiresInteraction,
      includeRequirements: DEFAULT_SETTINGS.includeRequirements,
      maxEmailsPerDay: DEFAULT_SETTINGS.maxEmailsPerDay,
    },
    update: {
      alertEmail: DEFAULT_SETTINGS.alertEmail,
      appointmentTypes: JSON.stringify(DEFAULT_SETTINGS.appointmentTypes),
      preferredStates: JSON.stringify(DEFAULT_SETTINGS.preferredStates),
      includeNeighborStates: DEFAULT_SETTINGS.includeNeighborStates,
      notifyOnAvailable: DEFAULT_SETTINGS.notifyOnAvailable,
      notifyOnSlotChange: DEFAULT_SETTINGS.notifyOnSlotChange,
      notifyOnRequiresInteraction: DEFAULT_SETTINGS.notifyOnRequiresInteraction,
      includeRequirements: DEFAULT_SETTINGS.includeRequirements,
      maxEmailsPerDay: DEFAULT_SETTINGS.maxEmailsPerDay,
    },
  });

  console.log("[Settings] Reset to defaults");

  return parseSettings(reset as RawUserSettings);
}

// ============================================================================
// Convenience Getters
// ============================================================================

/**
 * Check if a specific appointment type should be monitored.
 * Empty appointmentTypes array means "monitor all".
 */
export async function shouldMonitorType(appointmentType: string): Promise<boolean> {
  const settings = await getSettings();
  
  // Empty array = monitor all types
  if (settings.appointmentTypes.length === 0) {
    return true;
  }

  return settings.appointmentTypes.includes(appointmentType);
}

/**
 * Check if a specific state should be monitored.
 * Empty preferredStates array means "no location filtering".
 */
export async function shouldMonitorState(state: string | null): Promise<boolean> {
  if (!state) return true; // No state specified = include

  const settings = await getSettings();
  
  // Empty array = no filtering
  if (settings.preferredStates.length === 0) {
    return true;
  }

  return settings.preferredStates.includes(state);
}

/**
 * Get the count of emails sent today for rate limiting.
 */
export async function getEmailsSentToday(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.alert.count({
    where: {
      sentAt: {
        gte: startOfDay,
      },
    },
  });

  return count;
}

/**
 * Check if we can send more emails today based on rate limit.
 */
export async function canSendEmail(): Promise<{ allowed: boolean; reason?: string }> {
  const settings = await getSettings();
  
  // 0 = unlimited
  if (settings.maxEmailsPerDay === 0) {
    return { allowed: true };
  }

  const sentToday = await getEmailsSentToday();
  
  if (sentToday >= settings.maxEmailsPerDay) {
    return {
      allowed: false,
      reason: `Daily email limit reached (${sentToday}/${settings.maxEmailsPerDay})`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getSettings,
  updateSettings,
  resetSettings,
  shouldMonitorType,
  shouldMonitorState,
  getEmailsSentToday,
  canSendEmail,
  DEFAULT_SETTINGS,
};
