"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, CloudSun, Clock, ChevronRight, Compass } from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";

interface WeatherPrayerTickerPillProps {
  initialTemp?: string;
  initialCondition?: string;
  initialNextPrayer?: string;
  initialCountdown?: string;
}

export function WeatherPrayerTickerPill({
  initialTemp = "৩০",
  initialCondition = "পরিষ্কার আকাশ",
  initialNextPrayer = "ফজর",
  initialCountdown = "বাকি",
}: WeatherPrayerTickerPillProps) {
  const [data, setData] = useState({
    temp: initialTemp,
    condition: initialCondition,
    nextPrayer: initialNextPrayer,
    countdown: initialCountdown,
  });

  return (
    <Link
      href="/weather-prayer"
      className="hidden md:inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group shrink-0"
      title="আবহাওয়া ও নামাজের পূর্ণাঙ্গ সময়সূচি"
    >
      <div className="flex items-center gap-1 text-[var(--color-text)]">
        <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span className="font-bold">ঢাকা {data.temp}° সে.</span>
      </div>

      <span className="text-[var(--color-border-strong)]">|</span>

      <div className="flex items-center gap-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        <Clock className="w-3 h-3 text-[var(--color-primary)]" />
        <span>পরবর্তী ওয়াক্ত: <strong className="text-[var(--color-text)]">{data.nextPrayer}</strong></span>
      </div>
    </Link>
  );
}
