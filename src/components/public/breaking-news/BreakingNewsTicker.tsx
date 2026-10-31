"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { BreakingNewsItem } from "@/types";

interface BreakingNewsTickerProps {
  items: BreakingNewsItem[];
}

export function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  // Double the items for a seamless loop
  const repeatedItems = [...items, ...items];

  return (
    <div
      className="bg-[var(--color-breaking-bg)] text-[var(--color-breaking-text)] overflow-hidden"
      aria-label="ব্রেকিং নিউজ"
      role="region"
      aria-live="polite"
    >
      <div className="max-w-[1400px] mx-auto flex items-center">
        {/* Static label */}
        <div className="flex-shrink-0 bg-black/20 px-3 py-2 font-bold text-sm whitespace-nowrap flex items-center gap-2 select-none">
          <span
            className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"
            aria-hidden="true"
          />
          ব্রেকিং নিউজ
        </div>

        {/* Scrolling ticker strip */}
        <div
          className="flex-1 overflow-hidden relative h-9 flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            ref={tickerRef}
            className="flex items-center gap-8 whitespace-nowrap"
            style={{
              animation: "ticker-scroll 30s linear infinite",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {repeatedItems.map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                className="flex items-center gap-2"
              >
                <span className="text-white/50 mx-2" aria-hidden="true">
                  ◆
                </span>
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline focus:underline focus:outline-none"
                  >
                    {item.headline}
                  </a>
                ) : (
                  <Link
                    href={item.url}
                    className="text-sm hover:underline focus:underline focus:outline-none"
                  >
                    {item.headline}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
