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

// GET - List all datasets (proxied to ML backend)
export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(`${ML_API_BASE}/api/datasets`, {
      method: "GET",
      headers: buildAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `ML API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Backend unavailable", message },
      { status: 502 },
    );
  }
}

// POST - Upload dataset to ML backend
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${ML_API_BASE}/api/datasets`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `ML API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading dataset:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Backend unavailable", message },
      { status: 502 },
    );
  }
}
