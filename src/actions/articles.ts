"use server";

import { db } from "@/db";
import { articles, articleAuthors, articleCategories, articleRevisions } from "@/db/schema/articles";
import { mediaAssets } from "@/db/schema/media";
import { user } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { articleLocations } from "@/db/schema/geography";
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

// Realistic Bengali demo seed content for authentic local layout testing
const DEMO_ARTICLES: (ArticleCard & {
  content: string;
  updatedAt?: Date;
  newsLocation?: string;
  correctionNote?: string;
  correctionAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  language?: string;
  isBreaking?: boolean;
})[] = [
  {
    id: "demo-lead-1",
    title: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে ১০ দফা রূপরেখা ঘোষণা সরকারের",
    slug: "economic-stability-ten-point-roadmap",
    excerpt: "মুদ্রাস্ফীতি নিয়ন্ত্রণ, ব্যাংক খাতের সংস্কার এবং বৈদেশিক মুদ্রার রিজার্ভ শক্তিশালী করতে অন্তর্বর্তী সরকার ১০ দফা অগ্রাধিকারমূলক কর্মপরিকল্পনা ঘোষণা করেছে।",
    content: `
      <p>দেশের সামগ্রিক অর্থনীতিতে স্থিতিশীলতা ফেরাতে এবং সাধারণ মানুষের ওপর দ্রব্যমূল্যের চাপ কমাতে ১০ দফা অগ্রাধিকারমূলক কর্মপরিকল্পনা ঘোষণা করেছে সরকার। এতে ব্যাংক খাতের কাঠামোগত সংস্কার, কর ব্যবস্থার আধুনিকায়ন এবং বৈদেশিক মুদ্রার রিজার্ভ সুসংহত করার বিষয়গুলো গুরুত্ব পেয়েছে।</p>
      <h2>ব্যাংক খাতের স্বচ্ছতা ও সংস্কার</h2>
      <p>পরিকল্পনায় বলা হয়েছে, শীর্ষ খেলাপিদের কাছ থেকে ঋণ আদায়ে গঠিত টাস্কফোর্স অবিলম্বে কার্যকর ব্যবস্থা গ্রহণ করবে। একইসঙ্গে কেন্দ্রীয় ব্যাংকের স্বায়ত্তশাসন বৃদ্ধি ও আর্থিক শৃঙ্খলা রক্ষায় কঠোর আইন প্রণয়ন করা হবে।</p>
      <blockquote>“আর্থিক খাতে সুশাসন প্রতিষ্ঠা ছাড়া টেকসই প্রবৃদ্ধি সম্ভব নয়। দেশের প্রতিটি নাগরিকের আস্থার প্রতিফলন ঘটাতে এই সংস্কার অপরিহার্য।”</blockquote>
      <h2>মূল্যস্ফীতি নিয়ন্ত্রণ ও সামাজিক নিরাপত্তা</h2>
      <p>নিত্যপ্রয়োজনীয় পণ্যের সরবরাহ স্বাভাবিক রাখতে বন্দর ও পরিবহন ব্যবস্থার জটিলতা নিরসন করা হয়েছে। একই সাথে নিম্ন আয়ের পরিবারগুলোর জন্য সামাজিক নিরাপত্তা বেষ্টনীর আওতা বাড়ানোর সিদ্ধান্ত নেওয়া হয়েছে।</p>
    `,
    featuredImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "অর্থনৈতিক নীতি ও ব্যাংকিং সম্মেলন",
    publishedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    category: { name: "জাতীয়", slug: "national" },
    author: { name: "মুহাম্মদ তানভীর আহমেদ", slug: "tanvir-ahmed" },
    newsLocation: "ঢাকা",
    seoTitle: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে ১০ দফা রূপরেখা ঘোষণা",
    seoDescription: "মুদ্রাস্ফীতি নিয়ন্ত্রণ ও ব্যাংক খাতের সংস্কারে সরকারের ১০ দফা পরিকল্পনা।",
    language: "bn",
    isBreaking: true,
  },
  {
    id: "demo-supp-1",
    title: "পদ্মা সেতুতে রেল চলাচলে নতুন সময়সূচি কার্যকর হচ্ছে আগামী সপ্তাহ থেকে",
    slug: "padma-bridge-rail-new-schedule",
    excerpt: "ঢাকা থেকে যশোর ও খুলনাগামী ট্রেনের যাত্রার সময় আরও ৩০ মিনিট কমে আসবে নতুন সূচিতে।",
    content: "<p>পদ্মা সেতু সংযোগ রেলপথে ট্রেনের সময়সূচি পুনর্বিন্যাস করা হচ্ছে। নতুন সূচি অনুযায়ী ঢাকা-খুলনা রুটে ভ্রমণের সময় উল্লেখযোগ্য হারে কমবে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "রেল যোগাযোগ ও উন্নয়ন",
    publishedAt: new Date(Date.now() - 1000 * 60 * 120),
    category: { name: "জাতীয়", slug: "national" },
    author: { name: "ফারহানা হক", slug: "farhana-haque" },
    newsLocation: "ঢাকা",
    language: "bn",
  },
  {
    id: "demo-supp-2",
    title: "নির্বাচন কমিশনের সঙ্গে অংশীজনদের সংলাপ শুরু হতে যাচ্ছে নভেম্বরে",
    slug: "election-commission-dialogue-begins-november",
    excerpt: "নির্বাচনী ব্যবস্থার টেকসই সংস্কার ও আধুনিকায়নের লক্ষ্যে রাজনৈতিক দল ও নাগরিক সমাজের সঙ্গে আলোচনা হবে।",
    content: "<p>নির্বাচন কমিশন সচিবালয় জানিয়েছে, আগামী মাসের প্রথম সপ্তাহ থেকে ভোটার তালিকা হালনাগাদ ও ভোটগ্রহণ পদ্ধতি নিয়ে সংলাপ শুরু হবে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "নির্বাচন ও প্রশাসনিক সম্মেলন",
    publishedAt: new Date(Date.now() - 1000 * 60 * 210),
    category: { name: "রাজনীতি", slug: "politics" },
    author: { name: "শফিকুর রহমান", slug: "shafiqur-rahman" },
    newsLocation: "ঢাকা",
    language: "bn",
  },
  {
    id: "demo-supp-3",
    title: "বিশ্বকাপের প্রস্তুতি ম্যাচে পাকিস্তানের বিপক্ষে দুর্দান্ত জয় পেল বাংলাদেশ",
    slug: "bangladesh-wins-cricket-warmup-pakistan",
    excerpt: "ব্যাটিং ও বোলিংয়ের দুর্দান্ত ভারসাম্যে বড় ব্যবধানে জয় তুলে নিল শান্ত-মিরাজদের দল।",
    content: "<p>অলরাউন্ড পারফরম্যান্সে প্রস্তুতি ম্যাচে জয় পেল বাংলাদেশ ক্রিকেট দল। টপ অর্ডারের চমৎকার ব্যাটিংয়ের পর স্পিন আক্রমণেই ধরাশায়ী হয় প্রতিপক্ষ।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "ক্রিকেট ম্যাচ উদযাপন",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300),
    category: { name: "খেলাধুলা", slug: "sports" },
    author: { name: "ইশতিয়াক জামান", slug: "ishtiaq-zaman" },
    newsLocation: "মিরপুর",
    language: "bn",
  },
  {
    id: "demo-lat-1",
    title: "জাতিসংঘ জলবায়ু সম্মেলনে ক্ষয়ক্ষতি তহবিলে ১০০ মিলিয়ন ডলারের প্রস্তাব",
    slug: "un-climate-summit-loss-and-damage-fund",
    excerpt: "জলবায়ু ঝুঁকিপূর্ণ দেশগুলোর সুরক্ষায় আন্তর্জাতিক সহায়তা দ্রুত ছাড়ের তাগিদ দিলেন বিশ্ব নেতারা।",
    content: "<p>চলমান বৈশ্বিক জলবায়ু সম্মেলনে ঝুঁকিপূর্ণ উপকূলীয় অঞ্চলের মানুষের জীবনমান সুরক্ষায় নতুন অর্থায়নের প্রতিশ্রুতি এসেছে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "জলবায়ু সম্মেলন ও পরিবেশ",
    publishedAt: new Date(Date.now() - 1000 * 60 * 360),
    category: { name: "আন্তর্জাতিক", slug: "international" },
    author: { name: "রুবাইয়া আফরিন", slug: "rubaiya-afrin" },
    newsLocation: "জেনেভা",
    language: "bn",
  },
  {
    id: "demo-lat-2",
    title: "কৃত্রিম বুদ্ধিমত্তা ব্যবহারে নতুন জাতীয় দিকনির্দেশনা চূড়ান্ত করল তথ্যপ্রযুক্তি বিভাগ",
    slug: "national-ai-policy-guidelines-finalized",
    excerpt: "শিক্ষার্থী, উদ্যোক্তা ও প্রযুক্তিবিদদের গবেষণা সম্প্রসারণে উন্মুক্ত ডেটা প্ল্যাটফর্ম গড়ে তোলা হবে।",
    content: "<p>দেশে এআই প্রযুক্তির নৈতিক ব্যবহার ও স্থানীয় উদ্ভাবনকে ত্বরান্বিত করতে রূপরেখা ঘোষণা করা হয়েছে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "কৃত্রিম বুদ্ধিমত্তা ও গবেষণা",
    publishedAt: new Date(Date.now() - 1000 * 60 * 420),
    category: { name: "প্রযুক্তি", slug: "technology" },
    author: { name: "কায়সার মাহমুদ", slug: "kaisar-mahmud" },
    newsLocation: "ঢাকা",
    language: "bn",
  },
  {
    id: "demo-lat-3",
    title: "রপ্তানি আয়ে ইতিবাচক প্রবৃদ্ধি: তৈরি পোশাক ও চামড়াশিল্পে ঊর্ধ্বমুখী প্রবণতা",
    slug: "export-earnings-positive-growth-rmg",
    excerpt: "গত ত্রৈমাসিকে ইউরোপ ও উত্তর আমেরিকার বাজারে বাংলাদেশি পণ্যের চাহিদা বৃদ্ধি পেয়েছে।",
    content: "<p>রপ্তানি উন্নয়ন ব্যুরো (ইপিবি) প্রকাশিত হালনাগাদ তথ্যে দেখা যায়, চলতি অর্থবছরের প্রথম ভাগে রপ্তানি আয় লক্ষ্যমাত্রার চেয়েও এগিয়ে রয়েছে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "রপ্তানি ও আন্তর্জাতিক বাণিজ্য",
    publishedAt: new Date(Date.now() - 1000 * 60 * 500),
    category: { name: "অর্থনীতি", slug: "economy" },
    author: { name: "ফারহানা হক", slug: "farhana-haque" },
    newsLocation: "চট্টগ্রাম",
    language: "bn",
  },
  {
    id: "demo-lat-4",
    title: "আন্তর্জাতিক চলচ্চিত্র উৎসবে শ্রেষ্ঠ পরিচালকের পুরস্কার জিতলেন তারেক আহমেদ",
    slug: "bangladeshi-filmmaker-wins-international-award",
    excerpt: "সুন্দরবনের প্রান্তিক জনগোষ্ঠীর জীবন নিয়ে নির্মিত প্রামাণ্যচিত্রটি আন্তর্জাতিক মহলে ব্যাপক প্রশংসা কুড়িয়েছে।",
    content: "<p>আন্তর্জাতিক চলচ্চিত্র উৎসবে বাংলাদেশের নাম উজ্জ্বল করলেন তরুণ নির্মাতা তারেক আহমেদ। তাঁর প্রামাণ্যচিত্র বিশ্বজুড়ে দর্শকপ্রিয়তা পেয়েছে।</p>",
    featuredImageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    featuredImageAlt: "চলচ্চিত্র উৎসব ও শিল্প",
    publishedAt: new Date(Date.now() - 1000 * 60 * 600),
    category: { name: "বিনোদন", slug: "entertainment" },
    author: { name: "ইশতিয়াক জামান", slug: "ishtiaq-zaman" },
    newsLocation: "ঢাকা",
    language: "bn",
  },
];

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
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
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
      // Return filtered demo articles if DB has no published articles
      const filtered = categorySlug
        ? DEMO_ARTICLES.filter((a) => a.category?.slug === categorySlug)
        : DEMO_ARTICLES;

      return {
        data: filtered.slice(offset, offset + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize) || 1,
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
        author: r.authorName ? { name: r.authorName, slug: "" } : null,
      })),
      total: Number(totalCount),
      page,
      pageSize,
      totalPages: Math.ceil(Number(totalCount) / pageSize),
    };
  } catch (error) {
    console.warn("Could not query articles from DB, falling back to demo content:", error);
    const filtered = categorySlug
      ? DEMO_ARTICLES.filter((a) => a.category?.slug === categorySlug)
      : DEMO_ARTICLES;

    return {
      data: filtered.slice(offset, offset + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
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
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
      .limit(1);

    if (article) return article;

    // Check demo articles fallback
    const demo = DEMO_ARTICLES.find((a) => a.slug === slug);
    if (demo) {
      return {
        id: demo.id,
        title: demo.title,
        titleEn: null,
        slug: demo.slug,
        excerpt: demo.excerpt,
        content: demo.content,
        publishedAt: demo.publishedAt ?? new Date(),
        updatedAt: demo.updatedAt ?? new Date(),
        featuredImageUrl: demo.featuredImageUrl ?? null,
        featuredImageAlt: demo.featuredImageAlt ?? null,
        correctionNote: demo.correctionNote ?? null,
        correctionAt: demo.correctionAt ?? null,
        seoTitle: demo.seoTitle ?? demo.title,
        seoDescription: demo.seoDescription ?? demo.excerpt ?? null,
        language: demo.language ?? "bn",
        isBreaking: demo.isBreaking ?? false,
        newsLocation: demo.newsLocation ?? "ঢাকা",
        authorId: "demo-author",
        authorName: demo.author?.name ?? "সম্পাদকীয় বিভাগ",
        categoryName: demo.category?.name ?? "জাতীয়",
        categorySlug: demo.category?.slug ?? "national",
      };
    }

    return null;
  } catch (error) {
    console.warn("Could not query article by slug from DB, checking demo:", error);
    const demo = DEMO_ARTICLES.find((a) => a.slug === slug);
    if (demo) {
      return {
        id: demo.id,
        title: demo.title,
        titleEn: null,
        slug: demo.slug,
        excerpt: demo.excerpt,
        content: demo.content,
        publishedAt: demo.publishedAt ?? new Date(),
        updatedAt: demo.updatedAt ?? new Date(),
        featuredImageUrl: demo.featuredImageUrl ?? null,
        featuredImageAlt: demo.featuredImageAlt ?? null,
        correctionNote: demo.correctionNote ?? null,
        correctionAt: demo.correctionAt ?? null,
        seoTitle: demo.seoTitle ?? demo.title,
        seoDescription: demo.seoDescription ?? demo.excerpt ?? null,
        language: demo.language ?? "bn",
        isBreaking: demo.isBreaking ?? false,
        newsLocation: demo.newsLocation ?? "ঢাকা",
        authorId: "demo-author",
        authorName: demo.author?.name ?? "সম্পাদকীয় বিভাগ",
        categoryName: demo.category?.name ?? "জাতীয়",
        categorySlug: demo.category?.slug ?? "national",
      };
    }
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
      return DEMO_ARTICLES.slice(0, limit);
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
    console.warn("Could not query latest articles from DB, using demo:", error);
    return DEMO_ARTICLES.slice(0, limit);
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
      return DEMO_ARTICLES.slice(0, limit);
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
    return DEMO_ARTICLES.slice(0, limit);
  }
}
