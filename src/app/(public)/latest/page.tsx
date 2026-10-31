import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "@/actions/articles";
import { formatRelativeBengali } from "@/lib/bengali-date";
import { AdSlot } from "@/components/public/homepage/AdSlot";

export const metadata: Metadata = {
  title: "সর্বশেষ সংবাদ | বাংলা নিউজ",
  description: "মুহূর্তের তাজা খবর, ব্রেকিং নিউজ এবং শীর্ষ সংবাদ প্রতিবেদন।",
};

interface LatestPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LatestPage({ searchParams }: LatestPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const result = await getPublishedArticles({
    page: currentPage,
    pageSize: 16,
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
          সর্বশেষ সংবাদ
        </h1>
        <span className="text-xs text-[var(--color-text-muted)]">
          সর্বশেষ আপডেটকৃত সংবাদসমূহ
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {result.data.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
              {article.featuredImageUrl ? (
                <Image
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">
                  ছবি নেই
                </div>
              )}
            </div>
            {article.category && (
              <span className="text-[11px] font-bold text-[var(--color-primary)]">
                {article.category.name}
              </span>
            )}
            <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mt-1 leading-snug">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            {article.publishedAt && (
              <span className="text-[11px] text-[var(--color-text-faint)] mt-2 block">
                {formatRelativeBengali(article.publishedAt)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 pt-4 border-t border-[var(--color-border)]">
          {currentPage > 1 && (
            <Link
              href={`/latest?page=${currentPage - 1}`}
              className="px-3 py-1.5 text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              &larr; পূর্ববর্তী
            </Link>
          )}
          <span className="text-xs text-[var(--color-text-muted)] px-3">
            পাতা {currentPage} এর {result.totalPages}
          </span>
          {currentPage < result.totalPages && (
            <Link
              href={`/latest?page=${currentPage + 1}`}
              className="px-3 py-1.5 text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              পরবর্তী &rarr;
            </Link>
          )}
        </div>
      )}

      <AdSlot placement="footer" className="mt-8" />
    </div>
  );
}
