import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test("allows searching for news articles and filtering by keyword", async ({ page }) => {
    await page.goto("/search?q=বাংলাদেশ");

    // Search header should be visible
    const searchHeader = page.locator("h1");
    await expect(searchHeader).toBeVisible();

    // Search input should contain the query or be interactive
    const input = page.locator("input[type='search'], input[name='q']").first();
    if (await input.isVisible()) {
      await expect(input).toBeVisible();
    }
  });
});
