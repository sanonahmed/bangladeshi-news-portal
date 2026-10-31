"use server";

import { db } from "@/db";
import { breakingNews } from "@/db/schema/breaking-news";
import { eq, and, or, isNull, gt, desc } from "drizzle-orm";
import type { BreakingNewsItem } from "@/types";
import { unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";

const DEFAULT_BREAKING_NEWS: BreakingNewsItem[] = [
  {
    id: "bn-1",
    headline: "জাতীয় সংসদের নতুন অধিবেশন আহ্বান করেছেন রাষ্ট্রপতি",
    url: "/news/parliament-session-called",
    isExternal: false,
    priority: 10,
  },
  {
    id: "bn-2",
    headline: "মেট্রোরেলের নতুন রুট উদ্বোধন করলেন প্রধান উপদেষ্টা",
    url: "/news/metro-rail-new-route",
    isExternal: false,
    priority: 9,
  },
  {
    id: "bn-3",
    headline: "বাংলাদেশ ক্রিকেট দলের টি-টোয়েন্টি স্কোয়াড ঘোষণা",
    url: "/news/cricket-t20-squad",
    isExternal: false,
    priority: 8,
  },
];

export const getBreakingNews = unstable_cache(
  async (): Promise<BreakingNewsItem[]> => {
    try {
      const now = new Date();
      const items = await db
        .select({
          id: breakingNews.id,
          headline: breakingNews.headline,
          headlineEn: breakingNews.headlineEn,
          url: breakingNews.url,
          isExternal: breakingNews.isExternal,
          priority: breakingNews.priority,
        })
        .from(breakingNews)
        .where(
          and(
            eq(breakingNews.isActive, true),
            or(isNull(breakingNews.expiresAt), gt(breakingNews.expiresAt, now))
          )
        )
        .orderBy(desc(breakingNews.priority))
        .limit(10);

      if (!items || items.length === 0) {
        return DEFAULT_BREAKING_NEWS;
      }

      return items.map((item) => ({
        id: item.id,
        headline: item.headline,
        headlineEn: item.headlineEn,
        url: item.url || "#",
        isExternal: item.isExternal,
        priority: item.priority,
      }));
    } catch (error) {
      console.warn("Could not query breaking_news table, using defaults:", error);
      return DEFAULT_BREAKING_NEWS;
    }
  },
  ["breaking-news"],
  { tags: ["breaking-news"], revalidate: 60 }
);

export async function createBreakingNews(
  data: {
    headline: string;
    headlineEn?: string;
    url?: string;
    isExternal?: boolean;
    priority?: number;
    expiresAt?: Date;
  },
  createdBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(breakingNews).values({
      id: crypto.randomUUID(),
      headline: data.headline,
      headlineEn: data.headlineEn,
      url: data.url ?? "#",
      isExternal: data.isExternal ?? false,
      priority: data.priority ?? 0,
      expiresAt: data.expiresAt,
      createdBy,
    });
    safeRevalidateTag("breaking-news");
    return { success: true };
  } catch (error) {
    console.error("Failed to create breaking news:", error);
    return { success: false, error: "ব্রেকিং নিউজ তৈরি ব্যর্থ হয়েছে" };
  }
}

export async function deleteBreakingNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(breakingNews).where(eq(breakingNews.id, id));
    safeRevalidateTag("breaking-news");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete breaking news:", error);
    return { success: false, error: "ব্রেকিং নিউজ মুছে ফেলা যায়নি" };
  }
}

export async function toggleBreakingNews(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(breakingNews).set({ isActive, updatedAt: new Date() }).where(eq(breakingNews.id, id));
    safeRevalidateTag("breaking-news");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle breaking news:", error);
    return { success: false, error: "অবস্থা পরিবর্তন ব্যর্থ হয়েছে" };
  }
}
