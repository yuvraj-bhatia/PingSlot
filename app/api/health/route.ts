import { NextResponse } from "next/server";
import prisma from "../../../lib/backend/db";

/**
 * GET /api/health
 * Health check endpoint for load balancers and monitoring.
 * 
 * Checks:
 * - Database connectivity
 * - Basic service health
 * 
 * Returns:
 * - 200: Service is healthy
 * - 503: Service is unhealthy
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: "connected",
      },
      responseTimeMs: responseTime,
      version: process.env.npm_package_version || "0.1.0",
    });
  } catch (error) {
    console.error("[Health] Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: "disconnected",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
