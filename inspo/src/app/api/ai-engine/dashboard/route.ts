import { NextResponse } from "next/server";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

function buildAuthHeaders() {
  const headers: Record<string, string> = {};
  if (APTECH_API_KEY) {
    headers["X-APTECH-API-KEY"] = APTECH_API_KEY;
  }
  return headers;
}

export async function GET() {
  try {
    const mlRes = await fetch(`${ML_API_BASE}/api/ai-engine/dashboard`, {
      method: "GET",
      headers: buildAuthHeaders(),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!mlRes.ok) {
      const text = await mlRes.text().catch(() => "");
      console.error(
        "ML /api/ai-engine/dashboard GET error:",
        mlRes.status,
        text || "<empty>",
      );

      return NextResponse.json(
        { error: "Backend unavailable", message: text || mlRes.statusText },
        { status: 502 },
      );
    }

    const data = await mlRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Next /api/ai-engine/dashboard GET error:", err);
    return NextResponse.json(
      { error: "Backend unavailable", message: "Failed to reach ML backend" },
      { status: 502 },
    );
  }
}
