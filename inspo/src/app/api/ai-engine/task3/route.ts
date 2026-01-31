import { type NextRequest, NextResponse } from "next/server";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the backend /analytics/report endpoint
    const response = await fetch(`${ML_API_BASE}/api/analytics/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(APTECH_API_KEY ? { "X-APTECH-API-KEY": APTECH_API_KEY } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          ok: false,
          error:
            errorData.detail ||
            `Report generation failed with status ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      ok: true,
      ...data,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate report";
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
