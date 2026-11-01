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
        className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] flex items-center gap-1"
      >
        <Bookmark className="w-3 h-3" />
        <span>সংরক্ষিত</span>
      </Link>
    );
  }

  return (
    <Link
      href="/bookmarks"
      className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] flex items-center gap-1"
      title="আমার সংরক্ষিত সংবাদ ও রিডিং লিস্ট"
    >
      <Bookmark className={`w-3 h-3 ${count > 0 ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""}`} />
      <span>সংরক্ষিত</span>
      {count > 0 && (
        <span className="bg-[var(--color-primary)] text-white text-[9px] font-mono px-1 rounded-full font-bold">
          {toBengaliDigits(count)}
        </span>
      )}
    </Link>
  );
}
