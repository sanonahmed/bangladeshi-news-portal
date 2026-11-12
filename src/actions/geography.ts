"use server";

import { db } from "@/db";
import {
  divisions,
  districts,
  articleLocations,
  articles,
  mediaAssets,
  user,
  categories,
  articleCategories,
} from "@/db/schema";
import { eq, desc, and, sql, count, or, ilike } from "drizzle-orm";
import { safeRevalidateTag } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";

export interface DistrictSummary {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  divisionId: string;
  sortOrder: number;
  articleCount?: number;
}

export interface DivisionWithDistricts {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  sortOrder: number;
  articleCount?: number;
  districts: DistrictSummary[];
}

export interface RegionalArticleCard {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  newsLocation?: string | null;
  division?: { id: string; name: string; slug: string } | null;
  district?: { id: string; name: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string; slug: string } | null;
}

/**
 * Fetch all divisions with their nested districts and article counts
 */
export async function getDivisionsWithDistricts(): Promise<DivisionWithDistricts[]> {
  try {
    const allDivisions = await db
      .select({
        id: divisions.id,
        name: divisions.name,
        nameEn: divisions.nameEn,
        slug: divisions.slug,
        sortOrder: divisions.sortOrder,
      })
      .from(divisions)
      .orderBy(divisions.sortOrder);

    const allDistricts = await db
      .select({
        id: districts.id,
        name: districts.name,
        nameEn: districts.nameEn,
        slug: districts.slug,
        divisionId: districts.divisionId,
        sortOrder: districts.sortOrder,
      })
      .from(districts)
      .orderBy(districts.sortOrder);

    // Get article counts per division
    const divCounts = await db
      .select({
        divisionId: articleLocations.divisionId,
        count: count(articleLocations.articleId),
      })
      .from(articleLocations)
      .innerJoin(articles, eq(articleLocations.articleId, articles.id))
      .where(eq(articles.status, "published"))
      .groupBy(articleLocations.divisionId);

    const divCountMap = new Map<string, number>();
    for (const row of divCounts) {
      if (row.divisionId) {
        divCountMap.set(row.divisionId, Number(row.count) || 0);
      }
    }

    // Get article counts per district
    const distCounts = await db
      .select({
        districtId: articleLocations.districtId,
        count: count(articleLocations.articleId),
      })
      .from(articleLocations)
      .innerJoin(articles, eq(articleLocations.articleId, articles.id))
      .where(eq(articles.status, "published"))
      .groupBy(articleLocations.districtId);

    const distCountMap = new Map<string, number>();
    for (const row of distCounts) {
      if (row.districtId) {
        distCountMap.set(row.districtId, Number(row.count) || 0);
      }
    }

    // Assemble nested structure
    const result: DivisionWithDistricts[] = allDivisions.map((div) => {
      const childDistricts = allDistricts
        .filter((d) => d.divisionId === div.id)
        .map((d) => ({
          ...d,
          articleCount: distCountMap.get(d.id) || 0,
        }));

      return {
        ...div,
        articleCount: divCountMap.get(div.id) || 0,
        districts: childDistricts,
      };
    });

    return result;
  } catch (error) {
    console.error("getDivisionsWithDistricts error:", error);
    return [];
  }
}

/**
 * Get articles filtered by division and/or district
 */
export async function getRegionalArticles(opts: {
  divisionSlug?: string;
  districtSlug?: string;
  divisionId?: string;
  districtId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  articles: RegionalArticleCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { divisionSlug, districtSlug, divisionId, districtId, page = 1, pageSize = 8 } = opts;
  const offset = (page - 1) * pageSize;

  try {
    const conditions = [eq(articles.status, "published")];

    if (districtSlug) {
      conditions.push(eq(districts.slug, districtSlug));
    } else if (districtId) {
      conditions.push(eq(districts.id, districtId));
    }

    if (divisionSlug) {
      conditions.push(eq(divisions.slug, divisionSlug));
    } else if (divisionId) {
      conditions.push(eq(divisions.id, divisionId));
    }

    const query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        publishedAt: articles.publishedAt,
        newsLocation: articles.newsLocation,
        featuredImageUrl: mediaAssets.publicUrl,
        featuredImageAlt: articles.featuredImageAlt,
        divisionId: divisions.id,
        divisionName: divisions.name,
        divisionSlug: divisions.slug,
        districtId: districts.id,
        districtName: districts.name,
        districtSlug: districts.slug,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: user.name,
      })
      .from(articles)
      .innerJoin(articleLocations, eq(articles.id, articleLocations.articleId))
      .leftJoin(divisions, eq(articleLocations.divisionId, divisions.id))
      .leftJoin(districts, eq(articleLocations.districtId, districts.id))
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(pageSize)
      .offset(offset);

    const totalCountQuery = db
      .select({ count: count(articles.id) })
      .from(articles)
      .innerJoin(articleLocations, eq(articles.id, articleLocations.articleId))
      .leftJoin(divisions, eq(articleLocations.divisionId, divisions.id))
      .leftJoin(districts, eq(articleLocations.districtId, districts.id))
      .where(and(...conditions));

    const [rows, countRes] = await Promise.all([query, totalCountQuery]);
    const total = Number(countRes[0]?.count) || 0;

    const mapped: RegionalArticleCard[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      newsLocation: r.newsLocation,
      division: r.divisionId && r.divisionName && r.divisionSlug ? {
        id: r.divisionId,
        name: r.divisionName,
        slug: r.divisionSlug,
      } : null,
      district: r.districtId && r.districtName && r.districtSlug ? {
        id: r.districtId,
        name: r.districtName,
        slug: r.districtSlug,
      } : null,
      category: r.categoryName && r.categorySlug ? {
        name: r.categoryName,
        slug: r.categorySlug,
      } : null,
      author: r.authorName ? {
        name: r.authorName,
        slug: "editorial-desk",
      } : null,
    }));

    return {
      articles: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  } catch (error) {
    console.error("getRegionalArticles error:", error);
    return {
      articles: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

/**
 * Get single division by slug with its districts
 */
export async function getDivisionBySlug(slug: string): Promise<DivisionWithDistricts | null> {
  try {
    const divRows = await db
      .select()
      .from(divisions)
      .where(eq(divisions.slug, slug))
      .limit(1);

    if (!divRows.length || !divRows[0]) {
      return null;
    }

    const div = divRows[0];
    const distRows = await db
      .select({
        id: districts.id,
        name: districts.name,
        nameEn: districts.nameEn,
        slug: districts.slug,
        divisionId: districts.divisionId,
        sortOrder: districts.sortOrder,
      })
      .from(districts)
      .where(eq(districts.divisionId, div.id))
      .orderBy(districts.sortOrder);

    // Get district counts
    const distCounts = await db
      .select({
        districtId: articleLocations.districtId,
        count: count(articleLocations.articleId),
      })
      .from(articleLocations)
      .innerJoin(articles, eq(articleLocations.articleId, articles.id))
      .where(and(eq(articleLocations.divisionId, div.id), eq(articles.status, "published")))
      .groupBy(articleLocations.districtId);

    const distCountMap = new Map<string, number>();
    let totalDivCount = 0;
    for (const r of distCounts) {
      if (r.districtId) {
        const c = Number(r.count) || 0;
        distCountMap.set(r.districtId, c);
        totalDivCount += c;
      }
    }

    return {
      ...div,
      articleCount: totalDivCount,
      districts: distRows.map((d) => ({
        ...d,
        articleCount: distCountMap.get(d.id) || 0,
      })),
    };
  } catch (error) {
    console.error("getDivisionBySlug error:", error);
    return null;
  }
}

/**
 * Get single district by slug with parent division info
 */
export async function getDistrictBySlug(slug: string): Promise<{
  district: DistrictSummary;
  division: { id: string; name: string; nameEn?: string | null; slug: string };
} | null> {
  try {
    const rows = await db
      .select({
        id: districts.id,
        name: districts.name,
        nameEn: districts.nameEn,
        slug: districts.slug,
        divisionId: districts.divisionId,
        sortOrder: districts.sortOrder,
        divisionName: divisions.name,
        divisionNameEn: divisions.nameEn,
        divisionSlug: divisions.slug,
      })
      .from(districts)
      .innerJoin(divisions, eq(districts.divisionId, divisions.id))
      .where(eq(districts.slug, slug))
      .limit(1);

    if (!rows.length || !rows[0]) {
      return null;
    }

    const r = rows[0];
    const distCount = await db
      .select({ count: count() })
      .from(articleLocations)
      .innerJoin(articles, eq(articleLocations.articleId, articles.id))
      .where(and(eq(articleLocations.districtId, r.id), eq(articles.status, "published")));

    return {
      district: {
        id: r.id,
        name: r.name,
        nameEn: r.nameEn,
        slug: r.slug,
        divisionId: r.divisionId,
        sortOrder: r.sortOrder,
        articleCount: Number(distCount[0]?.count) || 0,
      },
      division: {
        id: r.divisionId,
        name: r.divisionName,
        nameEn: r.divisionNameEn,
        slug: r.divisionSlug,
      },
    };
  } catch (error) {
    console.error("getDistrictBySlug error:", error);
    return null;
  }
}

/**
 * Assign or update division and district for an article (Admin / Editor / Journalist)
 */
export async function assignArticleLocation(
  articleId: string,
  divisionId: string | null,
  districtId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "journalist")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সাংবাদিক বা স্টাফ অবস্থান নির্ধারণ করতে পারেন।" };
    }

    if (!articleId) {
      return { success: false, error: "সংবাদের আইডি আবশ্যক" };
    }

    await db
      .insert(articleLocations)
      .values({
        articleId,
        divisionId,
        districtId,
      })
      .onConflictDoUpdate({
        target: articleLocations.articleId,
        set: {
          divisionId,
          districtId,
        },
      });

    safeRevalidateTag("homepage");
    safeRevalidateTag("articles");
    revalidatePath("/");
    revalidatePath("/saradesh");

    return { success: true };
  } catch (error) {
    console.error("assignArticleLocation error:", error);
    return { success: false, error: "আঞ্চলিক অবস্থান সংরক্ষণ করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Get assigned location for a specific article
 */
export async function getArticleLocation(articleId: string): Promise<{
  divisionId: string | null;
  districtId: string | null;
} | null> {
  try {
    const rows = await db
      .select({
        divisionId: articleLocations.divisionId,
        districtId: articleLocations.districtId,
      })
      .from(articleLocations)
      .where(eq(articleLocations.articleId, articleId))
      .limit(1);

    if (!rows.length || !rows[0]) {
      return null;
    }

    return {
      divisionId: rows[0].divisionId,
      districtId: rows[0].districtId,
    };
  } catch (error) {
    console.error("getArticleLocation error:", error);
    return null;
  }
}
