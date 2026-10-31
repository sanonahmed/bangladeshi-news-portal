import type { Metadata } from "next";
import Link from "next/link";
import { getPopularArticles } from "@/actions/articles";
import { formatRelativeBengali, toBengaliDigits } from "@/lib/bengali-date";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "সর্বাধিক পঠিত সংবাদ | বাংলা নিউজ",
  description: "পাঠকদের সর্বাধিক আগ্রহের শীর্ষে থাকা জনপ্রিয় সংবাদসমূহ।",
};

export default async function PopularPage() {
  const articles = await getPopularArticles(12);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <TrendingUp size={28} className="text-[var(--color-primary)]" />
          সর্বাধিক পঠিত সংবাদ
        </h1>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article, idx) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group flex gap-4 p-4 border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <span className="text-3xl font-black text-[var(--color-primary)]/80 font-serif leading-none pt-1">
              {toBengaliDigits(idx + 1)}
            </span>
            <div className="flex-1 min-w-0">
              {article.category && (
                <span className="text-[11px] font-bold text-[var(--color-primary)] mb-1 block">
                  {article.category.name}
                </span>
              )}
              <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h2>
              {article.publishedAt && (
                <span className="text-[11px] text-[var(--color-text-faint)] mt-2 block">
                  {formatRelativeBengali(article.publishedAt)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
