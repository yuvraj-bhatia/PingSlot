import { type Prisma, PrismaClient } from "@prisma/client";

// Configure Prisma with connection pool limits and timeouts to prevent crashes
// Connection pool config should be in DATABASE_URL query params:
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10"
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  errorFormat: "pretty",
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaShutdownRegistered?: boolean;
};

// Create Prisma client with proper configuration
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// Prevent multiple instances in development (Next.js hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

if (
  typeof process !== "undefined" &&
  !globalForPrisma.prismaShutdownRegistered
) {
  const gracefulShutdown = async () => {
    console.log("Shutting down Prisma client...");
    try {
      await prisma.$disconnect();
      console.log("Prisma client disconnected");
    } catch (error) {
      console.error("Error disconnecting Prisma:", error);
    }
  };

  process.once("SIGINT", gracefulShutdown);
  process.once("SIGTERM", gracefulShutdown);
  globalForPrisma.prismaShutdownRegistered = true;
}
