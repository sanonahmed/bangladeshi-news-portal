"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeBengali } from "@/lib/bengali-date";
import {
  getRegionalArticles,
  type DivisionWithDistricts,
  type RegionalArticleCard,
} from "@/actions/geography";
import { MapPin, ChevronRight, Layers, Filter, Newspaper, Search } from "lucide-react";

interface DivisionNewsSectionProps {
  initialDivisions?: DivisionWithDistricts[];
  initialArticles?: RegionalArticleCard[];
}

// Fallback division list if DB fetch is initially empty
const FALLBACK_DIVISIONS = [
  { name: "ঢাকা", slug: "dhaka" },
  { name: "চট্টগ্রাম", slug: "chattogram" },
  { name: "রাজশাহী", slug: "rajshahi" },
  { name: "খুলনা", slug: "khulna" },
  { name: "বরিশাল", slug: "barishal" },
  { name: "সিলেট", slug: "sylhet" },
  { name: "রংপুর", slug: "rangpur" },
  { name: "ময়মনসিংহ", slug: "mymensingh" },
];

export function DivisionNewsSection({
  initialDivisions = [],
  initialArticles = [],
}: DivisionNewsSectionProps) {
  const divisions = initialDivisions.length > 0 ? initialDivisions : (FALLBACK_DIVISIONS as DivisionWithDistricts[]);

  const [selectedDivisionSlug, setSelectedDivisionSlug] = useState<string>(
    divisions[0]?.slug || "dhaka"
  );
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string | null>(null);
  const [articles, setArticles] = useState<RegionalArticleCard[]>(initialArticles);
  const [isPending, startTransition] = useTransition();

  const currentDivision =
    divisions.find((d) => d.slug === selectedDivisionSlug) || divisions[0];

  const currentDistricts = currentDivision?.districts || [];

  const handleSelectDivision = (divSlug: string) => {
    setSelectedDivisionSlug(divSlug);
    setSelectedDistrictSlug(null);

    startTransition(async () => {
      const res = await getRegionalArticles({ divisionSlug: divSlug, pageSize: 4 });
      setArticles(res.articles);
    });
  };

  const handleSelectDistrict = (distSlug: string | null) => {
    setSelectedDistrictSlug(distSlug);

    startTransition(async () => {
      const res = await getRegionalArticles({
        divisionSlug: selectedDivisionSlug,
        districtSlug: distSlug ?? undefined,
        pageSize: 4,
      });
      setArticles(res.articles);
    });
  };

  const handleDistrictDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      handleSelectDistrict(null);
    } else {
      handleSelectDistrict(val);
    }
  };

  return (
    <section className="mt-8 border-t-2 border-[var(--color-primary)] pt-4 bg-[var(--color-bg)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
            <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)]">
              সারাদেশ
            </h2>
            <span className="text-xs bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] font-semibold px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
              আঞ্চলিক সংবাদ
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            ৮টি বিভাগ ও ৬৪ জেলার প্রান্তিক জনপদের টাটকা প্রতিবেদন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/division/${selectedDivisionSlug}`}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 bg-red-50/60 dark:bg-zinc-800/80 px-2.5 py-1.5 border border-red-100 dark:border-zinc-700 transition-colors"
          >
            <span>{currentDivision?.name} বিভাগের সব খবর</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/saradesh"
            className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 border border-[var(--color-border)] px-2.5 py-1.5 hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সারাদেশ হাব</span>
          </Link>
        </div>
      </div>

      {/* Division Selector Pills (Top Level) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 border-b border-[var(--color-border)]">
        {divisions.map((div) => {
          const isSelected = div.slug === selectedDivisionSlug;
          return (
            <button
              key={div.slug}
              onClick={() => handleSelectDivision(div.slug)}
              className={`px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-border)]/50"
              }`}
            >
              <span>{div.name}</span>
              {typeof div.articleCount === "number" && div.articleCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]"
                  }`}
                >
                  {div.articleCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* District Filter Bar (Sub Level) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[var(--color-bg-secondary)] p-2.5 mb-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] font-semibold shrink-0 pr-1">
            <Filter className="w-3 h-3 text-[var(--color-primary)]" />
            <span>জেলা ফিল্টার:</span>
          </div>

          {/* All Districts Pill */}
          <button
            onClick={() => handleSelectDistrict(null)}
            className={`px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 rounded-none border ${
              selectedDistrictSlug === null
                ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            সকল জেলা
          </button>

          {/* District Pills for active division */}
          {currentDistricts.map((dist) => {
            const isSelected = dist.slug === selectedDistrictSlug;
            return (
              <button
                key={dist.slug}
                onClick={() => handleSelectDistrict(dist.slug)}
                className={`px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 rounded-none border flex items-center gap-1 ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                <span>{dist.name}</span>
                {typeof dist.articleCount === "number" && dist.articleCount > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-mono ${
                      isSelected ? "bg-white/25 text-white" : "bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]"
                    }`}
                  >
                    {dist.articleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick District Selector Dropdown */}
        {currentDistricts.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <select
              value={selectedDistrictSlug || ""}
              onChange={handleDistrictDropdownChange}
              className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1 focus:outline-none focus:border-[var(--color-primary)] font-medium"
            >
              <option value="">{currentDivision?.name}ের সকল জেলা</option>
              {currentDistricts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} জেলা {d.articleCount ? `(${d.articleCount})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* News Grid Area */}
      <div className={`relative transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/40 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] px-4 py-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping"></span>
              <span className="text-xs font-semibold text-[var(--color-text)]">সংবাদ লোড হচ্ছে...</span>
            </div>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
            <Newspaper className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-2 opacity-60" />
            <h4 className="bengali-headline text-base font-bold text-[var(--color-text)]">
              {selectedDistrictSlug
                ? "এই জেলায় সম্প্রতি কোনো নতুন প্রতিবেদন প্রকাশিত হয়নি"
                : "এই বিভাগে সম্প্রতি কোনো প্রতিবেদন প্রকাশিত হয়নি"}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
              আমাদের জেলা প্রতিনিধিরা দ্রুততম সময়ে প্রতিবেদন পাঠাচ্ছেন। বিভাগের সব খবর পড়তে ‘সকল জেলা’ ক্লিক করুন।
            </p>
            {selectedDistrictSlug && (
              <button
                onClick={() => handleSelectDistrict(null)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold bg-[var(--color-primary)] text-white px-3.5 py-1.5 hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                <span>{currentDivision?.name} বিভাগের সকল খবর দেখুন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {articles.map((article) => {
              const districtLabel = article.district?.name || article.newsLocation || currentDivision?.name;
              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-2.5">
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
                    <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                      <MapPin className="w-2.5 h-2.5 text-red-400" />
                      <span>{districtLabel}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] mb-1">
                    <span>{currentDivision?.name} বিভাগ</span>
                    {article.district?.name && (
                      <>
                        <span className="text-[var(--color-border)]">|</span>
                        <span className="text-[var(--color-text-muted)] font-medium">
                          {article.district.name}
                        </span>
                      </>
                    )}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom quick navigation */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[var(--color-text-muted)] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
          <span>নির্বাচিত অঞ্চল: <strong className="text-[var(--color-text)]">{currentDivision?.name} বিভাগ</strong></span>
          {selectedDistrictSlug && (
            <span> &gt; <strong className="text-[var(--color-primary)]">{currentDistricts.find(d => d.slug === selectedDistrictSlug)?.name} জেলা</strong></span>
          )}
        </span>

        <div className="flex items-center gap-3">
          {selectedDistrictSlug && (
            <Link
              href={`/district/${selectedDistrictSlug}`}
              className="text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>এই জেলার বিস্তারিত সংবাদ</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <Link
            href={`/division/${selectedDivisionSlug}`}
            className="text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>{currentDivision?.name} বিভাগের সব খবর</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
