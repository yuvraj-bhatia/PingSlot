import { type NextRequest, NextResponse } from "next/server";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(`${ML_API_BASE}/api/dashboard/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(APTECH_API_KEY ? { "X-APTECH-API-KEY": APTECH_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.detail || `Failed to fetch analytics summary`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch analytics summary";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
