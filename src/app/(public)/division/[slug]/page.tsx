import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "@/actions/articles";
import { formatRelativeBengali } from "@/lib/bengali-date";

const DIVISION_MAP: Record<string, string> = {
  dhaka: "ঢাকা",
  chattogram: "চট্টগ্রাম",
  rajshahi: "রাজশাহী",
  khulna: "খুলনা",
  barishal: "বরিশাল",
  sylhet: "সিলেট",
  rangpur: "রংপুর",
  mymensingh: "ময়মনসিংহ",
};

interface DivisionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DivisionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = DIVISION_MAP[slug] ?? slug;
  return {
    title: `${name} বিভাগীয় সংবাদ | বাংলা নিউজ`,
    description: `${name} বিভাগের বিভিন্ন জেলা ও উপজেলার সর্বশেষ খবর এবং আঞ্চলিক প্রতিবেদন।`,
  };
}

export default async function DivisionPage({ params }: DivisionPageProps) {
  const { slug } = await params;
  const divisionName = DIVISION_MAP[slug] ?? slug;
  const result = await getPublishedArticles({ pageSize: 12 });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
            {divisionName} বিভাগীয় সংবাদ
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {divisionName} বিভাগের জেলা ও প্রান্তিক জনপদের খবর
          </p>
        </div>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  alt={article.title}
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
            <span className="text-[11px] font-bold text-[var(--color-primary)]">
              {divisionName} অঞ্চল
            </span>
            <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mt-1 leading-snug">
              {article.title}
            </h3>
            {article.publishedAt && (
              <span className="text-[11px] text-[var(--color-text-faint)] mt-2 block">
                {formatRelativeBengali(article.publishedAt)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
