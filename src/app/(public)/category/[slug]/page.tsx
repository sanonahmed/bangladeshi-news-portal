import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { formatRelativeBengali } from "@/lib/bengali-date";
import { AdSlot } from "@/components/public/homepage/AdSlot";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoriesList = await getCategories();
  const category = categoriesList.find((c) => c.slug === slug);

  if (!category) {
    return { title: "বিভাগ পাওয়া যায়নি | বাংলা নিউজ" };
  }

  return {
    title: `${category.name} সংবাদ | বাংলা নিউজ`,
    description: category.description ?? `${category.name} বিভাগের সর্বশেষ খবর ও সংবাদ বিশ্লেষণ।`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const categoriesList = await getCategories();
  const category = categoriesList.find((c) => c.slug === slug);

  const result = await getPublishedArticles({
    categorySlug: slug,
    page: currentPage,
    pageSize: 15,
  });

  const categoryTitle = category?.name ?? (slug.charAt(0).toUpperCase() + slug.slice(1));
  const [leadStory, ...otherStories] = result.data;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Category Header */}
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
            {categoryTitle}
          </h1>
          {category?.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {category.description}
            </p>
          )}
        </div>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      {result.data.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-text-muted)] border border-[var(--color-border)]">
          এই বিভাগে বর্তমানে কোনো সংবাদ নেই।
        </div>
      ) : (
        <>
          {/* Category Lead Story (on first page) */}
          {currentPage === 1 && leadStory && (
            <div className="border border-[var(--color-border)] p-4 md:p-6 bg-[var(--color-bg)] mb-8">
              <Link href={`/news/${leadStory.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-secondary)]">
                    {leadStory.featuredImageUrl ? (
                      <Image
                        src={leadStory.featuredImageUrl}
                        alt={leadStory.featuredImageAlt ?? leadStory.title}
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)]">
                        ছবি নেই
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                    শীর্ষ খবর
                  </span>
                  <h2 className="bengali-serif-headline text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                    {leadStory.title}
                  </h2>
                  {leadStory.excerpt && (
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
                      {leadStory.excerpt}
                    </p>
                  )}
                  {leadStory.publishedAt && (
                    <span className="text-xs text-[var(--color-text-faint)] block pt-2 border-t border-[var(--color-border)]">
                      {formatRelativeBengali(leadStory.publishedAt)}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Other stories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(currentPage === 1 ? otherStories : result.data).map((article) => (
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
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">
                      ছবি নেই
                    </div>
                  )}
                </div>
                <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
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
                  href={`/category/${slug}?page=${currentPage - 1}`}
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
                  href={`/category/${slug}?page=${currentPage + 1}`}
                  className="px-3 py-1.5 text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                >
                  পরবর্তী &rarr;
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <AdSlot placement="footer" className="mt-8" />
    </div>
  );
}
