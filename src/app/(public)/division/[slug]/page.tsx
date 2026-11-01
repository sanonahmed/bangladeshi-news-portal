import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDivisionBySlug, getRegionalArticles } from "@/actions/geography";
import { formatRelativeBengali } from "@/lib/bengali-date";
import { MapPin, ChevronRight, Building2, Filter } from "lucide-react";

export const revalidate = 60;

interface DivisionPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ district?: string }>;
}

export async function generateMetadata({ params }: DivisionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const division = await getDivisionBySlug(slug);
  const name = division?.name || slug;

  return {
    title: `${name} বিভাগীয় সংবাদ | দৈনিক বাংলাদেশ বার্তা`,
    description: `${name} বিভাগের বিভিন্ন জেলা ও উপজেলার সর্বশেষ খবর এবং আঞ্চলিক প্রতিবেদন।`,
  };
}

export default async function DivisionPage({ params, searchParams }: DivisionPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const districtFilter = sParams?.district;

  const division = await getDivisionBySlug(slug);
  if (!division) {
    notFound();
  }

  const result = await getRegionalArticles({
    divisionSlug: slug,
    districtSlug: districtFilter,
    pageSize: 16,
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Breadcrumb Header */}
      <div className="border-b-2 border-[var(--color-primary)] pb-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
              <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
              <span>/</span>
              <Link href="/saradesh" className="hover:text-[var(--color-primary)]">সারাদেশ</Link>
              <span>/</span>
              <span className="text-[var(--color-text)] font-semibold">{division.name} বিভাগ</span>
            </div>

            <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2.5">
              <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
              <span>{division.name} বিভাগীয় সংবাদ</span>
              <span className="text-xs bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] px-2.5 py-0.5 rounded font-mono font-bold border border-red-200 dark:border-red-900/50">
                {result.total}টি সংবাদ
              </span>
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {division.name} বিভাগের জেলা ও প্রান্তিক জনপদের টাটকা প্রতিবেদন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/saradesh"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-zinc-800 px-3 py-1.5 transition-colors"
            >
              &larr; সারাদেশ হাবে ফিরুন
            </Link>
          </div>
        </div>

        {/* District Filter Bar */}
        {division.districts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-[var(--color-text-muted)] font-bold shrink-0 flex items-center gap-1 pr-1">
              <Filter className="w-3 h-3 text-[var(--color-primary)]" />
              <span>জেলাসমূহ:</span>
            </span>

            <Link
              href={`/division/${division.slug}`}
              className={`px-3 py-1 text-xs font-semibold transition-colors shrink-0 border ${
                !districtFilter
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
            >
              সকল জেলা ({division.articleCount || 0})
            </Link>

            {division.districts.map((d) => {
              const isSelected = districtFilter === d.slug;
              return (
                <Link
                  key={d.slug}
                  href={isSelected ? `/division/${division.slug}` : `/division/${division.slug}?district=${d.slug}`}
                  className={`px-3 py-1 text-xs font-semibold transition-colors shrink-0 border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  <span>{d.name}</span>
                  {typeof d.articleCount === "number" && d.articleCount > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full font-mono ${
                        isSelected ? "bg-white/25 text-white" : "bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]"
                      }`}
                    >
                      {d.articleCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {result.articles.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          <Building2 className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
          <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)]">
            এই মুহূর্তে কোনো সংবাদ পাওয়া যায়নি
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
            {districtFilter
              ? "নির্বাচিত জেলায় কোনো সংবাদ পাওয়া যায়নি। সব জেলার খবর দেখতে 'সকল জেলা' নির্বাচন করুন।"
              : "এই বিভাগের জন্য কোনো সংবাদ প্রকাশিত হয়নি।"}
          </p>
          {districtFilter && (
            <Link
              href={`/division/${division.slug}`}
              className="mt-4 inline-block text-xs font-semibold bg-[var(--color-primary)] text-white px-4 py-2 hover:bg-[var(--color-primary)]/90"
            >
              সকল জেলার সংবাদ দেখুন
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md"
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
                {article.district?.name && (
                  <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                    <MapPin className="w-2.5 h-2.5 text-red-400" />
                    <span>{article.district.name}</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-[var(--color-primary)] mb-1">
                {division.name} বিভাগ {article.district?.name ? `• ${article.district.name}` : ""}
              </div>

              <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {article.publishedAt && (
                <span className="text-[11px] text-[var(--color-text-faint)] mt-2 block border-t border-[var(--color-border)]/60 pt-1.5 font-sans">
                  {formatRelativeBengali(article.publishedAt)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
