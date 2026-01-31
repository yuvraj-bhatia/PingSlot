// src/app/api/dashboard/route.ts
// Fetches REAL dashboard data from ML backend
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_API_BASE = process.env.ML_API_BASE_URL || "http://localhost:8000";
const APTECH_API_KEY = process.env.APTECH_API_KEY;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch real data from ML backend
    const response = await fetch(`${ML_API_BASE}/api/ai-engine/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(APTECH_API_KEY ? { "X-APTECH-API-KEY": APTECH_API_KEY } : {}),
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error("ML backend dashboard error:", response.status);
      // Return empty/zero state instead of fake data
      return NextResponse.json({
        metrics: {
          totalModels: 0,
          totalDatasets: 0,
          totalPredictions: 0,
          activeModels: 0,
        },
        recentActivity: [],
        backendAvailable: false,
      });
    }

    const data = await response.json();

    // Transform backend response to frontend format
    return NextResponse.json({
      metrics: {
        totalModels: parseInt(data.metrics?.[0]?.value || "0", 10),
        totalDatasets: parseInt(data.metrics?.[1]?.value || "0", 10),
        totalPredictions: parseInt(data.metrics?.[2]?.value || "0", 10),
        activeModels: parseInt(data.metrics?.[3]?.value || "0", 10),
      },
      recentActivity: data.recentActivity || [],
      backendAvailable: true,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Return empty state on error - no fake data
    return NextResponse.json({
      metrics: {
        totalModels: 0,
        totalDatasets: 0,
        totalPredictions: 0,
        activeModels: 0,
      },
      recentActivity: [],
      backendAvailable: false,
      error: "Failed to connect to ML backend",
    });
  }
}
