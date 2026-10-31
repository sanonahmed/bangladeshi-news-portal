import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "@/actions/articles";
import { formatRelativeBengali } from "@/lib/bengali-date";

interface CategorySectionProps {
  title: string;
  categorySlug: string;
  className?: string;
}

export async function CategorySection({
  title,
  categorySlug,
  className = "",
}: CategorySectionProps) {
  const result = await getPublishedArticles({
    categorySlug,
    pageSize: 5,
  });

  const articles = result.data;
  if (!articles || articles.length === 0) return null;

  const [lead, ...rest] = articles;

  return (
    <section className={`border-t-2 border-[var(--color-primary)] pt-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          {title}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          সব খবর &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Lead Story: 6 Columns */}
        {lead && (
          <div className="lg:col-span-6 border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
            <Link href={`/news/${lead.slug}`} className="group block">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
                {lead.featuredImageUrl ? (
                  <Image
                    src={lead.featuredImageUrl}
                    alt={lead.featuredImageAlt ?? lead.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">
                    ছবি নেই
                  </div>
                )}
              </div>
              <h3 className="bengali-serif-headline text-lg sm:text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                {lead.title}
              </h3>
              {lead.excerpt && (
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-2 leading-relaxed">
                  {lead.excerpt}
                </p>
              )}
              {lead.publishedAt && (
                <span className="text-xs text-[var(--color-text-faint)] mt-2 block">
                  {formatRelativeBengali(lead.publishedAt)}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Supporting News: 6 Columns */}
        <div className="lg:col-span-6 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-bg)]">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group flex gap-4 p-3.5 hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              {article.featuredImageUrl && (
                <div className="relative w-24 h-18 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden bg-[var(--color-bg-secondary)]">
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
                <h4 className="bengali-headline text-sm sm:text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                {article.publishedAt && (
                  <span className="text-xs text-[var(--color-text-faint)] mt-1.5 block">
                    {formatRelativeBengali(article.publishedAt)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
