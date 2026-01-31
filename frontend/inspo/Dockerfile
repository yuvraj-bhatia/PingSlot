FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Skip postinstall (prisma generate) during deps install; it runs in builder stage
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder

# Add build deps + OpenSSL for Prisma
# Note: openssl1.1-compat is not available in Alpine 3.22, using openssl which provides compatibility
RUN apk add --no-cache python3 make g++ openssl libc6-compat

# Build-time environment variables (NEXT_PUBLIC_* vars are embedded in the JS bundle)
ARG NEXT_PUBLIC_ML_API_BASE
ENV NEXT_PUBLIC_ML_API_BASE=${NEXT_PUBLIC_ML_API_BASE}

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (doesn't need DATABASE_URL for client generation)
RUN npx prisma generate

# Build Next.js (use next build directly, not npm run build which uses --turbopack)
ENV NEXT_TELEMETRY_DISABLED 1
# Ensure standalone output for Docker packaging
ENV DOCKER_BUILD=true
# Use next build directly instead of npm run build to avoid --turbopack flag
RUN npx next build

# Production image, copy all the files and run next
FROM base AS runner

# Add OpenSSL and compatibility libraries for Prisma
# Note: openssl1.1-compat is not available in Alpine 3.22, using openssl which provides compatibility
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node", "server.js"]
