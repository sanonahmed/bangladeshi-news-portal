import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3001";
const artifacts = path.join(os.tmpdir(), "newsroom-story-composer");
await fs.mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
// Next.js renders a route announcer with role="alert", so form alerts must be scoped.
const formAlert = (page) =>
  page.getByRole("form", { name: "Create new story" }).getByRole("alert");

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/auth/**", (route) =>
    route.fulfill({
      json: { user: { name: "Preview Editor", role: "editor" } },
    }),
  );
  await page.route("**/api/features", (route) =>
    route.fulfill({ json: { "module.ab_testing": true } }),
  );
  await page.goto(`${baseURL}/admin-design-preview/story`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await expect(
    page.getByRole("heading", { name: "Create a new story" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Story body", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(artifacts, "desktop-empty.png"),
    fullPage: true,
  });

  const assertNoOverflow = async () => {
    const sizes = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  };
  await assertNoOverflow();
  await page
    .getByRole("button", { name: "Publish story", exact: true })
    .first()
    .click();
  await expect(formAlert(page)).toContainText("Add a headline");

  await page
    .getByLabel("Story headline *", { exact: true })
    .fill("বাংলাদেশে টেকসই কৃষিতে নতুন সম্ভাবনা");
  await page
    .getByLabel("English headline", { exact: true })
    .fill("A new chapter for sustainable farming in Bangladesh");
  await expect(page.getByLabel("Story URL", { exact: true })).toHaveValue(
    "a-new-chapter-for-sustainable-farming-in-bangladesh",
  );
  await page
    .getByLabel("Story summary", { exact: true })
    .fill(
      "A community-led initiative is helping coastal farmers adapt to a changing climate and build a more resilient future.",
    );
  await page
    .getByRole("textbox", { name: "Story body", exact: true })
    .fill(
      "Farmers across coastal Bangladesh are working together to protect their livelihoods. The initiative combines local knowledge with new techniques to improve the quality of their harvest.",
    );
  await page
    .getByLabel("Division", { exact: true })
    .selectOption("preview-dhaka");
  await page
    .getByLabel("District", { exact: true })
    .selectOption("preview-gazipur");
  await page.getByLabel("Featured story", { exact: true }).check();
  await expect(
    page.getByText("Saved in this browser", { exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("4/5", { exact: true })).toBeVisible();
  await expect(page.getByText("80%", { exact: true })).toBeVisible();
  await page.screenshot({
    path: path.join(artifacts, "desktop-filled.png"),
    fullPage: true,
  });

  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Restore draft", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Story body", exact: true }),
  ).toContainText("Farmers across coastal Bangladesh");
  await expect(page.getByLabel("District", { exact: true })).toHaveValue(
    "preview-gazipur",
  );
  await expect(
    page.getByLabel("Featured story", { exact: true }),
  ).toBeChecked();
  await page
    .getByLabel("Division", { exact: true })
    .selectOption("preview-sylhet");
  await expect(page.getByLabel("District", { exact: true })).toHaveValue("");

  await page
    .getByRole("button", { name: "Save draft", exact: true })
    .first()
    .click();
  const draftPayload = JSON.parse(
    await page.getByTestId("preview-story-payload").textContent(),
  );
  expect(draftPayload.status).toBe("draft");
  expect(draftPayload.scheduledAt).toBeUndefined();
  expect(draftPayload.title).toBe("বাংলাদেশে টেকসই কৃষিতে নতুন সম্ভাবনা");
  expect(draftPayload.content).toContain("Farmers across coastal Bangladesh");

  await page
    .getByLabel("Publishing status", { exact: true })
    .selectOption("scheduled");
  await page
    .getByRole("button", { name: "Schedule story", exact: true })
    .first()
    .click();
  await expect(formAlert(page)).toContainText("Choose a future date");
  await page
    .getByLabel("Publication date & time", { exact: true })
    .fill("2099-01-01T10:00");
  await page
    .getByRole("button", { name: "Schedule story", exact: true })
    .first()
    .click();
  const schedulePayload = JSON.parse(
    await page.getByTestId("preview-story-payload").textContent(),
  );
  expect(schedulePayload.status).toBe("approved");
  expect(schedulePayload.scheduledAt).toContain("2099-01-01");

  await page
    .getByLabel("Preview role", { exact: true })
    .selectOption("journalist");
  await expect(
    page.getByLabel("Publishing status", { exact: true }),
  ).toHaveValue("pending_review");
  await expect(
    page.getByRole("option", { name: "Publish immediately", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .first()
    .click();
  const reviewPayload = JSON.parse(
    await page.getByTestId("preview-story-payload").textContent(),
  );
  expect(reviewPayload.status).toBe("pending_review");
  expect(reviewPayload.scheduledAt).toBeUndefined();

  await page
    .getByText("SEO quality & social previews", { exact: true })
    .click();
  await page.getByText("Headline experiments", { exact: true }).click();
  await assertNoOverflow();
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
  });
  await page.screenshot({
    path: path.join(artifacts, "desktop-dark.png"),
    fullPage: true,
  });

  for (const width of [1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await assertNoOverflow();
    if (width === 390)
      await page.screenshot({
        path: path.join(artifacts, "mobile-dark.png"),
        fullPage: true,
      });
  }
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await page.screenshot({
    path: path.join(artifacts, "mobile-light.png"),
    fullPage: true,
  });

  await page.evaluate(() => localStorage.setItem("admin_lang", "bn"));
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "নতুন সংবাদ তৈরি করুন", exact: true }),
  ).toBeVisible();
  await assertNoOverflow();
  await page.screenshot({
    path: path.join(artifacts, "mobile-bengali.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  console.log(
    JSON.stringify(
      {
        result: "PASS",
        checked: [
          "desktop/mobile layouts",
          "dark mode",
          "Bengali labels",
          "draft autosave/recovery",
          "rich-text restoration",
          "slug generation",
          "validation",
          "draft payload",
          "schedule payload",
          "journalist permissions",
          "geography reset",
          "advanced sections",
        ],
        artifacts,
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
