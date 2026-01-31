import { expect, test } from "@playwright/test";

test("home page renders hero headline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /stop guessing/i }),
  ).toBeVisible();
});

test("demo page renders key links", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: /demo & ui smoke test/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /ai engine/i })).toBeVisible();
});

test("prediction playground renders", async ({ page }) => {
  await page.goto("/ai-engine/playground");
  await expect(
    page.getByRole("heading", { name: /prediction playground/i }),
  ).toBeVisible();
});

test("health api responds", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.status).toBe("ok");
});
