"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  XCircle,
  Scale,
  Cpu,
  CheckCircle,
  PlusCircle,
  FileCheck2,
  HelpCircle,
  Flame,
} from "lucide-react";
import { FactCheckCard } from "./FactCheckCard";
import { SubmitClaimModal } from "./SubmitClaimModal";
import { VERDICT_METADATA, type VerdictType } from "./FactCheckBadge";
import { toBengaliDigits } from "@/lib/bengali-date";
import type { FactCheckItem } from "@/types/fact-check";

interface FactCheckHubClientProps {
  initialFactChecks: FactCheckItem[];
}

export function FactCheckHubClient({ initialFactChecks }: FactCheckHubClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(initialFactChecks.map((f) => f.category));
    return ["all", ...Array.from(cats)];
  }, [initialFactChecks]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return initialFactChecks.filter((item) => {
      // Verdict match
      if (selectedVerdict !== "all" && item.verdict !== selectedVerdict) {
        return false;
      }
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchClaim = item.claim.toLowerCase().includes(q);
        const matchSummary = item.verdictSummary.toLowerCase().includes(q);
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchClaim && !matchSummary && !matchTag) {
          return false;
        }
      }
      return true;
    });
  }, [initialFactChecks, selectedVerdict, selectedCategory, searchQuery]);

  // Featured item (if any in current filter)
  const featuredItem = filteredItems.find((f) => f.isFeatured) || (filteredItems.length > 0 ? filteredItems[0] : null);
  const remainingItems = featuredItem
    ? filteredItems.filter((f) => f.id !== featuredItem.id)
    : filteredItems;

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          হোম
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">ফ্যাক্ট-চেক ও সত্যসন্ধান ডেস্ক</span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-red-600 via-rose-700 to-stone-900 p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white mb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>আইএফসিএন (IFCN) স্ট্যান্ডার্ড সত্যসন্ধান ও তথ্য যাচাই</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            গুজব প্রতিরোধ ও ডিজিটাল সত্যসন্ধান ডেস্ক
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            সামাজিক যোগাযোগ মাধ্যম, ইন্টারনেট ও জনপরিসরে ছড়িয়ে পড়া চাঞ্চল্যকর দাবি, ছবি ও ভিডিওর নিরপেক্ষ ফরেনসিক যাচাই। আমরা তথ্য বিকৃতি রোধে এবং জনস্বার্থে সত্য উন্মোচনে প্রতিশ্রুতিবদ্ধ।
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-red-700 shadow-md hover:bg-stone-100 transition-colors"
            >
              <PlusCircle size={15} />
              <span>দাবি যাচাইয়ের আবেদন বা গুজব জানান</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <FileCheck2 size={14} className="text-emerald-400" />
              <span>মোট যাচাইকৃত দাবি: {toBengaliDigits(initialFactChecks.length)} টি</span>
            </div>
          </div>
        </div>

        {/* Background decorative shield watermark */}
        <ShieldCheck
          size={320}
          className="absolute -right-12 -bottom-16 text-white/5 pointer-events-none select-none"
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="দাবি, ভাইরাল ভিডিও বা তথ্যের কী-ওয়ার্ড দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-4 py-3 text-sm text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        {/* Verdict Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedVerdict("all")}
            className={`rounded-xl px-3.5 py-1.5 font-bold transition-all flex-shrink-0 ${
              selectedVerdict === "all"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            সব সিদ্ধান্ত ({toBengaliDigits(initialFactChecks.length)})
          </button>

          {(Object.keys(VERDICT_METADATA) as VerdictType[]).map((vKey) => {
            const meta = VERDICT_METADATA[vKey];
            const count = initialFactChecks.filter((f) => f.verdict === vKey).length;
            const isSelected = selectedVerdict === vKey;

            return (
              <button
                key={vKey}
                type="button"
                onClick={() => setSelectedVerdict(vKey)}
                className={`rounded-xl px-3.5 py-1.5 font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                  isSelected
                    ? `${meta.colorBg} text-white border-transparent shadow-sm`
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-80">({toBengaliDigits(count)})</span>
              </button>
            );
          })}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs text-[var(--color-text-muted)]">
          <span className="font-semibold flex-shrink-0 flex items-center gap-1">
            <Filter size={12} />
            <span>বিষয়:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100 font-bold"
                  : "hover:text-[var(--color-text)]"
              }`}
            >
              {cat === "all" ? "সকল বিষয়" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-text-muted)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="text-base font-bold text-[var(--color-text)]">
            কোনো ফ্যাক্ট-চেক পাওয়া যায়নি
          </h3>
          <p className="text-xs mt-1">
            ভিন্ন কোনো শব্দ দিয়ে খুঁজুন অথবা নতুন কোনো দাবি যাচাইয়ের জন্য রিপোর্ট করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedVerdict("all");
              setSelectedCategory("all");
            }}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Highlight Story (if available) */}
          {featuredItem && (
            <section>
              <FactCheckCard item={featuredItem} featured={true} />
            </section>
          )}

          {/* Grid of Remaining Items */}
          {remainingItems.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Flame size={18} className="text-red-500" />
                <span>সাম্প্রতিক সত্যসন্ধান রিপোর্ট ও অনুসন্ধান</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {remainingItems.map((item) => (
                  <FactCheckCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Methodology Section */}
      <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 sm:p-8">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-primary)]">
            আমাদের সম্পাদকীয় মানদণ্ড
          </span>
          <h3 className="text-xl font-bold text-[var(--color-text)] mt-1">
            দৈনিক বাংলাদেশ বার্তা সত্যসন্ধান ডেস্কের ৩-স্তরের যাচাই পদ্ধতি
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            প্রতিটি দাবির পেছনে আমরা আন্তর্জাতিক ফ্যাক্ট-চেকিং নেটওয়ার্কের (IFCN) আচরণবিধি অনুযায়ী নিবিড় অনুসন্ধান পরিচালনা করি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold mb-3">
              ১
            </div>
            <h4 className="font-bold text-[var(--color-text)] text-sm mb-1">
              ডিজিটাল উৎস ও কি-ফ্রেম অনুসন্ধান
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Google Lens, Yandex ও InVID টুলের মাধ্যমে ভাইরাল ছবি ও ভিডিওর উৎস এবং মূল প্রকাশের তারিখ ফ্রেম বাই ফ্রেম পরীক্ষা করা হয়।
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 font-bold mb-3">
              ২
            </div>
            <h4 className="font-bold text-[var(--color-text)] text-sm mb-1">
              এআই ডিপফেক ও মেটাডাটা ফরেনসিক্স
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              ছবি ও অডিও ফাইলের স্পেকট্রোগ্রাম, ELA (Error Level Analysis) এবং EXIF মেটাডাটা বিশ্লেষণ করে কৃত্রিম পরিবর্তন শনাক্ত করা হয়।
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 font-bold mb-3">
              ৩
            </div>
            <h4 className="font-bold text-[var(--color-text)] text-sm mb-1">
              সরাসরি ক্রস-ভেরিফিকেশন
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              সংশ্লিষ্ট মন্ত্রণালয়, আইনশৃঙ্খলা বাহিনী, প্রাতিষ্ঠানিক মুখপাত্র ও প্রত্যক্ষদর্শীদের সাথে সরাসরি যোগাযোগ করে তথ্যের সত্যাসত্য নিশ্চিত করা হয়।
            </p>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <SubmitClaimModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
