// src/app/api/ai-engine/datasets/[datasetId]/preview/route.ts
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

type Params = { params: Promise<{ datasetId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { datasetId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const rows = searchParams.get("rows") ?? "8";

  try {
    const mlRes = await fetch(
      `${ML_API_BASE}/api/datasets/${datasetId}/preview?rows=${rows}`,
      { method: "GET", headers: buildAuthHeaders() },
    );

    if (!mlRes.ok) {
      const text = await mlRes.text().catch(() => "");
      console.error(
        "ML /api/datasets/{id}/preview error:",
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
    console.error("Next /api/ai-engine/datasets/[id]/preview error:", err);
    return NextResponse.json(
      { error: "Backend unavailable", message: "Failed to reach ML backend" },
      { status: 502 },
    );
  }
}
