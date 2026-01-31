import { type NextRequest, NextResponse } from "next/server";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

function buildAuthHeaders() {
  const headers: Record<string, string> = {};
  if (APTECH_API_KEY) {
    headers["X-APTECH-API-KEY"] = APTECH_API_KEY;
  }
  return headers;
}

type Params = { params: Promise<{ modelId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { modelId } = await params;

  try {
    const mlRes = await fetch(
      `${ML_API_BASE}/api/models/${modelId}/reliability`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!mlRes.ok) {
      const text = await mlRes.text().catch(() => "");
      console.error(
        "ML /api/models/{id}/reliability error:",
        mlRes.status,
        text || "<empty>",
      );

      return NextResponse.json(
        { error: "Backend unavailable", message: text || mlRes.statusText },
        { status: mlRes.status === 404 ? 404 : 502 },
      );
    }

    const data = await mlRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Next /api/ai-engine/models/[id]/reliability error:", err);
    return NextResponse.json(
      { error: "Backend unavailable", message: "Failed to reach ML backend" },
      { status: 502 },
    );
  }
}
