import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { categories } from "@/db/schema/categories";
import { mediaAssets } from "@/db/schema/media";
import { user } from "@/db/schema/auth";
import {
  sql,
  ilike,
  or,
  and,
  eq,
  desc,
  gte,
  lte,
  count,
} from "drizzle-orm";
import type { ArticleStatus } from "@/db/schema/articles";

export interface SearchParams {
  query: string;
  categorySlug?: string;
  authorSlug?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    category: { name: string; slug: string } | null;
    featuredImageUrl: string | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchArticles(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    categorySlug,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
  } = params;
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${query.trim()}%`;

  try {
    const conditions = [
      eq(articles.status, "published"),
      or(
        ilike(articles.title, searchPattern),
        ilike(articles.excerpt, searchPattern)
      ),
    ];

    if (dateFrom) {
      conditions.push(gte(articles.publishedAt, dateFrom));
    }
    if (dateTo) {
      conditions.push(lte(articles.publishedAt, dateTo));
    }

    const whereClause = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          publishedAt: articles.publishedAt,
          featuredImageUrl: mediaAssets.publicUrl,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(articles)
        .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
        .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
        .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(articles.publishedAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: count() }).from(articles).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      articles: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        publishedAt: row.publishedAt,
        category: row.categoryName ? { name: row.categoryName, slug: row.categorySlug! } : null,
        featuredImageUrl: row.featuredImageUrl,
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.warn("searchArticles error, returning fallback demo search result:", error);
    return {
      articles: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  try {
    const rows = await db
      .select({ title: articles.title })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          ilike(articles.title, `%${query.trim()}%`)
        )
      )
      .limit(8);

    return rows.map((r) => r.title);
  } catch {
    return [];
  }
}
