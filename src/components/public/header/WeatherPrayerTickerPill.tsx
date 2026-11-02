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
  initialTemp = "৩১",
  initialCondition = "মেঘলা আকাশ",
  initialNextPrayer = "জোহর",
  initialCountdown = "বাকি",
}: WeatherPrayerTickerPillProps) {
  const [data, setData] = useState({
    temp: initialTemp,
    condition: initialCondition,
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
            condition: json.data.weather?.conditionBn || "সাধারণ",
            nextPrayer: json.data.prayer?.nextPrayerName || "জোহর",
            countdown: json.data.prayer?.nextPrayerCountdown || "",
          });
        }
      } catch {
        // keep current
      }
    }

    loadLiveData();
    const interval = setInterval(loadLiveData, 300000); // refresh every 5 mins
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
