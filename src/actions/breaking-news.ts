"use server";

import { db } from "@/db";
import { breakingNews, type BreakingNews } from "@/db/schema/breaking-news";
import { user } from "@/db/schema/auth";
import { eq, and, or, isNull, gt, desc } from "drizzle-orm";
import type { BreakingNewsItem } from "@/types";
import { revalidatePath, unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import { cookies, headers } from "next/headers";
import { z } from "zod";

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
        .orderBy(desc(breakingNews.priority), desc(breakingNews.createdAt))
        .limit(10);

      if (!items || items.length === 0) {
        return [];
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
      console.error("Could not query breaking_news table:", error);
      return [];
    }
  },
  ["breaking-news"],
  { tags: ["breaking-news"], revalidate: 30 }
);

export async function getAllAdminBreakingNews(): Promise<BreakingNews[]> {
  try {
    const items = await db
      .select()
      .from(breakingNews)
      .orderBy(desc(breakingNews.priority), desc(breakingNews.createdAt));

    return items;
  } catch (error) {
    console.error("Error fetching admin breaking news:", error);
    return [];
  }
}

const CreateBreakingSchema = z.object({
  headline: z.string().min(5, "ব্রেকিং শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে").max(300),
  headlineEn: z.string().optional(),
  url: z.string().optional(),
  isExternal: z.boolean().default(false),
  priority: z.number().min(1).max(10).default(5),
  expiresHours: z.number().nullable().optional(),
});

export async function createBreakingNews(
  data: z.infer<typeof CreateBreakingSchema>
): Promise<{ success: boolean; error?: string; item?: BreakingNews }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন ব্রেকিং নিউজ যোগ করতে পারেন।" };
    }

    const parsed = CreateBreakingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const userId = actor.id;

    let expiresAt: Date | null = null;
    if (parsed.data.expiresHours && parsed.data.expiresHours > 0) {
      expiresAt = new Date(Date.now() + parsed.data.expiresHours * 60 * 60 * 1000);
    }

    const [newItem] = await db
      .insert(breakingNews)
      .values({
        id: crypto.randomUUID(),
        headline: parsed.data.headline.trim(),
        headlineEn: parsed.data.headlineEn?.trim() || null,
        url: parsed.data.url?.trim() || "#",
        isExternal: parsed.data.isExternal,
        priority: parsed.data.priority,
        isActive: true,
        expiresAt,
        createdBy: userId,
      })
      .returning();

    safeRevalidateTag("breaking-news");
    revalidatePath("/");
    revalidatePath("/breaking");
    revalidatePath("/admin/breaking-news");

    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("createBreakingNews error:", error);
    return { success: false, error: error?.message || "ব্রেকিং নিউজ তৈরি ব্যর্থ হয়েছে" };
  }
}

export async function deleteBreakingNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন ব্রেকিং নিউজ মুছতে পারেন।" };
    }

    await db.delete(breakingNews).where(eq(breakingNews.id, id));

    safeRevalidateTag("breaking-news");
    revalidatePath("/");
    revalidatePath("/breaking");
    revalidatePath("/admin/breaking-news");

    return { success: true };
  } catch (error: any) {
    console.error("deleteBreakingNews error:", error);
    return { success: false, error: "ব্রেকিং নিউজ মুছে ফেলা যায়নি" };
  }
}

export async function toggleBreakingNews(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.update(breakingNews).set({ isActive, updatedAt: new Date() }).where(eq(breakingNews.id, id));

    safeRevalidateTag("breaking-news");
    revalidatePath("/");
    revalidatePath("/breaking");
    revalidatePath("/admin/breaking-news");

    return { success: true };
  } catch (error: any) {
    console.error("toggleBreakingNews error:", error);
    return { success: false, error: "অবস্থা পরিবর্তন ব্যর্থ হয়েছে" };
  }
}

export async function updateBreakingNewsPriority(
  id: string,
  priority: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.update(breakingNews).set({ priority, updatedAt: new Date() }).where(eq(breakingNews.id, id));

    safeRevalidateTag("breaking-news");
    revalidatePath("/");
    revalidatePath("/breaking");
    revalidatePath("/admin/breaking-news");

    return { success: true };
  } catch (error: any) {
    console.error("updateBreakingNewsPriority error:", error);
    return { success: false, error: "অগ্রাধিকার আপডেট ব্যর্থ হয়েছে" };
  }
}
