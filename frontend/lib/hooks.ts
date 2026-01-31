"use client";

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
  type StartCheckRunInput,
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
  const queryClient = useQueryClient();

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
