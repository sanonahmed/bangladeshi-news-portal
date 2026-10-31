import Link from "next/link";
import { toBengaliDigits } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";

interface MostReadSectionProps {
  articles: ArticleCard[];
}

export function MostReadSection({ articles }: MostReadSectionProps) {
  if (articles.length === 0) return null;

  return (
    <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
      <div className="border-b-2 border-[var(--color-primary)] pb-2 mb-4">
        <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--color-primary)] inline-block"></span>
          সর্বাধিক পঠিত
        </h3>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {articles.map((article, idx) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group flex gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[var(--color-bg-secondary)] px-1 -mx-1 transition-colors"
          >
            <span className="text-2xl font-black text-[var(--color-primary)]/80 w-6 flex-shrink-0 font-serif leading-none pt-0.5">
              {toBengaliDigits(idx + 1)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="bengali-headline text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
