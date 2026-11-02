"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, CloudSun, Clock, ChevronRight, Compass } from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";

interface WeatherPrayerTickerPillProps {
  initialTemp?: string;
  initialCondition?: string;
  initialActivePrayer?: string;
  initialNextPrayer?: string;
  initialCountdown?: string;
}

export function WeatherPrayerTickerPill({
  initialTemp = "৩১",
  initialActivePrayer = "জোহর",
  initialNextPrayer = "আসর",
  initialCountdown = "",
}: WeatherPrayerTickerPillProps) {
  const [data, setData] = useState({
    temp: initialTemp,
    activePrayer: initialActivePrayer,
    nextPrayer: initialNextPrayer,
    countdown: initialCountdown,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const res = await fetch("/api/weather-prayer?division=dhaka");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setData({
            temp: json.data.weather?.temperatureBn || "৩১",
            activePrayer: json.data.prayer?.activePrayerName || "জোহর",
            nextPrayer: json.data.prayer?.nextPrayerName || "আসর",
            countdown: json.data.prayer?.nextPrayerCountdown || "",
          });
        }
      } catch {
        // keep current
      }
    }

    loadLiveData();
    const interval = setInterval(loadLiveData, 60000); // refresh every 1 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/weather-prayer"
      className="hidden md:inline-flex items-center gap-2 px-2 py-0.5 rounded text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group shrink-0"
      title="আবহাওয়া ও নামাজের পূর্ণাঙ্গ সময়সূচি"
    >
      <div className="flex items-center gap-1 text-[var(--color-text)]">
        <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span className="font-bold">ঢাকা {data.temp}° সে.</span>
      </div>

      <span className="text-[var(--color-border-strong)]">|</span>

      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        <Clock className="w-3 h-3 text-[var(--color-primary)]" />
        <span>ওয়াক্ত: <strong className="text-[var(--color-text)]">{data.activePrayer}</strong></span>
        {data.countdown && (
          <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium px-1 rounded">
            পরবর্তী {data.nextPrayer}: {data.countdown}
          </span>
        )}
      </div>
    </Link>
  );
}
