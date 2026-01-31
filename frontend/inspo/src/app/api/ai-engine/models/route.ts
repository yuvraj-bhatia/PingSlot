import { type NextRequest, NextResponse } from "next/server";

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

export async function GET(_req: NextRequest) {
  try {
    const response = await fetch(`${ML_API_BASE}/api/models`, {
      method: "GET",
      headers: buildAuthHeaders(),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Backend unavailable",
          message: errorBody || response.statusText,
        },
        { status: 502 },
      );
    }

    const models = await response.json();
    return NextResponse.json(models);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${ML_API_BASE}/api/models/train`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Backend unavailable",
          message: errorBody || response.statusText,
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
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
