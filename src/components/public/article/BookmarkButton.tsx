"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Check } from "lucide-react";
import { isArticleBookmarked, toggleStoredBookmark } from "@/lib/bookmarks-store";
import { toggleArticleBookmark } from "@/actions/bookmarks";

interface BookmarkButtonProps {
  articleId: string;
  slug: string;
  title: string;
  categoryName?: string;
  featuredImageUrl?: string;
  compact?: boolean;
}

export function BookmarkButton({
  articleId,
  slug,
  title,
  categoryName,
  featuredImageUrl,
  compact = false,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setBookmarked(isArticleBookmarked(articleId));

    const handleUpdate = () => {
      setBookmarked(isArticleBookmarked(articleId));
    };

    window.addEventListener("barta:bookmarks_changed", handleUpdate);
    return () => window.removeEventListener("barta:bookmarks_changed", handleUpdate);
  }, [articleId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isNowSaved = toggleStoredBookmark({
      id: articleId,
      slug,
      title,
      categoryName,
      featuredImageUrl,
    });

    setBookmarked(isNowSaved);
    setToastMessage(
      isNowSaved
        ? "সংবাদটি আপনার রিডিং লিস্টে সংরক্ষিত হয়েছে!"
        : "সংরক্ষণ তালিকা থেকে সরানো হয়েছে।"
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 2800);

    // Sync with DB in background (non-blocking)
    toggleArticleBookmark(articleId).catch(() => {});
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleToggle}
          title={bookmarked ? "সংরক্ষিত থেকে সরান" : "পরে পড়ার জন্য সংরক্ষণ করুন"}
          className={`p-1.5 rounded transition-all ${
            bookmarked
              ? "text-[var(--color-primary)] bg-red-50 dark:bg-red-950/40"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]"
          }`}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4 fill-[var(--color-primary)] text-[var(--color-primary)]" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>

        {toastMessage && (
          <div className="absolute right-0 bottom-full mb-1 z-50 bg-black text-white text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in pointer-events-none">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all ${
          bookmarked
            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
            : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        }`}
        title={bookmarked ? "সংরক্ষিত থেকে সরান" : "পরে পড়ার জন্য সংরক্ষণ করুন"}
      >
        {bookmarked ? (
          <>
            <BookmarkCheck className="w-3.5 h-3.5 fill-white text-white" />
            <span>সংরক্ষিত</span>
          </>
        ) : (
          <>
            <Bookmark className="w-3.5 h-3.5" />
            <span>সংরক্ষণ করুন</span>
          </>
        )}
      </button>

      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
