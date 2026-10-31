import Image from "next/image";
import Link from "next/link";
import { formatRelativeBengali } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";

interface LatestNewsSectionProps {
  articles: ArticleCard[];
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-8 border-t-2 border-[var(--color-primary)] pt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          সর্বশেষ সংবাদ
        </h2>
        <Link
          href="/latest"
          className="text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          সব খবর দেখুন &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-2">
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
            <div>
              {article.category && (
                <span className="text-[11px] font-semibold text-[var(--color-primary)]">
                  {article.category.name}
                </span>
              )}
              <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mt-1 leading-snug">
                {article.title}
              </h3>
              {article.publishedAt && (
                <span className="text-[11px] text-[var(--color-text-faint)] mt-1.5 block">
                  {formatRelativeBengali(article.publishedAt)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
