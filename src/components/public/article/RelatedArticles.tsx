import Image from "next/image";
import Link from "next/link";
import { formatRelativeBengali } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";

interface RelatedArticlesProps {
  articles: ArticleCard[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
      <div className="border-b-2 border-[var(--color-primary)] pb-2 mb-4">
        <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--color-primary)] inline-block"></span>
          আরও পড়ুন
        </h3>
      </div>
      <div className="space-y-4 divide-y divide-[var(--color-border)]">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group flex gap-3 pt-3 first:pt-0 hover:bg-[var(--color-bg-secondary)] px-1 -mx-1 transition-colors"
          >
            {article.featuredImageUrl && (
              <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden bg-[var(--color-bg-secondary)]">
                <Image
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="bengali-headline text-xs sm:text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
              {article.publishedAt && (
                <span className="text-[10px] text-[var(--color-text-faint)] mt-1 block">
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
