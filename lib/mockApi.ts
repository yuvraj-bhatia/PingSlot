"use server";

import { cache } from "react";
import {
  targetDetails,
  targetSummaries,
  mockCheckRunResponse,
  createMockTarget,
} from "./mockData";
import type {
  TargetDetail,
  TargetSummary,
  CheckRunResponse,
  CreateTargetInput,
} from "./types";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

// GET /api/targets - list targets + last summaries
export const getTargets = cache(async (): Promise<TargetSummary[]> => {
  await delay(400);
  return [...targetSummaries];
});

// GET /api/targets/:id - get target detail
export const getTargetDetail = cache(
  async (id: string): Promise<TargetDetail | null> => {
    await delay(400);
    return targetDetails[id] ? { ...targetDetails[id] } : null;
  }
);

// POST /api/targets - create target
export async function createTarget(
  input: CreateTargetInput
): Promise<TargetSummary> {
  await delay(600);
  return createMockTarget(input);
}

// POST /api/check - run checks (targetIds optional)
export async function runCheck(targetIds?: string[]): Promise<CheckRunResponse> {
  await delay(1000);
  return mockCheckRunResponse(targetIds);
}

// GET /api/results?targetId=... - latest + last 5
export async function getResults(targetId: string): Promise<{
  target: TargetDetail;
  latest: TargetDetail["lastCheck"];
  history: TargetDetail["recentChecks"];
} | null> {
  await delay(400);
  const target = targetDetails[targetId];
  if (!target) return null;
  return {
    target: { ...target },
    latest: target.lastCheck,
    history: [...target.recentChecks],
  };
}

// Toggle target active state
export async function toggleTargetActive(
  id: string,
  active: boolean
): Promise<TargetSummary | null> {
  await delay(300);
  const target = targetSummaries.find((t) => t.id === id);
  const detail = targetDetails[id];
  if (!target || !detail) return null;
  target.active = active;
  detail.active = active;
  return { ...target };
}
