import { updateSiteSettings } from "@/actions/settings";
import { updateFeatureFlag } from "@/actions/features";
import { createCategory } from "@/actions/categories";
import { upsertNavigationItem } from "@/actions/navigation";
import { broadcastBreakingAlertAction } from "@/actions/notifications";
import { createOrUpdateAd } from "@/actions/advertisements";
import { createBreakingNews } from "@/actions/breaking-news";
import { startAbTest, finalizeAbTest } from "@/actions/articles";
import { assignArticleLocation } from "@/actions/geography";

async function runTests() {
  console.log("=== SECURITY VERIFICATION REGRESSION TESTS ===\n");
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<boolean>) {
    total++;
    try {
      const res = await fn();
      if (res) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name} - Assertion returned false`);
      }
    } catch (err: any) {
      console.error(`[ERROR] ${name}:`, err.message);
    }
  }

  // Test 1: updateSiteSettings unauthenticated
  await test("updateSiteSettings rejects unauthenticated call", async () => {
    const res = await updateSiteSettings({ site_name: "Defaced" });
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 2: updateFeatureFlag unauthenticated
  await test("updateFeatureFlag rejects unauthenticated call", async () => {
    const res = await updateFeatureFlag("admin_ads_manager", false);
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 3: createCategory unauthenticated
  await test("createCategory rejects unauthenticated call", async () => {
    const res = await createCategory({ name: "Hacked Category", slug: "hacked" });
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 4: upsertNavigationItem unauthenticated
  await test("upsertNavigationItem rejects unauthenticated call", async () => {
    const res = await upsertNavigationItem({ label: "Malicious Link", href: "https://evil.com" });
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 5: broadcastBreakingAlertAction unauthenticated
  await test("broadcastBreakingAlertAction rejects unauthenticated call", async () => {
    const res = await broadcastBreakingAlertAction({ title: "Fake Alert", message: "Fake" });
    return res.success === false && Boolean(res.message.includes("অননুমোদিত"));
  });

  // Test 6: createOrUpdateAd unauthenticated
  await test("createOrUpdateAd rejects unauthenticated call", async () => {
    const res = await createOrUpdateAd({ name: "Fake Ad", placement: "header_banner", type: "direct_image", isActive: true, deviceTarget: "all" });
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 7: createBreakingNews unauthenticated
  await test("createBreakingNews rejects unauthenticated call", async () => {
    const res = await createBreakingNews({ headline: "Unauthenticated Breaking News", isExternal: false, priority: 1 });
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 8: startAbTest unauthenticated
  await test("startAbTest rejects unauthenticated call", async () => {
    const res = await startAbTest("fake-article-id", "Fake Headline B");
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 9: finalizeAbTest unauthenticated
  await test("finalizeAbTest rejects unauthenticated call", async () => {
    const res = await finalizeAbTest("fake-article-id", "b");
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  // Test 10: assignArticleLocation unauthenticated
  await test("assignArticleLocation rejects unauthenticated call", async () => {
    const res = await assignArticleLocation("fake-article-id", "fake-division", "fake-district");
    return res.success === false && Boolean(res.error?.includes("অননুমোদিত"));
  });

  console.log(`\nResults: ${passed}/${total} security tests passed!`);
  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});
