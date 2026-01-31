export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import type { RouteContext } from "@/types/route-context";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

function buildAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (APTECH_API_KEY) {
    headers["X-APTECH-API-KEY"] = APTECH_API_KEY;
  }
  return headers;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext<"/api/ai-engine/reports/[reportId]/download">,
) {
  try {
    const { reportId } = await params;
    const format = req.nextUrl.searchParams.get("format") || "pdf";
    const response = await fetch(
      `${ML_API_BASE}/api/reports/${reportId}/download?format=${format}`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
        signal: AbortSignal.timeout(20000),
      },
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorBody = await response.json().catch(() => ({}));
        return NextResponse.json(errorBody, { status: response.status });
      }
      const errorBody = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Backend unavailable",
          message: errorBody || response.statusText,
        },
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") || "application/pdf";
    const filename =
      response.headers.get("content-disposition") ||
      "attachment; filename=report.pdf";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": filename,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json(
      {
        error: "Backend unavailable",
        message,
      },
      { status: 502 },
    );
  }
}
