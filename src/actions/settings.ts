"use server";

import { db } from "@/db";
import { siteSettings } from "@/db/schema/settings";
import type { SiteSettings } from "@/types";
import { unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "দৈনিক বাংলাদেশ বার্তা",
  siteSlogan: "সত্য ও সাহসের পক্ষে অবিচল",
  logoUrl: "",
  faviconUrl: "",
  facebookUrl: "https://facebook.com",
  twitterUrl: "https://twitter.com",
  youtubeUrl: "https://youtube.com",
  instagramUrl: "https://instagram.com",
  contactEmail: "editor@bangladeshbarta.com",
  contactPhone: "+880 1700-000000",
  address: "কাওরান বাজার, ঢাকা-১২১৫, বাংলাদেশ",
  epaper: "/epaper",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
};

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const rows = await db.select().from(siteSettings);
      if (!rows || rows.length === 0) {
        return DEFAULT_SETTINGS;
      }
      const map: Record<string, string> = {};
      for (const row of rows) {
        map[row.key] = row.value ?? "";
      }
      return {
        siteName: map["site_name"] || DEFAULT_SETTINGS.siteName,
        siteSlogan: map["site_slogan"] || DEFAULT_SETTINGS.siteSlogan,
        logoUrl: map["logo_url"] || DEFAULT_SETTINGS.logoUrl,
        faviconUrl: map["favicon_url"] || DEFAULT_SETTINGS.faviconUrl,
        facebookUrl: map["facebook_url"] || DEFAULT_SETTINGS.facebookUrl,
        twitterUrl: map["twitter_url"] || DEFAULT_SETTINGS.twitterUrl,
        youtubeUrl: map["youtube_url"] || DEFAULT_SETTINGS.youtubeUrl,
        instagramUrl: map["instagram_url"] || DEFAULT_SETTINGS.instagramUrl,
        contactEmail: map["contact_email"] || DEFAULT_SETTINGS.contactEmail,
        contactPhone: map["contact_phone"] || DEFAULT_SETTINGS.contactPhone,
        address: map["address"] || DEFAULT_SETTINGS.address,
        epaper: map["epaper_url"] || DEFAULT_SETTINGS.epaper,
        googleAnalyticsId: map["ga_measurement_id"] || DEFAULT_SETTINGS.googleAnalyticsId,
      };
    } catch (error) {
      console.warn("Could not query site_settings table, using defaults:", error);
      return DEFAULT_SETTINGS;
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 3600 }
);

export async function updateSiteSettings(
  updates: Record<string, string>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(siteSettings)
        .values({
          id: crypto.randomUUID(),
          key,
          value,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
            updatedBy: userId,
          },
        });
    }
    safeRevalidateTag("settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { success: false, error: "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}
