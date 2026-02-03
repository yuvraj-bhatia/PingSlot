# 🎯 PingSlot - Portfolio Project PRD

> **AI-Powered Appointment Monitoring and Auto-Booking**
> 
> A portfolio project demonstrating end-to-end AI agent development skills.

---

## 1. Project Overview

### 1.1 What is PingSlot?

PingSlot monitors appointment booking pages (DMV, passport offices, consulates, etc.) and automatically books appointments when slots become available. It uses AI to understand page content, not just keyword matching.

### 1.2 Project Goals

| Goal | Description |
|------|-------------|
| **Type** | Portfolio/Side Project (NOT a business) |
| **Purpose** | Impress recruiters, hackathon judges, Twitter |
| **Timeline** | 2-3 weeks |
| **Success** | 50+ GitHub stars, "I'd use this" reactions |

### 1.3 The "Holy Shit" Moment

The single feature that makes this project impressive:

> **Auto-Booking Demo**: Watch the AI actually book an appointment in real-time with browser automation.

This transforms PingSlot from "another notification app" to "this person can build real AI agents."

---

## 2. Current State (50% Complete)

### 2.1 What's Done ✅

- Target CRUD (Create, Read - backend)
- Firecrawl integration for web scraping
- Anti-spam diff engine
- Email notifications via Resend
- Requirements extraction from PDFs (Reducto)
- Basic UI with TanStack Query
- Groq LLM integration for availability detection

### 2.2 What's Missing ❌

- Edit/Delete target UI
- Auto-booking feature (Playwright)
- Error boundaries
- Loading states polish
- Scheduled checks
- Live demo deployment
- Good documentation

### 2.3 Current Tech Stack

```
Frontend:     Next.js 14 (App Router), React 18, TypeScript
Styling:      Tailwind CSS
State:        TanStack Query (React Query)
Database:     Prisma ORM + SQLite (dev) / Postgres (prod)
Scraping:     Firecrawl API
LLM:          Groq (Llama 3)
Email:        Resend
PDF Parsing:  Reducto
```

---

## 3. Target Architecture

### 3.1 Microservices Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PINGSLOT                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   FRONTEND   │  │   TARGETS    │  │  SCHEDULER   │          │
│  │   SERVICE    │  │   SERVICE    │  │   SERVICE    │          │
│  │              │  │              │  │              │          │
│  │ • Next.js UI │  │ • CRUD API   │  │ • Cron jobs  │          │
│  │ • Dashboard  │  │ • Validation │  │ • Job queue  │          │
│  │ • Forms      │  │ • Database   │  │ • Triggers   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────┬────────┘                   │
│                      │             │                            │
│              ┌───────▼───────┐     │                            │
│              │    SHARED     │     │                            │
│              │   DATABASE    │     │                            │
│              │   (Prisma)    │     │                            │
│              └───────────────┘     │                            │
│                      │             │                            │
│         ┌────────────┴─────────────┤                            │
│         │                          │                            │
│  ┌──────▼───────┐  ┌───────────────▼───────────────┐           │
│  │   SCRAPER    │  │        AUTO-BOOKER            │           │
│  │   SERVICE    │  │         SERVICE               │           │
│  │              │  │                               │           │
│  │ • Firecrawl  │  │ • Playwright browser control  │           │
│  │ • AI detect  │  │ • Platform adapters           │           │
│  │ • Diff check │  │ • Form filling                │           │
│  └──────┬───────┘  │ • Real-time status            │           │
│         │          └───────────────┬───────────────┘           │
│         │                          │                            │
│  ┌──────▼───────┐  ┌───────────────▼───────────────┐           │
│  │ NOTIFICATION │  │      REQUIREMENTS             │           │
│  │   SERVICE    │  │       SERVICE                 │           │
│  │              │  │                               │           │
│  │ • Resend     │  │ • Reducto PDF parsing         │           │
│  │ • Templates  │  │ • Checklist generation        │           │
│  │ • History    │  │ • Document analysis           │           │
│  └──────────────┘  └───────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Definitions

| Service | Responsibility | Tech | Port |
|---------|---------------|------|------|
| **Frontend** | UI, user interactions, real-time updates | Next.js 14, shadcn/ui, Framer Motion | 3000 |
| **Targets** | CRUD operations, validation, database | Next.js API Routes, Prisma | 3000 |
| **Scraper** | Web scraping, AI availability detection | Firecrawl, Groq | 3001 |
| **Auto-Booker** | Browser automation, form filling | Playwright, WebSocket | 3002 |
| **Notification** | Email sending, templates, history | Resend | 3003 |
| **Requirements** | PDF parsing, checklist generation | Reducto, Groq | 3004 |
| **Scheduler** | Cron jobs, job queue, triggers | Vercel Cron / BullMQ | 3005 |

---

## 4. Feature Specifications

### 4.1 Frontend Service

#### 4.1.1 Dashboard Page (`/`)

**Requirements:**
- Display all monitoring targets as cards
- Each card shows: name, URL, status badge, last check time, next available slot
- "Check All" button triggers all target checks
- "Add Target" button opens drawer
- Quick stats: total targets, available count, emails sent today
- Empty state with illustration when no targets

**Status Badges:**
- 🟢 Green: Slots available
- 🔴 Red: No slots
- 🟡 Yellow: Checking in progress
- ⚫ Gray: Never checked / Error

**UI Components:**
```typescript
// Required shadcn/ui components
- Card, CardHeader, CardContent, CardFooter
- Button (variants: default, outline, ghost)
- Badge (variants: success, destructive, warning, secondary)
- Skeleton (for loading states)
- Drawer (for add/edit forms)
- Toast (for notifications)
```

#### 4.1.2 Add/Edit Target Drawer

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | text | Yes | 3-100 chars |
| url | url | Yes | Valid URL, reachable |
| email | email | Yes | Valid email |
| platform | select | No | acuity, calendly, generic |
| checkInterval | select | No | 5min, 15min, 30min, 1hr |

**Behavior:**
- Slide-out drawer from right
- URL validation checks if page is reachable
- Auto-detect platform from URL
- Show preview of scraped page on URL change

#### 4.1.3 Target Detail Page (`/targets/[id]`)

**Sections:**
1. **Status Hero**: Large status badge, last check time, "Check Now" button
2. **Book Now**: Opens auto-booking flow (if slots available)
3. **Requirements**: Checklist from PDF parsing
4. **Check History**: Timeline of past checks with diffs
5. **Email Log**: History of sent notifications
6. **Settings**: Edit/delete target

#### 4.1.4 Auto-Book Page (`/targets/[id]/book`)

**Layout:**
- Split screen: Control panel (left 40%), Browser view (right 60%)
- Step indicator: Navigating → Finding → Selecting → Filling → Confirming
- Real-time status updates via WebSocket
- Cancel button always visible
- Success state: Confetti animation + confirmation details

**Requirements:**
- Stream browser automation video/screenshots
- Show AI decision explanations
- Handle errors gracefully with retry option

### 4.2 Targets Service

#### 4.2.1 Database Schema

```prisma
model Target {
  id            String   @id @default(cuid())
  name          String
  url           String
  email         String
  platform      String   @default("generic")
  checkInterval Int      @default(30) // minutes
  isActive      Boolean  @default(true)
  lastCheckedAt DateTime?
  lastStatus    String?  // available, unavailable, error
  lastSlotInfo  String?  // JSON string with slot details
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  checks        Check[]
  bookings      Booking[]
}

model Check {
  id           String   @id @default(cuid())
  targetId     String
  target       Target   @relation(fields: [targetId], references: [id])
  status       String   // available, unavailable, error
  rawContent   String?  @db.Text
  aiAnalysis   String?  @db.Text // JSON
  slotDetails  String?  // JSON with available slots
  diffFromLast String?  @db.Text
  createdAt    DateTime @default(now())
}

model Booking {
  id              String   @id @default(cuid())
  targetId        String
  target          Target   @relation(fields: [targetId], references: [id])
  status          String   // pending, success, failed
  slotDateTime    DateTime?
  confirmationNum String?
  screenshotUrl   String?
  errorMessage    String?
  createdAt       DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  targetId  String
  type      String   // availability, booking_success, booking_failed
  email     String
  subject   String
  sentAt    DateTime @default(now())
  resendId  String?
}

model Requirement {
  id          String   @id @default(cuid())
  targetId    String
  sourceUrl   String?
  items       String   @db.Text // JSON array of requirement items
  extractedAt DateTime @default(now())
}
```

#### 4.2.2 API Endpoints

```typescript
// Targets CRUD
GET    /api/targets          // List all targets
POST   /api/targets          // Create target
GET    /api/targets/[id]     // Get target details
PATCH  /api/targets/[id]     // Update target
DELETE /api/targets/[id]     // Delete target

// Actions
POST   /api/targets/[id]/check    // Trigger manual check
POST   /api/targets/[id]/book     // Start auto-booking
GET    /api/targets/[id]/checks   // Get check history
GET    /api/targets/[id]/bookings // Get booking history

// Bulk
POST   /api/targets/check-all     // Check all active targets
```

### 4.3 Scraper Service

#### 4.3.1 Core Functions

```typescript
interface ScraperService {
  // Scrape a URL and return content
  scrape(url: string): Promise<ScrapeResult>;
  
  // Analyze content for availability using AI
  analyzeAvailability(content: string, platform: string): Promise<AvailabilityResult>;
  
  // Compare with previous content
  computeDiff(current: string, previous: string): Promise<DiffResult>;
  
  // Determine if notification should be sent
  shouldNotify(current: AvailabilityResult, previous: AvailabilityResult | null): boolean;
}

interface ScrapeResult {
  success: boolean;
  content: string;      // Cleaned text content
  html: string;         // Raw HTML
  screenshot?: string;  // Base64 screenshot
  error?: string;
}

interface AvailabilityResult {
  hasAvailability: boolean;
  confidence: number;   // 0-1
  slots: SlotInfo[];
  reasoning: string;    // AI explanation
}

interface SlotInfo {
  datetime: string;
  location?: string;
  type?: string;
  rawText: string;
}
```

#### 4.3.2 AI Prompt for Availability Detection

```
You are analyzing a webpage to determine if appointments are available.

Page content:
{content}

Platform type: {platform}

Analyze this page and return JSON:
{
  "hasAvailability": boolean,
  "confidence": number (0-1),
  "slots": [
    {
      "datetime": "ISO string or descriptive",
      "location": "if mentioned",
      "type": "appointment type if mentioned",
      "rawText": "exact text from page"
    }
  ],
  "reasoning": "brief explanation of your analysis"
}

Be conservative - only mark hasAvailability true if you're confident slots can be booked.
```

### 4.4 Auto-Booker Service

#### 4.4.1 Architecture

```typescript
interface AutoBookerService {
  // Start a booking session
  startBooking(targetId: string, userProfile: UserProfile): Promise<BookingSession>;
  
  // Get real-time status
  getStatus(sessionId: string): BookingStatus;
  
  // Cancel ongoing booking
  cancel(sessionId: string): Promise<void>;
  
  // Stream events via WebSocket
  subscribeToEvents(sessionId: string): EventStream;
}

interface BookingSession {
  id: string;
  targetId: string;
  status: 'initializing' | 'navigating' | 'finding_slots' | 'selecting' | 'filling_form' | 'confirming' | 'success' | 'failed';
  currentStep: number;
  totalSteps: number;
  screenshot?: string;
  error?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  // Add more fields as needed for forms
}
```

#### 4.4.2 Platform Adapters

Each booking platform needs an adapter:

```typescript
interface PlatformAdapter {
  name: string;
  urlPattern: RegExp;
  
  // Detect if this adapter handles the URL
  canHandle(url: string): boolean;
  
  // Find available slots on the page
  findSlots(page: Page): Promise<SlotElement[]>;
  
  // Select a specific slot
  selectSlot(page: Page, slot: SlotElement): Promise<void>;
  
  // Fill the booking form
  fillForm(page: Page, profile: UserProfile): Promise<void>;
  
  // Confirm the booking
  confirm(page: Page): Promise<BookingConfirmation>;
}

// Initial adapters to implement:
// 1. AcuityAdapter - Acuity Scheduling pages
// 2. CalendlyAdapter - Calendly pages
// 3. GenericAdapter - Best-effort for unknown platforms
```

#### 4.4.3 Playwright Integration

```typescript
import { chromium, Browser, Page } from 'playwright';

class BookingEngine {
  private browser: Browser | null = null;
  
  async initialize() {
    this.browser = await chromium.launch({
      headless: false, // Show browser for demo
      slowMo: 100,     // Slow down for visibility
    });
  }
  
  async book(target: Target, profile: UserProfile, onStatus: StatusCallback) {
    const page = await this.browser.newPage();
    const adapter = this.getAdapter(target.url);
    
    try {
      // Step 1: Navigate
      onStatus({ step: 'navigating', screenshot: await page.screenshot() });
      await page.goto(target.url);
      
      // Step 2: Find slots
      onStatus({ step: 'finding_slots', screenshot: await page.screenshot() });
      const slots = await adapter.findSlots(page);
      
      if (slots.length === 0) {
        throw new Error('No slots available');
      }
      
      // Step 3: Select first available slot
      onStatus({ step: 'selecting', screenshot: await page.screenshot() });
      await adapter.selectSlot(page, slots[0]);
      
      // Step 4: Fill form
      onStatus({ step: 'filling_form', screenshot: await page.screenshot() });
      await adapter.fillForm(page, profile);
      
      // Step 5: Confirm
      onStatus({ step: 'confirming', screenshot: await page.screenshot() });
      const confirmation = await adapter.confirm(page);
      
      onStatus({ step: 'success', confirmation, screenshot: await page.screenshot() });
      return confirmation;
      
    } catch (error) {
      onStatus({ step: 'failed', error: error.message, screenshot: await page.screenshot() });
      throw error;
    } finally {
      await page.close();
    }
  }
}
```

### 4.5 Notification Service

#### 4.5.1 Email Templates

**Availability Alert:**
```
Subject: 🎯 Appointment Available: {targetName}

Hey!

Good news - an appointment slot is now available!

📍 {targetName}
🔗 {targetUrl}
📅 Available: {slotInfo}

[Book Now Button]

---
PingSlot is monitoring this page for you.
```

**Booking Confirmation:**
```
Subject: ✅ Booked: {targetName}

Your appointment has been booked!

📍 {targetName}
📅 {appointmentDateTime}
🔖 Confirmation: {confirmationNumber}

📋 What to Bring:
{requirementsList}

[Add to Calendar Button]

---
PingSlot booked this for you automatically.
```

#### 4.5.2 API

```typescript
interface NotificationService {
  sendAvailabilityAlert(target: Target, slots: SlotInfo[]): Promise<void>;
  sendBookingConfirmation(booking: Booking, requirements: Requirement[]): Promise<void>;
  sendBookingFailed(target: Target, error: string): Promise<void>;
  getHistory(targetId: string): Promise<Notification[]>;
}
```

### 4.6 Requirements Service

#### 4.6.1 PDF Processing

```typescript
interface RequirementsService {
  // Extract requirements from a URL (PDF or webpage)
  extract(sourceUrl: string): Promise<RequirementItem[]>;
  
  // Generate checklist from extracted items
  generateChecklist(items: RequirementItem[]): Checklist;
  
  // Get requirements for a target
  getForTarget(targetId: string): Promise<Requirement | null>;
}

interface RequirementItem {
  text: string;
  category: 'document' | 'payment' | 'preparation' | 'other';
  required: boolean;
  details?: string;
}
```

#### 4.6.2 AI Prompt for Requirements Extraction

```
Analyze this document and extract all requirements for the appointment.

Document content:
{content}

Return JSON:
{
  "items": [
    {
      "text": "requirement description",
      "category": "document|payment|preparation|other",
      "required": true|false,
      "details": "additional context if any"
    }
  ]
}

Categories:
- document: IDs, forms, certificates to bring
- payment: fees, payment methods
- preparation: things to do before (e.g., fill forms online)
- other: anything else
```

### 4.7 Scheduler Service

#### 4.7.1 Job Types

```typescript
type JobType = 
  | 'check_target'      // Check a single target
  | 'check_all'         // Check all active targets
  | 'cleanup_old_checks' // Remove old check records
  | 'retry_failed_booking'; // Retry failed bookings

interface ScheduledJob {
  id: string;
  type: JobType;
  targetId?: string;
  scheduledFor: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}
```

#### 4.7.2 Vercel Cron Configuration

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-all",
      "schedule": "*/15 * * * *"  // Every 15 minutes
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"     // Daily at midnight
    }
  ]
}
```

---

## 5. Implementation Priorities

### 5.1 Week 1: Foundation & Polish

| Day | Tasks | Outcome |
|-----|-------|---------|
| 1-2 | Fix ESLint, add error boundaries, complete edit/delete UI | App doesn't crash |
| 3-4 | Add shadcn/ui, redesign dashboard, improve loading states | Looks professional |
| 5 | Deploy to Vercel, configure env vars, test production | Live demo URL |

### 5.2 Week 2: Auto-Booking (The Star Feature)

| Day | Tasks | Outcome |
|-----|-------|---------|
| 1-2 | Set up Playwright, create Acuity adapter, test on demo page | Can book programmatically |
| 3-4 | Build auto-book UI, split screen, step indicator | User can watch booking |
| 5 | Add WebSocket for real-time status, polish animations | Smooth experience |

### 5.3 Week 3: Documentation & Launch

| Day | Tasks | Outcome |
|-----|-------|---------|
| 1-2 | Write README, architecture diagram, screenshots + GIFs | Great GitHub presence |
| 3 | Record demo video, Twitter thread, blog post | Shareable content |
| 4-5 | Buffer for bugs and polish | Production ready |

---

## 6. File Structure

```
pingslot/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Dashboard
│   ├── targets/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Target detail
│   │   │   └── book/
│   │   │       └── page.tsx      # Auto-book page
│   └── api/
│       ├── targets/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/
│       │       ├── route.ts      # GET, PATCH, DELETE
│       │       ├── check/
│       │       │   └── route.ts
│       │       └── book/
│       │           └── route.ts
│       ├── cron/
│       │   ├── check-all/
│       │   │   └── route.ts
│       │   └── cleanup/
│       │       └── route.ts
│       └── ws/
│           └── booking/
│               └── route.ts      # WebSocket for booking status
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/
│   │   ├── TargetCard.tsx
│   │   ├── QuickStats.tsx
│   │   └── EmptyState.tsx
│   ├── targets/
│   │   ├── AddTargetDrawer.tsx
│   │   ├── EditTargetDrawer.tsx
│   │   ├── StatusBadge.tsx
│   │   └── CheckHistory.tsx
│   └── booking/
│       ├── BookingView.tsx
│       ├── StepIndicator.tsx
│       └── BrowserStream.tsx
│
├── services/
│   ├── scraper/
│   │   ├── index.ts
│   │   ├── firecrawl.ts
│   │   └── analyzer.ts
│   ├── booker/
│   │   ├── index.ts
│   │   ├── engine.ts
│   │   └── adapters/
│   │       ├── base.ts
│   │       ├── acuity.ts
│   │       ├── calendly.ts
│   │       └── generic.ts
│   ├── notification/
│   │   ├── index.ts
│   │   ├── resend.ts
│   │   └── templates/
│   │       ├── availability.tsx
│   │       └── confirmation.tsx
│   ├── requirements/
│   │   ├── index.ts
│   │   └── reducto.ts
│   └── scheduler/
│       └── index.ts
│
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── groq.ts                   # Groq client
│   └── utils.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── images/
│
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 7. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# External APIs
FIRECRAWL_API_KEY="..."
GROQ_API_KEY="..."
RESEND_API_KEY="..."
REDUCTO_API_KEY="..."

# App Config
NEXT_PUBLIC_APP_URL="https://pingslot.vercel.app"
CRON_SECRET="..."  # For securing cron endpoints
```

---

## 8. Success Criteria

### 8.1 Minimum (Must Have)

- [ ] Live demo URL that doesn't crash
- [ ] Can add 3 targets and check them without errors
- [ ] At least one working auto-booking demo (Acuity)
- [ ] Email notifications work
- [ ] README with GIF and clear description
- [ ] 60-second demo script practiced and smooth

### 8.2 Impressive (Aim For)

- [ ] 50+ GitHub stars
- [ ] UI looks like a real product
- [ ] Technical writeup gets 1000+ views
- [ ] Someone says "I'd actually use this" unprompted
- [ ] Gets mentioned in an interview as impressive project

---

## 9. Demo Script

### 60-Second Version

1. **[0-10s]** Show dashboard with 3 targets
2. **[10-20s]** Click "Check All", show AI understanding availability
3. **[20-40s]** Click "Book Now", show browser automation live
4. **[40-50s]** Show confirmation + email with checklist
5. **[50-60s]** "Built with Next.js, Playwright, Groq. Open source."

---

## 10. Links & Resources

- **Firecrawl Docs**: https://docs.firecrawl.dev
- **Playwright Docs**: https://playwright.dev/docs
- **Groq Docs**: https://console.groq.com/docs
- **Resend Docs**: https://resend.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vercel Cron**: https://vercel.com/docs/cron-jobs

---

*Last Updated: February 2026*