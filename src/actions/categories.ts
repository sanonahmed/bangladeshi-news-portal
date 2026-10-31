"use server";

import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { eq, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";

export interface CategoryItem {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
  showInNav: boolean;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "জাতীয়", nameEn: "National", slug: "national", sortOrder: 1, isActive: true, showInNav: true },
  { id: "cat-2", name: "রাজনীতি", nameEn: "Politics", slug: "politics", sortOrder: 2, isActive: true, showInNav: true },
  { id: "cat-3", name: "আন্তর্জাতিক", nameEn: "International", slug: "international", sortOrder: 3, isActive: true, showInNav: true },
  { id: "cat-4", name: "অর্থনীতি", nameEn: "Economy", slug: "economy", sortOrder: 4, isActive: true, showInNav: true },
  { id: "cat-5", name: "খেলাধুলা", nameEn: "Sports", slug: "sports", sortOrder: 5, isActive: true, showInNav: true },
  { id: "cat-6", name: "বিনোদন", nameEn: "Entertainment", slug: "entertainment", sortOrder: 6, isActive: true, showInNav: true },
  { id: "cat-7", name: "প্রযুক্তি", nameEn: "Technology", slug: "technology", sortOrder: 7, isActive: true, showInNav: true },
  { id: "cat-8", name: "মতামত", nameEn: "Opinion", slug: "opinion", sortOrder: 8, isActive: true, showInNav: true },
];

export const getCategories = unstable_cache(
  async (): Promise<CategoryItem[]> => {
    try {
      const rows = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder));

      if (!rows || rows.length === 0) {
        return DEFAULT_CATEGORIES;
      }

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        nameEn: r.nameEn,
        slug: r.slug,
        description: r.description,
        parentId: r.parentId,
        color: r.color,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
        showInNav: r.showInNav,
      }));
    } catch (error) {
      console.warn("Could not query categories, using defaults:", error);
      return DEFAULT_CATEGORIES;
    }
  },
  ["categories-list"],
  { tags: ["categories"], revalidate: 3600 }
);

export async function createCategory(data: {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  parentId?: string;
  color?: string;
  sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(categories).values({
      id: crypto.randomUUID(),
      name: data.name,
      nameEn: data.nameEn,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      color: data.color,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      showInNav: true,
    });
    safeRevalidateTag("categories");
    return { success: true };
  } catch (error) {
    console.error("createCategory error:", error);
    return { success: false, error: "বিভাগ সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}
