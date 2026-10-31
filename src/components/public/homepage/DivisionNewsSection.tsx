"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeBengali } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";

interface DivisionItem {
  name: string;
  slug: string;
}

const DIVISIONS: DivisionItem[] = [
  { name: "ঢাকা", slug: "dhaka" },
  { name: "চট্টগ্রাম", slug: "chattogram" },
  { name: "রাজশাহী", slug: "rajshahi" },
  { name: "খুলনা", slug: "khulna" },
  { name: "বরিশাল", slug: "barishal" },
  { name: "সিলেট", slug: "sylhet" },
  { name: "রংপুর", slug: "rangpur" },
  { name: "ময়মনসিংহ", slug: "mymensingh" },
];

interface DivisionNewsSectionProps {
  initialArticles?: ArticleCard[];
}

export function DivisionNewsSection({ initialArticles = [] }: DivisionNewsSectionProps) {
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0]!);

  // For visual representation, we show articles relevant to nationwide/regional reporting
  const displayArticles = initialArticles.slice(0, 4);

  return (
    <section className="mt-8 border-t-2 border-[var(--color-primary)] pt-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          সারাদেশ
        </h2>
        <Link
          href={`/division/${selectedDivision.slug}`}
          className="text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          {selectedDivision.name} বিভাগের সব খবর &rarr;
        </Link>
      </div>

      {/* Division Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-[var(--color-border)] mb-4">
        {DIVISIONS.map((div) => {
          const isSelected = div.slug === selectedDivision.slug;
          return (
            <button
              key={div.slug}
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors whitespace-nowrap ${
                isSelected
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
              }`}
            >
              {div.name}
            </button>
          );
        })}
      </div>

      {/* Grid of regional news */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {displayArticles.map((article) => (
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
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">
                  ছবি নেই
                </div>
              )}
            </div>
            <div className="text-[11px] font-bold text-[var(--color-primary)] mb-1">
              {selectedDivision.name} বিভাগ
            </div>
            <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
            {article.publishedAt && (
              <span className="text-[11px] text-[var(--color-text-faint)] mt-1.5 block">
                {formatRelativeBengali(article.publishedAt)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
