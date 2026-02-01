/**
 * Test script to verify Firecrawl integration
 * Run with: npx tsx scripts/test-firecrawl.ts
 */

import FirecrawlApp from "@mendable/firecrawl-js";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "fc-c8fe7e2e4ea54fe4acea4ae1b9e404eb";

async function testFirecrawlScrape() {
  console.log("🔥 Testing Firecrawl Integration\n");
  console.log("API Key:", FIRECRAWL_API_KEY.slice(0, 10) + "...\n");

  const client = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

  // Test 1: Scrape the CA DMV appointments page
  console.log("📄 Test 1: Scraping CA DMV Appointments Page");
  console.log("URL: https://www.dmv.ca.gov/portal/appointments/\n");

  try {
    const result = await client.scrapeUrl("https://www.dmv.ca.gov/portal/appointments/", {
      formats: ["markdown"],
    });

    if (result.success) {
      console.log("✅ Scrape successful!\n");
      console.log("--- Page Content (first 2000 chars) ---");
      console.log(result.markdown?.slice(0, 2000));
      console.log("\n--- End of content ---\n");

      // Check for availability keywords
      const text = (result.markdown || "").toLowerCase();
      const hasBookNow = text.includes("book now") || text.includes("schedule");
      const hasNoAvailability = text.includes("no availability") || text.includes("no appointments");

      console.log("📊 Analysis:");
      console.log(`  - Contains 'book now' or 'schedule': ${hasBookNow}`);
      console.log(`  - Contains 'no availability': ${hasNoAvailability}`);
      console.log(`  - Likely status: ${hasNoAvailability ? "UNAVAILABLE" : hasBookNow ? "AVAILABLE" : "UNKNOWN"}`);
    } else {
      console.log("❌ Scrape failed:", result);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 2: Scrape SF DMV specifically
  console.log("\n\n📄 Test 2: Scraping SF DMV Office Page");
  console.log("URL: https://www.dmv.ca.gov/portal/office/san-francisco-dmv/\n");

  try {
    const result = await client.scrapeUrl("https://www.dmv.ca.gov/portal/office/san-francisco-dmv/", {
      formats: ["markdown"],
    });

    if (result.success) {
      console.log("✅ Scrape successful!\n");
      console.log("--- Page Content (first 2000 chars) ---");
      console.log(result.markdown?.slice(0, 2000));
      console.log("\n--- End of content ---\n");

      // Look for appointment-related content
      const text = (result.markdown || "").toLowerCase();
      const hasAppointment = text.includes("appointment");
      const hasWaitTime = text.includes("wait time");
      const hasHours = text.includes("hours") || text.includes("open");

      console.log("📊 Analysis:");
      console.log(`  - Contains 'appointment': ${hasAppointment}`);
      console.log(`  - Contains 'wait time': ${hasWaitTime}`);
      console.log(`  - Contains hours info: ${hasHours}`);
    } else {
      console.log("❌ Scrape failed:", result);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n\n🎉 Firecrawl test complete!");
}

testFirecrawlScrape();
