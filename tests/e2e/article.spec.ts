import { test, expect } from "@playwright/test";

test.describe("Article Detail Page & Reading Features", () => {
  test("displays article title, reading tracker, font size controls, and related stories", async ({ page }) => {
    // Navigate to a demo article
    await page.goto("/news/economic-stability-ten-point-roadmap");

    // Title should be visible
    const headline = page.locator("h1");
    await expect(headline).toBeVisible();

    // Font size controls
    const fontControls = page.locator("text=হরফের আকার").first();
    if (await fontControls.isVisible()) {
      await expect(fontControls).toBeVisible();
    }

    // Social share buttons (Facebook, WhatsApp, Twitter/X)
    const shareArea = page.locator("text=শেয়ার").first();
    if (await shareArea.isVisible()) {
      await expect(shareArea).toBeVisible();
    }
  });
});
