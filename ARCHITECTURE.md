# PingSlot Architecture Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Core Purpose](#core-purpose)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [External Services](#external-services)
6. [Component Breakdown](#component-breakdown)
7. [State Management](#state-management)
8. [Current State Assessment](#current-state-assessment)
9. [Deployment Guide](#deployment-guide)
10. [Improvement Roadmap](#improvement-roadmap)

---

## Executive Summary

**PingSlot** is an appointment monitoring and alerting system that:
- Monitors public appointment booking pages for availability
- Detects meaningful changes (not spam)
- Extracts "what to bring" requirements from PDFs/HTML
- Sends smart email notifications when slots open up

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless), Prisma ORM
- **Database:** SQLite (dev), PostgreSQL-compatible (prod)
- **External APIs:** Firecrawl (scraping), Groq (LLM), Resend (email), Reducto (PDF parsing)

---

## Core Purpose

### Problem Statement
Government and service appointments (DMV, passport, consulate, etc.) are notoriously hard to book. Users must repeatedly check booking pages manually, often missing available slots.

### Solution
PingSlot automates this by:
1. **Monitoring** - Periodically checking booking URLs
2. **Detecting** - Identifying when availability changes (using keyword extraction + LLM)
3. **Alerting** - Sending email notifications only for meaningful changes
4. **Enriching** - Including "what to bring" checklists from requirements documents

### Key Design Principles
- **No spam** - Diff engine ensures duplicate alerts are never sent
- **Cache-first** - Fresh results returned instantly; Firecrawl only for stale data
- **On-demand extraction** - Requirements parsed only when user views details
- **Explicit URLs only** - Never crawls or discovers new URLs

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Dashboard   │  │   Targets    │  │   Target     │  │     Landing      │ │
│  │   (page)     │  │    List      │  │   Detail     │  │      Page        │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────────┘ │
│         │                 │                 │                                │
│  ┌──────┴─────────────────┴─────────────────┴───────────────────────────┐   │
│  │                    React Query (TanStack Query)                       │   │
│  │   • useTargets() • useTarget(id) • useStartCheckRun() • useCheckRun() │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                        │
│  ┌──────────────────────────────────┴───────────────────────────────────┐   │
│  │                         API Client (lib/apiClient.ts)                 │   │
│  │   • Typed requests • Zod validation • Error handling • Timeout        │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTP
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES (Next.js)                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ /api/targets   │  │   /api/check   │  │ /api/settings  │                 │
│  │ GET/POST       │  │   POST         │  │ GET/PATCH      │                 │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘                 │
└──────────┼───────────────────┼───────────────────┼──────────────────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND MODULES (lib/backend/)                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          PIPELINE (pipeline.ts)                          ││
│  │   Main orchestrator: runs checks, handles caching, triggers alerts       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│         │                   │                   │                   │        │
│         ▼                   ▼                   ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ Firecrawl   │    │ Diff Engine │    │Requirements │    │  Notifier   │   │
│  │ Checker     │    │(Anti-Spam)  │    │ Extractor   │    │  (Resend)   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                   │                   │                   │        │
│         ▼                   ▼                   ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ LLM Extract │    │   targets   │    │  settings   │    │  usStates   │   │
│  │   (Groq)    │    │   (CRUD)    │    │   (prefs)   │    │  (geo data) │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE (Prisma)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   targets    │  │    checks    │  │    alerts    │  │  user_settings   │ │
│  │ (monitoring) │  │  (history)   │  │  (sent mail) │  │   (preferences)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Adds Target
```
User fills form → POST /api/targets → createTarget() → Prisma INSERT → Response
                                      (no scraping)
```

### 2. User Clicks "Check Now"
```
Dashboard "Check Now" → POST /api/check → runChecks()
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            [Target 1]               [Target 2]                [Target N]
                    │                         │                         │
         ┌──────────┴──────────┐   ┌──────────┴──────────┐            ...
         │                     │   │                     │
    Cache Fresh?          Cache Fresh?              Cache Fresh?
         │                     │                         │
    YES: Return           NO: Firecrawl              YES: Return
    cached result         scrape URL                 cached result
                               │
                               ▼
                    Keyword Extraction
                               │
                     Status = "unknown"?
                               │
                      YES: Try LLM (Groq)
                               │
                               ▼
                    computeDiff() - Compare with last state
                               │
                    ┌──────────┴──────────┐
                    │                     │
            shouldAlert=true      shouldAlert=false
                    │                     │
                    ▼                     ▼
            sendNotification()     Return result
            recordAlert()          (no email)
                    │
                    ▼
            Return result
```

### 3. User Views Target Detail
```
Click target row → GET /api/targets/:id → getTargetDetail()
                                              │
                                              ▼
                                    Has requirementsUrl?
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                                   YES                  NO
                                    │                   │
                                    ▼                   ▼
                            getCachedRequirements()  Return detail
                                    │
                            ┌───────┴───────┐
                            │               │
                          Found          Not Found
                            │               │
                            ▼               ▼
                      Return cached   extractRequirements()
                                            │
                                    ┌───────┴───────┐
                                    │               │
                                  PDF?            HTML?
                                    │               │
                                    ▼               ▼
                              Reducto API     Firecrawl
                                    │               │
                                    └───────┬───────┘
                                            │
                                    Parse bullet points
                                    Cache in database
                                    Return detail
```

---

## External Services

### 1. Firecrawl (Required)
- **Purpose:** Web scraping with JavaScript rendering
- **Usage:** Fetches booking page content for availability detection
- **Cost:** Pay-per-scrape
- **Config:** `FIRECRAWL_API_KEY`
- **Features Used:**
  - `scrapeUrl()` - Basic page fetch
  - Actions API - For interactive pages (clicks, waits)

### 2. Groq LLM (Optional, Recommended)
- **Purpose:** Intelligent availability extraction when keywords fail
- **Usage:** Processes pre-fetched text (never fetches URLs)
- **Cost:** Free tier available
- **Config:** `GROQ_API_KEY`, `GROQ_MODEL` (default: llama-3.3-70b-versatile)
- **Fallback:** Keyword-based heuristics if not configured

### 3. Resend (Optional, Recommended)
- **Purpose:** Email notifications
- **Usage:** Sends alerts when slots become available
- **Cost:** Free tier (100 emails/day)
- **Config:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Fallback:** Logs to console if not configured

### 4. Reducto (Optional)
- **Purpose:** PDF text extraction for requirements documents
- **Usage:** Parses "what to bring" lists from PDF documents
- **Cost:** Pay-per-document
- **Config:** `REDUCTO_API_KEY`
- **Fallback:** Basic HTML extraction if not configured

---

## Component Breakdown

### Frontend Components

| Component | File | Responsibility | Dependencies | Dependents |
|-----------|------|----------------|--------------|------------|
| `DashboardPage` | `app/page.tsx` | Main entry, displays targets + KPIs | `useTargets`, `useStartCheckRun`, `useCheckRun` | None (page) |
| `TargetDetailPage` | `app/targets/[id]/page.tsx` | Target details, requirements, history | `useTarget` | None (page) |
| `TargetsList` | `components/TargetsList.tsx` | Renders target cards with status | `TargetSummary` type | `DashboardPage` |
| `AddTargetDrawer` | `components/AddTargetDrawer.tsx` | Form to create targets | `useCreateTarget`, `react-hook-form` | `DashboardPage` |
| `CheckNowButton` | `components/CheckNowButton.tsx` | Triggers check run | None | `DashboardPage` |
| `RunSummary` | `components/RunSummary.tsx` | Displays check run progress/results | `CheckRunResponse` type | `DashboardPage` |
| `StatusBadge` | `components/StatusBadge.tsx` | Status indicator (available/unavailable) | None | Multiple |
| `Card`, `KPICard` | `components/ui/Card.tsx` | Reusable card components | `cn` utility | Multiple |
| `Button` | `components/ui/Button.tsx` | Styled button with variants | `cn` utility | Multiple |
| `Drawer` | `components/ui/Drawer.tsx` | Radix Dialog-based drawer | `@radix-ui/react-dialog` | `AddTargetDrawer` |

### Backend Modules

| Module | File | Responsibility | External Deps | Internal Deps |
|--------|------|----------------|---------------|---------------|
| `pipeline` | `lib/backend/pipeline.ts` | Orchestrates check runs | Firecrawl, Groq | All modules |
| `firecrawlChecker` | `lib/backend/firecrawlChecker.ts` | Scrapes pages, extracts availability | Firecrawl | `config` |
| `llmExtractor` | `lib/backend/llmExtractor.ts` | LLM-based availability extraction | Groq | `config` |
| `diffEngine` | `lib/backend/diffEngine.ts` | Anti-spam logic, change detection | None | `db` |
| `notifier` | `lib/backend/notifier.ts` | Sends email alerts | Resend | `config` |
| `requirements` | `lib/backend/requirements.ts` | Extracts "what to bring" lists | Reducto, Firecrawl | `config`, `db` |
| `targets` | `lib/backend/targets.ts` | CRUD for targets | None | `db`, `requirements` |
| `settings` | `lib/backend/settings.ts` | User preferences | None | `db` |
| `searchService` | `lib/backend/searchService.ts` | Search/filter targets | None | `db` |
| `config` | `lib/backend/config.ts` | Environment variables | None | None |
| `db` | `lib/backend/db.ts` | Prisma client singleton | Prisma | None |

### Data Layer

| Hook | File | Purpose | Queries/Mutations |
|------|------|---------|-------------------|
| `useTargets` | `lib/hooks.ts` | Fetch all targets | `GET /api/targets` |
| `useTarget` | `lib/hooks.ts` | Fetch single target detail | `GET /api/targets/:id` |
| `useCreateTarget` | `lib/hooks.ts` | Create new target | `POST /api/targets` |
| `useToggleTargetActive` | `lib/hooks.ts` | Toggle active state | `PATCH /api/targets/:id` |
| `useStartCheckRun` | `lib/hooks.ts` | Start check run | `POST /api/check` |
| `useCheckRun` | `lib/hooks.ts` | Poll check run status | `GET /api/check/:runId` |

---

## State Management

### Approach: Server State with React Query

PingSlot uses **TanStack Query (React Query)** for all server state:

```typescript
// Query keys for cache management
export const queryKeys = {
  targets: {
    all: ["targets"],
    lists: () => [...queryKeys.targets.all, "list"],
    detail: (id: string) => [...queryKeys.targets.all, "detail", id],
  },
  checkRuns: {
    all: ["checkRuns"],
    detail: (runId: string) => [...queryKeys.checkRuns.all, runId],
  },
};
```

### Client State (Minimal)
- `activeRunId` - Currently running check (useState)
- `highlightedTargetIds` - Targets to highlight after check (useState)
- `openAlertId` - Expanded email alert in detail view (useState)

### No Global State Mutations
- All data flows through React Query
- Mutations invalidate relevant queries
- No Redux/Zustand/Context for data

### Side Effects
- `useEffect` for check run completion → refetch targets
- `useEffect` for error display → toast notification

---

## Current State Assessment

### ✅ Fully Functional Features

1. **Target Management**
   - Create targets with booking URL, email, type
   - List all targets with cached status
   - View target details with history
   - Toggle active/inactive

2. **Availability Checking**
   - Manual "Check Now" button
   - Firecrawl-based page scraping
   - Keyword extraction for availability detection
   - LLM fallback for unclear pages
   - Cache-first architecture (5-minute TTL)

3. **Anti-Spam Diff Engine**
   - Hash-based alert deduplication
   - Only alerts on meaningful changes
   - Tracks all sent alerts

4. **Email Notifications**
   - Resend integration
   - Plain text + HTML emails
   - Includes booking link and slot time

5. **Requirements Extraction**
   - PDF parsing via Reducto
   - HTML extraction via Firecrawl
   - On-demand loading (detail page)
   - Caching in database

6. **UI/UX**
   - Modern glassmorphism design
   - Loading skeletons
   - Error states with toasts
   - Responsive layout

### ⚠️ Partially Implemented Features

1. **Search/Filter** (`/api/search`, `/api/search-location`)
   - Backend endpoints exist
   - No frontend UI to use them
   - Location filtering by state implemented

2. **Settings Page**
   - Backend `UserSettings` model complete
   - API routes exist
   - No frontend settings UI

3. **Edit Target**
   - Backend `updateTarget()` exists
   - Edit button in UI (non-functional)
   - No edit form/drawer

4. **Delete Target**
   - Backend `deleteTarget()` exists
   - No delete button in UI

5. **Scheduled Checks**
   - Cron documentation exists
   - No actual scheduler implemented
   - Requires external cron (Vercel Cron, AWS EventBridge)

### 🔴 Critical Paths That Must Work

1. **Add Target → Check → View Status** ✅
2. **Check Now → Email Notification** ✅ (requires Resend config)
3. **View Target Detail → See Requirements** ✅ (requires Reducto for PDFs)

### 🐛 Known Issues / Technical Debt

1. **Unused variables** (ESLint warnings)
   - `queryClient` in `useStartCheckRun`
   - Various unused imports in landing page

2. **Anonymous default exports** (ESLint warnings)
   - All backend modules export `default { ... }`
   - Should be named exports

3. **Type inconsistencies**
   - `TargetStatus` type in `apiTypes.ts` vs backend
   - Some `any` types in API routes

4. **Missing error boundaries**
   - No React error boundaries
   - Errors could crash entire page

5. **No tests**
   - No unit tests
   - No integration tests
   - No E2E tests

---

## Deployment Guide

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for scraping |
| `GROQ_API_KEY` | Recommended | Groq API key for LLM extraction |
| `RESEND_API_KEY` | Recommended | Resend API key for emails |
| `RESEND_FROM_EMAIL` | If Resend | Sender email address |
| `REDUCTO_API_KEY` | Optional | Reducto API key for PDF parsing |
| `CACHE_TTL_MINUTES` | Optional | Cache TTL (default: 5) |
| `CHECK_INTERVAL_MINUTES` | Optional | Cron interval (default: 15) |

### Database Setup

```bash
# Development (SQLite)
npm run db:migrate
npm run db:seed  # Optional: sample data

# Production (PostgreSQL)
# Update DATABASE_URL to PostgreSQL connection string
npx prisma migrate deploy
```

### Build & Run

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Docker
docker build -t pingslot .
docker run -p 3000:3000 --env-file .env pingslot
```

### AWS Deployment (Terraform)

Infrastructure is defined in `/tf/`:
- VPC with public/private subnets
- Application Load Balancer
- ECS Fargate cluster
- ECR repository

```bash
# Deploy to AWS
./deploy.sh
```

### Monitoring & Logging

**Current State:**
- Console logging in backend modules
- No structured logging
- No metrics collection
- No alerting on errors

**Recommended:**
- Add structured logging (Pino/Winston)
- Integrate with CloudWatch/Datadog
- Add health check endpoint
- Monitor Firecrawl/Resend API usage

---

## Improvement Roadmap

### 🔴 Priority 1: Critical Fixes (Week 1)

1. **Fix ESLint warnings**
   - Remove unused variables
   - Convert anonymous exports to named exports
   - Add proper types where `any` is used

2. **Add error boundaries**
   - Wrap pages in error boundaries
   - Show user-friendly error messages

3. **Implement scheduled checks**
   - Add Vercel Cron or external scheduler
   - Document cron setup

4. **Add health check endpoint**
   - `/api/health` for load balancer
   - Check database connectivity

### 🟡 Priority 2: Missing Features (Week 2-3)

1. **Settings UI**
   - Create `/settings` page
   - Allow configuring alert preferences
   - Location filtering preferences

2. **Edit/Delete targets**
   - Add edit drawer
   - Add delete confirmation dialog
   - Implement in UI

3. **Search/Filter UI**
   - Add search bar to dashboard
   - Filter by appointment type
   - Filter by state/location

### 🟢 Priority 3: Refactoring (Week 4)

1. **Extract shared types**
   - Create `types/` directory
   - Share types between frontend/backend
   - Remove duplicate definitions

2. **Standardize error handling**
   - Create error classes
   - Consistent API error responses
   - Client-side error parsing

3. **Component library cleanup**
   - Document component props
   - Add Storybook (optional)
   - Ensure accessibility

### 🔵 Priority 4: Performance (Week 5)

1. **Optimize bundle size**
   - Analyze with `@next/bundle-analyzer`
   - Lazy load heavy components
   - Code split by route

2. **Add caching headers**
   - Static assets caching
   - API response caching where appropriate

3. **Database indexing**
   - Review query patterns
   - Add missing indexes

### ⚪ Priority 5: Testing (Ongoing)

1. **Unit tests**
   - Test diff engine logic
   - Test formatters
   - Test API validation

2. **Integration tests**
   - Test API routes
   - Test database operations

3. **E2E tests**
   - Test critical user flows
   - Playwright or Cypress

---

## Appendix: File Structure

```
apmac-ui/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── check/               # Check run endpoints
│   │   ├── results/             # Results endpoint
│   │   ├── search/              # Search endpoint
│   │   ├── search-llm/          # LLM search endpoint
│   │   ├── search-location/     # Location search endpoint
│   │   ├── settings/            # Settings endpoint
│   │   └── targets/             # Targets CRUD
│   ├── landing/                 # Landing page
│   ├── targets/                 # Target pages
│   │   └── [id]/               # Target detail
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Dashboard
├── components/                  # React components
│   ├── ui/                     # Primitives (Card, Button, etc.)
│   ├── AddTargetDrawer.tsx
│   ├── CheckNowButton.tsx
│   ├── Header.tsx
│   ├── PageShell.tsx
│   ├── RunSummary.tsx
│   ├── StatusBadge.tsx
│   └── TargetsList.tsx
├── lib/                        # Shared code
│   ├── backend/               # Backend modules
│   │   ├── config.ts
│   │   ├── db.ts
│   │   ├── diffEngine.ts
│   │   ├── firecrawlChecker.ts
│   │   ├── index.ts
│   │   ├── llmExtractor.ts
│   │   ├── locationSearch.ts
│   │   ├── notifier.ts
│   │   ├── pipeline.ts
│   │   ├── requirements.ts
│   │   ├── searchService.ts
│   │   ├── settings.ts
│   │   ├── targets.ts
│   │   └── usStates.ts
│   ├── apiClient.ts           # HTTP client
│   ├── apiTypes.ts            # Zod schemas + types
│   ├── cn.ts                  # Tailwind merge utility
│   ├── formatters.ts          # Date/time formatters
│   └── hooks.ts               # React Query hooks
├── prisma/                    # Database
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/                    # Static assets
├── tf/                        # Terraform (AWS)
├── Dockerfile
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

*Last updated: February 2026*
*Version: 0.1.0*
