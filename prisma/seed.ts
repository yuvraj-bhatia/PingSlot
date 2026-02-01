/**
 * Database Seed Script
 * 
 * Seeds the database with:
 * - Sample targets for different appointment types
 * - Default user settings
 * 
 * IMPORTANT: These are the ONLY URLs the system will fetch.
 * The backend will NEVER discover or add new URLs automatically.
 * 
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with appointment targets...\n");

  // ============================================================================
  // Default User Settings
  // ============================================================================
  
  console.log("⚙️  Creating default user settings...");
  
  await prisma.userSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      alertEmail: "demo@example.com",
      appointmentTypes: JSON.stringify([]),  // Empty = monitor all types
      preferredStates: JSON.stringify([]),   // Empty = no location filtering
      includeNeighborStates: true,
      notifyOnAvailable: true,
      notifyOnSlotChange: true,
      notifyOnRequiresInteraction: false,
      includeRequirements: true,
      maxEmailsPerDay: 10,
    },
    update: {
      // Don't overwrite existing settings
    },
  });
  
  console.log("  ✓ Default settings created\n");

  // ============================================================================
  // DMV Targets
  // ============================================================================
  
  const dmvTargets = [
    {
      name: "California DMV - Appointments",
      bookingUrl: "https://www.dmv.ca.gov/portal/appointments/",
      platform: "generic",
      appointmentType: "dmv",
      country: "USA",
      state: "California",
      city: null,
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "San Francisco DMV Office",
      bookingUrl: "https://www.dmv.ca.gov/portal/office/san-francisco-dmv/",
      platform: "generic",
      appointmentType: "dmv",
      country: "USA",
      state: "California",
      city: "San Francisco",
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "Los Angeles DMV Office",
      bookingUrl: "https://www.dmv.ca.gov/portal/office/los-angeles-dmv/",
      platform: "generic",
      appointmentType: "dmv",
      country: "USA",
      state: "California",
      city: "Los Angeles",
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "New York DMV - Schedule",
      bookingUrl: "https://dmv.ny.gov/offices",
      platform: "generic",
      appointmentType: "dmv",
      country: "USA",
      state: "New York",
      city: null,
      alertEmail: "demo@example.com",
      active: true,
    },
  ];

  // ============================================================================
  // Passport Targets
  // ============================================================================
  
  const passportTargets = [
    {
      name: "US Passport Appointments",
      bookingUrl: "https://passportappointment.travel.state.gov/",
      platform: "generic",
      appointmentType: "passport",
      country: "USA",
      state: null,
      city: null,
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "San Francisco Passport Agency",
      bookingUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/san-francisco.html",
      platform: "generic",
      appointmentType: "passport",
      country: "USA",
      state: "California",
      city: "San Francisco",
      alertEmail: "demo@example.com",
      active: true,
    },
  ];

  // ============================================================================
  // Consulate Targets
  // ============================================================================
  
  const consulateTargets = [
    {
      name: "Indian Consulate SF - Visa Services",
      bookingUrl: "https://www.cgisf.gov.in/page/visa-services/",
      platform: "generic",
      appointmentType: "consulate",
      country: "India",
      state: "California",
      city: "San Francisco",
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "UK Visa Application Centre",
      bookingUrl: "https://www.gov.uk/apply-to-come-to-the-uk",
      platform: "generic",
      appointmentType: "consulate",
      country: "UK",
      state: null,
      city: null,
      alertEmail: "demo@example.com",
      active: true,
    },
  ];

  // ============================================================================
  // City Planning Targets
  // ============================================================================
  
  const cityPlanningTargets = [
    {
      name: "SF Planning Department",
      bookingUrl: "https://sfplanning.org/",
      platform: "generic",
      appointmentType: "city_planning",
      country: "USA",
      state: "California",
      city: "San Francisco",
      alertEmail: "demo@example.com",
      active: true,
    },
    {
      name: "LA City Planning",
      bookingUrl: "https://planning.lacity.gov/",
      platform: "generic",
      appointmentType: "city_planning",
      country: "USA",
      state: "California",
      city: "Los Angeles",
      alertEmail: "demo@example.com",
      active: true,
    },
  ];

  // ============================================================================
  // Insert All Targets
  // ============================================================================
  
  const allTargets = [
    ...dmvTargets,
    ...passportTargets,
    ...consulateTargets,
    ...cityPlanningTargets,
  ];

  console.log(`📋 Inserting ${allTargets.length} targets...\n`);

  for (const targetData of allTargets) {
    try {
      const target = await prisma.target.upsert({
        where: { bookingUrl: targetData.bookingUrl },
        update: {
          ...targetData,
          type: targetData.platform, // Keep legacy field in sync
        },
        create: {
          ...targetData,
          type: targetData.platform, // Keep legacy field in sync
        },
      });
      console.log(`  ✓ ${target.appointmentType.toUpperCase().padEnd(15)} | ${target.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to insert: ${targetData.name}`, error);
    }
  }

  // ============================================================================
  // Summary
  // ============================================================================
  
  const counts = await prisma.target.groupBy({
    by: ["appointmentType"],
    _count: true,
  });

  console.log("\n📊 Summary by appointment type:");
  for (const count of counts) {
    console.log(`  - ${count.appointmentType}: ${count._count} targets`);
  }

  console.log("\n✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
