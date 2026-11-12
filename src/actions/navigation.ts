"use server";

import { db } from "@/db";
import { navigationItems } from "@/db/schema/navigation";
import { eq, asc } from "drizzle-orm";
import type { NavigationItem } from "@/types";
import { unstable_cache } from "next/cache";
import { safeRevalidateTag } from "@/lib/cache";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";

const DEFAULT_NAVIGATION: NavigationItem[] = [
  { id: "nav-1", label: "প্রচ্ছদ", href: "/", sortOrder: 1, isActive: true, openInNewTab: false },
  { id: "nav-2", label: "সর্বশেষ", href: "/latest", sortOrder: 2, isActive: true, openInNewTab: false },
  { id: "nav-3", label: "জাতীয়", href: "/category/national", sortOrder: 3, isActive: true, openInNewTab: false },
  { id: "nav-4", label: "রাজনীতি", href: "/category/politics", sortOrder: 4, isActive: true, openInNewTab: false },
  { id: "nav-5", label: "আন্তর্জাতিক", href: "/category/international", sortOrder: 5, isActive: true, openInNewTab: false },
  { id: "nav-6", label: "অর্থনীতি", href: "/category/economy", sortOrder: 6, isActive: true, openInNewTab: false },
  { id: "nav-7", label: "খেলাধুলা", href: "/category/sports", sortOrder: 7, isActive: true, openInNewTab: false },
  { id: "nav-8", label: "বিনোদন", href: "/category/entertainment", sortOrder: 8, isActive: true, openInNewTab: false },
  { id: "nav-9", label: "প্রযুক্তি", href: "/category/technology", sortOrder: 9, isActive: true, openInNewTab: false },
  { id: "nav-10", label: "সারাদেশ", href: "/saradesh", sortOrder: 10, isActive: true, openInNewTab: false },
  { id: "nav-11", label: "মতামত", href: "/opinion", sortOrder: 11, isActive: true, openInNewTab: false },
  { id: "nav-12", label: "শিক্ষা", href: "/category/education", sortOrder: 12, isActive: true, openInNewTab: false },
  { id: "nav-13", label: "স্বাস্থ্য", href: "/category/health", sortOrder: 13, isActive: true, openInNewTab: false },
  { id: "nav-14", label: "ভিডিও", href: "/videos", sortOrder: 14, isActive: true, openInNewTab: false },
  { id: "nav-15", label: "ছবিঘর", href: "/photos", sortOrder: 15, isActive: true, openInNewTab: false },
];

export const getNavigation = unstable_cache(
  async (): Promise<NavigationItem[]> => {
    try {
      const items = await db
        .select()
        .from(navigationItems)
        .where(eq(navigationItems.isActive, true))
        .orderBy(asc(navigationItems.sortOrder));

      if (!items || items.length === 0) {
        return DEFAULT_NAVIGATION;
      }

      return items.map((i) => ({
        id: i.id,
        label: i.label,
        labelEn: i.labelEn ?? undefined,
        href: i.href,
        parentId: i.parentId,
        sortOrder: i.sortOrder,
        isActive: i.isActive,
        openInNewTab: i.openInNewTab,
        categoryId: i.categoryId,
        iconName: i.iconName,
      }));
    } catch (error) {
      console.warn("Could not query navigation_items table, using defaults:", error);
      return DEFAULT_NAVIGATION;
    }
  },
  ["navigation"],
  { tags: ["navigation"], revalidate: 3600 }
);

export async function upsertNavigationItem(
  data: Partial<NavigationItem> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "admin")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র অ্যাডমিন নেভিগেশন পরিবর্তন করতে পারেন।" };
    }

    if (data.id) {
      await db
        .update(navigationItems)
        .set({
          label: data.label,
          labelEn: data.labelEn,
          href: data.href,
          parentId: data.parentId,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
          openInNewTab: data.openInNewTab,
          categoryId: data.categoryId,
          iconName: data.iconName,
          updatedAt: new Date(),
        })
        .where(eq(navigationItems.id, data.id));
    } else {
      await db.insert(navigationItems).values({
        id: crypto.randomUUID(),
        label: data.label ?? "নতুন মেনু",
        labelEn: data.labelEn,
        href: data.href ?? "/",
        parentId: data.parentId,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        openInNewTab: data.openInNewTab ?? false,
        categoryId: data.categoryId,
        iconName: data.iconName,
      });
    }
    safeRevalidateTag("navigation");
    return { success: true };
  } catch (error) {
    console.error("Failed to upsert navigation item:", error);
    return { success: false, error: "নেভিগেশন আইটেম আপডেট করা সম্ভব হয়নি" };
  }
}

export async function deleteNavigationItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "admin")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(navigationItems).where(eq(navigationItems.id, id));
    safeRevalidateTag("navigation");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete navigation item:", error);
    return { success: false, error: "মুছে ফেলা যায়নি" };
  }
}
