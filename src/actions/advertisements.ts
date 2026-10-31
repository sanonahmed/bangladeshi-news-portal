"use server";

import { db } from "@/db";
import { advertisements } from "@/db/schema/advertisements";
import { eq, and, or, isNull, gt, lte } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

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
      };
    } catch (error) {
      console.warn(`Could not query ad for placement ${placement}:`, error);
      return null;
    }
  },
  ["advertisement-placement"],
  { tags: ["ads"], revalidate: 300 }
);
