"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Clock,
  Compass,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  DIVISIONS_GEO,
  type DivisionWeatherPrayerResult,
  type PrayerItem,
  type DayForecast,
} from "@/lib/weather-prayer";
import { getDivisionWeatherPrayer } from "@/actions/weather-prayer";

interface WeatherPrayerWidgetProps {
  initialData: DivisionWeatherPrayerResult;
}

export function WeatherPrayerWidget({ initialData }: WeatherPrayerWidgetProps) {
  const [data, setData] = useState<DivisionWeatherPrayerResult>(initialData);
  const [selectedDivisionKey, setSelectedDivisionKey] = useState<string>(initialData.division.key);
  const [isPending, startTransition] = useTransition();

  const handleSelectDivision = (key: string) => {
    setSelectedDivisionKey(key);
    startTransition(async () => {
      const res = await getDivisionWeatherPrayer(key);
      setData(res);
    });
  };

  const renderWeatherIcon = (iconName: string, size = "w-6 h-6", color = "text-amber-500") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${size} ${color}`} />;
      case "cloud-sun":
        return <CloudSun className={`${size} text-amber-500`} />;
      case "cloud":
        return <Cloud className={`${size} text-blue-400`} />;
      case "cloud-drizzle":
        return <CloudDrizzle className={`${size} text-blue-400`} />;
      case "cloud-rain":
        return <CloudRain className={`${size} text-blue-500`} />;
      case "cloud-lightning":
        return <CloudLightning className={`${size} text-purple-500`} />;
      default:
        return <Sun className={`${size} ${color}`} />;
    }
  };

  return (
    <section className="my-8 border-t-2 border-[var(--color-primary)] pt-4 bg-[var(--color-bg)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
            <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)]">
              আবহাওয়া ও নামাজের সময়সূচি
            </h2>
            <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] font-bold px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
              দৈনিক উইজেট
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            বিভাগভিত্তিক রিয়েল-টাইম তাপমাত্রা, ৫ দিনের পূর্বাভাস ও নামাজের ইসলামিক সময়সূচি
          </p>
        </div>

        <Link
          href="/weather-prayer"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>পূর্ণাঙ্গ ক্যালেন্ডার ও পূর্বাভাস</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Division Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4 border-b border-[var(--color-border)]">
        {DIVISIONS_GEO.map((div) => {
          const isSelected = div.key === selectedDivisionKey;
          return (
            <button
              key={div.key}
              onClick={() => handleSelectDivision(div.key)}
              className={`px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                isSelected
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
              }`}
            >
              <span>{div.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container: Weather & Prayer Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 relative transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/40 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] px-4 py-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping"></span>
              <span className="text-xs font-semibold text-[var(--color-text)]">তথ্য আপডেট হচ্ছে...</span>
            </div>
          </div>
        )}

        {/* Left Column (Weather): 6 Cols */}
        <div className="lg:col-span-6 border border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div>
            {/* Weather Top Row */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-bold text-sm text-[var(--color-text)]">
                  {data.division.name} বিভাগ
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ({data.weather.conditionBn})
                </span>
              </div>
              <span className="text-[10px] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)] font-mono">
                রিয়েল-টাইম স্যাটেলাইট
              </span>
            </div>

            {/* Big Temp & Current Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  {renderWeatherIcon(data.weather.conditionIcon, "w-10 h-10", "text-amber-500")}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="bengali-headline text-4xl sm:text-5xl font-black text-[var(--color-text)]">
                      {data.weather.temperatureBn}
                    </span>
                    <span className="text-xl font-bold text-[var(--color-text-muted)]">°সে.</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    অনুভূত: <strong className="text-[var(--color-text)]">{data.weather.feelsLikeBn}° সে.</strong>
                  </div>
                </div>
              </div>

              {/* Weather Mini Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--color-bg-secondary)] p-3 border border-[var(--color-border)]">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>আর্দ্রতা: <strong className="text-[var(--color-text)]">{data.weather.humidityBn}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>বাতাস: <strong className="text-[var(--color-text)]">{data.weather.windSpeedBn} কিমি</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Sunrise className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>সূর্যোদয়: <strong className="text-[var(--color-text)]">{data.weather.sunrise}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Sunset className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>সূর্যাস্ত: <strong className="text-[var(--color-text)]">{data.weather.sunset}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Strip */}
          <div className="pt-3 border-t border-[var(--color-border)]">
            <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>পরবর্তী ৫ দিনের পূর্বাভাস</span>
              <Calendar className="w-3 h-3 text-[var(--color-primary)]" />
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {data.forecast.map((day, idx) => (
                <div
                  key={day.date + idx}
                  className="p-2 text-center border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="text-[11px] font-bold text-[var(--color-text)] truncate">{day.dayBn}</div>
                  <div className="my-1 flex justify-center">
                    {renderWeatherIcon(day.conditionIcon, "w-4 h-4")}
                  </div>
                  <div className="text-[11px] font-bold text-[var(--color-text)]">
                    {day.tempMaxBn}°
                  </div>
                  <div className="text-[9px] text-[var(--color-text-muted)]">
                    {day.tempMinBn}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Islamic Prayer Times): 6 Cols */}
        <div className="lg:col-span-6 border border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div>
            {/* Top Prayer Status Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="font-bold text-sm text-[var(--color-text)]">
                  নামাজের সময়সূচি
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ({data.division.name} ও পার্শ্ববর্তী এলাকা)
                </span>
              </div>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                ইসলামিক ফাউন্ডেশন
              </span>
            </div>

            {/* Active & Next Prayer Highlight Banner */}
            <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black text-white p-4 mb-4 border-l-4 border-[var(--color-primary)] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-red-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>চলমান ওয়াক্ত: {data.prayer.activePrayerName}</span>
                  </div>
                  <div className="text-lg md:text-xl font-bold bengali-headline mt-1">
                    পরবর্তী ওয়াক্ত: {data.prayer.nextPrayerName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">বাকি সময়</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                    {data.prayer.nextPrayerCountdown}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Daily Prayers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {data.prayer.items.map((item) => {
                const isActive = item.isActive;
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 border transition-all text-center ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.name}</div>
                    <div className="text-sm font-bold font-mono mt-0.5">
                      {item.timeBn}
                    </div>
                    <div className={`text-[10px] ${isActive ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                      {item.periodBn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sehri & Iftar Bottom Bar */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs bg-[var(--color-bg-secondary)] p-2.5 border">
            <div className="flex items-center gap-1.5 text-[var(--color-text)]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>সেহরি শেষ: <strong className="font-mono text-[var(--color-primary)]">{data.prayer.sehriEnd}</strong></span>
            </div>
            <div className="text-[var(--color-border-strong)]">|</div>
            <div className="flex items-center gap-1.5 text-[var(--color-text)]">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>ইফতার: <strong className="font-mono text-[var(--color-primary)]">{data.prayer.iftar}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
