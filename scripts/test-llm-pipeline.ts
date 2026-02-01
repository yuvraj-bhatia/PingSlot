/**
 * Test script for LLM-enhanced availability extraction
 * 
 * Run with: npx tsx scripts/test-llm-pipeline.ts
 */

import {
  checkTargetAvailabilityWithLLM,
  normalizeFirecrawlText,
} from "../lib/backend/llmExtractor";

async function main() {
  console.log("🤖 Testing LLM-Enhanced Availability Pipeline\n");
  console.log("Pipeline: Firecrawl → Normalize → Groq LLM → JSON\n");
  console.log("=".repeat(60) + "\n");

  // Test target: California DMV
  const target = {
    id: "test-1",
    name: "California DMV - Appointments",
    bookingUrl: "https://www.dmv.ca.gov/portal/appointments/",
  };

  console.log(`📄 Target: ${target.name}`);
  console.log(`🔗 URL: ${target.bookingUrl}\n`);

  try {
    const result = await checkTargetAvailabilityWithLLM(target);

    console.log("\n" + "=".repeat(60));
    console.log("📊 EXTRACTION RESULT:");
    console.log("=".repeat(60) + "\n");

    console.log(`✅ Status: ${result.extraction.availability_status}`);
    console.log(`📅 Next Slot: ${result.extraction.next_available_slot || "Not detected"}`);
    console.log(`📍 Location: ${result.extraction.location || "Not detected"}`);
    console.log(`⏱️  Processing Time: ${result.processingTimeMs}ms`);
    console.log(`📝 Text Length: ${result.rawTextLength} chars`);

    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 FULL RESULT JSON:");
    console.log("=".repeat(60) + "\n");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("❌ Pipeline failed:", error);
  }

  console.log("\n🎉 Test complete!");
}

// Test normalization function
function testNormalization() {
  console.log("\n📝 Testing Text Normalization:\n");

  const testText = `
    # Schedule Your Appointment
    
    Visit https://www.dmv.ca.gov/portal/appointments/ to book.
    
    Available times:
    - Monday 9:00 AM
    - Tuesday 10:30 AM
    
    [Click here](https://example.com) to learn more.
  `;

  const normalized = normalizeFirecrawlText(testText);
  console.log("Original length:", testText.length);
  console.log("Normalized length:", normalized.length);
  console.log("\nNormalized text:");
  console.log(normalized);
}

main();
