"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiClient, validatedRequest } from "./apiClient";
import {
  TargetSummarySchema,
  TargetDetailSchema,
  CheckRunResponseSchema,
  type TargetSummary,
  type TargetDetail,
  type CheckRunResponse,
  type CreateTargetFormInput,
  type UpdateTargetFormInput,
  type StartCheckRunInput,
  type BookingStatus,
  type BookingSession,
  type UserProfile,
} from "./apiTypes";
import { z } from "zod";

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  targets: {
    all: ["targets"] as const,
    lists: () => [...queryKeys.targets.all, "list"] as const,
    list: (filters: string) => [...queryKeys.targets.lists(), { filters }] as const,
    details: () => [...queryKeys.targets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.targets.details(), id] as const,
  },
  checkRuns: {
    all: ["checkRuns"] as const,
    lists: () => [...queryKeys.checkRuns.all, "list"] as const,
    detail: (runId: string) => [...queryKeys.checkRuns.all, runId] as const,
  },
};

// ============================================================================
// Target Queries
// ============================================================================

const TargetsListSchema = z.object({
  targets: z.array(TargetSummarySchema),
});

/**
 * Fetch all targets with their summaries.
 */
export function useTargets(
  options?: Omit<UseQueryOptions<TargetSummary[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.targets.lists(),
    queryFn: async () => {
      const response = await validatedRequest<{ targets: TargetSummary[] }, typeof TargetsListSchema>(
        TargetsListSchema,
        () => apiClient.get("/targets")
      );
      return response.targets;
    },
    ...options,
  });
}

const TargetDetailResponseSchema = z.object({
  target: TargetDetailSchema,
});

/**
 * Fetch detailed information for a specific target.
 */
export function useTarget(
  id: string,
  options?: Omit<UseQueryOptions<TargetDetail>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.targets.detail(id),
    queryFn: async () => {
      const response = await validatedRequest<{ target: TargetDetail }, typeof TargetDetailResponseSchema>(
        TargetDetailResponseSchema,
        () => apiClient.get(`/targets/${id}`)
      );
      return response.target;
    },
    enabled: !!id,
    ...options,
  });
}

// ============================================================================
// Target Mutations
// ============================================================================

const CreateTargetResponseSchema = z.object({
  target: TargetSummarySchema,
});

/**
 * Create a new target.
 */
export function useCreateTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTargetFormInput) => {
      const response = await validatedRequest<{ target: TargetSummary }, typeof CreateTargetResponseSchema>(
        CreateTargetResponseSchema,
        () => apiClient.post("/targets", input)
      );
      return response.target;
    },
    onSuccess: () => {
      // Invalidate and refetch targets list
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.lists() });
    },
  });
}

const ToggleActiveResponseSchema = z.object({
  target: TargetSummarySchema,
});

/**
 * Toggle a target's active state.
 */
export function useToggleTargetActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await validatedRequest<{ target: TargetSummary }, typeof ToggleActiveResponseSchema>(
        ToggleActiveResponseSchema,
        () => apiClient.patch(`/targets/${id}`, { active })
      );
      return response.target;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific target and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.targets.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.lists() });
    },
  });
}

const UpdateTargetResponseSchema = z.object({
  target: TargetSummarySchema,
});

/**
 * Update a target's configuration.
 */
export function useUpdateTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTargetFormInput }) => {
      const response = await validatedRequest<{ target: TargetSummary }, typeof UpdateTargetResponseSchema>(
        UpdateTargetResponseSchema,
        () => apiClient.patch(`/targets/${id}`, data)
      );
      return response.target;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific target and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.targets.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.lists() });
    },
  });
}

const DeleteTargetResponseSchema = z.object({
  success: z.boolean(),
});

/**
 * Delete a target.
 */
export function useDeleteTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await validatedRequest<{ success: boolean }, typeof DeleteTargetResponseSchema>(
        DeleteTargetResponseSchema,
        () => apiClient.delete(`/targets/${id}`)
      );
      return response.success;
    },
    onSuccess: () => {
      // Invalidate targets list
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.lists() });
    },
  });
}

// ============================================================================
// Check Run Queries & Mutations
// ============================================================================

const StartCheckRunResponseSchema = z.object({
  runId: z.string(),
  status: z.string(),
  startedAt: z.string(),
});

/**
 * Start a new check run.
 */
export function useStartCheckRun() {
  const _queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartCheckRunInput = {}) => {
      const response = await validatedRequest<{ runId: string; status: string; startedAt: string }, typeof StartCheckRunResponseSchema>(
        StartCheckRunResponseSchema,
        () => apiClient.post("/check", input)
      );
      return response;
    },
    onSuccess: () => {
      // Will start polling for the new run
    },
  });
}

/**
 * Fetch check run status and results.
 */
export function useCheckRun(
  runId: string | null,
  options?: Omit<UseQueryOptions<CheckRunResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.checkRuns.detail(runId || "null"),
    queryFn: async () => {
      if (!runId) throw new Error("runId is required");
      const response = await validatedRequest<CheckRunResponse, typeof CheckRunResponseSchema>(
        CheckRunResponseSchema,
        () => apiClient.get(`/check/${runId}`)
      );
      return response;
    },
    enabled: !!runId,
    // Poll every second while running
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "running" || data?.status === "pending") {
        return 1000;
      }
      return false;
    },
    ...options,
  });
}

// ============================================================================
// Booking Session Hook
// ============================================================================

interface UseBookingSessionOptions {
  onStatusChange?: (status: BookingStatus) => void;
  onError?: (error: string) => void;
  onSuccess?: (confirmation: { number: string; datetime: string }) => void;
}

interface BookingSessionState {
  sessionId: string | null;
  status: BookingStatus;
  currentStep: number;
  screenshot: string | null;
  error: string | null;
  confirmation: { number: string; datetime: string } | null;
  isConnected: boolean;
}

/**
 * Hook for managing a booking session with SSE for real-time updates.
 * 
 * Usage:
 * ```tsx
 * const { start, cancel, status, screenshot, step, error, confirmation } = useBookingSession(targetId);
 * 
 * // Start booking
 * start({ firstName: "John", lastName: "Doe", email: "john@example.com" });
 * 
 * // Cancel booking
 * cancel();
 * ```
 */
export function useBookingSession(
  targetId: string,
  options?: UseBookingSessionOptions
) {
  const [state, setState] = useState<BookingSessionState>({
    sessionId: null,
    status: "pending",
    currentStep: 0,
    screenshot: null,
    error: null,
    confirmation: null,
    isConnected: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up SSE connection
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({ ...prev, isConnected: false }));
  }, []);

  // Connect to SSE stream
  const connect = useCallback((sessionId: string) => {
    disconnect();

    const eventSource = new EventSource(
      `/api/targets/${targetId}/book/${sessionId}/status`
    );

    eventSource.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Partial<BookingSession>;
        
        setState((prev) => ({
          ...prev,
          status: data.status || prev.status,
          currentStep: data.currentStep ?? prev.currentStep,
          screenshot: data.screenshot || prev.screenshot,
          error: data.error || prev.error,
          confirmation: data.confirmation || prev.confirmation,
        }));

        // Trigger callbacks
        if (data.status) {
          options?.onStatusChange?.(data.status);
        }
        if (data.error) {
          options?.onError?.(data.error);
        }
        if (data.confirmation) {
          options?.onSuccess?.(data.confirmation);
        }

        // Close connection on terminal states
        if (data.status === "success" || data.status === "failed" || data.status === "cancelled") {
          disconnect();
        }
      } catch (err) {
        console.error("[Booking SSE] Failed to parse message:", err);
      }
    };

    eventSource.onerror = () => {
      console.error("[Booking SSE] Connection error");
      setState((prev) => ({ ...prev, isConnected: false }));
      // Attempt to reconnect after a delay if not in terminal state
      setTimeout(() => {
        if (
          state.status !== "success" &&
          state.status !== "failed" &&
          state.status !== "cancelled"
        ) {
          connect(sessionId);
        }
      }, 3000);
    };

    eventSourceRef.current = eventSource;
  }, [targetId, disconnect, options, state.status]);

  // Start booking session
  const start = useCallback(
    async (userProfile: UserProfile) => {
      // Reset state
      setState({
        sessionId: null,
        status: "pending",
        currentStep: 0,
        screenshot: null,
        error: null,
        confirmation: null,
        isConnected: false,
      });

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/targets/${targetId}/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to start booking");
        }

        const data = await response.json();
        const sessionId = data.sessionId as string;

        setState((prev) => ({
          ...prev,
          sessionId,
          status: "navigating",
        }));

        // Connect to SSE stream
        connect(sessionId);

        return sessionId;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: errorMessage,
        }));
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [targetId, connect, options]
  );

  // Cancel booking session
  const cancel = useCallback(async () => {
    // Abort any pending request
    abortControllerRef.current?.abort();

    // If we have a session, send cancel request
    if (state.sessionId) {
      try {
        await fetch(`/api/targets/${targetId}/book/${state.sessionId}/cancel`, {
          method: "POST",
        });
      } catch (err) {
        console.error("[Booking] Failed to cancel session:", err);
      }
    }

    disconnect();

    setState((prev) => ({
      ...prev,
      status: "cancelled",
    }));
  }, [targetId, state.sessionId, disconnect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
      abortControllerRef.current?.abort();
    };
  }, [disconnect]);

  return {
    // Actions
    start,
    cancel,
    
    // State
    sessionId: state.sessionId,
    status: state.status,
    currentStep: state.currentStep,
    screenshot: state.screenshot,
    error: state.error,
    confirmation: state.confirmation,
    isConnected: state.isConnected,
    
    // Computed
    isActive: state.status !== "pending" && 
              state.status !== "success" && 
              state.status !== "failed" && 
              state.status !== "cancelled",
    isComplete: state.status === "success",
    hasFailed: state.status === "failed" || state.status === "cancelled",
  };
}
