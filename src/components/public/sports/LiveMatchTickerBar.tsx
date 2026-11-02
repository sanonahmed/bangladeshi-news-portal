"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Radio, ChevronLeft, ArrowRight, X } from "lucide-react";
import { INITIAL_MATCHES, type LiveMatch } from "@/lib/sports-data";

export function LiveMatchTickerBar() {
  const [matches, setMatches] = useState<LiveMatch[]>(INITIAL_MATCHES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch real live sports matches from our live API
    fetch("/api/live-score")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
        }
      })
      .catch(() => {});

    // Periodic refresh every 30 seconds
    const fetchInterval = setInterval(() => {
      fetch("/api/live-score")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setMatches(data);
          }
        })
        .catch(() => {});
    }, 30000);

    // Rotate featured ticker match every 8 seconds
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % matches.length);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(fetchInterval);
    };
  }, [matches.length]);

  if (!mounted || isDismissed || matches.length === 0) return null;

  const currentMatch = matches[activeIndex] || matches[0]!;

  return (
    <div className="bg-[#0f1115] text-white border-b border-zinc-800 text-xs py-1.5 px-3 select-none relative z-30">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/live-score"
            className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-2 py-0.5 font-bold uppercase tracking-wider text-[10px]"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>লাইভ স্কোর</span>
          </Link>
        </div>

        {/* Center: Live Match Information */}
        <div className="flex-1 overflow-hidden flex items-center justify-center sm:justify-start">
          <Link
            href={`/live-score/${currentMatch.id}`}
            className="flex items-center gap-3 hover:text-[var(--color-primary)] transition-colors truncate"
          >
            {/* Status Pill */}
            {currentMatch.status === "live" ? (
              <span className="bg-red-600/90 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded font-mono animate-pulse shrink-0">
                🔴 LIVE
              </span>
            ) : currentMatch.status === "upcoming" ? (
              <span className="bg-amber-600/80 text-white font-bold text-[9px] px-1.5 py-0.2 rounded shrink-0">
                আসন্ন
              </span>
            ) : (
              <span className="bg-zinc-700 text-zinc-300 font-bold text-[9px] px-1.5 py-0.2 rounded shrink-0">
                সমাপ্ত
              </span>
            )}

            {/* Teams & Scores */}
            <div className="flex items-center gap-2 font-semibold text-[11px] sm:text-xs truncate">
              <span className="text-zinc-400 hidden md:inline truncate">{currentMatch.tournament}:</span>
              
              <span className="flex items-center gap-1 font-bold">
                <span>{currentMatch.team1.flag}</span>
                <span>{currentMatch.team1.name}</span>
                {currentMatch.team1.score && (
                  <span className="text-amber-400 font-mono font-bold">
                    {currentMatch.team1.score}
                  </span>
                )}
              </span>

              <span className="text-zinc-500 font-mono">vs</span>

              <span className="flex items-center gap-1 font-bold">
                <span>{currentMatch.team2.flag}</span>
                <span>{currentMatch.team2.name}</span>
                {currentMatch.team2.score && (
                  <span className="text-emerald-400 font-mono font-bold">
                    {currentMatch.team2.score}
                  </span>
                )}
              </span>

              {/* Status Note */}
              <span className="text-zinc-400 hidden lg:inline border-l border-zinc-700 pl-2 text-[11px]">
                {currentMatch.statusNote}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Controls & All Scores Link */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              title="পূর্ববর্তী ম্যাচ"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-500 font-mono px-1">
              {activeIndex + 1}/{matches.length}
            </span>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % matches.length)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              title="পরবর্তী ম্যাচ"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href="/live-score"
            className="text-[11px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 ml-1"
          >
            <span>সব স্কোর</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-1 ml-1"
            title="টিকিট বন্ধ করুন"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
