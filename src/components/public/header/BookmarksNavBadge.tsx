"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getStoredBookmarks } from "@/lib/bookmarks-store";
import { toBengaliDigits } from "@/lib/bengali-date";

export function BookmarksNavBadge() {
  const [count, setCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCount(getStoredBookmarks().length);

    const handleUpdate = (e: any) => {
      if (e?.detail?.count !== undefined) {
        setCount(e.detail.count);
      } else {
        setCount(getStoredBookmarks().length);
      }
    };

    window.addEventListener("barta:bookmarks_changed", handleUpdate);
    return () => window.removeEventListener("barta:bookmarks_changed", handleUpdate);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/bookmarks"
        className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] flex items-center gap-1 p-1"
        aria-label="সংরক্ষিত সংবাদ"
      >
        <Bookmark size={14} />
        <span className="hidden sm:inline">সংরক্ষিত</span>
      </Link>
    );
  }

  return (
    <Link
      href="/bookmarks"
      className="relative hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] flex items-center gap-1 p-1"
      title="আমার সংরক্ষিত সংবাদ ও রিডিং লিস্ট"
      aria-label="সংরক্ষিত সংবাদ"
    >
      <Bookmark size={14} className={count > 0 ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""} />
      <span className="hidden sm:inline">সংরক্ষিত</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white shadow-xs">
          {toBengaliDigits(count)}
        </span>
      )}
    </Link>
  );
}
