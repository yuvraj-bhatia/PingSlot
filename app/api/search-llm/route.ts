/**
 * POST /api/search-llm
 * 
 * LLM-enhanced search endpoint using Firecrawl + Groq pipeline.
 * 
 * STRICT CONSTRAINTS:
 * 1. ONLY fetches URLs from the database
 * 2. NEVER crawls, follows links, or discovers URLs
 * 3. LLM ONLY processes pre-fetched text
 * 4. Returns STRICT JSON structure
 * 
 * Request body:
 * {
 *   appointmentType: string,
 *   location?: { state?: string, city?: string, country?: string }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../lib/backend/db";
import {
  checkTargetAvailabilityWithLLM,
  type PipelineResult,
} from "../../../lib/backend/llmExtractor";

// ============================================================================
// Request Validation
// ============================================================================

const SearchLLMRequestSchema = z.object({
  appointmentType: z.string().min(1, "appointmentType is required"),
  location: z
    .object({
      state: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// Response Types
// ============================================================================

type SearchLLMResult = {
  targetId: string;
  name: string;
  location: string;
  status: "available" | "unavailable" | "unknown" | "requires_interaction";
  nextSlotTime: string | null;
  bookingUrl: string;
  processingTimeMs: number;
};

type SearchLLMResponse = {
  searchedCount: number;
  totalProcessingTimeMs: number;
  results: SearchLLMResult[];
};

// ============================================================================
// Helpers
// ============================================================================

function formatLocation(target: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string {
  const parts: string[] = [];
  if (target.city) parts.push(target.city);
  if (target.state) parts.push(target.state);
  if (target.country) parts.push(target.country);
  return parts.join(", ") || "Unknown location";
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request
    const body = await request.json();
    const parseResult = SearchLLMRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { appointmentType, location } = parseResult.data;

    console.log(`[API/SearchLLM] Searching for ${appointmentType}`);

    // Build query filter - ONLY queries existing targets in database
    const whereClause: {
      appointmentType: string;
      active: boolean;
      state?: { contains: string };
      city?: { contains: string };
      country?: { contains: string };
    } = {
      appointmentType,
      active: true,
    };

    if (location?.state) {
      whereClause.state = { contains: location.state };
    }
    if (location?.city) {
      whereClause.city = { contains: location.city };
    }
    if (location?.country) {
      whereClause.country = { contains: location.country };
    }

    // Query targets from database ONLY
    const targets = await prisma.target.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        bookingUrl: true,
        city: true,
        state: true,
        country: true,
      },
    });

    console.log(`[API/SearchLLM] Found ${targets.length} targets in database`);

    if (targets.length === 0) {
      return NextResponse.json({
        searchedCount: 0,
        totalProcessingTimeMs: Date.now() - startTime,
        results: [],
      });
    }

    // Process each target with LLM pipeline
    const results: SearchLLMResult[] = [];

    for (const target of targets) {
      // Run Firecrawl + LLM pipeline on this SINGLE explicit URL
      const pipelineResult: PipelineResult = await checkTargetAvailabilityWithLLM({
        id: target.id,
        name: target.name,
        bookingUrl: target.bookingUrl,
      });

      results.push({
        targetId: target.id,
        name: target.name,
        location:
          pipelineResult.extraction.location || formatLocation(target),
        status: pipelineResult.extraction.availability_status,
        nextSlotTime: pipelineResult.extraction.next_available_slot,
        bookingUrl: target.bookingUrl,
        processingTimeMs: pipelineResult.processingTimeMs,
      });

      // Small delay between targets
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response: SearchLLMResponse = {
      searchedCount: results.length,
      totalProcessingTimeMs: Date.now() - startTime,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API/SearchLLM] Error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler (Discovery)
// ============================================================================

export async function GET() {
  return NextResponse.json({
    description: "LLM-enhanced appointment search using Firecrawl + Groq",
    usage: {
      method: "POST",
      body: {
        appointmentType: "string (required) - passport | consulate | city_planning | dmv | generic",
        location: {
          state: "string (optional)",
          city: "string (optional)",
          country: "string (optional)",
        },
      },
    },
    pipeline: [
      "1. Filter targets from database by appointmentType + location",
      "2. Fetch each target URL with Firecrawl scrapeUrl()",
      "3. Normalize markdown text (remove URLs, lowercase)",
      "4. Extract availability with Groq LLM",
      "5. Return structured JSON results",
    ],
    constraints: [
      "ONLY fetches URLs from database",
      "NEVER crawls or discovers new URLs",
      "LLM processes pre-fetched text only",
    ],
  });
}
