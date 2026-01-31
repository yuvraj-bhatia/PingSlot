/**
 * Central API client for all network requests.
 * Provides typed responses, consistent error handling, and request/response interceptors.
 */

import { z } from "zod";

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(
    message = "Validation failed",
    public issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ============================================================================
// Request Types
// ============================================================================

interface RequestConfig extends RequestInit {
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

// ============================================================================
// Core Fetch Function
// ============================================================================

const DEFAULT_TIMEOUT = 30000;

async function fetchWithTimeout(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...rest } = config;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timed out");
    }
    throw new NetworkError();
  } finally {
    clearTimeout(id);
  }
}

// ============================================================================
// API Client
// ============================================================================

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `/api${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...config.headers as Record<string, string>,
  };

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetchWithTimeout(url, {
      ...config,
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }

    // Parse JSON response
    const data = await response.json();

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    // Wrap unknown errors
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

// ============================================================================
// HTTP Method Shortcuts
// ============================================================================

export const apiClient = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>("GET", path, undefined, config),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("POST", path, body, config),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PUT", path, body, config),

  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PATCH", path, body, config),

  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>("DELETE", path, undefined, config),
};

// ============================================================================
// Validation Helper
// ============================================================================

export async function validatedRequest<T, S extends z.ZodType>(
  schema: S,
  requestFn: () => Promise<ApiResponse<unknown>>
): Promise<T> {
  const response = await requestFn();
  const result = schema.safeParse(response.data);

  if (!result.success) {
    throw new ValidationError("Response validation failed", result.error.issues);
  }

  return result.data as T;
}
