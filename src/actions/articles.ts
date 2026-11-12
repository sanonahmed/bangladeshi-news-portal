"use server";

import { db } from "@/db";
import { articles, articleAuthors, articleCategories, articleRevisions } from "@/db/schema/articles";
import { breakingNews } from "@/db/schema/breaking-news";
import { mediaAssets } from "@/db/schema/media";
import { user } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { articleLocations } from "@/db/schema/geography";
import { authorProfiles } from "@/db/schema/authors";
import { eq, desc, and, sql, count, isNotNull, lte, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { revalidateArticle } from "@/lib/cache";
import { revalidatePath } from "next/cache";
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
  focusKeyword: z.string().max(100).optional(),
  headlineB: z.string().max(500).optional(),
  abTestStatus: z.enum(["none", "active", "completed_a", "completed_b"]).default("none"),
  abTestDurationMinutes: z.coerce.number().default(30),
});

export async function createArticle(formData: z.infer<typeof ArticleCreateSchema>): Promise<{ success: boolean; error?: string; slug?: string; isScheduled?: boolean; status?: string }> {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
    }
    const userId = adminUser.id;
    const userRole = adminUser.role;

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

    // Enforce publication restriction: journalists cannot publish directly without review
    if ((finalStatus === "published" || isScheduledForFuture) && !hasPermission(userRole as any, "article:publish")) {
      finalStatus = "pending_review";
      finalPublishedAt = undefined;
    } else if (isScheduledForFuture) {
      finalStatus = "approved";
      finalPublishedAt = undefined;
    } else if (data.status === "published") {
      finalPublishedAt = now;
    }

    const hasAbVariant = !!data.headlineB?.trim();
    const isAbActive = hasAbVariant && data.abTestStatus === "active";

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
      focusKeyword: data.focusKeyword?.trim() || null,
      headlineB: data.headlineB?.trim() || null,
      abTestStatus: isAbActive ? "active" : "none",
      abTestStartedAt: isAbActive ? now : null,
      abTestDurationMinutes: data.abTestDurationMinutes || 30,
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
  focusKeyword?: string;
  headlineB?: string;
  abTestStatus?: "none" | "active" | "completed_a" | "completed_b";
  abTestDurationMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
    }
    const role = adminUser.role;
    const userId = adminUser.id;

    const [existing] = await db.select().from(articles).where(eq(articles.id, data.id)).limit(1);
    if (!existing) {
      return { success: false, error: "সংবাদটি খুঁজে পাওয়া যায়নি" };
    }

    if (existing.authorId !== userId && !hasPermission(role as any, "article:edit_any")) {
      return { success: false, error: "আপনার অন্যের রচিত সংবাদ সম্পাদনা করার অনুমতি নেই।" };
    }

    const updates: Record<string, any> = {
      title: data.title.trim(),
      titleEn: data.titleEn?.trim() || existing.titleEn,
      excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
      content: data.content ? sanitizeContent(data.content) : existing.content,
      correctionNote: data.correctionNote !== undefined ? data.correctionNote.trim() : existing.correctionNote,
      correctionAt: data.correctionNote ? new Date() : existing.correctionAt,
      updatedAt: new Date(),
    };

    if (data.focusKeyword !== undefined) {
      updates.focusKeyword = data.focusKeyword.trim() || null;
    }
    if (data.headlineB !== undefined) {
      updates.headlineB = data.headlineB.trim() || null;
    }
    if (data.abTestStatus !== undefined) {
      updates.abTestStatus = data.abTestStatus;
      if (data.abTestStatus === "active" && !existing.abTestStartedAt) {
        updates.abTestStartedAt = new Date();
      }
    }
    if (data.abTestDurationMinutes !== undefined) {
      updates.abTestDurationMinutes = data.abTestDurationMinutes;
    }
    if (data.seoTitle !== undefined) {
      updates.seoTitle = data.seoTitle.trim() || null;
    }
    if (data.seoDescription !== undefined) {
      updates.seoDescription = data.seoDescription.trim() || null;
    }
    if (data.featuredImageAlt !== undefined) {
      updates.featuredImageAlt = data.featuredImageAlt.trim() || null;
    }

    await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, data.id));

    revalidateArticle(existing.slug);
    return { success: true };
  } catch (err: any) {
    console.error("updateArticle error:", err);
    return { success: false, error: err?.message || "সার্ভার এরর" };
  }
}

/**
 * Start or activate an A/B test for an existing article
 */
export async function startAbTest(articleId: string, headlineB: string, durationMinutes = 30): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!existing) return { success: false, error: "সংবাদ পাওয়া যায়নি" };

    await db
      .update(articles)
      .set({
        headlineB: headlineB.trim(),
        abTestStatus: "active",
        abTestStartedAt: new Date(),
        abTestDurationMinutes: durationMinutes,
        abTestImpressionsA: 0,
        abTestImpressionsB: 0,
        abTestClicksA: 0,
        abTestClicksB: 0,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidateArticle(existing.slug);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "এ/বি টেস্ট চালু করা যায়নি" };
  }
}

/**
 * Conclude an A/B test and declare a winner
 */
export async function finalizeAbTest(articleId: string, winner: "a" | "b"): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!existing) return { success: false, error: "সংবাদ পাওয়া যায়নি" };

    const newTitle = winner === "b" && existing.headlineB ? existing.headlineB : existing.title;
    const newStatus = winner === "b" ? "completed_b" : "completed_a";

    await db
      .update(articles)
      .set({
        title: newTitle,
        abTestStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidateArticle(existing.slug);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "টেস্ট সমাপ্ত করতে ব্যর্থ" };
  }
}

/**
 * Reset an A/B test back to none
 */
export async function resetAbTest(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!existing) return { success: false, error: "সংবাদ পাওয়া যায়নি" };

    await db
      .update(articles)
      .set({
        abTestStatus: "none",
        abTestStartedAt: null,
        abTestImpressionsA: 0,
        abTestImpressionsB: 0,
        abTestClicksA: 0,
        abTestClicksB: 0,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidateArticle(existing.slug);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "টেস্ট রিসেট করতে ব্যর্থ" };
  }
}

/**
 * Record an impression for variant A or B
 */
export async function recordAbTestImpression(articleId: string, variant: "a" | "b"): Promise<void> {
  try {
    if (variant === "a") {
      await db
        .update(articles)
        .set({ abTestImpressionsA: sql`${articles.abTestImpressionsA} + 1` })
        .where(eq(articles.id, articleId));
    } else {
      await db
        .update(articles)
        .set({ abTestImpressionsB: sql`${articles.abTestImpressionsB} + 1` })
        .where(eq(articles.id, articleId));
    }
  } catch (e) {
    console.warn("recordAbTestImpression failed:", e);
  }
}

/**
 * Record a click for variant A or B
 */
export async function recordAbTestClick(articleId: string, variant: "a" | "b"): Promise<void> {
  try {
    if (variant === "a") {
      await db
        .update(articles)
        .set({ abTestClicksA: sql`${articles.abTestClicksA} + 1` })
        .where(eq(articles.id, articleId));
    } else {
      await db
        .update(articles)
        .set({ abTestClicksB: sql`${articles.abTestClicksB} + 1` })
        .where(eq(articles.id, articleId));
    }
  } catch (e) {
    console.warn("recordAbTestClick failed:", e);
  }
}

export async function deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
    }
    const role = adminUser.role;
    const canDelete = hasPermission(role as any, "article:delete");

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
        focusKeyword: articles.focusKeyword,
        headlineB: articles.headlineB,
        abTestStatus: articles.abTestStatus,
        abTestStartedAt: articles.abTestStartedAt,
        abTestDurationMinutes: articles.abTestDurationMinutes,
        abTestImpressionsA: articles.abTestImpressionsA,
        abTestImpressionsB: articles.abTestImpressionsB,
        abTestClicksA: articles.abTestClicksA,
        abTestClicksB: articles.abTestClicksB,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .leftJoin(authorProfiles, eq(articles.authorId, authorProfiles.userId))
      .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
      .limit(1);

    if (article) {
      if (article.abTestStatus === "active" && article.abTestStartedAt) {
        const elapsedMs = Date.now() - new Date(article.abTestStartedAt).getTime();
        const maxMs = (article.abTestDurationMinutes || 30) * 60 * 1000;
        if (elapsedMs >= maxMs) {
          const safeImpA = Math.max(article.abTestImpressionsA, article.abTestClicksA, 1);
          const safeImpB = Math.max(article.abTestImpressionsB, article.abTestClicksB, 1);
          const ctrA = article.abTestClicksA / safeImpA;
          const ctrB = article.abTestClicksB / safeImpB;
          const bWon = ctrB > ctrA && !!article.headlineB;
          const newStatus = bWon ? "completed_b" : "completed_a";
          const newTitle = bWon && article.headlineB ? article.headlineB : article.title;

          try {
            await db
              .update(articles)
              .set({
                title: newTitle,
                abTestStatus: newStatus,
                updatedAt: new Date(),
              })
              .where(eq(articles.id, article.id));

            article.abTestStatus = newStatus;
            article.title = newTitle;
          } catch (err) {
            console.warn("Auto-finalize A/B test error:", err);
          }
        }
      }
      return article;
    }
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
        headlineB: articles.headlineB,
        abTestStatus: articles.abTestStatus,
        abTestStartedAt: articles.abTestStartedAt,
        abTestDurationMinutes: articles.abTestDurationMinutes,
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
      headlineB: r.headlineB,
      abTestStatus: r.abTestStatus,
      abTestStartedAt: r.abTestStartedAt,
      abTestDurationMinutes: r.abTestDurationMinutes,
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

export interface TrendingStoryItem {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  publishedAt: Date | string | null;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isBreaking: boolean;
  velocityPerHour: number;
  momentumPercent: number;
  activeReaders?: number;
}

export interface TrendingVelocityData {
  activeReaders: number;
  trafficVelocityRating: "viral" | "surging" | "steady";
  trafficMultiplier: number;
  todayTotalViews: number;
  todayPublishedCount: number;
  trendingStories: TrendingStoryItem[];
}

/**
 * Get top trending stories calculated by real-time velocity and readership momentum
 */
export async function getTrendingArticlesWithVelocity(): Promise<TrendingVelocityData> {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Fetch live concurrent active readers from active_visitors table (within last 2 minutes)
    let activeReaders = 0;
    const storyReadersMap: Record<string, number> = {};

    try {
      const activeResult = await db.execute(
        sql`SELECT count(*)::int AS count FROM active_visitors WHERE last_seen_at >= NOW() - INTERVAL '2 minutes';`
      );
      activeReaders = Number(activeResult.rows[0]?.count || 0);

      const perStoryResult = await db.execute(
        sql`SELECT article_id, count(*)::int AS count FROM active_visitors WHERE last_seen_at >= NOW() - INTERVAL '2 minutes' AND article_id IS NOT NULL GROUP BY article_id;`
      );
      for (const r of perStoryResult.rows as Array<{ article_id: string | null; count: number }>) {
        if (r.article_id) {
          storyReadersMap[r.article_id] = Number(r.count || 0);
        }
      }
    } catch (e) {
      console.warn("Active visitors query fallback:", e);
    }

    // 2. Query today's published articles count
    let todayPublishedCount = 0;
    try {
      const todayPubResult = await db.execute(
        sql`SELECT count(*)::int AS count FROM articles WHERE status = 'published' AND published_at >= ${startOfToday.toISOString()};`
      );
      todayPublishedCount = Number(todayPubResult.rows[0]?.count || 0);
    } catch (e) {
      console.warn("Today published count query fallback:", e);
    }

    // 3. Query total views across published articles
    let todayTotalViews = 0;
    try {
      const totalViewsResult = await db.execute(
        sql`SELECT COALESCE(sum(view_count), 0)::int AS total FROM articles WHERE status = 'published';`
      );
      todayTotalViews = Number(totalViewsResult.rows[0]?.total || 0);
    } catch (e) {
      console.warn("Total views query fallback:", e);
    }

    // 4. Fetch recent published articles to compute velocity
    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        viewCount: articles.viewCount,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        isFeatured: articles.isFeatured,
        isBreaking: articles.isBreaking,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(30);

    const scoredStories = rows.map((art) => {
      const pubDate = art.publishedAt ? new Date(art.publishedAt) : new Date(art.createdAt);
      const elapsedHours = Math.max(0.1, (now.getTime() - pubDate.getTime()) / (3600 * 1000));
      const views = art.viewCount || 0;
      const storyActive = storyReadersMap[art.id] || 0;

      // Real velocity: views divided by elapsed hours, plus weighted current active readers
      const rawVelocity = views > 0 ? Math.round(views / elapsedHours) : 0;
      const velocityPerHour = rawVelocity + storyActive * 10;

      return {
        id: art.id,
        title: art.title,
        slug: art.slug,
        viewCount: views,
        publishedAt: art.publishedAt,
        categoryName: art.categoryName || "জাতীয়",
        categorySlug: art.categorySlug || "national",
        isFeatured: art.isFeatured || false,
        isBreaking: art.isBreaking || false,
        velocityPerHour,
        momentumPercent: 0,
        activeReaders: storyActive,
      };
    });

    // Sort by velocity per hour descending, with view count as tiebreaker
    scoredStories.sort((a, b) => {
      if (b.velocityPerHour !== a.velocityPerHour) {
        return b.velocityPerHour - a.velocityPerHour;
      }
      return b.viewCount - a.viewCount;
    });

    const topStories = scoredStories.slice(0, 6);
    const maxVelocity = Math.max(...topStories.map((s) => s.velocityPerHour), 0);

    const trendingStories = topStories.map((story) => ({
      ...story,
      momentumPercent:
        maxVelocity > 0
          ? Math.min(100, Math.round((story.velocityPerHour / maxVelocity) * 100))
          : 0,
    }));

    // Realistic multiplier & velocity status
    const trafficMultiplier =
      activeReaders === 0 ? 1.0 : Number((1.0 + activeReaders * 0.25).toFixed(1));
    const trafficVelocityRating: "viral" | "surging" | "steady" =
      activeReaders >= 50 || trafficMultiplier >= 2.5
        ? "viral"
        : activeReaders >= 10 || trafficMultiplier >= 1.5
        ? "surging"
        : "steady";

    return {
      activeReaders,
      trafficVelocityRating,
      trafficMultiplier,
      todayTotalViews,
      todayPublishedCount,
      trendingStories,
    };
  } catch (error) {
    console.error("getTrendingArticlesWithVelocity error:", error);
    return {
      activeReaders: 0,
      trafficVelocityRating: "steady",
      trafficMultiplier: 1.0,
      todayTotalViews: 0,
      todayPublishedCount: 0,
      trendingStories: [],
    };
  }
}

/**
 * 1-Click Action: Promote an article as the Homepage Lead Story
 */
export async function setArticleAsHomepageLead(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [target] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!target) return { success: false, error: "সংবাদ পাওয়া যায়নি" };

    // Demote any current featured lead story to false
    await db
      .update(articles)
      .set({ isFeatured: false })
      .where(eq(articles.isFeatured, true));

    // Promote target article and refresh its publication timestamp so it leads the homepage
    await db
      .update(articles)
      .set({
        isFeatured: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidateArticle(target.slug);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    console.error("setArticleAsHomepageLead error:", e);
    return { success: false, error: e?.message || "হোমপেজের শীর্ষ সংবাদ নির্বাচন ব্যর্থ হয়েছে" };
  }
}

/**
 * 1-Click Action: Push an article directly to the live Breaking News ticker
 */
export async function sendArticleToBreakingTicker(articleId: string): Promise<{ success: boolean; headline?: string; error?: string }> {
  try {
    const [target] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!target) return { success: false, error: "সংবাদ পাওয়া যায়নি" };

    // Check if this article is already in active breaking news
    const existing = await db
      .select({ id: breakingNews.id })
      .from(breakingNews)
      .where(and(eq(breakingNews.url, `/news/${target.slug}`), eq(breakingNews.isActive, true)))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, headline: target.title };
    }

    const [firstUser] = await db.select({ id: user.id }).from(user).limit(1);
    const userId = firstUser?.id || target.authorId;

    await db.insert(breakingNews).values({
      id: crypto.randomUUID(),
      headline: target.title,
      headlineEn: target.titleEn || null,
      url: `/news/${target.slug}`,
      isExternal: false,
      priority: 10,
      isActive: true,
      createdBy: userId,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours expiration
    });

    // Also mark the article itself as breaking
    await db
      .update(articles)
      .set({ isBreaking: true })
      .where(eq(articles.id, articleId));

    revalidatePath("/");
    revalidatePath("/breaking");
    revalidatePath("/admin/breaking-news");
    revalidatePath("/admin");
    return { success: true, headline: target.title };
  } catch (e: any) {
    console.error("sendArticleToBreakingTicker error:", e);
    return { success: false, error: e?.message || "ব্রেকিং নিউজে যুক্ত করতে ব্যর্থ হয়েছে" };
  }
}
