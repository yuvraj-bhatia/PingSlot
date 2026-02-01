/**
 * Settings API Endpoint
 * 
 * GET /api/settings - Retrieve current user settings
 * POST /api/settings - Update user settings
 * 
 * This is a SINGLE-USER system - no authentication required.
 * Settings control how the appointment monitoring pipeline behaves.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, type SettingsUpdate } from "@/lib/backend/settings";

// ============================================================================
// Validation
// ============================================================================

/**
 * Valid appointment types that can be monitored
 */
const VALID_APPOINTMENT_TYPES = [
  "dmv",
  "passport",
  "consulate",
  "city_planning",
  "visa",
  "generic",
];

/**
 * Valid US states for location filtering
 */
const VALID_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

/**
 * Validate and sanitize settings update payload
 */
function validateSettingsUpdate(body: unknown): { valid: boolean; data?: SettingsUpdate; error?: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  const input = body as Record<string, unknown>;
  const data: SettingsUpdate = {};

  // alertEmail - must be valid email format
  if ("alertEmail" in input) {
    if (typeof input.alertEmail !== "string") {
      return { valid: false, error: "alertEmail must be a string" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.alertEmail)) {
      return { valid: false, error: "alertEmail must be a valid email address" };
    }
    data.alertEmail = input.alertEmail;
  }

  // appointmentTypes - must be array of valid types
  if ("appointmentTypes" in input) {
    if (!Array.isArray(input.appointmentTypes)) {
      return { valid: false, error: "appointmentTypes must be an array" };
    }
    for (const type of input.appointmentTypes) {
      if (typeof type !== "string" || !VALID_APPOINTMENT_TYPES.includes(type)) {
        return { 
          valid: false, 
          error: `Invalid appointment type: ${type}. Valid types: ${VALID_APPOINTMENT_TYPES.join(", ")}` 
        };
      }
    }
    data.appointmentTypes = input.appointmentTypes as string[];
  }

  // preferredStates - must be array of valid US states
  if ("preferredStates" in input) {
    if (!Array.isArray(input.preferredStates)) {
      return { valid: false, error: "preferredStates must be an array" };
    }
    for (const state of input.preferredStates) {
      if (typeof state !== "string" || !VALID_STATES.includes(state)) {
        return { 
          valid: false, 
          error: `Invalid state: ${state}` 
        };
      }
    }
    data.preferredStates = input.preferredStates as string[];
  }

  // Boolean fields
  const booleanFields = [
    "includeNeighborStates",
    "notifyOnAvailable",
    "notifyOnSlotChange",
    "notifyOnRequiresInteraction",
    "includeRequirements",
  ] as const;

  for (const field of booleanFields) {
    if (field in input) {
      if (typeof input[field] !== "boolean") {
        return { valid: false, error: `${field} must be a boolean` };
      }
      data[field] = input[field] as boolean;
    }
  }

  // maxEmailsPerDay - must be non-negative integer
  if ("maxEmailsPerDay" in input) {
    if (typeof input.maxEmailsPerDay !== "number" || 
        !Number.isInteger(input.maxEmailsPerDay) || 
        input.maxEmailsPerDay < 0) {
      return { valid: false, error: "maxEmailsPerDay must be a non-negative integer" };
    }
    data.maxEmailsPerDay = input.maxEmailsPerDay;
  }

  return { valid: true, data };
}

// ============================================================================
// GET /api/settings
// ============================================================================

/**
 * Retrieve current user settings
 * 
 * Response:
 * {
 *   alertEmail: string,
 *   appointmentTypes: string[],
 *   preferredStates: string[],
 *   includeNeighborStates: boolean,
 *   notifyOnAvailable: boolean,
 *   notifyOnSlotChange: boolean,
 *   notifyOnRequiresInteraction: boolean,
 *   includeRequirements: boolean,
 *   maxEmailsPerDay: number,
 *   createdAt: string,
 *   updatedAt: string
 * }
 */
export async function GET() {
  try {
    const settings = await getSettings();

    // Return settings with metadata
    return NextResponse.json({
      ...settings,
      // Include valid options for UI dropdowns
      _meta: {
        validAppointmentTypes: VALID_APPOINTMENT_TYPES,
        validStates: VALID_STATES,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/settings
// ============================================================================

/**
 * Update user settings
 * 
 * Request body (all fields optional):
 * {
 *   alertEmail?: string,
 *   appointmentTypes?: string[],
 *   preferredStates?: string[],
 *   includeNeighborStates?: boolean,
 *   notifyOnAvailable?: boolean,
 *   notifyOnSlotChange?: boolean,
 *   notifyOnRequiresInteraction?: boolean,
 *   includeRequirements?: boolean,
 *   maxEmailsPerDay?: number
 * }
 * 
 * Response: Updated settings object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateSettingsUpdate(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if there's anything to update
    if (!validation.data || Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    // Update settings
    const updated = await updateSettings(validation.data);

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: updated,
    });
  } catch (error) {
    console.error("[API] POST /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
