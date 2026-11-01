"use server";

import { db } from "@/db";
import { advertisements, type Advertisement } from "@/db/schema/advertisements";
import { user } from "@/db/schema/auth";
import { eq, and, or, isNull, gt, lte, desc } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";

export interface AdData {
  id: string;
  name: string;
  placement: string;
  type: "adsense" | "direct_image" | "sponsored";
  imageUrl?: string | null;
  destinationUrl?: string | null;
  adCode?: string | null;
  altText?: string | null;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
}

export const getAdForPlacement = unstable_cache(
  async (placement: string): Promise<AdData | null> => {
    try {
      const now = new Date();
      const [ad] = await db
        .select()
        .from(advertisements)
        .where(
          and(
            eq(advertisements.placement, placement as any),
            eq(advertisements.isActive, true),
            or(isNull(advertisements.startDate), lte(advertisements.startDate, now)),
            or(isNull(advertisements.endDate), gt(advertisements.endDate, now))
          )
        )
        .orderBy(desc(advertisements.updatedAt))
        .limit(1);

      if (!ad) return null;

      return {
        id: ad.id,
        name: ad.name,
        placement: ad.placement,
        type: ad.type as any,
        imageUrl: ad.imageUrl,
        destinationUrl: ad.destinationUrl,
        adCode: ad.adCode,
        altText: ad.altText,
        isActive: ad.isActive,
        impressions: ad.impressions || 0,
        clicks: ad.clicks || 0,
      };
    } catch (error) {
      console.warn(`Could not query ad for placement ${placement}:`, error);
      return null;
    }
  },
  ["advertisement-placement"],
  { tags: ["ads"], revalidate: 60 }
);

export async function getAllAdminAds(): Promise<Advertisement[]> {
  try {
    const list = await db
      .select()
      .from(advertisements)
      .orderBy(desc(advertisements.updatedAt));

    return list;
  } catch (error) {
    console.error("getAllAdminAds error:", error);
    return [];
  }
}

const AdSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "বিজ্ঞাপনের নাম আবশ্যক"),
  placement: z.enum([
    "header_banner",
    "homepage_leaderboard",
    "sidebar",
    "between_sections",
    "article_inline",
    "mobile_slot",
    "footer",
  ]),
  type: z.enum(["direct_image", "adsense", "sponsored"]).default("direct_image"),
  imageUrl: z.string().optional(),
  destinationUrl: z.string().optional(),
  adCode: z.string().optional(),
  altText: z.string().optional(),
  deviceTarget: z.enum(["all", "desktop", "mobile"]).default("all"),
  isActive: z.boolean().default(true),
});

export async function createOrUpdateAd(
  data: z.infer<typeof AdSchema>
): Promise<{ success: boolean; error?: string; ad?: Advertisement }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("demo_admin_session")?.value === "true";

    if (!session && !isDemo) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    const parsed = AdSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    let userId = session?.user?.id || null;
    if (!userId) {
      const [firstUser] = await db.select({ id: user.id }).from(user).limit(1);
      userId = firstUser?.id || "admin-system";
    }

    if (parsed.data.id) {
      // Update existing
      const [updated] = await db
        .update(advertisements)
        .set({
          name: parsed.data.name.trim(),
          placement: parsed.data.placement,
          type: parsed.data.type,
          imageUrl: parsed.data.imageUrl?.trim() || null,
          destinationUrl: parsed.data.destinationUrl?.trim() || null,
          adCode: parsed.data.adCode?.trim() || null,
          altText: parsed.data.altText?.trim() || null,
          deviceTarget: parsed.data.deviceTarget,
          isActive: parsed.data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(advertisements.id, parsed.data.id))
        .returning();

      safeRevalidateTag("ads");
      revalidatePath("/");
      revalidatePath("/admin/advertisements");

      return { success: true, ad: updated };
    } else {
      // Create new
      const [newAd] = await db
        .insert(advertisements)
        .values({
          id: crypto.randomUUID(),
          name: parsed.data.name.trim(),
          placement: parsed.data.placement,
          type: parsed.data.type,
          imageUrl: parsed.data.imageUrl?.trim() || null,
          destinationUrl: parsed.data.destinationUrl?.trim() || null,
          adCode: parsed.data.adCode?.trim() || null,
          altText: parsed.data.altText?.trim() || null,
          deviceTarget: parsed.data.deviceTarget,
          isActive: parsed.data.isActive,
          impressions: 0,
          clicks: 0,
          createdBy: userId,
        })
        .returning();

      safeRevalidateTag("ads");
      revalidatePath("/");
      revalidatePath("/admin/advertisements");

      return { success: true, ad: newAd };
    }
  } catch (error: any) {
    console.error("createOrUpdateAd error:", error);
    return { success: false, error: error?.message || "বিজ্ঞাপন সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}

export async function toggleAdStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("demo_admin_session")?.value === "true";

    if (!session && !isDemo) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db
      .update(advertisements)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(advertisements.id, id));

    safeRevalidateTag("ads");
    revalidatePath("/");
    revalidatePath("/admin/advertisements");

    return { success: true };
  } catch (error: any) {
    console.error("toggleAdStatus error:", error);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" };
  }
}

export async function deleteAd(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("demo_admin_session")?.value === "true";

    if (!session && !isDemo) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(advertisements).where(eq(advertisements.id, id));

    safeRevalidateTag("ads");
    revalidatePath("/");
    revalidatePath("/admin/advertisements");

    return { success: true };
  } catch (error: any) {
    console.error("deleteAd error:", error);
    return { success: false, error: "বিজ্ঞাপন মুছে ফেলা যায়নি" };
  }
}
