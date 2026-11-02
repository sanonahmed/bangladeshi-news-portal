import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getLatestArticles } from "@/actions/articles";
import { getArticleComments } from "@/actions/comments";
import { formatBengaliDateTime } from "@/lib/bengali-date";
import { RelatedArticles } from "@/components/public/article/RelatedArticles";
import { SocialShare } from "@/components/public/article/SocialShare";
import { FontSizeControl } from "@/components/public/article/FontSizeControl";
import { BookmarkButton } from "@/components/public/article/BookmarkButton";
import { CorrectionNotice } from "@/components/public/article/CorrectionNotice";
import { ArticleReadingTracker } from "@/components/public/article/ArticleReadingTracker";
import { ArticleCommentsSection } from "@/components/public/article/ArticleCommentsSection";
import { AuthorBioCard } from "@/components/public/author/AuthorBioCard";
import { ArticleAudioPlayer } from "@/components/public/article/ArticleAudioPlayer";
import { AdSlot } from "@/components/public/homepage/AdSlot";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "সংবাদ পাওয়া যায়নি | বাংলা নিউজ" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bangladeshi-news-portal.onrender.com";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "দৈনিক বাংলাদেশ বার্তা";
  const url = `${siteUrl}/news/${slug}`;

  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.categoryName ?? "জাতীয়")}&image=${encodeURIComponent(article.featuredImageUrl ?? "")}&author=${encodeURIComponent(article.authorName ?? "নিজস্ব প্রতিবেদক")}`;

  return {
    title: `${article.seoTitle ?? article.title} | ${siteName}`,
    description: article.seoDescription ?? article.excerpt ?? undefined,
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt ?? undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: "image/png",
        },
      ],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      locale: "bn_BD",
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [latestNews, initialComments] = await Promise.all([
    getLatestArticles(6),
    getArticleComments(article.id),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const articleUrl = `${siteUrl}/news/${slug}`;

  // Structured Data for Google News & SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    url: articleUrl,
    image: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    author: article.authorName
      ? [
          {
            "@type": "Person",
            name: article.authorName,
          },
        ]
      : undefined,
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SITE_NAME ?? "বাংলা নিউজ",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    inLanguage: article.language === "en" ? "en" : "bn-BD",
    articleSection: article.categoryName ?? "জাতীয়",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const relatedArticles = latestNews.filter((a) => a.slug !== slug).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleReadingTracker articleId={article.id} />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Column: 8 Columns */}
          <article className="lg:col-span-8 bg-[var(--color-bg)]">
            {/* Breadcrumb Navigation */}
            <nav className="text-xs text-[var(--color-text-muted)] mb-3 flex items-center gap-1.5 flex-wrap" aria-label="ব্রেডক্রাম্ব">
              <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
              <span>/</span>
              {article.categoryName && article.categorySlug && (
                <>
                  <Link href={`/category/${article.categorySlug}`} className="hover:text-[var(--color-primary)]">
                    {article.categoryName}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[var(--color-text-faint)] truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Category Badge */}
            {article.categoryName && article.categorySlug && (
              <Link
                href={`/category/${article.categorySlug}`}
                className="inline-block text-xs font-bold text-white bg-[var(--color-primary)] px-2.5 py-1 mb-3 rounded-none uppercase tracking-wider"
              >
                {article.categoryName}
              </Link>
            )}

            {/* Headline */}
            <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] leading-tight mb-4">
              {article.title}
            </h1>

            {/* Meta Row: Author, Date, Updated, Location, Social & Font Controls */}
            <div className="border-y border-[var(--color-border)] py-3 my-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {article.authorName && (
                  <Link
                    href={`/author/${article.authorSlug || "mahmudur-rahman"}`}
                    className="font-bold text-[var(--color-primary)] hover:underline text-sm inline-flex items-center gap-1"
                  >
                    <span>✍️ {article.authorName}</span>
                    {article.authorDesignation && (
                      <span className="text-xs font-normal text-[var(--color-text-muted)] hidden sm:inline">
                        ({article.authorDesignation})
                      </span>
                    )}
                  </Link>
                )}
                {article.newsLocation && (
                  <span className="bg-[var(--color-bg-secondary)] px-2 py-0.5 border border-[var(--color-border)]">
                    📍 {article.newsLocation}
                  </span>
                )}
                {article.publishedAt && (
                  <span>
                    প্রকাশ: {formatBengaliDateTime(article.publishedAt)}
                  </span>
                )}
                {article.updatedAt && article.publishedAt &&
                  article.updatedAt.getTime() - article.publishedAt.getTime() > 60000 && (
                    <span className="text-[var(--color-primary)] font-medium">
                      আপডেট: {formatBengaliDateTime(article.updatedAt)}
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <BookmarkButton
                  articleId={article.id}
                  slug={article.slug}
                  title={article.title}
                  categoryName={article.categoryName || undefined}
                  featuredImageUrl={article.featuredImageUrl || undefined}
                />
                <FontSizeControl />
                <SocialShare url={articleUrl} title={article.title} />
              </div>
            </div>

            {/* Audio News & TTS Voice Player */}
            <ArticleAudioPlayer
              title={article.title}
              content={article.content ?? ""}
              authorName={article.authorName}
              newsLocation={article.newsLocation}
            />

            {/* Featured Image */}
            {article.featuredImageUrl && (
              <figure className="my-6">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <Image
                    src={article.featuredImageUrl}
                    alt={article.featuredImageAlt ?? article.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>
                {article.featuredImageAlt && (
                  <figcaption className="text-xs text-[var(--color-text-muted)] mt-2 italic px-1">
                    ছবি: {article.featuredImageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Transparent Correction Notice (if any) */}
            {article.correctionNote && (
              <CorrectionNotice note={article.correctionNote} date={article.correctionAt} />
            )}

            {/* Rich Article Body */}
            <div
              id="article-content-body"
              className="article-body text-lg leading-relaxed text-[var(--color-text)] space-y-4 my-6"
              dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
            />

            {/* In-Article Advertisement Slot */}
            <AdSlot placement="article_inline" className="my-8" />

            {/* Bottom Sharing & Tagging Bar */}
            <div className="border-t-2 border-[var(--color-border)] pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <SocialShare url={articleUrl} title={article.title} showLabel />
                <BookmarkButton
                  articleId={article.id}
                  slug={article.slug}
                  title={article.title}
                  categoryName={article.categoryName || undefined}
                  featuredImageUrl={article.featuredImageUrl || undefined}
                />
              </div>
              <Link
                href="/latest"
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                &larr; আরও খবর পড়ুন
              </Link>
            </div>

            {/* Author Profile & Bio Card */}
            {article.authorName && (
              <AuthorBioCard
                name={article.authorName}
                slug={article.authorSlug}
                designation={article.authorDesignation}
                bio={article.authorBio}
                avatarUrl={article.authorAvatarUrl}
                bureau={article.authorBureau}
                twitter={article.authorTwitter}
                facebook={article.authorFacebook}
              />
            )}

            {/* Reader Comments & Reaction Section */}
            <ArticleCommentsSection
              articleId={article.id}
              articleTitle={article.title}
              initialComments={initialComments}
            />
          </article>

          {/* Sidebar: 4 Columns */}
          <aside className="lg:col-span-4 space-y-6">
            <AdSlot placement="sidebar" />
            <RelatedArticles articles={relatedArticles} />
            <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
              <h4 className="bengali-headline font-bold text-base border-b border-[var(--color-border)] pb-2 mb-3">
                ই-পেপার ও ডিজিটাল সংস্করণ
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                আজকের মুদ্রিত পত্রিকার প্রতিচ্ছবি অনলাইনে পড়তে আমাদের ডিজিটাল ই-পেপার সংস্করণে প্রবেশ করুন।
              </p>
              <Link
                href="/epaper"
                className="block text-center bg-[var(--color-primary)] text-white text-xs font-bold py-2 hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                ই-পেপার পড়ুন &rarr;
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
