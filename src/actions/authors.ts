"use server";

import { db } from "@/db";
import { authorProfiles, user, articles, mediaAssets, categories, articleCategories } from "@/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import type { ArticleCard, PaginatedResult } from "@/types";

export interface AuthorProfileDetail {
  id: string;
  userId: string;
  slug: string;
  nameBangla: string;
  nameEnglish?: string | null;
  designation: string;
  department: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bureau?: string | null;
  isBureauChief: boolean;
  isStaff: boolean;
  twitterHandle?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  featuredOrder: number;
  totalArticles: number;
}

export interface AuthorDirectoryItem extends AuthorProfileDetail {
  latestArticleTitle?: string | null;
  latestArticleSlug?: string | null;
}

/**
 * Fetch all authors / reporters / bureau chiefs
 */
export async function getAuthorsList(opts?: {
  department?: string;
  isBureauChief?: boolean;
}): Promise<AuthorDirectoryItem[]> {
  try {
    const conditions = [];
    if (opts?.department) {
      conditions.push(eq(authorProfiles.department, opts.department));
    }
    if (typeof opts?.isBureauChief === "boolean") {
      conditions.push(eq(authorProfiles.isBureauChief, opts.isBureauChief));
    }

    const query = db
      .select({
        id: authorProfiles.id,
        userId: authorProfiles.userId,
        slug: authorProfiles.slug,
        nameBangla: authorProfiles.nameBangla,
        nameEnglish: authorProfiles.nameEnglish,
        designation: authorProfiles.designation,
        department: authorProfiles.department,
        bio: authorProfiles.bio,
        avatarUrl: authorProfiles.avatarUrl,
        bureau: authorProfiles.bureau,
        isBureauChief: authorProfiles.isBureauChief,
        isStaff: authorProfiles.isStaff,
        twitterHandle: authorProfiles.twitterHandle,
        facebookUrl: authorProfiles.facebookUrl,
        linkedinUrl: authorProfiles.linkedinUrl,
        email: authorProfiles.email,
        phone: authorProfiles.phone,
        featuredOrder: authorProfiles.featuredOrder,
      })
      .from(authorProfiles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(authorProfiles.featuredOrder);

    const rows = await query;

    // Get article counts per user
    const counts = await db
      .select({
        authorId: articles.authorId,
        total: count(articles.id),
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .groupBy(articles.authorId);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      if (c.authorId) {
        countMap.set(c.authorId, Number(c.total) || 0);
      }
    }

    return rows.map((r) => ({
      ...r,
      totalArticles: countMap.get(r.userId) || 0,
    }));
  } catch (error) {
    console.error("getAuthorsList error:", error);
    return [];
  }
}

/**
 * Get author profile by unique slug
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorProfileDetail | null> {
  try {
    const rows = await db
      .select({
        id: authorProfiles.id,
        userId: authorProfiles.userId,
        slug: authorProfiles.slug,
        nameBangla: authorProfiles.nameBangla,
        nameEnglish: authorProfiles.nameEnglish,
        designation: authorProfiles.designation,
        department: authorProfiles.department,
        bio: authorProfiles.bio,
        avatarUrl: authorProfiles.avatarUrl,
        bureau: authorProfiles.bureau,
        isBureauChief: authorProfiles.isBureauChief,
        isStaff: authorProfiles.isStaff,
        twitterHandle: authorProfiles.twitterHandle,
        facebookUrl: authorProfiles.facebookUrl,
        linkedinUrl: authorProfiles.linkedinUrl,
        email: authorProfiles.email,
        phone: authorProfiles.phone,
        featuredOrder: authorProfiles.featuredOrder,
      })
      .from(authorProfiles)
      .where(eq(authorProfiles.slug, slug))
      .limit(1);

    if (!rows.length || !rows[0]) {
      return null;
    }

    const author = rows[0];

    const articleCountRes = await db
      .select({ count: count(articles.id) })
      .from(articles)
      .where(and(eq(articles.authorId, author.userId), eq(articles.status, "published")));

    const total = Number(articleCountRes[0]?.count) || 0;

    return {
      ...author,
      totalArticles: total,
    };
  } catch (error) {
    console.error("getAuthorBySlug error:", error);
    return null;
  }
}

/**
 * Get paginated articles written by an author (by author slug)
 */
export async function getAuthorArticles(
  slug: string,
  opts?: { page?: number; pageSize?: number }
): Promise<PaginatedResult<ArticleCard>> {
  const page = opts?.page || 1;
  const pageSize = opts?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  try {
    const authorRes = await db
      .select({ userId: authorProfiles.userId, name: authorProfiles.nameBangla, slug: authorProfiles.slug })
      .from(authorProfiles)
      .where(eq(authorProfiles.slug, slug))
      .limit(1);

    if (!authorRes.length || !authorRes[0]) {
      return { data: [], total: 0, page, pageSize, totalPages: 1 };
    }

    const author = authorRes[0];

    const conditions = [
      eq(articles.authorId, author.userId),
      eq(articles.status, "published"),
    ];

    const query = db
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
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(pageSize)
      .offset(offset);

    const totalRes = await db
      .select({ count: count(articles.id) })
      .from(articles)
      .where(and(...conditions));

    const [rows, countRows] = await Promise.all([query, totalRes]);
    const total = Number(countRows[0]?.count) || 0;

    const data: ArticleCard[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      category: r.categoryName && r.categorySlug ? { name: r.categoryName, slug: r.categorySlug } : null,
      author: { name: author.name, slug: author.slug },
    }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  } catch (error) {
    console.error("getAuthorArticles error:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 1 };
  }
}
