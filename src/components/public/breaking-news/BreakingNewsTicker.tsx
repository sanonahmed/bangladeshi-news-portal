"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Pause, Play, ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";
import type { BreakingNewsItem } from "@/types";

interface BreakingNewsTickerProps {
  items: BreakingNewsItem[];
}

export function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Check if dismissed in current session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("dismissed_breaking_ticker");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!items || items.length === 0 || isDismissed) return null;

  // Double items for seamless infinite marquee loop
  const repeatedItems = [...items, ...items];

  function handleDismiss() {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismissed_breaking_ticker", "true");
    }
  }

  return (
    <div
      className="bg-[#C8102E] text-white border-b border-red-900 shadow-inner select-none relative z-30 transition-all duration-300"
      aria-label="জরুরি সংবাদ টিকার"
      role="region"
      aria-live="polite"
    >
      <div className="max-w-[1400px] mx-auto flex items-center h-10 px-2 sm:px-4">
        {/* Urgent Badge */}
        <Link
          href="/breaking"
          className="flex-shrink-0 bg-black/30 hover:bg-black/40 px-3 py-1.5 font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap flex items-center gap-1.5 rounded transition-colors"
          title="ব্রেকিং নিউজ আর্কাইভ দেখুন"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
          </span>
          <Zap size={14} className="fill-yellow-300 text-yellow-300 translate-y-[0.5px]" />
          <span className="bengali-headline uppercase">ব্রেকিং নিউজ</span>
        </Link>

        {/* Scrolling Ticker Strip */}
        <div
          className="flex-1 overflow-hidden relative h-10 flex items-center mx-2 sm:mx-4 cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={tickerRef}
            className="flex items-center gap-6 whitespace-nowrap will-change-transform"
            style={{
              animation: `ticker-scroll ${Math.max(25, items.length * 9)}s linear infinite`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {repeatedItems.map((item, idx) => (
              <span key={`${item.id}-${idx}`} className="flex items-center gap-3">
                <span className="text-yellow-300/80 text-xs font-black select-none" aria-hidden="true">
                  ◆
                </span>
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1 text-white tracking-wide leading-tight"
                  >
                    <span>{item.headline}</span>
                    <ExternalLink size={11} className="text-white/70" />
                  </a>
                ) : (
                  <Link
                    href={item.url}
                    className="text-xs sm:text-sm font-semibold hover:underline text-white tracking-wide leading-tight"
                  >
                    {item.headline}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Ticker Controls (Pause/Play, Archive & Dismiss) */}
        <div className="flex-shrink-0 flex items-center gap-1 pl-1 border-l border-white/20">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 hover:bg-black/25 text-white/90 hover:text-white rounded transition-colors cursor-pointer"
            title={isPaused ? "স্ক্রলিং শুরু করুন" : "স্ক্রলিং থামান"}
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={13} className="fill-white" /> : <Pause size={13} className="fill-white" />}
          </button>

          <Link
            href="/breaking"
            className="hidden sm:inline-block px-2 py-1 text-[11px] font-bold text-white/90 hover:text-white hover:bg-black/25 rounded transition-colors"
            title="সব ব্রেকিং নিউজ তালিকা"
          >
            আর্কাইভ
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 hover:bg-black/25 text-white/80 hover:text-white rounded transition-colors cursor-pointer"
            title="টিকার বার বন্ধ করুন"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
