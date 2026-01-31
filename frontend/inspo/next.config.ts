import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment only (not needed for Vercel)
  // Vercel automatically handles optimizations
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
  // Ignore TypeScript errors during builds for staging deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure Turbopack to use absolute path for root
  turbopack: {
    root: __dirname,
  },
  // Image optimization configuration for external images (if any)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Development optimizations to prevent stale cache issues
  ...(process.env.NODE_ENV === "development" && {
    // Disable aggressive caching in development
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // Number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
};

export default nextConfig;
