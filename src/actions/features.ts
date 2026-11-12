"use server";

import { db } from "@/db";
import { siteSettings } from "@/db/schema/settings";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import {
  getDefaultFeatureFlags,
  type FeatureFlags,
} from "@/lib/features";

/**
 * Retrieve all feature flags from the database, falling back to catalog defaults
 */
async function fetchFlagsFromDb(): Promise<FeatureFlags> {
  const flags = getDefaultFeatureFlags();
  try {
    const rows = await db
      .select({
        key: siteSettings.key,
        value: siteSettings.value,
      })
      .from(siteSettings)
      .where(sql`${siteSettings.key} LIKE 'feature:%'`);

    for (const row of rows) {
      const featureId = row.key.replace(/^feature:/, "");
      if (featureId) {
        flags[featureId] = row.value === "true";
      }
    }
  } catch (error) {
    console.warn("Could not query feature flags from site_settings:", error);
  }
  return flags;
}

const cachedGetFeatureFlags = unstable_cache(
  fetchFlagsFromDb,
  ["portal-feature-flags"],
  { tags: ["features", "settings"], revalidate: 3600 }
);

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    return await cachedGetFeatureFlags();
  } catch {
    return await fetchFlagsFromDb();
  }
}

/**
 * Toggle a single feature flag in Postgres site_settings
 */
export async function updateFeatureFlag(
  featureId: string,
  enabled: boolean,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "super_admin")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সুপার অ্যাডমিন ফিচার ফ্ল্যাগ পরিবর্তন করতে পারেন।" };
    }

    const effectiveUserId = actor.id || userId;
    const key = `feature:${featureId}`;
    const value = enabled ? "true" : "false";

    await db
      .insert(siteSettings)
      .values({
        id: crypto.randomUUID(),
        key,
        value,
        description: `Feature toggle: ${featureId}`,
        isPublic: true,
        updatedBy: effectiveUserId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          updatedAt: new Date(),
          updatedBy: effectiveUserId,
        },
      });

    safeRevalidateTag("features");
    safeRevalidateTag("settings");
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
    } catch {}

    return { success: true };
  } catch (error) {
    console.error(`Failed to update feature flag ${featureId}:`, error);
    return { success: false, error: "ফিচার স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" };
  }
}

/**
 * Batch update multiple feature flags
 */
export async function updateAllFeatureFlags(
  updates: Record<string, boolean>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "super_admin")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সুপার অ্যাডমিন ফিচার ফ্ল্যাগ পরিবর্তন করতে পারেন।" };
    }

    const effectiveUserId = actor.id || userId;

    for (const [featureId, enabled] of Object.entries(updates)) {
      const key = `feature:${featureId}`;
      const value = enabled ? "true" : "false";

      await db
        .insert(siteSettings)
        .values({
          id: crypto.randomUUID(),
          key,
          value,
          description: `Feature toggle: ${featureId}`,
          isPublic: true,
          updatedBy: effectiveUserId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
            updatedBy: effectiveUserId,
          },
        });
    }

    safeRevalidateTag("features");
    safeRevalidateTag("settings");
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
    } catch {}

    return { success: true };
  } catch (error) {
    console.error("Failed to batch update feature flags:", error);
    return { success: false, error: "ফিচারসমূহ সংরক্ষণ ব্যর্থ হয়েছে।" };
  }
}

/**
 * Reset all feature flags to their catalog defaults
 */
export async function resetFeatureFlagsToDefault(
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "super_admin")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    const defaults = getDefaultFeatureFlags();
    return await updateAllFeatureFlags(defaults, actor.id || userId);
  } catch (error) {
    console.error("Failed to reset feature flags:", error);
    return { success: false, error: "ডিফল্ট রিস্টোর ব্যর্থ হয়েছে।" };
  }
}
