"use server";

import { db } from "@/db";
import { articles, articleAuthors, articleCategories, articleRevisions } from "@/db/schema/articles";
import { mediaAssets } from "@/db/schema/media";
import { user } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { articleLocations } from "@/db/schema/geography";
import { authorProfiles } from "@/db/schema/authors";
import { eq, desc, and, sql, count, isNotNull, lte, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidateArticle } from "@/lib/cache";
import { z } from "zod";
import { headers, cookies } from "next/headers";
import DOMPurify from "isomorphic-dompurify";
import type { ArticleCard, PaginatedResult } from "@/types";

// Sanitize rich HTML content
function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
      "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td", "iframe",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "width", "height",
      "class", "style", "frameborder", "allowfullscreen",
    ],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
  });
}


const ArticleCreateSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক").max(500),
  titleEn: z.string().max(500).optional(),
  slug: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "বিষয়বস্তু আবশ্যক"),
  featuredImageId: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  featuredImageAlt: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  status: z.enum(["draft", "pending_review", "approved", "published", "unpublished", "archived", "rejected"]).default("draft"),
  scheduledAt: z.coerce.date().optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  newsLocation: z.string().max(200).optional(),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  language: z.enum(["bn", "en"]).default("bn"),
});

export async function createArticle(formData: z.infer<typeof ArticleCreateSchema>): Promise<{ success: boolean; error?: string; slug?: string; isScheduled?: boolean; status?: string }> {
  try {
    let userId: string;
    let userRole = "reader";

    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      userId = session.user.id;
      userRole = (session.user as { role?: string }).role ?? "reader";
    } else {
      const cookieStore = await cookies();
      const isDemo = cookieStore.get("demo_admin_session")?.value === "true";
      if (!isDemo) {
        return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
      }
      const adminInDb = await db.select({ id: user.id }).from(user).where(eq(user.role, "super_admin")).limit(1);
      if (adminInDb.length > 0 && adminInDb[0]?.id) {
        userId = adminInDb[0].id;
        userRole = "super_admin";
      } else {
        return { success: false, error: "কোনো অ্যাডমিন ইউজার পাওয়া যায়নি" };
      }
    }

    if (!hasPermission(userRole as any, "article:create")) {
      return { success: false, error: "আপনার সংবাদ তৈরির অনুমতি নেই" };
    }

    const parsed = ArticleCreateSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "এই স্লাগটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে ভিন্ন স্লাগ ব্যবহার করুন।" };
    }

    const safeContent = sanitizeContent(data.content);
    const articleId = crypto.randomUUID();
    const now = new Date();

    let finalFeaturedImageId = data.featuredImageId;

    if (data.featuredImageUrl && data.featuredImageUrl.trim().length > 0) {
      const [asset] = await db
        .insert(mediaAssets)
        .values({
          filename: `img-${Date.now()}.jpg`,
          originalName: data.featuredImageAlt || "featured-image.jpg",
          mimeType: "image/jpeg",
          fileSize: 1024,
          r2Key: `uploads/${Date.now()}.jpg`,
          publicUrl: data.featuredImageUrl.trim(),
          altText: data.featuredImageAlt || data.title,
          uploadedBy: userId,
        })
        .returning({ id: mediaAssets.id });
      finalFeaturedImageId = asset?.id;
    }

    const isScheduledForFuture = data.scheduledAt && data.scheduledAt.getTime() > now.getTime();
    let finalStatus = data.status;
    let finalPublishedAt: Date | undefined = undefined;

    if (isScheduledForFuture) {
      finalStatus = "approved";
      finalPublishedAt = undefined;
    } else if (data.status === "published") {
      finalPublishedAt = now;
    }

    await db.insert(articles).values({
      id: articleId,
      title: data.title,
      titleEn: data.titleEn,
      slug: data.slug,
      excerpt: data.excerpt,
      content: safeContent,
      featuredImageId: finalFeaturedImageId,
      featuredImageAlt: data.featuredImageAlt,
      authorId: userId,
      status: finalStatus,
      scheduledAt: data.scheduledAt,
      publishedAt: finalPublishedAt,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      isBreaking: data.isBreaking,
      isFeatured: data.isFeatured,
      newsLocation: data.newsLocation,
      language: data.language,
    });

    await db.insert(articleAuthors).values({
      articleId,
      userId: userId,
      role: "primary",
    });

    if (data.categoryId) {
      await db.insert(articleCategories).values({
        articleId,
        categoryId: data.categoryId,
      });
    }

    if (data.divisionId || data.districtId) {
      await db.insert(articleLocations).values({
        articleId,
        divisionId: data.divisionId || null,
        districtId: data.districtId || null,
      }).onConflictDoNothing();
    }

    if (finalStatus === "published") {
      revalidateArticle(data.slug);
    }

    return { 
      success: true, 
      slug: data.slug,
      isScheduled: Boolean(isScheduledForFuture),
      status: finalStatus 
    };
  } catch (error) {
    console.error("createArticle error:", error);
    return { success: false, error: "সংবাদ সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}

export async function updateArticle(data: {
  id: string;
  title: string;
  titleEn?: string;
  excerpt?: string;
  content?: string;
  correctionNote?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(articles).where(eq(articles.id, data.id)).limit(1);
    if (!existing) {
      return { success: false, error: "সংবাদটি খুঁজে পাওয়া যায়নি" };
    }

    await db
      .update(articles)
      .set({
        title: data.title.trim(),
        titleEn: data.titleEn?.trim() || existing.titleEn,
        excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
        content: data.content ? sanitizeContent(data.content) : existing.content,
        correctionNote: data.correctionNote !== undefined ? data.correctionNote.trim() : existing.correctionNote,
        correctionAt: data.correctionNote ? new Date() : existing.correctionAt,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, data.id));

    revalidateArticle(existing.slug);
    return { success: true };
  } catch (err: any) {
    console.error("updateArticle error:", err);
    return { success: false, error: err?.message || "সার্ভার এরর" };
  }
}

export async function deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    let canDelete = false;
    if (session?.user) {
      const role = (session.user as { role?: string }).role ?? "reader";
      canDelete = hasPermission(role as any, "article:delete");
    } else {
      const cookieStore = await cookies();
      canDelete = cookieStore.get("demo_admin_session")?.value === "true";
    }

    if (!canDelete) {
      return { success: false, error: "সংবাদ মুছে ফেলার অনুমতি নেই" };
    }

    const [existing] = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.id, articleId)).limit(1);

    await db.delete(articles).where(eq(articles.id, articleId));

    if (existing) {
      revalidateArticle(existing.slug);
    }

    return { success: true };
  } catch (error) {
    console.error("deleteArticle error:", error);
    return { success: false, error: "সংবাদ অপসারণ ব্যর্থ হয়েছে" };
  }
}

export async function checkAndPublishScheduledArticles(): Promise<{ success: boolean; publishedCount: number; error?: string }> {
  try {
    const now = new Date();
    const toPublish = await db
      .select({ id: articles.id, slug: articles.slug })
      .from(articles)
      .where(
        and(
          or(eq(articles.status, "approved"), eq(articles.status, "draft")),
          isNotNull(articles.scheduledAt),
          lte(articles.scheduledAt, now)
        )
      );

    let count = 0;
    for (const item of toPublish) {
      await db
        .update(articles)
        .set({ status: "published", publishedAt: now, updatedAt: now })
        .where(eq(articles.id, item.id));

      revalidateArticle(item.slug);
      count++;
    }

    return { success: true, publishedCount: count };
  } catch (error) {
    console.error("checkAndPublishScheduledArticles error:", error);
    return { success: false, publishedCount: 0, error: "শিডিউল সংবাদ প্রক্রিয়াকরণ ব্যর্থ হয়েছে" };
  }
}

export async function getPublishedArticles(opts: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  language?: string;
}): Promise<PaginatedResult<ArticleCard>> {
  const { page = 1, pageSize = 20, categorySlug, language } = opts;
  const offset = (page - 1) * pageSize;

  try {
    const conditions = [eq(articles.status, "published")];
    if (language) {
      conditions.push(eq(articles.language, language));
    }

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
        authorName: user.name,
        authorSlug: authorProfiles.slug,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .leftJoin(authorProfiles, eq(articles.authorId, authorProfiles.userId))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(pageSize)
      .offset(offset);

    const [rows, totalResult] = await Promise.all([
      query,
      db.select({ count: count() }).from(articles).where(and(...conditions)),
    ]);

    const totalCount = totalResult[0]?.count ?? 0;

    if (!rows || rows.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1,
      };
    }

    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        publishedAt: r.publishedAt,
        featuredImageUrl: r.featuredImageUrl,
        featuredImageAlt: r.featuredImageAlt,
        category: r.categoryName ? { name: r.categoryName, slug: r.categorySlug! } : null,
        author: r.authorName ? { name: r.authorName, slug: r.authorSlug || "mahmudur-rahman" } : null,
      })),
      total: Number(totalCount),
      page,
      pageSize,
      totalPages: Math.ceil(Number(totalCount) / pageSize),
    };
  } catch (error) {
    console.error("Could not query articles from DB:", error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleEn: articles.titleEn,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        featuredImageUrl: mediaAssets.publicUrl,
        featuredImageAlt: articles.featuredImageAlt,
        correctionNote: articles.correctionNote,
        correctionAt: articles.correctionAt,
        seoTitle: articles.seoTitle,
        seoDescription: articles.seoDescription,
        language: articles.language,
        isBreaking: articles.isBreaking,
        newsLocation: articles.newsLocation,
        authorId: articles.authorId,
        authorName: user.name,
        authorSlug: authorProfiles.slug,
        authorDesignation: authorProfiles.designation,
        authorBio: authorProfiles.bio,
        authorAvatarUrl: authorProfiles.avatarUrl,
        authorBureau: authorProfiles.bureau,
        authorTwitter: authorProfiles.twitterHandle,
        authorFacebook: authorProfiles.facebookUrl,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .leftJoin(authorProfiles, eq(articles.authorId, authorProfiles.userId))
      .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
      .limit(1);

    if (article) return article;
    return null;
  } catch (error) {
    console.error("Could not query article by slug from DB:", error);
    return null;
  }
}

export async function getLatestArticles(limit = 10): Promise<ArticleCard[]> {
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
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      category: r.categoryName ? { name: r.categoryName, slug: r.categorySlug! } : null,
    }));
  } catch (error) {
    console.error("Could not query latest articles from DB:", error);
    return [];
  }
}

export async function getPopularArticles(limit = 6): Promise<ArticleCard[]> {
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
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.viewCount))
      .limit(limit);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      featuredImageUrl: r.featuredImageUrl,
      featuredImageAlt: r.featuredImageAlt,
      category: r.categoryName ? { name: r.categoryName, slug: r.categorySlug! } : null,
    }));
  } catch (error) {
    console.error("Could not query popular articles from DB:", error);
    return [];
  }
}
