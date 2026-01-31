/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts (not on every request)
 * Use it to set up global error handlers, monitoring, etc.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only run on Node.js runtime (server-side)

    // Global error handlers to prevent crashes
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Log but don't crash - let Next.js handle it gracefully
      // In production, you might want to send this to an error tracking service
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      // Log the error but allow the process to continue
      // Next.js will handle the error gracefully
    });

    // Handle SIGTERM and SIGINT for graceful shutdown
    // Note: Prisma client has its own shutdown handler in prisma.ts
    // This handler ensures the process exits cleanly after Prisma disconnects
    let isShuttingDown = false;
    const gracefulShutdown = (signal: string) => {
      if (isShuttingDown) {
        return; // Already shutting down
      }
      isShuttingDown = true;

      console.log(`Received ${signal}, shutting down gracefully...`);

      // Prisma client will handle its own disconnection via the handler in prisma.ts
      // Give it a moment to clean up, then exit
      setTimeout(() => {
        process.exit(0);
      }, 2000); // 2 seconds should be enough for Prisma to disconnect
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    console.log("✅ Global error handlers registered");
  }
}
