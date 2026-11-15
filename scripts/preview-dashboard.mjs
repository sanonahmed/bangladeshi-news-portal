import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const dir = "artifacts/admin-dashboard";
await fs.mkdir(dir, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/traffic/**", route => route.fulfill({ json: { activeReaders: 247, trendingStories: [] } }));
  await page.goto("http://localhost:3001/admin-design-preview", { waitUntil: "networkidle", timeout: 90000 });
  await page.screenshot({ path: `${dir}/desktop.png`, fullPage: true });
  console.log("DESKTOP", await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyFont: getComputedStyle(document.body).fontFamily, panels: document.querySelectorAll("section").length })));
  await page.getByRole("textbox", { name: "Search stories" }).fill("football");
  await page.screenshot({ path: `${dir}/filtered.png` });
  console.log("FILTERED", await page.getByPlaceholder("Search stories").inputValue());
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("combobox", { name: "Filter by status" }).selectOption("draft");
  console.log("DRAFT_ROWS", await page.locator("article").count());
  await page.getByRole("combobox", { name: "Filter by status" }).selectOption("all");
  await page.getByRole("tab", { name: "Popular" }).click();
  console.log("TAB", await page.getByRole("tab", { name: "Popular" }).getAttribute("aria-selected"));
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.screenshot({ path: `${dir}/dark.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Light mode" }).click();
  await page.screenshot({ path: `${dir}/mobile.png`, fullPage: true });
  console.log("MOBILE", await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth })));
  console.log("ERRORS", errors);
} finally { await browser.close(); }
