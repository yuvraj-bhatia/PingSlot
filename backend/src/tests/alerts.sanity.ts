/**
 * Sanity tests for the alerts module
 * Run with: npm run test:alerts
 */

import { buildAndSendAlert } from "../alerts/index.js";
import type { Target, CheckResult } from "../alerts/index.js";

// =============================================================================
// OFFLINE FETCH STUB - Prevents network handles that cause Windows libuv issues
// =============================================================================
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url: any, _init?: any) =>
  ({
    ok: false,
    status: 404,
    headers: { get: (_: string) => null },
    text: async () => "",
    json: async () => ({}),
  } as any);

console.log("[TEST] fetch stub installed");

const LOG_PREFIX = "[TEST]";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Run a single test case
 */
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<TestResult> {
  try {
    await testFn();
    return { name, passed: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { name, passed: false, error: errorMessage };
  }
}

/**
 * Assert helper - throws if condition is false
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// =============================================================================
// TEST CASES
// =============================================================================

/**
 * Test 1: Available slot with no API keys configured
 * Expected: returns gracefully with sent=false, reason explains missing config
 */
async function testAvailableSlotNoApiKeys(): Promise<void> {
  // Ensure no API keys are set
  delete process.env.RESEND_API_KEY;
  delete process.env.REDUCTO_API_KEY;

  const target: Target = {
    id: "test-target-1",
    name: "Test Visa Appointment",
    bookingUrl: "https://example.com/book",
    type: "generic",
    requirementsUrl: "https://example.com/requirements.html",
    alertEmail: "test@example.com",
  };

  const checkResult: CheckResult = {
    status: "available",
    nextSlotTime: "2024-03-15 10:30 AM",
    bookingLink: "https://example.com/book/12345",
    requirementsBullets: [],
    email: {
      shouldSend: true,
      sent: false,
      sentTo: null,
      reason: "",
    },
  };

  // Call the function
  const result = await buildAndSendAlert({ target, checkResult });

  // Assertions
  assert(result !== null && result !== undefined, "Result should not be null/undefined");
  assert(result.sent === false, `Expected sent=false, got sent=${result.sent}`);
  assert(Array.isArray(result.requirementsBullets), "requirementsBullets should be an array");
  assert(typeof result.reason === "string", "reason should be a string");
  assert(result.reason.length > 0, "reason should be non-empty");
  assert(
    result.reason.includes("resend") || result.reason.includes("configured"),
    `Expected reason to mention resend/configured, got: "${result.reason}"`
  );
}

/**
 * Test 2: Unavailable slot with no requirementsUrl
 * Expected: returns gracefully with empty bullets
 */
async function testUnavailableSlotNoRequirementsUrl(): Promise<void> {
  // Ensure no API keys are set
  delete process.env.RESEND_API_KEY;
  delete process.env.REDUCTO_API_KEY;

  const target: Target = {
    id: "test-target-2",
    name: "Test DMV Appointment",
    bookingUrl: "https://example.com/dmv",
    type: "acuity",
    requirementsUrl: null, // No requirements URL
    alertEmail: "test@example.com",
  };

  const checkResult: CheckResult = {
    status: "unavailable",
    nextSlotTime: null,
    bookingLink: "https://example.com/dmv/book",
    requirementsBullets: [],
    email: {
      shouldSend: false,
      sent: false,
      sentTo: null,
      reason: "",
    },
  };

  // Call the function
  const result = await buildAndSendAlert({ target, checkResult });

  // Assertions
  assert(result !== null && result !== undefined, "Result should not be null/undefined");
  assert(result.sent === false, `Expected sent=false, got sent=${result.sent}`);
  assert(Array.isArray(result.requirementsBullets), "requirementsBullets should be an array");
  assert(result.requirementsBullets.length === 0, "requirementsBullets should be empty when no URL");
  assert(typeof result.reason === "string", "reason should be a string");
  assert(result.reason.length > 0, "reason should be non-empty");
}

// =============================================================================
// TEST RUNNER
// =============================================================================

async function runAllTests(): Promise<void> {
  console.log("");
  console.log("=".repeat(60));
  console.log(`${LOG_PREFIX} Alerts Module Sanity Tests`);
  console.log("=".repeat(60));
  console.log("");

  const tests = [
    { name: "Available slot + no API keys", fn: testAvailableSlotNoApiKeys },
    { name: "Unavailable slot + no requirementsUrl", fn: testUnavailableSlotNoRequirementsUrl },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await runTest(test.name, test.fn);
    results.push(result);

    if (result.passed) {
      console.log(`[PASS] ${result.name}`);
    } else {
      console.log(`[FAIL] ${result.name}`);
      console.log(`       Error: ${result.error}`);
    }
  }

  console.log("");
  console.log("-".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`${LOG_PREFIX} Results: ${passed} passed, ${failed} failed`);
  console.log("");

  if (failed > 0) {
    console.log(`${LOG_PREFIX} Some tests failed!`);
    process.exit(1);
  } else {
    console.log(`${LOG_PREFIX} All tests passed!`);
    process.exit(0);
  }
}

// Run tests with fetch restoration in finally block
(async () => {
  try {
    await runAllTests();
  } catch (err) {
    console.error(`${LOG_PREFIX} Test runner crashed:`, err);
    process.exit(1);
  } finally {
    globalThis.fetch = originalFetch;
  }
})();
