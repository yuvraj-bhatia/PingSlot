# APTECH AI - Frontend

Next.js 15 web application for the APTECH AI Sales Productivity Platform. Built with React 19, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **UI**: React 19.1.0 + TypeScript 5.9
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Auth**: NextAuth.js 4.24.8 (JWT strategy)
- **Database ORM**: Prisma 5.21.1
- **Charts**: D3.js 7.9.0
- **Animations**: Framer Motion 12 + anime.js
- **3D Graphics**: Three.js + @react-three/fiber
- **Icons**: Lucide React
- **Forms**: react-hook-form

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (development)
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Demo Page

Visit http://localhost:3000/demo for a lightweight UI validation hub that links to
key routes and shows environment variable presence (values are never displayed).
Set `DEMO_MODE=1` to enable demo-only mock messaging.

### Environment Variables

Create `.env.local` in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aptech_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ML Backend
NEXT_PUBLIC_ML_API_BASE="http://localhost:8000"
ML_API_BASE_URL="http://localhost:8000"
APTECH_API_KEY="your-ml-api-key"

# AI Chatbot
GEMINI_API_KEY="your-gemini-api-key"

# Demo
DEMO_MODE="1"
```

## Project Structure

```
src/
├── app/                          # App Router (pages + API routes)
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── SignIn/                   # Login page
│   ├── SignUp/                   # Registration page
│   ├── dashboard/                # Main dashboard
│   │   ├── page.tsx
│   │   └── organization/         # Org settings
│   ├── ai-engine/                # ML Engine pages
│   │   ├── page.tsx              # AI dashboard
│   │   ├── playground/           # Live predictions
│   │   ├── feature-analysis/     # Feature importance
│   │   ├── visualization/        # Data visualizations
│   │   └── report-generation/    # Report builder
│   ├── settings/                 # User settings
│   │   ├── profile/
│   │   ├── security/
│   │   ├── notifications/
│   │   ├── privacy/
│   │   ├── permissions/
│   │   └── audit/
│   ├── articles/                 # Knowledge base
│   │   ├── page.tsx
│   │   ├── editor/
│   │   └── [slug]/
│   ├── forums/                   # Community forums
│   ├── support/                  # Support center
│   ├── chatbot/                  # Chat interface
│   └── api/                      # API Routes
│       ├── auth/
│       │   ├── [...nextauth]/    # NextAuth handlers
│       │   └── register/         # User registration
│       ├── chatbot/              # Chatbot endpoint
│       ├── ai-engine/            # ML API proxies
│       │   ├── datasets/
│       │   ├── models/
│       │   └── dashboard/
│       ├── user/
│       │   ├── profile/
│       │   ├── password/
│       │   └── mfa/
│       └── health/               # Health check
├── components/                   # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AuthButtons.tsx
│   ├── SessionProvider.tsx
│   ├── ConditionalLayout.tsx
│   ├── chatbot/
│   │   ├── ChatbotWidget.tsx
│   │   └── chatbot.css
│   ├── ui/
│   │   ├── form-components.tsx   # Input, Button, etc.
│   │   ├── primitives.tsx
│   │   ├── navbar.tsx
│   │   ├── gradient-button.tsx
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── dashboard-cards.tsx
│   │   │   └── PageContent.tsx
│   │   └── visualizations/       # D3 chart components
│   │       ├── D3Base.tsx
│   │       ├── BarChart.tsx
│   │       ├── LineChart.tsx
│   │       ├── ScatterPlot.tsx
│   │       └── PieChart.tsx
│   └── providers/
│       └── ThemeProvider.tsx
└── lib/                          # Utilities
    ├── auth.ts                   # NextAuth configuration
    ├── prisma.ts                 # Prisma client singleton
    ├── utils.ts                  # Helper functions
    └── ai-engine/
        └── api.ts                # ML API client
```

## Key Features

### Authentication

- **Google OAuth**: Single sign-on via Google
- **Credentials**: Email/password with bcrypt hashing
- **Session Management**: JWT-based sessions
- **MFA Support**: TOTP-based two-factor authentication

### AI Engine Pages

1. **Playground** (`/ai-engine/playground`)
   - Select trained models
   - Input feature values
   - Get real-time predictions
   - View latency metrics

2. **Feature Analysis** (`/ai-engine/feature-analysis`)
   - Feature importance charts
   - Correlation analysis
   - Statistical significance

3. **Visualization** (`/ai-engine/visualization`)
   - D3.js interactive charts
   - Model performance comparison
   - Data distribution plots

4. **Report Generation** (`/ai-engine/report-generation`)
   - Custom report creation
   - Export to PDF/Excel

### Dashboard

- KPI cards (campaigns, accuracy, performance)
- Performance trend charts
- Resource usage monitoring
- Recent activity feed

### Support System

- AI chatbot (Gemini 2.0 Flash)
- Support ticket management
- Knowledge base articles
- Community forums

## Available Scripts

```bash
# Development
npm run dev           # Start dev server (Turbopack)

# Building
npm run build         # Production build
npm run start         # Start production server

# Database
npx prisma studio     # Open database GUI
npx prisma db push    # Push schema changes
npx prisma migrate    # Run migrations
npx prisma generate   # Regenerate client

# Code Quality
npm run lint          # Biome check
npm run format        # Biome format
npx tsc --noEmit      # Typecheck

# UI smoke tests
npm run test:ui       # Playwright smoke tests (requires `npx playwright install`)
```

## Database Schema

The frontend uses Prisma with 15 models:

| Model | Description |
|-------|-------------|
| User | User accounts and authentication |
| Organization | Multi-tenant organizations |
| Account | OAuth provider accounts |
| Session | NextAuth sessions |
| VerificationToken | Email verification |
| Ticket | Support tickets |
| TicketComment | Ticket comments |
| HelpArticle | Knowledge base articles |
| UiHelpAnchor | Contextual help |
| ForumThread | Forum discussions |
| ForumReply | Forum replies |
| ChatSession | Chatbot sessions |
| ChatMessage | Chat messages |
| Subscription | Subscription plans |
| MLPrediction | AI predictions |

## API Routes

### Authentication

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/auth/register` | POST | User registration |

### User Management

| Route | Method | Description |
|-------|--------|-------------|
| `/api/user/profile` | GET | Get user profile |
| `/api/user/profile` | PUT | Update profile |
| `/api/user/password` | POST | Change password |
| `/api/user/mfa` | POST | Enable/disable MFA |

### AI Engine

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai-engine/dashboard` | GET | Dashboard metrics |
| `/api/ai-engine/datasets` | POST | Upload dataset (proxy) |
| `/api/ai-engine/models` | GET | List models |

### Support

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chatbot` | POST | Chat with AI |
| `/api/articles` | GET/POST | Articles CRUD |

## Theming

The app supports light and dark themes using CSS variables:

```css
/* Light theme */
--background: #ffffff;
--foreground: #0f172a;
--brand-primary: #1e3a8a;

/* Dark theme */
--background: #0b1220;
--foreground: #e5e7eb;
--brand-primary: #60a5fa;
```

Toggle themes using the header button. Theme preference is persisted via `next-themes`.

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

The project includes `vercel.json` configuration for optimal deployment.

### Docker

```bash
# Build image
docker build -t aptech-frontend .

# Run container
docker run -p 3000:3000 aptech-frontend
```

### Environment Notes

- Set `NODE_ENV=production` for production builds
- Ensure `DATABASE_URL` points to your production PostgreSQL
- Configure `NEXTAUTH_URL` to your production domain

## Contributing

1. Create a feature branch from `main`
2. Make changes following the code style
3. Run `npm run lint` before committing
4. Submit a PR with description of changes

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../model/README.md) - ML service
- [Architecture](../ARCHITECTURE.md) - System design
- [API Reference](../docs/API.md) - Full API docs
