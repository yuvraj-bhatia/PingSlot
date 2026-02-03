import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
  // Database & Types
  'prisma/schema.prisma',
  'lib/db.ts',
  'lib/types.ts',
  'lib/validations.ts',

  // API Routes
  'app/api/targets/route.ts',
  'app/api/targets/[id]/route.ts',
  'app/api/targets/[id]/check/route.ts',
  'app/api/targets/[id]/book/route.ts',

  // Scraper Service
  'services/scraper/index.ts',
  'services/scraper/types.ts',
  'services/scraper/firecrawl.ts',
  'services/scraper/analyzer.ts',
  'services/scraper/differ.ts',

  // Auto-Booker Service
  'services/booker/index.ts',
  'services/booker/types.ts',
  'services/booker/engine.ts',
  'services/booker/screenshot.ts',
  'services/booker/adapters/index.ts',
  'services/booker/adapters/base.ts',
  'services/booker/adapters/acuity.ts',

  // Notification Service
  'services/notification/index.ts',
  'services/notification/resend.ts',

  // Requirements Service
  'services/requirements/index.ts',

  // Frontend Components
  'app/page.tsx',
  'app/layout.tsx',
  'app/targets/[id]/page.tsx',
  'app/targets/[id]/book/page.tsx',
  'components/dashboard/TargetCard.tsx',
  'components/dashboard/TargetGrid.tsx',
  'components/targets/AddTargetDrawer.tsx',
  'components/targets/StatusBadge.tsx',
  'components/booking/BookingView.tsx',
  'components/booking/StepIndicator.tsx',
];

const RECOMMENDED_FILES = [
  // API Routes
  'app/api/targets/[id]/checks/route.ts',
  'app/api/targets/[id]/bookings/route.ts',
  'app/api/check-all/route.ts',

  // Scraper Service
  'services/scraper/platforms/acuity.ts',

  // Auto-Booker Service
  'services/booker/adapters/calendly.ts',
  'services/booker/adapters/generic.ts',

  // Notification Service
  'services/notification/templates/availability.tsx',
  'services/notification/templates/confirmation.tsx',

  // Requirements Service
  'services/requirements/reducto.ts',

  // Frontend Components
  'components/dashboard/QuickStats.tsx',
  'components/dashboard/EmptyState.tsx',
  'components/targets/EditTargetDrawer.tsx',
  'components/booking/BrowserStream.tsx',
  'components/ErrorBoundary.tsx',
];

function checkFiles(label: string, files: string[]) {
  const missing: string[] = [];
  const found: string[] = [];

  for (const file of files) {
    const resolved = path.join(process.cwd(), file);
    if (fs.existsSync(resolved)) {
      found.push(file);
    } else {
      missing.push(file);
    }
  }

  console.log(`\n=== ${label} ===\n`);
  console.log(`✅ Found: ${found.length}/${files.length}`);
  console.log(`❌ Missing: ${missing.length}/${files.length}`);

  if (missing.length > 0) {
    console.log('\nMissing files:');
    missing.forEach((f) => console.log(`  - ${f}`));
  }

  return { found, missing };
}

function run() {
  console.log('=== FILE AUDIT REPORT ===');
  checkFiles('Required Files', REQUIRED_FILES);
  checkFiles('Recommended Files', RECOMMENDED_FILES);
}

run();
