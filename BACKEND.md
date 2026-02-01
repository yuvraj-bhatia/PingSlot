# PingSlot Backend

**P**ing**S**lot - Appointment Monitoring & Alerting

A backend system that monitors public appointment pages, detects real changes in availability, enriches results with requirements, and sends smart notifications.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Scheduler / Check Now                       │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Crawl + Extract Engine (Firecrawl)             │
│   • Fetch booking page                                          │
│   • Extract availability + next slot                            │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  State & Diff Engine (Anti-Spam Brain)          │
│   • Compare with last known state                               │
│   • Detect meaningful changes only                              │
│   • Generate dedupe hash                                        │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  If Meaningful Change Detected                   │
│   ┌─────────────────────┐    ┌──────────────────────────────┐  │
│   │ Extract Requirements │ → │ Send Email (Resend)          │  │
│   │ (Reducto for PDFs)   │    │ • Next slot time             │  │
│   └─────────────────────┘    │ • Booking link               │  │
│                               │ • Requirements checklist     │  │
│                               └──────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Persist Results + Alerts                        │
│   • checks table (observability)                                │
│   • alerts table (deduplication proof)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Database (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"

# Firecrawl - Web scraping (https://firecrawl.dev)
FIRECRAWL_API_KEY="your-firecrawl-api-key"

# Resend - Email notifications (https://resend.com)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="PingSlot Alerts <alerts@yourdomain.com>"

# Optional: Reducto for PDF parsing (https://reducto.ai)
REDUCTO_API_KEY=""
```

### 3. Initialize Database

```bash
npm run db:migrate
npm run db:seed  # Optional: adds sample targets
```

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Targets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/targets` | List all targets with status |
| `GET` | `/api/targets/:id` | Get target details + history |
| `POST` | `/api/targets` | Create new target |
| `PATCH` | `/api/targets/:id` | Update target |
| `DELETE` | `/api/targets/:id` | Delete target |

### Check Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/check` | Run checks for all active targets |
| `POST` | `/api/check` | Run checks for specific targets (body: `{targetIds: [...]}`) |
| `POST` | `/api/check/:targetId` | Run check for single target |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/results?targetId=...` | Get latest result + history |

## Database Schema

### targets
```
id              String   Primary key
name            String   Display name
booking_url     String   URL to monitor
type            String   "acuity" | "generic" | "unknown"
requirements_url String? URL to requirements page/PDF
alert_email     String   Email for notifications
active          Boolean  Whether to include in checks
```

### checks
```
id              String   Primary key
target_id       String   Foreign key → targets
status          String   "available" | "unavailable" | "unknown" | "error"
next_slot_time  DateTime? Detected next slot
booking_link    String?  Direct booking URL
checked_at      DateTime When check ran
raw_text        String?  Debug info
error_message   String?  Error details if failed
```

### alerts
```
id              String   Primary key
target_id       String   Foreign key → targets
dedupe_hash     String   Unique (target_id + next_slot_time)
sent_to         String   Email address
sent_at         DateTime When sent
next_slot_time  DateTime? Slot that triggered alert
email_id        String?  Resend tracking ID
```

## Backend Modules

### `/lib/backend/`

| Module | Purpose |
|--------|---------|
| `db.ts` | Prisma client singleton |
| `config.ts` | Environment configuration |
| `crawler.ts` | Firecrawl integration + extraction |
| `diffEngine.ts` | State comparison + anti-spam logic |
| `requirements.ts` | PDF/HTML requirements extraction |
| `notifier.ts` | Resend email integration |
| `pipeline.ts` | Main check orchestrator |
| `targets.ts` | Target CRUD operations |
| `index.ts` | Central exports |

## Diff Engine Rules

The diff engine ensures no spam by only alerting on meaningful changes:

| Previous State | Current State | Alert? | Reason |
|----------------|---------------|--------|--------|
| unavailable | available | ✅ Yes | Slot opened up |
| available | available (earlier slot) | ✅ Yes | Better opportunity |
| error/unknown | available | ✅ Yes | Recovered to available |
| available | unavailable | ❌ No | Lost availability |
| unavailable | unavailable | ❌ No | Still unavailable |
| * | * (same dedupe hash) | ❌ No | Already alerted |

## Extraction Strategies

### Acuity Scheduling
- Looks for "No availability" patterns
- Extracts time slot patterns (9:00 AM, 14:30)
- Parses date patterns (Monday, January 15)

### Generic
- Keyword detection (book now, no appointments, etc.)
- Date/time pattern matching
- Fallback for unknown booking systems

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes (dev only)
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## Production Deployment

1. Set `DATABASE_URL` to your production database
2. Configure `FIRECRAWL_API_KEY` and `RESEND_API_KEY`
3. Set up a cron job to call `POST /api/check` every 10-30 minutes
4. Deploy to Vercel, Railway, or your preferred platform

## Why This Architecture?

1. **Real change detection** - Not polling spam, only meaningful alerts
2. **Deduplication built-in** - Hash-based alert tracking
3. **Requirements enrichment** - PDF → checklist extraction
4. **Observability** - Every check is logged for debugging
5. **Clean separation** - Each module has one job
