"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Printer,
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getStoredBookmarks,
  removeStoredBookmark,
  clearAllStoredBookmarks,
  getFavoriteCategories,
  setFavoriteCategories,
  type StoredBookmark,
} from "@/lib/bookmarks-store";
import { getArticlesByIds, getPersonalizedArticles } from "@/actions/bookmarks";
import { BookmarkButton } from "@/components/public/article/BookmarkButton";
import { toBengaliDigits, formatBengaliDateTime } from "@/lib/bengali-date";
import type { ArticleCard } from "@/types";

const ALL_AVAILABLE_CATEGORIES = [
  { slug: "national", name: "জাতীয়", icon: "🏛️" },
  { slug: "politics", name: "রাজনীতি", icon: "🗳️" },
  { slug: "international", name: "আন্তর্জাতিক", icon: "🌐" },
  { slug: "economy", name: "অর্থনীতি", icon: "📈" },
  { slug: "sports", name: "খেলাধুলা", icon: "⚽" },
  { slug: "entertainment", name: "বিনোদন", icon: "🎬" },
  { slug: "technology", name: "প্রযুক্তি", icon: "💻" },
  { slug: "lifestyle", name: "জীবনযাপন", icon: "🌿" },
  { slug: "education", name: "শিক্ষা", icon: "🎓" },
  { slug: "opinion", name: "মতামত", icon: "✍️" },
];

interface BookmarksListClientProps {
  initialRecommendations: ArticleCard[];
}

export function BookmarksListClient({ initialRecommendations }: BookmarksListClientProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookmarks" | "preferences">("bookmarks");
  const [savedItems, setSavedItems] = useState<StoredBookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedPrefCategories, setSelectedPrefCategories] = useState<string[]>([
    "national",
    "politics",
    "economy",
    "sports",
  ]);
  const [recommendedArticles, setRecommendedArticles] = useState<ArticleCard[]>(initialRecommendations);
  const [isPendingRecs, startTransition] = useTransition();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync on mount
  useEffect(() => {
    setMounted(true);
    const bookmarks = getStoredBookmarks();
    setSavedItems(bookmarks);

    const savedPrefs = getFavoriteCategories();
    if (savedPrefs.length > 0) {
      setSelectedPrefCategories(savedPrefs);
    }

    // Check URL hash for direct tab navigation
    if (typeof window !== "undefined" && window.location.hash === "#preferences") {
      setActiveTab("preferences");
    }

    const handleBookmarksChange = () => {
      setSavedItems(getStoredBookmarks());
    };

    window.addEventListener("barta:bookmarks_changed", handleBookmarksChange);
    return () => window.removeEventListener("barta:bookmarks_changed", handleBookmarksChange);
  }, []);

  // Fetch updated recommendations when preferred categories change
  const handleTogglePrefCategory = (slug: string) => {
    let updated: string[];
    if (selectedPrefCategories.includes(slug)) {
      if (selectedPrefCategories.length === 1) {
        showToast("কমপক্ষে একটি ক্যাটাগরি নির্বাচিত রাখতে হবে");
        return;
      }
      updated = selectedPrefCategories.filter((c) => c !== slug);
    } else {
      updated = [...selectedPrefCategories, slug];
    }

    setSelectedPrefCategories(updated);
    setFavoriteCategories(updated);

    showToast("পছন্দের ক্যাটাগরি আপডেট করা হয়েছে");

    startTransition(async () => {
      const recs = await getPersonalizedArticles(updated, 8);
      setRecommendedArticles(recs);
    });
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleRemoveOne = (id: string, title: string) => {
    removeStoredBookmark(id);
    setSavedItems(getStoredBookmarks());
    showToast(`"${title.slice(0, 20)}..." তালিকা থেকে সরানো হয়েছে`);
  };

  const handleClearAll = () => {
    clearAllStoredBookmarks();
    setSavedItems([]);
    setShowClearConfirm(false);
    showToast("সকল সংরক্ষিত সংবাদ মুছে ফেলা হয়েছে");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Filter saved bookmarks by search and category
  const filteredBookmarks = savedItems.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      (item.categoryName && item.categoryName === selectedCategoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from saved items for filtering
  const availableFilters = Array.from(
    new Set(savedItems.map((item) => item.categoryName).filter(Boolean))
  ) as string[];

  // Estimated reading time (~2 min per news)
  const totalReadMinutes = Math.max(1, savedItems.length * 2);

  if (!mounted) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded mb-4" />
        <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-1.5 print:hidden">
        <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">সংরক্ষিত সংবাদ ও রিডিং লিস্ট</span>
      </nav>

      {/* Main Header Card */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--color-border)] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>ব্যক্তিগত রিডার কর্নার</span>
            </div>
            <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)]">
              সংরক্ষিত সংবাদ ও রিডিং লিস্ট
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl">
              পরে পড়ার জন্য সংরক্ষণ করা সংবাদসমূহের সংগ্রহশালা। অফলাইনে পড়া বা প্রিন্ট করার সুবিধা এবং আপনার পছন্দের বিষয়বস্তু অনুযায়ী সংবাদ সুপারিশ।
            </p>
          </div>

          {/* Quick Stats & Print Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-4 py-2.5 rounded text-center">
              <span className="text-xs text-[var(--color-text-muted)] block">সংরক্ষিত মোট</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {toBengaliDigits(savedItems.length)} টি সংবাদ
              </span>
            </div>
            {savedItems.length > 0 && (
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-4 py-2.5 rounded text-center hidden sm:block">
                <span className="text-xs text-[var(--color-text-muted)] block">পড়ার সময়</span>
                <span className="text-lg font-bold text-[var(--color-text)] flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  ~{toBengaliDigits(totalReadMinutes)} মিনিট
                </span>
              </div>
            )}
            <button
              onClick={handlePrint}
              title="প্রিন্ট বা অফলাইনে সংরক্ষণ করুন"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">প্রিন্ট / অফলাইন</span>
            </button>
            {savedItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                title="সকল সংরক্ষিত সংবাদ মুছে ফেলুন"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border border-red-200 dark:border-red-950/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors print:hidden"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সব মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-6 print:hidden">
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "bookmarks"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>আমার সংরক্ষিত সংবাদ ({toBengaliDigits(savedItems.length)})</span>
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "preferences"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>পছন্দের ক্যাটাগরি ও সুপারিশ ({toBengaliDigits(selectedPrefCategories.length)})</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="bengali-headline text-lg font-bold">সকল সংরক্ষিত সংবাদ মুছবেন?</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
              আপনি নিশ্চিত যে আপনার সংরক্ষিত {toBengaliDigits(savedItems.length)} টি সংবাদের তালিকা সম্পূর্ণরূপে মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                হ্যাঁ, সব মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SAVED BOOKMARKS LIST */}
      {activeTab === "bookmarks" && (
        <div>
          {savedItems.length > 0 && (
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between print:hidden">
              {/* Search Within Bookmarks */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="সংরক্ষিত সংবাদের শিরোনাম বা বিষয় দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    মুছুন
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              {availableFilters.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setSelectedCategoryFilter("all")}
                    className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategoryFilter === "all"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                    }`}
                  >
                    সকল ({toBengaliDigits(savedItems.length)})
                  </button>
                  {availableFilters.map((cat) => {
                    const count = savedItems.filter((i) => i.categoryName === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCategoryFilter === cat
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                        }`}
                      >
                        {cat} ({toBengaliDigits(count)})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Grid / Empty State */}
          {savedItems.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-12 text-center rounded-none my-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="bengali-headline text-xl font-bold text-[var(--color-text)] mb-2">
                আপনার রিডিং লিস্টে এখনও কোনো সংবাদ সংরক্ষণ করা হয়নি
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto mb-6 leading-relaxed">
                যে কোনো সংবাদ পড়ার সময় তার শিরোনামের পাশে থাকা{" "}
                <span className="font-semibold text-[var(--color-primary)]">&quot;সংরক্ষণ করুন&quot;</span>{" "}
                আইকনে ক্লিক করুন। পরবর্তীতে ইন্টারনেট সংযোগ ছাড়াও যেকোনো সময় এখান থেকে পড়তে পারবেন।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <span>আজকের তাজা সংবাদ পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className="inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-2.5 text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>পছন্দের ক্যাটাগরি সেট করুন</span>
                </button>
              </div>

              {/* Recommended Items Preview Below Empty State */}
              <div className="mt-12 text-left border-t border-[var(--color-border)] pt-8">
                <h4 className="bengali-headline font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>আজকের গুরুত্বপূর্ণ খবর থেকে পড়তে পারেন</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedArticles.slice(0, 4).map((art) => (
                    <div
                      key={art.id}
                      className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 group flex flex-col justify-between"
                    >
                      {art.featuredImageUrl && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden mb-2">
                          <Image
                            src={art.featuredImageUrl}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div>
                        {art.category && (
                          <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase">
                            {art.category.name}
                          </span>
                        )}
                        <h5 className="font-bold text-xs leading-snug line-clamp-2 mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                          <Link href={`/news/${art.slug}`}>{art.title}</Link>
                        </h5>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                        <Link
                          href={`/news/${art.slug}`}
                          className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                        >
                          পড়ুন &rarr;
                        </Link>
                        <BookmarkButton
                          articleId={art.id}
                          slug={art.slug}
                          title={art.title}
                          categoryName={art.category?.name}
                          featuredImageUrl={art.featuredImageUrl || undefined}
                          compact
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            /* NO RESULTS MATCH SEARCH FILTER */
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-8 text-center my-6">
              <Search className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[var(--color-text)]">
                &quot;{searchQuery}&quot; দিয়ে সংরক্ষিত কোনো সংবাদ পাওয়া যায়নি।
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryFilter("all");
                }}
                className="mt-3 text-xs text-[var(--color-primary)] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            /* LIST OF SAVED BOOKMARKS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col justify-between group shadow-sm"
                >
                  {/* Article Thumbnail */}
                  {item.featuredImageUrl && (
                    <Link
                      href={`/news/${item.slug}`}
                      className="block relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-secondary)]"
                    >
                      <Image
                        src={item.featuredImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>
                  )}

                  {/* Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-2">
                        {item.categoryName ? (
                          <span className="font-bold text-[var(--color-primary)] uppercase tracking-wider">
                            {item.categoryName}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">সংবাদ</span>
                        )}
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          {formatBengaliDateTime(new Date(item.savedAt))}
                        </span>
                      </div>

                      <h3 className="bengali-serif-headline text-base sm:text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug line-clamp-3 mb-3">
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      </h3>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="border-t border-[var(--color-border)] pt-3 mt-3 flex items-center justify-between">
                      <Link
                        href={`/news/${item.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
                      >
                        <span>সম্পূর্ণ সংবাদ পড়ুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleRemoveOne(item.id, item.title)}
                        title="রিডিং লিস্ট থেকে সরান"
                        className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">পড়েছি / মুছুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAVORITE CATEGORIES & RECOMMENDATIONS */}
      {activeTab === "preferences" && (
        <div className="space-y-8">
          {/* Category Preference Selector Box */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-primary)]">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)]">
                আপনার পছন্দের বিভাগ নির্বাচন করুন
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mb-6 max-w-2xl">
              আপনার নির্বাচিত বিষয় ও বিভাগের ভিত্তিতে হোমপেজ ও রিডার প্যানেলে প্রাসঙ্গিক সংবাদ সুপারিশ করা হবে। এক বা একাধিক বিভাগ বেছে নিন:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ALL_AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = selectedPrefCategories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleTogglePrefCategory(cat.slug)}
                    className={`flex items-center justify-between p-3 border text-left transition-all ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-red-50/50 dark:bg-red-950/20 text-[var(--color-text)] shadow-xs"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-bold truncate">{cat.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>
                বর্তমানে নির্বাচিত: <strong className="text-[var(--color-text)]">{toBengaliDigits(selectedPrefCategories.length)}</strong> টি বিভাগ
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                পছন্দসমূহ স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে
              </span>
            </div>
          </div>

          {/* Recommended Feed Based On Preferred Categories */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B8860B]" />
                <h3 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  আপনার পছন্দের ভিত্তিতে সুপারিশকৃত তাজা খবর
                </h3>
              </div>
              {isPendingRecs && (
                <span className="text-xs text-[var(--color-text-muted)] animate-pulse">
                  সংবাদ আপডেট হচ্ছে...
                </span>
              )}
            </div>

            {recommendedArticles.length === 0 ? (
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                নির্বাচিত বিভাগসমূহে এই মুহূর্তে কোনো সংবাদ পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col justify-between group shadow-xs"
                  >
                    {art.featuredImageUrl && (
                      <Link
                        href={`/news/${art.slug}`}
                        className="block relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-secondary)]"
                      >
                        <Image
                          src={art.featuredImageUrl}
                          alt={art.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </Link>
                    )}

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {art.category && (
                          <Link
                            href={`/category/${art.category.slug}`}
                            className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider hover:underline"
                          >
                            {art.category.name}
                          </Link>
                        )}
                        <h4 className="bengali-serif-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug line-clamp-2 mt-1 mb-2">
                          <Link href={`/news/${art.slug}`}>{art.title}</Link>
                        </h4>
                        {art.excerpt && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-2.5 mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {art.publishedAt ? formatBengaliDateTime(new Date(art.publishedAt)) : ""}
                        </span>
                        <BookmarkButton
                          articleId={art.id}
                          slug={art.slug}
                          title={art.title}
                          categoryName={art.category?.name}
                          featuredImageUrl={art.featuredImageUrl || undefined}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
