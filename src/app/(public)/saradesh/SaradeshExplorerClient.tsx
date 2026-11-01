"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeBengali } from "@/lib/bengali-date";
import {
  getRegionalArticles,
  type DivisionWithDistricts,
  type RegionalArticleCard,
} from "@/actions/geography";
import {
  MapPin,
  Filter,
  Search,
  Layers,
  ChevronRight,
  Globe2,
  Building2,
  RefreshCw,
  Newspaper,
  BookOpen,
} from "lucide-react";

interface SaradeshExplorerClientProps {
  divisions: DivisionWithDistricts[];
  initialArticles: RegionalArticleCard[];
  initialTotal: number;
}

export function SaradeshExplorerClient({
  divisions,
  initialArticles,
  initialTotal,
}: SaradeshExplorerClientProps) {
  const [selectedDivisionSlug, setSelectedDivisionSlug] = useState<string>("all");
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<RegionalArticleCard[]>(initialArticles);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Active division object (if not 'all')
  const activeDivision = useMemo(() => {
    if (selectedDivisionSlug === "all") return null;
    return divisions.find((d) => d.slug === selectedDivisionSlug) || null;
  }, [divisions, selectedDivisionSlug]);

  // All districts flattened for global search or division districts
  const availableDistricts = useMemo(() => {
    if (activeDivision) {
      return activeDivision.districts;
    }
    return divisions.flatMap((d) => d.districts);
  }, [divisions, activeDivision]);

  // Filtered districts by search term
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return availableDistricts;
    const q = searchQuery.toLowerCase().trim();
    return availableDistricts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.nameEn && d.nameEn.toLowerCase().includes(q))
    );
  }, [availableDistricts, searchQuery]);

  const fetchArticles = (divSlug: string, distSlug: string, targetPage: number = 1) => {
    startTransition(async () => {
      const res = await getRegionalArticles({
        divisionSlug: divSlug === "all" ? undefined : divSlug,
        districtSlug: distSlug === "all" ? undefined : distSlug,
        page: targetPage,
        pageSize: 12,
      });
      setArticles(res.articles);
      setTotalCount(res.total);
      setPage(targetPage);
    });
  };

  const handleDivisionChange = (slug: string) => {
    setSelectedDivisionSlug(slug);
    setSelectedDistrictSlug("all");
    setSearchQuery("");
    fetchArticles(slug, "all", 1);
  };

  const handleDistrictChange = (distSlug: string) => {
    setSelectedDistrictSlug(distSlug);
    fetchArticles(selectedDivisionSlug, distSlug, 1);
  };

  const handleResetFilters = () => {
    setSelectedDivisionSlug("all");
    setSelectedDistrictSlug("all");
    setSearchQuery("");
    fetchArticles("all", "all", 1);
  };

  const totalDistrictsCount = divisions.reduce((acc, d) => acc + d.districts.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black text-white p-6 md:p-8 rounded-none border-b-4 border-[var(--color-primary)] shadow-md">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded text-xs font-semibold mb-3 border border-white/10">
            <Globe2 className="w-3.5 h-3.5 text-red-400" />
            <span>বাংলাদেশ বার্তা আঞ্চলিক সংবাদ নেটওয়ার্ক</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-4xl font-extrabold tracking-tight">
            সারাদেশ: বিভাগ ও জেলাভিত্তিক সংবাদ হাব
          </h1>
          <p className="text-sm md:text-base text-zinc-300 mt-2 leading-relaxed">
            ৮টি বিভাগ এবং সকল জেলার স্থানীয় ঘটনা, রাজনীতি, অর্থনীতি, কৃষি, উন্নয়ন ও সাধারণ মানুষের জীবনযাত্রা নিয়ে আমাদের বিশেষ আঞ্চলিক আয়োজন।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{divisions.length}টি</div>
                <div className="text-xs text-zinc-400">প্রশাসনিক বিভাগ</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{totalDistrictsCount}টি</div>
                <div className="text-xs text-zinc-400">জেলা কভারেজ</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{totalCount}টি</div>
                <div className="text-xs text-zinc-400">উপলব্ধ আঞ্চলিক সংবাদ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Filter Panel */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 md:p-6 shadow-sm space-y-4">
        {/* Step 1: Division Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[var(--color-primary)]"></span>
              ১. বিভাগ নির্বাচন করুন
            </span>
            {selectedDivisionSlug !== "all" && (
              <button
                onClick={() => handleDivisionChange("all")}
                className="text-xs text-[var(--color-primary)] hover:underline font-medium"
              >
                সব বিভাগ দেখুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => handleDivisionChange("all")}
              className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                selectedDivisionSlug === "all"
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
              }`}
            >
              সব বিভাগ
            </button>

            {divisions.map((div) => {
              const isSelected = div.slug === selectedDivisionSlug;
              return (
                <button
                  key={div.slug}
                  onClick={() => handleDivisionChange(div.slug)}
                  className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
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
        </div>

        {/* Step 2: District Search & Selector */}
        <div className="pt-3 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[var(--color-primary)]"></span>
              ২. জেলা নির্বাচন করুন {activeDivision && `(${activeDivision.name} বিভাগ)`}
            </span>

            {/* District Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="জেলা খুঁজুন (যেমন: বগুড়া, কক্সবাজার)..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1">
            <button
              onClick={() => handleDistrictChange("all")}
              className={`px-3 py-1 text-xs font-semibold transition-colors shrink-0 border ${
                selectedDistrictSlug === "all"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
            >
              সকল জেলা ({availableDistricts.length})
            </button>

            {filteredDistricts.map((dist) => {
              const isSelected = dist.slug === selectedDistrictSlug;
              return (
                <button
                  key={dist.slug}
                  onClick={() => handleDistrictChange(dist.slug)}
                  className={`px-3 py-1 text-xs font-medium transition-colors shrink-0 border flex items-center gap-1 ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  <span>{dist.name}</span>
                  {typeof dist.articleCount === "number" && dist.articleCount > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full font-mono ${
                        isSelected ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]"
                      }`}
                    >
                      {dist.articleCount}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredDistricts.length === 0 && (
              <span className="text-xs text-[var(--color-text-muted)] py-1 italic">
                কোনো জেলা খুঁজে পাওয়া যায়নি &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* Active Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 -mx-4 -mb-4 md:-mx-6 md:-mb-6">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
            <Filter className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>ফিল্টার: </span>
            <span className="font-bold text-[var(--color-primary)]">
              {selectedDivisionSlug === "all"
                ? "সকল বিভাগ"
                : `${activeDivision?.name || selectedDivisionSlug} বিভাগ`}
            </span>
            {selectedDistrictSlug !== "all" && (
              <>
                <span>&gt;</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {availableDistricts.find((d) => d.slug === selectedDistrictSlug)?.name || selectedDistrictSlug} জেলা
                </span>
              </>
            )}
            <span className="text-[var(--color-text-muted)]">
              ({totalCount}টি সংবাদ পাওয়া গেছে)
            </span>
          </div>

          {(selectedDivisionSlug !== "all" || selectedDistrictSlug !== "all") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className={`relative transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/50 backdrop-blur-[1px] min-h-[300px]">
            <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] px-4 py-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-ping"></span>
              <span className="text-xs font-semibold text-[var(--color-text)]">আঞ্চলিক সংবাদ লোড হচ্ছে...</span>
            </div>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
            <Newspaper className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
            <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)]">
              কোনো সংবাদ পাওয়া যায়নি
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
              নির্বাচিত অঞ্চলে এই মুহূর্তে কোনো প্রতিবেদন পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো বিভাগ বা জেলা নির্বাচন করুন।
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--color-primary)] text-white px-4 py-2 hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>সকল সংবাদ দেখুন</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {articles.map((article) => {
              const divName = article.division?.name;
              const distName = article.district?.name || article.newsLocation;

              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-2.5">
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
                    {distName && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                        <MapPin className="w-2.5 h-2.5 text-red-400" />
                        <span>{distName}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] mb-1">
                    {divName && <span>{divName} বিভাগ</span>}
                    {distName && divName && <span className="text-[var(--color-border)]">|</span>}
                    {article.category?.name && (
                      <span className="text-[var(--color-text-muted)] font-medium">
                        {article.category.name}
                      </span>
                    )}
                  </div>

                  <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between text-[11px] text-[var(--color-text-faint)] font-sans">
                    {article.publishedAt ? (
                      <span>{formatRelativeBengali(article.publishedAt)}</span>
                    ) : (
                      <span>আজকের খবর</span>
                    )}
                    <span className="text-[var(--color-primary)] group-hover:underline flex items-center gap-0.5 font-semibold">
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Jump Division Hub Grid at Bottom */}
      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <h3 className="bengali-headline text-base font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
          <span>বিভাগীয় পাতা সরাসরি দেখুন</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {divisions.map((div) => (
            <Link
              key={div.slug}
              href={`/division/${div.slug}`}
              className="p-3 text-center border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)] hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-all group"
            >
              <div className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {div.name}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {div.articleCount || 0}টি খবর &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
