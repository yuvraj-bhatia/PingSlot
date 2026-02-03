/**
 * Platform Adapters Registry
 *
 * Centralized management of all booking platform adapters.
 * Adapters are ordered by specificity - more specific adapters first,
 * with the generic adapter as a fallback.
 */

import type { PlatformAdapter } from "../types";
import { acuityAdapter, AcuityAdapter } from "./acuity";
import { calendlyAdapter, CalendlyAdapter } from "./calendly";
import { genericAdapter, GenericAdapter } from "./generic";

// ============================================================================
// Adapter Registry
// ============================================================================

/**
 * All registered adapters, ordered by specificity.
 * The generic adapter should always be last as it matches everything.
 */
const adapters: PlatformAdapter[] = [
  acuityAdapter,
  calendlyAdapter,
  genericAdapter, // Always last - fallback
];

/**
 * Get the appropriate adapter for a URL.
 *
 * Iterates through adapters in order and returns the first one
 * that can handle the URL. The generic adapter will always match
 * as a fallback.
 *
 * @param url - The booking URL to match
 * @param platformHint - Optional platform hint to prioritize
 * @returns The matched platform adapter
 */
export function getAdapter(url: string, platformHint?: string): PlatformAdapter {
  // If platform hint provided, try to match by name first
  if (platformHint) {
    const hinted = adapters.find(
      (a) => a.name.toLowerCase() === platformHint.toLowerCase()
    );
    if (hinted && hinted.canHandle(url)) {
      console.log(`[AdapterRegistry] Using hinted adapter: ${hinted.name}`);
      return hinted;
    }
  }

  // Otherwise, find by URL pattern
  for (const adapter of adapters) {
    if (adapter.canHandle(url)) {
      console.log(`[AdapterRegistry] Using adapter: ${adapter.name}`);
      return adapter;
    }
  }

  // Should never reach here due to GenericAdapter matching everything
  console.log("[AdapterRegistry] Falling back to generic adapter");
  return genericAdapter;
}

/**
 * Get adapter by name.
 *
 * @param name - The adapter name
 * @returns The adapter or undefined if not found
 */
export function getAdapterByName(name: string): PlatformAdapter | undefined {
  return adapters.find((a) => a.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get all registered adapters.
 *
 * @returns Array of all adapters
 */
export function getAllAdapters(): PlatformAdapter[] {
  return [...adapters];
}

/**
 * Get supported platform names.
 *
 * @returns Array of platform names
 */
export function getSupportedPlatforms(): string[] {
  return adapters.map((a) => a.name);
}

/**
 * Check if a URL is supported by any adapter.
 *
 * @param url - The URL to check
 * @returns True if at least one specific adapter (not generic) matches
 */
export function isUrlSupported(url: string): boolean {
  // Check if any non-generic adapter can handle it
  return adapters.some((a) => a.name !== "generic" && a.canHandle(url));
}

/**
 * Detect the platform from a URL.
 *
 * @param url - The URL to analyze
 * @returns The detected platform name
 */
export function detectPlatform(url: string): string {
  for (const adapter of adapters) {
    if (adapter.canHandle(url)) {
      return adapter.name;
    }
  }
  return "generic";
}

// ============================================================================
// Re-exports
// ============================================================================

export { acuityAdapter, AcuityAdapter };
export { calendlyAdapter, CalendlyAdapter };
export { genericAdapter, GenericAdapter };
export { BaseAdapter } from "./base";

export default {
  getAdapter,
  getAdapterByName,
  getAllAdapters,
  getSupportedPlatforms,
  isUrlSupported,
  detectPlatform,
};
