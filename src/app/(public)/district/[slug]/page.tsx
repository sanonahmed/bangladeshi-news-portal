import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDistrictBySlug, getRegionalArticles } from "@/actions/geography";
import { formatRelativeBengali } from "@/lib/bengali-date";
import { MapPin, Building2 } from "lucide-react";

export const revalidate = 60;

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDistrictBySlug(slug);
  const name = data?.district.name || slug;

  return {
    title: `${name} জেলা সংবাদ | দৈনিক বাংলাদেশ বার্তা`,
    description: `${name} জেলার সর্বশেষ খবর ও আঞ্চলিক প্রতিবেদন।`,
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const data = await getDistrictBySlug(slug);

  if (!data) {
    notFound();
  }

  const { district, division } = data;
  const result = await getRegionalArticles({ districtSlug: slug, pageSize: 16 });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Breadcrumb Header */}
      <div className="border-b-2 border-[var(--color-primary)] pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
            <span>/</span>
            <Link href="/saradesh" className="hover:text-[var(--color-primary)]">সারাদেশ</Link>
            <span>/</span>
            <Link href={`/division/${division.slug}`} className="hover:text-[var(--color-primary)]">
              {division.name} বিভাগ
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)] font-semibold">{district.name} জেলা</span>
          </div>

          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2.5">
            <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
            <span>{district.name} জেলার খবর</span>
            <span className="text-xs bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] px-2.5 py-0.5 rounded font-mono font-bold border border-red-200 dark:border-red-900/50">
              {result.total}টি সংবাদ
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {division.name} বিভাগের অধীনে {district.name} জেলার স্থানীয় প্রতিনিধিদের পাঠানো প্রতিবেদন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/division/${division.slug}`}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-zinc-800 px-3 py-1.5 transition-colors"
          >
            &larr; {division.name} বিভাগীয় পাতায় ফিরুন
          </Link>
        </div>
      </div>

      {/* Grid of regional news */}
      {result.articles.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          <Building2 className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
          <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)]">
            এই জেলায় সম্প্রতি কোনো প্রতিবেদন প্রকাশিত হয়নি
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
            আমাদের স্থানীয় প্রতিনিধিরা নিয়মিত তথ্য সংগ্রহ করছেন। পুরো বিভাগের সংবাদ দেখতে নিচের লিংকে যান।
          </p>
          <Link
            href={`/division/${division.slug}`}
            className="mt-4 inline-block text-xs font-semibold bg-[var(--color-primary)] text-white px-4 py-2 hover:bg-[var(--color-primary)]/90"
          >
            {division.name} বিভাগের সব খবর দেখুন
          </Link>
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
                <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                  <MapPin className="w-2.5 h-2.5 text-red-400" />
                  <span>{district.name}</span>
                </span>
              </div>

              <div className="text-[11px] font-bold text-[var(--color-primary)] mb-1">
                {division.name} বিভাগ • {district.name}
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
