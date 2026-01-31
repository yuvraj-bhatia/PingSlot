# PingSlot Backend

Node.js + TypeScript + Express backend for PingSlot.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend` directory:
```env
DATABASE_PATH=./pingslot.db
PORT=3000
```

3. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Health Check
- **GET** `/health` → `{ ok: true, name: "PingSlot" }`

### Targets
- **POST** `/api/targets` - Create a new target
  - Body: `{ name, bookingUrl, type, alertEmail, requirementsUrl? }`
  - Returns: Created target object

- **GET** `/api/targets` - Get all targets with last check summary
  - Returns: Array of targets with `lastStatus`, `lastNextSlotTime`, `lastCheckedAt`

### Checks
- **POST** `/api/check` - Run checks on all active targets
  - Returns: `{ results: CheckResult[] }`
  - Note: MVP version returns `status: "unknown"` (no Firecrawl integration yet)

- **GET** `/api/results?targetId=<id>` - Get check results for a specific target
  - Returns: `{ latestCheck, recentChecks }` (last 5 checks)

## Database

Uses `better-sqlite3` with three tables:
- `targets` - Booking targets to monitor
- `checks` - Check results history
- `alerts` - Email alert deduplication

Database file location is configured via `DATABASE_PATH` env variable.

## Scripts

- `npm run dev` - Start development server with hot reload (tsx)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build
