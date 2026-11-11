import { db } from "@/db";
import { articles } from "@/db/schema/articles";
import { mediaAssets } from "@/db/schema/media";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminEditArticleClient } from "./AdminEditArticleClient";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  let article = null;
  try {
    const [row] = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleEn: articles.titleEn,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        correctionNote: articles.correctionNote,
        status: articles.status,
        publishedAt: articles.publishedAt,
        focusKeyword: articles.focusKeyword,
        headlineB: articles.headlineB,
        abTestStatus: articles.abTestStatus,
        abTestStartedAt: articles.abTestStartedAt,
        abTestDurationMinutes: articles.abTestDurationMinutes,
        abTestImpressionsA: articles.abTestImpressionsA,
        abTestImpressionsB: articles.abTestImpressionsB,
        abTestClicksA: articles.abTestClicksA,
        abTestClicksB: articles.abTestClicksB,
        seoTitle: articles.seoTitle,
        seoDescription: articles.seoDescription,
        featuredImageAlt: articles.featuredImageAlt,
        featuredImageUrl: mediaAssets.publicUrl,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .where(eq(articles.id, id))
      .limit(1);

    article = row;
  } catch (error) {
    console.warn("Could not query article for edit:", error);
  }

  if (!article) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-semibold"
        >
          <ArrowLeft size={14} /> সকল সংবাদে ফিরে যান
        </Link>
        <div className="p-8 border border-[var(--color-border)] bg-[var(--color-bg)] text-center text-xs text-[var(--color-text-muted)]">
          সংবাদটি পাওয়া যায়নি বা ইতিমধ্যে অপসারিত হয়েছে।
        </div>
      </div>
    );
  }

  return <AdminEditArticleClient article={article} />;
}
