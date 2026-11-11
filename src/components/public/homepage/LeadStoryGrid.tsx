import Image from "next/image";
import Link from "next/link";
import { formatRelativeBengali } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";
import { AbHeadlineDisplay } from "@/components/public/article/AbHeadlineDisplay";

interface LeadStoryGridProps {
  lead?: ArticleCard;
  supporting: ArticleCard[];
}

export function LeadStoryGrid({ lead, supporting }: LeadStoryGridProps) {
  if (!lead) {
    return (
      <div className="py-12 text-center text-[var(--color-text-muted)] border border-[var(--color-border)]">
        কোনো সংবাদ পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-[var(--color-border)] bg-[var(--color-bg)]">
      {/* Lead Story: 8 Columns */}
      <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] p-4 md:p-6">
        <Link href={`/news/${lead.slug}`} className="group block">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-4">
            {lead.featuredImageUrl ? (
              <Image
                src={lead.featuredImageUrl}
                alt={lead.featuredImageAlt ?? lead.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)]">
                ছবি নেই
              </div>
            )}
          </div>
          <div className="space-y-2">
            {lead.category && (
              <span className="inline-block text-xs font-bold text-[var(--color-primary)] uppercase tracking-wide">
                {lead.category.name}
              </span>
            )}
            <AbHeadlineDisplay
              articleId={lead.id}
              titleA={lead.title}
              headlineB={lead.headlineB}
              abTestStatus={lead.abTestStatus}
              as="h1"
              className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-tight block"
            />
            {lead.excerpt && (
              <p className="text-[var(--color-text-muted)] text-base sm:text-lg leading-relaxed line-clamp-3">
                {lead.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-faint)] pt-2 border-t border-[var(--color-border)]">
              {lead.author?.name && (
                <span className="font-semibold text-[var(--color-text)]">
                  {lead.author.name}
                </span>
              )}
              {lead.publishedAt && (
                <span>{formatRelativeBengali(lead.publishedAt)}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Supporting Stories: 4 Columns */}
      <div className="lg:col-span-4 divide-y divide-[var(--color-border)] flex flex-col justify-between">
        {supporting.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block p-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <div className="flex gap-4 items-start">
              {article.featuredImageUrl && (
                <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden bg-[var(--color-bg-secondary)]">
                  <Image
                    src={article.featuredImageUrl}
                    alt={article.featuredImageAlt ?? article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="112px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {article.category && (
                  <span className="text-[11px] font-bold text-[var(--color-primary)] block mb-1">
                    {article.category.name}
                  </span>
                )}
                <AbHeadlineDisplay
                  articleId={article.id}
                  titleA={article.title}
                  headlineB={article.headlineB}
                  abTestStatus={article.abTestStatus}
                  as="h3"
                  className="bengali-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-3 leading-snug block"
                />
                {article.publishedAt && (
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-1 block">
                    {formatRelativeBengali(article.publishedAt)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
