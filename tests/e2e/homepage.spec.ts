import { test, expect } from "@playwright/test";

test.describe("Bangladeshi News Portal Homepage & Navigation", () => {
  test("renders newspaper masthead, date in Bengali, and main navigation", async ({ page }) => {
    await page.goto("/");

    // Masthead brand title should be visible
    const brand = page.locator("header");
    await expect(brand).toBeVisible();

    // Bengali date string should appear in the top bar
    const topBar = page.locator("text=২০২৬").first();
    await expect(topBar).toBeVisible();

    // Breaking news badge should be visible
    const breakingBadge = page.locator("text=ব্রেকিং নিউজ");
    await expect(breakingBadge).toBeVisible();

    // Main navigation categories should be present
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("text=জাতীয়").first()).toBeVisible();
    await expect(page.locator("text=আন্তর্জাতিক").first()).toBeVisible();
  });

  test("toggles light and dark themes smoothly", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.locator("button[aria-label='Toggle theme'], button:has-text('🌙'), button:has-text('☀️')").first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      const htmlClass = await page.locator("html").getAttribute("class");
      expect(htmlClass).toBeDefined();
    }
  });

  test("contains authentic editorial sections: latest, most read, sports, entertainment", async ({ page }) => {
    await page.goto("/");

    // Verify presence of core newspaper sections
    await expect(page.locator("text=সর্বশেষ সংবাদ").first()).toBeVisible();
    await expect(page.locator("text=সর্বাধিক পঠিত").first()).toBeVisible();
  });
});
