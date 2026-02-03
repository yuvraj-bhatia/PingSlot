/**
 * Screenshot Utility Module
 *
 * Handles screenshot capture, compression, and storage
 * for the auto-booking system.
 */

import type { Page } from "playwright";

// ============================================================================
// Types
// ============================================================================

export interface ScreenshotOptions {
  /** Image format (default: 'png') */
  format?: "png" | "jpeg";
  /** JPEG quality 0-100 (default: 70, only for jpeg) */
  quality?: number;
  /** Capture full page (default: false) */
  fullPage?: boolean;
  /** Clip to specific region */
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Omit background for transparent PNG */
  omitBackground?: boolean;
  /** Scale factor (default: 1) */
  scale?: "css" | "device";
}

export interface ScreenshotResult {
  /** Base64 encoded image data */
  base64: string;
  /** Image format */
  format: "png" | "jpeg";
  /** Data URI for direct embedding */
  dataUri: string;
  /** Approximate size in bytes */
  sizeBytes: number;
}

// ============================================================================
// Screenshot Functions
// ============================================================================

/**
 * Capture a screenshot and return as base64.
 *
 * @param page - Playwright page instance
 * @param options - Screenshot options
 * @returns Screenshot result with base64 data
 */
export async function captureScreenshot(
  page: Page,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const format = options.format ?? "png";

  try {
    const buffer = await page.screenshot({
      type: format,
      quality: format === "jpeg" ? (options.quality ?? 70) : undefined,
      fullPage: options.fullPage ?? false,
      clip: options.clip,
      omitBackground: options.omitBackground,
      scale: options.scale ?? "css",
    });

    const base64 = buffer.toString("base64");
    const mimeType = format === "png" ? "image/png" : "image/jpeg";

    return {
      base64,
      format,
      dataUri: `data:${mimeType};base64,${base64}`,
      sizeBytes: buffer.length,
    };
  } catch (error) {
    console.error("[Screenshot] Failed to capture screenshot:", error);
    throw error;
  }
}

/**
 * Capture a full-page screenshot.
 *
 * @param page - Playwright page instance
 * @param options - Additional screenshot options
 * @returns Screenshot result
 */
export async function captureFullPage(
  page: Page,
  options: Omit<ScreenshotOptions, "fullPage"> = {}
): Promise<ScreenshotResult> {
  return captureScreenshot(page, { ...options, fullPage: true });
}

/**
 * Capture a compressed JPEG screenshot (good for streaming).
 *
 * @param page - Playwright page instance
 * @param quality - JPEG quality (0-100, default: 70)
 * @returns Screenshot result
 */
export async function captureCompressed(
  page: Page,
  quality = 70
): Promise<ScreenshotResult> {
  return captureScreenshot(page, {
    format: "jpeg",
    quality,
    fullPage: false,
  });
}

/**
 * Capture a screenshot of a specific element.
 *
 * @param page - Playwright page instance
 * @param selector - CSS selector of the element
 * @param options - Screenshot options
 * @returns Screenshot result or null if element not found
 */
export async function captureElement(
  page: Page,
  selector: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult | null> {
  try {
    const element = await page.$(selector);
    if (!element) {
      console.warn(`[Screenshot] Element not found: ${selector}`);
      return null;
    }

    const format = options.format ?? "png";
    const buffer = await element.screenshot({
      type: format,
      quality: format === "jpeg" ? (options.quality ?? 70) : undefined,
      omitBackground: options.omitBackground,
      scale: options.scale ?? "css",
    });

    const base64 = buffer.toString("base64");
    const mimeType = format === "png" ? "image/png" : "image/jpeg";

    return {
      base64,
      format,
      dataUri: `data:${mimeType};base64,${base64}`,
      sizeBytes: buffer.length,
    };
  } catch (error) {
    console.error(`[Screenshot] Failed to capture element ${selector}:`, error);
    return null;
  }
}

/**
 * Capture multiple screenshots at key points.
 * Useful for documenting a booking flow.
 *
 * @param page - Playwright page instance
 * @param stepName - Name of the current step
 * @param options - Screenshot options
 * @returns Screenshot result with step metadata
 */
export async function captureStepScreenshot(
  page: Page,
  stepName: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult & { step: string; timestamp: string }> {
  const screenshot = await captureScreenshot(page, options);

  return {
    ...screenshot,
    step: stepName,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert base64 to buffer.
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

/**
 * Calculate approximate file size from base64.
 */
export function getBase64Size(base64: string): number {
  // Base64 encoding inflates size by ~33%
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Compress a base64 screenshot by re-encoding as JPEG.
 * Note: This requires a page context to work.
 */
export async function compressScreenshot(
  page: Page,
  base64: string,
  quality = 70
): Promise<ScreenshotResult> {
  // For now, just capture a new screenshot with compression
  // A more sophisticated approach would decode/re-encode the image
  return captureCompressed(page, quality);
}

/**
 * Create a thumbnail version of a screenshot.
 * This is a placeholder - actual implementation would use image processing.
 */
export function createThumbnailPlaceholder(
  screenshot: ScreenshotResult
): ScreenshotResult {
  // In a real implementation, this would resize the image
  // For now, return the original
  console.log(
    "[Screenshot] Thumbnail creation not implemented, returning original"
  );
  return screenshot;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  captureScreenshot,
  captureFullPage,
  captureCompressed,
  captureElement,
  captureStepScreenshot,
  base64ToBuffer,
  getBase64Size,
  compressScreenshot,
  createThumbnailPlaceholder,
};
