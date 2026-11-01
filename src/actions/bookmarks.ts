"use server";

import { db } from "@/db";
import { bookmarks } from "@/db/schema/engagement";
import { articles, articleCategories } from "@/db/schema/articles";
import { mediaAssets } from "@/db/schema/media";
import { categories } from "@/db/schema/categories";
import { user } from "@/db/schema/auth";
import { eq, and, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import type { ArticleCard } from "@/types";

/**
 * Toggle article bookmark in DB (for logged-in user or demo session)
 */
export async function toggleArticleBookmark(articleId: string): Promise<{
  bookmarked: boolean;
  success: boolean;
  error?: string;
}> {
  try {
    let userId: string | null = null;
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      userId = session.user.id;
    } else {
      const cookieStore = await cookies();
      const isDemo = cookieStore.get("demo_admin_session")?.value === "true";
      if (isDemo) {
        const adminInDb = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.role, "super_admin"))
          .limit(1);
        userId = adminInDb[0]?.id || null;
      }
    }

    if (!userId) {
      // If user is guest/anonymous, client handles persistence via localStorage
      return { success: true, bookmarked: true };
    }

    // Check if already bookmarked
    const existing = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, articleId)))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return { success: true, bookmarked: false };
    } else {
      await db.insert(bookmarks).values({
        userId,
        articleId,
      });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("toggleArticleBookmark error:", error);
    return { success: false, bookmarked: false, error: "বুকমার্ক সম্পন্ন করা সম্ভব হয়নি" };
  }
}

/**
 * Fetch full article cards by a list of article IDs (used for localStorage reader bookmarks)
 */
export async function getArticlesByIds(ids: string[]): Promise<ArticleCard[]> {
  if (!ids || ids.length === 0) return [];

  try {
    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        publishedAt: articles.publishedAt,
        featuredImageUrl: mediaAssets.publicUrl,
        featuredImageAlt: articles.featuredImageAlt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: user.name,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(and(inArray(articles.id, ids), eq(articles.status, "published")))
      .orderBy(desc(articles.publishedAt));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      category: r.categoryName && r.categorySlug ? { name: r.categoryName, slug: r.categorySlug } : null,
      author: r.authorName ? { name: r.authorName, slug: "reporter" } : null,
    }));
  } catch (error) {
    console.error("getArticlesByIds error:", error);
    return [];
  }
}

/**
 * Get personalized feed based on reader's preferred category slugs
 */
export async function getPersonalizedArticles(
  categorySlugs: string[],
  limit: number = 8
): Promise<ArticleCard[]> {
  try {
    if (!categorySlugs || categorySlugs.length === 0) {
      categorySlugs = ["national", "politics", "economy", "sports"];
    }

    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        publishedAt: articles.publishedAt,
        featuredImageUrl: mediaAssets.publicUrl,
        featuredImageAlt: articles.featuredImageAlt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: user.name,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(and(eq(articles.status, "published"), inArray(categories.slug, categorySlugs)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      category: r.categoryName && r.categorySlug ? { name: r.categoryName, slug: r.categorySlug } : null,
      author: r.authorName ? { name: r.authorName, slug: "reporter" } : null,
    }));
  } catch (error) {
    console.error("getPersonalizedArticles error:", error);
    return [];
  }
}
